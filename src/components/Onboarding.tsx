import { ArrowRight, Brain } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center mb-10">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Je suis <span className="text-gradient">Édouard</span>.
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Consultant en faisabilité et rentabilité de projets business.
          </p>

          <div className="space-y-4 text-foreground/80 text-[15px] leading-relaxed">
            <p>
              Je vais t'aider à analyser ton idée de business avec structure et honnêteté.
            </p>
            <p>
              Je m'exprime de manière <span className="font-semibold text-foreground">ferme, assertive et juste</span>, ne le prends pas pour toi.
              Mon travail est de te dire la vérité business, pas de te flatter.
            </p>
            <p>
              Si ton idée n'est pas viable, je te le dirai clairement.
              Si elle est améliorable, je t'expliquerai comment.
            </p>
            <p className="text-primary font-medium">
              Ma mission est de te faire gagner du temps et d'éviter les erreurs coûteuses.
            </p>
            <div className="border-l-2 border-primary/40 pl-4 mt-6 py-1">
              <p className="text-muted-foreground text-sm">
                J'utilise uniquement des données réelles et vérifiables issues du web.
                Je n'invente jamais de chiffres, de marché ou de tendances.
                Si une information fiable n'est pas disponible, je le dis clairement.
              </p>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="mt-10 w-full gradient-primary text-primary-foreground font-semibold py-4 px-6 rounded-xl hover:opacity-90 transition-all glow-primary flex items-center justify-center gap-2 text-base"
          >
            Commencer l'analyse
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          "Une idée ne vaut rien. Sa rentabilité, oui."
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
