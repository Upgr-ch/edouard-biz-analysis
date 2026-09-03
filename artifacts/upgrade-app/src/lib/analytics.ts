const EDOUARD_EMAIL_WALL_PENDING_KEY = "edouard.emailWallPending";
const EDOUARD_EMAIL_WALL_LEAD_KEY = "edouard.emailWallLeadTracked";

type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
};

export type EdouardConversionEvent =
  | "edouard_conversation_started"
  | "edouard_message_sent_1"
  | "edouard_message_sent_2"
  | "edouard_message_sent_3"
  | "edouard_message_sent_4"
  | "edouard_message_sent_5"
  | "edouard_message_sent_6"
  | "edouard_conversation_completed"
  | "edouard_email_wall_viewed"
  | "edouard_email_submitted";

const EDOUARD_GOOGLE_ADS_ID = "AW-18294385008";

export function trackEdouardConversion(eventName: EdouardConversionEvent) {
  if (typeof window === "undefined") return;

  const analyticsWindow = window as AnalyticsWindow;
  if (typeof analyticsWindow.gtag !== "function") return;

  try {
    analyticsWindow.gtag("event", "conversion", {
      send_to: `${EDOUARD_GOOGLE_ADS_ID}/${eventName}`,
    });
  } catch (error) {
    console.warn(`[Analytics Edouard] ${eventName} conversion failed`, error);
  }
}

export function pushEdouardDataLayerEvent(eventName: string) {
  if (typeof window === "undefined") return;

  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.dataLayer.push({ event: eventName });
}

export function trackEdouardStartClick() {
  if (typeof window === "undefined") return;

  const analyticsWindow = window as AnalyticsWindow;

  if (typeof analyticsWindow.gtag === "function") {
    try {
      analyticsWindow.gtag("event", "click_commencer_edouard", {
        event_category: "conversion",
        event_label: "Clic bouton Commencer Edouard",
      });
    } catch (error) {
      console.warn("[Analytics Edouard] start click GA4 event failed", error);
    }
  }

  try {
    analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
    analyticsWindow.dataLayer.push({
      event: "conversion_edouard_clic",
    });
  } catch (error) {
    console.warn("[Analytics Edouard] start click GTM event failed", error);
  }
}

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

  trackEdouardConversion("edouard_email_submitted");
  pushEdouardDataLayerEvent("edouard_email_submitted");

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