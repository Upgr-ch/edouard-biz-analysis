export interface GlossaryEntry {
  originalTerm: string;
  question: string;
  definition: string;
}

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    "originalTerm": "Viabilité business",
    "question": "Qu'est-ce que la viabilité business ?",
    "definition": "La viabilité business est la capacité d’un projet à atteindre un équilibre économique durable sans dépendre indéfiniment de financements externes. Elle s’évalue à partir du marché, du modèle économique, des coûts, de la trésorerie et de la capacité à acquérir des clients. Exemple concret : un éditeur de logiciel qui atteint 500 abonnés payants couvrant ses coûts fixes et variables devient viable à cette échelle. Erreur fréquente : confondre une idée séduisante ou un financement obtenu avec une réelle viabilité économique. L'évaluation de cette capacité demande de confronter sans complaisance les projections de revenus aux réalités du marché visé."
  },
  {
    "originalTerm": "Rentabilité",
    "question": "Comment définir la rentabilité ?",
    "definition": "La rentabilité est la capacité d’une activité à générer un profit après prise en compte de l’ensemble de ses charges. Elle se mesure notamment par la marge nette, le résultat d’exploitation ou le retour sur investissement. Exemple concret : une entreprise avec 100 000 € de chiffre d’affaires et 85 000 € de charges a une rentabilité de 15 000 € avant impôts. Erreur fréquente : confondre chiffre d’affaires élevé et rentabilité réelle. Sans cette marge positive, l'entreprise consomme ses ressources et s'expose à un risque de défaillance, même si son carnet de commandes semble rempli à première vue. L'analyse régulière de cet indicateur permet d'ajuster les prix de vente ou de rationaliser les dépenses avant que les déficits ne se creusent."
  },
  {
    "originalTerm": "Seuil de rentabilité (point mort)",
    "question": "Qu'est-ce que le seuil de rentabilité ou point mort ?",
    "definition": "Le seuil de rentabilité, ou point mort, est le niveau de chiffre d’affaires à partir duquel une entreprise couvre tous ses coûts et commence à générer un résultat nul puis positif. Il dépend des coûts fixes, des coûts variables et du prix de vente moyen. Exemple concret : si une entreprise a 10 000 € de coûts fixes mensuels et une marge sur coûts variables de 50 %, son seuil de rentabilité est de 20 000 € de chiffre d’affaires par mois. Erreur fréquente : oublier les coûts variables dans le calcul ou supposer que le seuil est atteint dès le premier client."
  },
  {
    "originalTerm": "Business model",
    "question": "En quoi consiste un business model ?",
    "definition": "Le business model est la logique selon laquelle une organisation crée, délivre et capte de la valeur. Il décrit la proposition de valeur, les clients ciblés, les canaux, les ressources et les revenus. Exemple concret : un service de streaming fonctionne avec un abonnement mensuel, une bibliothèque de contenus et des serveurs de diffusion. Erreur fréquente : réduire le business model au seul prix de vente. Il sert de fondation stratégique pour articuler comment chaque composante de l'entreprise interagit avec les autres afin d'assurer la pérennité du projet. Une conception rigoureuse de cette logique évite de lancer une offre qui séduit mais ne parvient jamais à couvrir ses frais opérationnels."
  },
  {
    "originalTerm": "Étude de marché",
    "question": "Quelle est la définition d'une étude de marché ?",
    "definition": "Une étude de marché est la collecte et l’analyse d’informations sur un marché, ses clients, ses concurrents et ses tendances. Elle peut être quantitative, qualitative ou documentaire. Exemple concret : réaliser 20 entretiens avec des entrepreneurs cibles avant de lancer un outil de diagnostic business. Erreur fréquente : se limiter à des données secondaires sans interroger directement le marché. Cette démarche permet de valider s'il existe une réelle demande solvable avant d'engager des frais de développement ou de communication. Un sondage terrain minutieux évite ainsi le lancement d'un produit parfaitement conçu mais qui ne répond à aucun besoin urgent pour la cible."
  },
  {
    "originalTerm": "Analyse concurrentielle",
    "question": "En quoi consiste l'analyse concurrentielle ?",
    "definition": "L’analyse concurrentielle consiste à identifier et comparer les forces et faiblesses des acteurs présents sur un marché. Elle aide à repérer les positionnements, les prix, les canaux et les différenciations possibles. Exemple concret : construire un tableau comparant cinq concurrents sur le prix, les fonctionnalités et la cible. Erreur fréquente : croire qu’une absence de concurrent signifie automatiquement une opportunité sans risque. Cartographier cet environnement sert à définir un angle d'attaque unique pour capter l'attention des prospects face aux alternatives existantes. Ignorer cette étape revient à naviguer à l'aveugle dans un secteur où d'autres acteurs ont déjà établi leurs propres barrières à l'entrée."
  },
  {
    "originalTerm": "Modèle économique",
    "question": "Comment définir un modèle économique ?",
    "definition": "Le modèle économique désigne la manière dont une entreprise génère des revenus et couvre ses coûts. Il précise les sources de revenus, la structure de prix et la logique de monétisation. Exemple concret : un modèle freemium repose sur une version gratuite qui alimente une version payante. Erreur fréquente : confondre modèle économique et plan d’affaires, qui est un document plus large. Il s'agit du moteur financier qui transforme la valeur délivrée aux utilisateurs en flux de trésorerie positifs pour l'organisation. L'absence d'une réflexion approfondie sur cette mécanique conduit souvent à des produits très utilisés mais structurellement déficitaires à long terme."
  },
  {
    "originalTerm": "Coûts fixes / variables",
    "question": "Que signifient les coûts fixes et variables ?",
    "definition": "Les coûts fixes sont indépendants du volume d’activité, tandis que les coûts variables évoluent avec ce volume. Cette distinction permet de calculer la marge sur coûts variables et le seuil de rentabilité. Exemple concret : le loyer d’un atelier est un coût fixe, tandis que la matière première utilisée pour fabriquer un produit est un coût variable. Erreur fréquente : classer un coût dans la mauvaise catégorie, ce qui fausse les prévisions. Une identification précise de ces deux types de charges est requise pour anticiper les besoins en financement lors des phases de faible activité. L'oubli de certaines dépenses incompressibles dans ces calculs expose rapidement le projet à des impasses financières sévères."
  },
  {
    "originalTerm": "Marge brute / nette",
    "question": "Quelle est la différence entre marge brute et marge nette ?",
    "definition": "La marge brute est la différence entre le chiffre d’affaires et les coûts directs, tandis que la marge nette intègre toutes les charges, y compris les frais généraux, les impôts et les intérêts. Exemple concret : une boutique qui vend un article 100 € acheté 60 € a une marge brute de 40 € ; si elle ajoute 30 € de charges indirectes, sa marge nette est de 10 €. Erreur fréquente : confondre marge et coefficient multiplicateur appliqué au prix d’achat. Suivre la différence entre ces deux niveaux de rentabilité aide à isoler l'impact des frais de structure sur la performance finale. Une entreprise peut ainsi identifier si son problème vient de ses prix d'achat ou d'un excès de charges administratives indirectes."
  },
  {
    "originalTerm": "Trésorerie",
    "question": "Qu'est-ce que la trésorerie ?",
    "definition": "La trésorerie correspond aux flux d’entrées et de sorties d’argent disponibles à court terme. Elle ne dépend pas seulement du résultat comptable, mais aussi des délais de paiement et du besoin en fonds de roulement. Exemple concret : une entreprise rentable peut manquer de trésorerie si ses clients paient à 90 jours alors qu’elle paie ses fournisseurs à 30 jours. Erreur fréquente : confondre bénéfice comptable et trésorerie disponible. L'anticipation des décalages d'encaissement protège l'activité contre les défauts de paiement, première cause de faillite des jeunes structures. Un suivi rigoureux et hebdomadaire de ces flux reste le seul moyen de garantir que l'entreprise pourra honorer ses propres échéances financières."
  },
  {
    "originalTerm": "Indice de viabilité",
    "question": "En quoi consiste l'indice de viabilité ?",
    "definition": "Un indice de viabilité est un score synthétique qui évalue la probabilité qu’un projet atteigne un équilibre économique durable. Il agrège généralement plusieurs critères : marché, rentabilité, trésorerie, acquisition client et risque concurrentiel. Exemple concret : un projet noté 72/100 sur une grille de viabilité peut être considéré comme prometteur mais encore fragile sur la trésorerie. Erreur fréquente : traiter cet indice comme une vérité absolue plutôt que comme une aide à la décision. Cet outil de synthèse vise à objectiver le diagnostic d'un projet en limitant les biais d'optimisme souvent présents chez les fondateurs. Son calcul régulier permet de prioriser les chantiers critiques, qu'il s'agisse de sécuriser le financement ou de revoir la tarification."
  },
  {
    "originalTerm": "Go / No-Go / Pivot",
    "question": "Que signifie la décision Go, No-Go ou Pivot ?",
    "definition": "Go / No-Go / Pivot est une grille de décision qui conduit soit à poursuivre un projet, soit à l’arrêter, soit à le réorienter. Elle s’appuie sur des critères explicites et des données vérifiables. Exemple concret : après une étude de marché, une équipe décide un No-Go car le coût d’acquisition dépasse la valeur vie client estimée. Erreur fréquente : prendre une décision Go ou No-Go sans critères définis au préalable. L'application de ce cadre décisionnel force l'entrepreneur à ne pas s'entêter dans une direction dont l'impasse financière est démontrée. L'abandon d'une idée intenable ou sa modification profonde reste souvent la stratégie la plus rationnelle face aux retours intransigeants du marché."
  },
  {
    "originalTerm": "Proposition de valeur",
    "question": "Qu'est-ce qu'une proposition de valeur ?",
    "definition": "La proposition de valeur est le bénéfice clair qu’une offre apporte à un client pour résoudre un problème ou satisfaire un besoin. Elle doit être compréhensible, spécifique et différenciante. Exemple concret : une plateforme qui permet à un formateur de créer un plan de formation en 30 minutes propose un gain de temps mesurable. Erreur fréquente : présenter une liste de fonctionnalités au lieu d’un bénéfice client. La clarté de ce message détermine la capacité de l'offre à capter l'attention d'un public sur-sollicité. Si le client ne saisit pas immédiatement l'amélioration concrète apportée à son quotidien, il se tournera inévitablement vers des solutions concurrentes plus explicites."
  },
  {
    "originalTerm": "Client idéal (ICP)",
    "question": "Comment définir le client idéal ou ICP ?",
    "definition": "Le client idéal, ou ICP, est le profil type de client qu’une entreprise cible en priorité. Il regroupe des caractéristiques démographiques, comportementales, économiques et des problèmes récurrents. Exemple concret : un ICP peut être « formateur indépendant, 35-55 ans, vendant des formations en ligne, sans diplôme pédagogique ». Erreur fréquente : vouloir cibler tout le monde, ce qui affaiblit le message et l’acquisition. La définition stricte de ce profil concentre les efforts commerciaux et marketing sur les prospects les plus faciles à convertir et à fidéliser. S'adresser exclusivement à ce cœur de cible diminue radicalement la complexité des ventes et augmente le taux de satisfaction post-achat."
  },
  {
    "originalTerm": "Funnel de conversion",
    "question": "En quoi consiste le funnel de conversion ?",
    "definition": "Le funnel de conversion décrit les étapes par lesquelles passe un prospect avant de devenir client. Il comprend généralement la découverte, l’intérêt, la considération, la décision et l’achat. Exemple concret : une page de vente qui convertit 3 % de ses visiteurs en inscrits puis 20 % des inscrits en clients payants. Erreur fréquente : optimiser le trafic avant d’avoir mesuré les taux de conversion à chaque étape. L'analyse détaillée de cet entonnoir met en évidence les points de fuite exacts où les prospects abandonnent leur parcours. La correction de ces frictions spécifiques augmente mécaniquement les revenus sans exiger d'investissements supplémentaires dans l'acquisition de nouveaux visiteurs."
  },
  {
    "originalTerm": "Coût d’acquisition client (CAC)",
    "question": "Qu'est-ce que le coût d’acquisition client (CAC) ?",
    "definition": "Le coût d’acquisition client, ou CAC, est le montant total dépensé pour acquérir un nouveau client. Il inclut les dépenses publicitaires, les outils, les salaires et les commissions commerciales. Exemple concret : si une entreprise dépense 5 000 € pour acquérir 50 clients, son CAC est de 100 €. Erreur fréquente : omettre les coûts internes et ne compter que la publicité. La maîtrise de cette dépense est vitale pour garantir que chaque vente contribue positivement à la croissance globale. Si ce montant dépasse les profits générés par les clients acquis, l'augmentation du volume des ventes ne fera qu'accélérer l'épuisement des réserves financières."
  },
  {
    "originalTerm": "Lifetime Value (LTV)",
    "question": "Comment définir la Lifetime Value (LTV) ?",
    "definition": "La Lifetime Value, ou LTV, est la valeur économique totale qu’un client génère sur toute la durée de sa relation avec une entreprise. Elle se calcule souvent à partir du panier moyen, de la fréquence d’achat et de la durée de rétention. Exemple concret : un client qui paie 30 € par mois pendant 24 mois génère une LTV brute de 720 €. Erreur fréquente : comparer une LTV brute à un CAC sans déduire les coûts de service et de rétention. L'optimisation de cette valeur à long terme justifie parfois un investissement initial d'acquisition plus élevé pour capter des profils fidèles. Un suivi précis de cet indicateur démontre que retenir un client existant coûte systématiquement moins cher que d'en prospecter un nouveau."
  },
  {
    "originalTerm": "Plan d’affaires",
    "question": "Quelle est la définition d'un plan d’affaires ?",
    "definition": "Un plan d’affaires est un document qui structure un projet entrepreneurial : marché, offre, stratégie, équipe, prévisions financières et risques. Il sert à piloter le projet et à convaincre des partenaires ou financeurs. Exemple concret : un plan d’affaires sur trois ans avec compte de résultat, plan de trésorerie et seuil de rentabilité. Erreur fréquente : produire un document figé qui n’est jamais mis à jour avec les données réelles. La rédaction de cette feuille de route force l'équipe fondatrice à aligner ses ambitions avec la réalité de ses capacités de financement. Ce cadre chiffré devient ensuite un outil de pilotage interne, confronté mensuellement aux résultats réels pour ajuster la trajectoire."
  },
  {
    "originalTerm": "Slasheur",
    "question": "Qu'est-ce qu'un slasheur ?",
    "definition": "Un slasheur est une personne qui exerce plusieurs activités professionnelles, souvent salariées ou indépendantes, de manière simultanée ou combinée. Ce modèle se développe avec le travail à distance et la monétisation de compétences variées. Exemple concret : une consultante qui est à la fois formatrice, rédactrice et coach en organisation. Erreur fréquente : confondre slasheur et amateurisme, alors qu’il s’agit souvent d’une stratégie de diversification. Cette polyvalence revendiquée demande une organisation du temps extrêmement rigoureuse pour éviter la dispersion des efforts. Le cumul de ces rôles permet de lisser les risques financiers tout en créant des synergies inattendues entre des domaines d'intervention a priori éloignés."
  },
  {
    "originalTerm": "Économie de la connaissance",
    "question": "En quoi consiste l'économie de la connaissance ?",
    "definition": "L’économie de la connaissance est un modèle économique dans lequel la valeur repose principalement sur la production, le traitement et la diffusion du savoir. Elle s’appuie sur la formation, les données, les logiciels et les services intellectuels. Exemple concret : une entreprise qui vend des formations en ligne sur l’ingénierie pédagogique participe à l’économie de la connaissance. Erreur fréquente : croire que la connaissance seule suffit, sans modèle économique ni canal de diffusion. La création de valeur dans ce système exige de transformer une expertise intangible en un produit ou un service standardisable. La monétisation de ce savoir-faire nécessite toutefois de maîtriser les canaux de distribution numériques pour toucher une audience suffisante."
  },
  {
    "originalTerm": "Churn rate",
    "question": "Que signifie le churn rate ?",
    "definition": "Le churn rate mesure le pourcentage de clients perdus sur une période donnée. Il révèle si votre offre retient réellement la valeur qu'elle promet. Un churn élevé n'est jamais un problème marketing : c'est un problème produit ou de promesse mal tenue. Exemple concret : une app SaaS qui perd 8% de ses abonnés chaque mois voit sa base clients divisée par deux en un an, même avec de nouvelles acquisitions. Erreur fréquente : compenser un churn élevé par plus d'acquisition au lieu de traiter la cause de départ."
  },
  {
    "originalTerm": "MVP (Produit Minimum Viable)",
    "question": "Qu'est-ce qu'un MVP ou Produit Minimum Viable ?",
    "definition": "Le MVP est la version la plus réduite d'un produit permettant de tester une hypothèse business auprès de vrais clients. Il ne s'agit pas d'un produit incomplet, mais d'un outil de validation. Son seul objectif est d'apprendre vite, pas de vendre beaucoup. Exemple concret : Dropbox a validé son concept avec une simple vidéo de démonstration avant de coder le produit. Erreur fréquente : confondre MVP et version bâclée du produit final. Le lancement rapide de cette première itération confronte les hypothèses initiales à la réalité des usages et des comportements d'achat. L'intégration des retours obtenus permet ensuite de diriger les développements futurs vers les fonctionnalités qui génèrent une véritable valeur perçue."
  },
  {
    "originalTerm": "MRR / ARR",
    "question": "Comment définir le MRR et l'ARR ?",
    "definition": "Le MRR (revenu mensuel récurrent) et l'ARR (revenu annuel récurrent) mesurent les revenus stables générés par des abonnements. Ce sont les indicateurs de référence pour toute activité par abonnement. Ils permettent de projeter la croissance réelle, hors ventes ponctuelles. Exemple concret : 50 clients à 100€/mois génèrent un MRR de 5 000€, soit un ARR de 60 000€. Erreur fréquente : inclure des revenus one-shot dans le calcul du MRR, ce qui fausse la lecture de la récurrence. Le suivi de ces revenus récurrents donne une visibilité financière essentielle pour planifier sereinement les embauches ou les investissements matériels. La croissance de cette base d'abonnements constitue la principale métrique de valorisation pour les entreprises évoluant dans le domaine des services logiciels."
  },
  {
    "originalTerm": "Burn rate",
    "question": "Qu'est-ce que le burn rate ?",
    "definition": "Le burn rate est la vitesse à laquelle une entreprise consomme sa trésorerie disponible. Il conditionne directement la durée de vie du projet avant recherche de financement ou rentabilité. Ignorer ce chiffre, c'est piloter à l'aveugle. Exemple concret : une startup avec 120 000€ en caisse et un burn rate de 10 000€/mois dispose de 12 mois avant rupture de trésorerie. Erreur fréquente : ne suivre le burn rate qu'a posteriori, sans anticipation ni scénario de réduction. La maîtrise de ce rythme de dépense s'avère cruciale lors des périodes de développement produit où les rentrées d'argent restent nulles. Une surveillance stricte de cette consommation de capital dicte le calendrier exact des actions correctives à mener pour éviter la cessation de paiements."
  },
  {
    "originalTerm": "Pitch deck",
    "question": "En quoi consiste un pitch deck ?",
    "definition": "Le pitch deck est le support de présentation synthétique utilisé pour convaincre investisseurs, partenaires ou clients stratégiques. Il condense le problème, la solution, le marché et le modèle économique en quelques slides. Sa qualité conditionne souvent le premier tri fait par un investisseur. Exemple concret : le pitch deck original d'Airbnb tenait en 10 slides et exposait clairement le marché, la traction et le modèle de revenus. Erreur fréquente : surcharger le deck de détails techniques au lieu de démontrer la traction et l'opportunité. La construction de ce document impose une concision extrême pour ne retenir que les arguments capables de rassurer sur le potentiel de croissance. Sa structure visuelle et narrative doit capter l'attention dès les premières secondes pour déclencher un rendez-vous d'approfondissement."
  },
  {
    "originalTerm": "Runway",
    "question": "Que signifie le runway en finance ?",
    "definition": "Le runway est le nombre de mois restant avant épuisement total de la trésorerie, au rythme de dépense actuel. C'est l'indicateur de survie le plus brutal et le plus honnête d'un projet. Il détermine l'urgence réelle des décisions à prendre. Exemple concret : une trésorerie de 30 000€ avec un burn rate de 5 000€/mois donne un runway de 6 mois. Erreur fréquente : calculer le runway sans intégrer les charges variables saisonnières ou les paiements différés. Le calcul permanent de cette marge de manœuvre temporelle aide à calibrer l'intensité des dépenses marketing ou le maintien des coûts de structure. Face à un horizon qui se réduit dangereusement, la direction doit arbitrer rapidement entre la recherche de liquidités et la compression des charges."
  },
  {
    "originalTerm": "Bootstrapping",
    "question": "Qu'est-ce que le bootstrapping ?",
    "definition": "Le bootstrapping consiste à développer une entreprise avec ses fonds propres, sans lever de capitaux externes. Cette approche impose une discipline financière stricte mais préserve l'indépendance décisionnelle. Elle force à générer du chiffre d'affaires rapidement plutôt que de la croissance financée. Exemple concret : Mailchimp s'est développé pendant près de 10 ans en bootstrapping avant de devenir un acteur majeur du secteur. Erreur fréquente : confondre bootstrapping et absence totale de stratégie financière. L'adoption de cette stratégie impose de privilégier la rentabilité immédiate et la facturation rapide des premières prestations. Cette contrainte d'autofinancement forge souvent des modèles économiques plus résilients, car ils sont validés dès le premier jour par de véritables clients payants."
  },
  {
    "originalTerm": "Levée de fonds",
    "question": "En quoi consiste une levée de fonds ?",
    "definition": "La levée de fonds est l'opération par laquelle une entreprise cède une part de son capital contre un apport financier externe. Elle accélère la croissance mais dilue le pouvoir de décision du ou des fondateurs. Ce n'est pas un aboutissement, c'est un outil, avec ses contreparties. Exemple concret : une levée en série A de 2 millions d'euros contre 20% du capital fixe la valorisation de l'entreprise à 10 millions d'euros. Erreur fréquente : lever des fonds pour combler un problème de rentabilité plutôt que pour financer une croissance déjà prouvée."
  },
  {
    "originalTerm": "Scalabilité",
    "question": "Comment définir la scalabilité ?",
    "definition": "La scalabilité désigne la capacité d'un business à multiplier ses revenus sans augmenter ses coûts dans les mêmes proportions. C'est ce qui distingue un métier de service classique d'une entreprise à fort potentiel de croissance. Un modèle non scalable plafonne mécaniquement, quel que soit l'effort commercial. Exemple concret : un logiciel vendu en ligne peut servir 10 000 clients sans coût de production additionnel significatif, contrairement à une prestation de conseil facturée à l'heure. Erreur fréquente : croire qu'un business est scalable simplement parce qu'il est numérique."
  },
  {
    "originalTerm": "Product-Market Fit",
    "question": "Qu'est-ce que le Product-Market Fit ?",
    "definition": "Le Product-Market Fit désigne le moment où une offre répond précisément à une demande de marché suffisamment forte et solvable. Avant ce cap, toute stratégie de croissance est prématurée. C'est la condition préalable à tout investissement massif en acquisition. Exemple concret : Slack a atteint son Product-Market Fit lorsque des équipes entières ont commencé à l'adopter spontanément sans campagne marketing dédiée. Erreur fréquente : investir en publicité avant d'avoir validé que le marché veut réellement du produit. L'atteinte de cette adéquation se perçoit par un raccourcissement naturel des cycles de vente et une recommandation spontanée entre pairs. Tant que ce cap n'est pas franchi avec certitude, toute tentative d'industrialiser les processus commerciaux risque de disperser les capitaux disponibles."
  },
  {
    "originalTerm": "Prévisionnel financier",
    "question": "Quelle est la définition d'un prévisionnel financier ?",
    "definition": "Le prévisionnel financier est une projection chiffrée du chiffre d'affaires, des charges et de la trésorerie sur une période donnée, généralement 3 ans. Il sert de boussole décisionnelle et d'outil de crédibilité face aux partenaires financiers. Un prévisionnel non réactualisé perd toute utilité. Exemple concret : une banque exige systématiquement un prévisionnel sur 3 ans avant d'accorder un prêt professionnel. Erreur fréquente : construire un prévisionnel optimiste sans scénario pessimiste associé. La modélisation de ces scénarios futurs permet de tester virtuellement la résistance du projet face à d'éventuels retards de paiement ou des baisses de volume. La rigueur de ces tableaux chiffrés rassure les partenaires sur la capacité du porteur de projet à anticiper les crises."
  },
  {
    "originalTerm": "Statut juridique",
    "question": "En quoi consiste le choix d'un statut juridique ?",
    "definition": "Le statut juridique définit le cadre légal, fiscal et social de l'activité : auto-entreprise, SASU, SARL, entre autres. Ce choix impacte directement la fiscalité, la protection sociale et la responsabilité personnelle du dirigeant. Il doit être choisi en fonction du projet réel, pas par habitude ou par défaut. Exemple concret : un auto-entrepreneur est fiscalement plafonné, contrairement à une SASU qui permet de lever des fonds et d'associer des partenaires. Erreur fréquente : choisir un statut par simplicité administrative sans anticiper la croissance de l'activité."
  },
  {
    "originalTerm": "BFR (Besoin en Fonds de Roulement)",
    "question": "Qu'est-ce que le BFR ou Besoin en Fonds de Roulement ?",
    "definition": "Le BFR représente le montant d'argent nécessaire pour financer le décalage entre les dépenses engagées et les encaissements clients. Il est souvent sous-estimé alors qu'il peut mettre en péril une entreprise rentable sur le papier. Une croissance rapide sans BFR maîtrisé peut asphyxier la trésorerie. Exemple concret : une entreprise qui paie ses fournisseurs à 30 jours mais encaisse ses clients à 90 jours doit financer ce décalage de 60 jours. Erreur fréquente : ne calculer le BFR qu'une fois par an, alors qu'il évolue avec l'activité."
  },
  {
    "originalTerm": "Chiffre d'affaires",
    "question": "Comment définir le chiffre d'affaires ?",
    "definition": "Le chiffre d'affaires correspond au total des ventes réalisées sur une période, avant déduction des charges. Il mesure l'activité commerciale, pas la santé financière de l'entreprise. Un chiffre d'affaires élevé sans marge suffisante ne garantit aucune viabilité. Exemple concret : une entreprise peut afficher 500 000€ de chiffre d'affaires et être en déficit si ses charges dépassent ce montant. Erreur fréquente : présenter le chiffre d'affaires comme un indicateur de performance suffisant à lui seul. L'observation exclusive de cet indicateur masque fréquemment les inefficacités opérationnelles qui pèsent lourdement sur la survie de la structure. Seule sa mise en perspective avec l'évolution des charges permet de juger si l'intensification de l'effort commercial produit réellement de la valeur."
  },
  {
    "originalTerm": "EBITDA",
    "question": "Que signifie l'EBITDA ?",
    "definition": "L'EBITDA mesure le résultat d'exploitation avant intérêts, impôts, dépréciations et amortissements. Il permet d'évaluer la rentabilité opérationnelle réelle d'une activité, indépendamment de sa structure financière. C'est un indicateur clé pour comparer des entreprises de tailles ou de statuts différents. Exemple concret : deux entreprises au même chiffre d'affaires peuvent avoir un EBITDA très différent selon leur maîtrise des coûts opérationnels. Erreur fréquente : confondre EBITDA et bénéfice net, alors que le second intègre des charges supplémentaires. L'utilisation de cette marge opérationnelle facilite l'évaluation de la performance pure de l'activité, sans les biais induits par les choix d'emprunt ou les règles d'amortissement. C'est sur la base de cet excédent brut que se calculent généralement les valorisations lors d'une cession d'entreprise."
  },
  {
    "originalTerm": "Freemium",
    "question": "Qu'est-ce que le modèle freemium ?",
    "definition": "Le freemium est un modèle économique où une version gratuite limitée du produit coexiste avec une version payante enrichie. Il vise à démocratiser l'acquisition tout en monétisant les utilisateurs les plus engagés. Sa réussite dépend entièrement du bon dosage entre la valeur gratuite et la valeur payante. Exemple concret : Spotify propose une écoute gratuite avec publicité et un abonnement payant sans publicité ni limitation. Erreur fréquente : offrir trop de valeur gratuite, ce qui supprime toute incitation à passer au payant. La conception de ce modèle implique de trouver l'équilibre parfait entre une offre d'appel suffisamment riche pour attirer les masses, et des frustrations calculées qui poussent à la conversion. Une gestion adéquate de ces restrictions garantit que les utilisateurs gratuits finissent par financer l'infrastructure."
  },
  {
    "originalTerm": "Upsell / Cross-sell",
    "question": "En quoi consistent l'upsell et le cross-sell ?",
    "definition": "L'upsell consiste à faire monter un client vers une offre supérieure, tandis que le cross-sell propose des produits complémentaires. Ces deux leviers augmentent la valeur générée par client sans nécessiter d'acquisition supplémentaire. Ils sont souvent plus rentables que la prospection de nouveaux clients. Exemple concret : un client qui achète un ordinateur se voit proposer une extension de garantie (upsell) et une souris sans fil (cross-sell). Erreur fréquente : proposer l'upsell trop tôt dans la relation client, avant que la confiance ne soit établie. L'intégration de ces suggestions d'achat additionnel s'appuie sur la confiance déjà acquise pour fluidifier la transaction et maximiser le panier moyen. Une approche subtile et véritablement utile au consommateur transforme ces techniques en un service perçu plutôt qu'en une simple pression commerciale."
  },
  {
    "originalTerm": "KPI (Indicateur Clé de Performance)",
    "question": "Qu'est-ce qu'un KPI ou Indicateur Clé de Performance ?",
    "definition": "Un KPI est une mesure chiffrée qui permet de suivre la performance d'une action ou d'un objectif business précis. Il n'a de valeur que s'il est directement relié à une décision possible. Multiplier les KPI sans priorisation dilue l'attention et paralyse l'analyse. Exemple concret : le taux de conversion d'une landing page est un KPI actionnable, car il oriente directement les optimisations à réaliser. Erreur fréquente : suivre des KPI de vanité, comme le nombre de likes, sans lien avec la rentabilité réelle. La sélection rigoureuse de ces métriques force les équipes à se concentrer sur les quelques leviers qui impactent directement la trajectoire de l'entreprise. Un tableau de bord efficace se limite volontairement aux données dont l'évolution déclenche une action correctrice immédiate de la part du management."
  },
  {
    "originalTerm": "OKR",
    "question": "Comment définir la méthode des OKR ?",
    "definition": "Les OKR (Objectives and Key Results) sont une méthode de pilotage associant un objectif qualitatif ambitieux à des résultats clés mesurables. Ils structurent la stratégie en la rendant vérifiable trimestre après trimestre. Sans résultats clés précis, un objectif reste une intention vague. Exemple concret : l'objectif \"devenir la référence du marché B2B local\" peut se décliner en résultat clé \"signer 15 nouveaux clients B2B d'ici 3 mois\". Erreur fréquente : fixer des objectifs sans résultats clés mesurables, ce qui rend le suivi impossible. L'implémentation de cette méthode fédère l'ensemble des collaborateurs autour de priorités transparentes et de jalons temporels incontestables. La dissociation de ces objectifs des évaluations de performance individuelles encourage par ailleurs la fixation de cibles particulièrement ambitieuses sans crainte de sanctions."
  },
  {
    "originalTerm": "Positionnement de marché",
    "question": "En quoi consiste le positionnement de marché ?",
    "definition": "Le positionnement de marché définit la place qu'occupe une offre dans l'esprit des clients par rapport à la concurrence. Il repose sur un choix assumé de différenciation, pas sur une tentative de plaire à tout le monde. Un positionnement flou condamne une offre à l'invisibilité. Exemple concret : Blablacar s'est positionné sur le covoiturage longue distance entre particuliers, là où d'autres acteurs ciblaient le transport professionnel. Erreur fréquente : vouloir se positionner sur le meilleur rapport qualité-prix, un positionnement générique qui ne différencie rien. La définition de cette place unique s'appuie sur une compréhension profonde des critères qui influencent réellement la décision d'achat du segment ciblé. Un choix tranché sur cet axe facilite la création de messages percutants qui disqualifient d'emblée une grande partie de la concurrence."
  },
  {
    "originalTerm": "Niche de marché",
    "question": "Qu'est-ce qu'une niche de marché ?",
    "definition": "Une niche de marché est un segment restreint et spécifique de clientèle, souvent mal servi par les offres généralistes. Cibler une niche permet de réduire la concurrence directe et d'ajuster précisément la proposition de valeur. Elle constitue souvent un point d'entrée plus solide qu'un marché de masse. Exemple concret : une marque de vêtements techniques dédiés exclusivement aux coureurs d'ultra-trail s'adresse à une niche précise et identifiable. Erreur fréquente : choisir une niche trop étroite pour générer un chiffre d'affaires viable. La spécialisation sur ce segment étroit permet de développer une expertise reconnue et de pratiquer des marges supérieures grâce à l'absence d'alternatives pertinentes. Cette stratégie de focalisation s'avère souvent être le tremplin idéal pour dominer un micro-marché avant de s'attaquer à des audiences plus larges."
  },
  {
    "originalTerm": "Persona",
    "question": "Quelle est la définition d'un persona ?",
    "definition": "Un persona est une représentation semi-fictive et détaillée d'un segment de client type, construite à partir de données réelles. Il sert à orienter les décisions produit, marketing et commerciales autour d'un profil concret. Un persona mal documenté conduit à des décisions basées sur des suppositions. Exemple concret : \"Claire, 34 ans, consultante indépendante, cherche à automatiser sa facturation\" est un persona actionnable, contrairement à \"les indépendants\" pris comme cible générale. Erreur fréquente : créer un persona idéalisé, déconnecté des données réelles issues du terrain. La construction de ce portrait-robot exige de s'appuyer sur des interviews qualitatives pour capter les freins psychologiques et les véritables motivations des acheteurs. L'alignement de toutes les décisions produit sur ce profil fictif garantit de ne pas s'éloigner des attentes concrètes du terrain."
  },
  {
    "originalTerm": "Growth hacking",
    "question": "En quoi consiste le growth hacking ?",
    "definition": "Le growth hacking regroupe des techniques d'expérimentation rapide visant une croissance forte avec des ressources limitées. Il repose sur des cycles courts de test, mesure et itération plutôt que sur de grosses campagnes classiques. Cette approche exige rigueur analytique, pas improvisation créative. Exemple concret : Airbnb a utilisé le growth hacking en permettant la republication automatique des annonces sur Craigslist pour capter du trafic existant. Erreur fréquente : réduire le growth hacking à une accumulation d'astuces virales sans stratégie de fond derrière. L'application de cette méthode scientifique de la croissance implique de croiser l'analyse de données, l'ingénierie et le marketing comportemental pour détecter de nouvelles opportunités. La systématisation de ces petits tests empiriques permet de découvrir des canaux d'acquisition atypiques que les concurrents traditionnels ignorent."
  },
  {
    "originalTerm": "Effet de réseau",
    "question": "Qu'est-ce que l'effet de réseau ?",
    "definition": "L'effet de réseau désigne le phénomène par lequel la valeur d'un produit augmente avec le nombre de ses utilisateurs. Il crée une barrière à l'entrée puissante pour les concurrents une fois la masse critique atteinte. Sans lui, la croissance reste linéaire et dépendante de l'acquisition continue. Exemple concret : WhatsApp devient plus utile à chaque nouvel utilisateur, puisque chacun peut potentiellement contacter davantage de personnes. Erreur fréquente : penser bénéficier d'un effet de réseau alors que le produit n'a aucune interaction entre utilisateurs. L'amorçage de cette dynamique reste le principal défi, car le service offre peu d'intérêt pour les tout premiers utilisateurs qui l'adoptent. Une fois la masse critique atteinte, cette caractéristique dresse une barrière défensive quasiment infranchissable pour les nouveaux entrants sur ce marché."
  },
  {
    "originalTerm": "Dette technique",
    "question": "Comment définir la dette technique ?",
    "definition": "La dette technique désigne les raccourcis pris dans la construction d'un produit ou d'un système, qui devront être corrigés ultérieurement à un coût plus élevé. Elle n'est pas toujours un mauvais choix, mais elle doit être consciente et suivie. Ignorée, elle ralentit puis paralyse le développement futur. Exemple concret : coder rapidement une fonctionnalité sans structure évolutive pour tenir un délai commercial, quitte à devoir la refondre six mois plus tard. Erreur fréquente : accumuler de la dette technique sans jamais la rembourser, jusqu'à bloquer toute évolution du produit."
  },
  {
    "originalTerm": "Diversification des revenus",
    "question": "En quoi consiste la diversification des revenus ?",
    "definition": "La diversification des revenus consiste à générer du chiffre d'affaires par plusieurs sources distinctes plutôt qu'une seule. Elle réduit la dépendance à un client, un produit ou un canal unique. C'est un facteur de résilience essentiel face aux aléas de marché. Exemple concret : un formateur qui combine vente de formations, accompagnement individuel et vente de contenus numériques diversifie ses revenus. Erreur fréquente : diversifier trop tôt, avant d'avoir consolidé une première source de revenus fiable. La multiplication de ces sources de facturation exige de s'assurer que chaque nouvelle branche d'activité reste rentable par elle-même. La construction de cette résilience financière protège l'entreprise contre les retournements soudains de conjoncture ou la défection inattendue d'un compte clé."
  },
  {
    "originalTerm": "Revenu passif",
    "question": "Qu'est-ce qu'un revenu passif ?",
    "definition": "Le revenu passif est un revenu généré avec un effort continu réduit une fois le système ou le produit mis en place. Il n'est jamais totalement automatique : il exige un investissement initial important et un entretien régulier. Le terme est souvent survendu, ce qui crée des attentes irréalistes. Exemple concret : la vente d'une formation en ligne préenregistrée génère des revenus sans intervention directe à chaque vente, mais nécessite mise à jour et support client. Erreur fréquente : croire qu'un revenu passif ne demande aucun travail après son lancement."
  },
  {
    "originalTerm": "Stratégie de tarification (Pricing)",
    "question": "Comment définir une stratégie de tarification ?",
    "definition": "La stratégie de tarification définit comment et à quel prix une offre est vendue, en fonction de la valeur perçue, du marché et des coûts. Le prix n'est pas qu'une question de coûts : c'est un signal de positionnement. Une tarification mal pensée détruit la rentabilité même avec un bon volume de ventes. Exemple concret : un prix trop bas peut signaler un manque de qualité perçue et attirer une clientèle peu fidèle et sensible au prix. Erreur fréquente : fixer ses prix uniquement en copiant la concurrence, sans analyser sa propre structure de coûts."
  },
  {
    "originalTerm": "Time-to-market",
    "question": "Que signifie le time-to-market ?",
    "definition": "Le time-to-market désigne le délai entre la conception d'une idée et sa mise sur le marché effective. Un délai trop long fait perdre l'avantage du premier entrant et expose au risque d'être copié. Un délai trop court, à l'inverse, peut nuire à la qualité du lancement. Exemple concret : deux entreprises travaillant sur une idée similaire, celle qui lance en premier capte généralement l'attention et la préférence des premiers clients. Erreur fréquente : chercher la perfection du produit avant lancement, au prix d'un retard qui profite à la concurrence."
  },
  {
    "originalTerm": "Amorçage (phase de lancement)",
    "question": "Qu'est-ce que l'amorçage ou phase de lancement ?",
    "definition": "La phase d'amorçage est la période initiale de démarrage d'une activité, avant toute traction commerciale significative. Elle est marquée par l'incertitude, les ajustements fréquents et des ressources limitées. C'est la phase la plus fragile du cycle de vie d'une entreprise. Exemple concret : les six premiers mois d'une activité de conseil indépendant, consacrés à valider l'offre et trouver les premiers clients payants, constituent la phase d'amorçage. Erreur fréquente : investir massivement en communication dès l'amorçage, avant d'avoir validé l'offre auprès de premiers clients réels. La traversée de cette étape fondatrice requiert une grande capacité d'adaptation pour modifier la proposition de valeur face aux premiers refus. La préservation stricte de la trésorerie disponible durant cette période d'itération conditionne la survie du projet jusqu'à l'obtention d'un modèle économique stable."
  }
];
