/**
 * Détection de région silencieuse à partir de l'IP.
 * Aucune donnée personnelle n'est stockée — uniquement le code pays en cache mémoire.
 * API gratuite : ip-api.com (45 req/min, pas de clé requise).
 */

export type Region = "europe" | "africa_fr" | "north_america" | "unknown";

interface IpApiResponse {
  status: string;
  countryCode: string;
}

// Cache IP → région (TTL 6 h)
const cache = new Map<string, { region: Region; expiresAt: number }>();
const TTL_MS = 6 * 60 * 60 * 1000;

// Pays d'Afrique francophone (ISO 3166-1 alpha-2)
const AFRICA_FR = new Set([
  "CI", "SN", "ML", "BF", "TG", "BJ", "NE", "GN", "GW", "MR",   // UEMOA / Afrique de l'Ouest fr.
  "CD", "CG", "GA", "CF", "CM", "GQ", "TD", "BI", "RW", "DJ",    // Afrique centrale / Est fr.
  "MG", "KM", "SC", "MU",                                          // Océan Indien fr.
  "DZ", "MA", "TN", "MR",                                          // Maghreb
]);

// Pays d'Europe francophone + UE
const EUROPE = new Set([
  "FR", "BE", "CH", "LU", "MC", "DE", "IT", "ES", "PT", "NL",
  "AT", "PL", "SE", "NO", "DK", "FI", "GR", "IE", "CZ", "HU",
  "RO", "BG", "HR", "SK", "SI", "EE", "LV", "LT", "CY", "MT",
  "IS", "LI", "AD",
]);

// Amérique du Nord
const NORTH_AMERICA = new Set(["US", "CA", "MX"]);

function countryToRegion(cc: string): Region {
  if (AFRICA_FR.has(cc))     return "africa_fr";
  if (EUROPE.has(cc))        return "europe";
  if (NORTH_AMERICA.has(cc)) return "north_america";
  return "unknown";
}

export async function detectRegion(ip: string): Promise<Region> {
  if (!ip || ip === "unknown" || ip === "::1" || ip === "127.0.0.1") {
    return "unknown";
  }

  const cached = cache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.region;

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`,
      { signal: controller.signal },
    );
    clearTimeout(t);

    if (!res.ok) return "unknown";
    const data = (await res.json()) as IpApiResponse;
    if (data.status !== "success") return "unknown";

    const region = countryToRegion(data.countryCode);
    cache.set(ip, { region, expiresAt: Date.now() + TTL_MS });
    return region;
  } catch {
    return "unknown";
  }
}

/** Contexte régional à injecter dans le prompt système d'Édouard */
export function regionalContext(region: Region): string {
  switch (region) {
    case "europe":
      return `
CONTEXTE GÉOGRAPHIQUE (détecté automatiquement, ne pas mentionner à l'utilisateur) :
L'utilisateur est en Europe. Adapte tes recommandations en conséquence :
- Devises prioritaires : EUR (€), CHF pour la Suisse
- Cadre réglementaire : droit commercial européen, TVA, RGPD, statuts SARL/SAS/SA/Sàrl
- Marchés de référence : France, Belgique, Suisse, UE
- Exemples de prix, salaires et coûts en euros (€)`;

    case "africa_fr":
      return `
CONTEXTE GÉOGRAPHIQUE (détecté automatiquement, ne pas mentionner à l'utilisateur) :
L'utilisateur est en Afrique francophone. Adapte tes recommandations en conséquence :
- Devises prioritaires : XOF (FCFA Afrique de l'Ouest), XAF (FCFA Afrique centrale), MAD (Maroc), DZD (Algérie), TND (Tunisie)
- Cadre réglementaire : droit OHADA pour l'Afrique subsaharienne, Code des obligations et contrats pour le Maghreb
- Marchés de référence : Côte d'Ivoire, Sénégal, Cameroun, Maroc, selon le contexte
- Exemples de prix, salaires et coûts dans la devise locale appropriée
- Tenir compte des réalités du marché local : accès au financement, infrastructure, e-commerce émergent`;

    case "north_america":
      return `
CONTEXTE GÉOGRAPHIQUE (détecté automatiquement, ne pas mentionner à l'utilisateur) :
L'utilisateur est en Amérique du Nord. Adapte tes recommandations en conséquence :
- Devises prioritaires : USD ($) pour les États-Unis, CAD ($) pour le Canada
- Cadre réglementaire : droit commercial américain ou canadien, LLC/Inc/Corp
- Marchés de référence : marché américain, canadien
- Exemples de prix, salaires et coûts en dollars (USD/CAD)`;

    default:
      return ""; // Pas de contexte injecté, Édouard reste neutre
  }
}
