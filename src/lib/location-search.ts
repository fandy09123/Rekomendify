/**
 * Pencarian & filter lokasi — murni di sisi klien, deterministik, tanpa AI.
 *
 * Data yang tersedia di tabel `locations` hanya teks bebas:
 *   - price_range : mis. "Rp 10rb–25rb", "Rp5.000 - Rp20.000", "Gratis"
 *   - hours       : mis. "08.00–22.00", "24 jam", "Setiap hari 07.00-21.00"
 * Karena itu semua penafsiran di bawah bersifat heuristik. Bila sebuah nilai
 * tidak dapat dibaca, kita mengembalikan `null`/`"unknown"` dan TIDAK menebak —
 * lokasi seperti itu tidak akan diklaim "buka sekarang" atau "murah".
 */

export type PriceTier = "murah" | "sedang" | "mahal";
export type PriceFilter = "all" | PriceTier;
export type HoursFilter = "all" | "now" | "pagi" | "siang" | "sore" | "malam";

export interface SearchableLocation {
  name: string;
  description?: string | null;
  price_range?: string | null;
  hours?: string | null;
  category_id?: string | null;
}

export interface CategoryLike {
  id: string;
  name?: string | null;
  slug?: string | null;
}

/* ── Normalisasi teks ─────────────────────────────────────────────────── */

const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Sinonim ringan agar cara mengetik orang awam tetap ketemu. */
const SYNONYMS: Record<string, string[]> = {
  kopi: ["kopi", "coffee", "kafe", "cafe", "ngopi"],
  makan: ["makan", "makanan", "kuliner", "warung", "rumah makan", "resto", "restoran"],
  murah: ["murah", "terjangkau", "hemat", "ekonomis"],
  mahal: ["mahal", "premium", "mewah"],
  wisata: ["wisata", "wisatawan", "tour", "objek wisata", "destinasi"],
  penginapan: ["penginapan", "hotel", "homestay", "losmen", "villa"],
};

function expand(token: string): string[] {
  for (const list of Object.values(SYNONYMS)) {
    if (list.some((w) => normalize(w) === token)) return list.map(normalize);
  }
  return [token];
}

/* ── Harga ────────────────────────────────────────────────────────────── */

/** Mengubah potongan angka harga Indonesia menjadi rupiah. */
function parseAmount(raw: string): number | null {
  const m = raw.match(/(\d[\d.,]*)\s*(rb|ribu|k|jt|juta|m)?/i);
  if (!m) return null;
  const digits = m[1].replace(/[.,](?=\d{3}\b)/g, "").replace(/,/g, ".");
  let n = Number.parseFloat(digits);
  if (!Number.isFinite(n)) return null;
  const unit = (m[2] ?? "").toLowerCase();
  if (unit === "rb" || unit === "ribu" || unit === "k") n *= 1_000;
  else if (unit === "jt" || unit === "juta" || unit === "m") n *= 1_000_000;
  return n;
}

/** Nilai rupiah rata-rata dari sebuah teks harga bebas; `null` bila tak terbaca. */
export function parsePriceValue(price?: string | null): number | null {
  if (!price) return null;
  const text = price.toLowerCase();
  if (/gratis|free|cuma[- ]?cuma|0\b/.test(text) && !/\d{3}/.test(text)) return 0;
  const parts = text.match(/\d[\d.,]*\s*(rb|ribu|k|jt|juta)?/gi);
  if (!parts || parts.length === 0) return null;
  const values = parts.map(parseAmount).filter((v): v is number => v != null && v >= 0);
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return (min + max) / 2;
}

/** Ambang harga (rupiah) yang masuk akal untuk warung/wisata desa. */
const CHEAP_MAX = 25_000;
const MID_MAX = 75_000;

export function priceTier(price?: string | null): PriceTier | "unknown" {
  const v = parsePriceValue(price);
  if (v == null) return "unknown";
  if (v <= CHEAP_MAX) return "murah";
  if (v <= MID_MAX) return "sedang";
  return "mahal";
}

export const PRICE_FILTER_LABEL: Record<PriceFilter, string> = {
  all: "Semua harga",
  murah: "Murah",
  sedang: "Sedang",
  mahal: "Mahal",
};

/* ── Jam buka ─────────────────────────────────────────────────────────── */

export interface Interval {
  /** menit sejak 00:00, boleh > 1440 bila melewati tengah malam */
  start: number;
  end: number;
}

const ALWAYS_OPEN = /24\s*jam|24\s*\/\s*7|buka\s*24/i;
const CLOSED = /tutup\s*(sementara|total)?$/i;

/** Membaca semua interval "HH.MM–HH.MM" dari teks bebas. */
export function parseHours(hours?: string | null): { intervals: Interval[]; always: boolean } | null {
  if (!hours) return null;
  const text = hours.toLowerCase();
  if (ALWAYS_OPEN.test(text)) return { intervals: [{ start: 0, end: 1440 }], always: true };

  const re = /(\d{1,2})[.:]?(\d{2})?\s*(?:wib|wita|wit)?\s*(?:-|–|—|s\/d|sampai|hingga|s.d.)\s*(\d{1,2})[.:]?(\d{2})?/g;
  const intervals: Interval[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const h1 = Number(m[1]);
    const h2 = Number(m[3]);
    if (h1 > 24 || h2 > 24) continue;
    const start = h1 * 60 + Number(m[2] ?? 0);
    let end = h2 * 60 + Number(m[4] ?? 0);
    if (end <= start) end += 1440; // melewati tengah malam
    intervals.push({ start, end });
  }
  if (intervals.length === 0) {
    if (CLOSED.test(text)) return { intervals: [], always: false };
    return null; // tidak terbaca — jangan menebak
  }
  return { intervals, always: false };
}

/** `true` buka, `false` tutup, `null` bila format jam tidak terbaca. */
export function isOpenAt(hours: string | null | undefined, at: Date = new Date()): boolean | null {
  const parsed = parseHours(hours);
  if (!parsed) return null;
  if (parsed.always) return true;
  if (parsed.intervals.length === 0) return false;
  const minutes = at.getHours() * 60 + at.getMinutes();
  return parsed.intervals.some(
    (iv) =>
      (minutes >= iv.start && minutes < iv.end) ||
      // interval yang melewati tengah malam, dilihat dari hari berikutnya
      (iv.end > 1440 && minutes + 1440 >= iv.start && minutes + 1440 < iv.end),
  );
}

const PERIODS: Record<"pagi" | "siang" | "sore" | "malam", Interval> = {
  pagi: { start: 5 * 60, end: 11 * 60 },
  siang: { start: 11 * 60, end: 15 * 60 },
  sore: { start: 15 * 60, end: 18 * 60 },
  malam: { start: 18 * 60, end: 24 * 60 },
};

/** Apakah jam operasional bersinggungan dengan periode hari tertentu. */
export function opensDuring(hours: string | null | undefined, period: keyof typeof PERIODS): boolean | null {
  const parsed = parseHours(hours);
  if (!parsed) return null;
  if (parsed.always) return true;
  const p = PERIODS[period];
  return parsed.intervals.some((iv) => {
    const spans = [{ start: iv.start, end: Math.min(iv.end, 1440) }];
    if (iv.end > 1440) spans.push({ start: 0, end: iv.end - 1440 });
    return spans.some((s) => s.start < p.end && s.end > p.start);
  });
}

export const HOURS_FILTER_LABEL: Record<HoursFilter, string> = {
  all: "Kapan saja",
  now: "Buka sekarang",
  pagi: "Buka pagi",
  siang: "Buka siang",
  sore: "Buka sore",
  malam: "Buka malam",
};

/* ── Pencarian teks ───────────────────────────────────────────────────── */

function haystack(loc: SearchableLocation, categories: CategoryLike[]): string {
  const cat = categories.find((c) => c.id === loc.category_id);
  const tier = priceTier(loc.price_range);
  const parsed = parseHours(loc.hours);
  const periodWords = parsed
    ? (["pagi", "siang", "sore", "malam"] as const).filter((p) => opensDuring(loc.hours, p)).join(" ")
    : "";
  return normalize(
    [
      loc.name,
      loc.description ?? "",
      loc.price_range ?? "",
      loc.hours ?? "",
      cat?.name ?? "",
      cat?.slug ?? "",
      tier === "unknown" ? "" : tier,
      parsed?.always ? "24 jam buka terus" : "",
      periodWords ? `buka ${periodWords}` : "",
    ].join(" "),
  );
}

/** Semua kata kunci harus cocok (AND), tiap kata boleh cocok sebagian. */
export function matchesQuery(loc: SearchableLocation, query: string, categories: CategoryLike[]): boolean {
  const q = normalize(query);
  if (!q) return true;
  const hay = haystack(loc, categories);
  return q.split(" ").every((token) => expand(token).some((v) => hay.includes(v)));
}

/* ── Filter gabungan ──────────────────────────────────────────────────── */

export interface FilterOptions {
  query?: string;
  price?: PriceFilter;
  hours?: HoursFilter;
  categories?: CategoryLike[];
  now?: Date;
}

export function passesFilters<T extends SearchableLocation>(loc: T, opts: FilterOptions): boolean {
  const categories = opts.categories ?? [];
  if (opts.query && !matchesQuery(loc, opts.query, categories)) return false;

  const price = opts.price ?? "all";
  if (price !== "all" && priceTier(loc.price_range) !== price) return false;

  const hours = opts.hours ?? "all";
  if (hours === "now") {
    if (isOpenAt(loc.hours, opts.now) !== true) return false;
  } else if (hours !== "all") {
    if (opensDuring(loc.hours, hours) !== true) return false;
  }
  return true;
}
