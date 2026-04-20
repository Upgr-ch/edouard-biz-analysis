import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { getAnonMessages } from "@/lib/anonymousChat";

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

  return <Dashboard />;
};

export default Index;
