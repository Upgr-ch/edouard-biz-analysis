import { useState } from "react";
import { X } from "lucide-react";

const DISMISSED_KEY = "edouard.promoBannerDismissed";

export default function PromoBanner() {
  const [visible, setVisible] = useState(() => {
    if (localStorage.getItem(DISMISSED_KEY) === "true") return false;
    return true;
  });

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
              Livre 1
            </span>
            <span style={{ color: "rgba(255,255,255,0.20)" }}>·</span>
            <span style={{ fontFamily: "var(--up-font)", fontSize: "0.78rem", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              De l'idée au plan
            </span>
            <span style={priceStyle}>26 CHF / 28 €</span>
            <span style={{ fontFamily: "var(--up-font)", fontSize: "0.72rem", color: "rgba(255,255,255,0.40)" }}>
              — Clarifiez vos idées floues et structurez-les avant de les soumettre à Édouard.
            </span>
          </div>

          {/* Book 2 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--up-font)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" as const, color: "rgba(245,224,144,0.45)" }}>
              Livre 2
            </span>
            <span style={{ color: "rgba(255,255,255,0.20)" }}>·</span>
            <span style={{ fontFamily: "var(--up-font)", fontSize: "0.78rem", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              Vos compétences humaines invisibles
            </span>
            <span style={priceStyle}>26 CHF / 28 €</span>
            <span style={{ fontFamily: "var(--up-font)", fontSize: "0.72rem", color: "rgba(255,255,255,0.40)" }}>
              — Mobilisez ce que vous êtes pour exécuter ce que vous planifiez.
            </span>
          </div>
        </div>

        {/* Bundle offer */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--up-font)", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>
            Offre groupée 2 Livres :
          </span>
          <span style={{ fontFamily: "var(--up-font)", fontSize: "0.82rem", fontWeight: 700, color: "#F5E090" }}>
            47 CHF / 50 €
          </span>
          <span style={{ fontFamily: "var(--up-font)", fontSize: "0.68rem", color: "rgba(255,255,255,0.30)" }}>
            les deux
          </span>
        </div>

        <p style={{ width: "100%", fontFamily: "var(--up-font)", fontSize: "0.68rem", lineHeight: 1.5, color: "rgba(255,255,255,0.40)", margin: 0 }}>
          Prix en euros donnés à titre indicatif, sur la base d&apos;un équivalent en CHF. Le montant facturé peut varier selon le taux de change appliqué au moment du paiement.
        </p>

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
