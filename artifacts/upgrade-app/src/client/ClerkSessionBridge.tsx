import {
  ClerkProvider,
  SignIn,
  SignUp,
  useUser,
  type ClerkProviderProps,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { frFR } from "@clerk/localizations";
import { shadcn } from "@clerk/themes";
import { useEffect, type ReactNode } from "react";
import {
  BrowserRouter,
  useLocation,
  useNavigate,
} from "react-router-dom";

export interface ClientSessionState {
  authenticated: boolean;
  hasLocalConversation: boolean;
}

interface ClerkSessionBridgeProps {
  children?: ReactNode;
  onClientState: (state: ClientSessionState) => void;
}

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
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
};

function ClientRoute({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();

  if (pathname === "/auth/sign-up") {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-background p-4">
        <SignUp
          // Clerk supports virtual routing at runtime, but this version's
          // public component type no longer includes it.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ routing: "virtual" } as any)}
          forceRedirectUrl="/"
          signInForceRedirectUrl="/"
          signInUrl="/auth"
        />
      </div>
    );
  }

  if (pathname === "/auth" || pathname.startsWith("/auth/")) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-background p-4">
        <SignIn
          // Clerk supports virtual routing at runtime, but this version's
          // public component type no longer includes it.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ routing: "virtual" } as any)}
          forceRedirectUrl="/"
          signUpForceRedirectUrl="/"
          signUpUrl="/auth/sign-up"
        />
      </div>
    );
  }

  return children;
}

function SessionProbe({
  onClientState,
}: Pick<ClerkSessionBridgeProps, "onClientState">) {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    onClientState({
      authenticated: Boolean(user),
      hasLocalConversation:
        localStorage.getItem("edouard_anon_chat_v1") !== null ||
        localStorage.getItem("temp_chat") !== null,
    });
  }, [isLoaded, onClientState, user]);

  return null;
}

function ClerkBoundary({
  children,
  onClientState,
}: ClerkSessionBridgeProps) {
  const navigate = useNavigate();
  const clerkPubKey = publishableKeyFromHost(
    window.location.hostname,
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  );

  if (!clerkPubKey) {
    throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
  }

  const routerProps: Pick<
    ClerkProviderProps,
    "routerPush" | "routerReplace"
  > = {
    routerPush: (to) => navigate(to),
    routerReplace: (to) => navigate(to, { replace: true }),
  };

  return (
    <ClerkProvider
      appearance={clerkAppearance}
      localization={frFR}
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      signInFallbackRedirectUrl="/"
      signInUrl="/auth"
      signUpFallbackRedirectUrl="/"
      signUpUrl="/auth/sign-up"
      {...routerProps}
    >
      <SessionProbe onClientState={onClientState} />
      <ClientRoute>{children}</ClientRoute>
    </ClerkProvider>
  );
}

export default function ClerkSessionBridge(
  props: ClerkSessionBridgeProps,
) {
  return (
    <BrowserRouter>
      <ClerkBoundary {...props} />
    </BrowserRouter>
  );
}