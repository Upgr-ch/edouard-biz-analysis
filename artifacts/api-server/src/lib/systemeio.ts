const BASE = "https://api.systeme.io/api";
const API_KEY = process.env.SYSTEME_IO_API_KEY ?? "";

export interface SystemeContact {
  email: string;
  firstName?: string;
  lastName?: string;
  marketingConsent?: boolean;
}

// ── Internal helpers ─────────────────────────────────────────────────────────

async function resolveTagId(tagName: string): Promise<number | null> {
  const listRes = await fetch(`${BASE}/tags?limit=100`, {
    headers: { "X-API-Key": API_KEY, Accept: "application/json" },
  });
  if (!listRes.ok) {
    throw new Error(`Could not list Systeme.io tags (${listRes.status})`);
  }
  const { items } = (await listRes.json()) as { items: { id: number; name: string }[] };
  let tag = items.find((t) => t.name === tagName);

  if (!tag) {
    const createRes = await fetch(`${BASE}/tags`, {
      method: "POST",
      headers: { "X-API-Key": API_KEY, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name: tagName }),
    });
    if (!createRes.ok) {
      const body = await createRes.text().catch(() => "");
      throw new Error(`Could not create Systeme.io tag "${tagName}" (${createRes.status}): ${body}`);
    }
    tag = (await createRes.json()) as { id: number; name: string };
  }
  return tag.id;
}

async function addTagToContact(contactId: number, tagName: string): Promise<void> {
  const tagId = await resolveTagId(tagName);
  if (!tagId) {
    throw new Error(`Could not resolve Systeme.io tag "${tagName}"`);
  }
  const res = await fetch(`${BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ tagId }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Could not add Systeme.io tag "${tagName}" (${res.status}): ${body}`);
  }
}

async function findContactByEmail(email: string): Promise<number | null> {
  const res = await fetch(
    `${BASE}/contacts?email=${encodeURIComponent(email)}&limit=10`,
    { headers: { "X-API-Key": API_KEY, Accept: "application/json" } },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { items: { id: number }[] };
  return data.items?.[0]?.id ?? null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Create or update a contact in Systeme.io.
 * The "Édouard" tag is applied only after explicit marketing consent.
 */
export async function upsertContact(contact: SystemeContact): Promise<void> {
  if (!API_KEY) {
    console.warn("[systemeio] SYSTEME_IO_API_KEY not set — skipping");
    return;
  }

  const res = await fetch(`${BASE}/contacts`, {
    method: "POST",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json", Accept: "application/json" },
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
      const body = await res.text().catch(() => "");
      throw new Error(`Systeme.io rejected contact (${res.status}): ${body}`);
    }
    console.info("[systemeio] contact already exists, tagging existing id", contactId);
  } else {
    const body = await res.text();
    throw new Error(`Systeme.io contact upsert failed (${res.status}): ${body}`);
  }

  if (contact.marketingConsent === true) {
    await addTagToContact(contactId, "Édouard");
  }

  console.info("[systemeio] contact upserted", contact.email, "| Édouard consent:", contact.marketingConsent === true);
}
