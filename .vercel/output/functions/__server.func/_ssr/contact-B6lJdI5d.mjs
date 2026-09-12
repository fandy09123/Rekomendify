//#region node_modules/.nitro/vite/services/ssr/assets/contact-B6lJdI5d.js
/** Satu nomor WhatsApp untuk semua kanal; yang membedakan hanya pesan awal. */
var WHATSAPP_NUMBER = "6285707361545";
function waLink(message) {
	return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
var WA_MESSAGES = {
	bantuan: "Halo Admin Rekomendify, saya membutuhkan bantuan terkait aplikasi.",
	saran: "Halo Admin Rekomendify, saya memiliki saran untuk pengembangan aplikasi.",
	daftarDesa: "Halo Admin Rekomendify, saya ingin mendaftarkan desa saya ke Rekomendify.",
	iklan: "Halo Admin Rekomendify, saya tertarik memasang iklan di Rekomendify.",
	kerjaSama: "Halo Admin Rekomendify, saya ingin membahas peluang kerja sama."
};
var APP_VERSION = "1.0.0";
//#endregion
export { WA_MESSAGES as n, waLink as r, APP_VERSION as t };
