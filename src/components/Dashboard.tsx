import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import ChatPanel from "@/components/ChatPanel";
import StepContent from "@/components/StepContent";
import MobileNav from "@/components/MobileNav";

const stepLabels = ["Projet", "Cadrage", "Marché", "SWOT", "Objectifs", "Économie", "Faisabilité", "Acquisition", "Synthèse"];

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [mobileView, setMobileView] = useState<"steps" | "chat">("steps");

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          completedSteps={completedSteps}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Step content */}
        <div className={`flex-1 overflow-y-auto pb-20 md:pb-0 ${mobileView === "chat" ? "hidden md:block" : ""}`}>
          {/* Mobile step selector */}
          <div className="md:hidden p-4 border-b border-border overflow-x-auto">
            <div className="flex gap-2">
              {stepLabels.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentStep === i
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-card text-muted-foreground border border-border"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <StepContent currentStep={currentStep} />
        </div>

        {/* Chat panel */}
        <div className={`md:w-[420px] md:border-l border-border ${mobileView === "steps" ? "hidden md:flex md:flex-col" : "flex flex-col flex-1 pb-16 md:pb-0"}`}>
          <ChatPanel stepContext={stepLabels[currentStep]} />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav view={mobileView} onViewChange={setMobileView} />
    </div>
  );
};

export default Dashboard;
