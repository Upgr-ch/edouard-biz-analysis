import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Brain, User, Paperclip, FileText, X, Mic, Download, Lock } from "lucide-react";
import { fetchSynthesis, renderReportPdf } from "@/lib/generateReport";
import { cn } from "@/lib/utils";
import { parseDocument, getFileType, truncateIfNeeded, type SupportedFileType } from "@/lib/documentParser";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/hooks/useConversations";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  ANON_MAX_MESSAGES,
  appendAnonMessage,
  getAnonMessages,
  getAnonUserMessageCount,
  setPendingMessage,
} from "@/lib/anonymousChat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  number?: number;
}

interface ChatPanelProps {
  stepContext: string;
  conversationId: string | null;
  conversationTitle?: string;
  currentStep?: number;
  persistedMessages: ChatMessage[];
  setPersistedMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  saveMessage: (conversationId: string, role: "user" | "assistant", content: string) => Promise<string | null>;
  updateMessageContent: (messageId: string, content: string) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
  onCreateConversation: (title?: string) => Promise<string | null>;
  onStepDetected?: (step: number) => void;
  nextMessageNumber: number;
  isQuotaReached: boolean;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Je suis Édouard. Je m'exprime de manière ferme et juste. Mon travail est de te dire la vérité business.\n\nChoisis ton profil :\n\n- **A. Novice**\n- **B. Intermédiaire**\n- **C. Confirmé**",
  number: 0,
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ChatPanel = ({
  stepContext,
  conversationId,
  conversationTitle,
  currentStep,
  persistedMessages = [],
  saveMessage,
  onUpdateTitle,
  onCreateConversation,
  onStepDetected,
  nextMessageNumber = 1,
  isQuotaReached = false,
}: ChatPanelProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAnonymous = !user;

  const [anonMessages, setAnonMessages] = useState<Message[]>(() =>
    getAnonMessages().map((m, i) => ({
      id: `anon-${i}`,
      role: m.role as "user" | "assistant",
      content: m.content,
      number: i + 1,
    })),
  );

  const displayMessages: Message[] = isAnonymous
    ? anonMessages.length > 0
      ? anonMessages
      : [WELCOME_MESSAGE]
    : persistedMessages.length > 0
      ? persistedMessages.map((m, i) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          number: i + 1,
        }))
      : [WELCOME_MESSAGE];

  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    startListening,
    stopListening,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition({
    onPermissionDenied: () => toast.warning("Microphone refusé."),
  });

  const allMessages = streamingMessage ? [...displayMessages, streamingMessage] : displayMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSend = async () => {
    if (isLoading || isQuotaReached || (!input.trim() && !pendingFile)) return;

    let messageContent = input.trim();
    if (isAnonymous && getAnonUserMessageCount() >= ANON_MAX_MESSAGES) {
      setPendingMessage(messageContent);
      navigate("/auth");
      return;
    }

    setInput("");
    setIsLoading(true);

    if (isAnonymous) {
      appendAnonMessage("user", messageContent);
      const updated = getAnonMessages().map((m, i) => ({
        id: `anon-${i}`,
        role: m.role as "user" | "assistant",
        content: m.content,
        number: i + 1,
      }));
      setAnonMessages(updated);
      // Logique simplifiée pour le test
      setTimeout(() => {
        appendAnonMessage("assistant", "Bien reçu. Je traite l'information.");
        setAnonMessages(
          getAnonMessages().map((m, i) => ({
            id: `anon-${i}`,
            role: m.role as "user" | "assistant",
            content: m.content,
            number: i + 1,
          })),
        );
        setIsLoading(false);
      }, 1000);
    } else {
      let convId = conversationId;
      if (!convId) {
        convId = (await onCreateConversation(messageContent.slice(0, 50))) || "";
      }
      await saveMessage(convId, "user", messageContent);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {allMessages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={cn("flex flex-col animate-fade-in", msg.role === "user" ? "items-end" : "items-start")}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {msg.role === "assistant" ? "Édouard" : "Vous"} — Message #{msg.number ?? idx}
                </span>
              </div>
              <div className={cn("flex gap-3 w-full", msg.role === "user" ? "flex-row-reverse" : "")}>
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === "assistant" ? "gradient-primary" : "bg-accent",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Brain className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                    msg.role === "assistant"
                      ? "bg-card border border-border/50 text-foreground"
                      : "bg-primary/10 text-foreground",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown className="prose prose-sm prose-invert">{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-border bg-card/50">
        <div className="flex items-end gap-2 max-w-3xl mx-auto bg-background/50 p-2 rounded-2xl border border-border">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Échangez avec Édouard..."
            className="flex-1 min-h-[40px] max-h-32 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-primary text-primary-foreground p-2.5 rounded-xl disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
