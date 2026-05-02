import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getAnonMessages,
  getPendingMessage,
  clearAnonMessages,
  clearPendingMessage,
} from "@/lib/anonymousChat";
import { toast } from "sonner";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

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
        const firstUser = anon.find((m) => m.role === "user");
        const title = firstUser
          ? firstUser.content.slice(0, 60).replace(/\n/g, " ")
          : "Nouvelle analyse";

        const conv = await apiFetch("/conversations", {
          method: "POST",
          body: JSON.stringify({ title }),
        });

        if (!conv) {
          console.error("Migration: conversation creation failed");
          return;
        }

        const messages = [...anon];
        if (pending) {
          messages.push({ role: "user", content: pending, created_at: new Date().toISOString() });
        }

        if (messages.length > 0) {
          await apiFetch(`/conversations/${conv.id}/messages/bulk`, {
            method: "POST",
            body: JSON.stringify({
              messages: messages.map((m) => ({
                role: m.role,
                content: m.content,
                createdAt: m.created_at,
              })),
            }),
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
