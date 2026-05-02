import { Router } from "express";
import { Webhook } from "svix";
import { upsertContact } from "../lib/systemeio";

const router = Router();

router.post(
  "/clerk",
  async (req, res) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("[webhook] CLERK_WEBHOOK_SECRET not set — skipping verification");
      res.status(200).json({ ok: true });
      return;
    }

    const svixId        = req.headers["svix-id"] as string;
    const svixTimestamp = req.headers["svix-timestamp"] as string;
    const svixSignature = req.headers["svix-signature"] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      res.status(400).json({ error: "Missing svix headers" });
      return;
    }

    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body);

    let payload: Record<string, unknown>;
    try {
      const wh = new Webhook(secret);
      payload = wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as Record<string, unknown>;
    } catch (err) {
      console.error("[webhook] signature verification failed", err);
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    const event = payload.type as string;
    console.info("[webhook] Clerk event received:", event);

    if (event === "user.created") {
      const data = payload.data as {
        email_addresses?: { email_address: string; primary?: boolean }[];
        first_name?: string;
        last_name?: string;
      };

      const email =
        data.email_addresses?.find((e) => e.primary)?.email_address ??
        data.email_addresses?.[0]?.email_address;

      if (email) {
        await upsertContact({
          email,
          firstName: data.first_name ?? "",
          lastName: data.last_name ?? "",
        });
      }
    }

    res.status(200).json({ ok: true });
  },
);

export default router;
