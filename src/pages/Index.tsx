import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { getAnonMessages } from "@/lib/anonymousChat";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Skip onboarding if user is anonymous and already has chat history,
  // or if they're already authenticated.
  const [onboarded, setOnboarded] = useState(() => user !== null || getAnonMessages().length > 0);

  // REGLE DES 5 MESSAGES : Surveillance pour redirection
  useEffect(() => {
    if (!loading && !user) {
      const messages = getAnonMessages();
      // Si l'utilisateur a envoyé 6 messages ou plus, on redirige vers /auth
      if (messages.length >= 6) {
        navigate("/auth");
      }
    }
  }, [user, loading, navigate]);

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

  return (
    <>
      {user && (
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/auth";
          }}
          className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium hover:opacity-90"
        >
          Déconnexion
        </button>
      )}
      <Dashboard />
    </>
  );
};

export default Index;
