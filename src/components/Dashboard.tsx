

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import ChatPanel from "@/components/ChatPanel";
import FiscalDisclaimer from "@/components/FiscalDisclaimer";
import { Menu, Brain, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import { useAnonMigration } from "@/hooks/useAnonMigration";

const stepLabels = ["Projet", "Cadrage", "Marché", "Diagnostic", "Objectifs", "Économie & Financement", "Statut et Fiscalité", "Faisabilité", "Acquisition", "Synthèse"];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isAnonymous = !user;
  const {
    conversations, activeConversation, activeConversationId,
    messages, setMessages,
    loading,
    createConversation, deleteConversation, updateTitle, updateStep,
    saveMessage, updateMessageContent, switchConversation,
    loadConversations,
  } = useConversations();

  // Migrate anonymous chat into a real conversation on first login
  useAnonMigration(async () => {
    await loadConversations();
  });

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentStep = activeConversation?.current_step ?? 0;

  const handleStepChange = (step: number) => {
    if (activeConversationId) {
      updateStep(activeConversationId, step);
    }
  };

  const handleStepDetected = (step: number) => {
    if (activeConversationId && step !== currentStep) {
      updateStep(activeConversationId, step);
      // Mark previous steps as completed
      setCompletedSteps(prev => {
        const newCompleted = [...prev];
        for (let i = 0; i < step; i++) {
          if (!newCompleted.includes(i)) newCompleted.push(i);
        }
        return newCompleted;
      });
    }
  };

  const handleNewConversation = async () => {
    await createConversation();
  };

  const sidebarProps = {
    currentStep,
    onStepChange: handleStepChange,
    completedSteps,
    conversations,
    activeConversationId,
    onNewConversation: handleNewConversation,
    onSwitchConversation: switchConversation,
    onDeleteConversation: deleteConversation,
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center animate-pulse">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-muted-foreground text-sm">Chargement…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop sidebar — hidden for anonymous users */}
      {!isAnonymous && (
        <div className="hidden md:block shrink-0">
          <AppSidebar {...sidebarProps} />
        </div>
      )}

      {/* Mobile sidebar overlay — hidden for anonymous users */}
      {!isAnonymous && sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 shadow-xl">
            <AppSidebar
              {...sidebarProps}
              onStepChange={(step) => {
                handleStepChange(step);
                setSidebarOpen(false);
              }}
              onSwitchConversation={(id) => {
                switchConversation(id);
                setSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {!isAnonymous && (
              <button
                className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">Édouard</h1>
            </div>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Consultant en faisabilité & rentabilité
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-decision-viable animate-pulse" />
              <span className="text-xs text-muted-foreground">En ligne</span>
            </div>
            {isAnonymous ? (
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                Se connecter
              </button>
            ) : (
              <button
                onClick={signOut}
                className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Chat or Fiscal Disclaimer */}
        <div className="flex-1 min-h-0">
          {currentStep === 6 ? (
            <FiscalDisclaimer
              onContinue={() => {
                if (activeConversationId) {
                  updateStep(activeConversationId, 7);
                }
              }}
            />
          ) : (
            <ChatPanel
              stepContext={`Étape ${currentStep + 1}/10 — ${stepLabels[currentStep]}`}
              conversationId={activeConversationId}
              conversationTitle={activeConversation?.title}
              currentStep={currentStep}
              persistedMessages={messages}
              setPersistedMessages={setMessages}
              saveMessage={saveMessage}
              updateMessageContent={updateMessageContent}
              onUpdateTitle={updateTitle}
              onCreateConversation={createConversation}
              onStepDetected={handleStepDetected}
            />
          )}
        </div>

        {/* Footer legal links */}
        <div className="px-4 py-2 border-t border-border bg-card/30 flex items-center justify-center gap-1 flex-wrap">
          {[
            { label: "Politique de cookies", path: "/cookies" },
            { label: "Politique de confidentialité", path: "/confidentialite" },
            { label: "Mentions légales", path: "/mentions-legales" },
            { label: "CGV", path: "/cgv" },
            { label: "CGU", path: "/cgu" },
          ].map((item, i, arr) => (
            <span key={item.path} className="flex items-center">
              <Link to={item.path} target="_blank" className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                {item.label}
              </Link>
              {i < arr.length - 1 && <span className="text-muted-foreground/30 mx-1 text-[10px]">|</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
