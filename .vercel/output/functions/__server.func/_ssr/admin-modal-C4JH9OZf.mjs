import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as X, st as Check, y as Search } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-modal-C4JH9OZf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
/**
* LocationCombobox — pencarian + pilih satu Location.
* LocationMultiSelect — pencarian + pilih beberapa Location (maks. N).
*
* CATATAN PENTING (perbaikan mobile):
* Versi sebelumnya membungkus input pencarian di dalam Radix Popover + cmdk.
* Popover itu dirender lewat portal ke <body>, sementara dialog iklan adalah
* overlay `fixed` buatan sendiri. Kombinasi focus-trap Popover, DismissableLayer
* (pointerdown di document) dan overlay tersebut membuat Chrome Android
* kehilangan fokus tepat setelah input disentuh, sehingga keyboard tidak pernah
* bertahan dan admin tidak bisa mengetik.
*
* Sekarang input dirender inline (tanpa portal, tanpa focus trap, tanpa cmdk),
* jadi satu ketukan langsung memunculkan keyboard di HP maupun desktop.
* Semua filtering tetap di frontend dari data yang sudah dimuat.
*/
var norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
function useFiltered(locations, q) {
	return (0, import_react.useMemo)(() => {
		const query = norm(q);
		if (!query) return locations;
		const tokens = query.split(" ");
		return locations.filter((l) => {
			const hay = norm(`${l.name} ${l.category ?? ""}`);
			return tokens.every((t) => hay.includes(t));
		});
	}, [locations, q]);
}
function SearchField({ value, onChange, placeholder, id }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
				className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id,
				type: "search",
				inputMode: "search",
				autoComplete: "off",
				enterKeyHint: "search",
				value,
				onChange: (e) => onChange(e.target.value),
				placeholder,
				className: "min-h-11 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
			}),
			value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onChange(""),
				"aria-label": "Hapus pencarian",
				className: "absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			})
		]
	});
}
function LocationCombobox({ locations, value, onChange, placeholder = "Cari nama lokasi…", emptyLabel = "— Tidak ada —", required = false }) {
	const [q, setQ] = (0, import_react.useState)("");
	const inputId = (0, import_react.useId)();
	const selected = (0, import_react.useMemo)(() => locations.find((l) => l.id === value) ?? null, [locations, value]);
	const filtered = useFiltered(locations, q);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchField, {
				id: inputId,
				value: q,
				onChange: setQ,
				placeholder
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: ["Terpilih: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium text-foreground",
					children: selected ? selected.name : emptyLabel
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "max-h-56 overflow-y-auto overscroll-contain rounded-xl border border-border bg-background",
				children: [
					!required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onChange(""),
						className: "flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm text-muted-foreground hover:bg-accent/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("size-4 shrink-0", value === "" ? "opacity-100 text-primary" : "opacity-0") }), emptyLabel]
					}) }),
					filtered.map((loc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onChange(loc.id),
						"aria-pressed": value === loc.id,
						className: "flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("size-4 shrink-0", value === loc.id ? "opacity-100 text-primary" : "opacity-0") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-medium",
								children: loc.name
							}), loc.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-xs text-muted-foreground",
								children: loc.category
							})]
						})]
					}) }, loc.id)),
					filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-3 py-4 text-center text-sm text-muted-foreground",
						children: "Lokasi tidak ditemukan."
					})
				]
			})
		]
	});
}
function LocationMultiSelect({ locations, selectedIds, onChange, max = 5 }) {
	const [q, setQ] = (0, import_react.useState)("");
	const inputId = (0, import_react.useId)();
	const selectedLocations = (0, import_react.useMemo)(() => locations.filter((l) => selectedIds.includes(l.id)), [locations, selectedIds]);
	const filtered = useFiltered(locations, q);
	const full = selectedIds.length >= max;
	const toggle = (id) => {
		if (selectedIds.includes(id)) onChange(selectedIds.filter((x) => x !== id));
		else if (!full) onChange([...selectedIds, id]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			selectedLocations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: selectedLocations.map((loc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary",
					children: [loc.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => toggle(loc.id),
						"aria-label": `Hapus ${loc.name}`,
						className: "grid size-5 place-items-center rounded-full hover:bg-primary/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
					})]
				}, loc.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchField, {
				id: inputId,
				value: q,
				onChange: setQ,
				placeholder: "Cari lokasi tujuan…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "max-h-56 overflow-y-auto overscroll-contain rounded-xl border border-border bg-background",
				children: [filtered.map((loc) => {
					const on = selectedIds.includes(loc.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => toggle(loc.id),
						disabled: !on && full,
						"aria-pressed": on,
						className: "flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent/10 disabled:opacity-40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("size-4 shrink-0", on ? "opacity-100 text-primary" : "opacity-0") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-medium",
								children: loc.name
							}), loc.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-xs text-muted-foreground",
								children: loc.category
							})]
						})]
					}) }, loc.id);
				}), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "px-3 py-4 text-center text-sm text-muted-foreground",
					children: "Lokasi tidak ditemukan."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					selectedIds.length,
					"/",
					max,
					" lokasi tujuan dipilih",
					full ? " — batas tercapai." : "."
				]
			})
		]
	});
}
/**
* AdminModal — satu pola modal responsif untuk seluruh panel admin.
*
* Kenapa dibuat:
* Sebelumnya tiap dialog admin menulis sendiri `fixed inset-0 … grid place-items-center`
* dengan `onClick={onClose}` pada backdrop. Dua masalah nyata di HP:
*  1. Konten panjang (mis. form Promosi) tumbuh melebihi viewport sehingga header
*     dan tombol simpan ikut tergulung; ketika keyboard Android muncul, tombol
*     penting terdorong keluar layar.
*  2. `onClick` di backdrop juga menyala saat elemen yang diklik (mis. item daftar
*     lokasi) di-unmount saat itu juga — browser me-retarget event ke backdrop —
*     sehingga modal tertutup sendiri dan fokus input hilang.
*
* Solusi: satu shell dengan header/footer sticky, body yang scroll sendiri,
* tinggi dibatasi `dvh` (ikut menyusut saat keyboard muncul), safe-area Android,
* dan penutupan backdrop yang hanya terjadi bila pointerdown DAN click sama-sama
* terjadi pada backdrop itu sendiri.
*/
function AdminModal({ title, subtitle, children, footer, onClose, onSubmit, size = "md" }) {
	const downOnBackdrop = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [onClose]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		onPointerDown: (0, import_react.useCallback)((e) => {
			downOnBackdrop.current = e.target === e.currentTarget;
		}, []),
		onClick: (0, import_react.useCallback)((e) => {
			if (downOnBackdrop.current && e.target === e.currentTarget) onClose();
			downOnBackdrop.current = false;
		}, [onClose]),
		className: "fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": title,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(onSubmit ? "form" : "div", {
			...onSubmit ? { onSubmit } : {},
			className: cn("flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-card shadow-xl sm:max-h-[88dvh] sm:rounded-3xl", size === "lg" ? "sm:max-w-lg" : "sm:max-w-md"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-start gap-3 border-b border-border/70 px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "truncate font-display text-xl sm:text-2xl",
							children: title
						}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-0.5 text-xs text-muted-foreground",
							children: subtitle
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						"aria-label": "Tutup",
						className: "-mr-1 grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4",
					children
				}),
				footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "shrink-0 border-t border-border/70 bg-card px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
					children: footer
				})
			]
		})
	});
}
//#endregion
export { LocationCombobox as n, LocationMultiSelect as r, AdminModal as t };
