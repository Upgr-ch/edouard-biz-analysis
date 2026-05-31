#!/usr/bin/env python3
"""
kpi_alertes.py — Script autonome de calcul KPI par pays via Systeme.io
Écrit les résultats dans kpi_alertes.json et alertes.log
"""

import os
import json
import logging
import time
from datetime import datetime, timezone, timedelta

import requests
from dotenv import load_dotenv

load_dotenv()

# ── Configuration ──────────────────────────────────────────────────────────────

API_KEY  = os.getenv("SYSTEME_IO_API_KEY", "")
BASE_URL = "https://api.systeme.io/api"

OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "kpi_alertes.json")
OUTPUT_LOG  = os.path.join(os.path.dirname(__file__), "alertes.log")

PAYS_PRIORITAIRES = ["Suisse", "France", "Belgique", "Maroc", "Tunisie", "Gabon"]

# Correspondance pays → code locale Systeme.io (fallback si champ `pays` absent)
LOCALE_TO_PAYS = {
    "CH": "Suisse",
    "FR": "France",
    "BE": "Belgique",
    "MA": "Maroc",
    "TN": "Tunisie",
    "GA": "Gabon",
}

SEUIL_COMPLETION = 65.0   # %
SEUIL_NPS        = 30     # score NPS
SEUIL_DIAGNOSTICS_VENTE = 10  # diagnostics complets min pour déclencher alerte absence vente

# ── Logging ────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(OUTPUT_LOG, encoding="utf-8"),
    ],
)
log = logging.getLogger(__name__)


# ── Helpers API ────────────────────────────────────────────────────────────────

def _headers() -> dict:
    if not API_KEY:
        raise RuntimeError("SYSTEME_IO_API_KEY manquant dans .env")
    return {"X-API-Key": API_KEY, "Accept": "application/json"}


def _get(path: str, params: dict | None = None, retries: int = 3) -> dict:
    """GET avec retry exponentiel."""
    url = f"{BASE_URL}{path}"
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=_headers(), params=params, timeout=15)
            if r.status_code == 404:
                return {}
            r.raise_for_status()
            return r.json()
        except requests.Timeout:
            log.warning("Timeout %s (tentative %d/%d)", path, attempt + 1, retries)
            time.sleep(2 ** attempt)
        except requests.HTTPError as e:
            log.error("HTTP %s → %s", path, e)
            return {}
    log.error("Abandon après %d tentatives : %s", retries, path)
    return {}


def fetch_all_contacts() -> list[dict]:
    """Récupère tous les contacts avec pagination."""
    contacts = []
    page = 1
    while True:
        data = _get("/contacts", {"limit": 100, "page": page})
        items = data.get("items", [])
        contacts.extend(items)
        log.info("Contacts page %d → %d contacts", page, len(items))
        if not data.get("hasMore", False):
            break
        page += 1
    log.info("Total contacts : %d", len(contacts))
    return contacts


def fetch_all_orders() -> list[dict]:
    """Récupère toutes les commandes (endpoint optionnel — retourne [] si absent)."""
    orders = []
    page = 1
    while True:
        data = _get("/orders", {"limit": 100, "page": page})
        if not data:
            log.warning("Endpoint /orders non disponible — données de vente ignorées")
            return []
        items = data.get("items", [])
        orders.extend(items)
        if not data.get("hasMore", False):
            break
        page += 1
    log.info("Total commandes : %d", len(orders))
    return orders


# ── Utilitaires ────────────────────────────────────────────────────────────────

def get_pays(contact: dict) -> str | None:
    """
    Détermine le pays d'un contact.
    Priorité : champ personnalisé `pays` → locale → None
    """
    for field in contact.get("fields", []):
        slug = (field.get("slug") or field.get("name") or "").lower()
        if slug == "pays":
            val = (field.get("value") or "").strip()
            if val:
                return val
    locale = (contact.get("locale") or "").upper()
    return LOCALE_TO_PAYS.get(locale)


def get_nps_score(contact: dict) -> int | None:
    """
    Récupère le score NPS depuis :
    1. Champ personnalisé `nps_score`
    2. Tags nps_0 … nps_10
    """
    for field in contact.get("fields", []):
        slug = (field.get("slug") or field.get("name") or "").lower()
        if slug == "nps_score":
            try:
                return int(field.get("value", ""))
            except (ValueError, TypeError):
                pass
    for tag in contact.get("tags", []):
        name = tag.get("name", "")
        import re
        m = re.match(r"^nps_(\d+)$", name, re.IGNORECASE)
        if m:
            return int(m.group(1))
    return None


def has_tag(contact: dict, tag_name: str) -> bool:
    return any(t.get("name") == tag_name for t in contact.get("tags", []))


def parse_date(s: str | None) -> datetime | None:
    if not s:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(s, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            continue
    return None


# ── Calcul KPI ─────────────────────────────────────────────────────────────────

def compute_kpis(contacts: list[dict], orders: list[dict]) -> dict:
    now = datetime.now(timezone.utc)
    cutoff_30  = now - timedelta(days=30)
    cutoff_90  = now - timedelta(days=90)

    # Regrouper contacts par pays
    by_pays: dict[str, list[dict]] = {p: [] for p in PAYS_PRIORITAIRES}
    for c in contacts:
        pays = get_pays(c)
        if pays in by_pays:
            by_pays[pays].append(c)

    # Regrouper commandes par pays (si disponible)
    orders_by_pays: dict[str, list[dict]] = {p: [] for p in PAYS_PRIORITAIRES}
    for o in orders:
        registered_at = parse_date(o.get("createdAt") or o.get("created_at"))
        if registered_at and registered_at >= cutoff_90:
            # Essayer de récupérer le pays depuis la commande ou le contact associé
            pays = o.get("country") or LOCALE_TO_PAYS.get((o.get("locale") or "").upper())
            if pays in orders_by_pays:
                orders_by_pays[pays].append(o)

    resultats: dict[str, dict] = {}
    alertes_globales: list[str] = []

    for pays in PAYS_PRIORITAIRES:
        cs = by_pays[pays]

        # ── Taux de complétion (30 jours) ──────────────────────────────────
        debuts_30   = [c for c in cs if has_tag(c, "diagnostic_debut")
                       and (parse_date(c.get("registeredAt")) or now) >= cutoff_30]
        complets_30 = [c for c in cs if has_tag(c, "diagnostic_complet")
                       and (parse_date(c.get("registeredAt")) or now) >= cutoff_30]

        taux_completion: float | None = None
        alerte_completion = False
        if debuts_30:
            taux_completion = round(len(complets_30) / len(debuts_30) * 100, 1)
            alerte_completion = taux_completion < SEUIL_COMPLETION

        # ── NPS (90 jours) ─────────────────────────────────────────────────
        nps_scores = []
        for c in cs:
            reg = parse_date(c.get("registeredAt"))
            if reg is None or reg >= cutoff_90:
                score = get_nps_score(c)
                if score is not None:
                    nps_scores.append(score)

        nps_value: int | None = None
        alerte_nps = False
        if nps_scores:
            promoteurs  = sum(1 for s in nps_scores if s >= 9)
            detracteurs = sum(1 for s in nps_scores if s <= 6)
            total_nps   = len(nps_scores)
            nps_value   = round((promoteurs / total_nps - detracteurs / total_nps) * 100)
            alerte_nps  = nps_value < SEUIL_NPS

        # ── Ventes (90 jours) ──────────────────────────────────────────────
        ventes_90j = len(orders_by_pays[pays])
        complets_90j = [c for c in cs if has_tag(c, "diagnostic_complet")
                        and (parse_date(c.get("registeredAt")) or now) >= cutoff_90]
        alerte_absence_vente = (
            ventes_90j == 0
            and len(complets_90j) >= SEUIL_DIAGNOSTICS_VENTE
        )

        # ── Messages d'alerte ──────────────────────────────────────────────
        messages = []
        if alerte_completion and taux_completion is not None:
            msg = f"Alerte : Taux de complétion faible pour {pays} ({taux_completion}%) — seuil {SEUIL_COMPLETION}%"
            messages.append(msg)
            alertes_globales.append(msg)
            log.warning(msg)
        if alerte_nps and nps_value is not None:
            msg = f"Alerte : NPS insuffisant pour {pays} ({nps_value:+d}) — seuil +{SEUIL_NPS}"
            messages.append(msg)
            alertes_globales.append(msg)
            log.warning(msg)
        if alerte_absence_vente:
            msg = f"Alerte : Aucune vente en 90j pour {pays} malgré {len(complets_90j)} diagnostics complets"
            messages.append(msg)
            alertes_globales.append(msg)
            log.warning(msg)

        resultats[pays] = {
            "contacts_total": len(cs),
            "diagnostics_debuts_30j": len(debuts_30),
            "diagnostics_complets_30j": len(complets_30),
            "taux_completion": taux_completion,
            "alerte_completion": alerte_completion,
            "nps_repondants_90j": len(nps_scores),
            "nps": nps_value,
            "alerte_nps": alerte_nps,
            "ventes_90j": ventes_90j,
            "diagnostics_complets_90j": len(complets_90j),
            "alerte_absence_vente": alerte_absence_vente,
            "message_alerte": " | ".join(messages) if messages else None,
        }

    return {
        "timestamp": now.isoformat(),
        "pays": resultats,
        "alertes_globales": alertes_globales,
    }


# ── Point d'entrée ─────────────────────────────────────────────────────────────

def main():
    log.info("=== Démarrage kpi_alertes.py ===")

    contacts = fetch_all_contacts()
    orders   = fetch_all_orders()
    result   = compute_kpis(contacts, orders)

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    log.info("Résultats écrits dans %s", OUTPUT_JSON)

    nb_alertes = len(result["alertes_globales"])
    if nb_alertes == 0:
        log.info("✓ Tous les KPI sont dans les seuils.")
    else:
        log.warning("⚠ %d alerte(s) détectée(s) :", nb_alertes)
        for a in result["alertes_globales"]:
            log.warning("  → %s", a)

    log.info("=== Fin kpi_alertes.py ===\n")


if __name__ == "__main__":
    main()
