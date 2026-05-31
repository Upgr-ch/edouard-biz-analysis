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
  if (!listRes.ok) return null;
  const { items } = (await listRes.json()) as { items: { id: number; name: string }[] };
  let tag = items.find((t) => t.name === tagName);

  if (!tag) {
    const createRes = await fetch(`${BASE}/tags`, {
      method: "POST",
      headers: { "X-API-Key": API_KEY, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name: tagName }),
    });
    if (!createRes.ok) return null;
    tag = (await createRes.json()) as { id: number; name: string };
  }
  return tag.id;
}

async function addTagToContact(contactId: number, tagName: string): Promise<void> {
  const tagId = await resolveTagId(tagName);
  if (!tagId) {
    console.error("[systemeio] could not resolve tag id for", tagName);
    return;
  }
  const res = await fetch(`${BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ tagId }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[systemeio] addTagToContact failed (${res.status}) contact=${contactId} tag=${tagName}`, body);
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

async function getEmailFromClerk(clerkUserId: string): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY ?? "";
  if (!secretKey) return null;
  try {
    const res = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!res.ok) return null;
    const user = await res.json() as {
      email_addresses: { id: string; email_address: string }[];
      primary_email_address_id: string;
    };
    return user.email_addresses.find(
      (e) => e.id === user.primary_email_address_id,
    )?.email_address ?? null;
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Create or update a contact in Systeme.io and tag them "Édouard".
 * Also adds "Email Marketing" tag if consent given.
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
      console.error("[systemeio] contact exists but could not be found by email", contact.email);
      return;
    }
    console.info("[systemeio] contact already exists, tagging existing id", contactId);
  } else {
    const body = await res.text();
    console.error("[systemeio] upsertContact failed", res.status, body);
    return;
  }

  await addTagToContact(contactId, "Édouard");

  if (contact.marketingConsent) {
    await addTagToContact(contactId, "Email Marketing");
    console.info("[systemeio] tag 'Email Marketing' added for", contact.email);
  }

  console.info("[systemeio] contact upserted + tagged", contact.email, "| marketing:", contact.marketingConsent ?? false);
}

/**
 * Add a diagnostic progression tag to a Systeme.io contact identified
 * by their Clerk user ID. Runs asynchronously — never blocks a response.
 *
 * Tags applied:
 *   step undefined / "debut"  → "diagnostic_debut"
 *   step 4                    → "diagnostic_mi_parcours"
 *   step 9                    → "diagnostic_complet"
 */
export async function tagDiagnosticProgress(
  clerkUserId: string,
  event: "debut" | "mi_parcours" | "complet",
): Promise<void> {
  if (!API_KEY) return;

  const email = await getEmailFromClerk(clerkUserId);
  if (!email) {
    console.warn("[systemeio] could not resolve email for userId", clerkUserId);
    return;
  }

  // Find contact — if not found, create it on the fly so tags always land
  let contactId = await findContactByEmail(email);
  if (!contactId) {
    console.info("[systemeio] contact not found, creating on-the-fly for", email);
    const createRes = await fetch(`${BASE}/contacts`, {
      method: "POST",
      headers: { "X-API-Key": API_KEY, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email }),
    });
    if (createRes.ok) {
      const created = (await createRes.json()) as { id: number };
      contactId = created.id;
      // Also apply the base "Édouard" tag
      await addTagToContact(contactId, "Édouard");
    } else if (createRes.status === 422) {
      // Race condition: created between our GET and POST — try lookup again
      contactId = await findContactByEmail(email);
    }
    if (!contactId) {
      console.error("[systemeio] could not create or find contact for", email);
      return;
    }
  }

  const tagName = `diagnostic_${event}`;
  await addTagToContact(contactId, tagName);
  console.info(`[systemeio] tagged "${tagName}" for`, email);
}
