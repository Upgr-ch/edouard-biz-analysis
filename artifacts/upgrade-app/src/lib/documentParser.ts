import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export type SupportedFileType = "pdf" | "docx" | "txt" | "xlsx" | "csv" | "unsupported";

export function getFileType(file: File): SupportedFileType {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const mime = file.type;

  if (ext === "pdf" || mime === "application/pdf") return "pdf";
  if (
    ext === "docx" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "docx";
  if (
    ext === "xlsx" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return "xlsx";
  if (ext === "csv" || mime === "text/csv") return "csv";
  if (ext === "txt" || ext === "md" || mime.startsWith("text/")) return "txt";
  return "unsupported";
}

async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    pages.push(pageText);
  }

  return pages.join("\n\n");
}

async function parseDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function parseTxt(file: File): Promise<string> {
  return await file.text();
}

async function parseCsv(file: File): Promise<string> {
  return await file.text();
}

async function parseXlsx(file: File): Promise<string> {
  // Basic XLSX parsing - extract text from shared strings
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: file.type });
  
  // Use a simple approach: read as text the shared strings XML
  // For a more robust solution, a library like SheetJS would be needed
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    const sharedStrings = zip.file("xl/sharedStrings.xml");
    if (!sharedStrings) return "[Fichier XLSX sans contenu texte détectable]";
    
    const xml = await sharedStrings.async("string");
    const texts: string[] = [];
    const regex = /<t[^>]*>(.*?)<\/t>/gs;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      texts.push(match[1]);
    }
    return texts.join("\t");
  } catch {
    return "[Erreur lors de la lecture du fichier XLSX]";
  }
}

export async function parseDocument(file: File): Promise<{ text: string; type: SupportedFileType }> {
  const type = getFileType(file);

  switch (type) {
    case "pdf":
      return { text: await parsePdf(file), type };
    case "docx":
      return { text: await parseDocx(file), type };
    case "txt":
      return { text: await parseTxt(file), type };
    case "csv":
      return { text: await parseCsv(file), type };
    case "xlsx":
      return { text: await parseXlsx(file), type };
    default:
      throw new Error(
        "Format non pris en charge. Utilisez un fichier PDF, Word (.docx), Excel (.xlsx), CSV ou texte (.txt)."
      );
  }
}

const MAX_CHARS = 30000;

export function truncateIfNeeded(text: string): string {
  if (text.length <= MAX_CHARS) return text;
  return (
    text.slice(0, MAX_CHARS) +
    "\n\n[… Document tronqué à 30 000 caractères pour des raisons de taille …]"
  );
}
