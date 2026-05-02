import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Conversation {
  id: string;
  title: string;
  current_step: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

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

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const mapConv = (c: any): Conversation => ({
    id: c.id,
    title: c.title,
    current_step: c.currentStep ?? c.current_step ?? 0,
    created_at: c.createdAt ?? c.created_at,
    updated_at: c.updatedAt ?? c.updated_at,
  });

  const mapMsg = (m: any): ChatMessage => ({
    id: m.id,
    conversation_id: m.conversationId ?? m.conversation_id,
    role: m.role as "user" | "assistant",
    content: m.content,
    created_at: m.createdAt ?? m.created_at,
  });

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiFetch("/conversations");
      setConversations((data || []).map(mapConv));
    } catch (e) {
      console.error("Error loading conversations:", e);
    }
  }, [user]);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await apiFetch(`/conversations/${conversationId}/messages`);
      setMessages((data || []).map(mapMsg));
    } catch (e) {
      console.error("Error loading messages:", e);
    }
  }, []);

  const createConversation = useCallback(async (title = "Nouvelle analyse"): Promise<string | null> => {
    if (!user) return null;
    try {
      const data = await apiFetch("/conversations", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      const conv = mapConv(data);
      setConversations((prev) => [conv, ...prev]);
      setActiveConversationId(conv.id);
      setMessages([]);
      return conv.id;
    } catch (e) {
      toast.error("Erreur lors de la création de la conversation.");
      return null;
    }
  }, [user]);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await apiFetch(`/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (e) {
      toast.error("Erreur lors de la suppression.");
    }
  }, [activeConversationId]);

  const updateTitle = useCallback(async (id: string, title: string) => {
    try {
      await apiFetch(`/conversations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
      setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title } : c));
    } catch (e) {
      console.error("Error updating title:", e);
    }
  }, []);

  const updateStep = useCallback(async (id: string, step: number) => {
    try {
      await apiFetch(`/conversations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ currentStep: step }),
      });
      setConversations((prev) => prev.map((c) => c.id === id ? { ...c, current_step: step } : c));
    } catch (e) {
      console.error("Error updating step:", e);
    }
  }, []);

  const saveMessage = useCallback(async (conversationId: string, role: "user" | "assistant", content: string): Promise<string | null> => {
    try {
      const data = await apiFetch(`/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ role, content }),
      });
      const msg = mapMsg(data);
      setMessages((prev) => [...prev, msg]);
      return msg.id;
    } catch (e) {
      console.error("Error saving message:", e);
      return null;
    }
  }, []);

  const updateMessageContent = useCallback(async (conversationId: string, messageId: string, content: string) => {
    try {
      await apiFetch(`/conversations/${conversationId}/messages/${messageId}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      });
    } catch (e) {
      console.error("Error updating message:", e);
    }
  }, []);

  const switchConversation = useCallback(async (id: string) => {
    setActiveConversationId(id);
    await loadMessages(id);
  }, [loadMessages]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const data = await apiFetch("/conversations");
        const convs = (data || []).map(mapConv);
        setConversations(convs);
        if (convs.length > 0) {
          setActiveConversationId(convs[0].id);
          await loadMessages(convs[0].id);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [user, loadMessages]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  return {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    setMessages,
    loading,
    createConversation,
    deleteConversation,
    updateTitle,
    updateStep,
    saveMessage,
    updateMessageContent,
    switchConversation,
    loadConversations,
  };
}
