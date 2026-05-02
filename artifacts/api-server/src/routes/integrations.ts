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

  const { email, firstName, lastName } = req.body as {
    email?: string;
    firstName?: string;
    lastName?: string;
  };

  if (!email) {
    res.status(400).json({ error: "email required" });
    return;
  }

  try {
    await Promise.allSettled([
      upsertContact({ email, firstName, lastName }),
      appendContactRow({ email, firstName, lastName }),
    ]);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[integrations/signup]", err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
