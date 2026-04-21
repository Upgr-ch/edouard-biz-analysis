import { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Imports sécurisés des fonctions anonymes
import * as AnonChat from "@/lib/anonymousChat";

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
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const syncProcessed = useRef(false);

  const getAnonMessages = () => (AnonChat as any).getAnonMessages?.() || [];
  const getAnonCount = () => (AnonChat as any).getAnonUserMessageCount?.() || 0;
  const maxAnon = (AnonChat as any).ANON_MAX_MESSAGES || 6;

  const isAnonymous = !user;
  const messagesLeft = Math.max(0, maxAnon - getAnonCount());

  // Synchronisation des messages après authentification
  useEffect(() => {
    const syncAnonymousMessages = async () => {
      if (user && !syncProcessed.current) {
        const anonMsgs = getAnonMessages();
        if (anonMsgs.length > 0 && onCreateConversation && saveMessage) {
          syncProcessed.current = true;
          try {
            const firstUserMsg = anonMsgs.find((m: any) => m.role === "user")?.content || "Conversation importée";
            const newId = await onCreateConversation(firstUserMsg.substring(0, 30));
            for (const msg of anonMsgs) {
              await saveMessage(newId, msg.role, msg.content);
            }
            if ((AnonChat as any).clearAnonMessages) {
              (AnonChat as any).clearAnonMessages();
            }
            toast.success("Conversation récupérée !");
          } catch (err) {
            console.error("Erreur de synchro:", err);
          }
        }
      }
    };
    syncAnonymousMessages();
  }, [user, onCreateConversation, saveMessage]);

  const displayMessages = isAnonymous
    ? getAnonMessages().length > 0
      ? getAnonMessages().map((m: any, i: number) => ({ ...m, id: `anon-${i}`, number: i + 1 }))
      : [WELCOME_MESSAGE]
    : persistedMessages.length > 0
      ? persistedMessages.map((m: any, i: number) => ({ ...m, number: i + 1 }))
      : [WELCOME_MESSAGE];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const currentCount = getAnonCount();

    if (isAnonymous && currentCount >= maxAnon) {
      toast.error("Quota atteint. Inscris-toi gratuitement pour continuer !");
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1500);
      return;
    }

    let userContent = input.trim();
    const cleanInput = userContent.toLowerCase();

    if (cleanInput === "aide-moi" || cleanInput === "aide moi" || cleanInput === "aide") {
      userContent = "Aide-moi";
    } else if (userContent.length === 1) {
      if (cleanInput === "a") userContent = "A (Novice)";
      if (cleanInput === "b") userContent = "B (Intermédiaire)";
      if (cleanInput === "c") userContent = "C (Confirmé)";
    }

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
      toast.error("Édouard est momentanément indisponible.");
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
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md", msg.role === "assistant" ? "bg-gradient-to