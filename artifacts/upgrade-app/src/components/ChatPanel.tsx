import { useState, useRef, useEffect, Fragment } from "react";
import { Send, ArrowRight, Check, LogOut, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import * as AnonChat from "@/lib/anonymousChat";
import { BrainLogoSm } from "@/components/BrainLogo";
import AdSlot from "@/components/ads/AdSlot";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  conversationId: string | null;
  persistedMessages?: DisplayMessage[];
  saveMessage: (id: string, role: "user" | "assistant", content: string) => Promise<void>;
  onCreateConversation?: (title: string) => Promise<string | null>;
}

const Footer = () => (
  <footer className="w-full py-3 border-t border-border bg-background z-50 shrink-0">
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
      <span className="opacity-50 ml-2">© 2026 - Kévin Lavergne – UpGrade</span>
    </div>
  </footer>
);

async function invokeChat(messages: DisplayMessage[]): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`Chat API error ${res.status}`);
  const data = (await res.json()) as { content?: string };
  return data.content ?? "";
}

const ChatPanel = ({
  conversationId,
  persistedMessages = [],
  saveMessage,
  onCreateConversation,
}: ChatPanelProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [, forceUpdate] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const redirectScheduled = useRef(false);

  const isAnonymous = !user;
  const displayMessages: DisplayMessage[] = isAnonymous
    ? AnonChat.getAnonMessages()
    : persistedMessages;
  const totalUserMessages = displayMessages.filter((m) => m.role === "user").length;

  useEffect(() => {
    const handler = () => forceUpdate((n) => n + 1);
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const saveTemporaryChat = () => {
    const latestMessages = AnonChat.getAnonMessages();
    localStorage.setItem("temp_chat", JSON.stringify(latestMessages));
  };

  useEffect(() => {
    if (isAnonymous && totalUserMessages === 6 && !isLoading && !redirectScheduled.current) {
      redirectScheduled.current = true;
      const timer = setTimeout(() => {
        saveTemporaryChat();
        navigate("/auth");
      }, 4000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [totalUserMessages, isLoading, isAnonymous, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isLoading]);

  const handleForceSignOut = async () => {
    try {
      localStorage.clear();
      await signOut();
      window.location.href = "/";
    } catch {
      window.location.reload();
    }
  };

  const startConversation = async () => {
    if (!isChecked) return;
    setDisclaimerAccepted(true);
    const edouardIntro = `Je suis Édouard. Ne le prends pas pour toi, je m'exprime de manière ferme, assertive et juste. Mon travail est de te dire la vérité business, pas de te flatter.

Avant de commencer, j'ai besoin de savoir où tu en es. Choisis le profil qui te correspond :

A. Novice — "C'est mon tout premier projet, je pars de zéro"
B. Intermédiaire — "J'ai déjà lancé un projet, je connais les bases"
C. Confirmé — "J'ai plusieurs projets à mon actif, je veux aller vite"

Précision pour l'utilisateur : Tu peux répondre par la lettre de ton choix (A, B ou C)`;

    if (isAnonymous) {
      AnonChat.appendAnonMessage("assistant", edouardIntro);
      forceUpdate((n) => n + 1);
    } else if (saveMessage) {
      const activeConversationId =
        conversationId ?? (await onCreateConversation?.("Nouvelle analyse")) ?? null;
      if (activeConversationId) {
        await saveMessage(activeConversationId, "assistant", edouardIntro);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (isAnonymous && totalUserMessages >= 6) {
      saveTemporaryChat();
      navigate("/auth");
      return;
    }

    const content = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      if (isAnonymous) {
        AnonChat.appendAnonMessage("user", content);
        forceUpdate((n) => n + 1);
        const msgs = AnonChat.getAnonMessages();
        const reply = await invokeChat(msgs);
        if (reply) {
          AnonChat.appendAnonMessage("assistant", reply);
          forceUpdate((n) => n + 1);
        }
      } else {
        const activeConversationId =
          conversationId ?? (await onCreateConversation?.("Nouvelle analyse")) ?? null;
        if (!activeConversationId) {
          toast.error("Erreur lors de la création de la conversation");
          return;
        }
        await saveMessage(activeConversationId, "user", content);
        const reply = await invokeChat([
          ...persistedMessages,
          { role: "user", content },
        ]);
        if (reply) await saveMessage(activeConversationId, "assistant", reply);
      }
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsLoading(false);
    }
  };

  let userMsgCounter = 0;
  let assistantMsgCounter = 0;

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Reset button */}
      <div className="fixed top-2 right-2 z-[100] opacity-20 hover:opacity-100 transition-opacity">
        <button
          onClick={() => void handleForceSignOut()}
          className="flex items-center gap-1.5 bg-red-950/40 text-red-200 px-2 py-1 rounded text-[9px] font-bold uppercase border border-red-500/20"
        >
          <LogOut size={12} /> Reset
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto scrollbar-none">
        {!disclaimerAccepted && displayMessages.length === 0 ? (
          /* ── Landing card ── */
          <div
            className="max-w-2xl w-full border rounded-sm p-10 shadow-2xl space-y-8 my-auto animate-in fade-in zoom-in duration-500"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderColor: "rgba(245,224,144,0.15)",
              boxShadow: "0 0 80px rgba(245,224,144,0.04)",
            }}
          >
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground tracking-tight" style={{ fontFamily: "var(--up-font)" }}>
                Je suis <span className="up-shimmer">Édouard.</span>
              </h1>
              <p className="text-muted-foreground text-[17px]">
                Consultant en faisabilité et rentabilité de projets business.
              </p>
            </div>

            <div className="space-y-5 text-muted-foreground text-[15px] leading-relaxed">
              <p>Je vais t'aider à analyser ton idée de business avec structure et honnêteté.</p>
              <p>
                Je m'exprime de manière{" "}
                <span className="font-semibold text-foreground">ferme, assertive et juste</span>, ne le
                prends pas pour toi. Mon travail est de te dire la vérité business, pas de te flatter.
              </p>
              <p className="font-semibold text-[16px] text-primary">
                Ma mission est de te faire gagner du temps et d'éviter les erreurs coûteuses.
              </p>
            </div>

            <div
              className="pl-6 py-2 italic text-[13px] text-muted-foreground"
              style={{ borderLeft: "2px solid rgba(245,224,144,0.25)", background: "rgba(245,224,144,0.03)" }}
            >
              J'utilise uniquement des données réelles et vérifiables issues du web.
            </div>

            {/* Disclaimer checkbox */}
            <div
              onClick={() => setIsChecked(!isChecked)}
              className="p-6 rounded-sm border cursor-pointer flex gap-4 transition-all"
              style={{
                background: isChecked ? "rgba(245,224,144,0.04)" : "transparent",
                borderColor: isChecked ? "rgba(245,224,144,0.30)" : "rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="mt-1 w-5 h-5 rounded-sm border flex items-center justify-center shrink-0 transition-colors"
                style={{
                  background: isChecked ? "#F5E090" : "transparent",
                  borderColor: isChecked ? "#F5E090" : "rgba(255,255,255,0.20)",
                  color: "#080F1E",
                }}
              >
                {isChecked && <Check size={12} />}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                <span className="font-bold text-foreground">AVERTISSEMENT :</span> Les analyses sont
                fournies à titre informatif et consultatif uniquement.
              </p>
            </div>

            <button
              disabled={!isChecked || isLoading}
              onClick={() => void startConversation()}
              className="w-full py-4 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed rounded-sm"
              style={{
                background: isChecked ? "#F5E090" : "rgba(245,224,144,0.15)",
                color: "#080F1E",
                boxShadow: isChecked ? "0 10px 30px -10px rgba(245,224,144,0.40)" : "none",
              }}
            >
              {isLoading ? "Initialisation..." : "Commencer l'analyse"} <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          /* ── Messages ── */
          <div className="max-w-2xl w-full flex-1 space-y-6 pb-20">
            {displayMessages.map((msg, i) => {
              if (msg.role === "user") userMsgCounter++;
              if (msg.role === "assistant") assistantMsgCounter++;
              const showAd = msg.role === "assistant" && assistantMsgCounter % 6 === 0;
              return (
                <Fragment key={i}>
                  <div
                    className={cn(
                      "flex flex-col animate-in fade-in",
                      msg.role === "user" ? "items-end" : "items-start",
                    )}
                  >
                    <div className={cn("flex gap-3 max-w-[85%]", msg.role === "user" ? "flex-row-reverse" : "")}>
                      {/* Avatar */}
                      {msg.role === "assistant" ? (
                        <BrainLogoSm className="shrink-0 mt-0.5" />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0 font-bold text-xs border"
                          style={{
                            background: "rgba(245,224,144,0.08)",
                            borderColor: "rgba(245,224,144,0.25)",
                            color: "#F5E090",
                          }}
                        >
                          {userMsgCounter}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className="rounded-sm px-4 py-3 text-sm border"
                        style={
                          msg.role === "assistant"
                            ? {
                                background: "rgba(255,255,255,0.03)",
                                borderColor: "rgba(255,255,255,0.08)",
                                color: "rgba(255,255,255,0.85)",
                              }
                            : {
                                background: "rgba(245,224,144,0.07)",
                                borderColor: "rgba(245,224,144,0.20)",
                                color: "#ffffff",
                              }
                        }
                      >
                        <div className="prose prose-sm dark:prose-invert" style={{ fontFamily: "var(--up-font)" }}>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                  {showAd && <AdSlot />}
                </Fragment>
              );
            })}

            {isLoading && (
              <div
                className="text-xs animate-pulse ml-11 font-medium italic"
                style={{ color: "#F5E090" }}
              >
                Édouard analyse…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      {(disclaimerAccepted || displayMessages.length > 0) && (
        <div className="border-t border-border bg-background z-40">
          <div className="max-w-2xl mx-auto px-4 py-3">
            {isAnonymous && (
              <div
                className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border"
                style={{
                  color: "#F5E090",
                  borderColor: "rgba(245,224,144,0.20)",
                  background: "rgba(245,224,144,0.06)",
                }}
              >
                <MessageCircle size={13} />
                Message {totalUserMessages} / 6 avant inscription gratuite.
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Réponse"
                className="flex-1 border rounded-sm p-3 resize-none h-12 outline-none text-sm text-foreground transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.10)",
                  fontFamily: "var(--up-font)",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(245,224,144,0.40)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}
              />
              <button
                onClick={() => void handleSend()}
                disabled={isLoading || !input.trim()}
                className="px-4 rounded-sm transition-all flex items-center justify-center active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "#F5E090",
                  color: "#080F1E",
                  boxShadow: "0 6px 20px -6px rgba(245,224,144,0.45)",
                }}
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
