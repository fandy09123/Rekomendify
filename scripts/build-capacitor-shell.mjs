/**
 * Menyalin hasil build STATIS (mode CAP_BUILD=1) ke folder `webDir` Capacitor.
 *
 *    dist/capacitor/
 *      index.html        <- shell SPA hasil prerender (boot router React lokal)
 *      assets/**         <- seluruh JS/CSS aplikasi (dibundel ke dalam APK)
 *      icon-*.png, dll   <- aset publik
 *
 * TIDAK ada HTML yang ditulis tangan di sini, dan TIDAK ada redirect ke
 * website remote: UI aplikasi Android berasal dari bundel React lokal ini.
 *
 * Jalankan lewat: npm run build:capacitor
 */
import { cp, mkdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "dist", "capacitor");

const CANDIDATES = [
  path.join(root, ".output", "public"),
  path.join(root, "dist", "client"),
  path.join(root, "dist", "public"),
];

function fail(message) {
  console.error(`\n[capacitor] ${message}\n`);
  process.exit(1);
}

const sourceDir = CANDIDATES.find((dir) => existsSync(path.join(dir, "index.html")));

if (!sourceDir) {
  fail(
    "Tidak menemukan hasil build statis berisi index.html.\n" +
      `Sudah dicek: ${CANDIDATES.map((d) => path.relative(root, d)).join(", ")}\n` +
      "Pastikan build dijalankan dengan CAP_BUILD=1 (gunakan `npm run build:capacitor`).",
  );
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await cp(sourceDir, outDir, { recursive: true });

// Service Worker web tidak dipakai di dalam APK (aset sudah lokal); membiarkannya
// justru bisa menyajikan HTML lama. Web/PWA tetap memakai public/sw.js seperti biasa.
await rm(path.join(outDir, "sw.js"), { force: true });

const html = await stat(path.join(outDir, "index.html"));

console.log(`[capacitor] Sumber   : ${path.relative(root, sourceDir)}`);
console.log(`[capacitor] Output   : ${path.relative(root, outDir)}`);
console.log(`[capacitor] index.html: ${(html.size / 1024).toFixed(1)} KB`);
console.log("[capacitor] Selesai. Lanjutkan dengan: npx cap sync android");
