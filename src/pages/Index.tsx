import { useState, useEffect } from "react";
import ChatPanel from "@/components/ChatPanel";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Check } from "lucide-react"; // Import corrigé ici

const Index = () => {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const fetchMessages = async (id: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Erreur lors de la récupération des messages");
      return;
    }
    setMessages(data || []);
  };

  const handleCreateConversation = async (title: string) => {
    if (!user) return null;
    const { data, error } = await supabase
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
    const { error } = await supabase.from("messages").insert([{ conversation_id: id, role, content }]);

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
