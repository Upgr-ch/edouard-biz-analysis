// Storage of anonymous chat messages before authentication
// Up to 8 messages allowed; the 9th triggers redirect to /auth and is also persisted as "pending".

export const ANON_MAX_MESSAGES = 8;
const STORAGE_KEY = "edouard_anon_chat_v1";
const PENDING_KEY = "edouard_anon_pending_v1";

export interface AnonMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
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
  list.push({ role, content, created_at: new Date().toISOString() });
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

/** Persist the 9th (blocked) message so it can be re-sent after login */
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
