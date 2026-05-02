/**
 * Emplacement 2 — Rectangle 300×250 en bas de la sidebar (desktop uniquement).
 * Retourne null si VITE_ADSENSE_CLIENT_ID ou VITE_ADSENSE_SLOT_ID_SIDEBAR est absent.
 */
import { useEffect, useRef } from "react";

const SidebarAdBanner = () => {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  const slotId   = import.meta.env.VITE_ADSENSE_SLOT_ID_SIDEBAR;
  const initialized = useRef(false);

  useEffect(() => {
    if (!clientId || !slotId || initialized.current) return;
    initialized.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense non chargé — silencieux
    }
  }, [clientId, slotId]);

  if (!clientId || !slotId) return null;

  return (
    <div className="hidden md:block shrink-0 p-3 border-t border-border">
      <p
        className="text-center mb-1"
        style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}
      >
        Publicité
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "inline-block", width: "300px", height: "250px" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
      />
    </div>
  );
};

export default SidebarAdBanner;
