# kpi_alertes.py

Script Python autonome qui calcule les KPI par pays depuis Systeme.io
et génère deux fichiers de sortie : `kpi_alertes.json` et `alertes.log`.

## Prérequis

Python 3.11+ et les dépendances suivantes :

```bash
pip install requests python-dotenv
```

## Configuration

1. Copie le fichier d'exemple et renseigne ta clé API :

```bash
cp .env.example .env
```

Édite `.env` :

```
SYSTEME_IO_API_KEY=ta_clé_api_systeme_io
```

La clé se trouve dans Systeme.io → Paramètres → API.

## Exécution manuelle

```bash
cd kpi
python kpi_alertes.py
```

Les fichiers de sortie sont créés dans le même dossier :
- `kpi_alertes.json` — résultats structurés par pays
- `alertes.log` — journal horodaté des alertes et du déroulement

## Exécution automatique (cron)

Pour lancer le script chaque jour à 7h00 :

```bash
crontab -e
```

Ajoute la ligne suivante (adapte les chemins) :

```
0 7 * * * cd /chemin/vers/kpi && python kpi_alertes.py >> alertes.log 2>&1
```

## Structure du fichier `kpi_alertes.json`

```json
{
  "timestamp": "2026-05-31T07:00:00+00:00",
  "pays": {
    "Suisse": {
      "contacts_total": 42,
      "diagnostics_debuts_30j": 18,
      "diagnostics_complets_30j": 14,
      "taux_completion": 77.8,
      "alerte_completion": false,
      "nps_repondants_90j": 9,
      "nps": 44,
      "alerte_nps": false,
      "ventes_90j": 5,
      "diagnostics_complets_90j": 30,
      "alerte_absence_vente": false,
      "message_alerte": null
    },
    "Maroc": { "..." : "..." }
  },
  "alertes_globales": [
    "Alerte : Taux de complétion faible pour Maroc (58.0%) — seuil 65.0%"
  ]
}
```

## Seuils d'alerte configurables

Dans `kpi_alertes.py`, en haut du fichier :

| Variable | Valeur par défaut | Description |
|---|---|---|
| `SEUIL_COMPLETION` | `65.0` | % minimum de complétion |
| `SEUIL_NPS` | `30` | Score NPS minimum |
| `SEUIL_DIAGNOSTICS_VENTE` | `10` | Diagnostics complets min pour déclencher alerte vente |

## Pays surveillés

`Suisse`, `France`, `Belgique`, `Maroc`, `Tunisie`, `Gabon`

Le pays est détecté en priorité via le champ personnalisé `pays` du contact
dans Systeme.io, puis via le champ `locale` (code ISO : CH, FR, BE, MA, TN, GA).

## Notes

- L'endpoint `/orders` de Systeme.io n'est pas encore public.
  Le script le tente et ignore gracieusement un 404
  (les ventes resteront à 0 jusqu'à disponibilité de l'endpoint).
- Les fenêtres glissantes sont recalculées à chaque exécution
  (pas de cache local).
