import { o as __toESM } from "../_runtime.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { At as ChartColumn, Ct as LoaderCircle, F as Mail, K as FileText, P as MapPin, W as HardDrive, ht as Bell, it as ChevronUp, lt as Camera, ot as ChevronDown, p as ShieldCheck, st as Check, vt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as PageShell } from "./rekomendify-O7_GABh0.mjs";
import { t as usePushSubscription } from "./use-push-subscription-BAogReUD.mjs";
import { n as PrivacyPolicyModal, o as resetOnboarding, t as PRIVACY_POLICY } from "./privacy-policy-modal-0lwoT88L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/privasi-CRE0S8VE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Membaca status izin perangkat tanpa pernah memicu permintaan izin.
* `navigator.permissions` tidak ada di sebagian Safari lama → "unknown".
*/
function useDevicePermission(name) {
	const [state, setState] = (0, import_react.useState)("unknown");
	(0, import_react.useEffect)(() => {
		let alive = true;
		let status = null;
		if (!(name === "geolocation" ? typeof navigator !== "undefined" && "geolocation" in navigator : typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia)) {
			setState("unsupported");
			return;
		}
		(async () => {
			try {
				if (!navigator.permissions?.query) {
					if (alive) setState("unknown");
					return;
				}
				status = await navigator.permissions.query({ name });
				if (!alive) return;
				setState(status.state);
				status.onchange = () => setState(status.state);
			} catch {
				if (alive) setState("unknown");
			}
		})();
		return () => {
			alive = false;
			if (status) status.onchange = null;
		};
	}, [name]);
	return state;
}
function StatusPill({ state }) {
	const s = {
		granted: {
			label: "Diizinkan",
			cls: "bg-primary/10 text-primary"
		},
		denied: {
			label: "Ditolak",
			cls: "bg-destructive/10 text-destructive"
		},
		prompt: {
			label: "Belum diminta",
			cls: "bg-muted text-muted-foreground"
		},
		unsupported: {
			label: "Tidak didukung",
			cls: "bg-muted text-muted-foreground"
		},
		unknown: {
			label: "Diminta saat dipakai",
			cls: "bg-muted text-muted-foreground"
		}
	}[state];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.cls}`,
		children: s.label
	});
}
function Card({ icon: Icon, title, state, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-8 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "min-w-0 flex-1 truncate font-display text-base",
					children: title
				}),
				state && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { state })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground",
			children
		})]
	});
}
function Privacy() {
	const push = usePushSubscription();
	const geo = useDevicePermission("geolocation");
	const cam = useDevicePermission("camera");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [modalOpen, setModalOpen] = (0, import_react.useState)(false);
	const [showFullDocInline, setShowFullDocInline] = (0, import_react.useState)(false);
	const notifState = push.permission === "unsupported" ? "unsupported" : push.permission === "default" ? "prompt" : push.permission;
	const enable = async () => {
		setBusy(true);
		const ok = await push.enable();
		setBusy(false);
		if (ok) toast.success("Notifikasi aktif di perangkat ini.");
		else toast.error(push.error ?? "Notifikasi belum bisa diaktifkan.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-5 pt-6 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/settings",
				className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Pengaturan"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Privasi & Izin"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary",
					children: ["v", PRIVACY_POLICY.lastUpdated]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted-foreground",
				children: "Rekomendify menjunjung tinggi transparansi dan minimisasi data. Semua izin bersifat opsional — aplikasi tetap dapat digunakan tanpa mengaktifkannya."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-base font-semibold text-foreground",
							children: "Dokumen Kebijakan Privasi Lengkap"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs leading-relaxed text-muted-foreground",
							children: "Mencakup 31 pasal resmi untuk publikasi website, PWA, Android Capacitor, Supabase, & Google Play Console."
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row gap-2 pt-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setModalOpen(true),
						className: "flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), "Buka Popup Kebijakan"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setShowFullDocInline(!showFullDocInline),
						className: "inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors",
						children: [showFullDocInline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" }), showFullDocInline ? "Sembunyikan Pasal" : "Baca di Sini"]
					})]
				})]
			}),
			showFullDocInline && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-2xl border border-border bg-card p-4 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground",
						children: "31 Pasal Kebijakan Privasi"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: PRIVACY_POLICY.lastUpdated
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs leading-relaxed",
					children: PRIVACY_POLICY.sections.map((sec) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 border-b border-border/50 pb-3 last:border-b-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-semibold text-foreground text-sm",
								children: [
									sec.number,
									". ",
									sec.title
								]
							}),
							sec.paragraphs.map((p, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground",
								children: p
							}, idx)),
							sec.bullets && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "list-disc pl-4 space-y-1 text-muted-foreground",
								children: sec.bullets.map((b, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: b }, idx))
							})
						]
					}, sec.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: "Status Izin Perangkat Saat Ini"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						icon: Bell,
						title: "Notifikasi",
						state: push.ready ? notifState : "unknown",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Digunakan agar Anda menerima informasi dan pengumuman dari wilayah yang Anda ikuti." }),
							push.ready && notifState === "prompt" && push.supported && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: enable,
								disabled: busy || push.busy,
								className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60",
								children: [busy || push.busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }), "Aktifkan Notifikasi"]
							}),
							notifState === "granted" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), " Notifikasi aktif"]
							}),
							notifState === "denied" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs",
								children: "Izin sedang dimatikan. Buka pengaturan situs di browser (ikon gembok di address bar → Notifikasi), lalu izinkan. Di Android, bisa juga lewat Setelan → Aplikasi → Notifikasi."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						icon: MapPin,
						title: "Lokasi",
						state: geo,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Digunakan untuk mengurutkan tempat terdekat ketika Anda memilih “Terdekat” di halaman Jelajah atau kategori. Posisi Anda diproses secara lokal di perangkat untuk menghitung jarak dan tidak dikirim ke server." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs",
							children: "Izin diminta hanya saat Anda menekan tombol tersebut."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						icon: Camera,
						title: "Kamera",
						state: cam,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Digunakan hanya ketika Anda membuka fitur Scan QR. Gambar kamera diproses secara langsung pada perangkat Anda untuk membaca kode QR dan tidak diunggah ke server." })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						icon: HardDrive,
						title: "Penyimpanan di Perangkat",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Beberapa informasi teknis disimpan di perangkat Anda untuk mendukung performa offline dan PWA:" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "list-disc space-y-1 pl-5 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Wilayah terakhir yang dikunjungi;" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Tempat yang Anda simpan (favorit);" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Riwayat notifikasi lokal agar dapat dibaca tanpa koneksi internet;" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Status onboarding & preferensi aplikasi;" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Sesi masuk khusus bagi pengelola wilayah (admin)." })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs",
								children: "Menghapus data situs pada browser akan menghapus data lokal ini."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						icon: ChartColumn,
						title: "Statistik Kunjungan & Agregasi",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Mencatat statistik anonim sederhana seperti jumlah kunjungan wilayah/tempat dan interaksi tombol (WhatsApp, Peta, atau Simpan) untuk evaluasi kualitas pemandu. Tidak mencatat nama, nomor HP, atau koordinat presisi pengguna." })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => {
					resetOnboarding();
					toast.success("Panduan izin akan muncul kembali saat halaman dimuat ulang.");
				},
				className: "mt-5 w-full rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors",
				children: "Tampilkan Lagi Panduan Izin (Onboarding)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-2xl border border-border bg-card p-4 space-y-2 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold text-sm text-foreground",
						children: "Kontak Pengelola Privasi"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-foreground",
								children: PRIVACY_POLICY.contact.managerName
							}),
							" (",
							PRIVACY_POLICY.appName,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 text-muted-foreground pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `mailto:${PRIVACY_POLICY.contact.email}`,
							className: "hover:underline text-foreground",
							children: PRIVACY_POLICY.contact.email
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-1.5 text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 shrink-0 text-primary mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: PRIVACY_POLICY.contact.address })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-center text-xs leading-relaxed text-muted-foreground",
				children: "Pengaturan izin sepenuhnya ada di perangkat Anda dan dapat diubah kapan saja."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivacyPolicyModal, {
				open: modalOpen,
				onOpenChange: setModalOpen
			})
		]
	}) });
}
//#endregion
export { Privacy as component };
