/**
 * In-memory rate limiter (par jour calendaire UTC).
 * Clé : "anon:<ip>:<YYYY-MM-DD>"  ou  "auth:<userId>:<YYYY-MM-DD>"
 */

const counts = new Map<string, number>();

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10); // "2026-05-02"
}

/** Incrémente le compteur et renvoie `true` si la limite est dépassée. */
export function isRateLimited(key: string, limit: number): boolean {
  const fullKey = `${key}:${todayUTC()}`;
  const current = counts.get(fullKey) ?? 0;
  if (current >= limit) return true;
  counts.set(fullKey, current + 1);
  return false;
}

/** Nettoyage léger : supprime les entrées d'avant aujourd'hui (lancé au démarrage). */
export function pruneOldEntries(): void {
  const today = todayUTC();
  for (const key of counts.keys()) {
    if (!key.endsWith(today)) counts.delete(key);
  }
}

// Pruning automatique toutes les heures
setInterval(pruneOldEntries, 60 * 60 * 1000);
