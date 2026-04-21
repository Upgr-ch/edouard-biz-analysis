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
      <Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions Légales</Link>
      <Link to="/cgu" className="hover:text-primary transition-colors">CGU</Link>
      <Link to="/cgv" className="hover:text-primary transition-colors">CGV</Link>
      <Link to="/confidentialite" className="hover:text-primary transition-colors">Confidentialité</Link>
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
  const displayMessages = isAnonymous ? ((AnonChat as any).getAnonMessages?.() || []) : persistedMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isLoading]);

  // FONCTION DE NETTOYAGE RADICAL
  const handleForceSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      // On vide les cookies manuellement au cas où
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
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
      const initialPrompt = "Bonjour Édouard, je suis prêt pour l'analyse.";
      if (isAnonymous) {
        const { data } = await supabase.functions.invoke("eugene-chat", {
          body: { messages: [{ role: "user", content: initialPrompt }] },
        });
        if (data?.content && (AnonChat as any).appendAnonMessage) {
          (AnonChat as any).appendAnonMessage("assistant", data.content);
        }
      } else {
        let currentId = conversationId;
        if (!currentId && onCreateConversation) currentId = await onCreateConversation("Nouvelle analyse");
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
        if (data?.content && (AnonChat as any).appendAnonMessage) (AnonChat as any).appendAnonMessage("assistant", data.content);
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
    <div className="flex flex-col h-screen bg-background relative">
      {/* BOUTON DE SECOURS ABSOLU - S'AFFICHE TOUJOURS */}
      <div className="fixed top-2 right-2 z-[9999]">
        <button 
          onClick={handleForceSignOut}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold uppercase shadow-2xl transition-all active:scale-95"
        >
          <LogOut size={14} /> Reset Session
        </button>
      </div>

      {!disclaimerAccepted && displayMessages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0B0E14] text-slate-200">
          <div className="max-w-2xl w-full bg-[#161B22] border border-slate-800 rounded-3xl p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white">Je suis <span className="text-indigo-500">Édouard.</span></h1>
              <p className="text-slate-400 text-lg">Consultant en faisabilité et rentabilité de projets business.</p>
            </div>

            <div className="space-y-6 text-slate-300 leading-relaxed text-[15px]">
              <p>Je vais t'aider à analyser ton idée de business avec structure et honnêteté.</p>
              <p>Je m'exprime de manière <span className="font-bold text-white">ferme, assertive et juste</span>, ne le prends pas pour toi.</p>
              <p>Si ton idée n'est pas viable, je te le dirai clairement. Si elle est améliorable, je t'expliquerai comment.</p>
              <p className="text-blue-500 font-semibold uppercase tracking-wide text-sm">Ma mission est de te faire gagner du temps et d'éviter les erreurs coûteuses.</p>
              <div className="pl-4 border-l-2 border-indigo-500/50 py-2 text-slate-400 text-[13px] italic bg-indigo-500/5">
                J'utilise uniquement des données réelles et vérifiables issues du web. Je n'invente jamais de chiffres, de marché ou de tendances.
              </div>
            </div>

            <div 
              onClick={() => setIsChecked(!isChecked)}
              className={cn("p-6 rounded-2xl border transition-all cursor-pointer flex gap-4 bg-[#0B0E14]/50", isChecked ? "border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.1)]" : "border-slate-800")}
            >
              <div className={cn("mt-1 w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-colors", isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-600")}>
                {isChecked && <Check size={14} />}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                <span className="font-bold text-slate-200 uppercase">Avertissement :</span> Les analyses sont fournies à titre informatif et consultatif uniquement... L'utilisation des informations relève entièrement de la responsabilité de l'utilisateur.
              </p>
            </div>

            <button
              disabled={!isChecked || isLoading}
              onClick={startConversation}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-20"
            >
              {isLoading ? "Analyse..." : "Commencer l'analyse"} <ArrowRight size={20} />
            </button>
          </div>
          <Footer />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 pt-16 pb-12">
            <div className="max-w-3xl mx-auto space-y-6">
              {displayMessages.map((msg: any, i: number) => (
                <div key={i} className={cn("flex flex-col animate-in fade-in slide-in-from-bottom-2", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn("flex gap-3 max-w-[85%]", msg.role === "user" ? "flex-row-reverse" : "")}>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm", msg.role === "assistant" ? "bg-indigo-600 text-white" : "bg-muted")}>
                      {msg.role === "assistant" ? <Brain size={18} /> : <User size={18} />}
                    </div>
                    <div className={cn("rounded-2xl px-4 py-3 text-sm border shadow-sm", msg.role === "assistant" ? "bg-card" : "bg-primary/5")}>
                      <div className="prose prose-sm dark:prose-invert"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && <div className="flex gap-3 items-center text-muted-foreground text-xs animate-pulse ml-11 text-indigo-500">Édouard réfléchit...</div>}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 bg-background border-t">
            <div className="max-w-3xl mx-auto flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !