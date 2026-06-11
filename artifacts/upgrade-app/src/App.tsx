import { useEffect, useState } from "react";
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
import Admin from "./pages/Admin.tsx";
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


function AuthEditorialPanel() {
  const points = [
    { icon: "🎯", text: "Analyse ta faisabilité et ta rentabilité en 10 étapes structurées" },
    { icon: "📊", text: "Génère un rapport PDF complet avec indice de viabilité" },
    { icon: "🇨🇭", text: "Confectionné en Suisse" },
    { icon: "🎯", text: "Conçu pour les entrepreneurs, slasheurs et porteurs de projets qui veulent un diagnostic assertif sur la viabilité et la rentabilité de leurs idées avant leur mise en œuvre." },
  ];
  return (
    <div
      className="hidden lg:flex flex-col justify-center px-12 py-10"
      style={{
        flex: "1 1 0",
        maxWidth: 480,
        borderRight: "1px solid rgba(245,224,144,0.12)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <BrainLogoSm />
        <span style={{ fontFamily: "var(--up-font)", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#F5E090" }}>
          Édouard
        </span>
      </div>
      <h2 style={{ fontFamily: "var(--up-font)", fontSize: "1.45rem", fontWeight: 700, lineHeight: 1.35, color: "#fff", marginBottom: 12 }}>
        Votre consultant en faisabilité business
      </h2>
      <p style={{ fontFamily: "var(--up-font)", fontSize: "0.88rem", lineHeight: 1.75, color: "rgba(255,255,255,0.55)", marginBottom: 32 }}>
        Édouard analyse votre idée de business avec structure et honnêteté. Pas de faux espoirs — juste un diagnostic rigoureux pour vous éviter des erreurs coûteuses.
      </p>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
        {points.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>{p.icon}</span>
            <p style={{ fontFamily: "var(--up-font)", fontSize: "0.83rem", lineHeight: 1.6, color: "rgba(255,255,255,0.65)", margin: 0 }}>
              {p.text}
            </p>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 40,
          padding: "16px 20px",
          borderRadius: 6,
          background: "rgba(245,224,144,0.06)",
          borderLeft: "3px solid #F5E090",
        }}
      >
        <p style={{ fontFamily: "var(--up-font)", fontSize: "0.82rem", lineHeight: 1.7, color: "rgba(255,255,255,0.60)", fontStyle: "italic", margin: 0 }}>
          "Ma mission est de te faire gagner du temps et d'éviter les erreurs coûteuses."
        </p>
        <p style={{ fontFamily: "var(--up-font)", fontSize: "0.75rem", color: "#F5E090", marginTop: 8, marginBottom: 0, letterSpacing: "0.05em" }}>
          — Édouard
        </p>
      </div>
    </div>
  );
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
    <div className="min-h-screen flex bg-background">
      <AuthEditorialPanel />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <AuthHeader />
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
    </div>
  );
}

function LegalConsentCheckbox({
  accepted,
  onChange,
}: {
  accepted: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        marginBottom: 20,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "14px 16px",
        background: "rgba(245,224,144,0.04)",
        border: `1px solid ${accepted ? "rgba(245,224,144,0.30)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 2,
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
      onClick={() => onChange(!accepted)}
    >
      <div
        style={{
          flexShrink: 0,
          marginTop: 1,
          width: 16,
          height: 16,
          borderRadius: 2,
          border: `1.5px solid ${accepted ? "#F5E090" : "rgba(255,255,255,0.25)"}`,
          background: accepted ? "#F5E090" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        {accepted && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#080F1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <p
        style={{
          fontFamily: "var(--up-font)",
          fontSize: "0.75rem",
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.55)",
          margin: 0,
          userSelect: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        J&apos;accepte les{" "}
        <a href="/cgu" target="_blank" rel="noopener noreferrer" style={{ color: "#F5E090", textDecoration: "underline" }} onClick={(e) => e.stopPropagation()}>CGU</a>
        {" "}et la{" "}
        <a href="/confidentialite" target="_blank" rel="noopener noreferrer" style={{ color: "#F5E090", textDecoration: "underline" }} onClick={(e) => e.stopPropagation()}>politique de confidentialité</a>.
        {" "}Je reconnais que mes données personnelles sont traitées conformément à la{" "}
        <strong style={{ color: "rgba(255,255,255,0.70)", fontWeight: 600 }}>LPD</strong>{" "}(Loi fédérale suisse sur la protection des données) et au{" "}
        <strong style={{ color: "rgba(255,255,255,0.70)", fontWeight: 600 }}>RGPD</strong>{" "}(Règlement général européen sur la protection des données).
      </p>
    </div>
  );
}

function OptionalCheckbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        marginBottom: 12,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "11px 16px",
        background: "transparent",
        border: `1px solid ${checked ? "rgba(245,224,144,0.20)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 2,
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
      onClick={() => onChange(!checked)}
    >
      <div
        style={{
          flexShrink: 0,
          marginTop: 2,
          width: 15,
          height: 15,
          borderRadius: 2,
          border: `1.5px solid ${checked ? "#F5E090" : "rgba(255,255,255,0.20)"}`,
          background: checked ? "#F5E090" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#080F1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <p
        style={{
          fontFamily: "var(--up-font)",
          fontSize: "0.74rem",
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.45)",
          margin: 0,
          userSelect: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </p>
    </div>
  );
}

function SignUpRoute() {
  const { user, loading } = useAuth();
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);

  useEffect(() => {
    localStorage.setItem("edouard_marketing_consent", marketingAccepted ? "1" : "0");
  }, [marketingAccepted]);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return (
    <div className="min-h-screen flex bg-background">
      <AuthEditorialPanel />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <AuthHeader backTo="/auth" />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <div
          style={{
            opacity: legalAccepted ? 1 : 0.45,
            pointerEvents: legalAccepted ? "auto" : "none",
            transition: "opacity 0.25s ease",
            width: "100%",
          }}
        >
          <SignUp
            {...({ routing: "virtual" } as any)}
            signInUrl="/auth"
            forceRedirectUrl="/"
            signInForceRedirectUrl="/"
            appearance={clerkAppearance}
          />
        </div>
        <div style={{ marginTop: 20, width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 0 }}>
          <LegalConsentCheckbox accepted={legalAccepted} onChange={setLegalAccepted} />
          <OptionalCheckbox checked={marketingAccepted} onChange={setMarketingAccepted}>
            J&apos;accepte de recevoir des communications d&apos;Édouard (conseils, actualités, offres). Vous pouvez vous désinscrire à tout moment.{" "}
            <span style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.70rem" }}>(Facultatif)</span>
          </OptionalCheckbox>
        </div>
        {!legalAccepted && (
          <p
            style={{
              marginTop: 8,
              fontFamily: "var(--up-font)",
              fontSize: "0.73rem",
              color: "rgba(255,255,255,0.30)",
              textAlign: "center",
              letterSpacing: "0.02em",
            }}
          >
            Veuillez accepter les conditions ci-dessous pour continuer.
          </p>
        )}
      </div>
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
            <Route path="/admin" element={<Admin />} />
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
