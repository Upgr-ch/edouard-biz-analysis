import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import NotFound from "./pages/NotFound.tsx";
import Cookies from "./pages/legal/Cookies.tsx";
import Confidentialite from "./pages/legal/Confidentialite.tsx";
import MentionsLegales from "./pages/legal/MentionsLegales.tsx";
import CGV from "./pages/legal/CGV.tsx";
import CGU from "./pages/legal/CGU.tsx";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  baseTheme: shadcn,
  variables: {
    colorPrimary: "#F5E090",           /* or UpGrade */
    colorBackground: "#080F1E",        /* midnight navy */
    colorForeground: "#FFFFFF",
    colorMutedForeground: "rgba(255,255,255,0.55)",
    colorNeutral: "rgba(255,255,255,0.10)",
    colorInputForeground: "#FFFFFF",
    colorInput: "rgba(255,255,255,0.04)",
    colorDanger: "hsl(0 84% 60%)",
    fontFamily: "'Raleway', sans-serif",
    borderRadius: "2px",               /* style luxe minimal */
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !rounded-none",
    footer: "!shadow-none !border-0 !rounded-none",

    /* Header */
    headerTitle: "!text-white !font-bold",
    headerSubtitle: "!text-white/55",
    logoImage: "!hidden",

    /* Champs */
    formFieldLabel: "!text-white/70",
    formFieldInput:
      "!bg-white/[0.03] !border !border-white/10 !text-white focus:!border-[#F5E090]/50 !rounded-[2px]",
    formFieldInputShowPasswordButton: "!text-white/40",

    /* Bouton principal */
    formButtonPrimary:
      "!bg-[#F5E090] !text-[#080F1E] !font-semibold hover:!opacity-90 !rounded-[2px] !shadow-[0_6px_20px_-6px_rgba(245,224,144,0.45)]",

    /* Boutons sociaux */
    socialButtonsBlockButton:
      "!bg-white/[0.04] !border !border-white/10 !text-white hover:!bg-white/[0.08] !rounded-[2px]",
    socialButtonsBlockButtonText: "!text-white",

    /* Liens footer */
    footerActionLink: "!text-[#F5E090] hover:!text-white",
    footerActionText: "!text-white/40",

    /* Séparateur */
    dividerLine: "!bg-white/10",
    dividerText: "!text-white/30",

    /* Badges / alternatives */
    alternativeMethodsBlockButton:
      "!bg-white/[0.04] !border !border-white/10 !text-white hover:!bg-white/[0.08] !rounded-[2px]",

    /* Lien mot de passe oublié */
    formFieldAction: "!text-[#F5E090] hover:!text-white",

    /* Alert erreurs */
    formFieldErrorText: "!text-red-400",
    alert: "!border-red-500/20 !bg-red-950/20",
    alertText: "!text-red-300",
  },
};

function ClerkQueryCacheInvalidator() {
  return null;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <SignIn
        routing="path"
        path={`${basePath}/auth`}
        signUpUrl={`${basePath}/auth/sign-up`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function SignUpRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <SignUp
        routing="path"
        path={`${basePath}/auth/sign-up`}
        signInUrl={`${basePath}/auth`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/auth`}
      signUpUrl={`${basePath}/auth/sign-up`}
      routerPush={(to) => {
        const stripped = basePath && to.startsWith(basePath)
          ? to.slice(basePath.length) || "/"
          : to;
        navigate(stripped);
      }}
      routerReplace={(to) => {
        const stripped = basePath && to.startsWith(basePath)
          ? to.slice(basePath.length) || "/"
          : to;
        navigate(stripped, { replace: true });
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryCacheInvalidator />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/sign-up/*?" element={<SignUpRoute />} />
            <Route path="/auth/*?" element={<AuthRoute />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/confidentialite" element={<Confidentialite />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/cgv" element={<CGV />} />
            <Route path="/cgu" element={<CGU />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

const App = () => (
  <BrowserRouter basename={basePath}>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
