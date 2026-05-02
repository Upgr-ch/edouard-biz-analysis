import LegalLayout from "./LegalLayout";

const CGU = () => (
  <LegalLayout title="Conditions Générales d'Utilisation (CGU)">
    <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 mb-6">
      <p className="text-sm font-medium text-foreground">Le contenu et les analyses mis à disposition sont fournis à titre informatif et consultatif. L'utilisateur reste seul responsable de l'usage qu'il fait des informations et des décisions qu'il prend sur cette base.</p>
    </div>

    <h2>1. Objet</h2>
    <p>Les présentes CGU régissent l'utilisation de l'application Édouard éditée par Kévin Lavergne – UpGrade.</p>

    <h2>2. Acceptation</h2>
    <p>En installant ou en utilisant l'application, l'utilisateur reconnaît avoir pris connaissance des CGU et les accepter sans réserve.</p>

    <h2>3. Accès et utilisation</h2>
    <p>L'accès à l'application est gratuit (sauf indication contraire). L'utilisateur s'engage à faire un usage conforme aux lois suisses et à ne pas compromettre la sécurité ou le bon fonctionnement du service.</p>

    <h2>4. Compte utilisateur</h2>
    <p>Certaines fonctionnalités nécessitent la création d'un compte. L'utilisateur s'assure de la confidentialité de ses identifiants et reste responsable de leur usage.</p>

    <h2>5. Responsabilités</h2>
    <p>L'entreprise ne peut être tenue responsable des dommages directs ou indirects résultant d'un usage non conforme de l'application ou d'une interruption de service.</p>

    <h2>6. Propriété intellectuelle</h2>
    <p>Tout le contenu de l'application (textes, images, logos, codes) appartient exclusivement à Kévin Lavergne – UpGrade. Toute reproduction ou utilisation non autorisée est interdite.</p>

    <h2>7. Suspension et résiliation</h2>
    <p>L'entreprise peut suspendre ou résilier l'accès de l'utilisateur en cas de non-respect des CGU ou d'utilisation abusive.</p>

    <h2>8. Droit applicable et juridiction</h2>
    <p>Les présentes CGU sont soumises au droit suisse. En cas de litige, les tribunaux du canton de Genève sont compétents.</p>
  </LegalLayout>
);

export default CGU;