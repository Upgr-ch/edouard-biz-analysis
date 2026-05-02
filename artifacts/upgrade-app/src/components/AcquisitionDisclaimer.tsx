import { useState } from "react";
import { ArrowRight, Target } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AcquisitionDisclaimerProps {
  onContinue: () => void;
}

const AcquisitionDisclaimer = ({ onContinue }: AcquisitionDisclaimerProps) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/75 backdrop-blur-sm">
      <div className="max-w-lg w-full animate-fade-in">
        <div className="flex items-center justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Target className="w-7 h-7 text-primary" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-foreground mb-2 text-center">
            Acquisition Client
          </h2>
          <p className="text-center text-xs font-bold uppercase tracking-widest text-primary/80 mb-6">
            Priorité absolue
          </p>

          <div className="space-y-4 text-foreground/85 text-[15px] leading-relaxed">
            <p>
              Sans acquisition maîtrisée, votre projet est condamné — peu importe la qualité du produit ou du modèle économique. C'est le facteur #1 de survie.
            </p>
            <p>
              Je ne suis pas qualifié pour vous conseiller sur les tactiques d'acquisition (canaux, publicité, stratégie de contenu, etc.). Ce domaine requiert une expertise spécifique.
            </p>
            <p>
              Ma recommandation est claire : <strong>formez-vous</strong> spécifiquement à l'acquisition client, ou <strong>faites appel à un professionnel qualifié</strong> (growth marketer, commercial expérimenté).
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
                J'ai compris que l'acquisition client est ma priorité absolue
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

export default AcquisitionDisclaimer;
