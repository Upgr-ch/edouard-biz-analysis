import { useState } from "react";
import { ArrowRight, Scale } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface FiscalDisclaimerProps {
  onContinue: () => void;
}

const FiscalDisclaimer = ({ onContinue }: FiscalDisclaimerProps) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/75 backdrop-blur-sm">
      <div className="max-w-lg w-full animate-fade-in">
        <div className="flex items-center justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Scale className="w-7 h-7 text-primary" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">
            Statut et Fiscalité
          </h2>

          <div className="space-y-4 text-foreground/85 text-[15px] leading-relaxed">
            <p>
              Je ne suis pas compétent pour donner des conseils juridiques ou fiscaux.
            </p>
            <p>
              Je vous recommande plus que vivement de consulter les autorités compétentes de votre pays ou un professionnel qualifié (expert-comptable, conseiller juridique) pour toute décision liée à votre statut ou régime fiscal.
            </p>
          </div>

          <div className="mt-8 p-4 rounded-xl border border-border bg-card/50">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <Checkbox
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked === true)}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground">
                J'ai lu et compris ce message
              </span>
            </label>
          </div>

          <button
            onClick={onContinue}
            disabled={!accepted}
            className="mt-8 w-full gradient-primary text-primary-foreground font-semibold py-4 px-6 rounded-xl hover:opacity-90 transition-all glow-primary flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Continuer
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiscalDisclaimer;
