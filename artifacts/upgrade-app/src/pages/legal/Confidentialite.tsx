import LegalLayout from "./LegalLayout";

const Confidentialite = () => (
  <LegalLayout title="Politique de Confidentialité">
    <h2>1. Introduction</h2>
    <p>La présente Politique de Confidentialité décrit comment l'application Édouard, éditée par Kévin Lavergne – UpGrade, collecte, utilise, protège et partage vos données personnelles conformément à la Loi fédérale sur la protection des données (LPD) en Suisse et au Règlement général sur la protection des données (RGPD).</p>

    <h2>2. Responsable du traitement</h2>
    <p>Le responsable du traitement des données est :</p>
    <p>
      Kévin LAVERGNE – UpGrade<br />
      Raison individuelle, Route de Peillonex 10<br />
      1225 Chêne-Bourg – GE, Switzerland<br />
      CHE‑422.229.205 | Id Reg : 1.2I1S7A<br />
      Email : kl@upgr.ch
    </p>

    <h2>3. Données collectées</h2>
    <p>L'application peut collecter les catégories de données suivantes :</p>
    <ul>
      <li><strong>Données d'identification :</strong> nom, adresse e-mail, identifiant utilisateur.</li>
      <li><strong>Données d'utilisation :</strong> logs, préférences, historique d'activité.</li>
      <li><strong>Données techniques :</strong> type d'appareil, version du système, adresse IP.</li>
      <li><strong>Données publicitaires et cookies :</strong> Identifiants publicitaires, cookies de navigation et données comportementales liées à l'affichage des annonces (Google AdSense).</li>
    </ul>

    <h2>4. Finalités du traitement</h2>
    <p>Les données collectées servent à :</p>
    <ul>
      <li>Assurer le bon fonctionnement et la sécurité de l'application.</li>
      <li>Offrir des fonctionnalités personnalisées.</li>
      <li>Analyser l'utilisation pour améliorer les services.</li>
      <li>Assurer la diffusion et la personnalisation d'annonces publicitaires via notre partenaire Google.</li>
    </ul>

    <h2>5. Partage des données</h2>
    <p>Vos données ne sont partagées qu'avec :</p>
    <ul>
      <li>Des prestataires techniques strictement nécessaires (hébergeur, outils d'analyse).</li>
      <li>Des partenaires publicitaires tiers, notamment le réseau Google AdSense.</li>
      <li>Les autorités compétentes, uniquement sur demande légale.</li>
    </ul>

    <h2>6. Utilisation des cookies et de Google AdSense</h2>
    <p>L'application Édouard utilise des cookies pour améliorer votre expérience et diffuser des publicités adaptées.</p>
    <ul>
      <li>Des fournisseurs tiers, y compris Google, utilisent des cookies pour diffuser des annonces basées sur les visites antérieures des utilisateurs sur ce site ou sur d'autres pages web.</li>
      <li>Grâce aux cookies publicitaires, Google et ses partenaires adaptent les annonces diffusées en fonction de votre navigation.</li>
      <li>
        Vous pouvez choisir de désactiver la publicité personnalisée à tout moment en consultant les{" "}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
          Paramètres des annonces Google
        </a>
        {" "}ou en configurant votre navigateur internet.
      </li>
    </ul>

    <h2>7. Conservation des données</h2>
    <p>Les données sont conservées le temps nécessaire aux finalités pour lesquelles elles ont été collectées ou dans le respect des durées légales applicables en Suisse et en Europe.</p>

    <h2>8. Vos droits</h2>
    <p>Conformément à la LPD et au RGPD, vous disposez des droits suivants :</p>
    <ul>
      <li>Droit d'accès, de rectification et de suppression de vos données.</li>
      <li>Droit d'opposition et de limitation du traitement.</li>
      <li>Droit à la portabilité (le cas échéant).</li>
    </ul>
    <p>Toute demande peut être adressée à kl@upgr.ch.</p>

    <h2>9. Sécurité</h2>
    <p>L'entreprise met en place les mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation.</p>

    <h2>10. Modifications</h2>
    <p>Cette politique peut être mise à jour à tout moment. La version la plus récente est toujours accessible sur le site internet.</p>
  </LegalLayout>
);

export default Confidentialite;
