import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Brain, User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { ANON_MAX_MESSAGES, getAnonMessages, getAnonUserMessageCount } from "@/lib/anonymousChat";

// LE MESSAGE D'ACCUEIL MIS À JOUR
const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: `Je suis Édouard. Ne le prends pas pour toi, je m'exprime de manière ferme, assertive et juste. Mon travail est de te dire la vérité business, pas de te flatter.\n\nAvant de commencer, j'ai besoin de savoir où tu en es. Choisis le profil qui te correspond :\n\n**A. Novice** — "C'est mon tout premier projet, je pars de zéro"\n**B. Intermédiaire** — "J'ai déjà lancé un projet, je connais les bases"\n**C. Confirmé** — "J'ai plusieurs projets à mon actif, je veux aller vite"`,
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

  const anonCount = getAnonUserMessageCount();
  const messagesLeft = Math.max(0, ANON_MAX_MESSAGES - anonCount);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Détermination des messages à afficher
  const displayMessages = isAnonymous
    ? getAnonMessages().length > 0
      ? getAnonMessages().map((m, i) => ({ ...m, id: `anon-${i}`, number: i + 1 }))
      : [WELCOME_MESSAGE]
    : persistedMessages.length > 0
      ? persistedMessages.map((m: any, i: number) => ({ ...m, number: i + 1 }))
      : [WELCOME_MESSAGE];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  return (
    <div className="flex flex-col h-full bg-background font-sans">
      {/* Liste des Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {displayMessages.map((msg: any, idx: number) => (
            <div
              key={msg.id || idx}
              className={cn("flex flex-col animate-fade-in", msg.role === "user" ? "items-end" : "items-start")}
            >
              {/* Numérotation des messages */}
              <span className="text-[10px] font-bold text-muted-foreground uppercase mb-2 px-1 tracking-widest">
                {msg.role === "assistant" ? "Édouard" : "Vous"} — Message #{msg.number ?? idx}
              </span>

              <div className={cn("flex gap-4 w-full", msg.role === "user" ? "flex-row-reverse" : "")}>
                {/* Avatar Édouard vs Utilisateur */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md",
                    msg.role === "assistant"
                      ? "bg-gradient-to-br from-indigo-600 to-violet-700 text-white"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {msg.role === "assistant" ? <Brain size={20} /> : <User size={20} />}
                </div>

                {/* Bulle de texte */}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-sm border",
                    msg.role === "assistant"
                      ? "bg-card border-border/50 text-foreground"
                      : "bg-primary/10 border-primary/20 text-foreground",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
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
      <div className="p-6 border-t border-border bg-card/50 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto">
          <div
            className={cn(
              "flex items-end gap-3 bg-background p-3 rounded-2xl border border-border shadow-lg transition-all",
              isQuotaReached ? "opacity-50" : "focus-within:ring-2 ring-primary/20",
            )}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isQuotaReached}
              placeholder={isQuotaReached ? "Quota atteint..." : "Réponds à Édouard..."}
              className="flex-1 min-h-[45px] max-h-32 bg-transparent border-none focus:ring-0 text-[15px] py-2 resize-none outline-none"
            />
            <button
              disabled={isQuotaReached || !input.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>

          {isAnonymous && (
            <div className="flex items-center justify-center gap-2 mt-4 text-[12px] text-muted-foreground font-medium">
              <Lock size={14} className="text-amber-500" />
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
