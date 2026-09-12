---
name: Suivi des diagnostics
description: Répartition durable du suivi des étapes de diagnostic entre GA4 et Systeme.io.
---

Les étapes `diagnostic_debut`, `diagnostic_mi_parcours` et `diagnostic_complet` doivent être suivies dans GA4 uniquement. Ne pas créer ou rétablir ces tags dans Systeme.io.

**Why:** Le suivi d’avancement existe déjà dans GA4 et les tags Systeme.io consomment inutilement la limite du forfait. Les places disponibles sont réservées aux segmentations utiles, notamment le consentement e-mail.

**How to apply:** Lors de changements sur le parcours de conversation, conserver les événements GA4 existants et ne pas ajouter de synchronisation Systeme.io pour les étapes du diagnostic.