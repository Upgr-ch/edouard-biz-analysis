import { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import * as AnonChat from "@/lib/anonymousChat";
import WelcomeScreen from "./WelcomeScreen";

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

const ChatPanel = ({ conversationId, persistedMessages = [], saveMessage, onCreateConversation }: any) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getAnonMessages = () => (AnonChat as any).getAnonMessages?.() || [];
  const isAnonymous = !user;
  const displayMessages = isAnonymous ? getAnonMessages() : persistedMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isLoading]);

  const handleManualSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Session terminée");
    navigate("/");
    window.location.reload();
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    setInput("");
    setIsLoading(true);

    try {
      if (isAnonymous) {
        if ((AnonChat as any).appendAnonMessage) (AnonChat as any).appendAnonMessage("user", messageText);
        const { data } = await supabase.functions.invoke("eugene-chat", {
          body: { messages: [...getAnonMessages(), { role: "user", content: messageText }] },
        });
        if (data?.content && (AnonChat as any).appendAnonMessage)
          (AnonChat as any).appendAnonMessage("assistant", data.content);
      } else {
        let currentId = conversationId;
        if (!currentId && onCreateConversation) currentId = await onCreateConversation(messageText.substring(0, 30));
        if (saveMessage && currentId) {
          await saveMessage(currentId, "user", messageText);
          const { data } = await supabase.functions.invoke("eugene-chat", {
            body: { messages: [...persistedMessages, { role: "user", content: messageText }] },
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

  // --- LOGIQUE DU POPUP D'ACCUEIL ---
  // Si aucune conversation n'est lancée (pas de messages), on affiche le WelcomeScreen
  if (displayMessages.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1">
          <WelcomeScreen onSendMessage={handleSend} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background relative">
      {/* BOUTON DÉCONNEXION */}
      {user && (
        <button
          onClick={handleManualSignOut}
          className="absolute top-4 right-4 z-50 text-[9px] font-mono font-bold text-red-600 border border-red-600/30 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition-all bg-background/80"
        >
          DÉCONNEXION (TEMP)
        </button>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6 pt-12">
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
                  <ReactMarkdown className="prose prose-sm dark:prose-invert">{msg.content}</ReactMarkdown>
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
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none h-10 py-2"
            />
            <button onClick={() => handleSend()} className="bg-primary text-white p-2 rounded-lg">
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
