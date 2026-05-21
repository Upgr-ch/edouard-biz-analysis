// Contact sync is now handled server-side via Clerk webhook (POST /api/webhooks/clerk).
// This hook is kept as a lightweight fallback in case the webhook misses an event
// (e.g. webhook not yet configured in Clerk dashboard).
// It also forwards the marketing consent preference set during sign-up.

import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const STORAGE_KEY = "edouard_synced";
const MARKETING_KEY = "edouard_marketing_consent";

export function useNewUserSync() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const called = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || called.current) return;

    const alreadySynced = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
    if (alreadySynced) return;

    called.current = true;

    const email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses?.[0]?.emailAddress;

    if (!email) return;

    const marketingConsent = localStorage.getItem(MARKETING_KEY) === "1";

    void (async () => {
      try {
        const token = await getToken();
        const r = await fetch(`${API_BASE}/api/integrations/signup`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            email,
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            marketingConsent,
          }),
        });
        if (r.ok) {
          localStorage.setItem(`${STORAGE_KEY}_${user.id}`, "1");
          localStorage.removeItem(MARKETING_KEY);
          console.info("[useNewUserSync] contact sync ok, marketingConsent:", marketingConsent);
        } else {
          const body = await r.json().catch(() => ({})) as { error?: string };
          console.warn("[useNewUserSync] sync failed", r.status, body.error);
          called.current = false;
        }
      } catch (err) {
        console.warn("[useNewUserSync]", err);
        called.current = false;
      }
    })();
  }, [isLoaded, user, getToken]);
}
