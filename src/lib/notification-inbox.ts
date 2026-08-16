/**
 * Inbox notifikasi lokal (client-side saja).
 *
 * Sumber datanya adalah Service Worker: setiap event `push` menuliskan satu
 * baris ke IndexedDB `rekomendify-inbox` sebelum menampilkan notifikasi,
 * sehingga riwayat tetap terisi walaupun aplikasi sedang tertutup dan tetap
 * bisa dibaca saat offline.
 *
 * Tidak menyimpan data sensitif: hanya judul, isi, waktu, URL tujuan, wilayah,
 * dan status dibaca. Tidak ada token, credential, atau rahasia langganan.
 */

export const INBOX_DB = "rekomendify-inbox";
export const INBOX_STORE = "notifications";
export const INBOX_EVENT = "rekomendify:inbox-updated";

export interface InboxItem {
  id: string;
  title: string;
  body: string;
  url: string;
  tag?: string | null;
  regionSlug?: string | null;
  type?: string | null;
  receivedAt: number;
  read: boolean;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(INBOX_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(INBOX_STORE)) {
        const store = db.createObjectStore(INBOX_STORE, { keyPath: "id" });
        store.createIndex("receivedAt", "receivedAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(INBOX_STORE, mode);
        const req = fn(t.objectStore(INBOX_STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export const inboxSupported = () => typeof window !== "undefined" && "indexedDB" in window;

export async function listNotifications(): Promise<InboxItem[]> {
  if (!inboxSupported()) return [];
  try {
    const all = await tx<InboxItem[]>("readonly", (s) => s.getAll() as IDBRequest<InboxItem[]>);
    return all.sort((a, b) => b.receivedAt - a.receivedAt).slice(0, 200);
  } catch {
    return [];
  }
}

export async function countUnread(): Promise<number> {
  const all = await listNotifications();
  return all.filter((n) => !n.read).length;
}

export async function markRead(id: string): Promise<void> {
  if (!inboxSupported()) return;
  try {
    const item = await tx<InboxItem | undefined>("readonly", (s) => s.get(id) as IDBRequest<InboxItem | undefined>);
    if (!item) return;
    await tx("readwrite", (s) => s.put({ ...item, read: true }));
    notifyInboxChanged();
  } catch {
    /* diamkan: inbox bersifat opsional */
  }
}

export async function markAllRead(): Promise<void> {
  const all = await listNotifications();
  await Promise.all(all.filter((n) => !n.read).map((n) => tx("readwrite", (s) => s.put({ ...n, read: true }))));
  notifyInboxChanged();
}

export async function removeNotification(id: string): Promise<void> {
  if (!inboxSupported()) return;
  try {
    await tx("readwrite", (s) => s.delete(id));
    notifyInboxChanged();
  } catch {
    /* diamkan */
  }
}

export async function clearNotifications(): Promise<void> {
  if (!inboxSupported()) return;
  try {
    await tx("readwrite", (s) => s.clear());
    notifyInboxChanged();
  } catch {
    /* diamkan */
  }
}

export function notifyInboxChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(INBOX_EVENT));
}

/** Berlangganan perubahan inbox (dari SW maupun dari tab ini sendiri). */
export function subscribeInbox(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onSwMessage = (e: MessageEvent) => {
    if (e.data?.type === "rekomendify:push") cb();
  };
  window.addEventListener(INBOX_EVENT, cb);
  navigator.serviceWorker?.addEventListener("message", onSwMessage);
  return () => {
    window.removeEventListener(INBOX_EVENT, cb);
    navigator.serviceWorker?.removeEventListener("message", onSwMessage);
  };
}

export function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} hari lalu`;
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(ts));
  } catch {
    return "";
  }
}
