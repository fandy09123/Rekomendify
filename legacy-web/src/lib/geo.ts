/**
 * Koordinat disimpan sebagai satu kolom teks "lat,lng" (mis. -8.002344,111.817618).
 * URL Google Maps dibangun di frontend, bukan disimpan di database.
 */
export const COORDS_RE = /^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$/;

/** Normalisasi input admin ("-8.00, 111.81" → "-8.00,111.81"). Null jika tidak valid. */
export function parseCoordinates(input: unknown): string | null {
  if (input == null) return null;
  const raw = String(input).replace(/\s+/g, "");
  if (!raw) return null;
  if (!COORDS_RE.test(raw)) return null;
  const [lat, lng] = raw.split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return raw;
}

/** URL navigasi Google Maps dari koordinat. */
export function mapsDirUrl(coords: string | null | undefined): string | null {
  const c = parseCoordinates(coords);
  return c ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c)}` : null;
}

/** Normalisasi nomor WhatsApp Indonesia menjadi format internasional tanpa tanda. */
export function normalizeWhatsapp(input: unknown): string | null {
  if (input == null) return null;
  let d = String(input).replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("0")) d = `62${d.slice(1)}`;
  if (d.length < 8 || d.length > 20) return null;
  return d;
}

/** Link chat WhatsApp dengan pesan awal. */
export function waChatUrl(number: string | null | undefined, message: string): string | null {
  const n = normalizeWhatsapp(number);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : null;
}
