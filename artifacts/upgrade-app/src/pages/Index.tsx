import { useState, useEffect, useRef, useCallback } from "react";
import ChatPanel from "@/components/ChatPanel";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ApiConversation {
  id: string;
  title: string;
  currentStep?: number;
  current_step?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

interface ApiMessage {
  id: string;
  conversationId?: string;
  conversation_id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  created_at?: string;
}

interface Conversation extends ApiConversation {
  current_step: number;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface TempChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  if (res.status === 204) return null;
  return res.json() as Promise<T>;
}

function mapConv(c: ApiConversation): Conversation {
  return {
    ...c,
    current_step: c.currentStep ?? c.current_step ?? 0,
    created_at: c.createdAt ?? c.created_at ?? "",
    updated_at: c.updatedAt ?? c.updated_at ?? "",
  };
}

function mapMsg(m: ApiMessage): Message {
  return {
    id: m.id,
    conversation_id: m.conversationId ?? m.conversation_id ?? "",
    role: m.role,
    content: m.content,
    created_at: m.createdAt ?? m.created_at ?? "",
  };
}

const Index = () => {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const restorationProcessed = useRef(false);

  const fetchMessages = useCallback(async (id: string) => {
    try {
      const data = await apiFetch<ApiMessage[]>(`/conversations/${id}/messages`);
      setMessages((data ?? []).map(mapMsg));
    } catch (e) {
      console.error("Fetch messages error:", e);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiFetch<ApiConversation[]>("/conversations");
      const convs = (data ?? []).map(mapConv);
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

  const handleCreateConversation = async (title: string): Promise<string | null> => {
    if (!user) return null;
    try {
      const data = await apiFetch<ApiConversation>("/conversations", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      if (!data) return null;
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

  const handleSaveMessage = async (id: string, role: "user" | "assistant", content: string) => {
    try {
      const data = await apiFetch<ApiMessage>(`/conversations/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ role, content }),
      });
      if (data) setMessages((prev) => [...prev, mapMsg(data)]);
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement du message");
    }
  };

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const restoreTemporaryChat = async () => {
      if (!user || restorationProcessed.current) return;
      const rawChat = localStorage.getItem("temp_chat");
      if (!rawChat) return;

      restorationProcessed.current = true;
      try {
        const parsed = JSON.parse(rawChat) as unknown[];
        const temporaryMessages = parsed.filter(
          (msg): msg is TempChatMessage =>
            typeof msg === "object" &&
            msg !== null &&
            "role" in msg &&
            "content" in msg &&
            typeof (msg as TempChatMessage).role === "string" &&
            typeof (msg as TempChatMessage).content === "string",
        );
        const uniqueMessages = temporaryMessages.filter(
          (msg, index, list) =>
            list.findIndex(
              (item) => item.role === msg.role && item.content === msg.content,
            ) === index,
        );

        const newConversationId = await handleCreateConversation("Analyse récupérée");
        if (!newConversationId) throw new Error("Conversation non créée");

        await apiFetch<ApiMessage[]>(
          `/conversations/${newConversationId}/messages/bulk`,
          {
            method: "POST",
            body: JSON.stringify({
              messages: uniqueMessages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            }),
          },
        );

        await fetchMessages(newConversationId);
        localStorage.removeItem("temp_chat");
        localStorage.removeItem("pending_anon_chat");
        toast.success("Discussion récupérée !");
      } catch (error) {
        console.error("Échec restauration chat temporaire:", error);
        restorationProcessed.current = false;
      }
    };

    void restoreTemporaryChat();
  }, [fetchMessages, user]);

  const handleStepChange = async (step: number) => {
    setCurrentStep(step);
    if (conversationId) {
      try {
        await apiFetch<ApiConversation>(`/conversations/${conversationId}`, {
          method: "PATCH",
          body: JSON.stringify({ currentStep: step }),
        });
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, current_step: step } : c,
          ),
        );
      } catch (e) {
        console.error("Error updating step:", e);
      }
    }
  };

  const handleSwitchConversation = async (id: string) => {
    const conversation = conversations.find((item) => item.id === id);
    setConversationId(id);
    setCurrentStep(conversation?.current_step ?? 0);
    await fetchMessages(id);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await apiFetch<null>(`/conversations/${id}`, { method: "DELETE" });
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
            onNewConversation={() => void handleCreateConversation("Nouvelle analyse")}
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
