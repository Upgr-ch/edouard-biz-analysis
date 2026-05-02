import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  getAnonMessages,
  getPendingMessage,
  clearAnonMessages,
  clearPendingMessage,
} from "@/lib/anonymousChat";
import { toast } from "sonner";

/**
 * On first authentication after an anonymous session, migrate the locally-stored
 * anonymous chat history into a real conversation, then re-send the pending
 * (9th, blocked) message so the user resumes seamlessly.
 *
 * Returns nothing — the parent should reload conversations after the toast appears.
 */
export function useAnonMigration(onMigrated?: () => void) {
  const { user } = useAuth();
  const ranRef = useRef(false);

  useEffect(() => {
    if (!user || ranRef.current) return;
    const anon = getAnonMessages();
    const pending = getPendingMessage();
    if (anon.length === 0 && !pending) return;

    ranRef.current = true;

    (async () => {
      try {
        // Use first user message as conversation title
        const firstUser = anon.find((m) => m.role === "user");
        const title = firstUser
          ? firstUser.content.slice(0, 60).replace(/\n/g, " ")
          : "Nouvelle analyse";

        const { data: conv, error: convErr } = await supabase
          .from("conversations")
          .insert({ user_id: user.id, title })
          .select()
          .single();

        if (convErr || !conv) {
          console.error("Migration: conversation creation failed", convErr);
          return;
        }

        if (anon.length > 0) {
          const rows = anon.map((m) => ({
            conversation_id: conv.id,
            role: m.role,
            content: m.content,
            created_at: m.created_at,
          }));
          const { error: msgErr } = await supabase.from("chat_messages").insert(rows);
          if (msgErr) {
            console.error("Migration: messages insert failed", msgErr);
          }
        }

        // If there was a pending blocked message, append it as a user message too
        if (pending) {
          await supabase.from("chat_messages").insert({
            conversation_id: conv.id,
            role: "user",
            content: pending,
          });
        }

        clearAnonMessages();
        clearPendingMessage();
        toast.success("Ta conversation a été restaurée.");
        onMigrated?.();
      } catch (e) {
        console.error("Migration error", e);
      }
    })();
  }, [user, onMigrated]);
}
