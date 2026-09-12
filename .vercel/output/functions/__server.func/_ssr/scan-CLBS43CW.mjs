import { o as __toESM } from "../_runtime.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { S as QrCode, lt as Camera, n as X, yt as TriangleAlert } from "../_libs/lucide-react.mjs";
import { r as PageShell } from "./rekomendify-O7_GABh0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-CLBS43CW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ScanPage() {
	const navigate = useNavigate();
	const containerId = "qr-reader";
	const scannerRef = (0, import_react.useRef)(null);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [armed, setArmed] = (0, import_react.useState)(false);
	const [errorMsg, setErrorMsg] = (0, import_react.useState)(null);
	const [rejected, setRejected] = (0, import_react.useState)(null);
	const stoppedRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!armed) return;
		let cancelled = false;
		stoppedRef.current = false;
		(async () => {
			try {
				setStatus("starting");
				const mod = await import("../_libs/html5-qrcode.mjs").then((n) => n.t);
				if (cancelled) return;
				const { Html5Qrcode } = mod;
				const scanner = new Html5Qrcode(containerId, { verbose: false });
				scannerRef.current = scanner;
				await scanner.start({ facingMode: "environment" }, {
					fps: 10,
					qrbox: {
						width: 240,
						height: 240
					}
				}, (decodedText) => handleDecoded(decodedText), () => {});
				if (!cancelled) setStatus("scanning");
			} catch (e) {
				console.error(e);
				if (!cancelled) {
					setErrorMsg(e?.message || "Tidak dapat mengakses kamera.");
					setStatus("error");
				}
			}
		})();
		return () => {
			cancelled = true;
			stopScanner();
		};
	}, [armed]);
	async function stopScanner() {
		if (stoppedRef.current) return;
		stoppedRef.current = true;
		const s = scannerRef.current;
		if (!s) return;
		try {
			await s.stop();
			await s.clear();
		} catch {}
	}
	async function handleDecoded(text) {
		if (rejected) return;
		let url = null;
		try {
			url = new URL(text);
		} catch {
			await stopScanner();
			setRejected({
				url: text,
				reason: "QR ini bukan tautan Rekomendify."
			});
			return;
		}
		const currentHost = window.location.hostname.replace(/^www\./, "").toLowerCase();
		if (url.hostname.replace(/^www\./, "").toLowerCase() !== currentHost) {
			await stopScanner();
			setRejected({
				url: text,
				reason: `QR berasal dari domain "${url.hostname}", bukan dari website Rekomendify resmi.`
			});
			return;
		}
		await stopScanner();
		navigate({
			to: url.pathname + url.search + url.hash || "/",
			replace: true
		});
	}
	async function retry() {
		setRejected(null);
		setErrorMsg(null);
		stoppedRef.current = false;
		scannerRef.current = null;
		setStatus("idle");
		setTimeout(() => {
			const evt = new Event("scan-restart");
			window.dispatchEvent(evt);
		}, 50);
		window.location.reload();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-5 pt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl",
					children: "Scan QR"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Arahkan kamera ke QR resmi Rekomendify. QR dari domain lain akan ditolak."
			}),
			!armed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-3xl border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-10 shrink-0 place-items-center rounded-2xl bg-accent/12 text-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: "Rekomendify membutuhkan kamera untuk memindai QR Code."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-relaxed text-muted-foreground",
							children: "Kamera hanya aktif di halaman ini dan gambarnya diproses langsung di perangkat Anda — tidak diunggah ke mana pun. Setelah menekan tombol, browser akan menanyakan izin."
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setArmed(true),
					className: "mt-4 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground",
					children: "Buka Kamera"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 overflow-hidden rounded-3xl border border-border bg-black",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					id: containerId,
					className: "aspect-square w-full"
				})
			}),
			status === "starting" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-center text-sm text-muted-foreground",
				children: "Menyiapkan kamera…"
			}),
			status === "scanning" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-center text-sm text-muted-foreground",
				children: "Menunggu QR…"
			}),
			status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold text-destructive",
						children: "Kamera tidak dapat diakses"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted-foreground",
						children: errorMsg
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-relaxed text-muted-foreground",
						children: "Izin kamera mungkin sedang ditolak. Buka pengaturan situs di browser (ikon gembok pada address bar → Kamera) lalu izinkan, dan pastikan situs dibuka lewat HTTPS. Anda tetap bisa membuka wilayah tanpa memindai QR."
					})
				]
			})
		]
	}), rejected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-end bg-black/50 sm:place-items-center",
		onClick: retry,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-t-3xl bg-card p-6 sm:rounded-3xl",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-10 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg",
								children: "QR tidak valid"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: rejected.reason
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 break-all rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground",
								children: rejected.url
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: "Anda tetap berada di dalam Rekomendify. Kami tidak membuka tautan eksternal."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: retry,
						"aria-label": "Tutup",
						className: "grid size-8 place-items-center rounded-full hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: retry,
				className: "mt-5 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground",
				children: "Coba pindai lagi"
			})]
		})
	})] });
}
//#endregion
export { ScanPage as component };
