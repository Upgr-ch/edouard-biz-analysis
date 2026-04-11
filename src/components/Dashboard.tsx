import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import ChatPanel from "@/components/ChatPanel";
import { Menu, Brain, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const stepLabels = ["Projet", "Cadrage", "Marché", "Diagnostic", "Objectifs", "Économie", "Faisabilité", "Acquisition", "Synthèse"];

const Dashboard = () => {
  const { signOut } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block shrink-0">
        <AppSidebar
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          completedSteps={completedSteps}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 shadow-xl">
            <AppSidebar
              currentStep={currentStep}
              onStepChange={(step) => {
                setCurrentStep(step);
                setSidebarOpen(false);
              }}
              completedSteps={completedSteps}
            />
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center md:hidden">
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
            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 min-h-0">
          <ChatPanel stepContext={stepLabels[currentStep]} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
