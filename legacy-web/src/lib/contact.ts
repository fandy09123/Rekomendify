/** Satu nomor WhatsApp untuk semua kanal; yang membedakan hanya pesan awal. */
export const WHATSAPP_NUMBER = "6285707361545";

export function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WA_MESSAGES = {
  bantuan: "Halo Admin Rekomendify, saya membutuhkan bantuan terkait aplikasi.",
  saran: "Halo Admin Rekomendify, saya memiliki saran untuk pengembangan aplikasi.",
  daftarDesa: "Halo Admin Rekomendify, saya ingin mendaftarkan desa saya ke Rekomendify.",
  iklan: "Halo Admin Rekomendify, saya tertarik memasang iklan di Rekomendify.",
  kerjaSama: "Halo Admin Rekomendify, saya ingin membahas peluang kerja sama.",
} as const;

export const APP_VERSION = "1.0.0";
