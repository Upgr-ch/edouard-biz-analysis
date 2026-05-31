import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const ADMIN_EMAIL = "kl@upgr.ch";

const STEP_LABELS: Record<number, string> = {
  0: "Projet", 1: "Cadrage", 2: "Marché", 3: "Diagnostic",
  4: "Objectifs", 5: "Économie", 6: "Fiscalité", 7: "Faisabilité",
  8: "Acquisition", 9: "Synthèse",
};

const GOLD   = "#F5E090";
const NAVY   = "#080F1E";
const COLORS = ["#F5E090", "#B48C28", "#7B6020", "#4A3A10", "#2A2108",
                "#8BB4C8", "#5B8BA8", "#3B6B88", "#1B4B68", "#0B2B48"];

interface KpiData {
  since?: string | null;
  db: {
    totalConversations: number;
    totalUsers: number;
    completedDiagnostics: number;
    completionRate: number;
    funnel: { step: number; count: number }[];
    daily: { date: string; count: number }[];
  };
  sio: {
    totalContacts: number;
    newLast7: number;
    newLast30: number;
    localeBreakdown: { locale: string; count: number }[];
    tagBreakdown: { tag: string; count: number }[];
    dailyRegistrations: { date: string; count: number }[];
    nps: { score: number | null; promoters: number; detractors: number; passives: number; total: number };
    geoAfrica: { country: string; count: number }[];
    africaCompleted: { country: string; count: number }[];
  };
}

function KpiCard({ label, value, sub, color = GOLD }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 4,
      padding: "20px 24px",
    }}>
      <p style={{ fontSize: "0.7rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", margin: 0, marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontSize: "2rem", fontWeight: 700, color, margin: 0, lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0, marginTop: 6 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "var(--up-font)", fontSize: "0.75rem", letterSpacing: "0.22em",
      textTransform: "uppercase", color: "rgba(255,255,255,0.30)", marginBottom: 16, marginTop: 0,
    }}>
      {children}
    </h2>
  );
}

function ChartBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 4,
      padding: "20px 24px",
    }}>
      <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.40)", textTransform: "uppercase", margin: 0, marginBottom: 16 }}>
        {title}
      </p>
      {children}
    </div>
  );
}

type AlertStatus = "ok" | "warn" | "nodata";

function AlertCard({ label, value, threshold, status, recommendation, unit = "" }: {
  label: string;
  value: string | number;
  threshold: string;
  status: AlertStatus;
  recommendation: string;
  unit?: string;
}) {
  const colors: Record<AlertStatus, { bg: string; border: string; dot: string; label: string }> = {
    ok:     { bg: "rgba(126,232,162,0.06)", border: "rgba(126,232,162,0.25)", dot: "#7EE8A2", label: "OK" },
    warn:   { bg: "rgba(245,100,100,0.07)", border: "rgba(245,100,100,0.30)", dot: "#F56464", label: "ALERTE" },
    nodata: { bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.08)", dot: "rgba(255,255,255,0.25)", label: "—" },
  };
  const c = colors[status];
  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 4,
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
          {label}
        </span>
        <span style={{ fontSize: "0.60rem", letterSpacing: "0.16em", fontWeight: 700, color: c.dot, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
          {c.label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: "2rem", fontWeight: 800, color: status === "warn" ? "#F56464" : status === "ok" ? "#7EE8A2" : "rgba(255,255,255,0.25)", lineHeight: 1 }}>
          {value}{unit}
        </span>
        <span style={{ fontSize: "0.70rem", color: "rgba(255,255,255,0.25)" }}>
          seuil : {threshold}
        </span>
      </div>
      {status === "warn" && (
        <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,100,100,0.80)", lineHeight: 1.5 }}>
          ⚠ {recommendation}
        </p>
      )}
      {status === "nodata" && (
        <p style={{ margin: 0, fontSize: "0.68rem", color: "rgba(255,255,255,0.20)", lineHeight: 1.5 }}>
          Données insuffisantes pour évaluer cet indicateur.
        </p>
      )}
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { background: "#0D1829", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 4, fontSize: "0.75rem" },
  labelStyle: { color: "rgba(255,255,255,0.55)" },
  itemStyle: { color: GOLD },
};

const MONTH_NAMES_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAY_LABELS = ["L","M","M","J","V","S","D"];

function CalendarMonth({
  dbMap, sioMap,
}: {
  dbMap: Record<string, number>;
  sioMap: Record<string, number>;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  // Build calendar grid: days of the week start on Monday
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  // ISO day: Mon=1..Sun=7 → offset so Monday is col 0
  const startOffset = ((firstDay.getDay() + 6) % 7);
  const totalCells = startOffset + lastDay.getDate();
  const weeks = Math.ceil(totalCells / 7);

  const today = new Date().toISOString().slice(0, 10);

  // Max value in this month for heatmap scaling
  let maxVal = 1;
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const v = (dbMap[key] ?? 0) + (sioMap[key] ?? 0);
    if (v > maxVal) maxVal = v;
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d);
  while (cells.length < weeks * 7) cells.push(null);

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 4,
      padding: "20px 24px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.40)", textTransform: "uppercase", margin: 0 }}>
          Calendrier KPI
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prevMonth} style={{ background: "none", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 3, color: "rgba(255,255,255,0.40)", cursor: "pointer", fontSize: "0.80rem", padding: "3px 10px", fontFamily: "var(--up-font)" }}>‹</button>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", minWidth: 120, textAlign: "center" }}>
            {MONTH_NAMES_FR[month]} {year}
          </span>
          <button onClick={nextMonth} style={{ background: "none", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 3, color: "rgba(255,255,255,0.40)", cursor: "pointer", fontSize: "0.80rem", padding: "3px 10px", fontFamily: "var(--up-font)" }}>›</button>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: "0.68rem", color: "rgba(255,255,255,0.30)" }}>
          <span><span style={{ color: GOLD }}>■</span> Diagnostics</span>
          <span><span style={{ color: "#8BB4C8" }}>■</span> SIO</span>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {DAY_LABELS.map((l, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: "0.62rem", color: "rgba(255,255,255,0.22)", letterSpacing: "0.10em", paddingBottom: 4 }}>
            {l}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={idx} />;
          }
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const db  = dbMap[key]  ?? 0;
          const sio = sioMap[key] ?? 0;
          const total = db + sio;
          const isToday = key === today;
          // Heatmap: opacity 0 → 0.55 based on total/maxVal
          const intensity = total > 0 ? 0.12 + (total / maxVal) * 0.43 : 0;

          return (
            <div
              key={key}
              title={`${key}\nDiagnostics: ${db}\nInscriptions SIO: ${sio}`}
              style={{
                background: total > 0 ? `rgba(245,224,144,${intensity})` : "rgba(255,255,255,0.02)",
                border: isToday ? `1px solid ${GOLD}` : "1px solid rgba(255,255,255,0.05)",
                borderRadius: 3,
                padding: "6px 4px 4px",
                minHeight: 54,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                cursor: total > 0 ? "default" : "default",
              }}
            >
              <span style={{ fontSize: "0.65rem", color: isToday ? GOLD : "rgba(255,255,255,0.35)", fontWeight: isToday ? 700 : 400 }}>
                {day}
              </span>
              {db > 0 && (
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: GOLD, lineHeight: 1 }}>
                  {db}
                </span>
              )}
              {sio > 0 && (
                <span style={{ fontSize: "0.65rem", color: "#8BB4C8", lineHeight: 1 }}>
                  +{sio}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer legend */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 12 }}>
        {[0.12, 0.27, 0.42, 0.55].map((op, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: `rgba(245,224,144,${op})` }} />
            <span style={{ fontSize: "0.60rem", color: "rgba(255,255,255,0.20)" }}>{["peu","moyen","élevé","max"][i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const TODAY = new Date().toISOString().slice(0, 10);
const LS_KEY = "edouard_kpi_since";

export default function Admin() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [since, setSince] = useState<string>(() => localStorage.getItem(LS_KEY) ?? "");

  const isAdmin = user?.primaryEmailAddress?.emailAddress?.toLowerCase() === ADMIN_EMAIL;

  const loadKpis = (sinceVal: string) => {
    setLoading(true);
    setError(null);
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const qs = sinceVal ? `?since=${sinceVal}` : "";
    fetch(`${base}/api/admin/kpis${qs}`, { credentials: "include" })
      .then(async r => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<KpiData>;
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { navigate("/auth"); return; }
    if (!isAdmin) return;
    loadKpis(since);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user, isAdmin, navigate]);

  const handleSinceChange = (val: string) => {
    setSince(val);
    localStorage.setItem(LS_KEY, val);
    loadKpis(val);
  };

  const handleReset = () => {
    setSince("");
    localStorage.removeItem(LS_KEY);
    loadKpis("");
  };

  if (!isLoaded || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: NAVY }}>
        <div style={{ width: 32, height: 32, border: `2px solid ${GOLD}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: NAVY, fontFamily: "var(--up-font)" }}>
        <p style={{ color: "rgba(255,255,255,0.40)", fontSize: "0.85rem" }}>Accès réservé.</p>
        <button onClick={() => navigate("/")} style={{ marginTop: 16, background: "none", border: "none", color: GOLD, cursor: "pointer", fontSize: "0.78rem", textDecoration: "underline" }}>
          ← Retour
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: NAVY, fontFamily: "var(--up-font)" }}>
        <p style={{ color: "rgba(255,100,100,0.70)", fontSize: "0.85rem" }}>Erreur : {error}</p>
        <button onClick={() => navigate("/")} style={{ marginTop: 16, background: "none", border: "none", color: GOLD, cursor: "pointer", fontSize: "0.78rem", textDecoration: "underline" }}>
          ← Retour
        </button>
      </div>
    );
  }

  const { db: dbData, sio } = data!;

  // Merge daily DB + SIO into one timeline
  const allDates = Array.from(new Set([
    ...dbData.daily.map(d => d.date),
    ...sio.dailyRegistrations.map(d => d.date),
  ])).sort();
  const dbMap = Object.fromEntries(dbData.daily.map(d => [d.date, d.count]));
  const sioMap = Object.fromEntries(sio.dailyRegistrations.map(d => [d.date, d.count]));
  const combinedDaily = allDates.map(date => ({
    date: date.slice(5), // MM-DD
    diagnostics: dbMap[date] ?? 0,
    inscriptions: sioMap[date] ?? 0,
  }));

  // Funnel data
  const funnelData = Array.from({ length: 10 }, (_, i) => {
    const found = dbData.funnel.find(f => f.step === i);
    return { step: `${i} - ${STEP_LABELS[i]}`, count: found?.count ?? 0 };
  });

  // NPS
  const nps = sio.nps;

  // ── Alertes KPI ────────────────────────────────────────────────────────────
  // KPI 1 — Taux de complétion (seuil : ≥ 65%)
  const completionStatus: AlertStatus = dbData.totalConversations < 5
    ? "nodata"
    : dbData.completionRate >= 65 ? "ok" : "warn";

  // KPI 2 — NPS (seuil : ≥ +30)
  const npsStatus: AlertStatus = nps.total < 5
    ? "nodata"
    : nps.score !== null && nps.score >= 30 ? "ok" : "warn";

  // KPI 3 — Afrique francophone : total ≥ 300 ET ≥ 2 pays avec ≥ 150 chacun
  const africaTotalCompleted = sio.africaCompleted.reduce((s, c) => s + c.count, 0);
  const africaStrongCountries = sio.africaCompleted.filter(c => c.count >= 150).length;
  const africaStatus: AlertStatus = africaTotalCompleted === 0
    ? "nodata"
    : africaTotalCompleted >= 300 && africaStrongCountries >= 2 ? "ok" : "warn";

  return (
    <div style={{ minHeight: "100vh", background: NAVY, fontFamily: "var(--up-font)", color: "#fff" }}>
      {/* ── Header ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.30em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
            UpGrade — Admin
          </span>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: GOLD, letterSpacing: "0.08em" }}>
            Tableau de bord KPI
          </h1>
        </div>

        {/* ── Filtre date ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.70rem", color: "rgba(255,255,255,0.30)", letterSpacing: "0.10em", textTransform: "uppercase" }}>
            Depuis le
          </span>
          <input
            type="date"
            value={since}
            max={TODAY}
            onChange={e => handleSinceChange(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 3,
              color: since ? GOLD : "rgba(255,255,255,0.35)",
              fontFamily: "var(--up-font)",
              fontSize: "0.78rem",
              padding: "5px 10px",
              outline: "none",
              cursor: "pointer",
            }}
          />
          {since && (
            <button
              onClick={handleReset}
              title="Afficher toutes les données"
              style={{
                background: "none", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 3,
                color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "0.72rem",
                padding: "5px 10px", fontFamily: "var(--up-font)",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}
            >
              Tout afficher
            </button>
          )}
        </div>

        <button
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "0.78rem", letterSpacing: "0.04em" }}
          onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          ← App
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 40px" }}>

        {/* ── Alertes KPI ── */}
        <SectionTitle>Alertes KPI</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 40 }}>
          <AlertCard
            label="Taux de complétion du diagnostic"
            value={dbData.totalConversations < 5 ? "—" : `${dbData.completionRate}`}
            unit="%"
            threshold="≥ 65%"
            status={completionStatus}
            recommendation="Complétion trop basse → simplifier le diagnostic ou améliorer l'onboarding"
          />
          <AlertCard
            label="Net Promoter Score (NPS)"
            value={nps.total < 5 ? "—" : nps.score !== null ? `${nps.score > 0 ? "+" : ""}${nps.score}` : "—"}
            threshold="≥ +30"
            status={npsStatus}
            recommendation="NPS insuffisant → recueillir des retours et améliorer la valeur perçue du diagnostic"
          />
          <AlertCard
            label="Diagnostics complets — Afrique francophone"
            value={africaTotalCompleted}
            threshold="≥ 300 total · ≥ 2 pays avec 150+"
            status={africaStatus}
            recommendation={
              africaTotalCompleted < 300
                ? `Volume trop bas (${africaTotalCompleted}/300) → renforcer l'acquisition en Afrique francophone`
                : `Seulement ${africaStrongCountries} pays avec ≥150 diagnostics → diversifier la présence géographique`
            }
          />
        </div>

        {/* ── KPI Cards ── */}
        <SectionTitle>Vue d'ensemble</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
          <KpiCard label="Diagnostics démarrés" value={dbData.totalConversations} sub={`${dbData.totalUsers} utilisateurs distincts`} />
          <KpiCard label="Taux de complétion" value={`${dbData.completionRate}%`} sub={`${dbData.completedDiagnostics} terminés`} color={dbData.completionRate >= 65 ? "#7EE8A2" : "#F5A0A0"} />
          <KpiCard label="Contacts Systeme.io" value={sio.totalContacts} sub={`+${sio.newLast7} cette semaine`} />
          <KpiCard label="Nouveaux leads (30j)" value={sio.newLast30} />
          <KpiCard
            label="NPS"
            value={nps.total > 0 ? (nps.score !== null ? `${nps.score > 0 ? "+" : ""}${nps.score}` : "—") : "—"}
            sub={nps.total > 0 ? `${nps.promoters}P / ${nps.passives}N / ${nps.detractors}D` : "Tags nps_X non configurés"}
            color={nps.score !== null && nps.score >= 30 ? "#7EE8A2" : nps.score !== null ? "#F5A0A0" : "rgba(255,255,255,0.25)"}
          />
          <KpiCard label="Afrique francophone" value={sio.geoAfrica.reduce((s, g) => s + g.count, 0)} sub="contacts détectés" />
        </div>

        {/* ── Funnel ── */}
        <SectionTitle>Funnel de progression — étapes</SectionTitle>
        <div style={{ marginBottom: 40 }}>
          <ChartBox title="Conversations par étape atteinte">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={funnelData} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="step" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" name="Conversations" fill={GOLD} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>

        {/* ── Daily trend ── */}
        <SectionTitle>Activité — 30 derniers jours</SectionTitle>
        <div style={{ marginBottom: 40 }}>
          <ChartBox title="Nouveaux diagnostics & inscriptions">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={combinedDaily} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} interval={4} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }} />
                <Line type="monotone" dataKey="diagnostics" name="Diagnostics" stroke={GOLD} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="inscriptions" name="Inscriptions SIO" stroke="#8BB4C8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>

        {/* ── Calendrier mensuel ── */}
        <SectionTitle>Calendrier mensuel</SectionTitle>
        <div style={{ marginBottom: 40 }}>
          <CalendarMonth dbMap={dbMap} sioMap={sioMap} />
        </div>

        {/* ── Locale + Tags ── */}
        <SectionTitle>Contacts Systeme.io</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
          <ChartBox title="Répartition par langue/locale">
            {sio.localeBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={sio.localeBreakdown.slice(0, 8)} dataKey="count" nameKey="locale" cx="50%" cy="50%" outerRadius={70} label={({ locale, percent }) => `${locale} ${Math.round((percent ?? 0) * 100)}%`} labelLine={false} fontSize={10}>
                    {sio.localeBreakdown.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.78rem", textAlign: "center", marginTop: 60 }}>
                Aucune donnée de locale disponible.
              </p>
            )}
          </ChartBox>

          <ChartBox title="Tags Systeme.io">
            {sio.tagBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sio.tagBreakdown.slice(0, 10)} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="tag" tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 10 }} width={80} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" name="Contacts" fill="#B48C28" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.78rem", textAlign: "center", marginTop: 60 }}>
                Aucun tag configuré.
              </p>
            )}
          </ChartBox>
        </div>

        {/* ── Afrique + NPS ── */}
        <SectionTitle>Géographie & NPS</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
          <ChartBox title="Afrique francophone — contacts par pays">
            {sio.geoAfrica.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sio.geoAfrica} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="country" tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" name="Contacts" fill="#8BB4C8" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ paddingTop: 20 }}>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.78rem", marginBottom: 12 }}>
                  Aucun contact africain détecté. Le champ <code style={{ background: "rgba(255,255,255,0.05)", padding: "1px 5px", borderRadius: 3 }}>locale</code> de Systeme.io doit contenir le code pays (SN, CI, CM…).
                </p>
              </div>
            )}
          </ChartBox>

          <ChartBox title="Net Promoter Score (NPS)">
            {nps.total > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16 }}>
                <p style={{ fontSize: "3rem", fontWeight: 800, color: nps.score !== null && nps.score >= 30 ? "#7EE8A2" : "#F5A0A0", margin: 0 }}>
                  {nps.score !== null ? `${nps.score > 0 ? "+" : ""}${nps.score}` : "—"}
                </p>
                <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
                  {[
                    { label: "Promoteurs", val: nps.promoters, color: "#7EE8A2" },
                    { label: "Passifs", val: nps.passives, color: "rgba(255,255,255,0.35)" },
                    { label: "Détracteurs", val: nps.detractors, color: "#F5A0A0" },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "1.4rem", fontWeight: 700, color, margin: 0 }}>{val}</p>
                      <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.30)", margin: 0 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ paddingTop: 8 }}>
                <p style={{ color: "rgba(255,255,255,0.30)", fontSize: "0.78rem", marginBottom: 8 }}>
                  Pas encore de tags NPS. Pour activer ce KPI :
                </p>
                <ol style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.73rem", lineHeight: 1.8, paddingLeft: 16 }}>
                  <li>Crée les tags <code style={{ background: "rgba(255,255,255,0.05)", padding: "1px 5px", borderRadius: 3 }}>nps_0</code> à <code style={{ background: "rgba(255,255,255,0.05)", padding: "1px 5px", borderRadius: 3 }}>nps_10</code> dans Systeme.io</li>
                  <li>Ajoute le tag correspondant au contact après chaque enquête NPS</li>
                  <li>Les scores 9-10 = promoteurs, 7-8 = passifs, 0-6 = détracteurs</li>
                </ol>
              </div>
            )}
          </ChartBox>
        </div>

        {/* ── Ventes placeholder ── */}
        <SectionTitle>Ventes & Revenus</SectionTitle>
        <div style={{
          border: "1px dashed rgba(255,255,255,0.10)",
          borderRadius: 4,
          padding: "28px 32px",
          textAlign: "center",
          marginBottom: 40,
        }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.82rem", margin: 0 }}>
            L'API Systeme.io ne fournit pas encore d'endpoint <code style={{ background: "rgba(255,255,255,0.05)", padding: "1px 5px", borderRadius: 3 }}>/orders</code> public.
          </p>
          <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.72rem", marginTop: 8 }}>
            Les données de ventes (ebooks, formations, ROAS) seront disponibles dès que Systeme.io expose cet endpoint, ou via un webhook sur chaque transaction.
          </p>
        </div>

        <p style={{ color: "rgba(255,255,255,0.12)", fontSize: "0.68rem", textAlign: "center" }}>
          Données mises à jour en temps réel · Accès restreint à {ADMIN_EMAIL}
        </p>
      </div>
    </div>
  );
}
