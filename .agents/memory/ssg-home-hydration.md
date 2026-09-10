---
name: Hydratation SSG de l’accueil
description: Décision UX et architecture pour pré-rendre l’accueil Édouard sans flash visuel.
---

L’accueil doit être pré-rendu et hydraté avec un unique arbre public partagé. Ne pas utiliser une transition `ClientOnly` entre un fallback statique et l’application complète.

**Why:** Le premier pixel doit être le contenu public standard sans écran vide, loader, clignotement, saut ou remplacement de racine. Le HTML statique et le premier rendu client doivent être identiques.

**How to apply:** Garder Clerk, le chatbot, le stockage et les API hors du graphe SSG. Après hydratation, attendre explicitement la confirmation `isLoaded` de Clerk avant même de demander le chunk chatbot, y compris si un stockage local existe. Restaurer ensuite l’état personnel en une seule mise à jour.