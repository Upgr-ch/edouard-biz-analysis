import { useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const ResetPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Réinitialisation</h1>
          <p className="text-muted-foreground text-sm">
            La réinitialisation du mot de passe est gérée par le système d'authentification.
          </p>
        </div>
        <Button onClick={() => navigate("/")} className="w-full gradient-primary text-primary-foreground">
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};

export default ResetPassword;
