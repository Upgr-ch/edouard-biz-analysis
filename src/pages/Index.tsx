import { useState } from "react";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [onboarded, setOnboarded] = useState(false);

  if (!onboarded) {
    return <Onboarding onComplete={() => setOnboarded(true)} />;
  }

  return <Dashboard />;
};

export default Index;
