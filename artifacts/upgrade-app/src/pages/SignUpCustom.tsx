import { useState } from "react";
import { useSignUp, useClerk } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { BrainLogoSm } from "@/components/BrainLogo";

type Step = "email" | "password" | "code";

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

function inputFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "rgba(245,224,144,0.5)";
}
function inputBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
}

export default function SignUpCustom() {
  const { signUp, isLoaded } = useSignUp();
  const { setActive } = useClerk();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* Ne pas rendre le formulaire avant que Clerk soit initialisé */
  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#080F1E" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(245,224,144,0.2)", borderTopColor: "#F5E090", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Step 1 : submit email (+ optionally password if Clerk requires it) ── */
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (step === "email") {
        /* First attempt — email only */
        const result = await signUp.create({ emailAddress: email });

        if (result.status === "missing_requirements") {
          const missing = (result as unknown as { missingFields?: string[] }).missingFields ?? [];
          if (missing.includes("password")) {
            /* Clerk requires a password — show password field */
            setStep("password");
            setLoading(false);
            return;
          }
        }

        /* No password required — send email verification code */
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setStep("code");
      } else {
        /* step === "password" — user has now filled the password */
        await signUp.update({ password });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setStep("code");
      }
    } catch (err: unknown) {
      console.error("[sign-up] handleEmailSubmit error:", err);
      const clerkErrors = (err as { errors?: { message?: string; longMessage?: string; code?: string }[] })?.errors;
      const firstErr = clerkErrors?.[0];

      if (firstErr?.code === "form_identifier_exists") {
        setError("Un compte existe déjà avec cette adresse. Connectez-vous plutôt.");
      } else if (firstErr?.code === "form_param_nil" || firstErr?.code === "form_password_pwned") {
        /* Clerk requires password but none sent — show password step */
        setStep("password");
        setError(firstErr?.longMessage ?? firstErr?.message ?? "Un mot de passe est requis.");
      } else {
        const msg = firstErr?.longMessage ?? firstErr?.message ?? (err instanceof Error ? err.message : "Une erreur est survenue.");
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  /* ── Step 3 : verify email code ── */
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/");
      } else {
        setError("Vérification incomplète. Réessayez.");
      }
    } catch (err: unknown) {
      const clerkErrors = (err as { errors?: { message?: string; longMessage?: string }[] })?.errors;
      const msg = clerkErrors?.[0]?.longMessage ?? clerkErrors?.[0]?.message ?? "Code invalide ou expiré.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignUp() {
    if (!isLoaded || !signUp) return;
    signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectUrlComplete: "/",
    });
  }

  /* ── Render ── */
  const pageTitle =
    step === "code" ? "Vérifier votre e-mail" : "Créer un compte";
  const pageSubtitle =
    step === "code"
      ? `Un code à 6 chiffres a été envoyé à ${email}.`
      : step === "password"
      ? "Choisissez un mot de passe pour sécuriser votre compte."
      : "Entrez votre adresse e-mail pour commencer.";

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
          onClick={() =>
            step === "password"
              ? (setStep("email"), setError(""), setPassword(""))
              : step === "code"
              ? (setStep(password ? "password" : "email"), setError(""), setCode(""))
              : navigate("/auth")
          }
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
          {step === "email" ? "Retour à la connexion" : "Retour"}
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <BrainLogoSm />
          <span style={{ fontFamily: "var(--up-font)", fontSize: "1.35rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5E090" }}>
            Édouard
          </span>
        </div>
        <h2 style={{ fontFamily: "var(--up-font)", fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: 6, marginTop: 20 }}>
          {pageTitle}
        </h2>
        <p style={{ fontFamily: "var(--up-font)", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginBottom: 28 }}>
          {pageSubtitle}
        </p>

        {/* ── Code verification step ── */}
        {step === "code" ? (
          <form onSubmit={handleVerifyCode} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Code de vérification</label>
              <input
                type="text"
                required
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                style={{ ...inputStyle, letterSpacing: "0.2em", fontSize: "1.1rem" }}
                onFocus={inputFocus}
                onBlur={inputBlur}
                autoFocus
              />
            </div>
            {error && (
              <p style={{ color: "#f87171", fontFamily: "var(--up-font)", fontSize: "0.8rem", margin: 0 }}>
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Vérification…" : "Créer mon compte"}
            </button>
            <button
              type="button"
              onClick={() => { setStep(password ? "password" : "email"); setError(""); setCode(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontFamily: "var(--up-font)", fontSize: "0.78rem", textDecoration: "underline", padding: "4px 0" }}
            >
              ← Changer d'adresse e-mail
            </button>
          </form>

        ) : (
          /* ── Email + optional password step ── */
          <>
            {step === "email" && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 2,
                    color: "#fff",
                    fontFamily: "var(--up-font)",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    padding: "10px 0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    marginBottom: 20,
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Continuer avec Google
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 20px" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                  <span style={{ fontFamily: "var(--up-font)", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>ou</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                </div>
              </>
            )}

            <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {step === "email" && (
                <div>
                  <label style={labelStyle}>Adresse e-mail</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
              )}

              {step === "password" && (
                <>
                  <div style={{
                    background: "rgba(245,224,144,0.06)",
                    border: "1px solid rgba(245,224,144,0.15)",
                    borderRadius: 2,
                    padding: "10px 14px",
                    fontFamily: "var(--up-font)",
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.45)",
                  }}>
                    Inscription pour&nbsp;<strong style={{ color: "#F5E090" }}>{email}</strong>
                  </div>
                  <div>
                    <label style={labelStyle}>Mot de passe</label>
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      minLength={8}
                      placeholder="Minimum 8 caractères"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={inputStyle}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                      autoFocus
                    />
                  </div>
                </>
              )}

              {error && (
                <p style={{ color: "#f87171", fontFamily: "var(--up-font)", fontSize: "0.8rem", margin: 0 }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
                {loading ? "Envoi…" : step === "password" ? "Continuer" : "Continuer"}
              </button>
            </form>

            {step === "email" && (
              <p style={{ fontFamily: "var(--up-font)", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: 24 }}>
                Déjà un compte ?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#F5E090", fontFamily: "var(--up-font)", fontSize: "0.78rem", textDecoration: "underline", padding: 0 }}
                >
                  Se connecter
                </button>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
