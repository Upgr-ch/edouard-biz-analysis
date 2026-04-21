import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { getAnonMessages } from "@/lib/anonymousChat";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

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

  // Fonction de déconnexion forcée pour nettoyer ton erreur 23503
  const handleForceSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // On vide aussi le localStorage au cas où des restes de session persistent
      localStorage.clear();
      // On recharge la page à la racine pour repartir de zéro
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      // Même en cas d'erreur, on force le retour à l'accueil
      window.location.href = "/auth";
    }
  };

  if (!onboarded) {
    return <Onboarding onComplete={() => setOnboarded(true)} />;
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* BOUTON DE DÉCONNEXION D'URGENCE */}
      <button
        onClick={handleForceSignOut}
        className="fixed top-4 right-4 z-[100] flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-2xl transition-all text-sm font-bold border-2 border-white"
      >
        <LogOut size={16} />
        DÉCONNEXION (RESET SESSION)
      </button>

      <Dashboard />
    </div>
  );
};

export default Index;
