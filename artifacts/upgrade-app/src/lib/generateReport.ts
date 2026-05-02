import jsPDF from "jspdf";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ── Palette UpGrade ──────────────────────────────────────────────────────────
const NAVY   = [8,  15,  30]  as const;   // #080F1E
const GOLD   = [245, 224, 144] as const;  // #F5E090
const WHITE  = [255, 255, 255] as const;
const GREY_LIGHT  = [200, 200, 210] as const;
const TEXT_BODY   = [220, 220, 230] as const;
const TEXT_MUTED  = [140, 145, 165] as const;
const TEXT_H3     = [200, 205, 215] as const;

/** Call the API to get a structured synthesis for the PDF report */
export async function fetchSynthesis(
  messages: { role: string; content: string }[],
  projectName: string,
): Promise<string> {
  const resp = await fetch(`${API_BASE}/api/report/generate`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, projectName }),
  });

  if (!resp.ok) {
    const data = (await resp.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Erreur lors de la génération du rapport");
  }

  const data = (await resp.json()) as { report?: string };
  return data.report ?? "";
}

/** Render markdown-like synthesis to a styled PDF (UpGrade design) */
export function renderReportPdf(reportMarkdown: string, projectName: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageH - 22) {
      doc.addPage();
      // Repeat mini-header on each continuation page
      doc.setFillColor(...NAVY);
      doc.rect(0, 0, pageW, 10, "F");
      doc.setFillColor(...GOLD);
      doc.rect(0, 10, pageW, 0.8, "F");
      y = 18;
    }
  };

  // ── Header banner (page 1) ───────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 46, "F");

  // Gold accent line
  doc.setFillColor(...GOLD);
  doc.rect(0, 46, pageW, 1.5, "F");

  // "ÉDOUARD"
  doc.setTextColor(...GOLD);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ÉDOUARD", margin, 19);

  // Subtitle
  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("Consultant en faisabilité & rentabilité", margin, 27);

  // Date right-aligned
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.setTextColor(...TEXT_MUTED);
  doc.setFontSize(7.5);
  doc.text(dateStr, pageW - margin, 27, { align: "right" });

  // Project name
  doc.setTextColor(...WHITE);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  const safeProjName = projectName.toUpperCase();
  const projWrapped = doc.splitTextToSize(safeProjName, contentW - 20);
  doc.text(projWrapped, margin, 39);

  y = 55;

  // ── Parse and render markdown ────────────────────────────────────────────
  const lines = reportMarkdown.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      y += 3;
      continue;
    }

    // Horizontal rule ---
    if (line.trim() === "---") {
      checkPageBreak(8);
      doc.setDrawColor(...GREY_LIGHT);
      doc.setLineWidth(0.25);
      doc.line(margin, y, pageW - margin, y);
      y += 7;
      continue;
    }

    // H1 — main title (# )
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

    // H2 — section titles (## )
    if (line.startsWith("## ")) {
      checkPageBreak(16);
      const text = stripMd(line.slice(3));
      y += 4;

      // Gold accent bar
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

    // H3 — sub-sections (### )
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

    // Bold label lines (**Label :** value)
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

    // Bullet points (- or •)
    if (line.trimStart().startsWith("- ") || line.trimStart().startsWith("• ")) {
      checkPageBreak(8);
      const text = stripMd(line.replace(/^\s*[-•]\s*/, ""));
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT_BODY);
      const wrapped = doc.splitTextToSize(text, contentW - 7);
      doc.setTextColor(...GOLD);
      doc.text("·", margin + 1, y);
      doc.setTextColor(...TEXT_BODY);
      doc.text(wrapped, margin + 6, y);
      y += wrapped.length * 5 + 2.5;
      continue;
    }

    // Regular paragraph
    checkPageBreak(8);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_BODY);
    const text = stripMd(line);
    const wrapped = doc.splitTextToSize(text, contentW);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 5 + 2;
  }

  // ── Footer on every page ─────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");

    doc.setDrawColor(...GREY_LIGHT);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 14, pageW - margin, pageH - 14);

    doc.setTextColor(...TEXT_MUTED);
    doc.text("© 2026 - Kévin Lavergne – UpGrade", margin, pageH - 9);
    doc.text(`${i} / ${totalPages}`, pageW - margin, pageH - 9, { align: "right" });
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const safeName = projectName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  doc.save(`Synthese-Edouard-${safeName}.pdf`);
}

function stripMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/#{1,4}\s*/g, "")
    .trim();
}
