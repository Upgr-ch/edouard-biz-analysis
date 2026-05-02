import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, conversationsTable, chatMessagesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId;
  next();
};

// GET /api/conversations
router.get("/", requireAuth, async (req: any, res) => {
  try {
    const rows = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.userId, req.userId))
      .orderBy(desc(conversationsTable.updatedAt));
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/conversations
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const { title = "Nouvelle analyse" } = req.body;
    const [row] = await db
      .insert(conversationsTable)
      .values({ userId: req.userId, title })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/conversations/:id
router.patch("/:id", requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { title, currentStep } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (currentStep !== undefined) updates.currentStep = currentStep;

    const [row] = await db
      .update(conversationsTable)
      .set(updates)
      .where(
        and(
          eq(conversationsTable.id, id),
          eq(conversationsTable.userId, req.userId),
        ),
      )
      .returning();

    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/conversations/:id
router.delete("/:id", requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    await db
      .delete(chatMessagesTable)
      .where(eq(chatMessagesTable.conversationId, id));
    await db
      .delete(conversationsTable)
      .where(
        and(
          eq(conversationsTable.id, id),
          eq(conversationsTable.userId, req.userId),
        ),
      );
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/conversations/:id/messages
router.get("/:id/messages", requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const rows = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.conversationId, id))
      .orderBy(chatMessagesTable.createdAt);
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/conversations/:id/messages
router.post("/:id/messages", requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { role, content, createdAt } = req.body;
    const values: any = { conversationId: id, role, content };
    if (createdAt) values.createdAt = new Date(createdAt);
    const [row] = await db
      .insert(chatMessagesTable)
      .values(values)
      .returning();
    // touch updatedAt on conversation
    await db
      .update(conversationsTable)
      .set({ updatedAt: new Date() })
      .where(eq(conversationsTable.id, id));
    res.status(201).json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/conversations/:id/messages/bulk
router.post("/:id/messages/bulk", requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }
    const values = messages.map((m: any) => ({
      conversationId: id,
      role: m.role,
      content: m.content,
      ...(m.createdAt ? { createdAt: new Date(m.createdAt) } : {}),
    }));
    const rows = await db.insert(chatMessagesTable).values(values).returning();
    await db
      .update(conversationsTable)
      .set({ updatedAt: new Date() })
      .where(eq(conversationsTable.id, id));
    res.status(201).json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/conversations/:id/messages/:msgId
router.patch("/:id/messages/:msgId", requireAuth, async (req: any, res) => {
  try {
    const { msgId } = req.params;
    const { content } = req.body;
    const [row] = await db
      .update(chatMessagesTable)
      .set({ content })
      .where(eq(chatMessagesTable.id, msgId))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
