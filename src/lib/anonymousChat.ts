// Storage of anonymous chat messages before authentication
// Up to 5 messages allowed; the 6th triggers redirect to /auth and is also persisted as "pending".

export const ANON_MAX_MESSAGES = 5; // MODIFIÉ : Passage de 8 à 5
const STORAGE_KEY = "edouard_anon_chat_v1";
const PENDING_KEY = "edouard_anon_pending_v1";

export interface AnonMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
  number?: number; // AJOUT : Pour la numérotation croissante
}

export function getAnonMessages(): AnonMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnonMessage[];
  } catch {
    return [];
  }
}

export function saveAnonMessages(messages: AnonMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* ignore */
  }
}

export function appendAnonMessage(role: "user" | "assistant", content: string) {
  const list = getAnonMessages();

  // AJOUT : Calcul du numéro de message (longueur actuelle + 1)
  const nextNumber = list.length + 1;

  list.push({
    role,
    content,
    created_at: new Date().toISOString(),
    number: nextNumber, // AJOUT : On attache le numéro au message
  });

  saveAnonMessages(list);
}

export function clearAnonMessages() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PENDING_KEY);
}

/** Count of user messages already sent anonymously */
export function getAnonUserMessageCount(): number {
  return getAnonMessages().filter((m) => m.role === "user").length;
}

/** Persist the 6th (blocked) message so it can be re-sent after login */
export function setPendingMessage(content: string) {
  try {
    localStorage.setItem(PENDING_KEY, content);
  } catch {
    /* ignore */
  }
}

export function getPendingMessage(): string | null {
  return localStorage.getItem(PENDING_KEY);
}

export function clearPendingMessage() {
  localStorage.removeItem(PENDING_KEY);
}
