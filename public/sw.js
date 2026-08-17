/**
 * Rekomendify — Service Worker
 * Strategi:
 *   - Navigation (HTML)   : network-first, fallback ke offline page
 *   - Static assets       : cache-first (JS, CSS, images, fonts)
 *   - API/Supabase/server function: network-only (tidak di-cache)
 */

// v4: showNotification() dipanggil sebelum penulisan inbox pada handler push.
const CACHE_VERSION = "v4";
const STATIC_CACHE = `rekomendify-static-${CACHE_VERSION}`;
const FONT_CACHE   = `rekomendify-fonts-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Rekomendify — Offline</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100vh;display:flex;align-items:center;justify-content:center;
         background:#fbf7ef;font-family:system-ui,sans-serif;padding:1rem}
    .card{max-width:20rem;text-align:center;background:#fff;border-radius:1.5rem;
          padding:2rem;box-shadow:0 4px 20px -8px rgba(0,0,0,.12)}
    h1{font-size:1.5rem;color:#c2603a;margin-bottom:.5rem}
    p{font-size:.875rem;color:#666;line-height:1.6}
    button{margin-top:1.5rem;padding:.625rem 1.5rem;border-radius:9999px;
           border:none;background:#c2603a;color:#fff;font-size:.875rem;
           font-weight:600;cursor:pointer}
  </style>
</head>
<body>
  <div class="card">
    <h1>📶 Tanpa Koneksi</h1>
    <p>Sepertinya Anda sedang offline. Hubungkan ke internet lalu coba lagi.</p>
    <button onclick="location.reload()">Coba Lagi</button>
  </div>
</body>
</html>`;

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => {
        // Aset mungkin belum tersedia saat dev; abaikan kegagalan
      })
    )
  );
  // Ambil alih segera tanpa menunggu tab lama ditutup
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== FONT_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Lewati semua request yang bukan http: atau https: (misalnya chrome-extension://)
  // CacheStorage.put() akan melempar DOMException untuk skema non-HTTP.
  if (!url.protocol.startsWith("http")) return;

  // Lewati request non-GET dan request ke origin lain selain Google Fonts
  if (request.method !== "GET") return;

  // API Supabase dan TanStack server function → network-only, jangan cache.
  // Server function menggunakan endpoint /_serverFn/* (bukan /_server/*) dan
  // header x-tsr-serverFn. Jika ikut strategi cache-first, data SSR awal akan
  // tertimpa respons GET lama saat hydration React Query berjalan di klien.
  if (
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("supabase.com") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_server/") ||
    url.pathname.startsWith("/_serverFn/") ||
    request.headers.get("x-tsr-serverFn") === "true"
  ) {
    return;
  }

  // Google Fonts → stale-while-revalidate
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request).then((resp) => {
            if (resp.ok) cache.put(request, resp.clone());
            return resp;
          });
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Navigasi HTML → network-first, fallback offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(OFFLINE_HTML, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
      )
    );
    return;
  }

  // Aset statis (JS, CSS, images) → cache-first
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((resp) => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return resp;
        })
    )
  );
});

// ── Inbox notifikasi lokal (IndexedDB) ───────────────────────────────────────
// Ditulis dari dalam Service Worker supaya riwayat tetap terisi walau tidak ada
// tab Rekomendify yang terbuka saat push tiba. Tidak menyimpan data sensitif.
const INBOX_DB = "rekomendify-inbox";
const INBOX_STORE = "notifications";
const INBOX_LIMIT = 200;

function inboxOpen() {
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

async function inboxSave(item) {
  const db = await inboxOpen();
  await new Promise((resolve, reject) => {
    const t = db.transaction(INBOX_STORE, "readwrite");
    t.objectStore(INBOX_STORE).put(item);
    t.oncomplete = resolve;
    t.onerror = () => reject(t.error);
  });
  // Pangkas riwayat agar penyimpanan perangkat tidak tumbuh tanpa batas.
  await new Promise((resolve) => {
    const t = db.transaction(INBOX_STORE, "readwrite");
    const store = t.objectStore(INBOX_STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      const all = (req.result || []).sort((a, b) => b.receivedAt - a.receivedAt);
      for (const old of all.slice(INBOX_LIMIT)) store.delete(old.id);
    };
    t.oncomplete = resolve;
    t.onerror = resolve;
  });
  db.close();
}

async function notifyClients(item) {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of clients) client.postMessage({ type: "rekomendify:push", item });
}

// ── Web Push ─────────────────────────────────────────────────────────────────
// Handler push berdiri sendiri di worker utama (scope "/"), tidak bergantung
// pada React maupun tab yang terbuka.
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Rekomendify", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Rekomendify";
  const url = payload.url || "/";
  const tag = payload.tag || "rekomendify";
  const options = {
    body: payload.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag,
    renotify: true,
    data: { url },
  };

  // URUTAN PENTING (Chrome Android):
  // showNotification() dipanggil PALING AWAL. Bila worker menunggu IndexedDB
  // lebih dulu, sistem bisa mematikan worker sebelum notifikasi tampil —
  // gejalanya notifikasi baru muncul saat aplikasi dibuka kembali.
  // Penulisan inbox dilakukan setelahnya dan kegagalannya diabaikan.
  event.waitUntil(
    (async () => {
      try {
        await self.registration.showNotification(title, options);
      } catch {
        /* jangan pernah membuat handler push gagal total */
      }

      const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        body: payload.body || "",
        url,
        tag,
        regionSlug: payload.regionSlug || null,
        type: payload.entityType || payload.type || null,
        receivedAt: Date.now(),
        read: false,
      };
      try {
        await inboxSave(item);
      } catch {
        /* IndexedDB tidak tersedia — abaikan, notifikasi sudah tampil */
      }
      try {
        await notifyClients(item);
      } catch {
        /* abaikan */
      }
    })(),
  );
});

// Sebagian browser merotasi endpoint push. Berlangganan ulang dengan kunci yang
// sama; halaman akan menyinkronkan endpoint baru ke server saat dibuka lagi.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const key = event.oldSubscription?.options?.applicationServerKey;
        if (!key) return;
        await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      } catch {
        /* abaikan: pengguna akan disinkronkan ulang saat membuka aplikasi */
      }
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Fokuskan tab Rekomendify yang sudah terbuka agar tidak menumpuk window.
      for (const client of clientList) {
        if (new URL(client.url).origin === self.location.origin && "focus" in client) {
          return client.navigate ? client.navigate(target).then((c) => c && c.focus()) : client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
