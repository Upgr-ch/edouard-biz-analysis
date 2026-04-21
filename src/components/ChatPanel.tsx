import { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import * as AnonChat from "@/lib/anonymousChat";

// --- COMPOSANT FOOTER ---
const Footer = () => (
  <footer className="w-full py-4 border-t bg-background/50 mt-auto">
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
  role: "assistant",
  content: `Bonjour. Pour commencer, je dois comprendre ton niveau. Dis-moi, tu te situes où ?\n\n**A. Novice** — "C'est mon tout premier projet, je pars de zéro"\n\n**B. Intermédiaire** — "J'ai déjà lancé un projet, je connais les bases"\n\n**C. Confirmé** — "J'ai plusieurs projets à mon actif, je veux aller vite"\n\nSi tu as un doute ou besoin de pistes concrètes pour trancher, réponds simplement **'Aide-moi'** et je te proposerai trois options stratégiques adaptées à ton projet.`,
};

const ChatPanel = ({ conversationId, persistedMessages = [], saveMessage, onCreateConversation }: any) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getAnonMessages = () => (AnonChat as any).getAnonMessages?.() || [];
  const isAnonymous = !user;

  // Fusion des messages : si vide, on met le message d'accueil
  const rawMessages = isAnonymous ? getAnonMessages() : persistedMessages;
  const displayMessages = rawMessages.length === 0 ? [WELCOME_MESSAGE] : rawMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isLoading]);

  const handleManualSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Session terminée");
    navigate("/");
    window.location.reload();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let userContent = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      if (isAnonymous) {
        if ((AnonChat as any).appendAnonMessage) (AnonChat as any).appendAnonMessage("user", userContent);
        const { data } = await supabase.functions.invoke("eugene-chat", {
          body: { messages: [...getAnonMessages(), { role: "user", content: userContent }] },
        });
        if (data?.content && (AnonChat as any).appendAnonMessage)
          (AnonChat as any).appendAnonMessage("assistant", data.content);
      } else {
        let currentId = conversationId;
        if (!currentId && onCreateConversation) {
          currentId = await onCreateConversation(userContent.substring(0, 30));
        }
        if (saveMessage && currentId) {
          await saveMessage(currentId, "user", userContent);
          const { data } = await supabase.functions.invoke("eugene-chat", {
            body: { messages: [...persistedMessages, { role: "user", content: userContent }] },
          });
          if (data?.content) await saveMessage(currentId, "assistant", data.content);
        }
      }
    } catch (e) {
      toast.error("Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background relative">
      {/* BOUTON DÉCONNEXION TEMPORAIRE */}
      {user && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={handleManualSignOut}
            className="px-2 py-1 text-[9px] bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white border border-red-500/30 rounded transition-all font-mono uppercase font-bold"
          >
            Déconnexion (temp)
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6 pt-12 pb-12">
          {displayMessages.map((msg: any, i: number) => (
            <div key={i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
              <div className={cn("flex gap-3 max-w-[85%]", msg.role === "user" ? "flex-row-reverse" : "")}>
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === "assistant" ? "bg-indigo-600 text-white" : "bg-muted",
                  )}
                >
                  {msg.role === "assistant" ? <Brain size={18} /> : <User size={18} />}
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm border shadow-sm",
                    msg.role === "assistant" ? "bg-card" : "bg-primary/5",
                  )}
                >
                  <div className="prose prose-sm dark:prose-invert">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-background border-t">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 bg-muted/50 p-2 rounded-xl border">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Écrivez ici..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none h-10 py-2 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-primary text-white p-2 rounded-lg disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChatPanel;
