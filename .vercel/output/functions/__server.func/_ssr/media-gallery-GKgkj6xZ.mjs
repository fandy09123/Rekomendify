import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { T as Play } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/media-gallery-GKgkj6xZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function youtubeId(url) {
	try {
		const u = new URL(url);
		if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
		if (u.hostname.includes("youtube.com")) {
			if (u.pathname === "/watch") return u.searchParams.get("v");
			const m = u.pathname.match(/\/(embed|shorts)\/([^/?#]+)/);
			if (m) return m[2];
		}
	} catch {}
	return null;
}
function MediaGallery({ photo, gallery, youtube, alt }) {
	const ytId = youtube ? youtubeId(youtube) : null;
	const slides = (0, import_react.useMemo)(() => {
		const imgs = [photo, ...gallery ?? []].filter((u) => !!u);
		const items = Array.from(new Set(imgs)).map((src) => ({
			kind: "image",
			src
		}));
		if (ytId) items.push({
			kind: "video",
			src: ytId,
			poster: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
		});
		return items;
	}, [
		photo,
		gallery,
		ytId
	]);
	const [idx, setIdx] = (0, import_react.useState)(0);
	const [playingVideo, setPlayingVideo] = (0, import_react.useState)(false);
	const drag = (0, import_react.useRef)(null);
	const [portrait, setPortrait] = (0, import_react.useState)({});
	if (slides.length === 0) return null;
	const current = slides[Math.min(idx, slides.length - 1)];
	const isPortrait = current.kind === "image" && portrait[current.src];
	const markRatio = (img) => {
		const src = img.currentSrc || img.src;
		const isTall = img.naturalHeight > img.naturalWidth * 1.05;
		setPortrait((p) => p[src] === isTall ? p : {
			...p,
			[src]: isTall
		});
	};
	const go = (n) => {
		setPlayingVideo(false);
		setIdx((prev) => (prev + n + slides.length) % slides.length);
	};
	const onPointerDown = (event) => {
		if (slides.length < 2) return;
		drag.current = {
			x: event.clientX,
			y: event.clientY,
			locked: null
		};
	};
	const onPointerMove = (event) => {
		const activeDrag = drag.current;
		if (!activeDrag) return;
		const dx = event.clientX - activeDrag.x;
		const dy = event.clientY - activeDrag.y;
		if (!activeDrag.locked) {
			if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
			activeDrag.locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
		}
	};
	const endDrag = (event) => {
		const activeDrag = drag.current;
		drag.current = null;
		if (activeDrag?.locked !== "x") return;
		const dx = event.clientX - activeDrag.x;
		if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `relative w-full overflow-hidden bg-muted transition-[aspect-ratio] duration-300 ${isPortrait ? "aspect-[3/4] sm:aspect-[4/5]" : "aspect-[4/3] sm:aspect-[16/9]"}`,
			style: { touchAction: "pan-y" },
			onPointerDown,
			onPointerMove,
			onPointerUp: endDrag,
			onPointerCancel: () => {
				drag.current = null;
			},
			children: current.kind === "image" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [isPortrait && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: current.src,
				alt: "",
				"aria-hidden": true,
				className: "absolute inset-0 size-full scale-110 object-cover blur-2xl opacity-60"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: current.src,
				alt,
				ref: (el) => {
					if (el?.complete && el.naturalWidth) markRatio(el);
				},
				onLoad: (e) => markRatio(e.currentTarget),
				className: `relative size-full ${isPortrait ? "object-contain" : "object-cover"}`
			})] }) : playingVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
				src: `https://www.youtube.com/embed/${current.src}?autoplay=1&rel=0`,
				title: alt,
				allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
				allowFullScreen: true,
				className: "size-full"
			}, current.src) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setPlayingVideo(true),
				className: "group relative size-full",
				children: [current.poster && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: current.poster,
					alt,
					className: "size-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute inset-0 grid place-items-center bg-black/30",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-16 place-items-center rounded-full bg-white/95 text-primary shadow-lift transition group-hover:scale-105",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-7 translate-x-0.5 fill-primary" })
					})
				})]
			})
		}), slides.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-md px-3 pb-8 pt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: slides.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setPlayingVideo(false);
						setIdx(i);
					},
					className: `relative size-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === idx ? "border-primary" : "border-transparent opacity-70"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: s.kind === "image" ? s.src : s.poster ?? "",
						alt: "",
						className: "size-full object-cover"
					}), s.kind === "video" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute inset-0 grid place-items-center bg-black/30 text-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-white" })
					})]
				}, s.src + i))
			})
		})]
	});
}
//#endregion
export { MediaGallery as t };
