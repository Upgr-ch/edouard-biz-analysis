// Storage of anonymous chat messages before authentication
// Up to 10 messages allowed for testing; the 11th triggers redirect to /auth.

export const ANON_MAX_MESSAGES = 6;
const STORAGE_KEY = "edouard_anon_chat_v1";
const PENDING_KEY = "edouard_anon_pending_v1";

export interface AnonMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
  number?: number;
}

export function getAnonMessages(): AnonMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnonMessage[];
  } catch (error) {
    console.error("Erreur lecture messages anonymes:", error);
    return [];
  }
}

export function saveAnonMessages(messages: AnonMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error("Erreur sauvegarde messages anonymes:", error);
  }
}

export function appendAnonMessage(role: "user" | "assistant", content: string) {
  const list = getAnonMessages();
  const nextNumber = list.length + 1;

  list.push({
    role,
    content,
    created_at: new Date().toISOString(),
    number: nextNumber,
  });

  saveAnonMessages(list);

  // Force la mise à jour des composants qui écoutent le storage
  window.dispatchEvent(new Event("storage"));
}

export function clearAnonMessages() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PENDING_KEY);
  localStorage.removeItem("temp_title");
}

/** * Compte uniquement les messages envoyés par l'utilisateur
 */
export function getAnonUserMessageCount(): number {
  const messages = getAnonMessages();
  const count = messages.filter((m) => m.role === "user").length;
  console.log("Compteur Édouard (User messages uniquement) :", count);
  return count;
}

/** Persist the message so it can be re-sent after login */
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
