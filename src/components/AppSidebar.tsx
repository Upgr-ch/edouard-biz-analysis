import { cn } from "@/lib/utils";
import {
  Target, BarChart3, Grid3X3, Flag, Calculator, TrendingUp, Users, FileText,
  Brain, ChevronLeft, ChevronRight
} from "lucide-react";
import { useState } from "react";

const steps = [
  { id: 0, label: "Projet", icon: Brain, short: "PRJ" },
  { id: 1, label: "Cadrage", icon: Target, short: "CAD" },
  { id: 2, label: "Marché", icon: BarChart3, short: "MKT" },
  { id: 3, label: "Diagnostic", icon: Grid3X3, short: "DIA" },
  { id: 4, label: "Objectifs", icon: Flag, short: "OBJ" },
  { id: 5, label: "Économie", icon: Calculator, short: "ECO" },
  { id: 6, label: "Faisabilité", icon: TrendingUp, short: "FEA" },
  { id: 7, label: "Acquisition", icon: Users, short: "ACQ" },
  { id: 8, label: "Synthèse", icon: FileText, short: "SYN" },
];

interface AppSidebarProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  completedSteps: number[];
}

const AppSidebar = ({ currentStep, onStepChange, completedSteps }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen bg-secondary/50 border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-sm">Édouard</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Steps */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => onStepChange(step.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all",
                isActive
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                collapsed && "justify-center px-2"
              )}
            >
              <div className="relative">
                <Icon className="w-4 h-4 flex-shrink-0" />
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-decision-viable" />
                )}
              </div>
              {!collapsed && (
                <span className="font-medium">{step.label}</span>
              )}
            </button>
          );
        })}
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
