import { Router } from "express";

const router = Router();

const OPENROUTER_BASE = process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const AI_MODEL = "openai/gpt-4o-mini";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// POST /api/chat  — works for both anon and authenticated users
router.post("/", async (req: any, res) => {
  try {
    const { messages } = req.body as { messages: ChatMessage[] };
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }

    const systemPrompt: ChatMessage = {
      role: "system",
      content: `Tu es Édouard, consultant en faisabilité et rentabilité de projets business.
Tu t'exprimes de manière ferme, assertive et juste. Ton travail est de dire la vérité business, pas de flatter.
Tu analyses les idées business avec structure et honnêteté, en utilisant des données réelles et vérifiables.
Tu guides l'utilisateur à travers une analyse en plusieurs étapes : profil, idée, marché, faisabilité, rentabilité.
Réponds toujours en français. Sois direct, précis et utile.`,
    };

    const filteredMessages = messages.filter((m) => m.role !== "system");

    const apiKey = process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "AI service not configured" });
    }

    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://upgrade-app.replit.app",
        "X-Title": "UpGrade - Édouard",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [systemPrompt, ...filteredMessages],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      req.log.error({ status: response.status, body: errorText }, "AI API error");
      return res.status(502).json({ error: "AI service error" });
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content ?? "";
    res.json({ content });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
