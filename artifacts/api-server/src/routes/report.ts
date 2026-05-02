import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";

const router = Router();

const OPENROUTER_BASE =
  process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const AI_MODEL = "google/gemini-2.5-flash";
const TIMEOUT_MS = 90_000;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const REPORT_PROMPT = `Tu es Édouard, consultant senior en faisabilité et rentabilité de projets entrepreneuriaux.
Génère une synthèse PDF professionnelle et percutante de l'analyse business qui suit.

STRUCTURE OBLIGATOIRE (respecte-la à la lettre) :

## Produit & Modèle
**Idée :** [1 phrase]
**Modèle de revenus :** [ex: SaaS, commission, vente directe…]
**Prix / offre :** [ce qui a été discuté, sinon "Non abordé dans l'analyse"]

## Cibles & Marché
**Cible principale :** [profil précis]
**Taille du marché :** [chiffres si évoqués, sinon estimation honnête]
**Concurrence :** [acteurs identifiés ou "Non abordé dans l'analyse"]

## Acquisition Client
**Canaux identifiés :** [liste]
**Stratégie recommandée :** [1-2 phrases directes]
**Risque acquisition :** [faible / moyen / élevé + raison courte]

## Chiffres Clés
**Investissement initial estimé :** [si abordé, sinon "Non abordé dans l'analyse"]
**Seuil de rentabilité :** [si abordé, sinon "Non abordé dans l'analyse"]
**Marge brute estimée :** [si abordée, sinon "Non abordé dans l'analyse"]

## Indice de Faisabilité-Rentabilité

%%INDICE%%[emoji]|Faisabilité technique|[justification courte, 1 phrase]
%%INDICE%%[emoji]|Potentiel de marché|[justification courte, 1 phrase]
%%INDICE%%[emoji]|Rentabilité|[justification courte, 1 phrase]
%%INDICE%%[emoji]|Acquisition client|[justification courte, 1 phrase]
%%INDICE%%[emoji]|Risque global|[justification courte, 1 phrase]
%%VERDICT%%[emoji]|VERDICT GLOBAL|[2-3 phrases de verdict direct et franc sur la viabilité du projet]

Légende emojis : 🟢 Très favorable · 🔵 Favorable avec ajustements · 🟡 Incertain · 🟠 Difficile · 🔴 Très risqué · 🟣 Rédhibitoire
Remplace [emoji] par le bon emoji de la légende. Pour "Risque global" : 🟢 = peu de risque, 🟣 = risque extrême.
IMPORTANT : garde exactement le format %%INDICE%% et %%VERDICT%% avec les pipes |, sans espaces autour.

## Dernier Conseil
[2-3 phrases directes, sans fioriture. Le conseil le plus important à retenir.]

---

RÈGLES ABSOLUES :
- Sois concis, 1-2 pages max — pas d'introduction, pas de conclusion molle
- N'invente rien. Si un point n'a pas été abordé dans la conversation, écris exactement : "Non abordé dans l'analyse"
- Pas de blabla, uniquement les faits de la conversation
- Respecte la structure ci-dessus à la lettre (titres ##, labels **gras :**, format %%INDICE%%)
- Ne génère PAS de titre # en haut — commence directement par ## Produit & Modèle`;

// POST /api/report/generate
router.post("/generate", async (req: Request, res: Response): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Authentification requise" });
    return;
  }

  const body = req.body as { messages?: ChatMessage[]; projectName?: string };
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  const apiKey =
    process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "AI service not configured" });
    return;
  }

  const projectName = (body.projectName ?? "Analyse").trim();

  const conversationText = body.messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "Utilisateur" : "Édouard"}: ${m.content}`)
    .join("\n\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://edouard-consultant.ch",
        "X-Title": "Edouard - Synthese PDF",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 4096,
        messages: [
          { role: "system", content: REPORT_PROMPT },
          {
            role: "user",
            content: `Voici la conversation à synthétiser pour le projet "${projectName}" :\n\n${conversationText}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error("[report] OpenRouter error", response.status, errText);
      res.status(502).json({ error: "Erreur IA — réessaie dans quelques secondes" });
      return;
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const report = data.choices?.[0]?.message?.content ?? "";
    res.json({ report });
  } catch (err) {
    clearTimeout(timeout);
    if ((err as Error).name === "AbortError") {
      res.status(504).json({ error: "Délai dépassé lors de la génération" });
    } else {
      console.error("[report] error", err);
      res.status(500).json({ error: "Erreur lors de la génération" });
    }
  }
});

// POST /api/report/step
router.post("/step", async (req: Request, res: Response): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Authentification requise" });
    return;
  }

  const body = req.body as { messages?: ChatMessage[]; projectName?: string; stepLabel?: string };
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  const apiKey =
    process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "AI service not configured" });
    return;
  }

  const projectName = (body.projectName ?? "Analyse").trim();
  const stepLabel = (body.stepLabel ?? "Étape").trim();

  const conversationText = body.messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "Utilisateur" : "Édouard"}: ${m.content}`)
    .join("\n\n");

  const stepPrompt = `Tu es Édouard, consultant senior en faisabilité et rentabilité de projets entrepreneuriaux.
Génère une fiche synthèse concise pour l'étape "${stepLabel}" du projet "${projectName}".

STRUCTURE OBLIGATOIRE (respecte-la à la lettre) :

# ${projectName} — Fiche ${stepLabel}

## Points Clés
[3 à 5 bullets des éléments essentiels discutés pour cette étape.]

## Diagnostic Édouard
[2-3 phrases d'évaluation directe et honnête de cette dimension du projet.]

## Actions Recommandées
[2-3 actions concrètes prioritaires pour cette étape.]

## Verdict
**${stepLabel} :** [pastille emoji + 1 phrase de justification courte]

Légende pastilles : 🟢 Très favorable · 🔵 Favorable avec ajustements · 🟡 Incertain · 🟠 Difficile · 🔴 Très risqué

RÈGLES ABSOLUES :
- 1 page max, pas d'introduction ni conclusion molle
- Uniquement les faits de la conversation relatifs à "${stepLabel}"
- Si un point n'a pas été abordé dans la conversation, écris exactement : "Non abordé dans l'analyse"
- Pas de blabla, uniquement les faits`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://edouard-consultant.ch",
        "X-Title": `Edouard - Fiche ${stepLabel}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 2048,
        messages: [
          { role: "system", content: stepPrompt },
          {
            role: "user",
            content: `Voici la conversation à analyser pour la fiche "${stepLabel}" :\n\n${conversationText}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error("[report/step] OpenRouter error", response.status, errText);
      res.status(502).json({ error: "Erreur IA — réessaie dans quelques secondes" });
      return;
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const report = data.choices?.[0]?.message?.content ?? "";
    res.json({ report });
  } catch (err) {
    clearTimeout(timeout);
    if ((err as Error).name === "AbortError") {
      res.status(504).json({ error: "Délai dépassé lors de la génération" });
    } else {
      console.error("[report/step] error", err);
      res.status(500).json({ error: "Erreur lors de la génération" });
    }
  }
});

export default router;
