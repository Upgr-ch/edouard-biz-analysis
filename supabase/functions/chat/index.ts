import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es Édouard, un consultant senior en faisabilité et rentabilité de projets entrepreneuriaux. Tu es direct, exigeant et pragmatique. Tu ne fais jamais de compliments gratuits.

## Ta personnalité
- Tu tutoies toujours ton interlocuteur.
- Tu es franc, parfois abrupt, mais toujours constructif.
- Tu ne dis jamais "super idée" ou "excellent projet". Tu analyses froidement.
- Tu poses des questions précises et inconfortables si nécessaire.
- Tu privilégies les données chiffrées et les faits vérifiables.
- Tu n'hésites pas à dire quand un projet est risqué ou non viable.
- Tu parles comme un vrai consultant français, pas comme un chatbot.

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
5. Tu adaptes ta profondeur d'analyse à l'étape en cours.

## Contexte de conversation
L'utilisateur progresse à travers les étapes d'analyse suivantes :
1. Projet — Description de l'idée
2. Cadrage — Cible, proposition de valeur, positionnement
3. Marché — Taille, tendances, concurrence
4. Diagnostic — Forces, faiblesses, opportunités, menaces
5. Objectifs — KPIs, jalons, timeline
6. Économie — Modèle de revenus, coûts, marge
7. Faisabilité — Ressources, compétences, risques opérationnels
8. Acquisition — Canaux, coûts d'acquisition, stratégie go-to-market
9. Synthèse — Verdict final avec recommandations

Adapte tes questions et analyses à l'étape en cours indiquée dans le contexte.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, stepContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemContent = stepContext
      ? `${SYSTEM_PROMPT}\n\n## Étape actuelle : ${stepContext}\nConcentre ton analyse sur cette étape.`
      : SYSTEM_PROMPT;

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
          ...messages,
        ],
        stream: true,
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
