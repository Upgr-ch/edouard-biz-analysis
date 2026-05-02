import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const STAGES = [
  { at: 0,  text: "Compilation de l'ensemble de vos échanges…" },
  { at: 20, text: "Analyse de la viabilité économique…" },
  { at: 42, text: "Structuration du rapport final…" },
  { at: 63, text: "Mise en forme du document PDF…" },
  { at: 82, text: "Finalisation en cours…" },
];

interface PdfProgressOverlayProps {
  isVisible: boolean;
  isFinal?: boolean;
  onCancel?: () => void;
  stage?: string;
}

export default function PdfProgressOverlay({ isVisible, isFinal = false, onCancel, stage }: PdfProgressOverlayProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 91) return prev;
        const step = Math.random() * 2.2 + 0.4;
        return Math.min(91, prev + step);
      });
    }, 130);
    // Auto-cancel after 150s if still stuck (final report needs more time)
    const timeout = setTimeout(() => { onCancel?.(); }, 150_000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [isVisible, onCancel]);

  const statusText =
    [...STAGES].reverse().find((s) => progress >= s.at)?.text ?? STAGES[0].text;

  if (!isVisible) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-7"
      style={{ background: "rgba(8,15,30,0.93)", backdropFilter: "blur(10px)" }}
    >
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded transition-opacity opacity-40 hover:opacity-100"
          style={{ color: "rgba(255,255,255,0.7)" }}
          title="Annuler"
        >
          <span style={{ fontSize: "18px", lineHeight: 1 }}>✕</span>
        </button>
      )}
      <Loader2
        size={36}
        className="animate-spin"
        style={{ color: "#F5E090", opacity: 0.85 }}
      />

      <div className="flex flex-col items-center gap-3" style={{ width: "260px" }}>
        <p
          className="text-sm font-semibold text-center tracking-wide"
          style={{ color: "#F5E090", fontFamily: "var(--up-font)", letterSpacing: "0.06em" }}
        >
          {isFinal ? "Génération du rapport complet" : "Génération de la fiche"}
        </p>

        <div
          className="relative w-full rounded-full overflow-hidden"
          style={{ height: "5px", background: "rgba(245,224,144,0.14)" }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #C8A84B 0%, #F5E090 100%)",
              boxShadow: "0 0 10px rgba(245,224,144,0.55)",
              transition: "width 0.13s ease-out",
            }}
          />
          <div className="pdf-shimmer absolute inset-0" />
        </div>

        <div className="flex items-center justify-between w-full">
          <p
            className="text-[11px] leading-snug"
            style={{ color: "rgba(255,255,255,0.42)", fontFamily: "var(--up-font)" }}
          >
            {stage ?? statusText}
          </p>
          <p
            className="text-[11px] font-semibold"
            style={{ color: "#F5E090", fontFamily: "var(--up-font)" }}
          >
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
}
