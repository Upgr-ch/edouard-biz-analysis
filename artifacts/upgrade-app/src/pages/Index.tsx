import { useState, useEffect, useRef, useCallback } from "react";
import ChatPanel from "@/components/ChatPanel";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
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

const mapConv = (c: any) => ({
  ...c,
  current_step: c.currentStep ?? c.current_step ?? 0,
  created_at: c.createdAt ?? c.created_at,
  updated_at: c.updatedAt ?? c.updated_at,
});

const Index = () => {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const restorationProcessed = useRef(false);

  const fetchMessages = useCallback(async (id: string) => {
    try {
      const data = await apiFetch(`/conversations/${id}/messages`);
      setMessages((data || []).map((m: any) => ({
        ...m,
        conversation_id: m.conversationId ?? m.conversation_id,
        created_at: m.createdAt ?? m.created_at,
      })));
    } catch (e) {
      console.error("Fetch messages error:", e);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiFetch("/conversations");
      const convs = (data || []).map(mapConv);
      setConversations(convs);
      if (!conversationId && convs[0]) {
        setConversationId(convs[0].id);
        setCurrentStep(convs[0].current_step || 0);
        await fetchMessages(convs[0].id);
      }
    } catch (e) {
      console.error("Fetch conversations error:", e);
    }
  }, [conversationId, fetchMessages, user]);

  const handleCreateConversation = async (title: string) => {
    if (!user) return null;
    try {
      const data = await apiFetch("/conversations", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      const conv = mapConv(data);
      setConversationId(conv.id);
      setCurrentStep(conv.current_step || 0);
      setConversations((prev) => [conv, ...prev]);
      return conv.id;
    } catch (e) {
      toast.error("Erreur lors de la création de la conversation");
      return null;
    }
  };

  const handleSaveMessage = async (id: string, role: string, content: string) => {
    try {
      const data = await apiFetch(`/conversations/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ role, content }),
      });
      setMessages((prev) => [...prev, {
        ...data,
        conversation_id: data.conversationId ?? data.conversation_id,
        created_at: data.createdAt ?? data.created_at,
      }]);
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement du message");
    }
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

        await apiFetch(`/conversations/${newConversationId}/messages/bulk`, {
          method: "POST",
          body: JSON.stringify({
            messages: uniqueMessages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        });

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
      try {
        await apiFetch(`/conversations/${conversationId}`, {
          method: "PATCH",
          body: JSON.stringify({ currentStep: step }),
        });
        setConversations((prev) => prev.map((c) => c.id === conversationId ? { ...c, current_step: step } : c));
      } catch (e) {
        console.error("Error updating step:", e);
      }
    }
  };

  const handleSwitchConversation = async (id: string) => {
    const conversation = conversations.find((item) => item.id === id);
    setConversationId(id);
    setCurrentStep(conversation?.current_step || 0);
    await fetchMessages(id);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await apiFetch(`/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        setConversationId(null);
        setMessages([]);
        setCurrentStep(0);
      }
    } catch (e) {
      toast.error("Erreur lors de la suppression de la conversation");
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
