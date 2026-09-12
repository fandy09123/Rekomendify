import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-khLhW5dO.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { Ct as LoaderCircle, U as ImagePlus, _t as ArrowRight, i as Upload, lt as Camera, n as X, st as Check, t as ZoomIn, vt as ArrowLeft, xt as Sparkles } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/image-uploader-DHQy0j7E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MAX_DIMENSION = 1600;
var QUALITY = .82;
/** Below this size a photo is already light enough; re-encoding gains little. */
var SKIP_BELOW_BYTES = 120 * 1024;
var webpSupport = null;
function supportsWebp() {
	if (webpSupport !== null) return webpSupport;
	try {
		const c = document.createElement("canvas");
		c.width = c.height = 1;
		webpSupport = c.toDataURL("image/webp").startsWith("data:image/webp");
	} catch {
		webpSupport = false;
	}
	return webpSupport;
}
/** Verifies real image content by magic bytes (rejects SVG / HTML / scripts). */
async function detectImageType(file) {
	const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
	if (b.length < 12) return null;
	if (b[0] === 255 && b[1] === 216 && b[2] === 255) return {
		ext: "jpg",
		contentType: "image/jpeg"
	};
	if (b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71 && b[4] === 13 && b[5] === 10 && b[6] === 26 && b[7] === 10) return {
		ext: "png",
		contentType: "image/png"
	};
	if (b[0] === 71 && b[1] === 73 && b[2] === 70 && b[3] === 56 && (b[4] === 55 || b[4] === 57) && b[5] === 97) return {
		ext: "gif",
		contentType: "image/gif"
	};
	if (b[0] === 82 && b[1] === 73 && b[2] === 70 && b[3] === 70 && b[8] === 87 && b[9] === 69 && b[10] === 66 && b[11] === 80) return {
		ext: "webp",
		contentType: "image/webp"
	};
	return null;
}
async function decode(file) {
	if (typeof createImageBitmap === "function") {
		const bmp = await createImageBitmap(file);
		return {
			source: bmp,
			width: bmp.width,
			height: bmp.height,
			close: () => bmp.close()
		};
	}
	const url = URL.createObjectURL(file);
	try {
		const img = await new Promise((resolve, reject) => {
			const el = new Image();
			el.onload = () => resolve(el);
			el.onerror = () => reject(/* @__PURE__ */ new Error("Gambar tidak dapat dibaca."));
			el.src = url;
		});
		return {
			source: img,
			width: img.naturalWidth,
			height: img.naturalHeight,
			close: () => URL.revokeObjectURL(url)
		};
	} catch (e) {
		URL.revokeObjectURL(url);
		throw e;
	}
}
/**
* Validates, resizes and re-encodes an image. Animated GIFs are passed through
* untouched (canvas would flatten them to a single frame).
*/
async function compressImage(file) {
	const detected = await detectImageType(file);
	if (!detected) throw new Error("File bukan gambar yang valid (JPG, PNG, WebP, atau GIF).");
	const passthrough = () => ({
		blob: file,
		ext: detected.ext,
		contentType: detected.contentType,
		width: 0,
		height: 0,
		originalBytes: file.size,
		bytes: file.size
	});
	if (detected.ext === "gif") return passthrough();
	let decoded = null;
	try {
		decoded = await decode(file);
		const scale = Math.min(1, MAX_DIMENSION / Math.max(decoded.width, decoded.height));
		if (scale === 1 && file.size < SKIP_BELOW_BYTES) return passthrough();
		const width = Math.max(1, Math.round(decoded.width * scale));
		const height = Math.max(1, Math.round(decoded.height * scale));
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");
		if (!ctx) return passthrough();
		ctx.imageSmoothingQuality = "high";
		ctx.drawImage(decoded.source, 0, 0, width, height);
		const useWebp = supportsWebp();
		const type = useWebp ? "image/webp" : "image/jpeg";
		const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
		if (!blob || blob.size === 0) return passthrough();
		if (blob.size >= file.size && scale === 1) return passthrough();
		return {
			blob,
			ext: useWebp ? "webp" : "jpg",
			contentType: type,
			width,
			height,
			originalBytes: file.size,
			bytes: blob.size
		};
	} catch {
		return passthrough();
	} finally {
		decoded?.close();
	}
}
function formatBytes(n) {
	if (n < 1024) return `${n} B`;
	if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
	return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
var BUCKET = "IMAGE";
var MAX_BYTES = 12 * 1024 * 1024;
var staged = /* @__PURE__ */ new Map();
var isStagedUrl = (url) => !!url && staged.has(url);
/** Compresses locally and returns a preview URL. Not uploaded yet. */
async function stageImage(file) {
	if (file.size === 0) throw new Error("File kosong.");
	if (file.size > MAX_BYTES) throw new Error("Ukuran maksimum 12MB.");
	const result = await compressImage(file);
	const objectUrl = URL.createObjectURL(result.blob);
	staged.set(objectUrl, {
		result,
		objectUrl
	});
	return {
		url: objectUrl,
		meta: {
			originalBytes: result.originalBytes,
			bytes: result.bytes,
			width: result.width,
			height: result.height
		}
	};
}
/** Drops a staged image that will never be saved. */
function discardStaged(url) {
	if (!url) return;
	if (!staged.get(url)) return;
	staged.delete(url);
	URL.revokeObjectURL(url);
}
var cachedRegionId = null;
async function getMyRegionId() {
	if (cachedRegionId) return cachedRegionId;
	const { data: auth } = await supabase.auth.getUser();
	if (!auth.user) throw new Error("Sesi berakhir. Silakan masuk kembali.");
	const { data, error } = await supabase.from("profiles").select("region_id, is_active").eq("id", auth.user.id).maybeSingle();
	if (error) throw new Error(error.message);
	if (!data?.is_active) throw new Error("Akun Anda belum diaktifkan, jadi belum bisa mengunggah gambar.");
	if (!data.region_id) throw new Error("Akun Anda belum terhubung ke wilayah mana pun.");
	cachedRegionId = data.region_id;
	return data.region_id;
}
/**
* Uploads with the admin's own session so `owner = auth.uid()` and the
* owner-scoped storage policies keep working. Storage RLS enforces:
* active admin + own region prefix + image extension.
*/
async function uploadBlob(blob, ext, contentType) {
	const key = `regions/${await getMyRegionId()}/${crypto.randomUUID()}.${ext}`;
	const { error } = await supabase.storage.from(BUCKET).upload(key, blob, {
		cacheControl: "31536000",
		upsert: false,
		contentType
	});
	if (error) {
		if (/row-level security|policy/i.test(error.message)) throw new Error("Upload ditolak: pastikan akun Anda sudah aktif dan terhubung ke wilayah.");
		throw new Error(error.message);
	}
	const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
	return data.publicUrl;
}
/** Uploads one staged image (or passes a real URL through untouched). */
async function commitUrl(url) {
	if (!url) return null;
	const s = staged.get(url);
	if (!s) return url;
	const publicUrl = await uploadBlob(s.result.blob, s.result.ext, s.result.contentType);
	discardStaged(url);
	return publicUrl;
}
/** Uploads every staged image in a list, preserving order. */
async function commitUrls(urls) {
	const out = [];
	for (const u of urls) {
		const committed = await commitUrl(u);
		if (committed) out.push(committed);
	}
	return out;
}
var storageKeyFromUrl = (url) => {
	const marker = `/object/public/${BUCKET}/`;
	const idx = url.indexOf(marker);
	if (idx === -1) return null;
	return decodeURIComponent(url.slice(idx + marker.length));
};
/** Best-effort removal of uploaded objects (owner-scoped by storage RLS). */
async function removeImagesByUrl(urls) {
	const keys = urls.filter((u) => !!u && !staged.has(u)).map(storageKeyFromUrl).filter((k) => !!k);
	if (keys.length === 0) return;
	await supabase.storage.from(BUCKET).remove(keys);
}
/**
* Deletes storage files that were dropped or replaced during an edit,
* keeping the free-plan bucket free of orphans.
*/
async function deleteRemovedImages(before, after) {
	const keep = new Set(after.filter(Boolean));
	const gone = before.filter((u) => !!u && !keep.has(u));
	if (gone.length === 0) return;
	await removeImagesByUrl(gone);
}
/** Pilihan rasio standar. value = null berarti mengikuti rasio asli gambar. */
var ASPECT_OPTIONS = [
	{
		key: "4:3",
		label: "4:3",
		value: 4 / 3
	},
	{
		key: "16:9",
		label: "16:9",
		value: 16 / 9
	},
	{
		key: "1:1",
		label: "1:1",
		value: 1
	},
	{
		key: "original",
		label: "Asli",
		value: null
	}
];
/**
* Pemotong gambar dengan pilihan rasio.
* Murni canvas + pointer events, tanpa dependensi tambahan.
* `lockAspect` dipakai mekanisme yang wajib satu rasio (mis. banner promosi 16:9).
*/
function ImageCropper({ file, lockAspect, defaultAspect = 4 / 3, onCancel, onCropped }) {
	const [src, setSrc] = (0, import_react.useState)(null);
	const [nat, setNat] = (0, import_react.useState)(null);
	const [zoom, setZoom] = (0, import_react.useState)(1);
	const [offset, setOffset] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [choice, setChoice] = (0, import_react.useState)(lockAspect ? "locked" : ASPECT_OPTIONS.find((o) => o.value === defaultAspect)?.key ?? "4:3");
	const frameRef = (0, import_react.useRef)(null);
	const drag = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const url = URL.createObjectURL(file);
		setSrc(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);
	const selected = ASPECT_OPTIONS.find((o) => o.key === choice) ?? null;
	const naturalAspect = nat ? nat.w / nat.h : 4 / 3;
	const aspect = lockAspect ?? selected?.value ?? naturalAspect;
	(0, import_react.useEffect)(() => {
		setZoom(1);
		setOffset({
			x: 0,
			y: 0
		});
	}, [choice]);
	const frameW = frameRef.current?.clientWidth ?? 0;
	const frameH = frameW / aspect;
	const scale = (nat && frameW ? Math.max(frameW / nat.w, frameH / nat.h) : 1) * zoom;
	const dispW = nat ? nat.w * scale : 0;
	const dispH = nat ? nat.h * scale : 0;
	const clamp = (0, import_react.useCallback)((o) => ({
		x: Math.min(0, Math.max(frameW - dispW, o.x)),
		y: Math.min(0, Math.max(frameH - dispH, o.y))
	}), [
		frameW,
		frameH,
		dispW,
		dispH
	]);
	(0, import_react.useEffect)(() => {
		setOffset((o) => clamp(o));
	}, [clamp]);
	const onPointerDown = (e) => {
		e.target.setPointerCapture(e.pointerId);
		drag.current = {
			x: e.clientX,
			y: e.clientY,
			ox: offset.x,
			oy: offset.y
		};
	};
	const onPointerMove = (e) => {
		if (!drag.current) return;
		const d = drag.current;
		setOffset(clamp({
			x: d.ox + (e.clientX - d.x),
			y: d.oy + (e.clientY - d.y)
		}));
	};
	const onPointerUp = () => {
		drag.current = null;
	};
	const apply = async () => {
		if (!src || !nat || !frameW) return;
		setBusy(true);
		try {
			const img = new Image();
			img.src = src;
			await img.decode();
			const outW = Math.min(1600, Math.max(640, Math.round(nat.w)));
			const outH = Math.round(outW / aspect);
			const canvas = document.createElement("canvas");
			canvas.width = outW;
			canvas.height = outH;
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("Canvas tidak tersedia");
			const sx = -offset.x / scale;
			const sy = -offset.y / scale;
			const sw = frameW / scale;
			const sh = frameH / scale;
			ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
			const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", .92));
			if (!blob) throw new Error("Gagal memotong gambar");
			const suffix = lockAspect ? "16x9" : choice.replace(":", "x");
			const name = file.name.replace(/\.[^.]+$/, "") + `-${suffix}.jpg`;
			onCropped(new File([blob], name, { type: "image/jpeg" }));
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4",
		onClick: onCancel,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: (e) => e.stopPropagation(),
			className: "max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-card p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "Sesuaikan gambar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: lockAspect ? "Rasio dikunci 16:9 agar banner tampil konsisten." : "Pilih rasio, lalu geser dan atur perbesaran agar bagian penting tetap terlihat."
				}),
				!lockAspect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: ASPECT_OPTIONS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setChoice(o.key),
						"aria-pressed": choice === o.key,
						className: `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${choice === o.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`,
						children: o.label
					}, o.key))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: frameRef,
					className: "relative mt-4 w-full touch-none select-none overflow-hidden rounded-2xl border border-border bg-muted",
					style: { aspectRatio: String(aspect) },
					onPointerDown,
					onPointerMove,
					onPointerUp,
					onPointerCancel: onPointerUp,
					children: [src && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src,
						alt: "Pratinjau",
						draggable: false,
						onLoad: (e) => {
							const el = e.currentTarget;
							setNat({
								w: el.naturalWidth,
								h: el.naturalHeight
							});
						},
						className: "absolute left-0 top-0 max-w-none origin-top-left",
						style: {
							width: dispW || void 0,
							height: dispH || void 0,
							transform: `translate(${offset.x}px, ${offset.y}px)`
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3",
						children: Array.from({ length: 9 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "border border-background/25" }, i))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { className: "size-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 1,
						max: 3,
						step: .01,
						value: zoom,
						onChange: (e) => setZoom(Number(e.target.value)),
						className: "w-full accent-[var(--primary)]",
						"aria-label": "Perbesaran gambar"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onCancel,
						className: "flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), " Batal"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: busy || !nat,
						onClick: apply,
						className: "flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }),
							" ",
							busy ? "Memproses…" : "Gunakan"
						]
					})]
				})
			]
		})
	});
}
var ACCEPT = "image/png,image/jpeg,image/jpg,image/webp,image/gif";
function savingsLabel(meta) {
	if (!meta || meta.bytes >= meta.originalBytes) return null;
	const pct = Math.round((1 - meta.bytes / meta.originalBytes) * 100);
	if (pct < 3) return null;
	return `Dikompres ${formatBytes(meta.originalBytes)} → ${formatBytes(meta.bytes)} (−${pct}%)`;
}
function ImageUploader({ value, onChange, label = "Gambar", hint, lockAspect, defaultAspect }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [drag, setDrag] = (0, import_react.useState)(false);
	const [meta, setMeta] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(null);
	const inputRef = (0, import_react.useRef)(null);
	const cameraRef = (0, import_react.useRef)(null);
	const handleFiles = (0, import_react.useCallback)((files) => {
		if (!files || !files[0]) return;
		setPending(files[0]);
	}, []);
	const stage = (0, import_react.useCallback)(async (file) => {
		setBusy(true);
		try {
			const staged = await stageImage(file);
			if (isStagedUrl(value)) discardStaged(value);
			setMeta(staged.meta);
			onChange(staged.url);
		} catch (e) {
			toast.error(e.message ?? "Gambar gagal diproses");
		} finally {
			setBusy(false);
		}
	}, [onChange, value]);
	const clear = () => {
		if (isStagedUrl(value)) discardStaged(value);
		setMeta(null);
		onChange(null);
	};
	const savings = savingsLabel(meta);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
			children: label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onDragOver: (e) => {
				e.preventDefault();
				setDrag(true);
			},
			onDragLeave: () => setDrag(false),
			onDrop: (e) => {
				e.preventDefault();
				setDrag(false);
				handleFiles(e.dataTransfer.files);
			},
			className: `mt-1 relative overflow-hidden rounded-2xl border-2 border-dashed p-2 transition ${drag ? "border-primary bg-primary/5" : "border-border bg-muted/30"}`,
			children: [
				value ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-stretch gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: value,
						alt: "",
						className: "h-24 w-24 shrink-0 rounded-xl object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-1 flex-col justify-between gap-2 p-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [isStagedUrl(value) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3" }), " Siap disimpan"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "line-clamp-2 break-all text-xs text-muted-foreground",
								children: value
							}), savings && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[11px] text-muted-foreground",
								children: savings
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => cameraRef.current?.click(),
									disabled: busy,
									"aria-label": "Ambil foto ulang dengan kamera",
									className: "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold hover:bg-accent/10 disabled:opacity-60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-3.5" }), " Ambil ulang"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => inputRef.current?.click(),
									disabled: busy,
									"aria-label": "Pilih gambar lain dari galeri",
									className: "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold hover:bg-accent/10 disabled:opacity-60",
									children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-3.5" }), " Galeri"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: clear,
									disabled: busy,
									"aria-label": "Hapus gambar",
									className: "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }), " Hapus"]
								})
							]
						})]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3 rounded-xl px-4 py-7 text-center",
					children: [
						busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-6 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: busy ? "Mengompres…" : "Tambahkan gambar"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex w-full max-w-xs flex-col gap-2 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => cameraRef.current?.click(),
								disabled: busy,
								"aria-label": "Ambil foto dengan kamera",
								className: "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
									className: "size-4",
									"aria-hidden": "true"
								}), " Ambil Foto"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => inputRef.current?.click(),
								disabled: busy,
								"aria-label": "Pilih gambar dari galeri",
								className: "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold hover:bg-accent/10 disabled:opacity-60",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
									className: "size-4",
									"aria-hidden": "true"
								}), " Pilih dari Galeri"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: hint ?? (lockAspect ? "JPG, PNG, WebP · rasio 16:9 · dikompres otomatis" : "JPG, PNG, WebP · pilih rasio saat memotong")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: "Bisa juga seret gambar ke area ini."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					type: "file",
					accept: ACCEPT,
					className: "hidden",
					onChange: (e) => {
						handleFiles(e.target.files);
						if (inputRef.current) inputRef.current.value = "";
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: cameraRef,
					type: "file",
					accept: "image/*",
					capture: "environment",
					className: "hidden",
					onChange: (e) => {
						handleFiles(e.target.files);
						if (cameraRef.current) cameraRef.current.value = "";
					}
				})
			]
		}),
		pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageCropper, {
			file: pending,
			lockAspect,
			defaultAspect,
			onCancel: () => setPending(null),
			onCropped: (f) => {
				setPending(null);
				stage(f);
			}
		})
	] });
}
function GalleryUploader({ value, onChange, max = 5, label = "Galeri (maks 5 gambar)" }) {
	const list = value ?? [];
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [queue, setQueue] = (0, import_react.useState)([]);
	const inputRef = (0, import_react.useRef)(null);
	const cameraRef = (0, import_react.useRef)(null);
	const canAdd = list.length < max;
	const addFiles = (0, import_react.useCallback)((files) => {
		if (!files || files.length === 0) return;
		const slots = max - list.length;
		const picked = Array.from(files).slice(0, slots);
		if (Array.from(files).length > slots) toast.message(`Hanya ${slots} gambar yang ditambahkan.`, { description: `Maksimum ${max} gambar.` });
		setQueue((q) => [...q, ...picked]);
	}, [list.length, max]);
	const stageCropped = (0, import_react.useCallback)(async (file) => {
		setBusy(true);
		try {
			const staged = await stageImage(file);
			onChange([...list, staged.url]);
		} catch (e) {
			toast.error(e.message ?? "Gambar gagal diproses");
		} finally {
			setBusy(false);
		}
	}, [list, onChange]);
	const remove = (i) => {
		discardStaged(list[i]);
		onChange(list.filter((_, idx) => idx !== i));
	};
	const move = (i, dir) => {
		const j = i + dir;
		if (j < 0 || j >= list.length) return;
		const next = [...list];
		[next[i], next[j]] = [next[j], next[i]];
		onChange(next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
			children: label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onDragOver: (e) => {
				if (canAdd) e.preventDefault();
			},
			onDrop: (e) => {
				e.preventDefault();
				addFiles(e.dataTransfer.files);
			},
			className: "mt-1 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-3",
			children: [
				list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-center text-xs text-muted-foreground",
					children: "Belum ada gambar galeri."
				}),
				list.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5",
					children: list.map((url, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: url,
								alt: `Gambar galeri ${i + 1}`,
								className: "size-full object-cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => remove(i),
								"aria-label": `Hapus gambar ${i + 1}`,
								title: "Hapus gambar",
								className: "absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-foreground/70 text-background shadow-soft backdrop-blur transition hover:bg-destructive hover:text-destructive-foreground active:scale-90",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
							}),
							isStagedUrl(url) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute left-1 top-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground",
								title: "Siap disimpan",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white",
									children: i + 1
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => move(i, -1),
										disabled: i === 0,
										"aria-label": `Geser gambar ${i + 1} ke kiri`,
										className: "grid size-6 place-items-center rounded-full bg-black/60 text-white disabled:opacity-30",
										title: "Geser kiri",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => move(i, 1),
										disabled: i === list.length - 1,
										"aria-label": `Geser gambar ${i + 1} ke kanan`,
										className: "grid size-6 place-items-center rounded-full bg-black/60 text-white disabled:opacity-30",
										title: "Geser kanan",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3" })
									})]
								})]
							})
						]
					}, url + i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => cameraRef.current?.click(),
						disabled: busy || !canAdd,
						"aria-label": "Ambil foto galeri dengan kamera",
						className: "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-accent/10 disabled:opacity-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
							className: "size-4",
							"aria-hidden": "true"
						}), " Ambil Foto"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => inputRef.current?.click(),
						disabled: busy || !canAdd,
						"aria-label": "Pilih gambar galeri dari galeri perangkat",
						className: "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-accent/10 disabled:opacity-50",
						children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
							className: "size-4",
							"aria-hidden": "true"
						}), busy ? "Mengompres…" : canAdd ? `Galeri (${list.length}/${max})` : `Batas ${max} gambar`]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					type: "file",
					accept: ACCEPT,
					multiple: true,
					className: "hidden",
					onChange: (e) => {
						addFiles(e.target.files);
						if (inputRef.current) inputRef.current.value = "";
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: cameraRef,
					type: "file",
					accept: "image/*",
					capture: "environment",
					className: "hidden",
					onChange: (e) => {
						addFiles(e.target.files);
						if (cameraRef.current) cameraRef.current.value = "";
					}
				})
			]
		}),
		queue[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageCropper, {
			file: queue[0],
			onCancel: () => setQueue((q) => q.slice(1)),
			onCropped: (f) => {
				setQueue((q) => q.slice(1));
				stageCropped(f);
			}
		})
	] });
}
//#endregion
export { deleteRemovedImages as a, commitUrls as i, ImageUploader as n, removeImagesByUrl as o, commitUrl as r, GalleryUploader as t };
