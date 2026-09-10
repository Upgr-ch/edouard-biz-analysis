export const EDOUARD_PUBLIC_TITLE =
  "Édouard – Diagnostic business IA pour entrepreneurs";

export const EDOUARD_PUBLIC_DESCRIPTION =
  "Édouard aide les entrepreneurs à évaluer la viabilité et la rentabilité de leur projet grâce à un diagnostic business structuré en 10 étapes.";

export const EDOUARD_WARNING_TEXT =
  "Analyse consultative. Accès libre et illimité, sans version payante. Inscription par email pour sauvegarder ton diagnostic.";

export const EDOUARD_INTRO_PARAGRAPHS = [
  "Je suis Édouard. Ne le prends pas pour toi, je m’exprime de manière ferme, assertive et juste. Mon travail est de te dire la vérité business, pas de te flatter.",
  "Sélectionne ton profil.",
  "Peu importe ta réponse, le diagnostic s’adapte à ton avancement.",
  "Clique ci-dessous sur la lettre de ton profil.",
] as const;

export const EDOUARD_PROFILES = [
  {
    key: "A",
    label: "« J’ai le concept, mais je n’ai pas encore creusé les détails »",
  },
  {
    key: "B",
    label: "« J’ai posé les bases, mais rien n’a encore été challengé »",
  },
  {
    key: "C",
    label: "« J’ai plusieurs projets à mon actif, je veux aller vite »",
  },
] as const;

export type EdouardProfileKey = (typeof EDOUARD_PROFILES)[number]["key"];

export const EDOUARD_STEPS = [
  "Projet",
  "Cadrage",
  "Marché",
  "Diagnostic",
  "Objectifs",
  "Économie & Financement",
  "Statut et Fiscalité",
  "Faisabilité",
  "Acquisition",
  "Synthèse",
] as const;

export const EDOUARD_FAQ_ITEMS = [
  {
    question: "Qu'est-ce qu'Édouard ?",
    answer:
      "Édouard est un assistant IA qui analyse la viabilité et la rentabilité d'un projet business. Il fournit un diagnostic en 10 étapes, basé sur des données réelles, avec une approche assertive et sans filtre.",
  },
  {
    question: "À qui s'adresse Édouard ?",
    answer:
      "Aux entrepreneurs, porteurs de projets, slasheurs, mais aussi aux formateurs et experts qui veulent structurer leur savoir pour le commercialiser.",
  },
  {
    question: "Comment fonctionne le diagnostic ?",
    answer:
      "Le diagnostic se déroule en 10 étapes, sous forme de conversation. Vous répondez à des questions précises sur votre projet, et Édouard vous donne une analyse structurée.",
  },
  {
    question: "Combien coûte Édouard ?",
    answer:
      "L'accès est 100 % gratuit et illimité. Aucune version payante n'est cachée. La seule formalité est une inscription par email au 6e message pour sauvegarder votre diagnostic.",
  },
  {
    question: "Combien de temps dure un diagnostic ?",
    answer:
      "Environ 15 à 20 minutes. Le diagnostic est conçu pour être direct et efficace, sans questions inutiles.",
  },
  {
    question: "Que se passe-t-il après le diagnostic ?",
    answer:
      "Vous recevez une décision claire : Go, No-Go ou Pivot. Vous pouvez sauvegarder votre diagnostic par email et accéder à des ressources complémentaires si vous souhaitez aller plus loin.",
  },
  {
    question: "Édouard remplace-t-il un consultant ?",
    answer:
      "Non. Édouard fournit un diagnostic assertif et chiffré, mais il ne remplace pas un accompagnement humain. Il vous aide à prendre une décision éclairée avant de vous lancer.",
  },
  {
    question: "Dans quelle langue Édouard est-il disponible ?",
    answer: "Édouard est disponible en français.",
  },
  {
    question: "Comment mes données sont-elles traitées ?",
    answer:
      "Votre email est utilisé uniquement pour sauvegarder votre diagnostic. Aucune donnée n’est revendue ni utilisée à des fins publicitaires.",
  },
] as const;

export const EDOUARD_LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions Légales" },
  { href: "/cgu", label: "CGU" },
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Confidentialité" },
] as const;

export const EDOUARD_SIDEBAR_GUIDE = {
  title: "Guide de Viabilité et de Crash-Test d'Entreprise",
  introduction:
    "Évaluer la solidité d'un projet avant son lancement est la clé pour éviter le gaspillage de ressources. Un crash-test chirurgical repose sur trois piliers fondamentaux :",
  pillars: [
    {
      title: "Adéquation Offre-Marché",
      description:
        "Valider qu'une expertise répond à une douleur aiguë, urgente et reconnue par une cible précise.",
    },
    {
      title: "Rentabilité & Point Mort",
      description:
        "S'appuyer sur des bases financières strictes pour couvrir charges fixes et variables.",
    },
    {
      title: "Barrières & Concurrence",
      description:
        "Analyser les forces en présence pour positionner l'offre de manière stratégique.",
    },
  ],
} as const;

export const EDOUARD_DISCLAIMER =
  "Les analyses fournies sont des recommandations. L'utilisateur reste seul responsable des décisions.";

export const EDOUARD_COPYRIGHT = "© 2026 - Kévin Lavergne – UpGrade";