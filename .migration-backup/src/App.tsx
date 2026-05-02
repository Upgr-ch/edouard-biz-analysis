import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import NotFound from "./pages/NotFound.tsx";
import Cookies from "./pages/legal/Cookies.tsx";
import Confidentialite from "./pages/legal/Confidentialite.tsx";
import MentionsLegales from "./pages/legal/MentionsLegales.tsx";
import CGV from "./pages/legal/CGV.tsx";
import CGU from "./pages/legal/CGU.tsx";

const queryClient = new QueryClient();

// Cette fonction ne bloque plus l'accès, elle laisse passer tout le monde
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary text-xl animate-pulse">Édouard se prépare...</div>
      </div>
    );
  }

  // On a supprimé la redirection forcée vers /auth ici
  return <>{children}</>;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  // Si l'utilisateur est déjà loggé et va sur /auth, on le renvoie à l'accueil
  if (user) return <Navigate to="/" replace />;
  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Les routes sont maintenant libres d'accès */}
          <Route path="/auth" element={<AuthRoute />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Index />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
