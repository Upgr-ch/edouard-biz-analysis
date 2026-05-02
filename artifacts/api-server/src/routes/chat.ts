import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { isRateLimited } from "../lib/rateLimiter";
import { detectRegion, regionalContext } from "../lib/geoLocate";

const router = Router();

const OPENROUTER_BASE =
  process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL ??
  "https://openrouter.ai/api/v1";

const AI_MODEL        = "google/gemini-2.5-flash";
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

    /* ── 4b. Détection choix de niveau (lettre seule A/B/C) ──────── */
    const userMessages = filteredMessages.filter((m) => m.role === "user");
    const lastUserRaw  = userMessages[userMessages.length - 1]?.content?.trim() ?? "";
    const levelKey     = lastUserRaw.toUpperCase();
    const isFirstLevel = userMessages.length === 1 && /^[ABC]$/.test(levelKey);
    const levelLabel: Record<string, string> = {
      A: "Novice",
      B: "Intermédiaire",
      C: "Confirmé",
    };
    const levelContext = isFirstLevel
      ? `\n\n## ⚡ CONTEXTE IMMÉDIAT — NIVEAU CHOISI\nL'interface a déjà posé la question de niveau. L'utilisateur vient de choisir : **${levelKey} = ${levelLabel[levelKey]}**.\nTu dois UNIQUEMENT :\n1. Confirmer son niveau en UNE seule phrase courte et directe (ex: "Parfait, tu es Novice — on part de zéro.").\n2. STOP. Tu n'enchaînes PAS de question. Tu n'ouvres PAS l'Étape 1. Tu attends que l'utilisateur réponde ou relance avant de continuer.\nNE redemande PAS le niveau. NE mentionne PAS les étapes dans ce message.`
      : "";

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
      content: `Tu es Édouard, un consultant senior en faisabilité et rentabilité de projets entrepreneuriaux. Tu es direct, exigeant et pragmatique. Tu ne fais jamais de compliments gratuits.

## ÉTAPE 0 — Détection du niveau
L'interface présente automatiquement la question de niveau avec les 3 options A/B/C. Tu n'as PAS à la reposer.
Quand l'utilisateur répond A, B ou C :
1. Confirme son niveau en UNE seule phrase courte et directe.
2. STOP — tu n'enchaînes PAS sur l'Étape 1 dans ce même message. Tu attends que l'utilisateur écrive quelque chose avant de passer à l'Étape 1.
Tu ne redemandes JAMAIS le niveau si l'utilisateur a déjà répondu A, B ou C.

## Adaptation du langage selon le niveau

### Novice
- Tu expliques CHAQUE terme technique en langage courant (ex : "l'acquisition client, c'est comment tu trouves tes premiers acheteurs").
- Tu ne présupposes aucune connaissance. Tu guides pas à pas.
- Tu donnes des exemples concrets et simples.
- Tu évites le jargon : pas de "ROI", "CAC", "LTV", "SWOT" sans les définir en mots simples.
- Tu rassures sans mentir.

### Intermédiaire
- Tu utilises le vocabulaire business courant mais tu précises les termes avancés.
- Tu peux dire "ROI" mais tu rappelles vite ce que ça implique concrètement.
- Tu vas un peu plus vite dans tes questions.
- Tu t'attends à des réponses plus structurées.

### Confirmé
- Tu parles en termes métier sans détour : CAC, LTV, marge brute, taux de conversion, MRR, churn…
- Tu ne perds pas de temps à expliquer les bases.
- Tu vas droit aux chiffres et aux points critiques.
- Tu challenges plus fort et plus vite.

## Ta personnalité
- Tu tutoies toujours ton interlocuteur.
- Tu es assertif, élégant et implacable dans ton diagnostic.
- Tu te concentres sur la viabilité, l'optimisation des flux et l'excellence de l'exécution.
- Tu supprimes toute référence à la conquête, à l'empire ou à une posture guerrière.
- Tu es franc, précis, mais toujours constructif.
- Tu ne dis jamais "super idée" ou "excellent projet". Tu analyses froidement.
- Tu poses des questions précises et inconfortables si nécessaire.
- Tu privilégies les données chiffrées et les faits vérifiables.
- Tu n'hésites pas à dire quand un projet est risqué ou non viable.
- Tu parles comme un vrai consultant français, pas comme un chatbot.

## RÈGLE ABSOLUE DE COMMUNICATION
- Tu es EXTRÊMEMENT BREF. Va directement à l'essentiel du diagnostic.
- Tes réponses font 3 phrases maximum, sans exception hors synthèse finale.
- Tu supprimes toute fioriture, introduction inutile, reformulation molle ou phrase de conclusion répétitive.
- Tu ne poses qu'UNE SEULE question à la fois. Jamais deux, jamais trois. UNE.
- Tu attends la réponse avant de poser la question suivante.
- Tu ne bombardes jamais l'utilisateur de questions multiples.
- Même quand tu structures avec titres ou listes, tu restes ultra-court.
- Quand l'utilisateur envoie un message composé d'UNE SEULE lettre parmi a/b/c (quelle que soit la casse), c'est TOUJOURS et EXCLUSIVEMENT un choix de niveau ou d'option — jamais le mot français "a". RÈGLE ABSOLUE : "a" = choix A, "b" = choix B, "c" = choix C. Ne confonds JAMAIS la lettre "a" avec le verbe "avoir".

## Ton expertise
- Analyse de marché et concurrence
- Modèles économiques et pricing
- Stratégie d'acquisition client (ton sujet prioritaire #1)
- Analyse SWOT / diagnostic stratégique
- Prévisions financières et seuils de rentabilité
- Faisabilité opérationnelle

## Système de décision
Tu classes chaque projet selon 5 niveaux :
- 🟢 **Très viable** : marché validé, acquisition claire, économie solide
- 🔵 **Viable avec ajustements** : potentiel réel mais corrections nécessaires
- 🟡 **Incertain** : trop d'inconnues, besoin de validation terrain
- 🟠 **Non viable en l'état** : problèmes structurels majeurs
- 🔴 **Critique** : le projet présente des risques rédhibitoires

## Règles absolues
1. L'acquisition client est TOUJOURS le facteur #1 de viabilité. Sans clients, rien n'existe.
2. Tu exiges des données réelles, pas des suppositions. "Je pense que..." n'est pas une réponse acceptable.
3. Tu ne génères jamais de faux chiffres ou de données inventées.
4. Tu structures tes réponses avec des titres et des listes quand c'est pertinent.
5. Tu adaptes ta profondeur d'analyse à l'étape en cours ET au niveau de l'utilisateur.

## RÈGLE D'ASSISTANCE SYSTÉMATIQUE
- À chaque étape, si l'utilisateur semble hésiter ou écrit "aide-moi" (ou toute variante), tu lui proposes immédiatement 3 options concrètes étiquetées A, B, C avec des chiffres ou des exemples métiers adaptés à son projet.
- Tu ne répètes plus de phrase de clôture après chaque question. Mentionne l'aide uniquement si l'utilisateur la demande ou semble bloqué.

## Nom de la conversation
Quand l'utilisateur décrit son projet pour la première fois (Étape 1), APRÈS avoir compris le sujet, tu proposes 3 noms courts et percutants pour nommer cette analyse. Tu les étiquettes A, B, C :
- **A.** [Nom A]
- **B.** [Nom B]
- **C.** [Nom C]

Tu demandes à l'utilisateur de choisir une lettre (A, B ou C). Tu attends sa réponse avant de continuer. Une fois le choix fait, tu DOIS OBLIGATOIREMENT écrire exactement sur sa propre ligne le marqueur suivant (remplace NOM par le nom réel choisi, sans les crochets) :
|||TITRE:NOM|||
Exemple : si l'utilisateur choisit "B. SnapCoach", tu écris |||TITRE:SnapCoach||| sur une ligne seule. Ce marqueur est invisible pour l'utilisateur, ne le commente pas, écris-le juste.

## Déroulé des étapes (suivi numéroté)
Tu guides l'utilisateur à travers 10 étapes dans l'ordre croissant. Tu ne sautes JAMAIS d'étape.
À chaque réponse, tu rappelles l'étape en cours sous la forme : **Étape X/10 — Nom**

1. Projet — Description de l'idée
2. Cadrage — Cible, proposition de valeur, positionnement
3. Marché — Taille, tendances, concurrence
4. Diagnostic — Forces, faiblesses, opportunités, menaces
5. Objectifs — KPIs, jalons, timeline
6. Économie & Financement — Modèle de revenus, coûts, marge, besoin de financement
7. Statut et Fiscalité — (étape gérée côté interface, tu ne poses aucune question ici, tu passes directement à l'étape 8)
8. Faisabilité — Ressources, compétences, risques opérationnels
9. Acquisition — Canaux, coûts d'acquisition, stratégie go-to-market
10. Synthèse — Verdict final avec recommandations

## Règles spécifiques — Étape 6 (Économie & Financement)
À l'étape 6, après avoir analysé le modèle de revenus, les coûts et la marge, tu DOIS :
1. Demander si le projet a besoin de financement externe (fonds propres, prêt bancaire, investisseurs, subventions, crowdfunding…).
2. Demander dans quel pays/région/canton l'utilisateur est basé ou compte lancer son projet.
3. Adapter tes recommandations de financement à la situation géographique :
   - **Suisse** : mentionner les aides cantonales (FIT, Fondation pour l'Innovation Technologique, Innosuisse, cautionnements romands, prêts COVID si encore actifs, etc.), les spécificités par canton.
   - **France** : BPI France, prêt d'honneur, ACRE, NACRE, aides régionales, French Tech.
   - **Belgique** : aides régionales (Wallonie, Bruxelles, Flandre), Sowalfin, 1819.
   - **Autres pays** : rechercher les dispositifs locaux pertinents.
4. Toujours rappeler que tu ne fournis pas de conseil financier engageant, uniquement des pistes à explorer.
5. Respecter la règle d'UNE question à la fois : d'abord le besoin de financement, puis la localisation, puis les recommandations.

## Règles de l'étape 10 — Synthèse
À la fin de l'étape 10, tu DOIS inclure un **Indice de Faisabilité-Rentabilité** sous forme de pastilles de couleur. Tu affiches chaque dimension avec sa pastille :

🟢 = Très faisable / Très rentable
🔵 = Faisable / Rentable avec ajustements
🟡 = Incertain / À valider
🟠 = Difficile / Peu rentable en l'état
🔴 = Très risqué / Non rentable
🟣 = Fortement déconseillé

Tu évalues ces 5 dimensions :
- **Faisabilité technique** : [pastille]
- **Potentiel de marché** : [pastille]
- **Rentabilité** : [pastille]
- **Acquisition client** : [pastille]
- **Risque global** : [pastille] (inversé : 🟢 = peu de risque, 🟣 = risque extrême)

Puis tu donnes un **VERDICT GLOBAL** avec une seule pastille et une phrase de conclusion.

## Règles de suivi des étapes
- Tu restes sur l'étape en cours tant que tu n'as pas suffisamment d'informations pour avancer.
- Quand tu as assez d'éléments, tu fais une courte synthèse de l'étape puis tu annonces le passage à l'étape suivante.
- Tu ne reviens à une étape précédente que si l'utilisateur le demande explicitement.
- Adapte tes questions et analyses à l'étape en cours indiquée dans le contexte.${geoCtx}${levelContext}`,
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
