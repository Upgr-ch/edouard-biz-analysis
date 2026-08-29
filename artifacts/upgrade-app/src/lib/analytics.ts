const EDOUARD_EMAIL_WALL_PENDING_KEY = "edouard.emailWallPending";
const EDOUARD_EMAIL_WALL_LEAD_KEY = "edouard.emailWallLeadTracked";

type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
};

export function markEdouardEmailWallPending() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(EDOUARD_EMAIL_WALL_PENDING_KEY, "true");
  } catch (error) {
    console.warn("[Analytics Edouard] email wall pending flag failed", error);
  }
}

export function trackEdouardEmailWallLeadOnce() {
  if (typeof window === "undefined") return;

  let isTracked = false;
  let isPending = false;
  try {
    isTracked = window.sessionStorage.getItem(EDOUARD_EMAIL_WALL_LEAD_KEY) === "true";
    isPending = window.sessionStorage.getItem(EDOUARD_EMAIL_WALL_PENDING_KEY) === "true";
  } catch (error) {
    console.warn("[Analytics Edouard] session storage read failed", error);
    return;
  }

  if (isTracked || !isPending) return;

  const analyticsWindow = window as AnalyticsWindow;

  if (typeof analyticsWindow.gtag === "function") {
    try {
      analyticsWindow.gtag("event", "generate_lead", {
        event_category: "engagement",
        event_label: "email_wall_submission_edouard",
        value: 1.0,
      });
      analyticsWindow.gtag("event", "conversion", {
        send_to: "AW-18294385008/HVHwCJeq2ckcEPDSuJNE",
        value: 1.0,
        currency: "EUR",
      });
    } catch (error) {
      console.warn("[Analytics Edouard] gtag lead/conversion events failed", error);
    }
  }

  try {
    analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
    analyticsWindow.dataLayer.push({
      event: "lead_submitted",
      form_type: "email_wall_edouard",
    });
  } catch (error) {
    console.warn("[Analytics Edouard] dataLayer lead event failed", error);
  }

  try {
    window.sessionStorage.setItem(EDOUARD_EMAIL_WALL_LEAD_KEY, "true");
    window.sessionStorage.removeItem(EDOUARD_EMAIL_WALL_PENDING_KEY);
  } catch (error) {
    console.warn("[Analytics Edouard] session storage write failed", error);
  }

  console.info("[Analytics Edouard] Lead email wall enregistré avec succès.");
}