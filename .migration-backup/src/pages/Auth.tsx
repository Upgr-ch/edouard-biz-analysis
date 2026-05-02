import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Brain } from "lucide-react";

const Auth = () => {
  const [mode, setMode] = useState<"signup" | "login" | "forgot">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requiresTerms = mode === "signup";
  const submitDisabled = loading || (requiresTerms && !acceptTerms);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitDisabled) return;
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Un email de réinitialisation vous a été envoyé.");
        setMode("login");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { marketing_consent: acceptMarketing },
          },
        });
        if (error) throw error;
        toast.success("Vérifiez votre email pour confirmer votre inscription.");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto glow-primary">
            <Brain className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Authentification</h1>
          <p className="text-muted-foreground text-sm leading-relaxed px-2">
            {mode === "forgot"
              ? "Réinitialisation du mot de passe"
              : "Afin de garantir la continuité de votre service et de sécuriser l'historique de vos échanges, la création d'un compte est nécessaire pour poursuivre cette session."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary border-border text-foreground"
            />
            {mode !== "forgot" && (
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-secondary border-border text-foreground"
              />
            )}
          </div>

          {mode === "signup" && (
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={acceptTerms}
                  onCheckedChange={(v) => setAcceptTerms(v === true)}
                  className="mt-0.5"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  J'accepte les{" "}
                  <Link to="/cgu" target="_blank" className="text-primary hover:underline">
                    Conditions Générales d'Utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link to="/confidentialite" target="_blank" className="text-primary hover:underline">
                    Politique de Confidentialité
                  </Link>
                  . <span className="text-destructive">*</span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={acceptMarketing}
                  onCheckedChange={(v) => setAcceptMarketing(v === true)}
                  className="mt-0.5"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  J'accepte de recevoir les emails d'Édouard.
                </span>
              </label>
            </div>
          )}

          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground"
            disabled={submitDisabled}
          >
            {loading
              ? "Chargement..."
              : mode === "forgot"
              ? "Envoyer le lien"
              : mode === "login"
              ? "Se connecter"
              : "Valider et continuer"}
          </Button>
        </form>

        {mode === "login" && (
          <button
            type="button"
            onClick={() => setMode("forgot")}
            className="block mx-auto text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Mot de passe oublié ?
          </button>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {mode === "forgot" ? (
            <button type="button" onClick={() => setMode("login")} className="text-primary hover:underline">
              Retour à la connexion
            </button>
          ) : mode === "login" ? (
            <>
              Pas encore de compte ?{" "}
              <button type="button" onClick={() => setMode("signup")} className="text-primary hover:underline">
                S'inscrire
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <button type="button" onClick={() => setMode("login")} className="text-primary hover:underline">
                Se connecter
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Auth;
