import { useState, useRef, useEffect } from "react";
import { Send, Brain, ArrowRight, Check, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
    if (!isChecked) {
      toast.error("Veuillez accepter l'avertissement.");
      return;
    }
    setDisclaimerAccepted(true);
    const edouardIntro = `Je suis Édouard. Ne le prends pas pour toi, je m'exprime de manière ferme, assertive et juste. Mon travail est de te dire la vérité business, pas de te flatter.

Avant de commencer, j'ai besoin de savoir où tu en es. Choisis le profil qui te correspond :

A. Novice — "C'est mon tout premier projet, je pars de zéro"

B. Intermédiaire — "J'ai déjà lancé un projet, je connais les bases"

C. Confirmé — "J'ai plusieurs projets à mon actif, je veux aller vite"

Précision pour l'utilisateur : Tu peux répondre par la lettre de ton choix (A, B ou C)`;

    if (isAnonymous) {
      (AnonChat as any).appendAnonMessage("assistant", edouardIntro);
    } else if (saveMessage && conversationId) {
      await saveMessage(conversationId, "assistant", edouardIntro);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (isAnonymous && totalUserMessages >= 6) {
      toast.info("Quota gratuit atteint. Inscris-toi pour continuer.");
      localStorage.setItem("pending_anon_chat", JSON.stringify(displayMessages));
      setTimeout(() => navigate("/auth"), 1000);
      return;
    }

    const content = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const systemGuide = `Tu es Édouard. L'utilisateur répond "${content}". Si c'est A, B ou C, valide son profil et demande-lui de décrire son projet.`;

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
    <div className="flex flex-col h-screen bg-[#0B0E14] relative overflow-hidden font-sans">
      {/* RESET BTN */}
      <div className="fixed top-2 left-2 z-[100] opacity-30 hover:opacity-100">
        <button
          onClick={handleForceSignOut}
          className="flex items-center gap-1.5 bg-red-950/40 text-red-100 px-2 py-1 rounded-md text-[9px] font-bold uppercase border border-red-500/20"
        >
          <LogOut size={12} /> Reset
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto">
        {!disclaimerAccepted && displayMessages.length === 0 ? (
          /* POPUP D'ACCUEIL */
          <div className="max-w-2xl w-full bg-[#161B22] border border-slate-800 rounded-3xl p-10 shadow-2xl space-y-8 my-auto">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Je suis <span className="text-indigo-500">Édouard.</span>
              </h1>
              <p className="text-slate-400 text-[17px]">
                Consultant en faisabilité et rentabilité de projets business.
              </p>
            </div>
            <div className="space-y-5 text-slate-300 text-[15px] leading-relaxed">
              <p>Je vais t'aider à analyser ton idée de business avec structure et honnêteté.</p>
              <p>
                Je m'exprime de manière <span className="font-semibold text-white">ferme, assertive et juste</span>, ne
                le prends pas pour toi. Mon travail est de te dire la vérité business, pas de te flatter.
              </p>
              <p className="text-blue-500 font-semibold text-[16px]">
                Ma mission est de te faire gagner du temps et d'éviter les erreurs coûteuses.
              </p>
            </div>
            <div className="border-l-2 border-slate-700 pl-6 py-1 bg-slate-800/20 rounded-r-lg">
              <p className="text-[13px] text-slate-400 italic">
                J'utilise uniquement des données réelles et vérifiables issues du web.
              </p>
            </div>
            <div
              onClick={() => setIsChecked(!isChecked)}
              className={cn(
                "p-6 rounded-2xl border cursor-pointer flex gap-4 bg-[#0B0E14]/50",
                isChecked ? "border-indigo-500/50" : "border-slate-800",
              )}
            >
              <div
                className={cn(
                  "mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0",
                  isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-700",
                )}
              >
                {isChecked && <Check size={12} />}
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-tight">
                <span className="font-bold text-slate-200">AVERTISSEMENT :</span> Les analyses sont fournies à titre
                informatif et consultatif uniquement.
              </p>
            </div>
            <button
              disabled={!isChecked || isLoading}
              onClick={startConversation}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              {isLoading ? "Initialisation..." : "Commencer l'analyse"} <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          /* CHAT */
          <div className="max-w-2xl w-full flex-1 space-y-6 pb-20">
            {displayMessages.map((msg: any, i: number) => {
              if (msg.role === "user") userMsgCounter++;
              return (
                <div
                  key={i}
                  className={cn("flex flex-col animate-in fade-in", msg.role === "user" ? "items-end" : "items-start")}
                >
                  <div className={cn("flex gap-3 max-w-[85%]", msg.role === "user" ? "flex-row-reverse" : "")}>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs",
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
                      <ReactMarkdown className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="text-xs animate-pulse ml-11 text-indigo-500 font-medium italic">Édouard analyse...</div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* INPUT BAR (VISIBLE DÈS QUE LE CHAT COMMENCE) */}
      {(disclaimerAccepted || displayMessages.length > 0) && (
        <div className="bg-[#0B0E14] border-t border-slate-800 z-40">
          <div className="max-w-2xl mx-auto px-4 py-3">
            {isAnonymous && (
              <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-indigo-400/80">
                Message {totalUserMessages} / 6 avant inscription gratuite
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={isAnonymous && totalUserMessages >= 6 ? "Inscription requise..." : "Répondez ici..."}
                className="flex-1 bg-[#161B22] border border-slate-800 rounded-xl p-3 resize-none h-12 outline-none text-sm text-white focus:border-indigo-500 transition-all"
              />
              <button
                onClick={handleSend}
                className={cn(
                  "px-4 rounded-xl transition-colors shadow-lg",
                  isAnonymous && totalUserMessages >= 6 ? "bg-amber-600" : "bg-indigo-600",
                )}
              >
                {isAnonymous && totalUserMessages >= 6 ? (
                  <ArrowRight size={18} className="text-white" />
                ) : (
                  <Send size={18} className="text-white" />
                )}
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
