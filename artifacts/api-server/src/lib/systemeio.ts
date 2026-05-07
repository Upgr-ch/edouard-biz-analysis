const BASE = "https://api.systeme.io/api";
const API_KEY = process.env.SYSTEME_IO_API_KEY ?? "";

export interface SystemeContact {
  email: string;
  firstName?: string;
  lastName?: string;
  marketingConsent?: boolean;
}

async function addTag(contactId: number, tagName: string): Promise<void> {
  const listRes = await fetch(`${BASE}/tags?limit=100`, {
    headers: { "X-API-Key": API_KEY, Accept: "application/json" },
  });
  if (!listRes.ok) return;
  const { items } = (await listRes.json()) as { items: { id: number; name: string }[] };
  let tag = items.find((t) => t.name === tagName);

  if (!tag) {
    const createRes = await fetch(`${BASE}/tags`, {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name: tagName }),
    });
    if (!createRes.ok) return;
    tag = (await createRes.json()) as { id: number; name: string };
  }

  await fetch(`${BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ tagId: tag.id }),
  });
}

async function findContactByEmail(email: string): Promise<number | null> {
  const res = await fetch(
    `${BASE}/contacts?email=${encodeURIComponent(email)}&limit=1`,
    { headers: { "X-API-Key": API_KEY, Accept: "application/json" } }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { items: { id: number }[] };
  return data.items?.[0]?.id ?? null;
}

export async function upsertContact(contact: SystemeContact): Promise<void> {
  if (!API_KEY) {
    console.warn("[systemeio] SYSTEME_IO_API_KEY not set — skipping");
    return;
  }

  const res = await fetch(`${BASE}/contacts`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: contact.email,
      firstName: contact.firstName ?? "",
      lastName: contact.lastName ?? "",
    }),
  });

  let contactId: number | null = null;

  if (res.ok) {
    const created = (await res.json()) as { id: number };
    contactId = created.id;
  } else if (res.status === 422) {
    contactId = await findContactByEmail(contact.email);
    if (!contactId) {
      console.error("[systemeio] contact exists but could not be found by email", contact.email);
      return;
    }
    console.info("[systemeio] contact already exists, tagging existing id", contactId);
  } else {
    const body = await res.text();
    console.error("[systemeio] upsertContact failed", res.status, body);
    return;
  }

  await addTag(contactId, "Édouard");

  if (contact.marketingConsent) {
    await addTag(contactId, "Email Marketing");
    console.info("[systemeio] tag 'Email Marketing' added for", contact.email);
  }

  console.info("[systemeio] contact upserted + tagged", contact.email, "| marketing:", contact.marketingConsent ?? false);
}
