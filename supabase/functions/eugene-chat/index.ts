import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { messages, userId } = await req.json();

    // 1. Rate limit (60 messages / day) — only when authenticated
    if (userId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      const { data: countData } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact" })
        .eq("role", "user")
        .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      if ((countData?.length ?? 0) >= 60) {
        return new Response(
          JSON.stringify({
            role: "assistant",
            content:
              "Le quota gratuit du jour est atteint. Reviens demain pour qu'on continue de bosser sur ton business.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // 2. Truncate long messages (1500 chars max)
    const processedMessages = (messages || []).map((m: any) => ({
      ...m,
      content:
        typeof m.content === "string" && m.content.length > 1500
          ? m.content.substring(0, 1500) + " [Contenu tronqué par sécurité]"
          : m.content,
    }));

    // 3. Keep system prompt (if present) + last 7 messages
    const hasSystem = processedMessages[0]?.role === "system";
    const contextWindow = hasSystem
      ? [processedMessages[0], ...processedMessages.slice(1).slice(-7)]
      : processedMessages.slice(-7);

    // 4. Call Lovable AI Gateway (Gemini 2.5 Flash)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: contextWindow,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data.choices[0].message), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("eugene-chat error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
