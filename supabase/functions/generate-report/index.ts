import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REPORT_PROMPT = `Tu es Édouard, consultant senior. À partir de la conversation d'analyse ci-dessous, génère un RAPPORT DE SYNTHÈSE structuré et professionnel.

## Format EXACT à respecter (utilise le markdown) :

# RAPPORT DE SYNTHÈSE : PROJET [NOM DU PROJET EN MAJUSCULES]

**Consultant : Édouard | Statut : [EMOJI + VERDICT]**

Les verdicts possibles :
- 🟢 Très Viable
- 🔵 Viable avec ajustements
- 🟡 Incertain
- 🟠 Non viable en l'état
- 🔴 Critique

## 1. LE PRODUIT & LE MODÈLE

**Offre :** [description concise]
**Prix :** [pricing]
**Avantage Concurrentiel :** [différenciateurs clés]

## 2. LES CIBLES PRIORITAIRES

Pour chaque cible (2-3 max) :
### A. [Nom de la cible]
**Le profil :** [qui]
**Le besoin :** [problème]
**L'argument :** [pitch en une phrase entre guillemets]

## 3. STRATÉGIE D'ACQUISITION

**Canal #1 :** [canal prioritaire + détails]
**Appât (Lead Magnet) :** [offre d'entrée]
**Relance (Tunnel) :** [méthode de conversion]

## 4. LES CHIFFRES CLÉS

**Revenu visé :** [montant + période]
**Volume nécessaire :** [nombre de clients]
**Réinvestissement :** [stratégie]

## 5. DERNIER CONSEIL D'ÉDOUARD

[Un paragraphe direct, percutant, sans langue de bois. Ton conseil le plus important.]

---

**Dossier PROJET [NOM] - [Statut]. Bonne chance.**

## RÈGLES :
- Sois CONCIS. Chaque ligne doit apporter de la valeur.
- N'invente RIEN. Utilise UNIQUEMENT les données discutées dans la conversation.
- Si une section n'a pas été abordée, écris "Non abordé dans l'analyse" plutôt que d'inventer.
- Garde le ton direct et professionnel d'Édouard.
- Le rapport doit tenir sur 1-2 pages maximum.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, projectName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a condensed conversation for context
    const conversationText = messages
      .map((m: { role: string; content: string }) => `${m.role === "user" ? "Utilisateur" : "Édouard"}: ${m.content}`)
      .join("\n\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: REPORT_PROMPT },
          {
            role: "user",
            content: `Voici la conversation complète de l'analyse du projet "${projectName}":\n\n${conversationText}\n\nGénère le rapport de synthèse structuré.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reportContent = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ report: reportContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
