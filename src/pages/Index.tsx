import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { getAnonMessages } from "@/lib/anonymousChat";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react"; // Import de l'icône

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [onboarded, setOnboarded] = useState(() => user !== null || getAnonMessages().length > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary text-xl animate-pulse">Édouard se prépare...</div>
      </div>
    );
  }

  if (!onboarded) {
    return <Onboarding onComplete={() => setOnboarded(true)} />;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // On force un rechargement complet pour nettoyer tous les états
    window.location.href = "/";
  };

  return (
    <div className="relative h-screen w-full">
      {/* Bouton de déconnexion visible uniquement si l'utilisateur est connecté */}
      {user && (
        <button
          onClick={handleSignOut}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive px-4 py-2 rounded-full border border-destructive/20 transition-all text-sm font-semibold shadow-sm"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      )}

      <Dashboard />
    </div>
  );
};

export default Index;
