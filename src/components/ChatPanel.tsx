import { useState, useRef, useEffect } from "react";
import { Send, Brain, ArrowRight, Check, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import * as AnonChat from "@/lib/anonymousChat";

const Footer = () => (
  <footer className="w-full py-3 border-t border-slate-800 bg-[#0B0E14] z-50 shrink-0">
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
  const totalUserMessages = displayMessages.filter((m: any) => m.role === "user").length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isLoading]);

  const handleForceSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = "/";
    } catch (error) {
      window.location.reload();
    }
  };

  const startConversation = async () => {
    setDisclaimerAccepted(true);

    // TEXTE SACRÉ D'ÉDOUARD
    const edouardIntro = `Je suis Édouard. Ne le prends pas pour toi, je m'exprime de manière ferme, assertive et juste. Mon travail est de te dire la vérité business, pas de te flatter.

Avant de commencer, j'ai besoin de savoir où tu en es. Choisis le profil qui te correspond :

A. Novice — "C'est mon tout premier projet, je pars de zéro"

B. Intermédiaire — "J'ai déjà lancé un projet, je connais les bases"

C. Confirmé — "J'ai plusieurs projets à mon actif, je veux aller vite"

Précision pour l'utilisateur : Tu peux répondre par la lettre de ton choix (A, B ou C)`;

    // On affiche immédiatement le message sans attendre l'API pour une réactivité totale
    if (isAnonymous) {
      (AnonChat as any).appendAnonMessage("assistant", edouardIntro);
    } else if (saveMessage && conversationId) {
      await saveMessage(conversationId, "assistant", edouardIntro);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (isAnonymous && totalUserMessages >= 6) {
      toast.error("Limite de 6 messages atteinte.");
      return;
    }

    const content = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Prompt système caché pour guider l'IA sur la suite
      const systemGuide = `Tu es Édouard. L'utilisateur a déjà reçu ton introduction. Il répond maintenant par "${content}" (majuscule ou minuscule acceptée). Si sa réponse est A, B ou C, valide son profil avec fermeté et demande-lui de décrire son projet immédiatement. Ne répète jamais ton menu de bienvenue.`;

      if (isAnonymous) {
        (AnonChat as any).appendAnonMessage("user", content);
        const { data } = await supabase.functions.invoke("eugene-chat", {
          body: {
            messages: [...((AnonChat as any).getAnonMessages?.() || []), { role: "system", content: systemGuide }],
          },
        });
        if (data?.content) (AnonChat as any).appendAnonMessage("assistant", data.content);
      } else {
        await saveMessage(conversationId, "user", content);
        const { data } = await supabase.functions.invoke("eugene-chat", {
          body: { messages: [...persistedMessages, { role: "system", content: systemGuide }] },
        });
        if (data?.content) await saveMessage(conversationId, "assistant", data.content);
      }
    } catch (e) {
      toast.error("Erreur.");
    } finally {
      setIsLoading(false);
    }
  };

  let userMsgCounter = 0;

  return (
    <div className="flex flex-col h-screen bg-[#0B0E14] relative overflow-hidden">
      {/* RESET BUTTON */}
      <div className="fixed top-2 left-2 z-[100] opacity-30 hover:opacity-100 transition-opacity">
        <button
          onClick={handleForceSignOut}
          className="flex items-center gap-1.5 bg-red-950/40 text-red-100 px-2 py-1 rounded-md text-[9px] font-bold uppercase border border-red-500/20"
        >
          <LogOut size={12} /> Reset
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto scrollbar-none">
        {!disclaimerAccepted && displayMessages.length === 0 ? (
          /* ÉCRAN D'ACCUEIL */
          <div className="max-w-2xl w-full bg-[#161B22] border border-slate-800 rounded-3xl p-10 shadow-2xl space-y-8 my-auto animate-in fade-in zoom-in duration-500">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Je suis <span className="text-indigo-500">Édouard.</span>
            </h1>
            <div className="space-y-6 text-slate-300 text-[15px]">
              <p>Consultant expert en faisabilité et rentabilité de projets.</p>
              <p>
                Je m'exprime de manière <span className="font-semibold text-white">ferme, assertive et juste</span>. Mon
                travail est de te dire la vérité business.
              </p>
            </div>
            <div
              onClick={() => setIsChecked(!isChecked)}
              className={cn(
                "p-6 rounded-2xl border cursor-pointer flex gap-4 bg-[#0B0E14]",
                isChecked ? "border-indigo-500/50" : "border-slate-800/60",
              )}
            >
              <div
                className={cn(
                  "mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                  isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-700",
                )}
              >
                {isChecked && <Check size={12} />}
              </div>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">
                J'accepte que les analyses soient informatives.
              </p>
            </div>
            <button
              disabled={!isChecked || isLoading}
              onClick={startConversation}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30"
            >
              {isLoading ? "Initialisation..." : "Commencer l'analyse"} <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          /* CHAT */
          <div className="max-w-2xl w-full flex-1 space-y-6 pb-10">
            {displayMessages.map((msg: any, i: number) => {
              if (msg.role === "user") userMsgCounter++;
              return (
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
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs shadow-sm",
                        msg.role === "assistant"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-indigo-400 border border-indigo-500/30",
                      )}
                    >
                      {msg.role === "assistant" ? <Brain size={18} /> : userMsgCounter}
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm border",
                        msg.role === "assistant"
                          ? "bg-[#161B22] border-slate-800 text-slate-200"
                          : "bg-indigo-500/10 border-indigo-500/20 text-white",
                      )}
                    >
                      <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap font-sans">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="text-xs animate-pulse ml-11 text-indigo-500 font-medium">Édouard analyse...</div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* INPUT ZONE FIXED */}
      {disclaimerAccepted && (
        <div className="bg-[#0B0E14] border-t border-slate-800 z-40 shrink-0">
          <div className="max-w-2xl mx-auto px-4 py-3">
            {isAnonymous && (
              <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-400/80 pl-1">
                Message {totalUserMessages} / 6 avant inscription gratuite
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={isAnonymous && totalUserMessages >= 6 ? "Limite atteinte..." : "Écrivez ici..."}
                disabled={isAnonymous && totalUserMessages >= 6}
                className="flex-1 bg-[#161B22] border border-slate-800 rounded-xl p-3 resize-none h-12 outline-none text-sm text-white focus:border-indigo-500 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ChatPanel;
