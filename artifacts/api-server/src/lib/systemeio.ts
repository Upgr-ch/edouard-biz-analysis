const BASE = "https://api.systeme.io/api";
const API_KEY = process.env.SYSTEME_IO_API_KEY ?? "";

interface SystemeContact {
  email: string;
  firstName?: string;
  lastName?: string;
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

  if (!res.ok) {
    const body = await res.text();
    console.error("[systemeio] upsertContact failed", res.status, body);
    return;
  }

  const created = (await res.json()) as { id: number };
  await addTag(created.id, "Édouard");
  console.info("[systemeio] contact upserted + tagged", contact.email);
}
