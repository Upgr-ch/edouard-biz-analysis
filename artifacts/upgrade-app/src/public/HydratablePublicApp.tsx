import { useState, type ReactNode } from "react";
import { BrainLogoSm } from "../components/BrainLogo";
import {
  EDOUARD_COPYRIGHT,
  EDOUARD_DISCLAIMER,
  EDOUARD_FAQ_ITEMS,
  EDOUARD_INTRO_PARAGRAPHS,
  EDOUARD_LEGAL_LINKS,
  EDOUARD_PROFILES,
  EDOUARD_PUBLIC_DESCRIPTION,
  EDOUARD_PUBLIC_TITLE,
  EDOUARD_SIDEBAR_GUIDE,
  EDOUARD_STEPS,
  EDOUARD_WARNING_TEXT,
  type EdouardProfileKey,
} from "./edouardPublicContent";

interface HydratablePublicAppProps {
  conversationOverlay?: ReactNode;
  onProfileSelect?: (profile: EdouardProfileKey) => void;
}

interface PublicSidebarProps {
  mobile?: boolean;
  onClose?: () => void;
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

function PublicSidebar({ mobile = false, onClose }: PublicSidebarProps) {
  return (
    <aside
      aria-label="Progression du diagnostic"
      className={
        mobile
          ? "relative z-10 flex h-full w-64 shrink-0 flex-col border-r border-border"
          : "hidden h-screen w-64 shrink-0 flex-col border-r border-border md:flex"
      }
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
        {mobile ? (
          <button
            aria-label="Fermer le menu"
            className="ml-auto flex h-7 w-7 items-center justify-center rounded border"
            onClick={onClose}
            style={{
              borderColor: "rgba(245,224,144,0.20)",
              color: "#F5E090",
            }}
            type="button"
          >
            ×
          </button>
        ) : null}
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
  conversationOverlay,
  onProfileSelect,
}: HydratablePublicAppProps) {
  const [faqOpen, setFaqOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileSelectionLocked, setProfileSelectionLocked] =
    useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className="sr-only">
        <h1>{EDOUARD_PUBLIC_TITLE}</h1>
        <p>{EDOUARD_PUBLIC_DESCRIPTION}</p>
      </div>
      <PublicSidebar />
      <div
        aria-hidden={!mobileMenuOpen}
        className={
          mobileMenuOpen ? "fixed inset-0 z-50 flex md:hidden" : "hidden"
        }
      >
        <button
          aria-label="Fermer le menu"
          className="absolute inset-0"
          onClick={() => setMobileMenuOpen(false)}
          style={{ background: "rgba(0,0,0,0.62)" }}
          tabIndex={mobileMenuOpen ? 0 : -1}
          type="button"
        />
        <PublicSidebar
          mobile
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

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
            onClick={() => setMobileMenuOpen(true)}
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
                    disabled={
                      !onProfileSelect || profileSelectionLocked
                    }
                    key={key}
                    onClick={
                      onProfileSelect
                        ? () => {
                            if (profileSelectionLocked) return;
                            setProfileSelectionLocked(true);
                            onProfileSelect(key);
                          }
                        : undefined
                    }
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
          {conversationOverlay}
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
        <div className="sr-only">
          <h2>Glossaire</h2>

          <h3>Viabilité business</h3>
          <p>La viabilité business est la capacité d’un projet à atteindre un équilibre économique durable sans dépendre indéfiniment de financements externes. Elle s’évalue à partir du marché, du modèle économique, des coûts, de la trésorerie et de la capacité à acquérir des clients. Exemple concret : un éditeur de logiciel qui atteint 500 abonnés payants couvrant ses coûts fixes et variables devient viable à cette échelle. Erreur fréquente : confondre une idée séduisante ou un financement obtenu avec une réelle viabilité économique.</p>

          <h3>Rentabilité</h3>
          <p>La rentabilité est la capacité d’une activité à générer un profit après prise en compte de l’ensemble de ses charges. Elle se mesure notamment par la marge nette, le résultat d’exploitation ou le retour sur investissement. Exemple concret : une entreprise avec 100 000 € de chiffre d’affaires et 85 000 € de charges a une rentabilité de 15 000 € avant impôts. Erreur fréquente : confondre chiffre d’affaires élevé et rentabilité réelle.</p>

          <h3>Seuil de rentabilité (point mort)</h3>
          <p>Le seuil de rentabilité, ou point mort, est le niveau de chiffre d’affaires à partir duquel une entreprise couvre tous ses coûts et commence à générer un résultat nul puis positif. Il dépend des coûts fixes, des coûts variables et du prix de vente moyen. Exemple concret : si une entreprise a 10 000 € de coûts fixes mensuels et une marge sur coûts variables de 50 %, son seuil de rentabilité est de 20 000 € de chiffre d’affaires par mois. Erreur fréquente : oublier les coûts variables dans le calcul ou supposer que le seuil est atteint dès le premier client.</p>

          <h3>Business model</h3>
          <p>Le business model est la logique selon laquelle une organisation crée, délivre et capte de la valeur. Il décrit la proposition de valeur, les clients ciblés, les canaux, les ressources et les revenus. Exemple concret : un service de streaming fonctionne avec un abonnement mensuel, une bibliothèque de contenus et des serveurs de diffusion. Erreur fréquente : réduire le business model au seul prix de vente.</p>

          <h3>Étude de marché</h3>
          <p>Une étude de marché est la collecte et l’analyse d’informations sur un marché, ses clients, ses concurrents et ses tendances. Elle peut être quantitative, qualitative ou documentaire. Exemple concret : réaliser 20 entretiens avec des entrepreneurs cibles avant de lancer un outil de diagnostic business. Erreur fréquente : se limiter à des données secondaires sans interroger directement le marché.</p>

          <h3>Analyse concurrentielle</h3>
          <p>L’analyse concurrentielle consiste à identifier et comparer les forces et faiblesses des acteurs présents sur un marché. Elle aide à repérer les positionnements, les prix, les canaux et les différenciations possibles. Exemple concret : construire un tableau comparant cinq concurrents sur le prix, les fonctionnalités et la cible. Erreur fréquente : croire qu’une absence de concurrent signifie automatiquement une opportunité sans risque.</p>

          <h3>Modèle économique</h3>
          <p>Le modèle économique désigne la manière dont une entreprise génère des revenus et couvre ses coûts. Il précise les sources de revenus, la structure de prix et la logique de monétisation. Exemple concret : un modèle freemium repose sur une version gratuite qui alimente une version payante. Erreur fréquente : confondre modèle économique et plan d’affaires, qui est un document plus large.</p>

          <h3>Coûts fixes / variables</h3>
          <p>Les coûts fixes sont indépendants du volume d’activité, tandis que les coûts variables évoluent avec ce volume. Cette distinction permet de calculer la marge sur coûts variables et le seuil de rentabilité. Exemple concret : le loyer d’un atelier est un coût fixe, tandis que la matière première utilisée pour fabriquer un produit est un coût variable. Erreur fréquente : classer un coût dans la mauvaise catégorie, ce qui fausse les prévisions.</p>

          <h3>Marge brute / nette</h3>
          <p>La marge brute est la différence entre le chiffre d’affaires et les coûts directs, tandis que la marge nette intègre toutes les charges, y compris les frais généraux, les impôts et les intérêts. Exemple concret : une boutique qui vend un article 100 € acheté 60 € a une marge brute de 40 € ; si elle ajoute 30 € de charges indirectes, sa marge nette est de 10 €. Erreur fréquente : confondre marge et coefficient multiplicateur appliqué au prix d’achat.</p>

          <h3>Trésorerie</h3>
          <p>La trésorerie correspond aux flux d’entrées et de sorties d’argent disponibles à court terme. Elle ne dépend pas seulement du résultat comptable, mais aussi des délais de paiement et du besoin en fonds de roulement. Exemple concret : une entreprise rentable peut manquer de trésorerie si ses clients paient à 90 jours alors qu’elle paie ses fournisseurs à 30 jours. Erreur fréquente : confondre bénéfice comptable et trésorerie disponible.</p>

          <h3>Indice de viabilité</h3>
          <p>Un indice de viabilité est un score synthétique qui évalue la probabilité qu’un projet atteigne un équilibre économique durable. Il agrège généralement plusieurs critères : marché, rentabilité, trésorerie, acquisition client et risque concurrentiel. Exemple concret : un projet noté 72/100 sur une grille de viabilité peut être considéré comme prometteur mais encore fragile sur la trésorerie. Erreur fréquente : traiter cet indice comme une vérité absolue plutôt que comme une aide à la décision.</p>

          <h3>Go / No-Go / Pivot</h3>
          <p>Go / No-Go / Pivot est une grille de décision qui conduit soit à poursuivre un projet, soit à l’arrêter, soit à le réorienter. Elle s’appuie sur des critères explicites et des données vérifiables. Exemple concret : après une étude de marché, une équipe décide un No-Go car le coût d’acquisition dépasse la valeur vie client estimée. Erreur fréquente : prendre une décision Go ou No-Go sans critères définis au préalable.</p>

          <h3>Proposition de valeur</h3>
          <p>La proposition de valeur est le bénéfice clair qu’une offre apporte à un client pour résoudre un problème ou satisfaire un besoin. Elle doit être compréhensible, spécifique et différenciante. Exemple concret : une plateforme qui permet à un formateur de créer un plan de formation en 30 minutes propose un gain de temps mesurable. Erreur fréquente : présenter une liste de fonctionnalités au lieu d’un bénéfice client.</p>

          <h3>Client idéal (ICP)</h3>
          <p>Le client idéal, ou ICP, est le profil type de client qu’une entreprise cible en priorité. Il regroupe des caractéristiques démographiques, comportementales, économiques et des problèmes récurrents. Exemple concret : un ICP peut être « formateur indépendant, 35-55 ans, vendant des formations en ligne, sans diplôme pédagogique ». Erreur fréquente : vouloir cibler tout le monde, ce qui affaiblit le message et l’acquisition.</p>

          <h3>Funnel de conversion</h3>
          <p>Le funnel de conversion décrit les étapes par lesquelles passe un prospect avant de devenir client. Il comprend généralement la découverte, l’intérêt, la considération, la décision et l’achat. Exemple concret : une page de vente qui convertit 3 % de ses visiteurs en inscrits puis 20 % des inscrits en clients payants. Erreur fréquente : optimiser le trafic avant d’avoir mesuré les taux de conversion à chaque étape.</p>

          <h3>Coût d’acquisition client (CAC)</h3>
          <p>Le coût d’acquisition client, ou CAC, est le montant total dépensé pour acquérir un nouveau client. Il inclut les dépenses publicitaires, les outils, les salaires et les commissions commerciales. Exemple concret : si une entreprise dépense 5 000 € pour acquérir 50 clients, son CAC est de 100 €. Erreur fréquente : omettre les coûts internes et ne compter que la publicité.</p>

          <h3>Lifetime Value (LTV)</h3>
          <p>La Lifetime Value, ou LTV, est la valeur économique totale qu’un client génère sur toute la durée de sa relation avec une entreprise. Elle se calcule souvent à partir du panier moyen, de la fréquence d’achat et de la durée de rétention. Exemple concret : un client qui paie 30 € par mois pendant 24 mois génère une LTV brute de 720 €. Erreur fréquente : comparer une LTV brute à un CAC sans déduire les coûts de service et de rétention.</p>

          <h3>Plan d’affaires</h3>
          <p>Un plan d’affaires est un document qui structure un projet entrepreneurial : marché, offre, stratégie, équipe, prévisions financières et risques. Il sert à piloter le projet et à convaincre des partenaires ou financeurs. Exemple concret : un plan d’affaires sur trois ans avec compte de résultat, plan de trésorerie et seuil de rentabilité. Erreur fréquente : produire un document figé qui n’est jamais mis à jour avec les données réelles.</p>

          <h3>Slasheur</h3>
          <p>Un slasheur est une personne qui exerce plusieurs activités professionnelles, souvent salariées ou indépendantes, de manière simultanée ou combinée. Ce modèle se développe avec le travail à distance et la monétisation de compétences variées. Exemple concret : une consultante qui est à la fois formatrice, rédactrice et coach en organisation. Erreur fréquente : confondre slasheur et amateurisme, alors qu’il s’agit souvent d’une stratégie de diversification.</p>

          <h3>Économie de la connaissance</h3>
          <p>L’économie de la connaissance est un modèle économique dans lequel la valeur repose principalement sur la production, le traitement et la diffusion du savoir. Elle s’appuie sur la formation, les données, les logiciels et les services intellectuels. Exemple concret : une entreprise qui vend des formations en ligne sur l’ingénierie pédagogique participe à l’économie de la connaissance. Erreur fréquente : croire que la connaissance seule suffit, sans modèle économique ni canal de diffusion.</p>
        </div>
      </main>
    </div>
  );
}