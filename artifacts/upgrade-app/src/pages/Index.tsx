import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth as useClerkAuth } from "@clerk/react";
import ChatPanel from "@/components/ChatPanel";
import PdfProgressOverlay from "@/components/PdfProgressOverlay";
import AppSidebar from "@/components/AppSidebar";
import MainHeader from "@/components/MainHeader";
import FiscalDisclaimer from "@/components/FiscalDisclaimer";
import AcquisitionDisclaimer from "@/components/AcquisitionDisclaimer";
import { useAuth } from "@/hooks/useAuth";
import { useNewUserSync } from "@/hooks/useNewUserSync";
import { toast } from "sonner";
import {
  fetchSynthesis,
  fetchAllStepReports,
  renderCompilationPdf,
  fetchStepReport,
  renderStepPdf,
} from "@/lib/generateReport";

interface ApiConversation {
  id: string;
  title: string;
  currentStep?: number;
  current_step?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

interface ApiMessage {
  id: string;
  conversationId?: string;
  conversation_id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  created_at?: string;
}

interface Conversation extends ApiConversation {
  current_step: number;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface TempChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function apiFetch<T>(path: string, options?: RequestInit, token?: string | null): Promise<T | null> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  if (res.status === 204) return null;
  return res.json() as Promise<T>;
}

function mapConv(c: ApiConversation): Conversation {
  return {
    ...c,
    current_step: c.currentStep ?? c.current_step ?? 0,
    created_at: c.createdAt ?? c.created_at ?? "",
    updated_at: c.updatedAt ?? c.updated_at ?? "",
  };
}

function mapMsg(m: ApiMessage): Message {
  return {
    id: m.id,
    conversation_id: m.conversationId ?? m.conversation_id ?? "",
    role: m.role,
    content: m.content,
    created_at: m.createdAt ?? m.created_at ?? "",
  };
}

const Index = () => {
  const { user } = useAuth();
  const { getToken } = useClerkAuth();
  useNewUserSync();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [pdfLoadingStep, setPdfLoadingStep] = useState<string | null>(null);
  const [showFiscalModal, setShowFiscalModal] = useState(false);
  const [showAcquisitionModal, setShowAcquisitionModal] = useState(false);
  const [pendingStepAfterDisclaimer, setPendingStepAfterDisclaimer] = useState<number | null>(null);
  const restorationProcessed = useRef(false);
  const continuationPromptShownFor = useRef<string | null>(null);
  const nextStepPromptedLabels = useRef<Set<string>>(new Set());
  const [pdfProgressStage, setPdfProgressStage] = useState<string | null>(null);

  // Safety: reset any stale loading state on mount (e.g. after HMR mid-request)
  useEffect(() => { setPdfLoadingStep(null); setPdfProgressStage(null); }, []);

  const FISCAL_DISCLAIMER_STEP = 6;      // sidebar index 6 = "Statut et Fiscalité"
  const ACQUISITION_DISCLAIMER_STEP = 8; // sidebar index 8 = "Acquisition Client"

  const authedFetch = useCallback(
    async <T,>(path: string, options?: RequestInit): Promise<T | null> => {
      const token = await getToken();
      return apiFetch<T>(path, options, token);
    },
    [getToken],
  );

  const fetchMessages = useCallback(async (id: string) => {
    try {
      const data = await authedFetch<ApiMessage[]>(`/conversations/${id}/messages`);
      setMessages((data ?? []).map(mapMsg));
    } catch (e) {
      console.error("Fetch messages error:", e);
    }
  }, [authedFetch]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await authedFetch<ApiConversation[]>("/conversations");
      const convs = (data ?? []).map(mapConv);
      setConversations(convs);
      if (!conversationId && convs[0]) {
        setConversationId(convs[0].id);
        setCurrentStep(convs[0].current_step || 0);
        await fetchMessages(convs[0].id);
      }
    } catch (e) {
      console.error("Fetch conversations error:", e);
    }
  }, [conversationId, fetchMessages, user, authedFetch]);

  const handleCreateConversation = async (title: string): Promise<string | null> => {
    if (!user) return null;
    try {
      setMessages([]);
      const data = await authedFetch<ApiConversation>("/conversations", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      if (!data) return null;
      const conv = mapConv(data);
      setConversationId(conv.id);
      setCurrentStep(conv.current_step || 0);
      setConversations((prev) => [conv, ...prev]);
      return conv.id;
    } catch (e) {
      toast.error("Erreur lors de la création de la conversation");
      return null;
    }
  };

  const handleSaveMessage = async (id: string, role: "user" | "assistant", content: string) => {
    try {
      const data = await authedFetch<ApiMessage>(`/conversations/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ role, content }),
      });
      if (data) setMessages((prev) => [...prev, mapMsg(data)]);
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement du message");
    }
  };

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const restoreTemporaryChat = async () => {
      if (!user || restorationProcessed.current) return;
      const rawChat = localStorage.getItem("temp_chat");
      if (!rawChat) return;

      restorationProcessed.current = true;
      try {
        const parsed = JSON.parse(rawChat) as unknown[];
        const temporaryMessages = parsed.filter(
          (msg): msg is TempChatMessage =>
            typeof msg === "object" &&
            msg !== null &&
            "role" in msg &&
            "content" in msg &&
            typeof (msg as TempChatMessage).role === "string" &&
            typeof (msg as TempChatMessage).content === "string",
        );
        const uniqueMessages = temporaryMessages.filter(
          (msg, index, list) =>
            list.findIndex(
              (item) => item.role === msg.role && item.content === msg.content,
            ) === index,
        );

        const newConversationId = await handleCreateConversation("Analyse récupérée");
        if (!newConversationId) throw new Error("Conversation non créée");

        await authedFetch<ApiMessage[]>(
          `/conversations/${newConversationId}/messages/bulk`,
          {
            method: "POST",
            body: JSON.stringify({
              messages: uniqueMessages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            }),
          },
        );

        await fetchMessages(newConversationId);
        localStorage.removeItem("temp_chat");
        localStorage.removeItem("pending_anon_chat");
        toast.success("Discussion récupérée !");
      } catch (error) {
        console.error("Échec restauration chat temporaire:", error);
        restorationProcessed.current = false;
      }
    };

    void restoreTemporaryChat();
  }, [fetchMessages, user]);

  const handleRenameConversation = async (id: string, title: string) => {
    try {
      await authedFetch<ApiConversation>(`/conversations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c)),
      );
    } catch (e) {
      console.error("Error renaming conversation:", e);
    }
  };

  const handleStepChange = async (step: number) => {
    setCurrentStep(step);
    if (conversationId) {
      try {
        await authedFetch<ApiConversation>(`/conversations/${conversationId}`, {
          method: "PATCH",
          body: JSON.stringify({ currentStep: step }),
        });
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, current_step: step } : c,
          ),
        );
      } catch (e) {
        console.error("Error updating step:", e);
      }
    }
  };

  const handleSwitchConversation = async (id: string) => {
    const conversation = conversations.find((item) => item.id === id);
    setConversationId(id);
    setCurrentStep(conversation?.current_step ?? 0);
    await fetchMessages(id);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await authedFetch<null>(`/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        setConversationId(null);
        setMessages([]);
        setCurrentStep(0);
      }
    } catch (e) {
      toast.error("Erreur lors de la suppression de la conversation");
    }
  };

  const handleDownloadStepPdf = async (stepId: number, stepLabel: string) => {
    if (!messages.length) {
      toast.error("Aucun message à synthétiser pour cette étape.");
      return;
    }
    if (pdfLoadingStep) return;
    setPdfLoadingStep(stepLabel);
    try {
      const token = await getToken();
      const chatMessages = messages.map((m) => ({ role: m.role, content: m.content }));
      const projectName = activeConversationTitle ?? "Analyse";
      const report = await fetchStepReport(chatMessages, projectName, stepLabel, token);
      renderStepPdf(report, projectName, stepLabel);

      // Inject "next step" prompt once per step label per conversation
      const promptKey = `${conversationId}:${stepLabel}`;
      if (conversationId && !nextStepPromptedLabels.current.has(promptKey)) {
        nextStepPromptedLabels.current.add(promptKey);
        void handleSaveMessage(
          conversationId,
          "assistant",
          `Ta fiche **${stepLabel}** est prête. On passe à l'étape suivante ?\n\n%%NEXT%%`,
        );
      }
    } catch (err) {
      toast.error((err as Error).message ?? "Erreur lors de la génération de la fiche");
    } finally {
      setPdfLoadingStep(null);
    }
  };

  const handleDownloadFinalPdf = async () => {
    if (!messages.length) {
      toast.error("Aucun message à synthétiser.");
      return;
    }
    if (pdfLoadingStep) return;
    setPdfLoadingStep("final");
    setPdfProgressStage("Génération des fiches étapes…");
    try {
      const token = await getToken();
      const chatMessages = messages.map((m) => ({ role: m.role, content: m.content }));
      const projectName = activeConversationTitle ?? "Analyse";

      // Step fiches first (max 3 concurrent) — sequential to avoid rate-limit 429
      const stepReports = await fetchAllStepReports(
        chatMessages, projectName, token,
        (_label, done, total) => {
          setPdfProgressStage(`Fiches étapes… (${done}/${total})`);
        },
      );

      // Then synthesis alone
      setPdfProgressStage("Génération de la synthèse finale…");
      const synthesisReport = await fetchSynthesis(chatMessages, projectName, token);

      setPdfProgressStage("Compilation du rapport PDF complet…");
      renderCompilationPdf(stepReports, synthesisReport, projectName);

      // Inject continuation prompt once per conversation
      if (conversationId && continuationPromptShownFor.current !== conversationId) {
        continuationPromptShownFor.current = conversationId;
        void handleSaveMessage(
          conversationId,
          "assistant",
          "**Votre rapport complet est prêt.** 📄\n\nIl compile les 9 fiches étapes et la synthèse finale en un seul document. Si tu veux aller plus loin, je peux :\n\n- **Approfondir un point** de l'analyse (économie, marché, acquisition…)\n- **Retravailler une étape** avec de nouvelles données ou hypothèses\n- **Challenger ton modèle** sur des points spécifiques\n- **Répondre à une question libre** sur ton projet\n\nDis-moi ce que tu veux explorer.",
        );
      }
    } catch (err) {
      toast.error((err as Error).message ?? "Erreur lors de la génération du rapport");
    } finally {
      setPdfLoadingStep(null);
      setPdfProgressStage(null);
    }
  };

  const completedSteps = Array.from({ length: currentStep }, (_, index) => index);

  const activeConversationTitle =
    conversations.find((c) => c.id === conversationId)?.title ?? null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar
        currentStep={currentStep}
        onStepChange={(step) => {
          if (step === FISCAL_DISCLAIMER_STEP && currentStep < FISCAL_DISCLAIMER_STEP) {
            setShowFiscalModal(true);
            setPendingStepAfterDisclaimer(FISCAL_DISCLAIMER_STEP + 1);
          } else if (step === ACQUISITION_DISCLAIMER_STEP && currentStep < ACQUISITION_DISCLAIMER_STEP) {
            setShowAcquisitionModal(true);
            setPendingStepAfterDisclaimer(ACQUISITION_DISCLAIMER_STEP + 1);
          } else {
            void handleStepChange(step);
          }
        }}
        completedSteps={completedSteps}
        conversations={conversations}
        activeConversationId={conversationId}
        onNewConversation={() => void handleCreateConversation("Nouvelle analyse")}
        onSwitchConversation={handleSwitchConversation}
        onDeleteConversation={handleDeleteConversation}
        onDownloadStepPdf={handleDownloadStepPdf}
        onDownloadFinalPdf={handleDownloadFinalPdf}
        pdfLoadingStep={pdfLoadingStep}
      />
      <main className="flex-1 min-w-0 flex flex-col">
        <MainHeader conversationTitle={activeConversationTitle} />
        <div className="relative flex-1 min-h-0 flex flex-col">
          <PdfProgressOverlay
            isVisible={pdfLoadingStep !== null}
            isFinal={pdfLoadingStep === "final"}
            onCancel={() => { setPdfLoadingStep(null); setPdfProgressStage(null); }}
            stage={pdfProgressStage ?? undefined}
          />
          <ChatPanel
            conversationId={conversationId}
            conversationTitle={activeConversationTitle}
            persistedMessages={messages}
            saveMessage={handleSaveMessage}
            onCreateConversation={handleCreateConversation}
            onRenameConversation={handleRenameConversation}
            onDownloadFiche={(label) => {
              if (label === "Synthèse") {
                void handleDownloadFinalPdf();
              } else {
                void handleDownloadStepPdf(0, label);
              }
            }}
            onStepDetected={(detectedStep) => {
              if (detectedStep > currentStep) {
                if (currentStep < FISCAL_DISCLAIMER_STEP && detectedStep >= FISCAL_DISCLAIMER_STEP) {
                  setShowFiscalModal(true);
                  setPendingStepAfterDisclaimer(detectedStep);
                } else if (currentStep < ACQUISITION_DISCLAIMER_STEP && detectedStep >= ACQUISITION_DISCLAIMER_STEP) {
                  setShowAcquisitionModal(true);
                  setPendingStepAfterDisclaimer(detectedStep);
                } else {
                  void handleStepChange(detectedStep);
                }
              }
            }}
            onNextStep={() => {
              const next = currentStep + 1;
              if (next <= 9) void handleStepChange(next);
            }}
          />
          {showFiscalModal && (
            <FiscalDisclaimer
              onContinue={() => {
                setShowFiscalModal(false);
                const next = pendingStepAfterDisclaimer ?? FISCAL_DISCLAIMER_STEP + 1;
                setPendingStepAfterDisclaimer(null);
                if (conversationId) {
                  void handleSaveMessage(
                    conversationId,
                    "assistant",
                    "**✓ Étape 7/10 — Statut et Fiscalité validée**\n\nVous avez pris connaissance de l'avertissement : je ne suis pas qualifié pour donner des conseils juridiques ou fiscaux. Consultez un expert-comptable ou un conseiller juridique pour toute décision liée à votre statut ou régime fiscal.\n\n*Cette étape est confirmée. Passons à la faisabilité.*",
                  );
                }
                void handleStepChange(next);
              }}
            />
          )}
          {showAcquisitionModal && (
            <AcquisitionDisclaimer
              onContinue={() => {
                setShowAcquisitionModal(false);
                const next = pendingStepAfterDisclaimer ?? ACQUISITION_DISCLAIMER_STEP + 1;
                setPendingStepAfterDisclaimer(null);
                if (conversationId) {
                  void handleSaveMessage(
                    conversationId,
                    "assistant",
                    "**✓ Étape 9/10 — Acquisition Client : priorité absolue notée**\n\nVous avez pris connaissance de l'avertissement : je ne suis pas qualifié pour vous conseiller sur les tactiques d'acquisition. Sans acquisition maîtrisée, votre projet ne peut pas survivre.\n\n**La seule recommandation que je peux formuler :** formez-vous spécifiquement à l'acquisition client ou faites appel à un professionnel qualifié.\n\n*Passons au diagnostic.*",
                  );
                }
                void handleStepChange(next);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
