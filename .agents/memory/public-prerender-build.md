---
name: Build des pages publiques
description: Règle de publication pour faire coexister les pages Vike pré-rendues et la SPA historique d’Édouard.
---

Les routes éditoriales Vike doivent être publiées comme fichiers statiques en complément du build de la SPA, sans remplacer l’accueil ni les routes applicatives historiques.

**Why:** Le pré-rendu Vike est volontairement parallèle. Remplacer directement le build public de la SPA par son résultat risquerait de rendre inaccessibles des parcours client, notamment l’authentification, qui restent gérés par le routeur historique.

**How to apply:** Lorsqu’une nouvelle page publique Vike est créée, conserver un build de la SPA puis y intégrer les pages Vike pré-rendues et leurs assets. Ajouter aussi la route au routeur historique afin que l’aperçu de développement puisse la consulter.