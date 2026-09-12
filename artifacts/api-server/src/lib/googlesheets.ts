import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";

export async function appendContactRow(contact: {
  email: string;
  firstName?: string;
  lastName?: string;
  marketingConsent?: boolean;
}): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.warn("[googlesheets] GOOGLE_SHEET_ID not set — skipping");
    return;
  }

  const consentLabel = contact.marketingConsent === true ? "Oui" : "Non";

  try {
    const range = "A:E";
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
              consentLabel,
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

    console.info("[googlesheets] row appended for", contact.email, "| consentement Édouard:", consentLabel);
  } catch (err) {
    console.error("[googlesheets] error", err);
  }
}
