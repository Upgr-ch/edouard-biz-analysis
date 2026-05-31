import { cn } from "@/lib/utils";
import {
  Target, BarChart3, Grid3X3, Flag, Calculator, TrendingUp, Users, FileText,
  ChevronLeft, ChevronRight, Plus, Trash2, MessageSquare, Check, Scale, Menu, X, Brain,
  Download, Loader2,
} from "lucide-react";
import { useState } from "react";
import type { Conversation } from "@/hooks/useConversations";
import { BrainLogoSm } from "@/components/BrainLogo";
import SidebarAdBanner from "@/components/ads/SidebarAdBanner";

const steps = [
  { id: 0, label: "Projet",                  icon: Brain },
  { id: 1, label: "Cadrage",                 icon: Target },
  { id: 2, label: "Marché",                  icon: BarChart3 },
  { id: 3, label: "Diagnostic",              icon: Grid3X3 },
  { id: 4, label: "Objectifs",               icon: Flag },
  { id: 5, label: "Économie & Financement",  icon: Calculator },
  { id: 6, label: "Statut et Fiscalité",     icon: Scale },
  { id: 7, label: "Faisabilité",             icon: TrendingUp },
  { id: 8, label: "Acquisition",             icon: Users },
  { id: 9, label: "Synthèse",                icon: FileText },
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
  onDownloadStepPdf?: (stepId: number, stepLabel: string) => void;
  onDownloadFinalPdf?: () => void;
  pdfLoadingStep?: string | null;
}

const SidebarContent = ({
  collapsed,
  currentStep,
  onStepChange,
  completedSteps,
  conversations,
  activeConversationId,
  onNewConversation,
  onSwitchConversation,
  onDeleteConversation,
  onClose,
  onDownloadStepPdf,
  onDownloadFinalPdf,
  pdfLoadingStep,
}: AppSidebarProps & { collapsed: boolean; onClose?: () => void }) => {
  const progressPercent = Math.round((completedSteps.length / steps.length) * 100);

  return (
    <>
      {/* ── Header ── */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <BrainLogoSm />
            <div>
              <span
                className="font-semibold text-sm block leading-tight"
                style={{ color: "#F5E090", fontFamily: "var(--up-font)" }}
              >
                Édouard
              </span>
              <span className="text-[10px] text-muted-foreground" style={{ letterSpacing: "0.02em" }}>
                Consultant en faisabilité et rentabilité de projets business.
              </span>
            </div>
          </div>
        ) : (
          <BrainLogoSm />
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Progress bar ── */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Progression
            </span>
            <span className="text-[10px] font-semibold" style={{ color: "#F5E090" }}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-1 bg-accent rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #B48C28, #F5E090)",
              }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground/60 mt-1 block">
            {completedSteps.length}/{steps.length} étapes complétées
          </span>
        </div>
      )}

      {/* ── New conversation button ── */}
      <div className="border-b border-border shrink-0">
        <div className="p-2">
          <button
            onClick={onNewConversation}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-sm transition-all border",
              collapsed && "justify-center px-2",
            )}
            style={{
              background: "rgba(245,224,144,0.06)",
              borderColor: "rgba(245,224,144,0.18)",
              color: "#F5E090",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(245,224,144,0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(245,224,144,0.06)"; }}
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
                className="group flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs cursor-pointer transition-colors"
                style={
                  conv.id === activeConversationId
                    ? { background: "rgba(245,224,144,0.08)", color: "#F5E090" }
                    : { color: "rgba(255,255,255,0.50)" }
                }
                onClick={() => { onSwitchConversation(conv.id); onClose?.(); }}
                onMouseEnter={(e) => {
                  if (conv.id !== activeConversationId)
                    e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                }}
                onMouseLeave={(e) => {
                  if (conv.id !== activeConversationId)
                    e.currentTarget.style.color = "rgba(255,255,255,0.50)";
                }}
              >
                <MessageSquare className="w-3 h-3 flex-shrink-0" />
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto p-0.5 hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Steps ── */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {!collapsed && (
          <div className="px-4 mb-2">
            <span
              className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
              style={{ letterSpacing: "0.25em" }}
            >
              Étapes d'analyse
            </span>
          </div>
        )}

        <div className="relative">
          {steps.map((step, index) => {
            const isActive    = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            const isSynthese  = step.id === 9;
            const stepNumber  = index + 1;
            const isLast      = index === steps.length - 1;

            // Show final PDF button on step 9 when active or completed
            const showFinalBtn = isSynthese && !collapsed && (isActive || isCompleted);
            // Show step PDF button on completed steps 0–8
            const showStepBtn  = !isSynthese && isCompleted && !collapsed;

            const stepKey = step.label;
            const isThisLoading = pdfLoadingStep === stepKey || (isSynthese && pdfLoadingStep === "final");

            return (
              <div key={step.id} className="relative group/step">
                {/* Connector line */}
                {!isLast && (
                  <div
                    className="absolute top-[2.25rem] w-[1px] h-[calc(100%-0.5rem)]"
                    style={{
                      left: collapsed ? "1.85rem" : "1.65rem",
                      background: isCompleted
                        ? "rgba(245,224,144,0.35)"
                        : "rgba(255,255,255,0.08)",
                    }}
                  />
                )}

                <div className="flex items-center">
                  <button
                    onClick={() => { onStepChange(step.id); onClose?.(); }}
                    className={cn(
                      "flex-1 flex items-center gap-3 px-3 py-2 text-sm transition-all relative z-10",
                      collapsed && "justify-center px-2",
                    )}
                    style={{
                      color: isActive
                        ? "#F5E090"
                        : isCompleted
                          ? "rgba(255,255,255,0.80)"
                          : "rgba(255,255,255,0.45)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isActive
                        ? "#F5E090"
                        : isCompleted
                          ? "rgba(255,255,255,0.80)"
                          : "rgba(255,255,255,0.45)";
                    }}
                  >
                    {/* Step circle */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold border-2 transition-all"
                      style={
                        isActive
                          ? {
                              borderColor: "#F5E090",
                              background: "rgba(245,224,144,0.12)",
                              color: "#F5E090",
                              boxShadow: "0 0 10px rgba(245,224,144,0.25)",
                            }
                          : isCompleted
                            ? {
                                borderColor: "#B48C28",
                                background: "#B48C28",
                                color: "#080F1E",
                              }
                            : {
                                borderColor: "rgba(255,255,255,0.12)",
                                background: "rgba(255,255,255,0.03)",
                                color: "rgba(255,255,255,0.40)",
                              }
                      }
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNumber}
                    </div>

                    {!collapsed && (
                      <div className="flex flex-col items-start min-w-0">
                        <span
                          className="font-medium text-xs leading-tight truncate"
                          style={{ color: isActive ? "#F5E090" : "#ffffff" }}
                        >
                          {step.label}
                        </span>
                        <span
                          className="text-[10px] leading-tight"
                          style={{ color: isActive ? "rgba(245,224,144,0.55)" : "rgba(255,255,255,0.28)" }}
                        >
                          Étape {stepNumber}/{steps.length}
                        </span>
                      </div>
                    )}

                    {isActive && !collapsed && !showStepBtn && !showFinalBtn && (
                      <div
                        className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: "#F5E090" }}
                      />
                    )}
                  </button>

                  {/* Step fiche PDF button (steps 0–8 completed) */}
                  {showStepBtn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadStepPdf?.(step.id, step.label);
                      }}
                      disabled={!!pdfLoadingStep}
                      title={`Télécharger la fiche ${step.label}`}
                      className="flex-shrink-0 mr-2 p-1.5 rounded transition-all opacity-0 group-hover/step:opacity-100 z-10 relative"
                      style={{ color: isThisLoading ? "#F5E090" : "rgba(245,224,144,0.55)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#F5E090"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = isThisLoading ? "#F5E090" : "rgba(245,224,144,0.55)"; }}
                    >
                      {isThisLoading
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Download className="w-3 h-3" />}
                    </button>
                  )}

                  {/* Final synthesis PDF button (step 9) */}
                  {showFinalBtn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadFinalPdf?.();
                      }}
                      disabled={!!pdfLoadingStep}
                      title="Télécharger la synthèse complète"
                      className="flex-shrink-0 mr-2 p-1.5 rounded transition-all z-10 relative"
                      style={{ color: isThisLoading ? "#F5E090" : "rgba(245,224,144,0.70)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#F5E090"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = isThisLoading ? "#F5E090" : "rgba(245,224,144,0.70)"; }}
                    >
                      {isThisLoading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <FileText className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* ── Sidebar Ad Banner (desktop, 300×250) ── */}
      <SidebarAdBanner />

      {/* ── En savoir plus (SEO content accordion) ── */}
      {!collapsed && (
        <div className="shrink-0 border-t border-border" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <details className="group">
            <summary
              className="flex items-center justify-between px-4 py-3 cursor-pointer select-none list-none"
              style={{ fontFamily: "var(--up-font)" }}
            >
              <span
                className="text-[10px] font-medium uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.20em" }}
              >
                En savoir plus
              </span>
              <svg
                className="w-3 h-3 transition-transform duration-200 group-open:rotate-180"
                style={{ color: "rgba(255,255,255,0.25)" }}
                viewBox="0 0 12 12" fill="none"
              >
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </summary>
            <div
              className="px-4 pb-4 overflow-y-auto"
              style={{ maxHeight: "260px", fontFamily: "var(--up-font)" }}
            >
              <h3
                className="text-[10px] font-semibold mb-2 leading-tight"
                style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}
              >
                Guide de Viabilité et de Crash-Test d'Entreprise
              </h3>
              <p
                className="text-[10px] leading-relaxed mb-2"
                style={{ color: "rgba(255,255,255,0.30)" }}
              >
                Évaluer la solidité d'un projet avant son lancement est la clé pour éviter le gaspillage de ressources. Un crash-test chirurgical repose sur trois piliers fondamentaux :
              </p>
              <ul className="space-y-2" style={{ paddingLeft: 0, listStyle: "none" }}>
                <li>
                  <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>
                    <span style={{ color: "rgba(245,224,144,0.55)", fontWeight: 600 }}>Adéquation Offre-Marché</span>
                    {" "}— Valider qu'une expertise répond à une douleur aiguë, urgente et reconnue par une cible précise.
                  </p>
                </li>
                <li>
                  <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>
                    <span style={{ color: "rgba(245,224,144,0.55)", fontWeight: 600 }}>Rentabilité & Point Mort</span>
                    {" "}— S'appuyer sur des bases financières strictes pour couvrir charges fixes et variables.
                  </p>
                </li>
                <li>
                  <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>
                    <span style={{ color: "rgba(245,224,144,0.55)", fontWeight: 600 }}>Barrières & Concurrence</span>
                    {" "}— Analyser les forces en présence pour positionner l'offre de manière stratégique.
                  </p>
                </li>
              </ul>
            </div>
          </details>
        </div>
      )}

      {/* ── Footer ── */}
      {!collapsed && (
        <div className="p-4 border-t border-border shrink-0">
          <p className="text-[10px] leading-relaxed" style={{ color: "#ffffff" }}>
            Les analyses fournies sont des recommandations. L'utilisateur reste seul responsable des décisions.
          </p>
        </div>
      )}
    </>
  );
};

const AppSidebar = (props: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded border text-muted-foreground backdrop-blur-sm"
        style={{ background: "rgba(8,15,30,0.85)", borderColor: "rgba(245,224,144,0.18)" }}
      >
        <Menu className="w-5 h-5" style={{ color: "#F5E090" }} />
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 border-r border-border",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ background: "var(--up-bg)" }}
      >
        <SidebarContent {...props} collapsed={false} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          "hidden md:flex h-screen flex-col transition-all duration-300 border-r border-border relative",
          collapsed ? "w-16" : "w-64",
        )}
        style={{ background: "rgba(8,15,30,0.95)" }}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 -right-3 z-10 w-6 h-6 rounded-full border flex items-center justify-center shadow transition-colors"
          style={{
            background: "var(--up-bg)",
            borderColor: "rgba(245,224,144,0.20)",
            color: "rgba(245,224,144,0.60)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#F5E090"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(245,224,144,0.60)"; }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        <SidebarContent {...props} collapsed={collapsed} />
      </aside>
    </>
  );
};

export default AppSidebar;
