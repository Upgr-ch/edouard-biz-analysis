import { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Paperclip, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseDocument, getFileType, truncateIfNeeded, type SupportedFileType } from "@/lib/documentParser";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  stepContext: string;
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

const ChatPanel = ({ stepContext }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Bienvenue. Je suis Édouard. Avant toute analyse, j'ai besoin de comprendre ton projet. Décris-moi ton idée en quelques phrases : qu'est-ce que tu veux créer ou vendre, et quel problème ça résout ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const removePendingFile = () => {
    setPendingFile(null);
  };

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

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    // Simulated response for now
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Je note ton idée. Pour avancer dans l'analyse, j'ai besoin de précisions sur ta stratégie d'acquisition client — c'est le facteur numéro un de viabilité. Comment comptes-tu concrètement atteindre tes premiers clients dans les 30 premiers jours ?",
      };
      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
    }, 1500);
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
          {messages.map((msg) => (
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
                  "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "assistant"
                    ? "bg-card text-foreground border border-border/50"
                    : "bg-primary/15 text-foreground"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
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
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        {/* Pending file indicator */}
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
          {/* File upload button */}
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={isParsing ? "Analyse du document en cours…" : pendingFile ? "Ajoutez un commentaire (optionnel)…" : "Décris ton idée de business..."}
            rows={1}
            className="flex-1 resize-none bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            disabled={isParsing}
          />
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
