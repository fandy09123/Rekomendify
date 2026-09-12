import { o as __toESM } from "../_runtime.mjs";
import { _ as Link, b as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { c as Trash2, ct as CheckCheck, gt as BellOff, ht as Bell, vt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { r as PageShell } from "./rekomendify-O7_GABh0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifikasi-CZnh4aRk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
var INBOX_DB = "rekomendify-inbox";
var INBOX_STORE = "notifications";
var INBOX_EVENT = "rekomendify:inbox-updated";
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(INBOX_DB, 1);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains("notifications")) db.createObjectStore(INBOX_STORE, { keyPath: "id" }).createIndex("receivedAt", "receivedAt");
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
function tx(mode, fn) {
	return openDb().then((db) => new Promise((resolve, reject) => {
		const t = db.transaction(INBOX_STORE, mode);
		const req = fn(t.objectStore(INBOX_STORE));
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
		t.oncomplete = () => db.close();
	}));
}
var inboxSupported = () => typeof window !== "undefined" && "indexedDB" in window;
async function listNotifications() {
	if (!inboxSupported()) return [];
	try {
		return (await tx("readonly", (s) => s.getAll())).sort((a, b) => b.receivedAt - a.receivedAt).slice(0, 200);
	} catch {
		return [];
	}
}
async function markRead(id) {
	if (!inboxSupported()) return;
	try {
		const item = await tx("readonly", (s) => s.get(id));
		if (!item) return;
		await tx("readwrite", (s) => s.put({
			...item,
			read: true
		}));
		notifyInboxChanged();
	} catch {}
}
async function markAllRead() {
	const all = await listNotifications();
	await Promise.all(all.filter((n) => !n.read).map((n) => tx("readwrite", (s) => s.put({
		...n,
		read: true
	}))));
	notifyInboxChanged();
}
async function clearNotifications() {
	if (!inboxSupported()) return;
	try {
		await tx("readwrite", (s) => s.clear());
		notifyInboxChanged();
	} catch {}
}
function notifyInboxChanged() {
	if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(INBOX_EVENT));
}
/** Berlangganan perubahan inbox (dari SW maupun dari tab ini sendiri). */
function subscribeInbox(cb) {
	if (typeof window === "undefined") return () => {};
	const onSwMessage = (e) => {
		if (e.data?.type === "rekomendify:push") cb();
	};
	window.addEventListener(INBOX_EVENT, cb);
	navigator.serviceWorker?.addEventListener("message", onSwMessage);
	return () => {
		window.removeEventListener(INBOX_EVENT, cb);
		navigator.serviceWorker?.removeEventListener("message", onSwMessage);
	};
}
function formatRelative(ts) {
	const diff = Date.now() - ts;
	const m = Math.round(diff / 6e4);
	if (m < 1) return "baru saja";
	if (m < 60) return `${m} menit lalu`;
	const h = Math.round(m / 60);
	if (h < 24) return `${h} jam lalu`;
	const d = Math.round(h / 24);
	if (d < 7) return `${d} hari lalu`;
	try {
		return new Intl.DateTimeFormat("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric"
		}).format(new Date(ts));
	} catch {
		return "";
	}
}
function NotifikasiPage() {
	const router = useRouter();
	const [items, setItems] = (0, import_react.useState)([]);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	const refresh = (0, import_react.useCallback)(() => {
		listNotifications().then((rows) => {
			setItems(rows);
			setLoaded(true);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		refresh();
		return subscribeInbox(refresh);
	}, [refresh]);
	const open = async (n) => {
		await markRead(n.id);
		refresh();
		if (n.url?.startsWith("/")) router.navigate({ to: n.url });
	};
	const unread = items.filter((n) => !n.read).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-5 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Kembali"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Notifikasi"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: unread > 0 ? `${unread} belum dibaca` : "Riwayat notifikasi di perangkat ini"
				})] }), items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 pb-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => markAllRead().then(refresh),
						title: "Tandai semua dibaca",
						"aria-label": "Tandai semua dibaca",
						className: "rounded-full border border-border bg-card p-2 text-muted-foreground transition hover:text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => clearNotifications().then(refresh),
						title: "Hapus riwayat",
						"aria-label": "Hapus riwayat notifikasi",
						className: "rounded-full border border-border bg-card p-2 text-muted-foreground transition hover:text-destructive",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
				})]
			}),
			loaded && items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid place-items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, { className: "size-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 font-display text-xl",
						children: "Belum ada notifikasi"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Aktifkan tombol “Ikuti” di halaman wilayah untuk menerima kabar terbaru. Notifikasi yang masuk akan tersimpan di sini dan tetap bisa dibaca tanpa internet."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-5 space-y-2.5",
				children: items.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => open(n),
					className: `flex w-full gap-3 rounded-2xl border p-3.5 text-left transition ${n.read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${n.read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate font-display text-base leading-tight",
									children: n.title
								}), !n.read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 shrink-0 rounded-full bg-primary" })]
							}),
							n.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block line-clamp-2 text-sm text-foreground/80",
								children: n.body
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatRelative(n.receivedAt) }),
									n.regionSlug && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-muted px-2 py-0.5 uppercase tracking-wide",
										children: n.regionSlug
									}),
									n.type && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-muted px-2 py-0.5",
										children: n.type
									})
								]
							})
						]
					})]
				}) }, n.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-center text-xs text-muted-foreground",
				children: "Riwayat ini tersimpan lokal di perangkat Anda. Notifikasi baru tetap dikirim lewat Web Push dan membutuhkan koneksi internet."
			})
		]
	}) });
}
//#endregion
export { NotifikasiPage as component };
