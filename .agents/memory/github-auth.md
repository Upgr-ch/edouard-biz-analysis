---
name: Authentification GitHub
description: Particularité durable de l’authentification Git utilisée pour pousser vers GitHub depuis ce Repl.
---

Utiliser un credential helper Git local qui lit `GITHUB_PERSONAL_ACCESS_TOKEN` depuis l’environnement, sans enregistrer la valeur du jeton dans la configuration ou l’URL distante.

**Why:** Après remplacement du secret, l’API GitHub acceptait le nouveau jeton mais le mécanisme `GIT_ASKPASS` de l’environnement continuait à présenter d’anciens identifiants et faisait échouer les pushes.

**How to apply:** Si un jeton valide accède au dépôt mais que `git push` répond encore « Invalid username or token », vérifier que le helper local référence le secret à l’exécution plutôt que de stocker le jeton.