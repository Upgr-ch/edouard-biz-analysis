import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Brain, User, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import {
  ANON_MAX_MESSAGES,
  appendAnonMessage,
  getAnonMessages,
  getAnonUserMessageCount,
  setPendingMessage,
} from "@/lib/anonymousChat";

const ChatPanel = ({
  conversationId,
  persistedMessages = [],
  saveMessage,
  onCreateConversation,
  isQuotaReached = false,
  nextMessageNumber = 1
}: any) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAnonymous = !user;

  // Initialisation des messages
  const [anonMessages, setAnonMessages] = useState<any[]>(() =>
    getAnonMessages().map((m, i) => ({ ...m, id: `anon-${i}`, number: i + 1 }))
  );

  const [streamingMessage, setStreamingMessage] = useState<any>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fusion des messages pour l'affichage
  const displayMessages = isAnonymous
    ? (anonMessages.length > 0 ? anonMessages : [{ id: "welcome", role: "assistant", content: "Bonjour, je suis Édouard. Je vais analyser ton projet.", number: 0 }])
    : persistedMessages.map((m: any, i: number) => ({ ...m, number: i + 1 }));

  const allMessages = streamingMessage ? [...displayMessages, streamingMessage] : displayMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSend = async () => {
    if (isLoading || isQuotaReached || !input.trim()) return;

    const messageContent = input.trim();
    
    // Barrière d'inscription au 6ème message
    if (isAnonymous && getAnonUserMessageCount() >= ANON_MAX_MESSAGES) {
      setPendingMessage(messageContent);
      toast.info("Crée ton compte pour voir la suite !");
      navigate("/auth");
      return;
    }

    setInput("");
    setIsLoading(true);

    if (isAnonymous) {
      appendAnonMessage("user", messageContent);
      const updated = getAnonMessages().map((m, i) => ({ ...m, id: `anon-${i}`, number: i + 1 }));
      setAnonMessages(updated);
      
      // Simulation IA simple pour le test
      setTimeout(() => {
        appendAnonMessage("assistant", "Analyse en cours... Inscris-toi pour débloquer mon expertise complète.");
        setAnonMessages(getAnonMessages().map((m, i) => ({ ...m, id: `anon-${i}`, number: i + 1 })));
        setIsLoading(false);
      }, 1000);
    } else {
      let convId = conversationId;
      if (!convId) convId = await onCreateConversation(messageContent.slice(0, 30));
      await saveMessage(convId, "user", messageContent);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Flux de messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {allMessages.map((msg: any, idx: number) => (
            <div key={msg.id || idx} className={cn("flex flex-col animate-fade-in", msg.role === "user" ? "items-end" : "items-start")}>
              
              {/* NUMÉROTATION VISIBLE PAR L'UTILISATEUR */}
              <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1 px-1 tracking-tighter">
                {msg.role === "assistant" ? "Édouard" : "Vous"} — Message #{msg.number ?? (idx + 1)}
              </span>

              <div className={cn("flex gap-3 w-full", msg.role === "user" ? "flex-row-reverse" : "")}>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm", msg.role === "assistant" ? "bg-primary text-white" : "bg-muted")}>
                  {msg.role === "assistant" ? <Brain size={16} /> : <User size={16} />}
                </div>

                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm", 
                  msg.role === "assistant" ? "bg-card border border-border" : "bg-primary/10 border border-primary/5"
                )}>
                  {msg.role === "assistant" ? (
                    /* FIX: div parente pour éviter l'erreur de ReactMarkdown */
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Barre de saisie */}
      <div className="p-4 border-t border-border bg-card/30 backdrop-blur-md">
        <div className={cn(
          "flex items-end gap-2 max-w-3xl mx-auto p-2 rounded-2xl border transition-all",
          isQuotaReached ? "opacity-50 bg-muted" : "bg-background shadow-inner border-border focus-within:border-primary/50"
        )}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={isQuotaReached ? "Limite journalière atteinte." : "Échange