import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, conversationsTable, chatMessagesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

// ── Typed request helpers ──────────────────────────────────────────────────

interface AuthedRequest extends Request {
  userId: string;
}

type MessageInsert = {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

// ── Middleware ─────────────────────────────────────────────────────────────

function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as AuthedRequest).userId = userId;
  next();
}

/**
 * Verify that the conversation `:id` exists and belongs to the authenticated
 * user. Attaches `req.ownedConversationId` on success; responds 403/404
 * otherwise.
 */
async function requireConversationOwner(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { id } = req.params;
  const userId = (req as AuthedRequest).userId;

  const [conv] = await db
    .select({ id: conversationsTable.id })
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.id, id),
        eq(conversationsTable.userId, userId),
      ),
    );

  if (!conv) {
    // 404 instead of 403 to avoid leaking ID existence
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  next();
}

// ── Conversation CRUD ──────────────────────────────────────────────────────

// GET /api/conversations
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthedRequest;
      const rows = await db
        .select()
        .from(conversationsTable)
        .where(eq(conversationsTable.userId, userId))
        .orderBy(desc(conversationsTable.updatedAt));
      res.json(rows);
    } catch (err) {
      (req as Request & { log: { error: (e: unknown) => void } }).log.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// POST /api/conversations
router.post(
  "/",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthedRequest;
      const title: string =
        typeof req.body?.title === "string"
          ? req.body.title
          : "Nouvelle analyse";
      const [row] = await db
        .insert(conversationsTable)
        .values({ userId, title })
        .returning();
      res.status(201).json(row);
    } catch (err) {
      (req as Request & { log: { error: (e: unknown) => void } }).log.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// PATCH /api/conversations/:id  (ownership checked via PATCH+WHERE userId)
router.patch(
  "/:id",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthedRequest;
      const { id } = req.params;
      const { title, currentStep } = req.body as {
        title?: string;
        currentStep?: number;
      };

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (typeof title === "string") updates.title = title;
      if (typeof currentStep === "number") updates.currentStep = currentStep;

      const [row] = await db
        .update(conversationsTable)
        .set(updates)
        .where(
          and(
            eq(conversationsTable.id, id),
            eq(conversationsTable.userId, userId),
          ),
        )
        .returning();

      if (!row) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(row);
    } catch (err) {
      (req as Request & { log: { error: (e: unknown) => void } }).log.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// DELETE /api/conversations/:id
// Ownership is verified first; only then are messages deleted.
router.delete(
  "/:id",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthedRequest;
      const { id } = req.params;

      // Confirm ownership before touching any rows
      const [owned] = await db
        .select({ id: conversationsTable.id })
        .from(conversationsTable)
        .where(
          and(
            eq(conversationsTable.id, id),
            eq(conversationsTable.userId, userId),
          ),
        );

      if (!owned) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }

      // Safe to delete messages now
      await db
        .delete(chatMessagesTable)
        .where(eq(chatMessagesTable.conversationId, id));
      await db
        .delete(conversationsTable)
        .where(eq(conversationsTable.id, id));

      res.status(204).send();
    } catch (err) {
      (req as Request & { log: { error: (e: unknown) => void } }).log.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// ── Message sub-routes (all guarded by requireConversationOwner) ───────────

// GET /api/conversations/:id/messages
router.get(
  "/:id/messages",
  requireAuth,
  requireConversationOwner,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const rows = await db
        .select()
        .from(chatMessagesTable)
        .where(eq(chatMessagesTable.conversationId, id))
        .orderBy(chatMessagesTable.createdAt);
      res.json(rows);
    } catch (err) {
      (req as Request & { log: { error: (e: unknown) => void } }).log.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// POST /api/conversations/:id/messages
router.post(
  "/:id/messages",
  requireAuth,
  requireConversationOwner,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { role, content, createdAt } = req.body as {
        role: "user" | "assistant";
        content: string;
        createdAt?: string;
      };

      const insertValues: {
        conversationId: string;
        role: "user" | "assistant";
        content: string;
        createdAt?: Date;
      } = { conversationId: id, role, content };
      if (createdAt) insertValues.createdAt = new Date(createdAt);

      const [row] = await db
        .insert(chatMessagesTable)
        .values(insertValues)
        .returning();

      await db
        .update(conversationsTable)
        .set({ updatedAt: new Date() })
        .where(eq(conversationsTable.id, id));

      res.status(201).json(row);
    } catch (err) {
      (req as Request & { log: { error: (e: unknown) => void } }).log.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// POST /api/conversations/:id/messages/bulk
router.post(
  "/:id/messages/bulk",
  requireAuth,
  requireConversationOwner,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { messages } = req.body as { messages: MessageInsert[] };

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "messages array required" });
        return;
      }

      const insertValues = messages.map((m) => ({
        conversationId: id,
        role: m.role,
        content: m.content,
        ...(m.createdAt ? { createdAt: new Date(m.createdAt) } : {}),
      }));

      const rows = await db
        .insert(chatMessagesTable)
        .values(insertValues)
        .returning();

      await db
        .update(conversationsTable)
        .set({ updatedAt: new Date() })
        .where(eq(conversationsTable.id, id));

      res.status(201).json(rows);
    } catch (err) {
      (req as Request & { log: { error: (e: unknown) => void } }).log.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// PATCH /api/conversations/:id/messages/:msgId
// Ownership of the conversation is verified; msgId is then scoped to that conversation.
router.patch(
  "/:id/messages/:msgId",
  requireAuth,
  requireConversationOwner,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, msgId } = req.params;
      const { content } = req.body as { content: string };

      const [row] = await db
        .update(chatMessagesTable)
        .set({ content })
        .where(
          and(
            eq(chatMessagesTable.id, msgId),
            eq(chatMessagesTable.conversationId, id),
          ),
        )
        .returning();

      if (!row) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(row);
    } catch (err) {
      (req as Request & { log: { error: (e: unknown) => void } }).log.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
