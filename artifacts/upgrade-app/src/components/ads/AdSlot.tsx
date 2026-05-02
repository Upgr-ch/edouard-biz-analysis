/**
 * Emplacement 1 — Bannière dans le chat (toutes les 6 réponses IA).
 * Retourne null si VITE_ADSENSE_CLIENT_ID ou VITE_ADSENSE_SLOT_ID est absent.
 */
import { useEffect, useRef } from "react";

const AdSlot = () => {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  const slotId   = import.meta.env.VITE_ADSENSE_SLOT_ID;
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
    <div className="w-full my-4">
      <p
        className="text-center mb-1"
        style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}
      >
        Publicité
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSlot;
