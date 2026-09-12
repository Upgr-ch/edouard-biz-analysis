---
name: Limite de tags Systeme.io
description: Contrainte du forfait Systeme.io rencontrée lors de la synchronisation des consentements marketing.
---

La création automatique d’un nouveau tag Systeme.io doit échouer explicitement lorsque le forfait a atteint sa limite. Ne jamais réutiliser ou supprimer un tag existant sans décision du propriétaire.

**Why:** Systeme.io peut accepter la création du contact et son tag principal, puis refuser le tag marketing avec une erreur demandant une augmentation de forfait. Un succès silencieux ferait perdre l’information de consentement.

**How to apply:** Toute synchronisation d’opt-in doit vérifier le résultat de chaque ajout de tag. Si la limite est atteinte, conserver l’échec pour permettre une nouvelle tentative après libération d’une place ou changement de forfait.