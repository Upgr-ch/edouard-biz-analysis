/**
 * UpGrade — Cerveau animé Édouard
 * Petit variant (sidebar / avatar) et grand variant (hero).
 */

interface BrainLogoProps {
  size?: "sm" | "lg";
  className?: string;
}

const BrainSVG = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 240 240"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    <defs>
      <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#F5E090" stopOpacity="0.18"/>
        <stop offset="60%"  stopColor="#F5E090" stopOpacity="0.05"/>
        <stop offset="100%" stopColor="#F5E090" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="120" cy="120" r="110" fill="url(#brainGlow)"/>
    <g fill="none" stroke="#F5E090" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M120 28 C74 28,42 62,42 108 C42 132,50 152,64 168 C70 196,96 214,120 214 C144 214,170 196,176 168 C190 152,198 132,198 108 C198 62,166 28,120 28Z" opacity="0.85"/>
      <path d="M120 32 L120 210" opacity="0.45" strokeDasharray="3 4"/>
      <path d="M85 58 Q66 78,78 100 T70 142 T90 178"    opacity="0.85"/>
      <path d="M62 92 Q80 102,74 122 T92 154"            opacity="0.70"/>
      <path d="M104 64 Q96 90,108 112 T96 148 T108 184"  opacity="0.75"/>
      <path d="M155 58 Q174 78,162 100 T170 142 T150 178" opacity="0.85"/>
      <path d="M178 92 Q160 102,166 122 T148 154"         opacity="0.70"/>
      <path d="M136 64 Q144 90,132 112 T144 148 T132 184" opacity="0.75"/>
      <circle cx="80"  cy="100" r="2.2" fill="#F5E090"/>
      <circle cx="160" cy="100" r="2.2" fill="#F5E090"/>
      <circle cx="105" cy="130" r="2.2" fill="#F5E090"/>
      <circle cx="135" cy="130" r="2.2" fill="#F5E090"/>
      <circle cx="92"  cy="162" r="2"   fill="#F5E090"/>
      <circle cx="148" cy="162" r="2"   fill="#F5E090"/>
      <circle cx="120" cy="180" r="2"   fill="#F5E090"/>
    </g>
  </svg>
);

/** Petit logo carré pour la sidebar et les avatars */
export const BrainLogoSm = ({ className }: { className?: string }) => (
  <div
    className={className}
    style={{
      position: "relative",
      width: 32,
      height: 32,
      borderRadius: "50%",
      border: "1px solid rgba(245,224,144,0.30)",
      boxShadow: "0 0 12px rgba(245,224,144,0.15)",
      overflow: "hidden",
      background: "rgba(245,224,144,0.04)",
      flexShrink: 0,
    }}
  >
    <div style={{ position: "absolute", inset: 2 }}>
      <BrainSVG />
    </div>
    <div className="up-brain-laser-sm" />
  </div>
);

/** Grand logo animé pour la landing page */
export const BrainLogoLg = ({ className }: { className?: string }) => (
  <div className={`up-brain ${className ?? ""}`}>
    <div className="up-brain__rings">
      <div className="up-brain__ring up-brain__ring--outer" />
      <div className="up-brain__ring up-brain__ring--inner" />
    </div>
    <div className="up-brain__svg">
      <BrainSVG />
    </div>
    <div className="up-brain__laser" />
  </div>
);
