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
    colorPrimary: "hsl(217 91% 60%)",
    colorBackground: "hsl(222 47% 7%)",
    colorForeground: "hsl(220 14% 90%)",
    colorMutedForeground: "hsl(220 9% 64%)",
    colorNeutral: "hsl(222 20% 22%)",
    colorInputForeground: "hsl(220 14% 90%)",
    colorInput: "hsl(222 28% 15%)",
    colorDanger: "hsl(0 84% 60%)",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#161B22] rounded-2xl w-[440px] max-w-full overflow-hidden border border-slate-800",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-bold",
    headerSubtitle: "text-slate-400",
    socialButtonsBlockButtonText: "text-white",
    formFieldLabel: "text-slate-300",
    footerActionLink: "text-indigo-400 hover:text-indigo-300",
    footerActionText: "text-slate-400",
    dividerText: "text-slate-500",
    formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500",
    formFieldInput: "bg-[#0B0E14] border-slate-700 text-white",
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
            <Route path="/auth/*" element={<AuthRoute />} />
            <Route path="/auth/sign-up/*" element={<SignUpRoute />} />
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
