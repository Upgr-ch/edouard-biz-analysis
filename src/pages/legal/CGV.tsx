import LegalLayout from "./LegalLayout";

const CGV = () => (
  <LegalLayout title="Conditions Générales de Vente (CGV)">
    <p className="italic text-muted-foreground/70">(si l'application inclut des services payants)</p>

    <h2>1. Objet</h2>
    <p>Les présentes CGV définissent les conditions de vente des abonnements, services ou contenus proposés via l'application Édouard.</p>

    <h2>2. Commande et paiement</h2>
    <p>Les achats s'effectuent via les options intégrées à l'application. Le paiement valide la commande, qui devient ferme et définitive.</p>

    <h2>3. Prix</h2>
    <p>Les prix sont indiqués en francs suisses (CHF) toutes taxes comprises. L'entreprise se réserve le droit de modifier les tarifs à tout moment.</p>

    <h2>4. Droit de rétractation</h2>
    <p>Conformément à la législation, les services numériques fournis immédiatement après achat peuvent ne pas donner lieu à un droit de rétractation.</p>

    <h2>5. Responsabilité</h2>
    <p>L'entreprise garantit la conformité des services vendus. Elle ne peut être tenue responsable des problèmes imputables à des causes externes (panne, mauvaise utilisation, etc.).</p>

    <h2>6. Litiges</h2>
    <p>Tout différend sera réglé prioritairement à l'amiable. À défaut, les tribunaux de Genève seront compétents.</p>
  </LegalLayout>
);

export default CGV;
