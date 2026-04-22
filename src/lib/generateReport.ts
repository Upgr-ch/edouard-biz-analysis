import jsPDF from "jspdf";

const REPORT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`;

/** Call edge function to get structured synthesis */
export async function fetchSynthesis(
  messages: { role: string; content: string }[],
  projectName: string,
): Promise<string> {
  const resp = await fetch(REPORT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, projectName }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.error || "Erreur lors de la génération du rapport");
  }

  const data = await resp.json();
  return data.report;
}

/** Render markdown-like synthesis to a styled PDF */
export function renderReportPdf(reportMarkdown: string, projectName: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageH - 20) {
      doc.addPage();
      y = margin;
    }
  };

  // ── Dark header banner ──
  doc.setFillColor(10, 15, 26);
  doc.rect(0, 0, pageW, 44, "F");

  // Blue accent line
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 44, pageW, 1.5, "F");

  doc.setTextColor(59, 130, 246);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("ÉDOUARD", margin, 18);

  doc.setTextColor(180, 180, 200);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Consultant en faisabilité & rentabilité", margin, 26);

  // Date right-aligned
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.setTextColor(120, 120, 140);
  doc.setFontSize(8);
  doc.text(dateStr, pageW - margin, 26, { align: "right" });

  // Project name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(projectName.toUpperCase(), margin, 38);

  y = 52;

  // ── Parse and render markdown lines ──
  const lines = reportMarkdown.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Skip empty lines
    if (!line.trim()) {
      y += 3;
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---") {
      checkPageBreak(8);
      doc.setDrawColor(200, 200, 210);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 6;
      continue;
    }

    // H1 - Main title
    if (line.startsWith("# ") && !line.startsWith("## ")) {
      checkPageBreak(14);
      const text = stripMd(line.slice(2));
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 40);
      const wrapped = doc.splitTextToSize(text, contentW);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 7 + 4;
      continue;
    }

    // H2 - Section titles
    if (line.startsWith("## ")) {
      checkPageBreak(14);
      const text = stripMd(line.slice(3));
      y += 3;

      // Section accent bar
      doc.setFillColor(59, 130, 246);
      doc.rect(margin, y - 4, 2, 8, "F");

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      const wrapped = doc.splitTextToSize(text, contentW - 6);
      doc.text(wrapped, margin + 5, y);
      y += wrapped.length * 6 + 6;
      continue;
    }

    // H3 - Sub-sections
    if (line.startsWith("### ")) {
      checkPageBreak(10);
      const text = stripMd(line.slice(4));
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 65);
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
      const fullText = `${label} ${value}`;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 55);
      // Measure label width
      const labelW = doc.getTextWidth(label + " ");
      const wrapped = doc.splitTextToSize(fullText, contentW);

      // First line: bold label + normal value
      if (wrapped.length === 1) {
        doc.text(label + " ", margin, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 75);
        doc.text(value, margin + labelW, y);
      } else {
        // Multi-line: just render all as mixed
        doc.text(label, margin, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 75);
        const valueWrapped = doc.splitTextToSize(value, contentW - labelW);
        if (valueWrapped.length === 1) {
          doc.text(value, margin + labelW, y);
        } else {
          doc.text(value, margin + labelW, y);
          // Overflow lines
          const remainingValue = doc.splitTextToSize(value, contentW);
          for (let i = 1; i < remainingValue.length; i++) {
            y += 5;
            checkPageBreak(6);
            doc.text(remainingValue[i], margin, y);
          }
        }
      }
      y += 6;
      continue;
    }

    // Bullet points
    if (line.trimStart().startsWith("- ") || line.trimStart().startsWith("• ")) {
      checkPageBreak(8);
      const text = stripMd(line.replace(/^\s*[-•]\s*/, ""));
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 75);
      const wrapped = doc.splitTextToSize(text, contentW - 6);
      doc.text("•", margin + 1, y);
      doc.text(wrapped, margin + 6, y);
      y += wrapped.length * 5 + 2;
      continue;
    }

    // Regular text
    checkPageBreak(8);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 65);
    const text = stripMd(line);
    const wrapped = doc.splitTextToSize(text, contentW);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 5 + 2;
  }

  // ── Footer on each page ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 170);
    doc.setFont("helvetica", "normal");

    // Bottom line
    doc.setDrawColor(220, 220, 230);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 14, pageW - margin, pageH - 14);

    doc.text("©  Kévin Lavergne – UpGrade", margin, pageH - 10);
    doc.text(`${i}/${totalPages}`, pageW - margin, pageH - 10, { align: "right" });
  }

  // ── Download ──
  const safeName = projectName.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, "").replace(/\s+/g, "-");
  doc.save(`Synthese-${safeName}.pdf`);
}

function stripMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/#{1,4}\s*/g, "")
    .trim();
}
