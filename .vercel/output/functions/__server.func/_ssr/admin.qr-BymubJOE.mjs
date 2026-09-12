import { o as __toESM } from "../_runtime.mjs";
import { h as retireQr, l as listQr, m as releaseQr, o as deleteQr, p as myRegion, s as generateQrBatch, t as assignQr, u as markQrPrinted } from "./admin.functions-zLuOZcAW.mjs";
import { a as require_react, i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { C as Printer, Ot as CircleCheck, P as MapPin, R as Link2, S as QrCode, Z as Download, a as Unlink, b as RotateCcw, c as Trash2, n as X, w as Plus, y as Search, yt as TriangleAlert } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as LocationCombobox, t as AdminModal } from "./admin-modal-C4JH9OZf.mjs";
import { t as require_lib } from "../_libs/qrcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.qr-BymubJOE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lib = /* @__PURE__ */ __toESM(require_lib());
/** Derived lifecycle state of one physical acrylic. */
function qrState(q) {
	const assignments = q.qr_assignments ?? [];
	return {
		active: assignments.find((a) => !a.released_at) ?? null,
		history: assignments.filter((a) => a.released_at),
		retired: q.status === "retired",
		printed: !!q.printed_at
	};
}
function QrPage() {
	const { data: qrs = [], refetch } = useQuery({
		queryKey: ["admin-qrs"],
		queryFn: () => listQr()
	});
	const [tab, setTab] = (0, import_react.useState)("placed");
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [showGen, setShowGen] = (0, import_react.useState)(false);
	const [assigning, setAssigning] = (0, import_react.useState)(null);
	const [showScanner, setShowScanner] = (0, import_react.useState)(false);
	const [scannedQr, setScannedQr] = (0, import_react.useState)(null);
	const [scannedError, setScannedError] = (0, import_react.useState)(false);
	const [scannedCodeText, setScannedCodeText] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (scannedError) {
			const timer = setTimeout(() => {
				setScannedError(false);
				setScannedCodeText("");
			}, 5e3);
			return () => clearTimeout(timer);
		}
	}, [scannedError]);
	const [query, setQuery] = (0, import_react.useState)("");
	const needle = query.trim().toLowerCase();
	/** Pencarian menyisir kode, batch, lokasi, dan catatan pemasangan. */
	const filteredQrs = (0, import_react.useMemo)(() => {
		if (!needle) return qrs;
		return qrs.filter((q) => {
			const s = qrState(q);
			return [
				q.code,
				q.batch_label,
				s.active?.placement_note,
				s.active?.locations?.name,
				...s.history.map((h) => h?.locations?.name)
			].filter(Boolean).some((v) => String(v).toLowerCase().includes(needle));
		});
	}, [qrs, needle]);
	const buckets = (0, import_react.useMemo)(() => {
		const placed = [];
		const draft = [];
		const released = [];
		for (const q of filteredQrs) {
			const s = qrState(q);
			if (s.active) placed.push(q);
			else if (s.retired || s.history.length > 0) released.push(q);
			else draft.push(q);
		}
		const groups = /* @__PURE__ */ new Map();
		for (const q of placed) {
			const a = qrState(q).active;
			const key = a.location_id ?? "unknown";
			const g = groups.get(key) ?? {
				name: a.locations?.name ?? "Lokasi tidak diketahui",
				slug: a.locations?.slug ?? null,
				items: []
			};
			g.items.push(q);
			groups.set(key, g);
		}
		return {
			placed,
			draft,
			released,
			groups: [...groups.values()].sort((a, b) => a.name.localeCompare(b.name)),
			printed: filteredQrs.filter((q) => q.printed_at).length
		};
	}, [filteredQrs]);
	const visible = tab === "placed" ? buckets.placed : tab === "draft" ? buckets.draft : buckets.released;
	const selectedRows = qrs.filter((q) => selected.has(q.id));
	const toggle = (id) => setSelected((prev) => {
		const next = new Set(prev);
		next.has(id) ? next.delete(id) : next.add(id);
		return next;
	});
	const handleRelease = async (qr) => {
		const active = qrState(qr).active;
		if (!active) return;
		if (!confirm("Lepas QR dari lokasi ini? Data analytics lokasi tetap tersimpan.")) return;
		try {
			await releaseQr({ data: { assignment_id: active.id } });
			refetch();
			toast.success("QR dilepas");
			setScannedQr(null);
		} catch (err) {
			toast.error(err.message);
		}
	};
	const handleScan = (decodedText) => {
		const code = extractQrCode(decodedText);
		const found = qrs.find((q) => q.code.toUpperCase() === code.toUpperCase());
		if (found) {
			setScannedQr(found);
			setShowScanner(false);
			setScannedError(false);
			setScannedCodeText("");
		} else {
			setScannedCodeText(code);
			setScannedError(true);
		}
	};
	const printRows = (rows) => printQrSheet(rows.map((q) => ({
		code: q.code,
		label: q.batch_label,
		place: qrState(q).active?.locations?.name ?? null
	})));
	const markPrinted = async (rows, printed) => {
		if (rows.length === 0) return;
		try {
			await markQrPrinted({ data: {
				ids: rows.map((r) => r.id),
				printed
			} });
			setSelected(/* @__PURE__ */ new Set());
			refetch();
			toast.success(printed ? "Ditandai sudah dicetak" : "Tanda cetak dihapus");
		} catch (err) {
			toast.error(err.message);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl pb-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "QR Akrilik"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-xl text-sm text-muted-foreground",
					children: "Satu QR = satu akrilik fisik. QR adalah jembatan menuju halaman lokasi — bisa dilepas dan dipindah kapan saja, analytics tetap mengikuti lokasinya."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setShowGen(true),
						className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Generate batch"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setShowScanner(true),
						className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-4" }), " Scanner"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						label: "Total keping",
						value: qrs.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						label: "Terpasang",
						value: buckets.placed.length,
						tone: "accent"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						label: "Belum dipasang",
						value: buckets.draft.length,
						tone: "mustard"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
						label: "Sudah dicetak",
						value: buckets.printed
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: [
					["placed", `Terpasang (${buckets.placed.length})`],
					["draft", `Belum dipasang (${buckets.draft.length})`],
					["released", `Dilepas & pensiun (${buckets.released.length})`]
				].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						setTab(key);
						setSelected(/* @__PURE__ */ new Set());
					},
					className: `rounded-full px-4 py-2 text-sm font-semibold transition ${tab === key ? "bg-foreground text-background" : "border border-border bg-card hover:bg-muted"}`,
					children: label
				}, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-4 max-w-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Cari kode QR, batch, atau lokasi…",
						className: "w-full rounded-full border border-border bg-card py-2 pl-9 pr-9 text-sm outline-none focus:border-primary"
					}),
					query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setQuery(""),
						"aria-label": "Bersihkan pencarian",
						className: "absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
					})
				]
			}),
			needle && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: [
					filteredQrs.length,
					" dari ",
					qrs.length,
					" keping cocok."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setSelected(new Set(visible.map((q) => q.id))),
						disabled: visible.length === 0,
						className: "rounded-full border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50",
						children: [
							"Pilih semua (",
							visible.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setSelected(/* @__PURE__ */ new Set()),
						disabled: selected.size === 0,
						className: "rounded-full border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50",
						children: "Batal pilih"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [selected.size, " dipilih"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => printRows(selectedRows.length ? selectedRows : visible),
								disabled: visible.length === 0,
								className: "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-3.5" }), " Cetak lembar"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => markPrinted(selectedRows, true),
								disabled: selected.size === 0,
								className: "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), " Tandai sudah dicetak"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => markPrinted(selectedRows, false),
								disabled: selected.size === 0,
								className: "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), " Batalkan tanda cetak"]
							})
						]
					})
				]
			}),
			tab === "placed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-4",
				children: [buckets.groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "overflow-hidden rounded-2xl border border-border bg-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-lg",
								children: g.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent",
								children: [g.items.length, " QR"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: g.items.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrRow, {
							qr: q,
							checked: selected.has(q.id),
							onToggle: () => toggle(q.id),
							onAssign: () => setAssigning(q),
							onRelease: () => handleRelease(q),
							onRefetch: refetch
						}, q.id))
					})]
				}, g.name)), buckets.groups.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { text: "Belum ada QR yang terpasang di lokasi. Buka tab “Belum dipasang” lalu tekan Pasang." })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 overflow-hidden rounded-2xl border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: visible.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrRow, {
						qr: q,
						checked: selected.has(q.id),
						onToggle: () => toggle(q.id),
						onAssign: () => setAssigning(q),
						onRelease: () => handleRelease(q),
						onRefetch: refetch
					}, q.id))
				}), visible.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { text: tab === "draft" ? "Semua QR sudah terpasang. Generate batch baru bila butuh akrilik tambahan." : "Belum ada QR yang pernah dilepas." })]
			}),
			showGen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GenerateDialog, {
				onClose: () => setShowGen(false),
				onDone: () => {
					setShowGen(false);
					refetch();
				}
			}),
			assigning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssignDialog, {
				qr: assigning,
				onClose: () => setAssigning(null),
				onDone: () => {
					setAssigning(null);
					refetch();
				}
			}),
			showScanner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminQrScannerDialog, {
				onClose: () => {
					setShowScanner(false);
					setScannedError(false);
					setScannedCodeText("");
				},
				onScanSuccess: handleScan,
				scannedError,
				scannedCodeText,
				onDismissError: () => {
					setScannedError(false);
					setScannedCodeText("");
				}
			}),
			scannedQr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrActionPopup, {
				qr: qrs.find((q) => q.id === scannedQr.id) ?? scannedQr,
				onClose: () => setScannedQr(null),
				onDownloadPng: downloadQr,
				onPrintSheet: () => printRows([scannedQr]),
				onTogglePrinted: async (printed) => {
					await markPrinted([scannedQr], printed);
				},
				onAssign: () => {
					setAssigning(scannedQr);
					setScannedQr(null);
				},
				onRelease: () => handleRelease(scannedQr),
				onRetire: async () => {
					const retired = qrState(scannedQr).retired;
					try {
						await retireQr({ data: {
							id: scannedQr.id,
							retired: !retired
						} });
						await refetch();
						toast.success(retired ? "QR diaktifkan kembali" : "QR dipensiunkan");
					} catch (err) {
						toast.error(err.message);
					}
				},
				onDelete: async () => {
					if (!confirm(`Hapus QR ${scannedQr.code}? Hanya untuk keping yang belum pernah dipasang.`)) return;
					try {
						await deleteQr({ data: { id: scannedQr.id } });
						setScannedQr(null);
						await refetch();
						toast.success("QR dihapus");
					} catch (err) {
						toast.error(err.message);
					}
				},
				onScanAgain: () => {
					setScannedQr(null);
					setShowScanner(true);
				}
			})
		]
	});
}
function EmptyState({ text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-8 text-center text-sm text-muted-foreground",
		children: text
	});
}
function MiniStat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `mt-1 font-display text-3xl tabular-nums ${tone === "accent" ? "text-accent" : ""}`,
			children: value
		})]
	});
}
function QrRow({ qr, checked, onToggle, onAssign, onRelease, onRefetch }) {
	const s = qrState(qr);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex flex-wrap items-center gap-3 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "checkbox",
				checked,
				onChange: onToggle,
				className: "size-4 shrink-0",
				"aria-label": `Pilih ${qr.code}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-sm font-semibold",
					children: qr.code
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "truncate text-xs text-muted-foreground",
					children: [
						qr.batch_label || "Tanpa batch",
						s.active?.placement_note ? ` • ${s.active.placement_note}` : "",
						!s.active && s.history.length > 0 ? ` • terakhir di ${s.history[s.history.length - 1]?.locations?.name ?? "—"}` : ""
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-1.5",
				children: [
					s.retired && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "muted",
						children: "Pensiun"
					}),
					s.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "accent",
						children: "Aktif"
					}) : !s.retired && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "mustard",
						children: "Belum dipasang"
					}),
					s.printed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "muted",
						children: "Sudah dicetak"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "outline",
						children: "Belum dicetak"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => downloadQr(qr.code),
						className: "inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3" }), " PNG"]
					}),
					s.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onRelease,
						className: "inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unlink, { className: "size-3" }), " Lepas"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onAssign,
						className: "inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-3" }), " Pasang"]
					}),
					!s.active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: async () => {
							try {
								await retireQr({ data: {
									id: qr.id,
									retired: !s.retired
								} });
								onRefetch();
								toast.success(s.retired ? "QR diaktifkan kembali" : "QR dipensiunkan");
							} catch (err) {
								toast.error(err.message);
							}
						},
						className: "rounded-md border border-border px-2 py-1 text-xs hover:bg-muted",
						children: s.retired ? "Aktifkan" : "Pensiunkan"
					}),
					!s.active && s.history.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: async () => {
							if (!confirm(`Hapus QR ${qr.code}? Hanya untuk keping yang belum pernah dipasang.`)) return;
							try {
								await deleteQr({ data: { id: qr.id } });
								onRefetch();
								toast.success("QR dihapus");
							} catch (err) {
								toast.error(err.message);
							}
						},
						className: "rounded-md p-1.5 text-destructive hover:bg-destructive/10",
						"aria-label": "Hapus QR",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
					})
				]
			})
		]
	});
}
function Badge({ children, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `rounded-full px-2 py-0.5 text-[10px] font-bold ${tone === "accent" ? "bg-accent/15 text-accent" : tone === "mustard" ? "bg-mustard/30 text-ink" : tone === "muted" ? "bg-muted text-muted-foreground" : "border border-border text-muted-foreground"}`,
		children
	});
}
async function downloadQr(code) {
	const url = `${window.location.origin}/q/${code}`;
	const dataUrl = await import_lib.toDataURL(url, {
		width: 600,
		margin: 2
	});
	const a = document.createElement("a");
	a.href = dataUrl;
	a.download = `${code}.png`;
	a.click();
}
/** Opens a printable A4 sheet of QR cards, ready for acrylic production. */
async function printQrSheet(rows) {
	if (rows.length === 0) return;
	const cards = await Promise.all(rows.map(async (r) => {
		const target = `${window.location.origin}/q/${r.code}`;
		return `<figure class="card">
        <img src="${await import_lib.toDataURL(target, {
			width: 512,
			margin: 1
		})}" alt="QR ${r.code}" />
        <figcaption>
          <strong>${r.place ? escapeHtml(r.place) : "Belum ditempatkan"}</strong>
          <span>${escapeHtml(r.code)}</span>
          ${r.label ? `<em>${escapeHtml(r.label)}</em>` : ""}
        </figcaption>
      </figure>`;
	}));
	const w = window.open("", "_blank", "width=900,height=1200");
	if (!w) {
		toast.error("Popup diblokir browser. Izinkan popup untuk mencetak.");
		return;
	}
	w.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8" />
    <title>Lembar Cetak QR Rekomendify</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; color: #17140f; }
      h1 { font-size: 16px; margin: 0 0 10px; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10mm; }
      .card { margin: 0; border: 1px dashed #bbb; border-radius: 8px; padding: 6mm; text-align: center; break-inside: avoid; }
      .card img { width: 100%; height: auto; display: block; }
      figcaption { margin-top: 4mm; display: flex; flex-direction: column; gap: 2px; }
      figcaption strong { font-size: 12px; }
      figcaption span { font-family: ui-monospace, monospace; font-size: 10px; color: #555; }
      figcaption em { font-size: 9px; color: #888; font-style: normal; }
      @media print { .noprint { display: none; } }
    </style></head><body>
    <h1>Lembar Cetak QR Rekomendify — ${rows.length} keping</h1>
    <div class="grid">${cards.join("")}</div>
    <script>window.onload=function(){window.print()}<\/script>
    </body></html>`);
	w.document.close();
}
function escapeHtml(s) {
	return s.replace(/[&<>"']/g, (c) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	})[c]);
}
function GenerateDialog({ onClose, onDone }) {
	const [count, setCount] = (0, import_react.useState)(10);
	const [label, setLabel] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const submit = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const res = await generateQrBatch({ data: {
				count,
				label
			} });
			toast.success(`${res.length} QR dibuat`);
			onDone();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModal, {
		title: "Generate QR batch",
		subtitle: "QR dibuat dalam status draft, aktif otomatis setelah di-assign.",
		onClose,
		onSubmit: submit,
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				className: "flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold",
				children: "Batal"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				disabled: saving,
				className: "flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60",
				children: saving ? "Membuat…" : "Generate"
			})]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-semibold uppercase text-muted-foreground",
					children: "Jumlah"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "number",
					min: 1,
					max: 200,
					value: count,
					onChange: (e) => setCount(Number(e.target.value)),
					className: "input mt-1"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-semibold uppercase text-muted-foreground",
					children: "Label batch"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					required: true,
					value: label,
					onChange: (e) => setLabel(e.target.value),
					className: "input mt-1",
					placeholder: "Batch Jan-2026"
				})]
			})]
		})
	});
}
function AssignDialog({ qr, onClose, onDone }) {
	const { data: my } = useQuery({
		queryKey: ["my-region"],
		queryFn: () => myRegion()
	});
	const [locationId, setLocationId] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const locations = my?.locations ?? [];
	const locationOptions = (0, import_react.useMemo)(() => locations.map((l) => ({
		id: l.id,
		name: l.name,
		category: l.categories?.name ?? null
	})), [locations]);
	const submit = async (e) => {
		e.preventDefault();
		if (!locationId) {
			toast.error("Pilih lokasi terlebih dahulu.");
			return;
		}
		setSaving(true);
		try {
			await assignQr({ data: {
				qr_id: qr.id,
				location_id: locationId,
				placement_note: note || null
			} });
			toast.success("QR ter-assign");
			onDone();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModal, {
		title: "Assign QR ke lokasi",
		subtitle: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-mono",
			children: [
				qr.code,
				" · ",
				my?.region?.name ?? "—"
			]
		}),
		onClose,
		onSubmit: submit,
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				className: "flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold",
				children: "Batal"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				disabled: saving || !locationId,
				className: "flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60",
				children: saving ? "Menyimpan…" : "Assign"
			})]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-semibold uppercase text-muted-foreground",
				children: "Lokasi"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCombobox, {
					locations: locationOptions,
					value: locationId,
					onChange: setLocationId,
					required: true,
					placeholder: "Cari nama lokasi…"
				})
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-semibold uppercase text-muted-foreground",
					children: "Catatan penempatan (opsional)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: note,
					onChange: (e) => setNote(e.target.value),
					className: "input mt-1",
					placeholder: "Di kasir, dekat pintu masuk…"
				})]
			})]
		})
	});
}
function extractQrCode(text) {
	const trimmed = text.trim();
	try {
		const match = new URL(trimmed).pathname.match(/\/q\/([^/]+)/);
		if (match && match[1]) return match[1];
	} catch {}
	const pathMatch = trimmed.match(/\/q\/([^/]+)/);
	if (pathMatch && pathMatch[1]) return pathMatch[1];
	return trimmed;
}
function AdminQrScannerDialog({ onClose, onScanSuccess, scannedError, scannedCodeText, onDismissError }) {
	const containerId = "admin-qr-reader";
	const scannerRef = (0, import_react.useRef)(null);
	const stoppedRef = (0, import_react.useRef)(false);
	const [status, setStatus] = (0, import_react.useState)("starting");
	const [errorMsg, setErrorMsg] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
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
				}, (decodedText) => {
					if (!cancelled) onScanSuccess(decodedText);
				}, () => {});
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
			if (scannerRef.current && !stoppedRef.current) {
				stoppedRef.current = true;
				const s = scannerRef.current;
				s.stop().then(() => s.clear()).catch(() => {});
			}
		};
	}, [onScanSuccess]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-black/50 p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-md rounded-3xl bg-card p-6 border border-border overflow-hidden",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					"aria-label": "Tutup",
					className: "absolute right-4 top-4 grid size-8 place-items-center rounded-full hover:bg-muted z-20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Scanner QR Admin"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Arahkan kamera ke QR fisik Rekomendify."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 overflow-hidden rounded-2xl border border-border bg-black relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						id: containerId,
						className: "aspect-square w-full"
					}), scannedError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-4 bottom-4 z-10 rounded-2xl border border-destructive/40 bg-card/95 p-4 text-sm shadow-xl animate-in fade-in slide-in-from-bottom-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-8 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-destructive text-xs",
											children: "QR tidak ditemukan"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-0.5 text-[11px] text-muted-foreground leading-snug",
											children: "Pastikan QR berasal dari sistem Rekomendify."
										}),
										scannedCodeText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1.5 font-mono text-[9px] break-all bg-muted/80 p-1 rounded border border-border text-muted-foreground max-h-12 overflow-y-auto",
											children: scannedCodeText
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: onDismissError,
									"aria-label": "Tutup",
									className: "grid size-6 place-items-center rounded-full hover:bg-muted text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
								})
							]
						})
					})]
				}),
				status === "starting" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-center text-sm text-muted-foreground animate-pulse",
					children: "Menyiapkan kamera…"
				}),
				status === "scanning" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-center text-sm text-muted-foreground",
					children: "Menunggu QR fisik terdeteksi…"
				}),
				status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold text-destructive",
						children: "Kamera tidak dapat diakses"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted-foreground text-xs",
						children: errorMsg
					})]
				})
			]
		})
	});
}
/**
* Quick Action Panel hasil scan: seluruh aksi siklus hidup satu keping akrilik
* tersedia di sini. Aksi utama selalu terlihat, aksi lanjutan disembunyikan
* di balik "Aksi lainnya" (progressive disclosure) agar popup tetap ringkas.
*/
function QrActionPopup({ qr, onClose, onDownloadPng, onPrintSheet, onTogglePrinted, onAssign, onRelease, onRetire, onDelete, onScanAgain }) {
	const s = qrState(qr);
	const active = s.active;
	const last = s.history[s.history.length - 1];
	const [more, setMore] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-card p-6",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					"aria-label": "Tutup",
					className: "absolute right-4 top-4 grid size-8 place-items-center rounded-full hover:bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-col items-center text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-3 grid size-12 place-items-center rounded-full bg-accent/10 text-accent",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold uppercase tracking-wider text-accent",
							children: "QR Ditemukan"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-mono text-xl font-bold tracking-tight",
							children: qr.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap justify-center gap-1.5",
							children: [
								s.retired && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "muted",
									children: "Pensiun"
								}),
								active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "accent",
									children: "Terpasang"
								}) : !s.retired && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "mustard",
									children: "Belum dipasang"
								}),
								s.printed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "muted",
									children: "Sudah dicetak"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "outline",
									children: "Belum dicetak"
								}),
								qr.batch_label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "outline",
									children: qr.batch_label
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 w-full rounded-2xl border border-border bg-muted/30 p-4 text-left text-sm",
							children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Terhubung ke lokasi"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold text-foreground",
										children: active.locations?.name || "—"
									}),
									active.placement_note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: ["Penempatan: ", active.placement_note]
									}),
									active.assigned_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-muted-foreground",
										children: ["Sejak ", new Date(active.assigned_at).toLocaleDateString("id-ID")]
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: s.retired ? "Keping ini sudah dipensiunkan." : "Belum terhubung ke lokasi mana pun."
									}),
									last && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: ["Terakhir di ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: last.locations?.name ?? "—"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-muted-foreground",
										children: [
											"Riwayat penempatan: ",
											s.history.length,
											"×"
										]
									})
								]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 flex flex-col gap-2",
					children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onAssign,
						className: "inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4" }), " Pindahkan ke lokasi lain"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onRelease,
						className: "inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unlink, { className: "size-4" }), " Lepas dari lokasi"]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onAssign,
						className: "inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-4" }), " Pasang ke lokasi"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setMore((v) => !v),
					"aria-expanded": more,
					className: "mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted",
					children: more ? "Sembunyikan aksi lainnya" : "Aksi lainnya"
				}),
				more && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid grid-cols-2 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopupAction, {
							icon: Download,
							label: "Unduh PNG",
							onClick: () => onDownloadPng(qr.code)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopupAction, {
							icon: Printer,
							label: "Cetak lembar",
							onClick: onPrintSheet
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopupAction, {
							icon: s.printed ? RotateCcw : CircleCheck,
							label: s.printed ? "Batalkan tanda cetak" : "Tandai sudah dicetak",
							onClick: () => onTogglePrinted(!s.printed)
						}),
						active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `/q/${qr.code}`,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold hover:bg-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }), " Buka halaman QR"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopupAction, {
							icon: s.retired ? RotateCcw : TriangleAlert,
							label: s.retired ? "Aktifkan kembali" : "Pensiunkan",
							onClick: onRetire
						}),
						!active && s.history.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopupAction, {
							icon: Trash2,
							label: "Hapus keping",
							onClick: onDelete,
							destructive: true
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: onScanAgain,
					className: "mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:border-foreground/40 hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), " Scan QR berikutnya"]
				})
			]
		})
	});
}
function PopupAction({ icon: Icon, label, onClick, destructive }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: `inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold ${destructive ? "border-destructive/40 text-destructive hover:bg-destructive/10" : "border-border hover:bg-muted"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }),
			" ",
			label
		]
	});
}
//#endregion
export { QrPage as component };
