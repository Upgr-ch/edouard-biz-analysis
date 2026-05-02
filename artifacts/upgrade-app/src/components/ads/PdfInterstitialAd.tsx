/**
 * Emplacement 3 — Modal interstitielle pendant la génération PDF (~2,5 s).
 * Retourne null si VITE_ADSENSE_CLIENT_ID ou VITE_ADSENSE_SLOT_ID_PDF est absent.
 *
 * Usage :
 *   const [showPdfAd, setShowPdfAd] = useState(false);
 *   <PdfInterstitialAd open={showPdfAd} onClose={() => setShowPdfAd(false)} />
 *
 *   // Avant de lancer la génération PDF :
 *   setShowPdfAd(true);  // la modal se ferme automatiquement après 2,5 s
 */
import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PdfInterstitialAd = ({ open, onClose }: Props) => {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  const slotId   = import.meta.env.VITE_ADSENSE_SLOT_ID_PDF;
  const initialized = useRef(false);

  // Fermeture automatique après 2,5 secondes
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  // Initialisation AdSense
  useEffect(() => {
    if (!open || !clientId || !slotId || initialized.current) return;
    initialized.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense non chargé — silencieux
    }
  }, [open, clientId, slotId]);

  if (!open || !clientId || !slotId) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: "rgba(8,15,30,0.92)", backdropFilter: "blur(8px)" }}
    >
      <p
        className="mb-3"
        style={{ fontSize: "0.65rem", letterSpacing: "0.25em", color: "rgba(255,255,255,0.30)", textTransform: "uppercase" }}
      >
        Publicité — génération du PDF en cours…
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

export default PdfInterstitialAd;
