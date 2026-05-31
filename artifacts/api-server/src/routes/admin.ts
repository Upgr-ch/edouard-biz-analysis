import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, conversationsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

const BASE_SIO = "https://api.systeme.io/api";
const SIO_KEY  = process.env.SYSTEME_IO_API_KEY ?? "";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "kl@upgr.ch").toLowerCase();

// ── Admin guard ───────────────────────────────────────────────────────────────

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY ?? ""}` },
    });
    if (!clerkRes.ok) { res.status(403).json({ error: "Forbidden" }); return; }
    const user = await clerkRes.json() as {
      email_addresses: { id: string; email_address: string }[];
      primary_email_address_id: string;
    };
    const email = user.email_addresses
      .find((e) => e.id === user.primary_email_address_id)
      ?.email_address?.toLowerCase();
    if (email !== ADMIN_EMAIL) { res.status(403).json({ error: "Forbidden" }); return; }
  } catch {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  next();
}

// ── Systeme.io helpers ────────────────────────────────────────────────────────

interface SioContact {
  id: number;
  email: string;
  registeredAt: string;
  locale: string | null;
  tags: { id: number; name: string }[];
  fields: { slug: string; value: string }[];
}

async function fetchAllContacts(): Promise<SioContact[]> {
  if (!SIO_KEY) return [];
  const contacts: SioContact[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && contacts.length < 2000) {
    const res = await fetch(
      `${BASE_SIO}/contacts?limit=100&page=${page}`,
      { headers: { "X-API-Key": SIO_KEY, Accept: "application/json" } },
    );
    if (!res.ok) break;
    const data = await res.json() as { items: SioContact[]; hasMore: boolean };
    contacts.push(...data.items);
    hasMore = data.hasMore;
    page++;
  }
  return contacts;
}

// ── GET /api/admin/kpis ───────────────────────────────────────────────────────

router.get("/admin/kpis", requireAdmin, async (req: Request, res: Response) => {
  try {
    // ── Parse optional ?since=YYYY-MM-DD filter ─────────────────────────────
    const sinceParam = typeof req.query.since === "string" ? req.query.since : null;
    const sinceDate: Date | null = sinceParam ? new Date(`${sinceParam}T00:00:00Z`) : null;
    const sinceStr = sinceDate ? sinceDate.toISOString() : null;

    // ── 1. DB — funnel by step ──────────────────────────────────────────────
    const funnelRows = await db.execute(
      sinceStr
        ? sql`SELECT current_step, COUNT(*)::int AS count FROM conversations WHERE created_at >= ${sinceStr}::timestamptz GROUP BY current_step ORDER BY current_step`
        : sql`SELECT current_step, COUNT(*)::int AS count FROM conversations GROUP BY current_step ORDER BY current_step`,
    );

    // ── 2. DB — total unique users ──────────────────────────────────────────
    const usersRow = await db.execute(
      sinceStr
        ? sql`SELECT COUNT(DISTINCT user_id)::int AS count FROM conversations WHERE created_at >= ${sinceStr}::timestamptz`
        : sql`SELECT COUNT(DISTINCT user_id)::int AS count FROM conversations`,
    );

    // ── 3. DB — daily new diagnostics (all time, filtered by since if set) ──
    const dailyRows = await db.execute(
      sinceStr
        ? sql`SELECT TO_CHAR(created_at AT TIME ZONE 'UTC','YYYY-MM-DD') AS date, COUNT(*)::int AS count FROM conversations WHERE created_at >= ${sinceStr}::timestamptz GROUP BY 1 ORDER BY 1`
        : sql`SELECT TO_CHAR(created_at AT TIME ZONE 'UTC','YYYY-MM-DD') AS date, COUNT(*)::int AS count FROM conversations GROUP BY 1 ORDER BY 1`,
    );

    // ── 4. DB — total conversations & completed (step 9) ───────────────────
    const totalsRow = await db.execute(
      sinceStr
        ? sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE current_step >= 9)::int AS completed FROM conversations WHERE created_at >= ${sinceStr}::timestamptz`
        : sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE current_step >= 9)::int AS completed FROM conversations`,
    );

    // ── 5. Systeme.io contacts ──────────────────────────────────────────────
    const allContacts = await fetchAllContacts();
    const contacts = sinceDate
      ? allContacts.filter(c => new Date(c.registeredAt) >= sinceDate)
      : allContacts;

    const now = new Date();
    const cutoff7  = new Date(now.getTime() - 7  * 86400_000);
    const cutoff30 = new Date(now.getTime() - 30 * 86400_000);

    const newLast7  = allContacts.filter(c => new Date(c.registeredAt) >= cutoff7).length;
    const newLast30 = allContacts.filter(c => new Date(c.registeredAt) >= cutoff30).length;

    // Locale breakdown (filtered)
    const localeMap: Record<string, number> = {};
    for (const c of contacts) {
      const loc = (c.locale ?? "inconnu").toUpperCase();
      localeMap[loc] = (localeMap[loc] ?? 0) + 1;
    }

    // Tag breakdown (filtered)
    const tagMap: Record<string, number> = {};
    for (const c of contacts) {
      for (const t of c.tags) {
        tagMap[t.name] = (tagMap[t.name] ?? 0) + 1;
      }
    }

    // Daily SIO registrations (filtered)
    const sioDaily: Record<string, number> = {};
    for (const c of contacts) {
      const d = c.registeredAt.slice(0, 10);
      sioDaily[d] = (sioDaily[d] ?? 0) + 1;
    }

    // NPS from tags (filtered)
    let promoters = 0, detractors = 0, passives = 0;
    for (const c of contacts) {
      for (const t of c.tags) {
        const m = t.name.match(/^nps_(\d+)$/i);
        if (m) {
          const score = parseInt(m[1]);
          if (score >= 9) promoters++;
          else if (score <= 6) detractors++;
          else passives++;
        }
      }
    }
    const npsTotal = promoters + detractors + passives;
    const npsScore = npsTotal > 0
      ? Math.round((promoters / npsTotal - detractors / npsTotal) * 100)
      : null;

    // Geo: Africa francophone (filtered)
    const AFRICAN_LOCALES = ["SN", "CI", "CM", "CD", "GA", "BJ", "BF", "ML", "NE", "TG", "GN", "MG", "MR", "RW", "BI", "TN", "MA", "DZ"];
    const geoAfrica: Record<string, number> = {};
    const africaCompleted: Record<string, number> = {};
    for (const c of contacts) {
      const loc = (c.locale ?? "").toUpperCase();
      if (AFRICAN_LOCALES.includes(loc)) {
        geoAfrica[loc] = (geoAfrica[loc] ?? 0) + 1;
        const hasCompleted = c.tags.some(t => t.name === "diagnostic_complet");
        if (hasCompleted) {
          africaCompleted[loc] = (africaCompleted[loc] ?? 0) + 1;
        }
      }
    }

    const totals = totalsRow.rows[0] as { total: number; completed: number };
    const completionRate = totals.total > 0
      ? Math.round((totals.completed / totals.total) * 100)
      : 0;

    res.json({
      since: sinceParam ?? null,
      db: {
        totalConversations: totals.total,
        totalUsers: (usersRow.rows[0] as { count: number }).count,
        completedDiagnostics: totals.completed,
        completionRate,
        funnel: (funnelRows.rows as { current_step: number; count: number }[]).map(r => ({
          step: r.current_step,
          count: r.count,
        })),
        daily: (dailyRows.rows as { date: string; count: number }[]).map(r => ({
          date: r.date,
          count: r.count,
        })),
      },
      sio: {
        totalContacts: contacts.length,
        newLast7,
        newLast30,
        localeBreakdown: Object.entries(localeMap)
          .sort((a, b) => b[1] - a[1])
          .map(([locale, count]) => ({ locale, count })),
        tagBreakdown: Object.entries(tagMap)
          .sort((a, b) => b[1] - a[1])
          .map(([tag, count]) => ({ tag, count })),
        dailyRegistrations: Object.entries(sioDaily)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => ({ date, count })),
        nps: { score: npsScore, promoters, detractors, passives, total: npsTotal },
        geoAfrica: Object.entries(geoAfrica)
          .sort((a, b) => b[1] - a[1])
          .map(([country, count]) => ({ country, count })),
        africaCompleted: Object.entries(africaCompleted)
          .sort((a, b) => b[1] - a[1])
          .map(([country, count]) => ({ country, count })),
      },
    });
  } catch (err) {
    console.error("[admin/kpis]", err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
