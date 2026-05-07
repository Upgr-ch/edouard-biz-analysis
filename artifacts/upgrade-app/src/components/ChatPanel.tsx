import { useState, useRef, useEffect, Fragment } from "react";
import { Send, ArrowRight, Check, MessageCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { useAuth as useClerkAuth } from "@clerk/react";
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
  conversationTitle?: string | null;
  persistedMessages?: DisplayMessage[];
  saveMessage: (id: string, role: "user" | "assistant", content: string) => Promise<void>;
  onCreateConversation?: (title: string) => Promise<string | null>;
  onRenameConversation?: (id: string, title: string) => Promise<void>;
  onDownloadFiche?: (label: string) => void;
  onStepDetected?: (step: number) => void;
  onNextStep?: () => void;
  /** Incremented by Index when a brand-new conversation is created from the sidebar.
   *  ChatPanel resets its disclaimer state when this changes. */
  newConversationKey?: number;
}

/** Scan an AI reply for the highest **Étape X/10 marker and return the 0-based sidebar step */
function detectStepFromContent(content: string): number | null {
  const matches = [...content.matchAll(/\*\*Étape (\d+)\/10/g)];
  if (matches.length === 0) return null;
  const maxStep = Math.max(...matches.map((m) => parseInt(m[1])));
  return maxStep - 1; // Étape 1 → index 0, Étape 2 → index 1, etc.
}

const FicheButton = ({
  label,
  onDownload,
}: {
  label: string;
  onDownload: (l: string) => void;
}) => (
  <div
    className="mt-3 p-4 rounded-sm border"
    style={{
      background: "rgba(245,224,144,0.04)",
      borderColor: "rgba(245,224,144,0.22)",
    }}
  >
    <p
      className="text-[10px] font-bold uppercase tracking-widest mb-2.5"
      style={{ color: "rgba(245,224,144,0.60)", fontFamily: "var(--up-font)" }}
    >
      📥 Conserve une trace structurée de cette étape
    </p>
    <button
      onClick={() => onDownload(label)}
      className="flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-semibold transition-all border active:scale-95"
      style={{
        background: "#F5E090",
        color: "#080F1E",
        borderColor: "transparent",
        fontFamily: "var(--up-font)",
        boxShadow: "0 4px 14px -4px rgba(245,224,144,0.40)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
    >
      <Download size={13} />
      Télécharger la fiche — {label} (PDF)
    </button>
    <p
      className="text-[10px] mt-2 italic"
      style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--up-font)" }}
    >
      Je te recommande de l'enregistrer — elle te servira de référence opérationnelle pour cette étape.
    </p>
  </div>
);

const SyntheseFicheButton = ({
  onDownload,
}: {
  onDownload: (l: string) => void;
}) => (
  <div
    className="mt-4 p-5 rounded-sm border"
    style={{
      background: "linear-gradient(135deg, rgba(8,15,30,0.95) 0%, rgba(20,30,60,0.95) 100%)",
      borderColor: "rgba(245,224,144,0.45)",
      boxShadow: "0 0 32px -8px rgba(245,224,144,0.15)",
    }}
  >
    <div className="flex items-start gap-3 mb-4">
      <div
        className="flex-shrink-0 w-9 h-9 rounded-sm flex items-center justify-center"
        style={{ background: "#F5E090" }}
      >
        <span style={{ fontSize: 18 }}>📊</span>
      </div>
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
          style={{ color: "#F5E090", fontFamily: "var(--up-font)" }}
        >
          Rapport complet — 10 étapes analysées
        </p>
        <p
          className="text-[10px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.50)", fontFamily: "var(--up-font)" }}
        >
          Ce rapport compile les 9 fiches étapes + le diagnostic final avec indice de faisabilité-rentabilité.
        </p>
      </div>
    </div>
    <button
      onClick={() => onDownload("Synthèse")}
      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-sm text-sm font-bold transition-all active:scale-95"
      style={{
        background: "#F5E090",
        color: "#080F1E",
        fontFamily: "var(--up-font)",
        boxShadow: "0 6px 20px -4px rgba(245,224,144,0.50)",
        letterSpacing: "0.02em",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
    >
      <Download size={15} />
      Télécharger le rapport complet (PDF)
    </button>
    <p
      className="text-[10px] mt-3 text-center italic"
      style={{ color: "rgba(255,255,255,0.30)", fontFamily: "var(--up-font)" }}
    >
      Génération en cours — peut prendre 30 à 60 secondes selon la longueur de l'analyse.
    </p>
  </div>
);

const HelpHint = () => (
  <div className="ml-11 mt-2">
    <p
      className="text-[11px] italic leading-relaxed"
      style={{ color: "rgba(255,255,255,0.32)", fontFamily: "var(--up-font)" }}
    >
      À tout moment, tape{" "}
      <strong>
        <u>aide moi</u>
      </strong>{" "}
      si tu as besoin de suggestions.
      <br />
      Si tu dispose de documents tu peux les joindre via l'icône 📎.
    </p>
  </div>
);

const NextStepButton = ({ onNextStep }: { onNextStep: () => void }) => (
  <button
    onClick={onNextStep}
    className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-semibold transition-all active:scale-95 border"
    style={{
      background: "#F5E090",
      color: "#080F1E",
      borderColor: "transparent",
      fontFamily: "var(--up-font)",
      boxShadow: "0 4px 14px -4px rgba(245,224,144,0.40)",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
  >
    Passer à l'étape suivante
    <ArrowRight size={14} />
  </button>
);

function renderContentWithFiche(
  content: string,
  onDownloadFiche?: (label: string) => void,
  onNextStep?: () => void,
) {
  const parts = content.split(/(%%FICHE:[^%]+%%|%%NEXT%%)/);
  if (parts.length === 1) {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }
  return (
    <>
      {parts.map((part, i) => {
        if (part === "%%NEXT%%") {
          return onNextStep ? <NextStepButton key={i} onNextStep={onNextStep} /> : null;
        }
        const ficheMatch = part.match(/%%FICHE:([^%]+)%%/);
        if (ficheMatch && onDownloadFiche) {
          const ficheLabel = ficheMatch[1].trim();
          if (ficheLabel === "Synthèse") {
            return <SyntheseFicheButton key={i} onDownload={onDownloadFiche} />;
          }
          return <FicheButton key={i} label={ficheLabel} onDownload={onDownloadFiche} />;
        }
        if (part.trim()) {
          return <ReactMarkdown key={i}>{part}</ReactMarkdown>;
        }
        return null;
      })}
    </>
  );
}

/** Strip the invisible sentinel before displaying the message */
function stripSentinel(text: string): string {
  return text.replace(/\|\|\|TITRE:[^|]*\|\|\|\n?/g, "").trim();
}

/**
 * Extract the chosen title from the AI reply sentinel |||TITRE:NOM|||.
 * This is the primary and most reliable source of the conversation name.
 */
function extractTitleSentinel(text: string): string | null {
  const match = text.match(/\|\|\|TITRE:([^|]+)\|\|\|/);
  return match ? match[1].trim() : null;
}

/**
 * When user picks A/B/C for a name, look in the last assistant message
 * for the matching "**A.** SomeName" pattern and return SomeName.
 * This is 100% reliable because it reads from our own stored messages.
 */
function extractChosenName(letter: string, messages: DisplayMessage[]): string | null {
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  if (!lastAssistant) return null;
  const L = letter.toUpperCase();
  // Matches both:  **A.** Name   and   A. Name   (with or without bold/brackets)
  const re = new RegExp(`(?:\\*\\*)?${L}\\.(?:\\*\\*)?\\s+\\[?([^\\]\\n*|<]{2,50})`, "i");
  const match = lastAssistant.content.match(re);
  return match ? match[1].trim().replace(/\s*→.*$/, "") : null;
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

async function invokeChat(messages: DisplayMessage[], token?: string | null): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    let serverMessage: string | undefined;
    try {
      const body = (await res.json()) as { error?: string };
      serverMessage = body.error;
    } catch { /* ignore parse errors */ }
    const err = new Error(serverMessage ?? `Chat API error ${res.status}`) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  const data = (await res.json()) as { content?: string };
  return data.content ?? "";
}

const ChatPanel = ({
  conversationId,
  conversationTitle,
  persistedMessages = [],
  saveMessage,
  onCreateConversation,
  onRenameConversation,
  onDownloadFiche,
  onStepDetected,
  onNextStep,
  newConversationKey,
}: ChatPanelProps) => {
  const { user, signOut } = useAuth();
  const { getToken } = useClerkAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [titleValidated, setTitleValidated] = useState(false);
  const [, forceUpdate] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const redirectScheduled = useRef(false);

  /* Footer hints visible once the conversation has a real title */
  const isDefaultTitle = !conversationTitle || conversationTitle === "Nouvelle analyse";

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

  // Reset disclaimer only when the parent signals a brand-new conversation was
  // created from the sidebar (newConversationKey increments). This avoids false
  // resets when startConversation() auto-creates the first conversation
  // (null → newId) or when switching to an existing one.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setDisclaimerAccepted(false);
    setIsChecked(false);
  }, [newConversationKey]);

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

  /* true when intro is shown but no user reply yet */
  const needsLevelChoice = disclaimerAccepted && totalUserMessages === 0 && !isLoading;

  const handleLevelChoice = (letter: string) => {
    void (async () => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        if (isAnonymous) {
          AnonChat.appendAnonMessage("user", letter);
          forceUpdate((n) => n + 1);
          const msgs = AnonChat.getAnonMessages();
          const reply = await invokeChat(msgs);
          if (reply) {
            AnonChat.appendAnonMessage("assistant", stripSentinel(reply));
            forceUpdate((n) => n + 1);
            const step = detectStepFromContent(reply);
            if (step !== null) onStepDetected?.(step);
          }
        } else {
          const activeConversationId =
            conversationId ?? (await onCreateConversation?.("Nouvelle analyse")) ?? null;
          if (!activeConversationId) return;
          await saveMessage(activeConversationId, "user", letter);
          const token = await getToken();
          const reply = await invokeChat([
            ...persistedMessages,
            { role: "user", content: letter },
          ], token);
          if (reply) {
            const cleanReply = stripSentinel(reply);
            await saveMessage(activeConversationId, "assistant", cleanReply);
            const step = detectStepFromContent(reply);
            if (step !== null) onStepDetected?.(step);
          }
        }
      } catch (err) {
        const msg = (err as Error).message;
        toast.error(msg.startsWith("Chat API error") ? "Erreur lors de l'envoi" : msg);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const startConversation = async () => {
    if (!isChecked) return;
    setDisclaimerAccepted(true);
    const edouardIntro = `Je suis Édouard. Ne le prends pas pour toi, je m'exprime de manière ferme, assertive et juste. Mon travail est de te dire la vérité business, pas de te flatter.

Avant de commencer, j'ai besoin de savoir où tu en es.

**A** — Novice : "C'est mon tout premier projet, je pars de zéro"
**B** — Intermédiaire : "J'ai déjà lancé un projet, je connais les bases"
**C** — Confirmé : "J'ai plusieurs projets à mon actif, je veux aller vite"

→ Clique sur ton profil ci-dessous.`;

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
          /* ── Save sentinel title to localStorage for post-auth restore ── */
          const sentinelTitle = extractTitleSentinel(reply);
          if (sentinelTitle) {
            localStorage.setItem("temp_title", sentinelTitle);
          }
          AnonChat.appendAnonMessage("assistant", stripSentinel(reply));
          forceUpdate((n) => n + 1);
          const step = detectStepFromContent(reply);
          if (step !== null) onStepDetected?.(step);
        }
      } else {
        const activeConversationId =
          conversationId ?? (await onCreateConversation?.("Nouvelle analyse")) ?? null;
        if (!activeConversationId) {
          toast.error("Erreur lors de la création de la conversation");
          return;
        }
        await saveMessage(activeConversationId, "user", content);
        const token = await getToken();
        const reply = await invokeChat([
          ...persistedMessages,
          { role: "user", content },
        ], token);
        if (reply) {
          const cleanReply = stripSentinel(reply);
          await saveMessage(activeConversationId, "assistant", cleanReply);

          const step = detectStepFromContent(reply);
          if (step !== null) onStepDetected?.(step);

          /* ── Name pick: sentinel (primary) or regex fallback ──────────── */
          const sentinelTitle = extractTitleSentinel(reply);
          if (sentinelTitle) {
            await onRenameConversation?.(activeConversationId, sentinelTitle);
            setTitleValidated(true);
          } else {
            const isSingleLetter = /^[ABC]$/i.test(content);
            const alreadyHasMessages = persistedMessages.filter((m) => m.role === "user").length > 0;
            if (isSingleLetter && alreadyHasMessages) {
              const chosenName = extractChosenName(content.toUpperCase(), persistedMessages);
              if (chosenName) {
                await onRenameConversation?.(activeConversationId, chosenName);
                setTitleValidated(true);
              }
            }
          }
        }
      }
    } catch (err) {
      const msg = (err as Error).message;
      toast.error(msg.startsWith("Chat API error") ? "Erreur lors de l'envoi" : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    onNextStep?.();
    if (!conversationId || isLoading) return;
    void (async () => {
      const content = "Passons à l'étape suivante.";
      setIsLoading(true);
      try {
        await saveMessage(conversationId, "user", content);
        const token = await getToken();
        const reply = await invokeChat(
          [...persistedMessages, { role: "user", content }],
          token,
        );
        if (reply) {
          const cleanReply = stripSentinel(reply);
          await saveMessage(conversationId, "assistant", cleanReply);
          const step = detectStepFromContent(reply);
          if (step !== null) onStepDetected?.(step);
        }
      } catch (err) {
        const msg = (err as Error).message;
        toast.error(msg.startsWith("Chat API error") ? "Erreur lors de l'envoi" : msg);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  let userMsgCounter = 0;
  let assistantMsgCounter = 0;
  let stepReachedCadrage = false;

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">

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
              <p>
                Si ton idée n'est pas viable, je te le dirai clairement. Si elle est améliorable, je
                t'expliquerai comment.
              </p>
              <p className="font-semibold text-[16px] text-primary">
                Ma mission est de te faire gagner du temps et d'éviter les erreurs coûteuses.
              </p>
            </div>

            <div
              className="pl-6 py-3 text-[13px] text-muted-foreground italic"
              style={{ borderLeft: "2px solid rgba(245,224,144,0.25)", background: "rgba(245,224,144,0.03)" }}
            >
              J'utilise uniquement des données réelles et vérifiables issues du web. Je n'invente jamais
              de chiffres, de marché ou de tendances. Si une information fiable n'est pas disponible, je
              le dis clairement.
            </div>

            {/* Disclaimer checkbox */}
            <div
              onClick={() => setIsChecked(!isChecked)}
              className="p-6 rounded-sm border-2 cursor-pointer flex gap-4 transition-all"
              style={{
                background: isChecked ? "rgba(245,224,144,0.06)" : "rgba(245,224,144,0.02)",
                borderColor: isChecked ? "rgba(245,224,144,0.50)" : "rgba(245,224,144,0.25)",
                boxShadow: isChecked ? "0 0 20px -6px rgba(245,224,144,0.20)" : "none",
              }}
            >
              <div
                className="mt-0.5 w-6 h-6 rounded-sm border-2 flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: isChecked ? "#F5E090" : "rgba(245,224,144,0.08)",
                  borderColor: isChecked ? "#F5E090" : "rgba(245,224,144,0.55)",
                  color: "#080F1E",
                  boxShadow: isChecked ? "none" : "0 0 8px rgba(245,224,144,0.15)",
                }}
              >
                {isChecked && <Check size={13} strokeWidth={3} />}
              </div>
              <p className="text-xs uppercase tracking-tight leading-relaxed" style={{ color: "#ffffff" }}>
                <span className="font-bold" style={{ color: "#F5E090" }}>AVERTISSEMENT :</span> Les analyses sont
                fournies à titre informatif et consultatif uniquement. Elles ne constituent pas une
                garantie de résultat ni un conseil engageant. L'utilisation des informations et les
                décisions prises relèvent entièrement de la responsabilité de l'utilisateur.
              </p>
            </div>

            <button
              disabled={!isChecked || isLoading}
              onClick={() => void startConversation()}
              className="w-full py-4 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:cursor-not-allowed rounded-sm border"
              style={{
                background: isChecked ? "#F5E090" : "rgba(245,224,144,0.07)",
                color: isChecked ? "#080F1E" : "rgba(245,224,144,0.55)",
                borderColor: isChecked ? "transparent" : "rgba(245,224,144,0.22)",
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
              // Track whether we've reached Cadrage (Étape 2 = index 1) or beyond
              if (msg.role === "assistant") {
                const detectedStep = detectStepFromContent(msg.content);
                if (detectedStep !== null && detectedStep >= 1) stepReachedCadrage = true;
              }
              const showHint = msg.role === "assistant" && stepReachedCadrage;
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
                          {renderContentWithFiche(msg.content, msg.role === "assistant" ? onDownloadFiche : undefined, msg.role === "assistant" ? handleNextStep : undefined)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {showHint && <HelpHint />}
                  {showAd && <AdSlot />}
                </Fragment>
              );
            })}

            {/* ── Level choice chips — below the intro bubble ── */}
            {needsLevelChoice && !isLoading && (
              <div className="flex flex-wrap gap-2 ml-11 mt-1">
                {[
                  { key: "A", label: "Novice" },
                  { key: "B", label: "Intermédiaire" },
                  { key: "C", label: "Confirmé" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleLevelChoice(key)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all"
                    style={{
                      background: "rgba(245,224,144,0.05)",
                      borderColor: "rgba(245,224,144,0.28)",
                      color: "rgba(255,255,255,0.80)",
                      fontFamily: "var(--up-font)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#F5E090"; e.currentTarget.style.color = "#F5E090"; e.currentTarget.style.background = "rgba(245,224,144,0.10)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(245,224,144,0.28)"; e.currentTarget.style.color = "rgba(255,255,255,0.80)"; e.currentTarget.style.background = "rgba(245,224,144,0.05)"; }}
                  >
                    <span className="font-bold text-[11px]" style={{ color: "#F5E090" }}>{key}</span>
                    {label}
                  </button>
                ))}
              </div>
            )}

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
            {isAnonymous && !needsLevelChoice && (
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
                placeholder={needsLevelChoice ? "Clique sur ton profil ci-dessus…" : "Réponse"}
                disabled={needsLevelChoice || isLoading}
                className="flex-1 border rounded-sm p-3 resize-none h-12 outline-none text-sm text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.10)",
                  fontFamily: "var(--up-font)",
                }}
                onFocus={(e) => { if (!needsLevelChoice) e.currentTarget.style.borderColor = "rgba(245,224,144,0.40)"; }}
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
