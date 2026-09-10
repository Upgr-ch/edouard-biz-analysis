import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import "../../src/index.css";
import "./vike-hydration.css";
import HydratablePublicApp from "../../src/public/HydratablePublicApp";
import type { EdouardProfileKey } from "../../src/public/edouardPublicContent";

const HOME_TITLE = "Édouard | Diagnostic business IA";

interface ClientSessionState {
  authenticated: boolean;
  hasLocalConversation: boolean;
}

interface ClerkSessionBridgeProps {
  children?: React.ReactNode;
  onClientState: (state: ClientSessionState) => void;
}

interface ProfileRequest {
  id: number;
  profile: EdouardProfileKey;
}

interface InteractiveChatClientProps {
  profileRequest: ProfileRequest | null;
}

export default function Page() {
  const [ClerkSessionBridge, setClerkSessionBridge] =
    useState<ComponentType<ClerkSessionBridgeProps> | null>(null);
  const [InteractiveChatClient, setInteractiveChatClient] =
    useState<ComponentType<InteractiveChatClientProps> | null>(null);
  const [profileRequest, setProfileRequest] =
    useState<ProfileRequest | null>(null);
  const chatModulePromise = useRef<
    Promise<ComponentType<InteractiveChatClientProps>> | null
  >(null);
  const profileLoadPending = useRef(false);
  const nextProfileRequestId = useRef(0);

  useEffect(() => {
    document.title = HOME_TITLE;
  }, []);

  const loadInteractiveChat = useCallback(async () => {
    if (!chatModulePromise.current) {
      chatModulePromise.current = import(
        /* client-only */
        "../../src/client/InteractiveChatClient"
      ).then((module) => module.default);
    }
    const component = await chatModulePromise.current;
    setInteractiveChatClient(() => component);
    return component;
  }, []);

  useEffect(() => {
    let active = true;

    void import(
      /* client-only */
      "../../src/client/ClerkSessionBridge"
    ).then((module) => {
      if (active) {
        setClerkSessionBridge(() => module.default);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handleClientState = useCallback(
    (state: ClientSessionState) => {
      if (state.authenticated || state.hasLocalConversation) {
        void loadInteractiveChat();
      }
    },
    [loadInteractiveChat],
  );

  const handleProfileSelect = useCallback(
    (profile: EdouardProfileKey) => {
      if (profileLoadPending.current) return;

      profileLoadPending.current = true;
      void loadInteractiveChat()
        .then(() => {
          nextProfileRequestId.current += 1;
          setProfileRequest({
            id: nextProfileRequestId.current,
            profile,
          });
        })
        .finally(() => {
          profileLoadPending.current = false;
        });
    },
    [loadInteractiveChat],
  );

  const conversationOverlay = ClerkSessionBridge ? (
    <ClerkSessionBridge onClientState={handleClientState}>
      {InteractiveChatClient ? (
        <InteractiveChatClient profileRequest={profileRequest} />
      ) : null}
    </ClerkSessionBridge>
  ) : null;

  return (
    <HydratablePublicApp
      conversationOverlay={conversationOverlay}
      onProfileSelect={handleProfileSelect}
    />
  );
}