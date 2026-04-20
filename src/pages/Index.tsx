import { useState } from "react";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { getAnonMessages } from "@/lib/anonymousChat";

const Index = () => {
  const { user, loading } = useAuth();
  // Skip onboarding if user is anonymous and already has chat history,
  // or if they're already authenticated.
  const [onboarded, setOnboarded] = useState(
    () => user !== null || getAnonMessages().length > 0,
  );

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
