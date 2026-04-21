import { useState, useEffect } from "react";
import ChatPanel from "@/components/ChatPanel";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const fetchMessages = async (id: string) => {
    // Utilisation de (supabase as any) pour contourner les erreurs de typage
    const { data, error } = await (supabase as any)
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
      return;
    }
    setMessages(data || []);
  };

  const handleCreateConversation = async (title: string) => {
    if (!user) return null;
    const { data, error } = await (supabase as any)
      .from("conversations")
      .insert([{ user_id: user.id, title }])
      .select()
      .single();

    if (error) {
      toast.error("Erreur lors de la création de la conversation");
      return null;
    }
    setConversationId(data.id);
    return data.id;
  };

  const handleSaveMessage = async (id: string, role: string, content: string) => {
    const { error } = await (supabase as any).from("messages").insert([{ conversation_id: id, role, content }]);

    if (error) {
      toast.error("Erreur lors de l'enregistrement du message");
      return;
    }
    fetchMessages(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <ChatPanel
        conversationId={conversationId}
        persistedMessages={messages}
        saveMessage={handleSaveMessage}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
};

export default Index;
