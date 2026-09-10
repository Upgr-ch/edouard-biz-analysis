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

const glossaryStructuredData = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "name": "Glossaire Édouard – Diagnostic Business",
  "description": "Définitions des termes clés en création d'entreprise, viabilité et rentabilité.",
  "url": "https://edouard-consultant.ch/",
  "hasDefinedTerm": [
    {
      "@type": "DefinedTerm",
      "name": "Viabilité business",
      "description": "La viabilité business est la capacité d’un projet à atteindre un équilibre économique durable sans dépendre indéfiniment de financements externes. Elle s’évalue à partir du marché, du modèle économique, des coûts, de la trésorerie et de la capacité à acquérir des clients. Exemple concret : un éditeur de logiciel qui atteint 500 abonnés payants couvrant ses coûts fixes et variables devient viable à cette échelle. Erreur fréquente : confondre une idée séduisante ou un financement obtenu avec une réelle viabilité économique.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Rentabilité",
      "description": "La rentabilité est la capacité d’une activité à générer un profit après prise en compte de l’ensemble de ses charges. Elle se mesure notamment par la marge nette, le résultat d’exploitation ou le retour sur investissement. Exemple concret : une entreprise avec 100 000 € de chiffre d’affaires et 85 000 € de charges a une rentabilité de 15 000 € avant impôts. Erreur fréquente : confondre chiffre d’affaires élevé et rentabilité réelle.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Seuil de rentabilité (point mort)",
      "description": "Le seuil de rentabilité, ou point mort, est le niveau de chiffre d’affaires à partir duquel une entreprise couvre tous ses coûts et commence à générer un résultat nul puis positif. Il dépend des coûts fixes, des coûts variables et du prix de vente moyen. Exemple concret : si une entreprise a 10 000 € de coûts fixes mensuels et une marge sur coûts variables de 50 %, son seuil de rentabilité est de 20 000 € de chiffre d’affaires par mois. Erreur fréquente : oublier les coûts variables dans le calcul ou supposer que le seuil est atteint dès le premier client.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Business model",
      "description": "Le business model est la logique selon laquelle une organisation crée, délivre et capte de la valeur. Il décrit la proposition de valeur, les clients ciblés, les canaux, les ressources et les revenus. Exemple concret : un service de streaming fonctionne avec un abonnement mensuel, une bibliothèque de contenus et des serveurs de diffusion. Erreur fréquente : réduire le business model au seul prix de vente.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Étude de marché",
      "description": "Une étude de marché est la collecte et l’analyse d’informations sur un marché, ses clients, ses concurrents et ses tendances. Elle peut être quantitative, qualitative ou documentaire. Exemple concret : réaliser 20 entretiens avec des entrepreneurs cibles avant de lancer un outil de diagnostic business. Erreur fréquente : se limiter à des données secondaires sans interroger directement le marché.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Analyse concurrentielle",
      "description": "L’analyse concurrentielle consiste à identifier et comparer les forces et faiblesses des acteurs présents sur un marché. Elle aide à repérer les positionnements, les prix, les canaux et les différenciations possibles. Exemple concret : construire un tableau comparant cinq concurrents sur le prix, les fonctionnalités et la cible. Erreur fréquente : croire qu’une absence de concurrent signifie automatiquement une opportunité sans risque.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Modèle économique",
      "description": "Le modèle économique désigne la manière dont une entreprise génère des revenus et couvre ses coûts. Il précise les sources de revenus, la structure de prix et la logique de monétisation. Exemple concret : un modèle freemium repose sur une version gratuite qui alimente une version payante. Erreur fréquente : confondre modèle économique et plan d’affaires, qui est un document plus large.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Coûts fixes / variables",
      "description": "Les coûts fixes sont indépendants du volume d’activité, tandis que les coûts variables évoluent avec ce volume. Cette distinction permet de calculer la marge sur coûts variables et le seuil de rentabilité. Exemple concret : le loyer d’un atelier est un coût fixe, tandis que la matière première utilisée pour fabriquer un produit est un coût variable. Erreur fréquente : classer un coût dans la mauvaise catégorie, ce qui fausse les prévisions.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Marge brute / nette",
      "description": "La marge brute est la différence entre le chiffre d’affaires et les coûts directs, tandis que la marge nette intègre toutes les charges, y compris les frais généraux, les impôts et les intérêts. Exemple concret : une boutique qui vend un article 100 € acheté 60 € a une marge brute de 40 € ; si elle ajoute 30 € de charges indirectes, sa marge nette est de 10 €. Erreur fréquente : confondre marge et coefficient multiplicateur appliqué au prix d’achat.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Trésorerie",
      "description": "La trésorerie correspond aux flux d’entrées et de sorties d’argent disponibles à court terme. Elle ne dépend pas seulement du résultat comptable, mais aussi des délais de paiement et du besoin en fonds de roulement. Exemple concret : une entreprise rentable peut manquer de trésorerie si ses clients paient à 90 jours alors qu’elle paie ses fournisseurs à 30 jours. Erreur fréquente : confondre bénéfice comptable et trésorerie disponible.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Indice de viabilité",
      "description": "Un indice de viabilité est un score synthétique qui évalue la probabilité qu’un projet atteigne un équilibre économique durable. Il agrège généralement plusieurs critères : marché, rentabilité, trésorerie, acquisition client et risque concurrentiel. Exemple concret : un projet noté 72/100 sur une grille de viabilité peut être considéré comme prometteur mais encore fragile sur la trésorerie. Erreur fréquente : traiter cet indice comme une vérité absolue plutôt que comme une aide à la décision.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Go / No-Go / Pivot",
      "description": "Go / No-Go / Pivot est une grille de décision qui conduit soit à poursuivre un projet, soit à l’arrêter, soit à le réorienter. Elle s’appuie sur des critères explicites et des données vérifiables. Exemple concret : après une étude de marché, une équipe décide un No-Go car le coût d’acquisition dépasse la valeur vie client estimée. Erreur fréquente : prendre une décision Go ou No-Go sans critères définis au préalable.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Proposition de valeur",
      "description": "La proposition de valeur est le bénéfice clair qu’une offre apporte à un client pour résoudre un problème ou satisfaire un besoin. Elle doit être compréhensible, spécifique et différenciante. Exemple concret : une plateforme qui permet à un formateur de créer un plan de formation en 30 minutes propose un gain de temps mesurable. Erreur fréquente : présenter une liste de fonctionnalités au lieu d’un bénéfice client.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Client idéal (ICP)",
      "description": "Le client idéal, ou ICP, est le profil type de client qu’une entreprise cible en priorité. Il regroupe des caractéristiques démographiques, comportementales, économiques et des problèmes récurrents. Exemple concret : un ICP peut être « formateur indépendant, 35-55 ans, vendant des formations en ligne, sans diplôme pédagogique ». Erreur fréquente : vouloir cibler tout le monde, ce qui affaiblit le message et l’acquisition.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Funnel de conversion",
      "description": "Le funnel de conversion décrit les étapes par lesquelles passe un prospect avant de devenir client. Il comprend généralement la découverte, l’intérêt, la considération, la décision et l’achat. Exemple concret : une page de vente qui convertit 3 % de ses visiteurs en inscrits puis 20 % des inscrits en clients payants. Erreur fréquente : optimiser le trafic avant d’avoir mesuré les taux de conversion à chaque étape.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Coût d’acquisition client (CAC)",
      "description": "Le coût d’acquisition client, ou CAC, est le montant total dépensé pour acquérir un nouveau client. Il inclut les dépenses publicitaires, les outils, les salaires et les commissions commerciales. Exemple concret : si une entreprise dépense 5 000 € pour acquérir 50 clients, son CAC est de 100 €. Erreur fréquente : omettre les coûts internes et ne compter que la publicité.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Lifetime Value (LTV)",
      "description": "La Lifetime Value, ou LTV, est la valeur économique totale qu’un client génère sur toute la durée de sa relation avec une entreprise. Elle se calcule souvent à partir du panier moyen, de la fréquence d’achat et de la durée de rétention. Exemple concret : un client qui paie 30 € par mois pendant 24 mois génère une LTV brute de 720 €. Erreur fréquente : comparer une LTV brute à un CAC sans déduire les coûts de service et de rétention.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Plan d’affaires",
      "description": "Un plan d’affaires est un document qui structure un projet entrepreneurial : marché, offre, stratégie, équipe, prévisions financières et risques. Il sert à piloter le projet et à convaincre des partenaires ou financeurs. Exemple concret : un plan d’affaires sur trois ans avec compte de résultat, plan de trésorerie et seuil de rentabilité. Erreur fréquente : produire un document figé qui n’est jamais mis à jour avec les données réelles.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Slasheur",
      "description": "Un slasheur est une personne qui exerce plusieurs activités professionnelles, souvent salariées ou indépendantes, de manière simultanée ou combinée. Ce modèle se développe avec le travail à distance et la monétisation de compétences variées. Exemple concret : une consultante qui est à la fois formatrice, rédactrice et coach en organisation. Erreur fréquente : confondre slasheur et amateurisme, alors qu’il s’agit souvent d’une stratégie de diversification.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Économie de la connaissance",
      "description": "L’économie de la connaissance est un modèle économique dans lequel la valeur repose principalement sur la production, le traitement et la diffusion du savoir. Elle s’appuie sur la formation, les données, les logiciels et les services intellectuels. Exemple concret : une entreprise qui vend des formations en ligne sur l’ingénierie pédagogique participe à l’économie de la connaissance. Erreur fréquente : croire que la connaissance seule suffit, sans modèle économique ni canal de diffusion.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Churn rate",
      "description": "Le churn rate mesure le pourcentage de clients perdus sur une période donnée. Il révèle si votre offre retient réellement la valeur qu'elle promet. Un churn élevé n'est jamais un problème marketing : c'est un problème produit ou de promesse mal tenue. Exemple concret : une app SaaS qui perd 8% de ses abonnés chaque mois voit sa base clients divisée par deux en un an, même avec de nouvelles acquisitions. Erreur fréquente : compenser un churn élevé par plus d'acquisition au lieu de traiter la cause de départ.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "MVP (Produit Minimum Viable)",
      "description": "Le MVP est la version la plus réduite d'un produit permettant de tester une hypothèse business auprès de vrais clients. Il ne s'agit pas d'un produit incomplet, mais d'un outil de validation. Son seul objectif est d'apprendre vite, pas de vendre beaucoup. Exemple concret : Dropbox a validé son concept avec une simple vidéo de démonstration avant de coder le produit. Erreur fréquente : confondre MVP et version bâclée du produit final.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "MRR / ARR",
      "description": "Le MRR (revenu mensuel récurrent) et l'ARR (revenu annuel récurrent) mesurent les revenus stables générés par des abonnements. Ce sont les indicateurs de référence pour toute activité par abonnement. Ils permettent de projeter la croissance réelle, hors ventes ponctuelles. Exemple concret : 50 clients à 100€/mois génèrent un MRR de 5 000€, soit un ARR de 60 000€. Erreur fréquente : inclure des revenus one-shot dans le calcul du MRR, ce qui fausse la lecture de la récurrence.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Burn rate",
      "description": "Le burn rate est la vitesse à laquelle une entreprise consomme sa trésorerie disponible. Il conditionne directement la durée de vie du projet avant recherche de financement ou rentabilité. Ignorer ce chiffre, c'est piloter à l'aveugle. Exemple concret : une startup avec 120 000€ en caisse et un burn rate de 10 000€/mois dispose de 12 mois avant rupture de trésorerie. Erreur fréquente : ne suivre le burn rate qu'a posteriori, sans anticipation ni scénario de réduction.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Pitch deck",
      "description": "Le pitch deck est le support de présentation synthétique utilisé pour convaincre investisseurs, partenaires ou clients stratégiques. Il condense le problème, la solution, le marché et le modèle économique en quelques slides. Sa qualité conditionne souvent le premier tri fait par un investisseur. Exemple concret : le pitch deck original d'Airbnb tenait en 10 slides et exposait clairement le marché, la traction et le modèle de revenus. Erreur fréquente : surcharger le deck de détails techniques au lieu de démontrer la traction et l'opportunité.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Runway",
      "description": "Le runway est le nombre de mois restant avant épuisement total de la trésorerie, au rythme de dépense actuel. C'est l'indicateur de survie le plus brutal et le plus honnête d'un projet. Il détermine l'urgence réelle des décisions à prendre. Exemple concret : une trésorerie de 30 000€ avec un burn rate de 5 000€/mois donne un runway de 6 mois. Erreur fréquente : calculer le runway sans intégrer les charges variables saisonnières ou les paiements différés.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Bootstrapping",
      "description": "Le bootstrapping consiste à développer une entreprise avec ses fonds propres, sans lever de capitaux externes. Cette approche impose une discipline financière stricte mais préserve l'indépendance décisionnelle. Elle force à générer du chiffre d'affaires rapidement plutôt que de la croissance financée. Exemple concret : Mailchimp s'est développé pendant près de 10 ans en bootstrapping avant de devenir un acteur majeur du secteur. Erreur fréquente : confondre bootstrapping et absence totale de stratégie financière.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Levée de fonds",
      "description": "La levée de fonds est l'opération par laquelle une entreprise cède une part de son capital contre un apport financier externe. Elle accélère la croissance mais dilue le pouvoir de décision du ou des fondateurs. Ce n'est pas un aboutissement, c'est un outil, avec ses contreparties. Exemple concret : une levée en série A de 2 millions d'euros contre 20% du capital fixe la valorisation de l'entreprise à 10 millions d'euros. Erreur fréquente : lever des fonds pour combler un problème de rentabilité plutôt que pour financer une croissance déjà prouvée.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Scalabilité",
      "description": "La scalabilité désigne la capacité d'un business à multiplier ses revenus sans augmenter ses coûts dans les mêmes proportions. C'est ce qui distingue un métier de service classique d'une entreprise à fort potentiel de croissance. Un modèle non scalable plafonne mécaniquement, quel que soit l'effort commercial. Exemple concret : un logiciel vendu en ligne peut servir 10 000 clients sans coût de production additionnel significatif, contrairement à une prestation de conseil facturée à l'heure. Erreur fréquente : croire qu'un business est scalable simplement parce qu'il est numérique.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Product-Market Fit",
      "description": "Le Product-Market Fit désigne le moment où une offre répond précisément à une demande de marché suffisamment forte et solvable. Avant ce cap, toute stratégie de croissance est prématurée. C'est la condition préalable à tout investissement massif en acquisition. Exemple concret : Slack a atteint son Product-Market Fit lorsque des équipes entières ont commencé à l'adopter spontanément sans campagne marketing dédiée. Erreur fréquente : investir en publicité avant d'avoir validé que le marché veut réellement du produit.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Prévisionnel financier",
      "description": "Le prévisionnel financier est une projection chiffrée du chiffre d'affaires, des charges et de la trésorerie sur une période donnée, généralement 3 ans. Il sert de boussole décisionnelle et d'outil de crédibilité face aux partenaires financiers. Un prévisionnel non réactualisé perd toute utilité. Exemple concret : une banque exige systématiquement un prévisionnel sur 3 ans avant d'accorder un prêt professionnel. Erreur fréquente : construire un prévisionnel optimiste sans scénario pessimiste associé.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Statut juridique",
      "description": "Le statut juridique définit le cadre légal, fiscal et social de l'activité : auto-entreprise, SASU, SARL, entre autres. Ce choix impacte directement la fiscalité, la protection sociale et la responsabilité personnelle du dirigeant. Il doit être choisi en fonction du projet réel, pas par habitude ou par défaut. Exemple concret : un auto-entrepreneur est fiscalement plafonné, contrairement à une SASU qui permet de lever des fonds et d'associer des partenaires. Erreur fréquente : choisir un statut par simplicité administrative sans anticiper la croissance de l'activité.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "BFR (Besoin en Fonds de Roulement)",
      "description": "Le BFR représente le montant d'argent nécessaire pour financer le décalage entre les dépenses engagées et les encaissements clients. Il est souvent sous-estimé alors qu'il peut mettre en péril une entreprise rentable sur le papier. Une croissance rapide sans BFR maîtrisé peut asphyxier la trésorerie. Exemple concret : une entreprise qui paie ses fournisseurs à 30 jours mais encaisse ses clients à 90 jours doit financer ce décalage de 60 jours. Erreur fréquente : ne calculer le BFR qu'une fois par an, alors qu'il évolue avec l'activité.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Chiffre d'affaires",
      "description": "Le chiffre d'affaires correspond au total des ventes réalisées sur une période, avant déduction des charges. Il mesure l'activité commerciale, pas la santé financière de l'entreprise. Un chiffre d'affaires élevé sans marge suffisante ne garantit aucune viabilité. Exemple concret : une entreprise peut afficher 500 000€ de chiffre d'affaires et être en déficit si ses charges dépassent ce montant. Erreur fréquente : présenter le chiffre d'affaires comme un indicateur de performance suffisant à lui seul.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "EBITDA",
      "description": "L'EBITDA mesure le résultat d'exploitation avant intérêts, impôts, dépréciations et amortissements. Il permet d'évaluer la rentabilité opérationnelle réelle d'une activité, indépendamment de sa structure financière. C'est un indicateur clé pour comparer des entreprises de tailles ou de statuts différents. Exemple concret : deux entreprises au même chiffre d'affaires peuvent avoir un EBITDA très différent selon leur maîtrise des coûts opérationnels. Erreur fréquente : confondre EBITDA et bénéfice net, alors que le second intègre des charges supplémentaires.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Freemium",
      "description": "Le freemium est un modèle économique où une version gratuite limitée du produit coexiste avec une version payante enrichie. Il vise à démocratiser l'acquisition tout en monétisant les utilisateurs les plus engagés. Sa réussite dépend entièrement du bon dosage entre la valeur gratuite et la valeur payante. Exemple concret : Spotify propose une écoute gratuite avec publicité et un abonnement payant sans publicité ni limitation. Erreur fréquente : offrir trop de valeur gratuite, ce qui supprime toute incitation à passer au payant.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Upsell / Cross-sell",
      "description": "L'upsell consiste à faire monter un client vers une offre supérieure, tandis que le cross-sell propose des produits complémentaires. Ces deux leviers augmentent la valeur générée par client sans nécessiter d'acquisition supplémentaire. Ils sont souvent plus rentables que la prospection de nouveaux clients. Exemple concret : un client qui achète un ordinateur se voit proposer une extension de garantie (upsell) et une souris sans fil (cross-sell). Erreur fréquente : proposer l'upsell trop tôt dans la relation client, avant que la confiance ne soit établie.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "KPI (Indicateur Clé de Performance)",
      "description": "Un KPI est une mesure chiffrée qui permet de suivre la performance d'une action ou d'un objectif business précis. Il n'a de valeur que s'il est directement relié à une décision possible. Multiplier les KPI sans priorisation dilue l'attention et paralyse l'analyse. Exemple concret : le taux de conversion d'une landing page est un KPI actionnable, car il oriente directement les optimisations à réaliser. Erreur fréquente : suivre des KPI de vanité, comme le nombre de likes, sans lien avec la rentabilité réelle.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "OKR",
      "description": "Les OKR (Objectives and Key Results) sont une méthode de pilotage associant un objectif qualitatif ambitieux à des résultats clés mesurables. Ils structurent la stratégie en la rendant vérifiable trimestre après trimestre. Sans résultats clés précis, un objectif reste une intention vague. Exemple concret : l'objectif \"devenir la référence du marché B2B local\" peut se décliner en résultat clé \"signer 15 nouveaux clients B2B d'ici 3 mois\". Erreur fréquente : fixer des objectifs sans résultats clés mesurables, ce qui rend le suivi impossible.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Positionnement de marché",
      "description": "Le positionnement de marché définit la place qu'occupe une offre dans l'esprit des clients par rapport à la concurrence. Il repose sur un choix assumé de différenciation, pas sur une tentative de plaire à tout le monde. Un positionnement flou condamne une offre à l'invisibilité. Exemple concret : Blablacar s'est positionné sur le covoiturage longue distance entre particuliers, là où d'autres acteurs ciblaient le transport professionnel. Erreur fréquente : vouloir se positionner sur le meilleur rapport qualité-prix, un positionnement générique qui ne différencie rien.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Niche de marché",
      "description": "Une niche de marché est un segment restreint et spécifique de clientèle, souvent mal servi par les offres généralistes. Cibler une niche permet de réduire la concurrence directe et d'ajuster précisément la proposition de valeur. Elle constitue souvent un point d'entrée plus solide qu'un marché de masse. Exemple concret : une marque de vêtements techniques dédiés exclusivement aux coureurs d'ultra-trail s'adresse à une niche précise et identifiable. Erreur fréquente : choisir une niche trop étroite pour générer un chiffre d'affaires viable.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Persona",
      "description": "Un persona est une représentation semi-fictive et détaillée d'un segment de client type, construite à partir de données réelles. Il sert à orienter les décisions produit, marketing et commerciales autour d'un profil concret. Un persona mal documenté conduit à des décisions basées sur des suppositions. Exemple concret : \"Claire, 34 ans, consultante indépendante, cherche à automatiser sa facturation\" est un persona actionnable, contrairement à \"les indépendants\" pris comme cible générale. Erreur fréquente : créer un persona idéalisé, déconnecté des données réelles issues du terrain.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Growth hacking",
      "description": "Le growth hacking regroupe des techniques d'expérimentation rapide visant une croissance forte avec des ressources limitées. Il repose sur des cycles courts de test, mesure et itération plutôt que sur de grosses campagnes classiques. Cette approche exige rigueur analytique, pas improvisation créative. Exemple concret : Airbnb a utilisé le growth hacking en permettant la republication automatique des annonces sur Craigslist pour capter du trafic existant. Erreur fréquente : réduire le growth hacking à une accumulation d'astuces virales sans stratégie de fond derrière.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Effet de réseau",
      "description": "L'effet de réseau désigne le phénomène par lequel la valeur d'un produit augmente avec le nombre de ses utilisateurs. Il crée une barrière à l'entrée puissante pour les concurrents une fois la masse critique atteinte. Sans lui, la croissance reste linéaire et dépendante de l'acquisition continue. Exemple concret : WhatsApp devient plus utile à chaque nouvel utilisateur, puisque chacun peut potentiellement contacter davantage de personnes. Erreur fréquente : penser bénéficier d'un effet de réseau alors que le produit n'a aucune interaction entre utilisateurs.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Dette technique",
      "description": "La dette technique désigne les raccourcis pris dans la construction d'un produit ou d'un système, qui devront être corrigés ultérieurement à un coût plus élevé. Elle n'est pas toujours un mauvais choix, mais elle doit être consciente et suivie. Ignorée, elle ralentit puis paralyse le développement futur. Exemple concret : coder rapidement une fonctionnalité sans structure évolutive pour tenir un délai commercial, quitte à devoir la refondre six mois plus tard. Erreur fréquente : accumuler de la dette technique sans jamais la rembourser, jusqu'à bloquer toute évolution du produit.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Diversification des revenus",
      "description": "La diversification des revenus consiste à générer du chiffre d'affaires par plusieurs sources distinctes plutôt qu'une seule. Elle réduit la dépendance à un client, un produit ou un canal unique. C'est un facteur de résilience essentiel face aux aléas de marché. Exemple concret : un formateur qui combine vente de formations, accompagnement individuel et vente de contenus numériques diversifie ses revenus. Erreur fréquente : diversifier trop tôt, avant d'avoir consolidé une première source de revenus fiable.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Revenu passif",
      "description": "Le revenu passif est un revenu généré avec un effort continu réduit une fois le système ou le produit mis en place. Il n'est jamais totalement automatique : il exige un investissement initial important et un entretien régulier. Le terme est souvent survendu, ce qui crée des attentes irréalistes. Exemple concret : la vente d'une formation en ligne préenregistrée génère des revenus sans intervention directe à chaque vente, mais nécessite mise à jour et support client. Erreur fréquente : croire qu'un revenu passif ne demande aucun travail après son lancement.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Stratégie de tarification (Pricing)",
      "description": "La stratégie de tarification définit comment et à quel prix une offre est vendue, en fonction de la valeur perçue, du marché et des coûts. Le prix n'est pas qu'une question de coûts : c'est un signal de positionnement. Une tarification mal pensée détruit la rentabilité même avec un bon volume de ventes. Exemple concret : un prix trop bas peut signaler un manque de qualité perçue et attirer une clientèle peu fidèle et sensible au prix. Erreur fréquente : fixer ses prix uniquement en copiant la concurrence, sans analyser sa propre structure de coûts.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Time-to-market",
      "description": "Le time-to-market désigne le délai entre la conception d'une idée et sa mise sur le marché effective. Un délai trop long fait perdre l'avantage du premier entrant et expose au risque d'être copié. Un délai trop court, à l'inverse, peut nuire à la qualité du lancement. Exemple concret : deux entreprises travaillant sur une idée similaire, celle qui lance en premier capte généralement l'attention et la préférence des premiers clients. Erreur fréquente : chercher la perfection du produit avant lancement, au prix d'un retard qui profite à la concurrence.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    },
    {
      "@type": "DefinedTerm",
      "name": "Amorçage (phase de lancement)",
      "description": "La phase d'amorçage est la période initiale de démarrage d'une activité, avant toute traction commerciale significative. Elle est marquée par l'incertitude, les ajustements fréquents et des ressources limitées. C'est la phase la plus fragile du cycle de vie d'une entreprise. Exemple concret : les six premiers mois d'une activité de conseil indépendant, consacrés à valider l'offre et trouver les premiers clients payants, constituent la phase d'amorçage. Erreur fréquente : investir massivement en communication dès l'amorçage, avant d'avoir validé l'offre auprès de premiers clients réels.",
      "inDefinedTermSet": "https://edouard-consultant.ch/#glossaire"
    }
  ]
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
          __html: JSON.stringify(glossaryStructuredData),
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