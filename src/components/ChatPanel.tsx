import { useState, useRef, useEffect, useCallback } from "react";
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
  number?: number; // Ajouté pour le suivi technique
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
  // Nouvelles props venant du Dashboard
  nextMessageNumber: number;
  isQuotaReached: boolean;
}

/** Extract step number from AI text */
function detectStep(text: string): number | null {
  const match = text.match(/\*?\*?[ÉE]tape\s+(\d{1,2})\/10/i);
  if (match) {
    const n = parseInt(match[1], 10);
    if (n >= 1 && n <= 10) return n - 1;
  }
  return null;
}

/** Detect chosen conversation name */
function detectChosenName(text: string): string | null {
  const bracketMatch = text.match(/\*\*\[([^\]]+)\]\*\*/);
  if (bracketMatch && bracketMatch[1].length > 2 && bracketMatch[1].length < 80) {
    return bracketMatch[1];
  }
  const startMatch = text.match(/^\*\*([^*\n]{3,40})\*\*/);
  if (startMatch) return startMatch[1];
  return null;
}

interface PendingFile {
  file: File;
  name: string;
  type: SupportedFileType;
}

const fileTypeLabels: Record<SupportedFileType, string> = {
  pdf: "PDF", docx: "Word", xlsx: "Excel", csv: "CSV", txt: "Texte", unsupported: "",
};

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Je suis Édouard. Ne le prends pas pour toi, je m'exprime de manière ferme, assertive et juste. Mon travail est de te dire la vérité business, pas de te flatter.\n\nAvant de commencer, j'ai besoin de savoir où tu en es. Choisis le profil qui te correspond :\n\n- **A. Novice**\n- **B. Intermédiaire**\n- **C. Confirmé**",
  number: 0
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({ messages, stepContext, onDelta, onDone, onError }: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ messages, stepContext }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Erreur de connexion au service IA");
    return;
  }

  const reader = resp.body!.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });
    let newlineIndex;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { streamDone = true; break; }
      try {
        const content = JSON.parse(jsonStr).choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { break; }
    }
  }
  onDone();
}

const ChatPanel = ({
  stepContext,
  conversationId,
  conversationTitle,
  currentStep,
  persistedMessages,
  saveMessage,
  updateMessageContent,
  onUpdateTitle,
  onCreateConversation,
  onStepDetected,
  nextMessageNumber,
  isQuotaReached
}: ChatPanelProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAnonymous = !user;

  const [anonMessages, setAnonMessages] = useState<Message[]>(() =>
    getAnonMessages().map((m, i) => ({ id: `anon-${i}`, role: m.role, content: m.content, number: i + 1 }))
  );

  const displayMessages: Message[] = isAnonymous
    ? (anonMessages.length > 0 ? anonMessages : [WELCOME_MESSAGE])
    : (persistedMessages.length > 0
        ? persistedMessages.map((m, i) => ({ id: m.id, role: m.role, content: m.content, number: i + 1 }))
        : [WELCOME_MESSAGE]);

  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isListening, transcript, resetTranscript, startListening, stopListening, isSupported: isSpeechSupported, interimTranscript } = useSpeechRecognition({
    onPermissionDenied: () => toast.warning("Microphone refusé."),
  });

  useEffect(() => {
    if (transcript) {
      setInput(prev => prev + (prev && !prev.endsWith(" ") ? " " : "") + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const allMessages = streamingMessage ? [...displayMessages, streamingMessage] : displayMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSend = async () => {
    if (isLoading || isParsing) return;
    if (!input.trim() && !pendingFile) return;

    // Blocage Quota Journalier (60 messages)
    if (isQuotaReached) {
      toast.error("Limite journalière de 60 messages atteinte. À demain !");
      return;
    }

    let messageContent = input.trim();

    if (pendingFile) {
      setIsParsing(true);
      try {
        const { text } = await parseDocument(pendingFile.file);
        messageContent = `📎 **Document : ${pendingFile.name}**\n\n${truncateIfNeeded(text)}${messageContent ? `\n\n**Commentaire :** ${messageContent}` : ""}`;
      } catch (err: any) {
        toast.error("Erreur lecture fichier.");
        setIsParsing(false); return;
      }
      setIsParsing(false); setPendingFile(null);
    }

    // GESTION BARRIÈRE ANONYME (Message 6)
    if (isAnonymous) {
      const userCount = getAnonUserMessageCount();
      if (userCount >= ANON_MAX_MESSAGES) {
        setPendingMessage(messageContent);
        toast.info("Inscription requise pour le 6ème message.");
        navigate("/auth");
        return;
      }

      appendAnonMessage("user", messageContent);
      const updated = getAnonMessages().map((m, i) => ({ id: `anon-${i}`, role: m.role, content: m.content, number: i + 1 }));
      setAnonMessages(updated);
      setInput("");
      setIsLoading(true);

      let assistantSoFar = "";
      await streamChat({
        messages: updated.map(m => ({ role: m.role, content: m.content })),
        stepContext,
        onDelta: (chunk: string) => {
          assistantSoFar += chunk;
          setStreamingMessage({ id: "streaming", role: "assistant", content: assistantSoFar, number: updated.length + 1 });
        },
        onDone: () => {
          if (assistantSoFar) appendAnonMessage("assistant", assistantSoFar);
          setAnonMessages(getAnonMessages().map((m, i) => ({ id: `anon-${i}`, role: m.role, content: m.content, number: i + 1 })));
          setStreamingMessage(null);
          setIsLoading(false);
          if (getAnonUserMessageCount() >= ANON_MAX_MESSAGES) toast.info("Barrière atteinte. Inscrivez-vous.");
        },
        onError: (err: string) => { toast.error(err); setIsLoading(false); setStreamingMessage(null); }
      });
      return;
    }

    // MODE CONNECTÉ (Numérotation continue)
    let convId = conversationId;
    if (!convId) {
      convId = await onCreateConversation(messageContent.slice(0, 50));
      if (!convId) return;
    }

    await saveMessage(convId, "user", messageContent);
    setInput("");
    setIsLoading(true);

    let