import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    const { messages, userId } = await req.json();

    // 1. LIMITE DE DÉBIT (60 messages / jour)
    const { data: countData, error: countError } = await supabase
      .from("messages") // Assure-toi que ta table s'appelle 'messages'
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    if ((countData?.length ?? 0) >= 60) {
      return new Response(
        JSON.stringify({
          role: "assistant",
          content:
            "Écoute, j'apprécie ton enthousiasme, mais le quota gratuit du jour est atteint. Je ne fais pas de bénévolat illimité. Reviens demain pour qu'on continue de bosser sur ton business.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. SÉCURITÉ ANTI-ABUS (Troncation à 1500 caractères)
    const processedMessages = messages.map((m: any) => ({
      ...m,
      content:
        m.content.length > 1500
          ? m.content.substring(0, 1500) + " [Contenu trop long, tronqué par sécurité]"
          : m.content,
    }));

    // 3. NETTOYAGE HISTORIQUE (8 derniers messages seulement)
    // On garde le System Prompt (index 0) + les 7 derniers échanges
    const contextWindow = [
      processedMessages[0], // Le prompt de personnalité d'Édouard
      ...processedMessages.slice(-7),
    ];

    // 4. APPEL IA AVEC LIMITES TECHNIQUES
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Ou ton modèle actuel
        messages: contextWindow,
        max_tokens: 600, // Limite de sortie pour économiser les tokens
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data.choices[0].message), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
