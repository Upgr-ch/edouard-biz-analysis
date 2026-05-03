import { useEffect } from "react";
import { ClerkProvider, SignIn, SignUp } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { frFR } from "@clerk/localizations";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { BrainLogoSm } from "@/components/BrainLogo";
import Index from "./pages/Index.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
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
    colorPrimary: "#F5E090",
    colorBackground: "#080F1E",
    colorForeground: "#FFFFFF",
    colorMutedForeground: "rgba(255,255,255,0.55)",
    colorNeutral: "rgba(255,255,255,0.10)",
    colorInputForeground: "#FFFFFF",
    colorInput: "rgba(255,255,255,0.04)",
    colorDanger: "hsl(0 84% 60%)",
    fontFamily: "'Raleway', sans-serif",
    borderRadius: "2px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "w-[440px] max-w-full",
    card: "!shadow-none !border-0 !rounded-none",
    footer: "!shadow-none !border-0 !rounded-none",
    headerTitle: "!hidden",
    headerSubtitle: "!hidden",
    logoImage: "!hidden",
    formFieldLabel: "!text-white/70",
    formFieldInput:
      "!bg-white/[0.03] !border !border-white/10 !text-white focus:!border-[#F5E090]/50 !rounded-[2px]",
    formFieldInputShowPasswordButton: "!text-white/40",
    formButtonPrimary:
      "!bg-[#F5E090] !text-[#080F1E] !font-semibold hover:!opacity-90 !rounded-[2px] !shadow-[0_6px_20px_-6px_rgba(245,224,144,0.45)]",
    socialButtonsBlockButton:
      "!bg-white/[0.04] !border !border-white/10 !text-white hover:!bg-white/[0.08] !rounded-[2px]",
    socialButtonsBlockButtonText: "!text-white",
    footerActionLink: "!text-[#F5E090] hover:!text-white",
    footerActionText: "!text-white/40",
    dividerLine: "!bg-white/10",
    dividerText: "!text-white/30",
    alternativeMethodsBlockButton:
      "!bg-white/[0.04] !border !border-white/10 !text-white hover:!bg-white/[0.08] !rounded-[2px]",
    formFieldAction: "!text-[#F5E090] hover:!text-white",
    formFieldErrorText: "!text-red-400",
    alert: "!border-red-500/20 !bg-red-950/20",
    alertText: "!text-red-300",
    badge: "!hidden !pointer-events-none !h-0 !overflow-hidden !absolute",
  },
};

const clerkLocalization = {
  ...frFR,
  signIn: {
    ...frFR.signIn,
    start: {
      ...frFR.signIn?.start,
      title: "Connexion",
      subtitle: "Bienvenue sur Édouard",
      actionText: "Pas encore de compte ?",
      actionLink: "S'inscrire",
    },
  },
  signUp: {
    ...frFR.signUp,
    start: {
      ...frFR.signUp?.start,
      title: "Créer un compte",
      subtitle: "Rejoignez Édouard",
      actionText: "Déjà un compte ?",
      actionLink: "Se connecter",
    },
  },
  formFieldInputPlaceholder__password: "Mot de passe",
  formFieldInputPlaceholder__newPassword: "Nouveau mot de passe",
  formFieldInputPlaceholder__confirmPassword: "Confirmer le mot de passe",
  userButton: { ...frFR.userButton },
  userProfile: { ...frFR.userProfile },
};


function AuthHeader({ backTo = "/" }: { backTo?: string }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        marginBottom: "28px",
        textAlign: "center",
        maxWidth: 440,
        marginLeft: "auto",
        marginRight: "auto",
        width: "100%",
      }}
    >
      <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
        <button
          onClick={() => navigate(backTo)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.45)",
            fontFamily: "var(--up-font)",
            fontSize: "0.78rem",
            letterSpacing: "0.04em",
            padding: "4px 0",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#F5E090")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <BrainLogoSm />
        <span
          style={{
            fontFamily: "var(--up-font)",
            fontSize: "1.35rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#F5E090",
          }}
        >
          Édouard
        </span>
      </div>
      <p
        style={{
          fontFamily: "var(--up-font)",
          fontSize: "0.82rem",
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.02em",
          maxWidth: 340,
        }}
      >
        Afin de garantir la continuité de votre service et de sécuriser
        l'historique de vos échanges, la création d'un compte est nécessaire
        pour poursuivre cette session.
      </p>
    </div>
  );
}

function AuthRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <AuthHeader />
      {/* routing="virtual" keeps the component stable — no URL sub-path navigation */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <SignIn
        {...({ routing: "virtual" } as any)}
        signUpUrl="/auth/sign-up"
        forceRedirectUrl="/"
        signUpForceRedirectUrl="/"
        appearance={clerkAppearance}
      />
      <button
        onClick={() => navigate("/forgot-password")}
        style={{
          marginTop: 16,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.35)",
          fontFamily: "var(--up-font)",
          fontSize: "0.78rem",
          letterSpacing: "0.03em",
          textDecoration: "underline",
          padding: "4px 0",
          transition: "color 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#F5E090")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
      >
        Mot de passe oublié ?
      </button>
    </div>
  );
}

function SignUpRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <AuthHeader backTo="/auth" />
      {/* routing="virtual" keeps the component stable — no URL sub-path navigation */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <SignUp
        {...({ routing: "virtual" } as any)}
        signInUrl="/auth"
        forceRedirectUrl="/"
        signInForceRedirectUrl="/"
        appearance={clerkAppearance}
      />
    </div>
  );
}

function HideClerkDevBadge() {
  useEffect(() => {
    function hideBadge() {
      document.querySelectorAll("a, div, span").forEach((el) => {
        const text = el.textContent?.trim();
        if (text === "Development mode") {
          // Hide only the element itself — never the parent, to avoid
          // masking Cloudflare Turnstile or other Clerk UI elements.
          (el as HTMLElement).style.setProperty("display", "none", "important");
        }
      });
    }
    hideBadge();
    const observer = new MutationObserver(hideBadge);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      localization={clerkLocalization}
      signInUrl="/auth"
      signUpUrl="/auth/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <HideClerkDevBadge />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/sign-up" element={<SignUpRoute />} />
            <Route path="/auth/sign-up/*" element={<SignUpRoute />} />
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/auth/*" element={<AuthRoute />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
