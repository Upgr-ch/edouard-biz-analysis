import { useState } from "react";
// ⚠️ Utiliser le hook legacy : Clerk v6 n'expose pas encore create() et
// attemptFirstFactor() dans ses types standard — le legacy les expose correctement.
import { useSignIn } from "@clerk/react/legacy";
import { useNavigate } from "react-router-dom";
import { BrainLogoSm } from "@/components/BrainLogo";

type Step = "email" | "code" | "password" | "done";

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

function iFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "rgba(245,224,144,0.5)";
}
function iBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
}

export default function ForgotPassword() {
  // legacy hook — expose create() et attemptFirstFactor() correctement
  const { signIn, isLoaded, setActive } = useSignIn() as unknown as {
    signIn: {
      create: (params: unknown) => Promise<unknown>;
      attemptFirstFactor: (params: unknown) => Promise<{ status: string }>;
      resetPassword: (params: unknown) => Promise<{ status: string; createdSessionId?: string }>;
    };
    isLoaded: boolean;
    setActive: (params: { session: string }) => Promise<void>;
  };
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── Étape 1 : envoyer le code par email ── */
  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("code");
    } catch (err: unknown) {
      console.error("[forgot-password] sendCode:", err);
      const clerkErrors = (err as { errors?: { message?: string; longMessage?: string }[] })?.errors;
      const msg = clerkErrors?.[0]?.longMessage
        ?? clerkErrors?.[0]?.message
        ?? (err instanceof Error ? err.message : "Une erreur est survenue.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  /* ── Étape 2 : vérifier le code ── */
  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });
      if (result.status === "needs_new_password") {
        // Code valide — passer à la saisie du nouveau mot de passe
        setStep("password");
      } else if (result.status === "complete") {
        // Connexion directe (rare mais géré)
        navigate("/");
      } else {
        setError("Code invalide ou expiré. Réessayez.");
      }
    } catch (err: unknown) {
      const clerkErrors = (err as { errors?: { message?: string; longMessage?: string }[] })?.errors;
      const msg = clerkErrors?.[0]?.longMessage
        ?? clerkErrors?.[0]?.message
        ?? "Code invalide ou expiré.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  /* ── Étape 3 : définir le nouveau mot de passe ── */
  async function setNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn.resetPassword({
        password,
        signOutOfOtherSessions: true,
      });
      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        setStep("done");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setError("Réinitialisation incomplète. Réessayez.");
      }
    } catch (err: unknown) {
      const clerkErrors = (err as { errors?: { message?: string; longMessage?: string }[] })?.errors;
      const msg = clerkErrors?.[0]?.longMessage
        ?? clerkErrors?.[0]?.message
        ?? "Une erreur est survenue.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<Step, string> = {
    email:    "Mot de passe oublié",
    code:     "Entrez le code reçu",
    password: "Nouveau mot de passe",
    done:     "Mot de passe modifié !",
  };

  const subtitles: Record<Step, string> = {
    email:    "Entrez votre adresse e-mail. Vous recevrez un code à 6 chiffres.",
    code:     `Un code a été envoyé à ${email}.`,
    password: "Choisissez un nouveau mot de passe (min. 8 caractères).",
    done:     "Redirection en cours…",
  };

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
        {step !== "done" && (
          <button
            onClick={() => {
              if (step === "code")     { setStep("email"); setCode(""); setError(""); }
              else if (step === "password") { setStep("code"); setPassword(""); setConfirmPassword(""); setError(""); }
              else navigate("/auth");
            }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.45)", fontFamily: "var(--up-font)",
              fontSize: "0.78rem", letterSpacing: "0.04em",
              padding: "4px 0", marginBottom: 32, transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#F5E090")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {step === "email" ? "Retour à la connexion" : "Retour"}
          </button>
        )}

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <BrainLogoSm />
          <span style={{ fontFamily: "var(--up-font)", fontSize: "1.35rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5E090" }}>
            Édouard
          </span>
        </div>

        <h2 style={{ fontFamily: "var(--up-font)", fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: 6, marginTop: 20 }}>
          {titles[step]}
        </h2>
        <p style={{ fontFamily: "var(--up-font)", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginBottom: 28 }}>
          {subtitles[step]}
        </p>

        {/* ── Step done ── */}
        {step === "done" && (
          <div style={{ textAlign: "center", color: "#F5E090", fontFamily: "var(--up-font)", fontSize: "1rem", padding: "20px 0" }}>
            ✓ Mot de passe mis à jour. Redirection…
          </div>
        )}

        {/* ── Étape 1 : email ── */}
        {step === "email" && (
          <form onSubmit={sendCode} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Adresse e-mail</label>
              <input
                type="email" required autoComplete="email"
                placeholder="votre@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle} onFocus={iFocus} onBlur={iBlur}
              />
            </div>
            {error && <p style={{ color: "#f87171", fontFamily: "var(--up-font)", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading || !isLoaded} style={{ ...btnStyle, opacity: (loading || !isLoaded) ? 0.6 : 1 }}>
              {loading ? "Envoi…" : "Envoyer le code"}
            </button>
          </form>
        )}

        {/* ── Étape 2 : code ── */}
        {step === "code" && (
          <form onSubmit={verifyCode} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Code reçu par e-mail</label>
              <input
                type="text" required autoComplete="one-time-code"
                inputMode="numeric" maxLength={6} placeholder="123456"
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                style={{ ...inputStyle, letterSpacing: "0.2em", fontSize: "1.1rem" }}
                onFocus={iFocus} onBlur={iBlur} autoFocus
              />
            </div>
            {error && <p style={{ color: "#f87171", fontFamily: "var(--up-font)", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Vérification…" : "Vérifier le code"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setError(""); setCode(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontFamily: "var(--up-font)", fontSize: "0.78rem", textDecoration: "underline", padding: "4px 0" }}
            >
              Je n'ai pas reçu le code — Réessayer
            </button>
          </form>
        )}

        {/* ── Étape 3 : nouveau mot de passe ── */}
        {step === "password" && (
          <form onSubmit={setNewPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Nouveau mot de passe</label>
              <input
                type="password" required autoComplete="new-password"
                minLength={8} placeholder="Minimum 8 caractères"
                value={password} onChange={e => setPassword(e.target.value)}
                style={inputStyle} onFocus={iFocus} onBlur={iBlur} autoFocus
              />
            </div>
            <div>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input
                type="password" required autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                style={inputStyle} onFocus={iFocus} onBlur={iBlur}
              />
            </div>
            {error && <p style={{ color: "#f87171", fontFamily: "var(--up-font)", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
