import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Brain, User, Paperclip, FileText, X, Mic, Download } from "lucide-react";
import { generateSynthesisReport } from "@/lib/generateReport";
import { cn } from "@/lib/utils";
import { parseDocument, getFileType, truncateIfNeeded, type SupportedFileType } from "@/lib/documentParser";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/hooks/useConversations";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
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
}

/** Extract step number from AI text like "Étape 3/9" or "**Étape 5/9 —" */
function detectStep(text: string): number | null {
  const match = text.match(/\*?\*?[ÉE]tape\s+(\d)\/9/i);
  if (match) {
    const n = parseInt(match[1], 10);
    if (n >= 1 && n <= 9) return n - 1; // 0-indexed
  }
  return null;
}

/** Detect chosen conversation name from pattern like **[NOM_CHOISI]** or **NOM_CHOISI** at start of response */
function detectChosenName(text: string): string | null {
  // Match **[Some Name]** pattern (brackets style)
  const bracketMatch = text.match(/\*\*\[([^\]]+)\]\*\*/);
  if (bracketMatch && bracketMatch[1].length > 2 && bracketMatch[1].length < 80) {
    return bracketMatch[1];
  }
  // Match **Name** at the very start of the response (confirmation line without brackets)
  const startMatch = text.match(/^\*\*([^*\n]{3,40})\*\*/);
  if (startMatch) {
    return startMatch[1];
  }
  return null;
}

interface PendingFile {
  file: File;
  name: string;
  type: SupportedFileType;
}

const fileTypeLabels: Record<SupportedFileType, string> = {
  pdf: "PDF",
  docx: "Word",
  xlsx: "Excel",
  csv: "CSV",
  txt: "Texte",
  unsupported: "",
};

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Je suis Édouard. Ne le prends pas pour toi, je m'exprime de manière ferme, assertive et juste. Mon travail est de te dire la vérité business, pas de te flatter.\n\nAvant de commencer, j'ai besoin de savoir où tu en es. Choisis le profil qui te correspond :\n\n- **A. Novice** — \"C'est mon tout premier projet, je pars de zéro\"\n- **B. Intermédiaire** — \"J'ai déjà lancé un projet, je connais les bases\"\n- **C. Confirmé** — \"J'ai plusieurs projets à mon actif, je veux aller vite\"",
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({
  messages,
  stepContext,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: string; content: string }[];
  stepContext: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, stepContext }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Erreur de connexion au service IA");
    return;
  }

  if (!resp.body) {
    onError("Pas de réponse du service IA");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
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
}: ChatPanelProps) => {
  // Build display messages from persisted + welcome
  const displayMessages: Message[] = persistedMessages.length > 0
    ? persistedMessages.map((m) => ({ id: m.id, role: m.role, content: m.content }))
    : [WELCOME_MESSAGE];

  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isListening, transcript, interimTranscript, isSupported: isSpeechSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition({
    onPermissionDenied: () => {
      toast.warning("Accès au microphone refusé. Autorisez le micro dans les paramètres de votre navigateur.");
    },
  });

  // Append finalized speech transcript to input
  useEffect(() => {
    if (transcript) {
      setInput(prev => {
        const separator = prev && !prev.endsWith(" ") ? " " : "";
        return prev + separator + transcript;
      });
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const handleMicDown = () => {
    if (!isLoading && !isParsing) startListening();
  };

  const handleMicUp = () => {
    stopListening();
  };

  const allMessages = streamingMessage
    ? [...displayMessages, streamingMessage]
    : displayMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = getFileType(file);
    if (type === "unsupported") {
      toast.error("Format non pris en charge. Utilisez un fichier PDF, Word (.docx), Excel (.xlsx), CSV ou texte (.txt).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (10 Mo maximum).");
      return;
    }

    setPendingFile({ file, name: file.name, type });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePendingFile = () => setPendingFile(null);

  const handleSend = async () => {
    if (isLoading || isParsing) return;
    if (!input.trim() && !pendingFile) return;

    let messageContent = input.trim();

    if (pendingFile) {
      setIsParsing(true);
      try {
        const { text } = await parseDocument(pendingFile.file);
        const truncated = truncateIfNeeded(text);
        const fileHeader = `📎 **Document joint : ${pendingFile.name}**\n\n---\n\n`;
        const userComment = messageContent ? `\n\n---\n\n**Mon commentaire :** ${messageContent}` : "";
        messageContent = `${fileHeader}${truncated}${userComment}`;
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de la lecture du document.");
        setIsParsing(false);
        return;
      }
      setIsParsing(false);
      setPendingFile(null);
    }

    if (!messageContent) return;

    // Ensure we have a conversation
    let convId = conversationId;
    if (!convId) {
      // Auto-create a conversation with first 50 chars as title
      const title = messageContent.slice(0, 50).replace(/\n/g, " ");
      convId = await onCreateConversation(title);
      if (!convId) return;
    }

    // Auto-title: if this is the first user message, update conversation title
    const userMsgCount = persistedMessages.filter((m) => m.role === "user").length;
    if (userMsgCount === 0) {
      const title = messageContent.slice(0, 60).replace(/\n/g, " ");
      onUpdateTitle(convId, title);
    }

    // Save user message to DB
    const userMsgId = await saveMessage(convId, "user", messageContent);
    if (!userMsgId) return;

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    // Build messages for AI (include welcome as system-like context)
    const aiMessages = [
      ...persistedMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: messageContent },
    ];

    let assistantSoFar = "";
    let assistantDbId: string | null = null;

    try {
      await streamChat({
        messages: aiMessages,
        stepContext,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setStreamingMessage({ id: "streaming", role: "assistant", content: assistantSoFar });
          const step = detectStep(assistantSoFar);
          if (step !== null && onStepDetected) onStepDetected(step);
          // Detect chosen conversation name
          const chosenName = detectChosenName(assistantSoFar);
          if (chosenName && convId) {
            onUpdateTitle(convId, chosenName);
          }
        },
        onDone: async () => {
          // Save assistant message
          if (convId && assistantSoFar) {
            assistantDbId = await saveMessage(convId, "assistant", assistantSoFar);
          }
          setStreamingMessage(null);
          setIsLoading(false);
        },
        onError: (error) => {
          toast.error(error);
          setStreamingMessage(null);
          setIsLoading(false);
        },
      });
    } catch (e) {
      console.error(e);
      toast.error("Erreur de connexion. Réessaie.");
      setStreamingMessage(null);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {allMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 animate-fade-in",
                msg.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                  msg.role === "assistant" ? "gradient-primary" : "bg-accent"
                )}
              >
                {msg.role === "assistant" ? (
                  <Brain className="w-3.5 h-3.5 text-primary-foreground" />
                ) : (
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "bg-card text-foreground border border-border/50 prose prose-sm prose-invert max-w-none"
                    : "bg-primary/15 text-foreground whitespace-pre-wrap"
                )}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {isLoading && !streamingMessage && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                <Brain className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border/50 rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}

          {/* PDF Download button at step 9 */}
          {currentStep === 8 && persistedMessages.length > 0 && !isLoading && (
            <div className="flex justify-center animate-fade-in py-4">
              <button
                onClick={() => {
                  const name = conversationTitle || "Analyse";
                  generateSynthesisReport({
                    projectName: name,
                    messages: persistedMessages.map((m) => ({ role: m.role, content: m.content })),
                  });
                  toast.success("Rapport PDF téléchargé !");
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                <Download className="w-4 h-4" />
                Télécharger la synthèse PDF
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        {pendingFile && (
          <div className="max-w-3xl mx-auto mb-2">
            <div className="inline-flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span className="truncate max-w-[200px]">{pendingFile.name}</span>
              <span className="text-muted-foreground">({fileTypeLabels[pendingFile.type]})</span>
              <button
                onClick={removePendingFile}
                className="text-muted-foreground hover:text-destructive transition-colors ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.xlsx,.csv,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain,text/markdown"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isParsing}
            className="p-3 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-40"
            title="Joindre un document (PDF, Word, Excel, CSV, Texte)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={isListening ? input + (interimTranscript ? (input ? " " : "") + interimTranscript : "") : input}
            onChange={(e) => { if (!isListening) setInput(e.target.value); }}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "🎙️ Parlez maintenant…" : isParsing ? "Analyse du document en cours…" : pendingFile ? "Ajoutez un commentaire (optionnel)…" : "Décris ton idée de business..."}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-card border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all",
              isListening ? "border-primary/60 ring-1 ring-primary/30" : "border-border"
            )}
            readOnly={isListening}
            disabled={isParsing}
          />
          {isSpeechSupported && (
            <div className="relative shrink-0">
              {isListening && (
                <span className="absolute inset-0 rounded-xl bg-destructive/30 animate-pulse pointer-events-none" />
              )}
              <button
                type="button"
                onPointerDown={handleMicDown}
                onPointerUp={handleMicUp}
                onPointerLeave={handleMicUp}
                onContextMenu={(e) => e.preventDefault()}
                disabled={isLoading || isParsing}
                className={cn(
                  "p-3 rounded-xl relative z-10 transition-colors select-none touch-none disabled:opacity-40",
                  isListening
                    ? "text-destructive bg-destructive/10 hover:bg-destructive/15"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
                title="Maintenez pour dicter"
              >
                {isListening ? (
                  <div className="flex items-center justify-center gap-[3px]">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className="w-[3px] rounded-full bg-destructive animate-pulse"
                        style={{
                          height: "14px",
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !pendingFile) || isLoading || isParsing}
            className="gradient-primary text-primary-foreground p-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed glow-primary"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
