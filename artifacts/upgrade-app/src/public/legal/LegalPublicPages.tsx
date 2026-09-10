import type { ReactNode } from "react";

const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgu", label: "CGU" },
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
] as const;

function LegalPublicLayout({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
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

        <h1 className="mb-8 text-2xl font-bold text-foreground">
          {title}
        </h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground prose-invert [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>

        <nav
          aria-label="Pages légales"
          className="mt-12 border-t border-border pt-6"
        >
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  className="transition-colors hover:text-primary"
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 text-center text-xs text-muted-foreground/50">
          © 2026 - Kévin Lavergne – UpGrade
        </div>
      </div>
    </main>
  );
}

export function MentionsLegalesPublicPage() {
  return (
    <LegalPublicLayout title="Mentions légales">
      <h2>Éditeur de l&apos;application</h2>
      <p>
        Kévin LAVERGNE – UpGrade
        <br />
        Raison individuelle, Route de Peillonex 10
        <br />
        1225 Chêne-Bourg – GE, Switzerland
        <br />
        CHE‑422.229.205 | Id Reg : 1.2I1S7A
        <br />
        Email : kl@upgr.ch
      </p>

      <h2>Responsable de publication</h2>
      <p>Kévin LAVERGNE</p>

      <h2>Hébergement</h2>
      <p>
        INFOMANIAK NETWORK SA
        <br />
        Rue Eugène‑Marziano 25, 1227 Genève – Suisse
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble du contenu de l&apos;application Édouard est la
        propriété exclusive de Kévin Lavergne – UpGrade, sauf mention
        contraire.
      </p>

      <h2>Crédits et contact</h2>
      <p>Pour toute question légale : kl@upgr.ch</p>
    </LegalPublicLayout>
  );
}

export function CguPublicPage() {
  return (
    <LegalPublicLayout title="Conditions Générales d'Utilisation (CGU)">
      <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm font-medium text-foreground">
          Le contenu et les analyses mis à disposition sont fournis à titre
          informatif et consultatif. L&apos;utilisateur reste seul
          responsable de l&apos;usage qu&apos;il fait des informations et
          des décisions qu&apos;il prend sur cette base.
        </p>
      </div>

      <h2>1. Objet</h2>
      <p>
        Les présentes CGU régissent l&apos;utilisation de
        l&apos;application Édouard éditée par Kévin Lavergne – UpGrade.
      </p>

      <h2>2. Acceptation</h2>
      <p>
        En installant ou en utilisant l&apos;application,
        l&apos;utilisateur reconnaît avoir pris connaissance des CGU et les
        accepter sans réserve.
      </p>

      <h2>3. Accès et utilisation</h2>
      <p>
        L&apos;accès à l&apos;application est gratuit (sauf indication
        contraire). L&apos;utilisateur s&apos;engage à faire un usage
        conforme aux lois suisses et à ne pas compromettre la sécurité ou le
        bon fonctionnement du service.
      </p>

      <h2>4. Compte utilisateur</h2>
      <p>
        Certaines fonctionnalités nécessitent la création d&apos;un compte.
        L&apos;utilisateur s&apos;assure de la confidentialité de ses
        identifiants et reste responsable de leur usage.
      </p>

      <h2>5. Responsabilités</h2>
      <p>
        L&apos;entreprise ne peut être tenue responsable des dommages
        directs ou indirects résultant d&apos;un usage non conforme de
        l&apos;application ou d&apos;une interruption de service.
      </p>

      <h2>6. Propriété intellectuelle</h2>
      <p>
        Tout le contenu de l&apos;application (textes, images, logos, codes)
        appartient exclusivement à Kévin Lavergne – UpGrade. Toute
        reproduction ou utilisation non autorisée est interdite.
      </p>

      <h2>7. Suspension et résiliation</h2>
      <p>
        L&apos;entreprise peut suspendre ou résilier l&apos;accès de
        l&apos;utilisateur en cas de non-respect des CGU ou
        d&apos;utilisation abusive.
      </p>

      <h2>8. Droit applicable et juridiction</h2>
      <p>
        Les présentes CGU sont soumises au droit suisse. En cas de litige,
        les tribunaux du canton de Genève sont compétents.
      </p>
    </LegalPublicLayout>
  );
}

export function CgvPublicPage() {
  return (
    <LegalPublicLayout title="Conditions Générales de Vente (CGV)">
      <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm font-medium text-foreground">
          Les prestations fournies ont une vocation exclusivement
          informative et consultative. Elles ne constituent ni un conseil
          juridique, fiscal ou financier, ni une garantie de résultat. Le
          client reconnaît être seul responsable de ses décisions, de
          l&apos;utilisation des informations fournies et des conséquences
          qui en découlent.
        </p>
      </div>

      <p className="italic text-muted-foreground/70">
        (si l&apos;application inclut des services payants)
      </p>

      <h2>1. Objet</h2>
      <p>
        Les présentes CGV définissent les conditions de vente des
        abonnements, services ou contenus proposés via l&apos;application
        Édouard.
      </p>

      <h2>2. Commande et paiement</h2>
      <p>
        Les achats s&apos;effectuent via les options intégrées à
        l&apos;application. Le paiement valide la commande, qui devient
        ferme et définitive.
      </p>

      <h2>3. Prix</h2>
      <p>
        Les prix sont indiqués en francs suisses (CHF) toutes taxes
        comprises. L&apos;entreprise se réserve le droit de modifier les
        tarifs à tout moment.
      </p>

      <h2>4. Droit de rétractation</h2>
      <p>
        Conformément à la législation, les services numériques fournis
        immédiatement après achat peuvent ne pas donner lieu à un droit de
        rétractation.
      </p>

      <h2>5. Responsabilité</h2>
      <p>
        L&apos;entreprise garantit la conformité des services vendus. Elle
        ne peut être tenue responsable des problèmes imputables à des causes
        externes (panne, mauvaise utilisation, etc.).
      </p>

      <h2>6. Litiges</h2>
      <p>
        Tout différend sera réglé prioritairement à l&apos;amiable. À
        défaut, les tribunaux de Genève seront compétents.
      </p>
    </LegalPublicLayout>
  );
}

export function ConfidentialitePublicPage() {
  return (
    <LegalPublicLayout title="Politique de Confidentialité">
      <h2>1. Introduction</h2>
      <p>
        La présente Politique de Confidentialité décrit comment
        l&apos;application Édouard, éditée par Kévin Lavergne – UpGrade,
        collecte, utilise, protège et partage vos données personnelles
        conformément à la Loi fédérale sur la protection des données (LPD)
        en Suisse et au Règlement général sur la protection des données
        (RGPD).
      </p>

      <h2>2. Responsable du traitement</h2>
      <p>Le responsable du traitement des données est :</p>
      <p>
        Kévin LAVERGNE – UpGrade
        <br />
        Raison individuelle, Route de Peillonex 10
        <br />
        1225 Chêne-Bourg – GE, Switzerland
        <br />
        CHE‑422.229.205 | Id Reg : 1.2I1S7A
        <br />
        Email : kl@upgr.ch
      </p>

      <h2>3. Données collectées</h2>
      <p>L&apos;application peut collecter les catégories de données suivantes :</p>
      <ul>
        <li>
          <strong>Données d&apos;identification :</strong> nom, adresse
          e-mail, identifiant utilisateur.
        </li>
        <li>
          <strong>Données d&apos;utilisation :</strong> logs, préférences,
          historique d&apos;activité.
        </li>
        <li>
          <strong>Données techniques :</strong> type d&apos;appareil,
          version du système, adresse IP.
        </li>
        <li>
          <strong>Données publicitaires et cookies :</strong> Identifiants
          publicitaires, cookies de navigation et données comportementales
          liées à l&apos;affichage des annonces (Google AdSense).
        </li>
      </ul>

      <h2>4. Finalités du traitement</h2>
      <p>Les données collectées servent à :</p>
      <ul>
        <li>Assurer le bon fonctionnement et la sécurité de l&apos;application.</li>
        <li>Offrir des fonctionnalités personnalisées.</li>
        <li>Analyser l&apos;utilisation pour améliorer les services.</li>
        <li>
          Assurer la diffusion et la personnalisation d&apos;annonces
          publicitaires via notre partenaire Google.
        </li>
      </ul>

      <h2>5. Partage des données</h2>
      <p>Vos données ne sont partagées qu&apos;avec :</p>
      <ul>
        <li>
          Des prestataires techniques strictement nécessaires (hébergeur,
          outils d&apos;analyse).
        </li>
        <li>
          Des partenaires publicitaires tiers, notamment le réseau Google
          AdSense.
        </li>
        <li>Les autorités compétentes, uniquement sur demande légale.</li>
      </ul>

      <h2>6. Utilisation des cookies et de Google AdSense</h2>
      <p>
        L&apos;application Édouard utilise des cookies pour améliorer votre
        expérience et diffuser des publicités adaptées.
      </p>
      <ul>
        <li>
          Des fournisseurs tiers, y compris Google, utilisent des cookies
          pour diffuser des annonces basées sur les visites antérieures des
          utilisateurs sur ce site ou sur d&apos;autres pages web.
        </li>
        <li>
          Grâce aux cookies publicitaires, Google et ses partenaires
          adaptent les annonces diffusées en fonction de votre navigation.
        </li>
        <li>
          Vous pouvez choisir de désactiver la publicité personnalisée à
          tout moment en consultant les{" "}
          <a
            href="https://www.google.com/settings/ads"
            rel="noopener noreferrer"
            target="_blank"
          >
            Paramètres des annonces Google
          </a>{" "}
          ou en configurant votre navigateur internet.
        </li>
      </ul>

      <h2>7. Conservation des données</h2>
      <p>
        Les données sont conservées le temps nécessaire aux finalités pour
        lesquelles elles ont été collectées ou dans le respect des durées
        légales applicables en Suisse et en Europe.
      </p>

      <h2>8. Vos droits</h2>
      <p>
        Conformément à la LPD et au RGPD, vous disposez des droits suivants :
      </p>
      <ul>
        <li>Droit d&apos;accès, de rectification et de suppression de vos données.</li>
        <li>Droit d&apos;opposition et de limitation du traitement.</li>
        <li>Droit à la portabilité (le cas échéant).</li>
      </ul>
      <p>Toute demande peut être adressée à kl@upgr.ch.</p>

      <h2>9. Sécurité</h2>
      <p>
        L&apos;entreprise met en place les mesures techniques et
        organisationnelles appropriées pour protéger vos données contre tout
        accès non autorisé, perte ou divulgation.
      </p>

      <h2>10. Modifications</h2>
      <p>
        Cette politique peut être mise à jour à tout moment. La version la
        plus récente est toujours accessible sur le site internet.
      </p>
    </LegalPublicLayout>
  );
}

export function CookiesPublicPage() {
  return (
    <LegalPublicLayout title="Politique de Cookies">
      <h2>1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p>
        Un cookie est un petit fichier texte stocké sur votre appareil lors
        de votre visite sur l&apos;application Édouard. Il permet de
        mémoriser certaines informations pour améliorer votre expérience.
      </p>

      <h2>2. Cookies utilisés</h2>
      <p>L&apos;application peut utiliser les types de cookies suivants :</p>
      <ul>
        <li>
          <strong>Cookies essentiels :</strong> nécessaires au fonctionnement
          de l&apos;application (authentification, session).
        </li>
        <li>
          <strong>Cookies analytiques :</strong> pour mesurer l&apos;audience
          et améliorer les services.
        </li>
      </ul>

      <h2>3. Gestion des cookies</h2>
      <p>
        Vous pouvez configurer votre navigateur pour accepter, refuser ou
        supprimer les cookies. La désactivation de certains cookies peut
        affecter le fonctionnement de l&apos;application.
      </p>

      <h2>4. Contact</h2>
      <p>Pour toute question relative aux cookies : kl@upgr.ch</p>
    </LegalPublicLayout>
  );
}