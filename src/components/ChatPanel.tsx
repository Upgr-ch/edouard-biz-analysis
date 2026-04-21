import { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Imports sécurisés des fonctions anonymes
import * as AnonChat from "@/lib/anonymousChat";

// CORRECTION : Message simplifié pour éviter le bégaiement avec la réponse de l'IA
const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: `Je suis Édouard. Je m'exprime de manière ferme et juste : mon travail est de te dire la vérité business, pas de te flatter.\n\nPour commencer, dis-moi quel est ton profil (Novice, Intermédiaire ou Confirmé) ?`,
  number: 0,
};

const ChatPanel = ({
  conversationId,
  conversationTitle,
  persistedMessages = [],
  saveMessage,
  onCreateConversation,
  onUpdateTitle,
  isQuotaReached = false,
}: any) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sécurité sur les fonctions anonymes
  const getAnonMessages = () => (AnonChat as any).getAnonMessages?.() || [];
  const getAnonCount = () => (AnonChat as any).getAnonUserMessageCount?.() || 0;
  const maxAnon = (AnonChat as any).ANON_MAX_MESSAGES || 6; // Mis à 6 messages

  const isAnonymous = !user;
  const messagesLeft = Math.max(0, maxAnon - getAnonCount());

  const displayMessages = isAnonymous
    ? getAnonMessages().length > 0
      ? getAnonMessages().map((m: any, i: number) => ({ ...m, id: `anon-${i}`, number: i + 1 }))
      : [WELCOME_MESSAGE]
    : persistedMessages.length > 0
      ? persistedMessages.map((m: any, i: number) => ({ ...m, number: i + 1 }))
      : [WELCOME_MESSAGE];

  // EFFET : Mise à jour automatique du titre
  useEffect(() => {
    if (conversationId && displayMessages.length >= 2 && onUpdateTitle) {
      const firstUserMsg = displayMessages.find((m: any) => m.role === "user");
      if (
        firstUserMsg &&
        (!conversationTitle || conversationTitle.includes("Nouvelle") || conversationTitle.includes("New"))
      ) {
        const newTitle = firstUserMsg.content.substring(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "");
        onUpdateTitle(conversationId, newTitle);
      }
    }
  }, [displayMessages.length, conversationId, conversationTitle, onUpdateTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentCount = getAnonCount();

    if (isAnonymous && currentCount >= maxAnon) {
      toast.error("Quota atteint. Inscris-toi pour continuer !");
      return;
    }

    const userContent = input.trim().substring(0, 1500);
    setInput("");
    setIsLoading(true);

    try {
      if (isAnonymous) {
        // 1. Sauvegarde locale anonyme
        if ((AnonChat as any).appendAnonMessage) {
          (AnonChat as any).appendAnonMessage("user", userContent);
        }

        // 2. Appel IA
        const { data, error } = await supabase.functions.invoke("eugene-chat", {
          body: { messages: [...getAnonMessages(), { role: "user", content: userContent }] },
        });

        if (error) throw error;

        // 3. Réponse IA
        if (data?.content && (AnonChat as any).appendAnonMessage) {
          (AnonChat as any).appendAnonMessage("assistant", data.content);
        }
      } else {
        // Mode connecté
        let currentId = conversationId;
        if (!currentId && onCreateConversation) {
          currentId = await onCreateConversation(userContent.substring(0, 30));
        }
        if (saveMessage && currentId) {
          await saveMessage(currentId, "user", userContent);
        }
        
        //