import { useState, useEffect, useRef, useCallback } from "react";
import ChatPanel from "@/components/ChatPanel";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const restorationProcessed = useRef(false);

  const fetchMessages = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
      return;
    }
    setMessages(data || []);
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Fetch conversations error:", error);
      return;
    }
    setConversations(data || []);
    if (!conversationId && data?.[0]) {
      setConversationId(data[0].id);
      setCurrentStep(data[0].current_step || 0);
      await fetchMessages(data[0].id);
    }
  }, [conversationId, fetchMessages, user]);

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
    setCurrentStep(data.current_step || 0);
    setConversations((prev) => [data, ...prev]);
    return data.id;
  };

  const handleSaveMessage = async (id: string, role: string, content: string) => {
    const { error } = await supabase.from("chat_messages").insert([{ conversation_id: id, role, content }]);

    if (error) {
      toast.error("Erreur lors de l'enregistrement du message");
      return;
    }
    fetchMessages(id);
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const restoreTemporaryChat = async () => {
      if (!user || restorationProcessed.current) return;
      const rawChat = localStorage.getItem("temp_chat");
      if (!rawChat) return;

      restorationProcessed.current = true;
      try {
        const temporaryMessages = JSON.parse(rawChat).filter((msg: any) => msg?.role && msg?.content);
        const uniqueMessages = temporaryMessages.filter(
          (msg: any, index: number, list: any[]) =>
            list.findIndex((item) => item.role === msg.role && item.content === msg.content) === index,
        );
        const newConversationId = await handleCreateConversation("Analyse récupérée");
        if (!newConversationId) throw new Error("Conversation non créée");

        const { error } = await supabase.from("chat_messages").insert(
          uniqueMessages.map((msg: any) => ({
            conversation_id: newConversationId,
            role: msg.role,
            content: msg.content,
          })),
        );
        if (error) throw error;

        await fetchMessages(newConversationId);
        localStorage.removeItem("temp_chat");
        localStorage.removeItem("pending_anon_chat");
        toast.success("Discussion récupérée !");
      } catch (error) {
        console.error("Échec restauration chat temporaire:", error);
        restorationProcessed.current = false;
      }
    };

    restoreTemporaryChat();
  }, [fetchMessages, user]);

  const handleStepChange = async (step: number) => {
    setCurrentStep(step);
    if (conversationId) {
      await supabase.from("conversations").update({ current_step: step }).eq("id", conversationId);
      setConversations((prev) => prev.map((conversation) => conversation.id === conversationId ? { ...conversation, current_step: step } : conversation));
    }
  };

  const handleSwitchConversation = async (id: string) => {
    const conversation = conversations.find((item) => item.id === id);
    setConversationId(id);
    setCurrentStep(conversation?.current_step || 0);
    await fetchMessages(id);
  };

  const handleDeleteConversation = async (id: string) => {
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression de la conversation");
      return;
    }
    setConversations((prev) => prev.filter((conversation) => conversation.id !== id));
    if (conversationId === id) {
      setConversationId(null);
      setMessages([]);
      setCurrentStep(0);
    }
  };

  const completedSteps = Array.from({ length: currentStep }, (_, index) => index);

  return (
    <div className="min-h-screen bg-background">
      {user ? (
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar
            currentStep={currentStep}
            onStepChange={handleStepChange}
            completedSteps={completedSteps}
            conversations={conversations}
            activeConversationId={conversationId}
            onNewConversation={() => handleCreateConversation("Nouvelle analyse")}
            onSwitchConversation={handleSwitchConversation}
            onDeleteConversation={handleDeleteConversation}
          />
          <main className="flex-1 min-w-0">
            <ChatPanel
              conversationId={conversationId}
              persistedMessages={messages}
              saveMessage={handleSaveMessage}
              onCreateConversation={handleCreateConversation}
            />
          </main>
        </div>
      ) : (
        <ChatPanel
          conversationId={conversationId}
          persistedMessages={messages}
          saveMessage={handleSaveMessage}
          onCreateConversation={handleCreateConversation}
        />
      )}
    </div>
  );
};

export default Index;
