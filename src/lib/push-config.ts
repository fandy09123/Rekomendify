/**
 * Satu-satunya sumber VAPID **public** key untuk sisi frontend.
 *
 * Public key memang dirancang untuk dipakai di browser (dikirim ke push
 * service sebagai `applicationServerKey`), jadi aman berada di bundle.
 * Private key TIDAK pernah ada di sini — ia hanya hidup sebagai env var
 * server (VAPID_PRIVATE_KEY) di deployment backend.
 *
 * Nilai env (VITE_VAPID_PUBLIC_KEY / VAPID_PUBLIC_KEY di server) tetap
 * diprioritaskan bila tersedia, sehingga rotasi key cukup dilakukan di
 * environment variable tanpa mengubah kode.
 */
export const DEFAULT_VAPID_PUBLIC_KEY =
  "BMvbOkQOWVOUQK3dcxqAtGIxV6f_hRLtTGnYSXkh6TzkaKqoUjp819YrxqGRDekGwIrXHgtLfOWxWQdiM13qzcE";
