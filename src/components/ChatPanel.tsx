import { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Imports sécurisés des fonctions anonymes
import * as AnonChat from "@/lib/anonymousChat";

// LE VRAI MESSAGE D'ACCUEIL ORIGINAL
const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: `Je suis Édouard. Ne le prends pas pour toi, je m'exprime de manière ferme, assertive et juste. Mon travail est de te dire la vérité business, pas de te flatter.\n\nAvant de commencer, j'ai besoin de savoir où tu en es. Cela me permet d'adapter mon langage pour être le plus efficace possible.\n\nChoisis le profil qui te correspond :\n\n**A. Novice** — "C'est mon tout premier projet, je pars de zéro"\n**B. Intermédiaire** — "J'ai déjà lancé un projet, je connais les bases"\n**C. Confirmé** — "J'ai plusieurs projets à mon actif, je veux aller vite"\n\nQuel est ton niveau ?`,
  number: 0,
};

const ChatPanel = ({
  conversationId,
  conversationTitle,
  persistedMessages = [],
  saveMessage,
  onCreateConversation,
  onUpdateTitle,
}: any) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getAnonMessages = () => (AnonChat as any).getAnonMessages?.() || [];
  const getAnonCount = () => (AnonChat as any).getAnonUserMessageCount?.() || 0;
  const maxAnon = (AnonChat as any).ANON_MAX_MESSAGES || 6;

  const isAnonymous = !user;
  const messagesLeft = Math.max(0, maxAnon - getAnonCount());

  const displayMessages = isAnonymous
    ? getAnonMessages().length > 0
      ? getAnonMessages().map((m: any, i: number) => ({ ...m, id: `anon-${i}`, number: i + 1 }))
      : [WELCOME_MESSAGE]
    : persistedMessages.length > 0
      ? persistedMessages.map((m: any, i: number) => ({ ...m, number: i + 1 }))
      : [WELCOME_MESSAGE];

  useEffect(() => {
    if (conversationId && displayMessages.length >= 2 && onUpdateTitle) {
      const firstUserMsg = displayMessages.find((m: any) => m.role === "user");
      if (firstUserMsg && (!conversationTitle || conversationTitle.includes("Nouvelle"))) {
        const newTitle = firstUserMsg.content.substring(0, 30) + "...";
        onUpdateTitle(conversationId, newTitle);
      }
    }
  }, [displayMessages.length, conversationId, conversationTitle, onUpdateTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const currentCount = getAnonCount();

    // Redirection vers l'inscription si quota atteint
    if (isAnonymous && currentCount >= maxAnon) {
      toast.error("Quota atteint. Inscris-toi pour continuer !");
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1500);
      return;
    }

    const userContent = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      if (isAnonymous) {
        if ((AnonChat as any).appendAnonMessage) {
          (AnonChat as any).appendAnonMessage("user", userContent);
        }
        const { data, error } = await supabase.functions.invoke("eugene-chat", {
          body: { messages: [...getAnonMessages(), { role: "user", content: userContent }] },
        });
        if (error) throw error;
        if (data?.content && (AnonChat as any).appendAnonMessage) {
          (AnonChat as any).appendAnonMessage("assistant", data.content);
        }
      } else {
        let currentId = conversationId;
        if (!currentId && onCreateConversation) {
          currentId = await onCreateConversation(userContent.substring(0, 30));
        }
        if (saveMessage && currentId) {
          await saveMessage(currentId, "user", userContent);
        }
        if (currentId) {
          const history = [
            ...persistedMessages.map((m: any) => ({ role: m.role, content: m.content })),
            { role: "user", content: userContent },
          ];
          const { data, error } = await supabase.functions.invoke("eugene-chat", {
            body: { messages: history },
          });
          if (error) throw error;
          if (data?.content && saveMessage) {
            await saveMessage(currentId, "assistant", data.content);
          }
        }
      }
    } catch (error: any) {
      toast.error("Édouard a eu un problème technique.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {displayMessages.map((msg: any, idx: number) => (
            <div key={idx} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
              <span className="text-[10px] font-bold text-muted-foreground mb-2 tracking-widest uppercase">
                {msg.role === "assistant" ? "Édouard" : "Vous"}
              </span>
              <div className={cn("flex gap-4 w-full", msg.role === "user" ? "flex-row-reverse" : "")}>
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
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-5 py-4 text-[15px] border shadow-sm",
                    msg.role === "assistant" ? "bg-card border-border/50" : "bg-primary/10 border-primary/20",
                  )}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="animate-pulse italic text-xs text-muted-foreground flex items-center gap-2">
              <Brain size={14} className="animate-spin" /> Édouard analyse...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-6 border-t bg-card/50 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-background p-3 rounded-2xl border shadow-lg">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Réponds à Édouard..."
              className="flex-1 min-h-[45px] max-h-32 bg-transparent border-none focus:ring-0 resize-none outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-primary text-primary-foreground p-3 rounded-xl disabled:opacity-50"
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
