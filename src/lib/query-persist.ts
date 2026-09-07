/**
 * Offline data strategy — cache data PUBLIK di perangkat (IndexedDB) supaya
 * aplikasi (terutama APK) tetap menampilkan konten terakhir saat tanpa koneksi,
 * bukan layar kosong.
 *
 * Prinsip:
 * - Hanya query publik yang disimpan. Data akun/admin (`my-*`, `admin-*`)
 *   TIDAK pernah ditulis ke disk.
 * - Ada versi cache, batas jumlah entri, dan masa berlaku → cache lama dibuang
 *   otomatis. TIDAK ada penghapusan cache paksa saat startup.
 * - Strategi baca: tampilkan cache dulu (stale-while-revalidate); data segar
 *   menimpa saat jaringan tersedia.
 */
import type { QueryClient } from "@tanstack/react-query";

const DB_NAME = "rekomendify-query-cache";
const STORE = "queries";
const DB_VERSION = 1;

/** Naikkan bila bentuk data server function berubah agar cache lama diabaikan. */
const CACHE_VERSION = "v1";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 hari
const MAX_ENTRIES = 300;

/** Prefix queryKey publik yang boleh disimpan di perangkat. */
const PUBLIC_KEYS = new Set([
  "regions",
  "region",
  "region-info",
  "region-contact",
  "region-ads",
  "contextual-ads",
  "location",
]);

type StoredEntry = {
  id: string;
  version: string;
  updatedAt: number;
  queryKey: unknown;
  data: unknown;
};

function isPublicKey(queryKey: readonly unknown[]): boolean {
  const head = queryKey[0];
  return typeof head === "string" && PUBLIC_KEYS.has(head);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" }).createIndex("updatedAt", "updatedAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx<T>(db: IDBDatabase, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const request = run(t.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Memasang persistensi cache. Dipanggil sekali dari klien.
 * Aman gagal: bila IndexedDB tidak tersedia, aplikasi tetap berjalan normal.
 */
export async function attachQueryPersistence(queryClient: QueryClient): Promise<void> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return;

  let db: IDBDatabase;
  try {
    db = await openDb();
  } catch {
    return;
  }

  // 1. Muat cache yang masih berlaku ke dalam QueryClient (hydrate).
  try {
    const all = await tx<StoredEntry[]>(db, "readonly", (store) => store.getAll() as IDBRequest<StoredEntry[]>);
    const now = Date.now();
    const expired: string[] = [];

    for (const entry of all) {
      if (entry.version !== CACHE_VERSION || now - entry.updatedAt > MAX_AGE_MS) {
        expired.push(entry.id);
        continue;
      }
      const key = entry.queryKey as readonly unknown[];
      if (!Array.isArray(key) || !isPublicKey(key)) continue;
      if (queryClient.getQueryData(key) !== undefined) continue;
      queryClient.setQueryData(key, entry.data, { updatedAt: entry.updatedAt });
    }

    // Bersihkan entri kedaluwarsa & jaga batas jumlah (FIFO paling lama dulu).
    const surviving = all
      .filter((e) => !expired.includes(e.id))
      .sort((a, b) => a.updatedAt - b.updatedAt);
    const overflow = surviving.slice(0, Math.max(0, surviving.length - MAX_ENTRIES)).map((e) => e.id);

    for (const id of [...expired, ...overflow]) {
      await tx(db, "readwrite", (store) => store.delete(id));
    }
  } catch {
    /* cache tidak terbaca — lanjut tanpa cache */
  }

  // 2. Simpan setiap hasil query publik yang sukses.
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== "updated") return;
    const query = event.query;
    if (query.state.status !== "success" || query.state.data === undefined) return;
    const key = query.queryKey as readonly unknown[];
    if (!isPublicKey(key)) return;

    const entry: StoredEntry = {
      id: query.queryHash,
      version: CACHE_VERSION,
      updatedAt: query.state.dataUpdatedAt || Date.now(),
      queryKey: key,
      data: query.state.data,
    };

    void tx(db, "readwrite", (store) => store.put(entry)).catch(() => {
      /* penyimpanan penuh / private mode — abaikan */
    });
  });
}
