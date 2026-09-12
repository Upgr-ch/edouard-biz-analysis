import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";

export async function appendContactRow(contact: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.warn("[googlesheets] GOOGLE_SHEET_ID not set — skipping");
    return;
  }

  try {
    const range = "A:D";
    const res = await connectors.proxy(
      "google-sheet",
      `/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: [
            [
              new Date().toISOString(),
              contact.email,
              contact.firstName ?? "",
              contact.lastName ?? "",
            ],
          ],
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("[googlesheets] append failed", res.status, body);
      return;
    }

    console.info("[googlesheets] row appended for", contact.email);
  } catch (err) {
    console.error("[googlesheets] error", err);
  }
}
