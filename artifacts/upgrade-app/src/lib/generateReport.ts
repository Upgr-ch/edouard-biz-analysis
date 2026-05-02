import jsPDF from "jspdf";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ── Palette UpGrade ──────────────────────────────────────────────────────────
const NAVY        = [8,  15,  30]  as const;
const GOLD        = [245, 224, 144] as const;
const WHITE       = [255, 255, 255] as const;
const GREY_LIGHT  = [160, 165, 180] as const;
const TEXT_BODY   = [30,  35,  55]  as const;
const TEXT_MUTED  = [90,  95, 115]  as const;
const TEXT_H3     = [50,  55,  80]  as const;

// ── Concurrency limiter ───────────────────────────────────────────────────────

async function withConcurrencyLimit<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
  onItemDone?: (result: T, index: number) => void,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const idx = next++;
      results[idx] = await tasks[idx]();
      onItemDone?.(results[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}

// ── Indice helpers ────────────────────────────────────────────────────────────

interface IndiceRow {
  emoji: string;
  label: string;
  description: string;
  isVerdict: boolean;
}

function emojiToColor(emoji: string): [number, number, number] {
  if (emoji.includes("🟢")) return [34, 197, 94];
  if (emoji.includes("🔵")) return [59, 130, 246];
  if (emoji.includes("🟡")) return [214, 163, 20];
  if (emoji.includes("🟠")) return [234, 100, 22];
  if (emoji.includes("🔴")) return [220, 60, 60];
  if (emoji.includes("🟣")) return [155, 80, 230];
  return [130, 135, 160];
}

function emojiLabel(emoji: string): string {
  if (emoji.includes("🟢")) return "Très favorable";
  if (emoji.includes("🔵")) return "Favorable / ajustements";
  if (emoji.includes("🟡")) return "Incertain";
  if (emoji.includes("🟠")) return "Difficile";
  if (emoji.includes("🔴")) return "Très risqué";
  if (emoji.includes("🟣")) return "Rédhibitoire";
  return "";
}

function parseIndice(text: string): { rows: IndiceRow[]; cleanText: string } {
  const rows: IndiceRow[] = [];
  const keepLines: string[] = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (t.startsWith("%%INDICE%%") || t.startsWith("%%VERDICT%%")) {
      const isVerdict = t.startsWith("%%VERDICT%%");
      const raw = t.replace(/^%%[A-Z]+%%\s*/, "");
      const i1 = raw.indexOf("|");
      const i2 = raw.indexOf("|", i1 + 1);
      if (i1 >= 0 && i2 >= 0) {
        rows.push({
          emoji: raw.slice(0, i1).trim(),
          label: raw.slice(i1 + 1, i2).trim(),
          description: raw.slice(i2 + 1).trim(),
          isVerdict,
        });
      }
    } else if (
      t === "## Indice de Faisabilité-Rentabilité" ||
      (t.startsWith("Légende") && t.includes("pastilles")) ||
      (t.startsWith("Légende") && t.includes("emojis"))
    ) {
      // omit — rendered as visual block
    } else {
      keepLines.push(line);
    }
  }
  return { rows, cleanText: keepLines.join("\n") };
}

function renderIndiceBlock(
  doc: jsPDF,
  rows: IndiceRow[],
  margin: number,
  contentW: number,
  pageW: number,
  pageH: number,
  startY: number,
): number {
  if (rows.length === 0) return startY;
  let y = startY;

  // Section heading
  doc.setFillColor(...GOLD);
  doc.rect(margin, y - 3.5, 2.5, 9, "F");
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("INDICE DE FAISABILITÉ-RENTABILITÉ", margin + 6, y + 1.5);
  y += 12;

  const criteriaRows = rows.filter((r) => !r.isVerdict);
  const labelColW = 52;
  const badgeColW = 36;
  const descX = margin + labelColW + badgeColW;
  const descW = contentW - labelColW - badgeColW;

  for (const row of criteriaRows) {
    const color = emojiToColor(row.emoji);
    const descLines = doc.splitTextToSize(row.description, descW);
    const rowH = Math.max(11, descLines.length * 5 + 6);

    if (y + rowH > pageH - 26) {
      doc.addPage();
      drawPageHeader(doc, pageW, true);
      y = 18;
    }

    // Row bg
    doc.setFillColor(13, 20, 40);
    doc.rect(margin, y - 2, contentW, rowH, "F");
    // Left color bar
    doc.setFillColor(...color);
    doc.rect(margin, y - 2, 3, rowH, "F");
    // Circle
    doc.setFillColor(...color);
    const cy = y + rowH / 2 - 2;
    doc.circle(margin + 10, cy, 2.8, "F");
    // Label
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text(row.label, margin + 16, cy + 1.2);
    // Status badge
    const badgeLabel = emojiLabel(row.emoji);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(badgeLabel, margin + labelColW, cy + 1.2);
    // Description
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(190, 196, 218);
    doc.text(descLines, descX, y + 4);

    y += rowH + 1.5;
  }

  // Verdict
  const verdict = rows.find((r) => r.isVerdict);
  if (verdict) {
    y += 7;
    const color = emojiToColor(verdict.emoji);
    const verdictLines = doc.splitTextToSize(verdict.description, contentW - 26);
    const verdictH = Math.max(24, verdictLines.length * 5.5 + 20);

    if (y + verdictH > pageH - 26) {
      doc.addPage();
      drawPageHeader(doc, pageW, true);
      y = 18;
    }

    // Tinted bg
    const rb = Math.round(color[0] * 0.2 + 8 * 0.8);
    const gb = Math.round(color[1] * 0.2 + 15 * 0.8);
    const bb = Math.round(color[2] * 0.2 + 30 * 0.8);
    doc.setFillColor(rb, gb, bb);
    doc.rect(margin, y - 3, contentW, verdictH, "F");
    doc.setFillColor(...color);
    doc.rect(margin, y - 3, 4, verdictH, "F");
    // Circle
    doc.setFillColor(...color);
    doc.circle(margin + 12, y + 5.5, 4, "F");
    // "VERDICT GLOBAL" label
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text("VERDICT GLOBAL", margin + 21, y + 7);
    // Status badge on right
    const badgeVLabel = emojiLabel(verdict.emoji);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(badgeVLabel.toUpperCase(), pageW - margin, y + 7, { align: "right" });
    // Description
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(225, 230, 242);
    doc.text(verdictLines, margin + 21, y + 14);
    y += verdictH + 6;
  }

  return y + 4;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function stripMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/#{1,4}\s*/g, "")
    .trim();
}

function drawPageHeader(doc: jsPDF, pageW: number, mini = false) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, mini ? 10 : 46, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, mini ? 10 : 46, pageW, mini ? 0.8 : 1.5, "F");
}

function drawPageFooter(doc: jsPDF, pageW: number, pageH: number, page: number, total: number, projectName: string) {
  const margin = 18;
  doc.setDrawColor(...GREY_LIGHT);
  doc.setLineWidth(0.2);
  doc.line(margin, pageH - 14, pageW - margin, pageH - 14);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.text("© 2026 - Kévin Lavergne – UpGrade", margin, pageH - 9);
  doc.text(`${page} / ${total}`, pageW - margin, pageH - 9, { align: "right" });
}

function parseMdToDoc(
  doc: jsPDF,
  lines: string[],
  margin: number,
  contentW: number,
  pageW: number,
  pageH: number,
  startY: number,
): number {
  let y = startY;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageH - 22) {
      doc.addPage();
      drawPageHeader(doc, pageW, true);
      y = 18;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) { y += 3; continue; }

    if (line.trim() === "---") {
      checkPageBreak(8);
      doc.setDrawColor(...GREY_LIGHT);
      doc.setLineWidth(0.25);
      doc.line(margin, y, pageW - margin, y);
      y += 7;
      continue;
    }

    if (line.startsWith("# ") && !line.startsWith("## ")) {
      checkPageBreak(16);
      const text = stripMd(line.slice(2));
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...WHITE);
      const wrapped = doc.splitTextToSize(text, contentW);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 7.5 + 4;
      continue;
    }

    if (line.startsWith("## ")) {
      checkPageBreak(16);
      const text = stripMd(line.slice(3));
      y += 4;
      doc.setFillColor(...GOLD);
      doc.rect(margin, y - 5, 2.5, 9, "F");
      doc.setFontSize(11.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GOLD);
      const wrapped = doc.splitTextToSize(text, contentW - 8);
      doc.text(wrapped, margin + 6, y);
      y += wrapped.length * 6.5 + 5;
      continue;
    }

    if (line.startsWith("### ")) {
      checkPageBreak(10);
      const text = stripMd(line.slice(4));
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...TEXT_H3);
      const wrapped = doc.splitTextToSize(text, contentW);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 5.5 + 3;
      continue;
    }

    const boldMatch = line.match(/^\*\*(.+?)\*\*\s*(.*)/);
    if (boldMatch) {
      checkPageBreak(10);
      const label = stripMd(boldMatch[1]);
      const value = stripMd(boldMatch[2]);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GOLD);
      const labelStr = label + (label.endsWith(":") ? " " : " : ");
      const labelW = doc.getTextWidth(labelStr);
      doc.text(labelStr, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT_BODY);
      const remainingW = contentW - labelW;
      const valueWrapped = doc.splitTextToSize(value || "—", remainingW);
      doc.text(valueWrapped[0] ?? "", margin + labelW, y);
      for (let i = 1; i < valueWrapped.length; i++) {
        y += 5;
        checkPageBreak(6);
        doc.text(valueWrapped[i], margin + labelW, y);
      }
      y += 6;
      continue;
    }

    if (line.trimStart().startsWith("- ") || line.trimStart().startsWith("• ")) {
      checkPageBreak(8);
      const text = stripMd(line.replace(/^\s*[-•]\s*/, ""));
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GOLD);
      doc.text("·", margin + 1, y);
      doc.setTextColor(...TEXT_BODY);
      const wrapped = doc.splitTextToSize(text, contentW - 7);
      doc.text(wrapped, margin + 6, y);
      y += wrapped.length * 5 + 2.5;
      continue;
    }

    checkPageBreak(8);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_BODY);
    const wrapped = doc.splitTextToSize(stripMd(line), contentW);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 5 + 2;
  }

  return y;
}

// ── Final synthesis PDF ───────────────────────────────────────────────────────

export async function fetchSynthesis(
  messages: { role: string; content: string }[],
  projectName: string,
  token?: string | null,
): Promise<string> {
  const resp = await fetch(`${API_BASE}/api/report/generate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages, projectName }),
  });

  if (!resp.ok) {
    const data = (await resp.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Erreur lors de la génération du rapport");
  }

  const data = (await resp.json()) as { report?: string };
  return data.report ?? "";
}

export function renderReportPdf(reportMarkdown: string, projectName: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;

  // Header page 1
  drawPageHeader(doc, pageW, false);

  doc.setTextColor(...GOLD);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ÉDOUARD", margin, 19);

  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("Consultant en faisabilité & rentabilité", margin, 27);

  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(7.5);
  doc.text(dateStr, pageW - margin, 27, { align: "right" });

  doc.setTextColor(...WHITE);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  const projWrapped = doc.splitTextToSize(projectName.toUpperCase(), contentW - 20);
  doc.text(projWrapped, margin, 39);

  parseMdToDoc(doc, reportMarkdown.split("\n"), margin, contentW, pageW, pageH, 55);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(doc, pageW, pageH, i, totalPages, projectName);
  }

  const safeName = projectName
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);
  doc.save(`Synthese-Edouard-${safeName}.pdf`);
}

// ── Compilation PDF (all steps + synthesis) ──────────────────────────────────

export const STEP_LABELS = [
  "Projet", "Cadrage", "Marché", "Diagnostic", "Objectifs",
  "Économie & Financement", "Statut et Fiscalité", "Faisabilité", "Acquisition",
] as const;

export async function fetchAllStepReports(
  messages: { role: string; content: string }[],
  projectName: string,
  token?: string | null,
  onStepComplete?: (label: string, done: number, total: number) => void,
): Promise<Array<{ label: string; content: string }>> {
  const total = STEP_LABELS.length;
  let done = 0;

  const tasks = STEP_LABELS.map((label) => async () => {
    const content = await fetchStepReport(messages, projectName, label, token);
    done += 1;
    onStepComplete?.(label, done, total);
    return { label, content };
  });

  // Sequential (1 at a time) — avoids rate-limit 429 on OpenRouter free tier
  return withConcurrencyLimit(tasks, 1);
}

export function renderCompilationPdf(
  stepReports: Array<{ label: string; content: string }>,
  synthesisReport: string,
  projectName: string,
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  // ── Cover page ────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, pageH, "F");

  // Left gold accent bar (thick)
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, 4, pageH, "F");

  // Top brand band
  doc.setFillColor(14, 22, 45);
  doc.rect(4, 0, pageW - 4, 60, "F");

  doc.setTextColor(...GOLD);
  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  doc.text("ÉDOUARD", margin + 4, 32);

  doc.setTextColor(...GREY_LIGHT);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Consultant en faisabilité & rentabilité", margin + 4, 42);

  doc.setFillColor(...GOLD);
  doc.rect(4, 60, pageW - 4, 1, "F");

  // Project name area
  doc.setTextColor(...WHITE);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  const projW = doc.splitTextToSize(projectName.toUpperCase(), contentW - 6);
  doc.text(projW, margin + 4, 80);
  const afterProj = 80 + projW.length * 9.5;

  doc.setTextColor(...GOLD);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("RAPPORT COMPLET  ·  10 ÉTAPES ANALYSÉES", margin + 4, afterProj + 8);

  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(dateStr, margin + 4, afterProj + 17);

  // Gold divider before step list
  doc.setFillColor(40, 50, 80);
  doc.rect(margin + 4, afterProj + 26, contentW - 4, 0.4, "F");

  // Step list (two-column layout)
  const col1X = margin + 4;
  const col2X = margin + 4 + (contentW - 4) / 2 + 2;
  let stepY = afterProj + 36;
  const allItems = [...STEP_LABELS.map((l, i) => ({ num: i + 1, label: l })),
                    { num: 10, label: "Synthèse — Verdict final" }];

  allItems.forEach(({ num, label: lbl }, idx) => {
    const col = idx < 5 ? col1X : col2X;
    const rowY = stepY + (idx % 5) * 8;
    doc.setFillColor(...GOLD);
    doc.circle(col + 2.5, rowY - 1.5, 1.4, "F");
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GOLD);
    doc.text(`${num}.`, col + 6, rowY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 205, 225);
    doc.text(lbl, col + 12, rowY);
  });

  // Cover footer
  doc.setTextColor(50, 58, 85);
  doc.setFontSize(7);
  doc.text("© 2026 - Kévin Lavergne – UpGrade", margin + 4, pageH - 10);

  // ── Step sections ─────────────────────────────────────────────────────────
  for (let i = 0; i < stepReports.length; i++) {
    const { label, content } = stepReports[i];
    doc.addPage();

    // Header: 34mm with step number + label
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, pageW, 34, "F");
    doc.setFillColor(...GOLD);
    doc.rect(0, 34, pageW, 1, "F");
    doc.setFillColor(...GOLD);
    doc.rect(0, 0, 4, 34, "F");

    // Step badge
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GOLD);
    doc.text(`FICHE ÉTAPE  ${i + 1}/9`, margin + 2, 11);

    // Step label (prominent)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text(label.toUpperCase(), margin + 2, 25);

    // Project name right-aligned
    doc.setTextColor(...TEXT_MUTED);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(projectName, pageW - margin, 25, { align: "right" });

    // Skip H1 title line from AI content (already shown in header)
    const stepLines = content.split("\n");
    let skippedH1 = false;
    const filteredLines = stepLines.filter((line) => {
      if (!skippedH1 && line.startsWith("# ") && !line.startsWith("## ")) {
        skippedH1 = true;
        return false;
      }
      return true;
    });

    parseMdToDoc(doc, filteredLines, margin, contentW, pageW, pageH, 42);
  }

  // ── Synthesis section ─────────────────────────────────────────────────────
  doc.addPage();
  drawPageHeader(doc, pageW, false);

  doc.setTextColor(...GOLD);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SYNTHÈSE FINALE", margin, 19);

  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("Verdict global sur la faisabilité et la rentabilité", margin, 27);

  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(7.5);
  doc.text(dateStr, pageW - margin, 27, { align: "right" });

  doc.setTextColor(...WHITE);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  const synW = doc.splitTextToSize(projectName.toUpperCase(), contentW - 20);
  doc.text(synW, margin, 39);

  // Parse + render indice block, then pass clean text to parseMdToDoc
  const { rows: indiceRows, cleanText: synthesisClean } = parseIndice(synthesisReport);
  let synthY = 53;
  if (indiceRows.length > 0) {
    synthY = renderIndiceBlock(doc, indiceRows, margin, contentW, pageW, pageH, synthY);
    synthY += 4;
  }
  parseMdToDoc(doc, synthesisClean.split("\n"), margin, contentW, pageW, pageH, synthY);

  // ── Page footers (skip cover = page 1) ────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(doc, pageW, pageH, p - 1, totalPages - 1, projectName);
  }

  const safeName = projectName
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);
  doc.save(`Rapport-Complet-Edouard-${safeName}.pdf`);
}

// ── Step fiche PDF ────────────────────────────────────────────────────────────

export async function fetchStepReport(
  messages: { role: string; content: string }[],
  projectName: string,
  stepLabel: string,
  token?: string | null,
): Promise<string> {
  const resp = await fetch(`${API_BASE}/api/report/step`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages, projectName, stepLabel }),
  });

  if (!resp.ok) {
    const data = (await resp.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Erreur lors de la génération de la fiche");
  }

  const data = (await resp.json()) as { report?: string };
  return data.report ?? "";
}

export function renderStepPdf(reportMarkdown: string, projectName: string, stepLabel: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;

  // Header
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 38, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 38, pageW, 1.5, "F");

  // "FICHE ÉTAPE" badge
  doc.setFillColor(245, 224, 144, 0.15);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text(`FICHE ÉTAPE · ${stepLabel.toUpperCase()}`, margin, 12);

  // Project name
  doc.setTextColor(...WHITE);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const projWrapped = doc.splitTextToSize(projectName.toUpperCase(), contentW - 20);
  doc.text(projWrapped, margin, 22);

  // Date right-aligned
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(dateStr, pageW - margin, 12, { align: "right" });

  parseMdToDoc(doc, reportMarkdown.split("\n"), margin, contentW, pageW, pageH, 46);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(doc, pageW, pageH, i, totalPages, projectName);
  }

  const safeName = `${projectName}-${stepLabel}`
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 70);
  doc.save(`Fiche-Edouard-${safeName}.pdf`);
}
