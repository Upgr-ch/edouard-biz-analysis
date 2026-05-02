import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { isRateLimited } from "../lib/rateLimiter";
import { detectRegion, regionalContext } from "../lib/geoLocate";

const router = Router();

const OPENROUTER_BASE =
  process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL ??
  "https://openrouter.ai/api/v1";

const AI_MODEL        = "google/gemini-2.5-flash-preview";
const MAX_TOKENS      = 8192;
const CONTEXT_MSGS    = 20;   // derniers messages envoyés à Gemini
const TIMEOUT_MS      = 60_000; // 60 secondes

const LIMIT_ANON_DAY  = 10;  // anonyme / IP / jour
const LIMIT_AUTH_DAY  = 60;  // connecté / userId / jour

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{ message: { content: string } }>;
}

type PinoRequest = Request & { log: { error: (o: unknown, msg?: string) => void } };

// POST /api/chat
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const pinoReq = req as PinoRequest;

  try {
    /* ── 1. Auth ─────────────────────────────────────────────────── */
    const { userId } = getAuth(req);
    const isAnon = !userId;

    /* ── 2. IP + rate limiting + géolocalisation ─────────────────── */
    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim() ??
      req.socket.remoteAddress ??
      "unknown";

    if (isAnon) {
      if (isRateLimited(`anon:${ip}`, LIMIT_ANON_DAY)) {
        res.status(429).json({ error: "Limite journalière atteinte. Crée un compte gratuit pour continuer." });
        return;
      }
    } else {
      if (isRateLimited(`auth:${userId}`, LIMIT_AUTH_DAY)) {
        res.status(429).json({ error: "Limite journalière de 60 messages atteinte. Réessaie demain." });
        return;
      }
    }

    // Géolocalisation silencieuse (ne bloque pas si elle échoue)
    const region = await detectRegion(ip);
    const geoCtx = regionalContext(region);

    /* ── 3. Validation body ──────────────────────────────────────── */
    const body = req.body as { messages?: ChatMessage[] };
    if (!body.messages || !Array.isArray(body.messages)) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

    /* ── 4. Contexte : 20 derniers messages ─────────────────────── */
    const filteredMessages = body.messages
      .filter((m) => m.role !== "system")
      .slice(-CONTEXT_MSGS);

    /* ── 5. API key ──────────────────────────────────────────────── */
    const apiKey =
      process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY ??
      process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "AI service not configured" });
      return;
    }

    /* ── 6. System prompt ────────────────────────────────────────── */
    const systemPrompt: ChatMessage = {
      role: "system",
      content: `Tu es Édouard, consultant en faisabilité et rentabilité de projets business.
Tu t'exprimes de manière ferme, assertive et juste. Ton travail est de dire la vérité business, pas de flatter.
Tu analyses les idées business avec structure et honnêteté, en utilisant des données réelles et vérifiables.
Tu guides l'utilisateur à travers une analyse en plusieurs étapes : profil, idée, marché, faisabilité, rentabilité.
Réponds toujours en français. Sois direct, précis et utile.${geoCtx}`,
    };

    /* ── 7. Appel IA avec timeout 60 s ──────────────────────────── */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: globalThis.Response;
    try {
      response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://upgrade-app.replit.app",
          "X-Title": "UpGrade - Édouard",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [systemPrompt, ...filteredMessages],
          max_tokens: MAX_TOKENS,
          temperature: 0.7,
        }),
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        res.status(504).json({ error: "L'IA a mis trop de temps à répondre. Réessaie." });
        return;
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorText = await response.text();
      pinoReq.log.error({ status: response.status, body: errorText }, "AI API error");
      res.status(502).json({ error: "AI service error" });
      return;
    }

    const data = (await response.json()) as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content ?? "";
    res.json({ content });

  } catch (err) {
    pinoReq.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
