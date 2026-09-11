import { GLOSSARY_ENTRIES } from "../../src/public/glossaire/glossaryData";

export default function Head() {
  const canonicalUrl = "https://edouard-consultant.ch/glossaire";
  const title = "Glossaire – Édouard, Consultant IA";
  const description = "Découvrez notre glossaire business complet. Définitions claires et factuelles des concepts clés pour les entrepreneurs : viabilité, rentabilité, modèles économiques.";

  const definedTermSet = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "Glossaire Édouard – Diagnostic Business",
    "description": "Définitions des termes clés en création d'entreprise, viabilité et rentabilité.",
    "url": canonicalUrl,
    "hasDefinedTerm": GLOSSARY_ENTRIES.map(entry => ({
      "@type": "DefinedTerm",
      "name": entry.originalTerm,
      "description": entry.definition,
      "inDefinedTermSet": canonicalUrl
    }))
  };

  return (
    <>
      <title>{title}</title>
      <meta content={description} name="description" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <link href={canonicalUrl} rel="canonical" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSet) }}
      />
    </>
  );
}