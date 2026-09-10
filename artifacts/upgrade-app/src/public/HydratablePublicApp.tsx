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

          <h3>Churn rate</h3>
          <p>Le churn rate mesure le pourcentage de clients perdus sur une période donnée. Il révèle si votre offre retient réellement la valeur qu'elle promet. Un churn élevé n'est jamais un problème marketing : c'est un problème produit ou de promesse mal tenue. Exemple concret : une app SaaS qui perd 8% de ses abonnés chaque mois voit sa base clients divisée par deux en un an, même avec de nouvelles acquisitions. Erreur fréquente : compenser un churn élevé par plus d'acquisition au lieu de traiter la cause de départ.</p>

          <h3>MVP (Produit Minimum Viable)</h3>
          <p>Le MVP est la version la plus réduite d'un produit permettant de tester une hypothèse business auprès de vrais clients. Il ne s'agit pas d'un produit incomplet, mais d'un outil de validation. Son seul objectif est d'apprendre vite, pas de vendre beaucoup. Exemple concret : Dropbox a validé son concept avec une simple vidéo de démonstration avant de coder le produit. Erreur fréquente : confondre MVP et version bâclée du produit final.</p>

          <h3>MRR / ARR</h3>
          <p>Le MRR (revenu mensuel récurrent) et l'ARR (revenu annuel récurrent) mesurent les revenus stables générés par des abonnements. Ce sont les indicateurs de référence pour toute activité par abonnement. Ils permettent de projeter la croissance réelle, hors ventes ponctuelles. Exemple concret : 50 clients à 100€/mois génèrent un MRR de 5 000€, soit un ARR de 60 000€. Erreur fréquente : inclure des revenus one-shot dans le calcul du MRR, ce qui fausse la lecture de la récurrence.</p>

          <h3>Burn rate</h3>
          <p>Le burn rate est la vitesse à laquelle une entreprise consomme sa trésorerie disponible. Il conditionne directement la durée de vie du projet avant recherche de financement ou rentabilité. Ignorer ce chiffre, c'est piloter à l'aveugle. Exemple concret : une startup avec 120 000€ en caisse et un burn rate de 10 000€/mois dispose de 12 mois avant rupture de trésorerie. Erreur fréquente : ne suivre le burn rate qu'a posteriori, sans anticipation ni scénario de réduction.</p>

          <h3>Pitch deck</h3>
          <p>Le pitch deck est le support de présentation synthétique utilisé pour convaincre investisseurs, partenaires ou clients stratégiques. Il condense le problème, la solution, le marché et le modèle économique en quelques slides. Sa qualité conditionne souvent le premier tri fait par un investisseur. Exemple concret : le pitch deck original d'Airbnb tenait en 10 slides et exposait clairement le marché, la traction et le modèle de revenus. Erreur fréquente : surcharger le deck de détails techniques au lieu de démontrer la traction et l'opportunité.</p>

          <h3>Runway</h3>
          <p>Le runway est le nombre de mois restant avant épuisement total de la trésorerie, au rythme de dépense actuel. C'est l'indicateur de survie le plus brutal et le plus honnête d'un projet. Il détermine l'urgence réelle des décisions à prendre. Exemple concret : une trésorerie de 30 000€ avec un burn rate de 5 000€/mois donne un runway de 6 mois. Erreur fréquente : calculer le runway sans intégrer les charges variables saisonnières ou les paiements différés.</p>

          <h3>Bootstrapping</h3>
          <p>Le bootstrapping consiste à développer une entreprise avec ses fonds propres, sans lever de capitaux externes. Cette approche impose une discipline financière stricte mais préserve l'indépendance décisionnelle. Elle force à générer du chiffre d'affaires rapidement plutôt que de la croissance financée. Exemple concret : Mailchimp s'est développé pendant près de 10 ans en bootstrapping avant de devenir un acteur majeur du secteur. Erreur fréquente : confondre bootstrapping et absence totale de stratégie financière.</p>

          <h3>Levée de fonds</h3>
          <p>La levée de fonds est l'opération par laquelle une entreprise cède une part de son capital contre un apport financier externe. Elle accélère la croissance mais dilue le pouvoir de décision du ou des fondateurs. Ce n'est pas un aboutissement, c'est un outil, avec ses contreparties. Exemple concret : une levée en série A de 2 millions d'euros contre 20% du capital fixe la valorisation de l'entreprise à 10 millions d'euros. Erreur fréquente : lever des fonds pour combler un problème de rentabilité plutôt que pour financer une croissance déjà prouvée.</p>

          <h3>Scalabilité</h3>
          <p>La scalabilité désigne la capacité d'un business à multiplier ses revenus sans augmenter ses coûts dans les mêmes proportions. C'est ce qui distingue un métier de service classique d'une entreprise à fort potentiel de croissance. Un modèle non scalable plafonne mécaniquement, quel que soit l'effort commercial. Exemple concret : un logiciel vendu en ligne peut servir 10 000 clients sans coût de production additionnel significatif, contrairement à une prestation de conseil facturée à l'heure. Erreur fréquente : croire qu'un business est scalable simplement parce qu'il est numérique.</p>

          <h3>Product-Market Fit</h3>
          <p>Le Product-Market Fit désigne le moment où une offre répond précisément à une demande de marché suffisamment forte et solvable. Avant ce cap, toute stratégie de croissance est prématurée. C'est la condition préalable à tout investissement massif en acquisition. Exemple concret : Slack a atteint son Product-Market Fit lorsque des équipes entières ont commencé à l'adopter spontanément sans campagne marketing dédiée. Erreur fréquente : investir en publicité avant d'avoir validé que le marché veut réellement du produit.</p>

          <h3>Prévisionnel financier</h3>
          <p>Le prévisionnel financier est une projection chiffrée du chiffre d'affaires, des charges et de la trésorerie sur une période donnée, généralement 3 ans. Il sert de boussole décisionnelle et d'outil de crédibilité face aux partenaires financiers. Un prévisionnel non réactualisé perd toute utilité. Exemple concret : une banque exige systématiquement un prévisionnel sur 3 ans avant d'accorder un prêt professionnel. Erreur fréquente : construire un prévisionnel optimiste sans scénario pessimiste associé.</p>

          <h3>Statut juridique</h3>
          <p>Le statut juridique définit le cadre légal, fiscal et social de l'activité : auto-entreprise, SASU, SARL, entre autres. Ce choix impacte directement la fiscalité, la protection sociale et la responsabilité personnelle du dirigeant. Il doit être choisi en fonction du projet réel, pas par habitude ou par défaut. Exemple concret : un auto-entrepreneur est fiscalement plafonné, contrairement à une SASU qui permet de lever des fonds et d'associer des partenaires. Erreur fréquente : choisir un statut par simplicité administrative sans anticiper la croissance de l'activité.</p>

          <h3>BFR (Besoin en Fonds de Roulement)</h3>
          <p>Le BFR représente le montant d'argent nécessaire pour financer le décalage entre les dépenses engagées et les encaissements clients. Il est souvent sous-estimé alors qu'il peut mettre en péril une entreprise rentable sur le papier. Une croissance rapide sans BFR maîtrisé peut asphyxier la trésorerie. Exemple concret : une entreprise qui paie ses fournisseurs à 30 jours mais encaisse ses clients à 90 jours doit financer ce décalage de 60 jours. Erreur fréquente : ne calculer le BFR qu'une fois par an, alors qu'il évolue avec l'activité.</p>

          <h3>Chiffre d'affaires</h3>
          <p>Le chiffre d'affaires correspond au total des ventes réalisées sur une période, avant déduction des charges. Il mesure l'activité commerciale, pas la santé financière de l'entreprise. Un chiffre d'affaires élevé sans marge suffisante ne garantit aucune viabilité. Exemple concret : une entreprise peut afficher 500 000€ de chiffre d'affaires et être en déficit si ses charges dépassent ce montant. Erreur fréquente : présenter le chiffre d'affaires comme un indicateur de performance suffisant à lui seul.</p>

          <h3>EBITDA</h3>
          <p>L'EBITDA mesure le résultat d'exploitation avant intérêts, impôts, dépréciations et amortissements. Il permet d'évaluer la rentabilité opérationnelle réelle d'une activité, indépendamment de sa structure financière. C'est un indicateur clé pour comparer des entreprises de tailles ou de statuts différents. Exemple concret : deux entreprises au même chiffre d'affaires peuvent avoir un EBITDA très différent selon leur maîtrise des coûts opérationnels. Erreur fréquente : confondre EBITDA et bénéfice net, alors que le second intègre des charges supplémentaires.</p>

          <h3>Freemium</h3>
          <p>Le freemium est un modèle économique où une version gratuite limitée du produit coexiste avec une version payante enrichie. Il vise à démocratiser l'acquisition tout en monétisant les utilisateurs les plus engagés. Sa réussite dépend entièrement du bon dosage entre la valeur gratuite et la valeur payante. Exemple concret : Spotify propose une écoute gratuite avec publicité et un abonnement payant sans publicité ni limitation. Erreur fréquente : offrir trop de valeur gratuite, ce qui supprime toute incitation à passer au payant.</p>

          <h3>Upsell / Cross-sell</h3>
          <p>L'upsell consiste à faire monter un client vers une offre supérieure, tandis que le cross-sell propose des produits complémentaires. Ces deux leviers augmentent la valeur générée par client sans nécessiter d'acquisition supplémentaire. Ils sont souvent plus rentables que la prospection de nouveaux clients. Exemple concret : un client qui achète un ordinateur se voit proposer une extension de garantie (upsell) et une souris sans fil (cross-sell). Erreur fréquente : proposer l'upsell trop tôt dans la relation client, avant que la confiance ne soit établie.</p>

          <h3>KPI (Indicateur Clé de Performance)</h3>
          <p>Un KPI est une mesure chiffrée qui permet de suivre la performance d'une action ou d'un objectif business précis. Il n'a de valeur que s'il est directement relié à une décision possible. Multiplier les KPI sans priorisation dilue l'attention et paralyse l'analyse. Exemple concret : le taux de conversion d'une landing page est un KPI actionnable, car il oriente directement les optimisations à réaliser. Erreur fréquente : suivre des KPI de vanité, comme le nombre de likes, sans lien avec la rentabilité réelle.</p>

          <h3>OKR</h3>
          <p>Les OKR (Objectives and Key Results) sont une méthode de pilotage associant un objectif qualitatif ambitieux à des résultats clés mesurables. Ils structurent la stratégie en la rendant vérifiable trimestre après trimestre. Sans résultats clés précis, un objectif reste une intention vague. Exemple concret : l'objectif "devenir la référence du marché B2B local" peut se décliner en résultat clé "signer 15 nouveaux clients B2B d'ici 3 mois". Erreur fréquente : fixer des objectifs sans résultats clés mesurables, ce qui rend le suivi impossible.</p>

          <h3>Positionnement de marché</h3>
          <p>Le positionnement de marché définit la place qu'occupe une offre dans l'esprit des clients par rapport à la concurrence. Il repose sur un choix assumé de différenciation, pas sur une tentative de plaire à tout le monde. Un positionnement flou condamne une offre à l'invisibilité. Exemple concret : Blablacar s'est positionné sur le covoiturage longue distance entre particuliers, là où d'autres acteurs ciblaient le transport professionnel. Erreur fréquente : vouloir se positionner sur le meilleur rapport qualité-prix, un positionnement générique qui ne différencie rien.</p>

          <h3>Niche de marché</h3>
          <p>Une niche de marché est un segment restreint et spécifique de clientèle, souvent mal servi par les offres généralistes. Cibler une niche permet de réduire la concurrence directe et d'ajuster précisément la proposition de valeur. Elle constitue souvent un point d'entrée plus solide qu'un marché de masse. Exemple concret : une marque de vêtements techniques dédiés exclusivement aux coureurs d'ultra-trail s'adresse à une niche précise et identifiable. Erreur fréquente : choisir une niche trop étroite pour générer un chiffre d'affaires viable.</p>

          <h3>Persona</h3>
          <p>Un persona est une représentation semi-fictive et détaillée d'un segment de client type, construite à partir de données réelles. Il sert à orienter les décisions produit, marketing et commerciales autour d'un profil concret. Un persona mal documenté conduit à des décisions basées sur des suppositions. Exemple concret : "Claire, 34 ans, consultante indépendante, cherche à automatiser sa facturation" est un persona actionnable, contrairement à "les indépendants" pris comme cible générale. Erreur fréquente : créer un persona idéalisé, déconnecté des données réelles issues du terrain.</p>

          <h3>Growth hacking</h3>
          <p>Le growth hacking regroupe des techniques d'expérimentation rapide visant une croissance forte avec des ressources limitées. Il repose sur des cycles courts de test, mesure et itération plutôt que sur de grosses campagnes classiques. Cette approche exige rigueur analytique, pas improvisation créative. Exemple concret : Airbnb a utilisé le growth hacking en permettant la republication automatique des annonces sur Craigslist pour capter du trafic existant. Erreur fréquente : réduire le growth hacking à une accumulation d'astuces virales sans stratégie de fond derrière.</p>

          <h3>Effet de réseau</h3>
          <p>L'effet de réseau désigne le phénomène par lequel la valeur d'un produit augmente avec le nombre de ses utilisateurs. Il crée une barrière à l'entrée puissante pour les concurrents une fois la masse critique atteinte. Sans lui, la croissance reste linéaire et dépendante de l'acquisition continue. Exemple concret : WhatsApp devient plus utile à chaque nouvel utilisateur, puisque chacun peut potentiellement contacter davantage de personnes. Erreur fréquente : penser bénéficier d'un effet de réseau alors que le produit n'a aucune interaction entre utilisateurs.</p>

          <h3>Dette technique</h3>
          <p>La dette technique désigne les raccourcis pris dans la construction d'un produit ou d'un système, qui devront être corrigés ultérieurement à un coût plus élevé. Elle n'est pas toujours un mauvais choix, mais elle doit être consciente et suivie. Ignorée, elle ralentit puis paralyse le développement futur. Exemple concret : coder rapidement une fonctionnalité sans structure évolutive pour tenir un délai commercial, quitte à devoir la refondre six mois plus tard. Erreur fréquente : accumuler de la dette technique sans jamais la rembourser, jusqu'à bloquer toute évolution du produit.</p>

          <h3>Diversification des revenus</h3>
          <p>La diversification des revenus consiste à générer du chiffre d'affaires par plusieurs sources distinctes plutôt qu'une seule. Elle réduit la dépendance à un client, un produit ou un canal unique. C'est un facteur de résilience essentiel face aux aléas de marché. Exemple concret : un formateur qui combine vente de formations, accompagnement individuel et vente de contenus numériques diversifie ses revenus. Erreur fréquente : diversifier trop tôt, avant d'avoir consolidé une première source de revenus fiable.</p>

          <h3>Revenu passif</h3>
          <p>Le revenu passif est un revenu généré avec un effort continu réduit une fois le système ou le produit mis en place. Il n'est jamais totalement automatique : il exige un investissement initial important et un entretien régulier. Le terme est souvent survendu, ce qui crée des attentes irréalistes. Exemple concret : la vente d'une formation en ligne préenregistrée génère des revenus sans intervention directe à chaque vente, mais nécessite mise à jour et support client. Erreur fréquente : croire qu'un revenu passif ne demande aucun travail après son lancement.</p>

          <h3>Stratégie de tarification (Pricing)</h3>
          <p>La stratégie de tarification définit comment et à quel prix une offre est vendue, en fonction de la valeur perçue, du marché et des coûts. Le prix n'est pas qu'une question de coûts : c'est un signal de positionnement. Une tarification mal pensée détruit la rentabilité même avec un bon volume de ventes. Exemple concret : un prix trop bas peut signaler un manque de qualité perçue et attirer une clientèle peu fidèle et sensible au prix. Erreur fréquente : fixer ses prix uniquement en copiant la concurrence, sans analyser sa propre structure de coûts.</p>

          <h3>Time-to-market</h3>
          <p>Le time-to-market désigne le délai entre la conception d'une idée et sa mise sur le marché effective. Un délai trop long fait perdre l'avantage du premier entrant et expose au risque d'être copié. Un délai trop court, à l'inverse, peut nuire à la qualité du lancement. Exemple concret : deux entreprises travaillant sur une idée similaire, celle qui lance en premier capte généralement l'attention et la préférence des premiers clients. Erreur fréquente : chercher la perfection du produit avant lancement, au prix d'un retard qui profite à la concurrence.</p>

          <h3>Amorçage (phase de lancement)</h3>
          <p>La phase d'amorçage est la période initiale de démarrage d'une activité, avant toute traction commerciale significative. Elle est marquée par l'incertitude, les ajustements fréquents et des ressources limitées. C'est la phase la plus fragile du cycle de vie d'une entreprise. Exemple concret : les six premiers mois d'une activité de conseil indépendant, consacrés à valider l'offre et trouver les premiers clients payants, constituent la phase d'amorçage. Erreur fréquente : investir massivement en communication dès l'amorçage, avant d'avoir validé l'offre auprès de premiers clients réels.</p>
        </div>
      </main>
    </div>
  );
}