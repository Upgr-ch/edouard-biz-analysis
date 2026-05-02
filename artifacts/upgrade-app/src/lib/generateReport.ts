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
  let done = 0;
  return Promise.all(
    STEP_LABELS.map(async (label) => {
      const content = await fetchStepReport(messages, projectName, label, token);
      done += 1;
      onStepComplete?.(label, done, STEP_LABELS.length);
      return { label, content };
    }),
  );
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

  // Left gold accent bar
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, 3.5, pageH, "F");

  // Brand
  doc.setTextColor(...GOLD);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("ÉDOUARD", margin, 38);

  doc.setTextColor(...GREY_LIGHT);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Consultant en faisabilité & rentabilité", margin, 47);

  doc.setFillColor(...GOLD);
  doc.rect(margin, 52, contentW, 0.6, "F");

  // Project name
  doc.setTextColor(...WHITE);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  const projW = doc.splitTextToSize(projectName.toUpperCase(), contentW);
  doc.text(projW, margin, 64);

  const afterProj = 64 + projW.length * 8;

  doc.setTextColor(...GOLD);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("RAPPORT COMPLET — 10 ÉTAPES ANALYSÉES", margin, afterProj + 8);

  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(dateStr, margin, afterProj + 16);

  // Step index
  doc.setFillColor(255, 255, 255, 0.04);
  const indexY = afterProj + 28;
  doc.setFillColor(...GOLD);
  doc.rect(margin, indexY, contentW, 0.4, "F");

  let iy = indexY + 10;
  STEP_LABELS.forEach((label, i) => {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GOLD);
    doc.text(`${i + 1}. `, margin, iy);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...WHITE);
    doc.text(label, margin + 7, iy);
    iy += 7.5;
  });

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("10. ", margin, iy);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...WHITE);
  doc.text("Synthèse — Verdict final", margin + 9, iy);

  // Cover footer
  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(7);
  doc.text("© 2026 - Kévin Lavergne – UpGrade", margin, pageH - 10);

  // ── Step sections ─────────────────────────────────────────────────────────
  for (let i = 0; i < stepReports.length; i++) {
    const { label, content } = stepReports[i];
    doc.addPage();

    // Section mini-header
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, pageW, 22, "F");
    doc.setFillColor(...GOLD);
    doc.rect(0, 22, pageW, 0.8, "F");
    doc.setFillColor(...GOLD);
    doc.rect(0, 0, 3.5, 22, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GOLD);
    doc.text(`ÉTAPE ${i + 1}/9  ·  ${label.toUpperCase()}`, margin, 14);

    doc.setTextColor(...TEXT_MUTED);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(projectName, pageW - margin, 14, { align: "right" });

    parseMdToDoc(doc, content.split("\n"), margin, contentW, pageW, pageH, 30);
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

  parseMdToDoc(doc, synthesisReport.split("\n"), margin, contentW, pageW, pageH, 55);

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
