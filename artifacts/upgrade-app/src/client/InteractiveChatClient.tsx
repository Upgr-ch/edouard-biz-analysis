import { useAuth as useClerkAuth } from "@clerk/react";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatPanel from "../components/ChatPanel";
import { useAuth } from "../hooks/useAuth";
import {
  EDOUARD_INTRO_PARAGRAPHS,
  EDOUARD_WARNING_TEXT,
  type EdouardProfileKey,
} from "../public/edouardPublicContent";
import * as AnonChat from "../lib/anonymousChat";

interface ApiConversation {
  id: string;
  title: string;
  currentStep?: number;
  current_step?: number;
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

interface DisplayMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ProfileRequest {
  id: number;
  profile: EdouardProfileKey;
}

interface InteractiveChatClientProps {
  profileRequest: ProfileRequest | null;
}

const introMessage = `${EDOUARD_INTRO_PARAGRAPHS.join("<br><br>\n\n")}<br><br>\n\n⚠️ ${EDOUARD_WARNING_TEXT}`;

function stripSentinel(text: string): string {
  return text.replace(/\|\|\|TITRE:[^|]*\|\|\|\n?/g, "").trim();
}

function mapMessage(message: ApiMessage): DisplayMessage {
  return {
    id: message.id,
    conversation_id:
      message.conversationId ?? message.conversation_id ?? "",
    role: message.role,
    content: message.content,
    created_at: message.createdAt ?? message.created_at ?? "",
  };
}

async function invokeChat(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  token?: string | null,
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error ?? `Chat API error ${response.status}`);
  }

  const body = (await response.json()) as { content?: string };
  return body.content ?? "";
}

async function waitForPublicPaint(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export default function InteractiveChatClient({
  profileRequest,
}: InteractiveChatClientProps) {
  const { user, loading: authLoading } = useAuth();
  const { getToken } = useClerkAuth();
  const [conversationId, setConversationId] = useState<string | null>(
    null,
  );
  const [conversationTitle, setConversationTitle] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [visible, setVisible] = useState(false);
  const processedProfileRequest = useRef<number | null>(null);
  const profileInitializationPending = useRef(false);
  const restorationStarted = useRef(false);

  const authenticatedFetch = useCallback(
    async <T,>(path: string, options?: RequestInit): Promise<T | null> => {
      const token = await getToken();
      const response = await fetch(`/api${path}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options?.headers ?? {}),
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }
      if (response.status === 204) return null;
      return response.json() as Promise<T>;
    },
    [getToken],
  );

  const createConversation = useCallback(
    async (title: string): Promise<string | null> => {
      const conversation = await authenticatedFetch<ApiConversation>(
        "/conversations",
        {
          method: "POST",
          body: JSON.stringify({ title }),
        },
      );
      if (!conversation) return null;
      setConversationId(conversation.id);
      setConversationTitle(conversation.title);
      return conversation.id;
    },
    [authenticatedFetch],
  );

  const saveMessage = useCallback(
    async (
      id: string,
      role: "user" | "assistant",
      content: string,
    ): Promise<void> => {
      const saved = await authenticatedFetch<ApiMessage>(
        `/conversations/${id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ role, content }),
        },
      );
      if (saved) {
        setMessages((current) => [...current, mapMessage(saved)]);
      }
    },
    [authenticatedFetch],
  );

  const renameConversation = useCallback(
    async (id: string, title: string): Promise<void> => {
      await authenticatedFetch<ApiConversation>(`/conversations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
      setConversationTitle(title);
    },
    [authenticatedFetch],
  );

  useEffect(() => {
    if (authLoading || restorationStarted.current) return;

    restorationStarted.current = true;
    void (async () => {
      try {
        if (!user) {
          if (AnonChat.getAnonMessages().length > 0) {
            await waitForPublicPaint();
            setVisible(true);
          }
          return;
        }

        const rawTemporaryChat = localStorage.getItem("temp_chat");
        if (rawTemporaryChat) {
          const parsed = JSON.parse(rawTemporaryChat) as Array<{
            role?: unknown;
            content?: unknown;
          }>;
          const temporaryMessages = parsed.filter(
            (
              message,
            ): message is {
              role: "user" | "assistant";
              content: string;
            } =>
              (message.role === "user" ||
                message.role === "assistant") &&
              typeof message.content === "string",
          );
          const title =
            localStorage.getItem("temp_title")?.trim() ||
            "Analyse récupérée";
          const restoredId = await createConversation(title);
          if (!restoredId) return;
          await authenticatedFetch<ApiMessage[]>(
            `/conversations/${restoredId}/messages/bulk`,
            {
              method: "POST",
              body: JSON.stringify({ messages: temporaryMessages }),
            },
          );
          const restoredMessages =
            (await authenticatedFetch<ApiMessage[]>(
              `/conversations/${restoredId}/messages`,
            )) ?? [];
          setMessages(restoredMessages.map(mapMessage));
          localStorage.removeItem("temp_chat");
          localStorage.removeItem("temp_title");
          localStorage.removeItem("pending_anon_chat");
          await waitForPublicPaint();
          setVisible(true);
          return;
        }

        const conversations =
          (await authenticatedFetch<ApiConversation[]>(
            "/conversations",
          )) ?? [];
        if (!conversations[0]) return;

        const active = conversations[0];
        const restoredMessages =
          (await authenticatedFetch<ApiMessage[]>(
            `/conversations/${active.id}/messages`,
          )) ?? [];
        setConversationId(active.id);
        setConversationTitle(active.title);
        setMessages(restoredMessages.map(mapMessage));
        await waitForPublicPaint();
        setVisible(true);
      } catch (error) {
        restorationStarted.current = false;
        console.error("Échec restauration Vike:", error);
      }
    })();
  }, [
    authLoading,
    authenticatedFetch,
    createConversation,
    user,
  ]);

  useEffect(() => {
    if (
      authLoading ||
      !profileRequest ||
      processedProfileRequest.current === profileRequest.id
    ) {
      return;
    }

    if (profileInitializationPending.current) {
      processedProfileRequest.current = profileRequest.id;
      return;
    }

    processedProfileRequest.current = profileRequest.id;
    profileInitializationPending.current = true;
    void (async () => {
      try {
        if (!user) {
          if (AnonChat.getAnonMessages().length === 0) {
            AnonChat.appendAnonMessage("assistant", introMessage);
          }
          AnonChat.appendAnonMessage("user", profileRequest.profile);
          const reply = await invokeChat(AnonChat.getAnonMessages());
          if (reply) {
            AnonChat.appendAnonMessage(
              "assistant",
              stripSentinel(reply),
            );
          }
          setVisible(true);
          return;
        }

        const activeId =
          conversationId ??
          (await createConversation("Nouvelle analyse"));
        if (!activeId) return;

        const initialMessages =
          messages.length > 0
            ? messages
            : [{ role: "assistant" as const, content: introMessage }];
        if (messages.length === 0) {
          await saveMessage(activeId, "assistant", introMessage);
        }
        await saveMessage(activeId, "user", profileRequest.profile);
        const token = await getToken();
        const reply = await invokeChat(
          [
            ...initialMessages,
            { role: "user", content: profileRequest.profile },
          ],
          token,
        );
        if (reply) {
          await saveMessage(activeId, "assistant", stripSentinel(reply));
        }
        setVisible(true);
      } catch (error) {
        processedProfileRequest.current = null;
        console.error("Échec initialisation Vike:", error);
      } finally {
        profileInitializationPending.current = false;
      }
    })();
  }, [
    authLoading,
    conversationId,
    createConversation,
    getToken,
    messages,
    profileRequest,
    saveMessage,
    user,
  ]);

  if (!visible) return null;

  return (
    <div className="vike-chat-overlay absolute inset-0 z-20 flex flex-col bg-background">
      <ChatPanel
        conversationId={conversationId}
        conversationTitle={conversationTitle}
        persistedMessages={messages}
        saveMessage={saveMessage}
        onCreateConversation={createConversation}
        onRenameConversation={renameConversation}
      />
    </div>
  );
}