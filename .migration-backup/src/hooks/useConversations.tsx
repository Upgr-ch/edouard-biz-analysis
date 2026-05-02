import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }
    setConversations(data || []);
  }, [user]);

  // Load messages for active conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }
    setMessages((data || []).map((m) => ({ ...m, role: m.role as "user" | "assistant" })));
  }, []);

  // Create new conversation
  const createConversation = useCallback(async (title = "Nouvelle analyse"): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error) {
      toast.error("Erreur lors de la création de la conversation.");
      console.error(error);
      return null;
    }

    setConversations((prev) => [data, ...prev]);
    setActiveConversationId(data.id);
    setMessages([]);
    return data.id;
  }, [user]);

  // Delete conversation
  const deleteConversation = useCallback(async (id: string) => {
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression.");
      return;
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
  }, [activeConversationId]);

  // Update conversation title
  const updateTitle = useCallback(async (id: string, title: string) => {
    await supabase.from("conversations").update({ title, updated_at: new Date().toISOString() }).eq("id", id);
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title } : c));
  }, []);

  // Update current step
  const updateStep = useCallback(async (id: string, step: number) => {
    await supabase.from("conversations").update({ current_step: step, updated_at: new Date().toISOString() }).eq("id", id);
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, current_step: step } : c));
  }, []);

  // Save a message
  const saveMessage = useCallback(async (conversationId: string, role: "user" | "assistant", content: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ conversation_id: conversationId, role, content })
      .select()
      .single();

    if (error) {
      console.error("Error saving message:", error);
      return null;
    }

    // Add to local state
    setMessages((prev) => [...prev, { ...data, role: data.role as "user" | "assistant" }]);

    // Touch updated_at on conversation
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);

    return data.id;
  }, []);

  // Update a message content (for streaming)
  const updateMessageContent = useCallback(async (messageId: string, content: string) => {
    await supabase.from("chat_messages").update({ content }).eq("id", messageId);
  }, []);

  // Switch conversation
  const switchConversation = useCallback(async (id: string) => {
    setActiveConversationId(id);
    await loadMessages(id);
  }, [loadMessages]);

  // Init: load conversations, auto-select or create first
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setConversations(data || []);

      if (data && data.length > 0) {
        setActiveConversationId(data[0].id);
        await loadMessages(data[0].id);
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
