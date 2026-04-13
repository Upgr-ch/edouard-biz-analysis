import { cn } from "@/lib/utils";
import {
  Target, BarChart3, Grid3X3, Flag, Calculator, TrendingUp, Users, FileText,
  Brain, ChevronLeft, ChevronRight, Plus, Trash2, MessageSquare, Check
} from "lucide-react";
import { useState } from "react";
import type { Conversation } from "@/hooks/useConversations";

const steps = [
  { id: 0, label: "Projet", icon: Brain },
  { id: 1, label: "Cadrage", icon: Target },
  { id: 2, label: "Marché", icon: BarChart3 },
  { id: 3, label: "Diagnostic", icon: Grid3X3 },
  { id: 4, label: "Objectifs", icon: Flag },
  { id: 5, label: "Économie & Financement", icon: Calculator },
  { id: 6, label: "Faisabilité", icon: TrendingUp },
  { id: 7, label: "Acquisition", icon: Users },
  { id: 8, label: "Synthèse", icon: FileText },
];

interface AppSidebarProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  completedSteps: number[];
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewConversation: () => void;
  onSwitchConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

const AppSidebar = ({
  currentStep, onStepChange, completedSteps,
  conversations, activeConversationId,
  onNewConversation, onSwitchConversation, onDeleteConversation,
}: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const progressPercent = Math.round((completedSteps.length / steps.length) * 100);

  return (
    <aside
      className={cn(
        "h-screen bg-secondary/50 border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-sm block leading-tight">Édouard</span>
              <span className="text-[10px] text-muted-foreground">Consultant IA</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Progress bar */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Progression</span>
            <span className="text-[10px] font-semibold text-primary">{progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-accent rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground/60 mt-1 block">
            {completedSteps.length}/{steps.length} étapes complétées
          </span>
        </div>
      )}

      {/* Conversations */}
      <div className="border-b border-border">
        <div className="p-2">
          <button
            onClick={onNewConversation}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
              "bg-primary/10 text-primary hover:bg-primary/20",
              collapsed && "justify-center px-2"
            )}
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
            {!collapsed && <span>Nouvelle analyse</span>}
          </button>
        </div>

        {!collapsed && conversations.length > 0 && (
          <div className="px-2 pb-2 max-h-32 overflow-y-auto space-y-0.5">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors",
                  conv.id === activeConversationId
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                onClick={() => onSwitchConversation(conv.id)}
              >
                <MessageSquare className="w-3 h-3 flex-shrink-0" />
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Steps with numbered progression */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {!collapsed && (
          <div className="px-4 mb-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Étapes d'analyse</span>
          </div>
        )}

        <div className="relative">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            const Icon = step.icon;
            const stepNumber = index + 1;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Vertical connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-[1.65rem] top-[2.25rem] w-[2px] h-[calc(100%-0.5rem)]",
                      collapsed ? "left-[1.85rem]" : "left-[1.65rem]",
                      isCompleted ? "bg-primary/40" : "bg-border"
                    )}
                  />
                )}

                <button
                  onClick={() => onStepChange(step.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm transition-all relative z-10",
                    isActive
                      ? "text-primary"
                      : isCompleted
                        ? "text-foreground/80"
                        : "text-muted-foreground hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  {/* Step number circle */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold border-2 transition-all",
                      isActive
                        ? "border-primary bg-primary/15 text-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]"
                        : isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-secondary text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      stepNumber
                    )}
                  </div>

                  {!collapsed && (
                    <div className="flex flex-col items-start min-w-0">
                      <span className={cn(
                        "font-medium text-xs leading-tight truncate",
                        isActive && "text-primary"
                      )}>
                        {step.label}
                      </span>
                      <span className={cn(
                        "text-[10px] leading-tight",
                        isActive ? "text-primary/60" : "text-muted-foreground/50"
                      )}>
                        Étape {stepNumber}/{steps.length}
                      </span>
                    </div>
                  )}

                  {/* Active indicator */}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
            Les analyses fournies sont des recommandations. L'utilisateur reste seul responsable des décisions.
          </p>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
