import { EDOUARD_FAQ_ITEMS } from "../../src/public/edouardPublicContent";

const canonicalUrl = "https://edouard-consultant.ch/";
const title = "Édouard-consultant";
const description =
  "Obtenez un diagnostic assertif et chiffré sur la viabilité de votre projet business. Édouard vous dit la vérité, sans filtre.";

const webApplicationStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Édouard — Consultant Business IA",
  url: canonicalUrl,
  description:
    "Édouard est un consultant en intelligence artificielle spécialisé dans l'analyse de faisabilité et de rentabilité de projets business. Il guide les entrepreneurs à travers 10 étapes structurées pour évaluer leur idée, identifier les risques, estimer les revenus potentiels et générer un rapport PDF complet avec indice de viabilité.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "fr",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "CHF",
    description:
      "Accès 100 % gratuit et illimité, sans version payante. Une inscription par email est demandée au 6e message pour sauvegarder le diagnostic.",
  },
  provider: {
    "@type": "Organization",
    name: "UpGrade",
    url: canonicalUrl,
  },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: EDOUARD_FAQ_ITEMS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export default function Head() {
  return (
    <>
      <title>{title}</title>
      <meta content={description} name="description" />
      <link href={canonicalUrl} rel="canonical" />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationStructuredData),
        }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
        type="application/ld+json"
      />
    </>
  );
}