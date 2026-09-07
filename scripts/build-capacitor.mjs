/**
 * Orkestrator build APK (lintas platform, aman di Windows PowerShell):
 *
 *   1. sync-tenant           → konfigurasi tenant disinkronkan
 *   2. vite build (CAP_BUILD=1) → bundel React lokal + shell statis
 *   3. build-capacitor-shell → salin hasilnya ke dist/capacitor
 *
 * Setelah ini: `npx cap sync android` lalu `.\gradlew.bat assembleDebug`.
 */
import { spawnSync } from "node:child_process";

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) {
    console.error(`\n[capacitor] Gagal pada: ${command} ${args.join(" ")}\n`);
    process.exit(result.status ?? 1);
  }
}

run("node", ["scripts/sync-tenant.mjs"]);
run("npx", ["vite", "build"], { CAP_BUILD: "1" });
run("node", ["scripts/build-capacitor-shell.mjs"]);
