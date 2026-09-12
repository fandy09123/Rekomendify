import { o as __toESM } from "../_runtime.mjs";
import { d as myAnalytics } from "./admin.functions-zLuOZcAW.mjs";
import { a as require_react, i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { A as Minus, M as MessageCircle, dt as Bookmark, g as Share2, k as Navigation, o as TrendingUp, s as TrendingDown } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.analytics-L8H0j9jV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RANGES = [
	7,
	14,
	30,
	90
];
function AnalyticsPage() {
	const [days, setDays] = (0, import_react.useState)(30);
	const { data, isLoading } = useQuery({
		queryKey: ["admin-analytics", days],
		queryFn: () => myAnalytics({ data: { days } })
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Memuat data…"
	});
	if (!data?.region_id) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
		children: "Akun Anda belum terhubung ke wilayah aktif."
	});
	const totals = data.totals ?? {
		total: 0,
		today: 0,
		yesterday: 0,
		d7: 0,
		prev7: 0,
		d30: 0,
		prev30: 0
	};
	const trend = data.trend ?? [];
	const peak = Math.max(1, ...trend.map((t) => t.visits));
	const src = data.by_source ?? {};
	const eng = data.engagement ?? {
		whatsapp: 0,
		gmaps: 0,
		save: 0,
		share: 0
	};
	const topLocations = data.top_locations ?? [];
	const topCategories = (data.top_categories ?? []).filter((c) => c.visits > 0);
	const qr = data.qr;
	const content = data.content;
	const rangeVisits = trend.reduce((a, b) => a + b.visits, 0);
	const conversion = rangeVisits > 0 ? Math.round((eng.whatsapp + eng.gmaps) / rangeVisits * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl pb-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Analytics"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-xl text-sm text-muted-foreground",
					children: "Angka nyata dari wilayah Anda, dihitung langsung di database. Kunjungan mengikuti lokasi & penempatan QR — memindah QR tidak mencampur data."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1 rounded-full border border-border bg-card p-1",
					children: RANGES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setDays(r),
						className: `rounded-full px-3 py-1.5 text-xs font-semibold transition ${days === r ? "bg-foreground text-background" : "hover:bg-muted"}`,
						children: [r, " hari"]
					}, r))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Hari ini",
						value: totals.today,
						delta: delta(totals.today, totals.yesterday),
						deltaLabel: "vs kemarin"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "7 hari",
						value: totals.d7,
						delta: delta(totals.d7, totals.prev7),
						deltaLabel: "vs 7 hari sebelumnya"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "30 hari",
						value: totals.d30,
						delta: delta(totals.d30, totals.prev30),
						deltaLabel: "vs 30 hari sebelumnya"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Total sepanjang waktu",
						value: totals.total
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mt-8 font-display text-xl",
				children: [
					"Tren ",
					days,
					" hari terakhir"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-2xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-40 items-end gap-1",
					children: [trend.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "group flex flex-1 flex-col items-center justify-end gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] tabular-nums text-muted-foreground opacity-0 transition group-hover:opacity-100",
							children: b.visits
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-full rounded-t bg-primary/80 transition group-hover:bg-primary",
							style: { height: `${Math.max(2, b.visits / peak * 100)}%` },
							title: `${b.day}: ${b.visits} kunjungan`
						})]
					}, b.day)), trend.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "w-full text-center text-sm text-muted-foreground",
						children: "Belum ada kunjungan pada rentang ini."
					})]
				}), trend.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex gap-1",
					children: trend.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1 text-center text-[9px] tabular-nums text-muted-foreground",
						children: i % Math.ceil(trend.length / 10) === 0 ? new Date(b.day).getDate() : ""
					}, b.day))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 font-display text-xl",
				children: "Sumber kunjungan"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Scan QR",
						value: src.qr ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "GPS / wilayah",
						value: src.gps ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Langsung",
						value: src.direct ?? 0
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 font-display text-xl",
				children: "Aksi wisatawan"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Sinyal konversi nyata: ",
					conversion,
					"% kunjungan berlanjut ke WhatsApp atau rute Google Maps."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Chat WhatsApp",
						value: eng.whatsapp,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Buka rute Maps",
						value: eng.gmaps,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Disimpan",
						value: eng.save,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Dibagikan",
						value: eng.share,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 font-display text-xl",
				children: "Lokasi teratas"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 overflow-hidden rounded-2xl border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: topLocations.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-6 shrink-0 text-center font-display text-lg text-muted-foreground",
								children: i + 1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-medium",
									children: l.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 h-1.5 overflow-hidden rounded-full bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full bg-primary",
										style: { width: `${Math.round(l.visits / Math.max(1, topLocations[0]?.visits ?? 1) * 100)}%` }
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "shrink-0 text-right text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-lg tabular-nums text-foreground",
									children: l.visits
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "tabular-nums",
									children: [
										l.whatsapp,
										" WA · ",
										l.gmaps,
										" rute · ",
										l.saves,
										" simpan"
									]
								})]
							})
						]
					}, l.id))
				}), topLocations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-8 text-center text-sm text-muted-foreground",
					children: "Belum ada lokasi di wilayah Anda."
				})]
			}),
			topCategories.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 font-display text-xl",
				children: "Kategori teratas"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-2",
				children: topCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-xl border border-border bg-card p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: c.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm tabular-nums text-muted-foreground",
						children: [c.visits, " kunjungan"]
					})]
				}, c.name))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 font-display text-xl",
				children: "Kondisi wilayah"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Lokasi tayang",
						value: content?.published_locations ?? 0,
						sub: `dari ${content?.locations ?? 0} lokasi`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Kategori",
						value: content?.categories ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Info lokal",
						value: content?.info_posts ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "QR terpasang",
						value: qr?.active ?? 0,
						sub: `${qr?.draft ?? 0} belum dipasang · ${qr?.printed ?? 0} dicetak`
					})
				]
			})
		]
	});
}
function delta(current, previous) {
	if (previous === 0) return current > 0 ? 100 : null;
	return Math.round((current - previous) / previous * 100);
}
function Stat({ label, value, sub, delta: d, deltaLabel, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: [
					icon,
					" ",
					label
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-display text-3xl tabular-nums",
				children: value
			}),
			d != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: `mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold ${d > 0 ? "text-accent" : d < 0 ? "text-destructive" : "text-muted-foreground"}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(d == null ? Minus : d > 0 ? TrendingUp : d < 0 ? TrendingDown : Minus, { className: "size-3" }),
					" ",
					d > 0 ? "+" : "",
					d,
					"% ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-normal text-muted-foreground",
						children: deltaLabel
					})
				]
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-[11px] text-muted-foreground",
				children: sub
			})
		]
	});
}
//#endregion
export { AnalyticsPage as component };
