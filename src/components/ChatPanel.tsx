import { useState, useRef, useEffect } from "react";
import { Send, Brain, User, ArrowRight, Check, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import * as AnonChat from "@/lib/anonymousChat";

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
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAnonymous = !user;
  const displayMessages = isAnonymous ? (AnonChat as any).getAnonMessages?.() || [] : persistedMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isLoading]);

  const handleForceSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    } catch (error) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const startConversation = async () => {
    setDisclaimerAccepted(true);
    setIsLoading(true);
    try {
      // PROMPT MIS À JOUR AVEC TON TEXTE EXACT ET FORÇAGE DE LIGNE
      const initialPrompt = `Tu es Édouard. Tu dois répondre EXACTEMENT ceci, avec un saut de ligne entre chaque option A, B et C :

Je suis Édouard, consultant senior spécialisé en faisabilité et rentabilité de projets. Je suis là pour analyser ton projet sans concession et te dire ce qu'il en est, objectivement.

Très bien. Avant de commencer, dis-moi quel est ton niveau pour ce projet :

A. Novice — "C'est mon tout premier projet, je pars de zéro"

B. Intermédiaire — "J'ai déjà lancé un projet, je connais les bases"

C. Confirmé — "J'ai plusieurs projets à mon actif, je veux aller vite"

Si tu as un doute ou besoin de pistes concrètes pour trancher, réponds simplement 'Aide-moi' et je te proposerai trois options stratégiques (A, B ou C) adaptées à ton projet.`;

      if (isAnonymous) {
        const { data } = await supabase.functions.invoke("eugene-chat", {
          body: { messages: [{ role: "user", content: initialPrompt }] },
        });
        if (data?.content && (AnonChat as any).appendAnonMessage) {
          (AnonChat as any).appendAnonMessage("assistant", data.content);
        }
      } else {
        let currentId = conversationId;
        if (!currentId && onCreateConversation) currentId = await onCreateConversation("Analyse de projet");
        const { data } = await supabase.functions.invoke("eugene-chat", {
          body: { messages: [{ role: "user", content: initialPrompt }] },
        });
        if (data?.content && saveMessage && currentId) await saveMessage(currentId, "assistant", data.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    let content = input.trim();
    setInput("");
    setIsLoading(true);
    try {
      if (isAnonymous) {
        if ((AnonChat as any).appendAnonMessage) (AnonChat as any).appendAnonMessage("user", content);
        const { data } = await supabase.functions.invoke("eugene-chat", {
          body: { messages: [...((AnonChat as any).getAnonMessages?.() || []), { role: "user", content }] },
        });
        if (data?.content && (AnonChat as any).appendAnonMessage)
          (AnonChat as any).appendAnonMessage("assistant", data.content);
      } else {
        let currentId = conversationId;
        if (!currentId && onCreateConversation) currentId = await onCreateConversation(content.substring(0, 30));
        if (saveMessage && currentId) {
          await saveMessage(currentId, "user", content);
          const { data } = await supabase.functions.invoke("eugene-chat", {
            body: { messages: [...persistedMessages, { role: "user", content }] },
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
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      {/* BOUTON RESET SESSION MAINTENU EN HAUT À GAUCHE */}
      <div className="fixed top-2 left-2 z-[100] opacity-50 hover:opacity-100 transition-opacity">
        <button
          onClick={handleForceSignOut}
          className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-800 text-red-100 px-2 py-1.5 rounded-md text-[9px] font-bold uppercase border border-red-500/20"
        >
          <LogOut size={12} /> Reset Session
        </button>
      </div>

      {!disclaimerAccepted && displayMessages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-start md:justify-center p-6 bg-[#0B0E14] text-slate-200 overflow-y-auto">
          <div className="max-w-2xl w-full bg-[#161B22] border border-slate-800 rounded-3xl p-10 shadow-2xl space-y-8 my-12 animate-in fade-in zoom-in duration-500">
            <div className="space-y-1.5">
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Je suis <span className="text-indigo-500">Édouard.</span>
              </h1>
              <p className="text-slate-400 text-lg">Consultant en faisabilité et rentabilité de projets business.</p>
            </div>

            <div className="space-y-6 text-slate-300 leading-relaxed text-[15px]">
              <p>Je vais t'aider à analyser ton idée de business avec structure et honnêteté.</p>
              <p>
                Je m'exprime de manière <span className="font-semibold text-white">ferme, assertive et juste</span>, ne
                le prends pas pour toi. Mon travail est de te dire la vérité business, pas de te flatter.
              </p>
              <p>
                Si ton idée n'est pas viable, je te le dirai clairement. Si elle est améliorable, je t'expliquerai
                comment.
              </p>
              <p className="text-[#3b82f6] font-medium text-[15px]">
                Ma mission est de te faire gagner du temps et d'éviter les erreurs coûteuses.
              </p>

              <div className="pl-4 border-l-2 border-indigo-500/40 py-1 text-slate-400 text-[13px] italic bg-indigo-500/5">
                J'utilise uniquement des données réelles et vérifiables issues du web. Je n'invente jamais de chiffres,
                de marché ou de tendances. Si une information fiable n'est pas disponible, je le dis clairement.
              </div>
            </div>

            <div
              onClick={() => setIsChecked(!isChecked)}
              className={cn(
                "p-6 rounded-2xl border transition-all cursor-pointer flex gap-4 bg-[#0B0E14]",
                isChecked ? "border-indigo-500/50" : "border-slate-800/60",
              )}
            >
              <div
                className={cn(
                  "mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors bg-black/20",
                  isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-700",
                )}
              >
                {isChecked && <Check size={12} />}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                <span className="font-bold text-slate-300">AVERTISSEMENT :</span> Les analyses sont fournies à titre
                informatif et consultatif uniquement. Elles ne constituent pas une garantie de résultat ni un conseil
                engageant. L'utilisation des informations et les décisions prises relèvent entièrement de la
                responsabilité de l'utilisateur.
              </p>
            </div>

            <button
              disabled={!isChecked || isLoading}
              onClick={startConversation}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-30"
            >
              {isLoading ? "Initialisation..." : "Commencer l'analyse"} <ArrowRight size={20} />
            </button>
          </div>
          <Footer />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 pt-16 pb-12">
            <div className="max-w-3xl mx-auto space-y-6">
              {displayMessages.map((msg: any, i: number) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col animate-in fade-in slide-in-from-bottom-2",
                    msg.role === "user" ? "items-end" : "items-start",
                  )}
                >
                  <div className={cn("flex gap-3 max-w-[85%]", msg.role === "user" ? "flex-row-reverse" : "")}>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
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
              {isLoading && (
                <div className="flex gap-3 items-center text-muted-foreground text-xs animate-pulse ml-11 text-indigo-500">
                  Édouard analyse...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 bg-background border-t">
            <div className="max-w-3xl mx-auto flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Réponse..."
                className="flex-1 bg-muted/50 border rounded-xl p-3 resize-none h-12 outline-none text-sm focus:border-indigo-500/50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="bg-indigo-600 text-white px-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <Footer />
        </>
      )}
    </div>
  );
};

export default ChatPanel;
