import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Brain, User, Lock } from "lucide-react";
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

// 1. LE VRAI MESSAGE D'ACCUEIL D'EDOUARD
const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Je suis Édouard. Je m'exprime de manière ferme et juste. Mon travail est de te dire la vérité business.\n\nChoisis ton profil :\n\n- **A. Novice**\n- **B. Intermédiaire**\n- **C. Confirmé**",
  number: 0,
};

const ChatPanel = ({
  conversationId,
  persistedMessages = [],
  saveMessage,
  onCreateConversation,
  isQuotaReached = false,
}: any) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAnonymous = !user;

  // Calcul du nombre de messages restants pour l'anonyme
  const anonCount = getAnonUserMessageCount();
  const messagesLeft = Math.max(0, ANON_MAX_MESSAGES - anonCount);

  const [anonMessages, setAnonMessages] = useState<any[]>(() =>
    getAnonMessages().map((m, i) => ({ ...m, id: `anon-${i}`, number: i + 1 })),
  );

  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayMessages = isAnonymous
    ? anonMessages.length > 0
      ? anonMessages
      : [WELCOME_MESSAGE]
    : persistedMessages.length > 0
      ? persistedMessages.map((m: any, i: number) => ({ ...m, number: i + 1 }))
      : [WELCOME_MESSAGE];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const handleSend = async () => {
    if (isLoading || isQuotaReached || !input.trim()) return;
    const content = input.trim();

    if (isAnonymous && anonCount >= ANON_MAX_MESSAGES) {
      setPendingMessage(content);
      toast.info("Crée un compte pour continuer après tes 5 messages gratuits.");
      navigate("/auth");
      return;
    }

    setInput("");
    setIsLoading(true);

    if (isAnonymous) {
      appendAnonMessage("user", content);
      setTimeout(() => {
        appendAnonMessage("assistant", "Bien reçu. Je traite l'information pour ton profil.");
        setAnonMessages(getAnonMessages().map((m, i) => ({ ...m, id: `anon-${i}`, number: i + 1 })));
        setIsLoading(false);
      }, 800);
    } else {
      let convId = conversationId;
      if (!convId) convId = await onCreateConversation(content.slice(0, 30));
      await saveMessage(convId, "user", content);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {displayMessages.map((msg: any, idx: number) => (
            <div
              key={msg.id || idx}
              className={cn("flex flex-col animate-fade-in", msg.role === "user" ? "items-end" : "items-start")}
            >
              <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1 px-1">
                {msg.role === "assistant" ? "Édouard" : "Vous"} — Message #{msg.number ?? idx}
              </span>

              <div className={cn("flex gap-3 w-full", msg.role === "user" ? "flex-row-reverse" : "")}>
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                    msg.role === "assistant" ? "bg-primary text-white" : "bg-muted",
                  )}
                >
                  {msg.role === "assistant" ? <Brain size={16} /> : <User size={16} />}
                </div>

                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                    msg.role === "assistant" ? "bg-card border border-border" : "bg-primary/10",
                  )}
                >
                  {msg.role === "assistant" ? (
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

      {/* ZONE DE SAISIE AVEC LE COMPTEUR DE MESSAGES GRATUITS */}
      <div className="p-4 border-t border-border bg-card/30">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-background p-2 rounded-2xl border shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Réponds à Édouard..."
              className="flex-1 min-h-[40px] bg-transparent border-none focus:ring-0 text-sm py-2 resize-none outline-none"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-primary text-white p-2.5 rounded-xl transition-transform active:scale-95"
            >
              <Send size={16} />
            </button>
          </div>

          {/* LA MENTION DES MESSAGES RESTANTS */}
          {isAnonymous && (
            <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-muted-foreground font-medium">
              <Lock size={12} className="text-orange-500" />
              <span>
                Il te reste <span className="text-foreground font-bold">{messagesLeft} messages</span> gratuits
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
