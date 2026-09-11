import { GLOSSARY_ENTRIES } from "../../src/public/glossaire/glossaryData";
import { BrainLogoSm } from "../../src/components/BrainLogo";

export default function GlossairePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <a
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          href="/"
        >
          <span aria-hidden="true">←</span>
          Retour
        </a>

        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-4 border-b border-border pb-8">
          <BrainLogoSm className="shrink-0" />
          <h1 className="text-2xl font-bold text-foreground">
            Glossaire Business
          </h1>
        </div>

        <div className="space-y-10">
          {GLOSSARY_ENTRIES.map((entry, index) => (
            <article key={index} className="scroll-mt-6" id={`def-${index}`}>
              <h2 className="mb-3 text-lg font-semibold text-primary">
                {entry.question}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {entry.definition}
              </p>
            </article>
          ))}
        </div>

        <nav
          aria-label="Pages légales"
          className="mt-16 border-t border-border pt-6"
        >
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            <li><a className="transition-colors hover:text-primary" href="/mentions-legales">Mentions légales</a></li>
            <li><a className="transition-colors hover:text-primary" href="/cgu">CGU</a></li>
            <li><a className="transition-colors hover:text-primary" href="/cgv">CGV</a></li>
            <li><a className="transition-colors hover:text-primary" href="/confidentialite">Confidentialité</a></li>
            <li><a className="transition-colors hover:text-primary" href="/cookies">Cookies</a></li>
          </ul>
        </nav>

        <div className="mt-6 text-center text-xs text-muted-foreground/50">
          © 2026 - Kévin Lavergne – UpGrade
        </div>
      </div>
    </main>
  );
}