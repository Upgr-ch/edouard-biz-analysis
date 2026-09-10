import { useState } from "react";
import { BrainLogoSm } from "../components/BrainLogo";
import {
  EDOUARD_COPYRIGHT,
  EDOUARD_DISCLAIMER,
  EDOUARD_FAQ_ITEMS,
  EDOUARD_INTRO_PARAGRAPHS,
  EDOUARD_LEGAL_LINKS,
  EDOUARD_PROFILES,
  EDOUARD_SIDEBAR_GUIDE,
  EDOUARD_STEPS,
  EDOUARD_WARNING_TEXT,
  type EdouardProfileKey,
} from "./edouardPublicContent";

interface HydratablePublicAppProps {
  onProfileSelect?: (profile: EdouardProfileKey) => void;
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 012 2v12a2 2 0 01-2 2h-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function PublicSidebar() {
  return (
    <aside
      aria-label="Progression du diagnostic"
      className="hidden h-screen w-64 shrink-0 flex-col border-r border-border md:flex"
      style={{ background: "rgba(8,15,30,0.95)" }}
    >
      <div className="flex shrink-0 items-center gap-2.5 border-b border-border p-4">
        <BrainLogoSm />
        <div>
          <span
            className="block text-sm font-semibold leading-tight"
            style={{ color: "#F5E090", fontFamily: "var(--up-font)" }}
          >
            Édouard
          </span>
          <span
            className="text-[10px] text-muted-foreground"
            style={{ letterSpacing: "0.02em" }}
          >
            Consultant en faisabilité et rentabilité de projets business.
          </span>
        </div>
      </div>

      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Progression
          </span>
          <span
            className="text-[10px] font-semibold"
            style={{ color: "#F5E090" }}
          >
            0%
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-accent">
          <div
            className="h-full w-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #B48C28, #F5E090)",
            }}
          />
        </div>
        <span className="mt-1 block text-[10px] text-muted-foreground/60">
          0/10 étapes complétées
        </span>
      </div>

      <div className="shrink-0 border-b border-border p-2">
        <button
          className="flex w-full items-center gap-2 border px-3 py-2 text-left text-xs"
          style={{
            borderColor: "rgba(245,224,144,0.20)",
            color: "#F5E090",
          }}
          type="button"
        >
          <span className="text-base leading-none">+</span>
          Nouvelle analyse
        </button>
      </div>

      <nav
        aria-label="Étapes d’analyse"
        className="min-h-0 flex-1 overflow-hidden px-4 py-4"
      >
        <p
          className="mb-4 text-[10px] font-medium uppercase"
          style={{
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.20em",
          }}
        >
          Étapes d’analyse
        </p>
        <ol className="space-y-2.5">
          {EDOUARD_STEPS.map((step, index) => {
            const active = index === 0;
            return (
              <li className="flex items-center gap-3" key={step}>
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px]"
                  style={{
                    borderColor: active
                      ? "#F5E090"
                      : "rgba(255,255,255,0.12)",
                    boxShadow: active
                      ? "0 0 10px rgba(245,224,144,0.24)"
                      : "none",
                    color: active ? "#F5E090" : "rgba(255,255,255,0.35)",
                  }}
                >
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className="block truncate text-xs"
                    style={{
                      color: active
                        ? "#F5E090"
                        : "rgba(255,255,255,0.82)",
                    }}
                  >
                    {step}
                  </span>
                  <span
                    className="block"
                    style={{
                      color: "rgba(255,255,255,0.24)",
                      fontSize: 9,
                    }}
                  >
                    Étape {index + 1}/10
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      <details
        className="group shrink-0 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <summary
          className="flex cursor-pointer list-none select-none items-center justify-between px-4 py-3"
          style={{ fontFamily: "var(--up-font)" }}
        >
          <span
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.20em",
            }}
          >
            En savoir plus
          </span>
          <span
            aria-hidden="true"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            ⌄
          </span>
        </summary>
        <div
          className="overflow-y-auto px-4 pb-4"
          style={{ maxHeight: 260, fontFamily: "var(--up-font)" }}
        >
          <h2
            className="mb-2 text-[10px] font-semibold leading-tight"
            style={{
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.04em",
            }}
          >
            {EDOUARD_SIDEBAR_GUIDE.title}
          </h2>
          <p
            className="mb-2 text-[10px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.30)" }}
          >
            {EDOUARD_SIDEBAR_GUIDE.introduction}
          </p>
          <ul className="space-y-2">
            {EDOUARD_SIDEBAR_GUIDE.pillars.map((pillar) => (
              <li key={pillar.title}>
                <p
                  className="text-[10px] leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                >
                  <strong
                    style={{
                      color: "rgba(245,224,144,0.55)",
                      fontWeight: 600,
                    }}
                  >
                    {pillar.title}
                  </strong>
                  {" — "}
                  {pillar.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </details>

      <div className="shrink-0 border-t border-border p-4">
        <p
          className="text-[10px] leading-relaxed"
          style={{ color: "#ffffff" }}
        >
          {EDOUARD_DISCLAIMER}
        </p>
      </div>
    </aside>
  );
}

export default function HydratablePublicApp({
  onProfileSelect,
}: HydratablePublicAppProps) {
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <PublicSidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <header
          className="z-30 flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5"
          style={{
            background: "rgba(8,15,30,0.90)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <button
            aria-label="Ouvrir le menu"
            className="fixed left-3 top-3 z-50 rounded border p-2 backdrop-blur-sm md:hidden"
            style={{
              background: "rgba(8,15,30,0.85)",
              borderColor: "rgba(245,224,144,0.18)",
              color: "#F5E090",
            }}
            type="button"
          >
            <MenuIcon />
          </button>

          <span
            className="text-xs"
            style={{
              color: "#F5E090",
              fontFamily: "var(--up-font)",
              letterSpacing: "0.05em",
            }}
          >
            Nouvelle analyse
          </span>

          <a
            className="flex items-center gap-1.5 rounded-sm px-4 py-1.5 text-xs font-semibold"
            href="/auth"
            style={{
              background: "#F5E090",
              color: "#080F1E",
              fontFamily: "var(--up-font)",
              boxShadow: "0 4px 16px -4px rgba(245,224,144,0.40)",
              letterSpacing: "0.04em",
            }}
          >
            <LoginIcon />
            Connexion
          </a>
        </header>

        <section
          aria-label="Démarrer le diagnostic"
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background"
        >
          <div className="scrollbar-none flex flex-1 flex-col items-center justify-start overflow-y-auto p-3 sm:p-6">
            <div className="w-full max-w-2xl flex-1 space-y-6 pb-20">
              <div className="flex flex-col items-start">
                <div className="flex max-w-full gap-2 sm:max-w-[85%] sm:gap-3">
                  <BrainLogoSm className="mt-0.5 shrink-0" />
                  <div
                    className="rounded-sm border px-3 py-2 text-[13px] sm:px-4 sm:py-3 sm:text-sm"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.85)",
                      fontFamily: "var(--up-font)",
                    }}
                  >
                    {EDOUARD_INTRO_PARAGRAPHS.map((paragraph, index) => (
                      <p
                        className={
                          index === EDOUARD_INTRO_PARAGRAPHS.length - 1
                            ? undefined
                            : "mb-5"
                        }
                        key={paragraph}
                        style={
                          index === EDOUARD_INTRO_PARAGRAPHS.length - 1
                            ? { marginBottom: 0 }
                            : undefined
                        }
                      >
                        {paragraph}
                      </p>
                    ))}
                    <p className="mt-5 font-semibold italic">
                      ⚠️ {EDOUARD_WARNING_TEXT}
                    </p>
                  </div>
                </div>
              </div>

              <div className="ml-10 mt-1 flex flex-col gap-1.5 sm:ml-11">
                {EDOUARD_PROFILES.map(({ key, label }) => (
                  <button
                    className="inline-flex w-full items-center gap-2.5 rounded-sm border px-3 py-2 text-left text-[11px] font-medium sm:gap-3 sm:px-4 sm:py-3 sm:text-[12px]"
                    key={key}
                    onClick={() => onProfileSelect?.(key)}
                    style={{
                      background: "rgba(245,224,144,0.05)",
                      borderColor: "rgba(245,224,144,0.28)",
                      color: "rgba(255,255,255,0.80)",
                      fontFamily: "var(--up-font)",
                    }}
                    type="button"
                  >
                    <span
                      className="shrink-0 text-[13px] font-bold"
                      style={{ color: "#F5E090" }}
                    >
                      {key}
                    </span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="relative z-50 w-full shrink-0 border-t border-border bg-background py-3">
          <section
            aria-label="Questions fréquentes"
            className={`${faqOpen ? "" : "hidden"} absolute bottom-full left-0 max-h-[60dvh] w-full overflow-y-auto overscroll-contain border-t border-border bg-background shadow-2xl`}
            id="frequently-asked-questions"
          >
            <div className="mx-auto max-w-3xl px-4 py-5">
              <div className="space-y-4">
                {EDOUARD_FAQ_ITEMS.map((item) => (
                  <div key={item.question}>
                    <h2 className="text-xs font-semibold text-foreground">
                      {item.question}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-5 gap-y-2 px-4 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {EDOUARD_LEGAL_LINKS.map((link) => (
              <a className="transition-colors hover:text-primary" href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
            <button
              aria-controls="frequently-asked-questions"
              aria-expanded={faqOpen}
              className="uppercase tracking-widest transition-colors hover:text-primary"
              onClick={() => setFaqOpen((open) => !open)}
              type="button"
            >
              Questions fréquentes
            </button>
            <span className="ml-2 opacity-50">{EDOUARD_COPYRIGHT}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}