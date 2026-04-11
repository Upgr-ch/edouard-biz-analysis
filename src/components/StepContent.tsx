import { cn } from "@/lib/utils";
import {
  Target, BarChart3, Grid3X3, Flag, Calculator, TrendingUp, Users, FileText, Brain,
  ArrowRight, AlertTriangle
} from "lucide-react";

const stepData = [
  {
    id: 0,
    title: "Création du Projet",
    icon: Brain,
    description: "Nomme ton projet et décris ton idée business.",
    fields: ["Nom du projet", "Description de l'idée", "Secteur d'activité"],
  },
  {
    id: 1,
    title: "Cadrage",
    icon: Target,
    description: "Définissons les fondations de ton projet.",
    fields: ["Idée", "Cible", "Problème résolu", "Prix envisagé", "Stratégie d'acquisition", "Volume visé"],
  },
  {
    id: 2,
    title: "Analyse de Marché",
    icon: BarChart3,
    description: "Étudions la concurrence et la demande réelle.",
    fields: ["Concurrence directe", "Demande identifiée", "Tendances du marché"],
  },
  {
    id: 3,
    title: "Analyse SWOT",
    icon: Grid3X3,
    description: "Forces, faiblesses, opportunités, menaces.",
    fields: ["Forces", "Faiblesses", "Opportunités", "Menaces"],
  },
  {
    id: 4,
    title: "Objectifs",
    icon: Flag,
    description: "Fixons des objectifs mesurables.",
    fields: ["CA visé", "Nombre de clients", "Délai"],
  },
  {
    id: 5,
    title: "Modèle Économique & Fiscalité",
    icon: Calculator,
    description: "Prix, coûts, marges, charges et revenu net réel.",
    fields: ["Prix de vente", "Coûts", "Marge", "Pays", "Statut juridique", "Charges & impôts"],
  },
  {
    id: 6,
    title: "Faisabilité & Rentabilité",
    icon: TrendingUp,
    description: "Verdict basé sur les données réelles.",
    fields: ["Marché réel", "Acquisition client", "Rentabilité", "Risques majeurs"],
  },
  {
    id: 7,
    title: "Acquisition Client",
    icon: Users,
    description: "L'étape la plus critique. Sans clients, pas de business.",
    fields: ["Canaux", "Stratégie", "Volume réaliste", "Test terrain 7 jours"],
  },
  {
    id: 8,
    title: "Synthèse & Export",
    icon: FileText,
    description: "Rapport complet et verdict final.",
    fields: [],
  },
];

interface StepContentProps {
  currentStep: number;
}

const DecisionBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; label: string }> = {
    "très viable": { color: "bg-decision-viable/15 text-decision-viable border-decision-viable/30", label: "Très viable" },
    "viable ajusté": { color: "bg-decision-adjusted/15 text-decision-adjusted border-decision-adjusted/30", label: "Viable ajusté" },
    "incertain": { color: "bg-decision-uncertain/15 text-decision-uncertain border-decision-uncertain/30", label: "Incertain" },
    "non viable": { color: "bg-decision-non-viable/15 text-decision-non-viable border-decision-non-viable/30", label: "Non viable" },
    "critique": { color: "bg-decision-critical/15 text-decision-critical border-decision-critical/30", label: "Critique" },
  };
  const c = config[status] || config["incertain"];
  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border", c.color)}>
      {c.label}
    </span>
  );
};

const StepContent = ({ currentStep }: StepContentProps) => {
  const step = stepData[currentStep];
  if (!step) return null;
  const Icon = step.icon;

  return (
    <div className="p-6 md:p-8 max-w-3xl animate-fade-in">
      {/* Step header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Étape {step.id}
            </span>
            {step.id === 7 && (
              <span className="text-[10px] font-bold text-decision-non-viable uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Priorité absolue
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground">{step.title}</h2>
          <p className="text-muted-foreground text-sm mt-1">{step.description}</p>
        </div>
      </div>

      {/* Decision badges preview */}
      {currentStep === 8 && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Système de Décision</h3>
          <div className="flex flex-wrap gap-2">
            {["très viable", "viable ajusté", "incertain", "non viable", "critique"].map((s) => (
              <DecisionBadge key={s} status={s} />
            ))}
          </div>
        </div>
      )}

      {/* Fields */}
      {step.fields.length > 0 && (
        <div className="space-y-3">
          {step.fields.map((field) => (
            <div key={field} className="glass-card rounded-xl p-4 flex items-center gap-3 group hover:border-primary/30 transition-colors">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30 group-hover:bg-primary transition-colors" />
              <span className="text-sm text-foreground">{field}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground/40 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      )}

      {/* Hint */}
      <div className="mt-8 p-4 rounded-xl border border-primary/20 bg-primary/5">
        <p className="text-xs text-primary/80">
          💡 Utilise le chat avec Édouard pour compléter cette étape. Il te guidera question par question.
        </p>
      </div>
    </div>
  );
};

export default StepContent;
