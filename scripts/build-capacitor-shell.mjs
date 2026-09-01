/**
 * Menghasilkan App Shell statis untuk Capacitor.
 *
 * Latar belakang: build web project ini adalah build SSR (dijalankan di server),
 * sedangkan Capacitor membutuhkan folder statis berisi index.html yang bisa
 * dibundel ke dalam APK. Script ini menghasilkan versi statis dari App Shell:
 *
 *    dist/capacitor/
 *      index.html      <- App Shell (loading / offline / redirect)
 *      assets/*.css    <- CSS Tailwind hasil build (kelas yang sama dgn versi React)
 *      favicon.ico
 *
 * Nilai TARGET_URL & VILLAGE_NAME dibaca langsung dari src/config.ts sehingga
 * tetap ada satu sumber konfigurasi.
 *
 * Jalankan: npm run build:capacitor
 */
import { mkdir, readdir, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { loadTenantConfig } from "./tenant-config.mjs";

const root = process.cwd();

// Mengarahkan clientDir ke folder output Nitro (.output/public), atau dist/client sebagai fallback
const nitroPublicDir = path.join(root, ".output", "public");
const fallbackClientDir = path.join(root, "dist", "client");
const clientDir = existsSync(nitroPublicDir) ? nitroPublicDir : fallbackClientDir;

const outDir = path.join(root, "dist", "capacitor");

function fail(message) {
  console.error(`\n[capacitor-shell] ${message}\n`);
  process.exit(1);
}

// --- 1. Baca konfigurasi tenant (single source of truth) ---------------------
let TARGET_URL;
let VILLAGE_NAME;
try {
  const { config } = await loadTenantConfig();
  TARGET_URL = config.targetUrl;
  VILLAGE_NAME = config.villageName;
} catch (error) {
  fail(`Konfigurasi tenant tidak valid:\n${error.message}`);
}

// --- 2. Ambil CSS Tailwind hasil build --------------------------------------
if (!existsSync(clientDir)) {
  fail(`Folder aset tidak ditemukan di ${clientDir}. Jalankan \`npm run build\` terlebih dahulu.`);
}
const assets = await readdir(path.join(clientDir, "assets"));
const cssFile = assets.find((f) => f.endsWith(".css"));
if (!cssFile) fail(`Tidak menemukan file CSS di ${clientDir}/assets.`);

await mkdir(path.join(outDir, "assets"), { recursive: true });
await copyFile(path.join(clientDir, "assets", cssFile), path.join(outDir, "assets", cssFile));
if (existsSync(path.join(clientDir, "favicon.ico"))) {
  await copyFile(path.join(clientDir, "favicon.ico"), path.join(outDir, "favicon.ico"));
}

// --- 3. Tulis index.html statis ---------------------------------------------
const escape = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

const html = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#ffffff" />
    <title>${escape(VILLAGE_NAME)}</title>
    <link rel="icon" href="favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="assets/${cssFile}" />
  </head>
  <body>
    <main id="loading" class="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">${escape(VILLAGE_NAME)}</h1>
        <p id="loading-message" class="text-sm text-muted-foreground">Menyiapkan aplikasi...</p>
      </div>
      <div role="status" class="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"></div>
    </main>

    <main id="offline" hidden class="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div class="flex flex-col gap-3">
        <p class="text-sm font-medium text-muted-foreground">${escape(VILLAGE_NAME)}</p>
        <h1 class="text-xl font-semibold tracking-tight text-foreground">Koneksi Terputus</h1>
        <p class="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Aplikasi belum dapat terhubung. Harap periksa jaringan Anda lalu coba lagi.
        </p>
      </div>
      <button id="retry" type="button"
        class="inline-flex h-11 min-w-36 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
        Coba Lagi
      </button>
    </main>

    <script>
      (function () {
        var TARGET_URL = ${JSON.stringify(TARGET_URL)};
        var PROBE_TIMEOUT_MS = 6000;
        var loading = document.getElementById("loading");
        var offline = document.getElementById("offline");
        var message = document.getElementById("loading-message");
        var retry = document.getElementById("retry");
        var redirected = false;

        function show(el) {
          loading.hidden = el !== loading;
          offline.hidden = el !== offline;
        }

        function reachable() {
          if (navigator.onLine === false) return Promise.resolve(false);
          var controller = new AbortController();
          var timer = setTimeout(function () { controller.abort(); }, PROBE_TIMEOUT_MS);
          return fetch(TARGET_URL + "?_shell=" + Date.now(), {
            mode: "no-cors", cache: "no-store", signal: controller.signal
          }).then(function () { return true; })
            .catch(function (error) { console.warn("[app-shell] probe failed:", error); return false; })
            .then(function (ok) { clearTimeout(timer); return ok; });
        }

        function attempt() {
          if (redirected) return;
          message.textContent = "Menyiapkan aplikasi...";
          show(loading);
          retry.disabled = true;
          reachable().then(function (ok) {
            retry.disabled = false;
            if (!ok) { show(offline); return; }
            redirected = true;
            message.textContent = "Membuka aplikasi...";
            window.location.replace(TARGET_URL);
          });
        }

        retry.addEventListener("click", attempt);
        window.addEventListener("online", function () { if (!offline.hidden) attempt(); });

        // Tombol Back Android & permission hardware ditangani di lapisan
        // native (MainActivity.java), bukan di App Shell.

        attempt();
      })();
    </script>
  </body>
</html>
`;

await writeFile(path.join(outDir, "index.html"), html, "utf8");
console.log(`[capacitor-shell] dist/capacitor siap. Target: ${TARGET_URL}`);
