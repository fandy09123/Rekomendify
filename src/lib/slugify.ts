/**
 * Salinan aturan slug yang dipakai server (`admin.functions.ts`) agar frontend
 * bisa menebak URL publik entitas yang baru disimpan tanpa refetch tambahan.
 */
export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
