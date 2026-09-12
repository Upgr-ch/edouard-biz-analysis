---
name: Campagnes e-mail Systeme.io
description: Règle de segmentation des campagnes e-mail d’Édouard et d’Eugène dans Systeme.io.
---

Les campagnes e-mail sont déclenchées directement par les tags `Édouard` et `Eugène`. Pour Édouard, le tag est appliqué uniquement après consentement explicite. Le tag `Email Marketing` ne fait pas partie du fonctionnement attendu.

**Why:** Tous les inscrits peuvent être conservés comme contacts sans tag, mais seules les personnes ayant demandé les communications doivent entrer dans la campagne Édouard.

**How to apply:** Ne pas ajouter de dépendance au tag `Email Marketing`. Enregistrer le consentement dans Google Sheets, appliquer `Édouard` seulement si la case facultative est cochée et ne jamais modifier Eugène lors d’un changement concernant Édouard.