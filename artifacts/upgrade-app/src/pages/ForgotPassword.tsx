import { useState } from "react";
import { useSignIn } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { BrainLogoSm } from "@/components/BrainLogo";

type Step = "email" | "code";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 2,
  color: "#fff",
  fontFamily: "var(--up-font)",
  fontSize: "0.9rem",
  padding: "10px 14px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const btnStyle: React.CSSProperties = {
  width: "100%",
  background: "#F5E090",
  color: "#080F1E",
  border: "none",
  borderRadius: 2,
  fontFamily: "var(--up-font)",
  fontWeight: 700,
  fontSize: "0.9rem",
  letterSpacing: "0.06em",
  padding: "11px 0",
  cursor: "pointer",
  transition: "opacity 0.2s",
  boxShadow: "0 6px 20px -6px rgba(245,224,144,0.45)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--up-font)",
  fontSize: "0.75rem",
  color: "rgba(255,255,255,0.55)",
  marginBottom: 6,
  letterSpacing: "0.04em",
};

export default function ForgotPassword() {
  const { signIn, isLoaded } = useSignIn();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!isLoaded || !signIn) {
      setError("Service non disponible, veuillez réessayer.");
      setLoading(false);
      return;
    }
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email });
      setStep("code");
    } catch (err: unknown) {
      console.error("[forgot-password] sendCode error:", err);
      const clerkErrors = (err as { errors?: { message?: string; longMessage?: string }[] })?.errors;
      const msg = clerkErrors?.[0]?.longMessage
        ?? clerkErrors?.[0]?.message
        ?? (err instanceof Error ? err.message : "Une erreur est survenue.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!isLoaded || !signIn) {
      setError("Service non disponible, veuillez réessayer.");
      setLoading(false);
      return;
    }
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (result.status === "complete") {
        setDone(true);
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError("Vérification incomplète. Réessayez.");
      }
    } catch (err: unknown) {
      const msg = (err as { errors?: { message: string }[] })?.errors?.[0]?.message ?? "Code ou mot de passe invalide.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#080F1E",
        padding: "32px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Back */}
        <button
          onClick={() => navigate("/auth")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.45)",
            fontFamily: "var(--up-font)",
            fontSize: "0.78rem",
            letterSpacing: "0.04em",
            padding: "4px 0",
            marginBottom: 32,
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#F5E090")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour à la connexion
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <BrainLogoSm />
          <span style={{ fontFamily: "var(--up-font)", fontSize: "1.35rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5E090" }}>
            Édouard
          </span>
        </div>
        <h2 style={{ fontFamily: "var(--up-font)", fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: 6, marginTop: 20 }}>
          {step === "email" ? "Mot de passe oublié" : "Nouveau mot de passe"}
        </h2>
        <p style={{ fontFamily: "var(--up-font)", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginBottom: 28 }}>
          {step === "email"
            ? "Entrez votre adresse e-mail. Vous recevrez un code de réinitialisation."
            : `Un code a été envoyé à ${email}. Entrez-le ci-dessous avec votre nouveau mot de passe.`}
        </p>

        {done ? (
          <div style={{ textAlign: "center", color: "#F5E090", fontFamily: "var(--up-font)", fontSize: "0.9rem", padding: "20px 0" }}>
            ✓ Mot de passe mis à jour. Redirection…
          </div>
        ) : step === "email" ? (
          <form onSubmit={sendCode} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Adresse e-mail</label>
              <input
                type="email"
                required
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,224,144,0.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)")}
              />
            </div>
            {error && <p style={{ color: "#f87171", fontFamily: "var(--up-font)", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Envoi…" : "Envoyer le code"}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Code reçu par e-mail</label>
              <input
                type="text"
                required
                placeholder="123456"
                value={code}
                onChange={e => setCode(e.target.value)}
                style={{ ...inputStyle, letterSpacing: "0.15em" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,224,144,0.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)")}
              />
            </div>
            <div>
              <label style={labelStyle}>Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(245,224,144,0.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)")}
              />
            </div>
            {error && <p style={{ color: "#f87171", fontFamily: "var(--up-font)", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Vérification…" : "Réinitialiser le mot de passe"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setError(""); setCode(""); setPassword(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontFamily: "var(--up-font)", fontSize: "0.78rem", textDecoration: "underline", padding: "4px 0" }}
            >
              Renvoyer le code
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
