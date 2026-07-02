import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { BrainLogoSm } from "@/components/BrainLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      style={{ background: "var(--up-bg, #080F1E)" }}
    >
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
          <BrainLogoSm />
          <span style={{ fontFamily: "var(--up-font)", fontSize: "1.2rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5E090" }}>
            Édouard
          </span>
        </div>

        {/* 404 */}
        <p style={{ fontFamily: "var(--up-font)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(245,224,144,0.50)", marginBottom: 12 }}>
          Erreur 404
        </p>
        <h1 style={{ fontFamily: "var(--up-font)", fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 12, lineHeight: 1.3 }}>
          Cette page n'existe pas
        </h1>
        <p style={{ fontFamily: "var(--up-font)", fontSize: "0.88rem", lineHeight: 1.7, color: "rgba(255,255,255,0.50)", marginBottom: 36 }}>
          La page que vous cherchez est introuvable. Elle a peut-être été déplacée ou supprimée.
          Revenez à l'accueil pour démarrer ou reprendre votre diagnostic business avec Édouard.
        </p>

        {/* Description */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 6,
            background: "rgba(245,224,144,0.05)",
            border: "1px solid rgba(245,224,144,0.15)",
            marginBottom: 32,
            textAlign: "left",
          }}
        >
          <p style={{ fontFamily: "var(--up-font)", fontSize: "0.82rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: 0 }}>
            <strong style={{ color: "rgba(255,255,255,0.80)" }}>Édouard</strong> est un consultant IA en faisabilité et rentabilité de projets business.
            Il analyse votre idée en 10 étapes structurées et génère un rapport PDF complet avec un indice de viabilité.
            Confectionné en Suisse, conçu pour les entrepreneurs francophones.
          </p>
        </div>

        {/* CTA */}
        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            borderRadius: 4,
            background: "#F5E090",
            color: "#080F1E",
            fontFamily: "var(--up-font)",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textDecoration: "none",
            boxShadow: "0 6px 20px -4px rgba(245,224,144,0.45)",
          }}
        >
          Retourner à l'accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
