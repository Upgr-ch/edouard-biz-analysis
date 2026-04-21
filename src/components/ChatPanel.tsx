import { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

// Imports sécurisés des fonctions anonymes
import * as AnonChat from "@/lib/anonymousChat";

// --- COMPOSANT FOOTER ---
const Footer = () => (
  <footer className="w-full py-4 border-t bg-background/50">
    <div className="max-w-3xl mx-auto px-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
      <Link to="/mentions-legales" className="hover:text-primary transition-colors">
        Mentions Légales
      </Link>
      <Link to="/cgu" className="hover:text-primary transition-colors">
        CGU
      </Link>
      <Link to="/cgv" className="hover:text-primary transition-colors">
        CGV
      </Link>
      <Link to="/confidentialite" className="hover:text-primary transition-colors">
        Confidentialité
      </Link>
      <span className="opacity-50 ml-2">&copy; {new Date().getFullYear()} Édouard</span>
    </div>
  </footer>
);

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: `Bonjour. Pour commencer, je dois comprendre ton niveau. Dis-moi, tu te situes où ?\n\n**A. Novice** — "C'est mon tout premier projet, je pars de zéro"\n\n**B. Intermédiaire** — "J'ai déjà lancé un projet, je connais les bases"\n\n**C. Confirmé** — "J'ai plusieurs projets à mon actif, je veux aller vite"\n\nSi tu as un doute ou besoin de pistes concrètes pour trancher, réponds simplement **'Aide-moi'** et je te proposerai trois options stratégiques adaptées à ton projet.`,
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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const syncProcessed = useRef(false);

  const getAnonMessages = () => (AnonChat as any).getAnonMessages?.() || [];
  const getAnonCount = () => (AnonChat as any).getAnonUserMessageCount?.() || 0;
  const maxAnon = (AnonChat as any).ANON_MAX_MESSAGES || 6;

  const isAnonymous = !user;
  const messagesLeft = Math.max(0, maxAnon - getAnonCount());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [persistedMessages, isLoading]);

  const handleManualSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
    window.location.reload();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const currentCount = getAnonCount();

    if (isAnonymous && currentCount >= maxAnon) {
      toast.error("Quota atteint. Inscris-toi gratuitement !");
      setTimeout(() => navigate("/auth"), 1500);
      return;
    }

    let userContent = input.trim();
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
          const history = [
            ...persistedMessages.map((m: any) => ({ role: m.role, content: m.content })),
            { role: "user", content: userContent },
          ];
          const { data, error } = await supabase.functions.invoke("eugene-chat", {
            body: { messages: history },
          });
          if (error) throw error;
          if (data?.content) await saveMessage(currentId, "assistant", data.content);
        }
      }
    } catch (error: any) {
      toast.error("Édouard est momentanément indisponible.");
    } finally {
      setIsLoading(false);
    }
  };

  const displayMessages = isAnonymous
    ? getAnonMessages().length > 0
      ? getAnonMessages()
      : [WELCOME_MESSAGE]
    : persistedMessages.length > 0
      ? persistedMessages
      : [WELCOME_MESSAGE];

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {!isAnonymous && (
        <button
          onClick={handleManualSignOut}
          className="fixed top-4 right-4 z-[9999] px-3 py-1 text-[10px] bg-red-500/20 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-md transition-all font-mono uppercase font-bold"
        >
          Déconnexion (temp)
        </button>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
          {displayMessages.map((msg: any, idx: number) => (
            <div key={idx} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
              <span className="text-[10px] font-bold text-muted-foreground mb-2 tracking-widest uppercase">
                {msg.role === "assistant" ? "Édouard" : "Vous"}
              </span>
              <div className={cn("flex gap-4 w-full", msg.role === "user" ? "flex-row-reverse" : "")}>
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    msg.role === "assistant" ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground",
                  )}
                >
                  {msg.role === "assistant" ? <Brain size={20} /> : <User size={20} />}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-5 py-4 text-[15px] border shadow-sm",
                    msg.role === "assistant" ? "bg-card border-border" : "bg-primary/10 border-primary/20",
                  )}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && <div className="animate-pulse italic text-xs text-muted-foreground">Édouard analyse...</div>}
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
              placeholder="Réponse"
              className="flex-1 min-h-[45px] max-h-32 bg-transparent border-none focus:ring-0 text-[15px] py-2 resize-none outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-primary text-primary-foreground p-3 rounded-xl shadow-md disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
          {isAnonymous && (
            <div className="flex items-center justify-center gap-2 mt-4 text-[12px] text-muted-foreground font-medium">
              <Lock size={14} className="text-amber-500" />
              <span>Il te reste {messagesLeft} messages avant inscription gratuite</span>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChatPanel;
