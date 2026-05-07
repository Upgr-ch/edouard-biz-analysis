// Contact sync is now handled server-side via Clerk webhook (POST /api/webhooks/clerk).
// This hook is kept as a lightweight fallback in case the webhook misses an event
// (e.g. webhook not yet configured in Clerk dashboard).
// It also forwards the marketing consent preference set during sign-up.

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const STORAGE_KEY = "edouard_synced";
const MARKETING_KEY = "edouard_marketing_consent";

export function useNewUserSync() {
  const { user, isLoaded } = useUser();
  const called = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || called.current) return;

    const alreadySynced = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
    if (alreadySynced) return;

    const createdAt = user.createdAt ? new Date(user.createdAt).getTime() : 0;
    const ageMs = Date.now() - createdAt;
    const isNew = ageMs < 5 * 60 * 1000;

    if (!isNew) {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, "1");
      return;
    }

    called.current = true;

    const email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses?.[0]?.emailAddress;

    if (!email) return;

    const marketingConsent = localStorage.getItem(MARKETING_KEY) === "1";

    fetch(`${API_BASE}/api/integrations/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        marketingConsent,
      }),
    })
      .then((r) => {
        if (r.ok) {
          localStorage.setItem(`${STORAGE_KEY}_${user.id}`, "1");
          localStorage.removeItem(MARKETING_KEY);
          console.info("[useNewUserSync] fallback contact sync ok, marketingConsent:", marketingConsent);
        }
      })
      .catch((err) => console.warn("[useNewUserSync]", err));
  }, [isLoaded, user]);
}
