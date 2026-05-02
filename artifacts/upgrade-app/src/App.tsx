import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, AuthenticateWithRedirectCallback } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { frFR } from "@clerk/localizations";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { BrainLogoSm } from "@/components/BrainLogo";
import Index from "./pages/Index.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import SignUpCustom from "./pages/SignUpCustom.tsx";
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

    /* Header — masqué car remplacé par AuthHeader */
    headerTitle: "!hidden",
    headerSubtitle: "!hidden",
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
      {/* Back button */}
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
      <SignIn
        routing="path"
        path={`${basePath}/auth`}
        signUpUrl={`${basePath}/auth/sign-up`}
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
      localization={{
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
        formFieldInputPlaceholder__password: "Créer un mot de passe",
        formFieldInputPlaceholder__newPassword: "Nouveau mot de passe",
        formFieldInputPlaceholder__confirmPassword: "Confirmer le mot de passe",
        userButton: { ...frFR.userButton },
        userProfile: { ...frFR.userProfile },
      }}
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
            <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
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
