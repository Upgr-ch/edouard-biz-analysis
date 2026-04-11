import jsPDF from "jspdf";

interface ReportData {
  projectName: string;
  messages: { role: string; content: string }[];
}

/** Strip markdown bold/italic markers for cleaner PDF text */
function stripMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/#{1,4}\s*/g, "")
    .replace(/---/g, "")
    .trim();
}

export function generateSynthesisReport({ projectName, messages }: ReportData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageH - margin) addPage();
  };

  // ── Header ──
  doc.setFillColor(10, 15, 26); // bg #0A0F1A
  doc.rect(0, 0, pageW, 50, "F");

  doc.setTextColor(59, 130, 246); // primary blue
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ÉDOUARD", margin, 22);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Consultant en faisabilité & rentabilité", margin, 30);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(projectName, margin, 42);

  y = 60;

  // ── Date ──
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
  doc.text(`Rapport généré le ${dateStr}`, margin, y);
  y += 12;

  // ── Content: extract assistant messages only ──
  const assistantMessages = messages.filter((m) => m.role === "assistant");

  doc.setTextColor(30, 30, 30);

  for (const msg of assistantMessages) {
    const lines = msg.content.split("\n");

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        y += 3;
        continue;
      }

      // Detect headings (## or **Étape)
      const isHeading = line.startsWith("#") || line.match(/^\*\*[ÉE]tape\s+\d/);
      const isBullet = line.startsWith("- ") || line.startsWith("• ");

      if (isHeading) {
        checkPageBreak(14);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246);
        const headingText = stripMd(line);
        const headingLines = doc.splitTextToSize(headingText, contentW);
        doc.text(headingLines, margin, y);
        y += headingLines.length * 6 + 4;
        doc.setTextColor(30, 30, 30);
      } else if (isBullet) {
        checkPageBreak(8);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const bulletText = stripMd(line.replace(/^[-•]\s*/, ""));
        const bulletLines = doc.splitTextToSize(bulletText, contentW - 6);
        doc.text("•", margin, y);
        doc.text(bulletLines, margin + 6, y);
        y += bulletLines.length * 5 + 2;
      } else {
        checkPageBreak(8);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const textLines = doc.splitTextToSize(stripMd(line), contentW);
        doc.text(textLines, margin, y);
        y += textLines.length * 5 + 2;
      }
    }

    // Separator between messages
    y += 4;
    checkPageBreak(6);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  }

  // ── Footer on each page ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text(`Édouard — ${projectName}`, margin, pageH - 10);
    doc.text(`Page ${i}/${totalPages}`, pageW - margin, pageH - 10, { align: "right" });
  }

  // ── Download ──
  const safeName = projectName.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, "").replace(/\s+/g, "-");
  doc.save(`Synthese-${safeName}.pdf`);
}
