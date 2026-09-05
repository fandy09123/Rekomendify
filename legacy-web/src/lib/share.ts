/**
 * Teks berbagi ringkas. Deskripsi asli lokasi tetap utuh di database —
 * yang dipersingkat hanya representasi untuk share payload.
 */
export function truncateText(input: string | null | undefined, max = 120): string {
  const clean = String(input ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:!-]+$/, "")}…`;
}

/** Ringkasan share untuk sebuah lokasi: nama, wilayah, deskripsi singkat. */
export function buildLocationShareText(opts: {
  name: string;
  regionName?: string | null;
  description?: string | null;
  category?: string | null;
}): string {
  const lines = [opts.name];
  const sub = [opts.category, opts.regionName].filter(Boolean).join(" · ");
  if (sub) lines.push(sub);
  const desc = truncateText(opts.description, 120);
  if (desc) lines.push(desc);
  lines.push("Lihat di Rekomendify");
  return lines.join("\n");
}

/** Berbagi dengan Web Share API bila tersedia; fallback salin tautan. */
export async function shareOrCopy(data: { title: string; text: string; url: string }): Promise<"shared" | "copied" | "failed"> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(data);
      return "shared";
    } catch (e: any) {
      if (e?.name === "AbortError") return "shared";
    }
  }
  try {
    await navigator.clipboard.writeText(`${data.text}\n${data.url}`);
    return "copied";
  } catch {
    return "failed";
  }
}
