import { useState, useEffect } from "react";
import { X } from "lucide-react";

const DISMISSED_KEY = "edouard.promoBannerDismissed";
const MARKETING_KEY = "edouard_marketing_consent";

type Currency = { single: string; bundle: string };

function useCurrency(): Currency {
  const [currency, setCurrency] = useState<Currency>({ single: "28 €", bundle: "50 €" });

  useEffect(() => {
    fetch("https://ipapi.co/country/")
      .then((r) => r.text())
      .then((country) => {
        if (country.trim() === "CH") {
          setCurrency({ single: "26 CHF", bundle: "47 CHF" });
        }
      })
      .catch(() => {});
  }, []);

  return currency;
}

export default function PromoBanner() {
  const [visible, setVisible] = useState(() => {
    if (localStorage.getItem(MARKETING_KEY) === "1") return false;
    if (localStorage.getItem(DISMISSED_KEY) === "true") return false;
    return true;
  });

  const currency = useCurrency();

  if (!visible) return null;

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
  };

  const priceStyle: React.CSSProperties = {
    fontFamily: "var(--up-font)",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#F5E090",
    flexShrink: 0,
  };

  return (
    <a
      href="https://upgr.ch/upgr/vente-edouard"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        position: "relative",
        background: "linear-gradient(90deg, rgba(245,224,144,0.08) 0%, #0f0f0f 40%)",
        borderBottom: "1px solid rgba(245,224,144,0.30)",
        padding: "10px 48px 10px 20px",
        textDecoration: "none",
        flexShrink: 0,
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={dismiss}
        aria-label="Fermer"
        style={{
          position: "absolute",
          top: "50%",
          right: 14,
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.35)",
          padding: 4,
          display: "flex",
          alignItems: "center",
          transition: "color 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#F5E090")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
      >
        <X size={15} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" as const }}>
        {/* Main title */}
        <p style={{ fontFamily: "var(--up-font)", fontSize: "0.82rem", color: "#fff", margin: 0, flexShrink: 0 }}>
          Vous avez vu comment Édouard fonctionne.{" "}
          <span style={{ color: "#F5E090", fontWeight: 700 }}>Maintenant, préparez-vous vraiment.</span>
        </p>

        {/* Books */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" as const }}>
          {/* Book 1 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--up-font)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" as const, color: "rgba(245,224,144,0.45)" }}>
              Ebook
            </span>
            <span style={{ color: "rgba(255,255,255,0.20)" }}>·</span>
            <span style={{ fontFamily: "var(--up-font)", fontSize: "0.78rem", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              De l'idée au plan
            </span>
            <span style={priceStyle}>{currency.single}</span>
            <span style={{ fontFamily: "var(--up-font)", fontSize: "0.72rem", color: "rgba(255,255,255,0.40)" }}>
              — Clarifiez vos idées floues et structurez-les avant de les soumettre à Édouard.
            </span>
          </div>

          {/* Book 2 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--up-font)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" as const, color: "rgba(245,224,144,0.45)" }}>
              Ebook
            </span>
            <span style={{ color: "rgba(255,255,255,0.20)" }}>·</span>
            <span style={{ fontFamily: "var(--up-font)", fontSize: "0.78rem", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              Vos compétences humaines invisibles
            </span>
            <span style={priceStyle}>{currency.single}</span>
            <span style={{ fontFamily: "var(--up-font)", fontSize: "0.72rem", color: "rgba(255,255,255,0.40)" }}>
              — Mobilisez ce que vous êtes pour exécuter ce que vous planifiez.
            </span>
          </div>
        </div>

        {/* Bundle offer */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--up-font)", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>
            Offre groupée :
          </span>
          <span style={{ fontFamily: "var(--up-font)", fontSize: "0.82rem", fontWeight: 700, color: "#F5E090" }}>
            {currency.bundle}
          </span>
          <span style={{ fontFamily: "var(--up-font)", fontSize: "0.68rem", color: "rgba(255,255,255,0.30)" }}>
            les deux
          </span>
        </div>

        {/* CTA button */}
        <button
          style={{
            flexShrink: 0,
            background: "transparent",
            border: "1px solid rgba(245,224,144,0.50)",
            borderRadius: 4,
            padding: "5px 14px",
            fontFamily: "var(--up-font)",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#F5E090",
            cursor: "pointer",
            transition: "background 0.2s",
            letterSpacing: "0.03em",
            pointerEvents: "none",
          }}
        >
          Découvrir les deux ouvrages →
        </button>
      </div>
    </a>
  );
}
