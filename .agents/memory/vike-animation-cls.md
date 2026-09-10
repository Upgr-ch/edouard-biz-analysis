---
name: Animations et CLS Vike
description: Prévenir le CLS causé par des animations décoratives sur le premier écran Vike.
---

Pour les animations décoratives présentes dès le premier pixel, garder la boîte DOM immobile et animer uniquement un fond interne, par exemple avec `background-position`.

**Why:** Chromium a comptabilisé le déplacement du petit laser du logo dans le CLS, y compris après conversion de `top` vers `transform`. Une boîte fixe avec un dégradé animé a ramené le CLS mesuré à zéro.

**How to apply:** Lorsqu’un décor animé est visible sur une page pré-rendue, mesurer le CLS sur plusieurs cycles. Si le décor est attribué à une entrée de layout shift, ne pas déplacer son élément DOM ; déplacer seulement son rendu interne.