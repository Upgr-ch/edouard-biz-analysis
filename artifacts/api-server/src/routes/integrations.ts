import { Router } from "express";
import { getAuth } from "@clerk/express";
import { upsertContact } from "../lib/systemeio";
import { appendContactRow } from "../lib/googlesheets";

const router = Router();

router.post("/signup", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { email, firstName, lastName, marketingConsent } = req.body as {
    email?: string;
    firstName?: string;
    lastName?: string;
    marketingConsent?: boolean;
  };

  if (!email) {
    res.status(400).json({ error: "email required" });
    return;
  }

  const contact = {
    email,
    firstName,
    lastName,
    marketingConsent: marketingConsent === true,
  };

  console.info("[integrations/signup] syncing contact", email, "| marketing:", marketingConsent === true);

  const [siResult, gsResult] = await Promise.allSettled([
    upsertContact(contact),
    appendContactRow(contact),
  ]);

  if (siResult.status === "rejected") {
    console.error("[integrations/signup] systemeio error", siResult.reason);
  }
  if (gsResult.status === "rejected") {
    console.error("[integrations/signup] googlesheets error", gsResult.reason);
  }

  res.status(200).json({ ok: true });
});

export default router;
