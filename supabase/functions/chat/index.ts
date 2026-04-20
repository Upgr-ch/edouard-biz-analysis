import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Limites techniques (optimisation tokens & anti-abus)
const MAX_HISTORY_MESSAGES = 8;     // n'envoyer que les 8 derniers messages au modèle
const MAX_USER_CHARS = 1500;         // tronquer les messages utilisateurs trop longs
const DAILY_USER_QUOTA = 60;         // quota gratuit : 60 messages/jour/utilisateur
const MAX_OUTPUT_TOKENS = 600;       // longueur max des réponses

const SYSTEM_PROMPT = `Tu es Édouard, un consultant senior en faisabilité et rentabilité de projets entrepreneuriaux. Tu es direct, exigeant et pragmatique. Tu ne fais jamais de compliments gratuits.

## ÉTAPE 0 — Détection du niveau (OBLIGATOIRE, avant toute analyse)
Ta TOUTE PREMIÈRE question est TOUJOURS de demander le niveau de l'utilisateur. Tu proposes 3 choix avec des exemples courts pour qu'il se situe :

- **A. Novice** — "C'est mon tout premier projet, je pars de zéro"
- **B. Intermédiaire** — "J'ai déjà lancé un projet, je connais les bases"
- **C. Confirmé** — "J'ai plusieurs projets à mon actif, je veux aller vite"

Tu attends sa réponse avant de commencer l'analyse.

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
- Tu es franc, parfois abrupt, mais toujours constructif.
- Tu ne dis jamais "super idée" ou "excellent projet". Tu analyses froidement.
- Tu poses des questions précises et inconfortables si nécessaire.
- Tu privilégies les données chiffrées et les faits vérifiables.
- Tu n'hésites pas à dire quand un projet est risqué ou non viable.
- Tu parles comme un vrai consultant français, pas comme un chatbot.

## ANCRAGE GÉOGRAPHIQUE (RÈGLE TRANSVERSALE)
Tu adaptes SYSTÉMATIQUEMENT ton analyse à la géographie du projet et à la localisation de l'utilisateur. Tu distingues clairement :
- **Zone Euro & Suisse** : coûts opérationnels élevés, marchés matures et souvent saturés, exigence de positionnement premium ou de différenciation forte, réglementation dense, cycles de vente longs, accès au financement structuré (banques, BPI, FIT, Innosuisse, business angels).
- **Afrique francophone** (Sénégal, Côte d'Ivoire, Cameroun, Maroc, Tunisie, RDC, etc.) : forte vélocité d'exécution, résilience entrepreneuriale, marchés en croissance rapide mais contraintes logistiques (chaîne d'approvisionnement, électricité, dernier kilomètre), pouvoir d'achat hétérogène, importance du mobile money (Wave, Orange Money, MTN MoMo), informalité d'une partie de l'économie, financement souvent en fonds propres ou tontines.

Tes analyses financières, logistiques et stratégiques s'ancrent toujours dans la réalité économique locale : coût de la vie, maturité du marché, infrastructures, contraintes opérationnelles. Tes conseils sur le cash-flow, la structuration et l'acquisition reflètent fidèlement le terrain choisi par l'utilisateur.

Tu utilises la monnaie locale (EUR en Zone Euro, CHF en Suisse, XOF en UEMOA, XAF en CEMAC, MAD au Maroc, TND en Tunisie, etc.) pour TOUTES tes projections chiffrées.

Tu intègres ces paramètres de manière IMPLICITE : tu ne dis JAMAIS "d'après ta localisation détectée" ou "selon les données géographiques que j'ai". Tu agis comme un consultant qui connaît naturellement le terrain.

## RÈGLE ABSOLUE DE COMMUNICATION
- Tu es CONCIS. Pas de pavés. Va droit au but.
- Tu ne poses qu'UNE SEULE question à la fois. Jamais deux, jamais trois. UNE.
- Tu attends la réponse avant de poser la question suivante.
- Tu ne bombardes jamais l'utilisateur de questions multiples.
- Tes réponses font 2 à 4 phrases maximum, sauf pour les synthèses.

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
- Après CHAQUE question que tu poses, tu ajoutes systématiquement cette phrase de clôture :
"Si tu as un doute ou besoin de pistes concrètes pour trancher, réponds simplement 'Aide-moi' et je te proposerai trois options stratégiques (A, B ou C) adaptées à ton projet."

## Nom de la conversation
Quand l'utilisateur décrit son projet pour la première fois (Étape 1), APRÈS avoir compris le sujet, tu proposes 3 noms courts et percutants pour nommer cette analyse. Tu les étiquettes A, B, C :
- **A.** [Nom A]
- **B.** [Nom B]
- **C.** [Nom C]

Tu demandes à l'utilisateur de choisir une lettre (A, B ou C). Tu attends sa réponse avant de continuer. Une fois le choix fait, tu confirmes le nom choisi en écrivant exactement sur une ligne : **[NOM_CHOISI]** puis tu passes à l'étape suivante.

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
- Adapte tes questions et analyses à l'étape en cours indiquée dans le contexte.`;

// Construit une réponse SSE simulant un message d'Édouard (utilisée pour le quota dépassé)
function buildEdouardSseResponse(message: string): Response {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const chunk = {
        choices: [{ delta: { content: message }, finish_reason: "stop" }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, stepContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ===== Quota par utilisateur (60 messages utilisateur / jour) =====
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (user) {
      const since = new Date();
      since.setHours(0, 0, 0, 0);

      // Compte les messages "user" du jour dans toutes les conversations de l'utilisateur
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id);

      const convIds = (convs ?? []).map((c) => c.id);
      if (convIds.length > 0) {
        const { count } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("role", "user")
          .gte("created_at", since.toISOString())
          .in("conversation_id", convIds);

        if ((count ?? 0) >= DAILY_USER_QUOTA) {
          return buildEdouardSseResponse(
            `Désolé, tu as atteint la limite gratuite de ${DAILY_USER_QUOTA} messages pour aujourd'hui. ` +
              `On reprend l'analyse demain — d'ici là, prends quelques minutes pour relire nos échanges et préparer tes réponses, ça nous fera gagner du temps. À demain. 👋`,
          );
        }
      }
    }

    // ===== Optimisation : tronquer les messages user trop longs =====
    const safeMessages = Array.isArray(messages) ? messages : [];
    const sanitized = safeMessages.map((m: { role: string; content: string }) => {
      if (m.role === "user" && typeof m.content === "string" && m.content.length > MAX_USER_CHARS) {
        return {
          ...m,
          content: m.content.slice(0, MAX_USER_CHARS) + "\n\n[…message tronqué pour respecter la limite technique]",
        };
      }
      return m;
    });

    // ===== Optimisation : ne garder que les N derniers messages =====
    const trimmed = sanitized.slice(-MAX_HISTORY_MESSAGES);

    // ===== Détection géographique implicite (via headers de la requête) =====
    const country =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("x-country-code") ||
      "";
    const city =
      req.headers.get("cf-ipcity") ||
      req.headers.get("x-vercel-ip-city") ||
      "";

    // Mapping pays → monnaie locale par défaut
    const currencyMap: Record<string, string> = {
      CH: "CHF",
      FR: "EUR", BE: "EUR", LU: "EUR", DE: "EUR", IT: "EUR", ES: "EUR", PT: "EUR", NL: "EUR", AT: "EUR", IE: "EUR", FI: "EUR", GR: "EUR",
      SN: "XOF", CI: "XOF", BJ: "XOF", BF: "XOF", ML: "XOF", NE: "XOF", TG: "XOF", GW: "XOF",
      CM: "XAF", GA: "XAF", CG: "XAF", TD: "XAF", CF: "XAF", GQ: "XAF",
      MA: "MAD", TN: "TND", DZ: "DZD", MR: "MRU",
      CD: "CDF", RW: "RWF", BI: "BIF", MG: "MGA",
      CA: "CAD", US: "USD", GB: "GBP",
    };
    const currency = country && currencyMap[country] ? currencyMap[country] : "EUR";

    const geoBlock = country
      ? `\n\n## Contexte géographique de l'utilisateur (à utiliser implicitement, sans jamais le mentionner)\n- Pays : ${country}${city ? `\n- Ville : ${city}` : ""}\n- Monnaie de référence pour toutes les projections chiffrées : ${currency}\n- Adapte ton analyse (coûts, marché, logistique, financement, acquisition) à cette réalité locale.`
      : "";

    const systemContent = stepContext
      ? `${SYSTEM_PROMPT}${geoBlock}\n\n## Étape actuelle : ${stepContext}\nConcentre ton analyse sur cette étape.`
      : `${SYSTEM_PROMPT}${geoBlock}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          ...trimmed,
        ],
        stream: true,
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes. Réessaie dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés. Ajoutez des crédits dans les paramètres." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
