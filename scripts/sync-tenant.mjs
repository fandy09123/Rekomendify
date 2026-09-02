/**
 * Sinkronisasi identitas tenant (desa) ke seluruh konfigurasi project.
 *
 *   tenant.config.json (+ .env opsional)
 *        -> src/tenant.generated.ts      (Web / App Shell)
 *        -> capacitor.config.ts          (blok TENANT_CONFIG)
 *        -> android/app/build.gradle     (blok TENANT_CONFIG: namespace + applicationId)
 *        -> android/app/src/main/res/values/strings.xml
 *        -> package Java MainActivity (direktori + deklarasi package + trusted host)
 *
 * Prinsip: fail-safe. Semua file dibaca & diverifikasi lebih dulu; penulisan
 * hanya dilakukan bila SEMUA target cocok strukturnya. Tidak ada blind
 * search-replace, tidak ada file backup (gunakan `git diff`).
 *
 * Jalankan: npm run sync-tenant [-- --dry-run]
 */
import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { ROOT, loadTenantConfig, TenantConfigError } from "./tenant-config.mjs";

const dryRun = process.argv.includes("--dry-run");

function abort(title, detail) {
  console.error(`\n❌ ${title}`);
  if (detail) console.error(detail);
  console.error("\nNo files were modified.\n");
  process.exit(1);
}

const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");

/** Setiap entri: { file, contents, label }. Ditulis hanya di akhir. */
const writes = [];
/** Perpindahan direktori Java: { from, to, files: [{path, contents}] }. */
let javaMove = null;
const summary = [];

// ---------------------------------------------------------------------------
// 1. Config
// ---------------------------------------------------------------------------
let tenant;
let sources;
try {
  const loaded = await loadTenantConfig();
  tenant = loaded.config;
  sources = loaded.sources;
} catch (error) {
  if (error instanceof TenantConfigError) abort("Tenant configuration invalid.", error.message);
  throw error;
}

console.log("========================================");
console.log("TENANT CONFIGURATION");
console.log("========================================");
console.log(`Village slug  : ${tenant.villageSlug}`);
console.log(`Village name  : ${tenant.villageName}`);
console.log(`App Name      : ${tenant.appName}`);
console.log(`Application ID: ${tenant.appId}`);
console.log(`Target URL    : ${tenant.targetUrl}`);
console.log(`Trusted host  : *.${tenant.trustedHostSuffix}`);
console.log(`Sumber nilai  : ${[...new Set(Object.values(sources))].join(", ")}`);
console.log("✓ Configuration valid");

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
async function mustRead(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!existsSync(abs)) abort(`Required file not found: ${relPath}`);
  return { abs, contents: await readFile(abs, "utf8") };
}

function replaceMarkerBlock(contents, relPath, block) {
  const re = /(\/\/ TENANT_CONFIG_START[^\n]*\n)[\s\S]*?(\n\/\/ TENANT_CONFIG_END)/;
  if (!re.test(contents)) {
    abort(
      "Expected configuration structure not found.",
      `Marker TENANT_CONFIG tidak ada di ${relPath}.`,
    );
  }
  return contents.replace(re, (_m, start, end) => `${start}${block}${end}`);
}

function queue(abs, contents, label) {
  writes.push({ abs, contents, label });
}

const jsStr = (value) => JSON.stringify(value);
const xmlEscape = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------------------------------------------------------------------------
// 2. Web / App Shell: src/tenant.generated.ts
// ---------------------------------------------------------------------------
{
  const abs = path.join(ROOT, "src", "tenant.generated.ts");
  const contents = `/**
 * FILE INI DIHASILKAN OTOMATIS — JANGAN DIEDIT MANUAL.
 * Sumber: tenant.config.json (+ override .env). Regenerate: \`npm run sync-tenant\`.
 */
export const TENANT = {
  VILLAGE_SLUG: ${jsStr(tenant.villageSlug)},
  VILLAGE_NAME: ${jsStr(tenant.villageName)},
  APP_NAME: ${jsStr(tenant.appName)},
  TARGET_URL: ${jsStr(tenant.targetUrl)},
} as const;
`;
  queue(abs, contents, "Web/App Shell target configuration (src/tenant.generated.ts)");
}

// ---------------------------------------------------------------------------
// 3. capacitor.config.ts
// ---------------------------------------------------------------------------
{
  const { abs, contents } = await mustRead("capacitor.config.ts");
  const hosts = [
    tenant.targetHost,
    tenant.trustedHostSuffix,
    `*.${tenant.trustedHostSuffix}`,
  ].filter((value, index, arr) => arr.indexOf(value) === index);
  const block = `const TENANT = {
  appId: ${jsStr(tenant.appId)},
  appName: ${jsStr(tenant.appName)},
  navigationHosts: [${hosts.map(jsStr).join(", ")}],
};`;
  queue(abs, replaceMarkerBlock(contents, "capacitor.config.ts", block), "capacitor.config.ts");
}

// ---------------------------------------------------------------------------
// 4. android/app/build.gradle
// ---------------------------------------------------------------------------
{
  const relPath = "android/app/build.gradle";
  const { abs, contents } = await mustRead(relPath);
  if (
    !/namespace\s+tenantApplicationId/.test(contents) ||
    !/applicationId\s+tenantApplicationId/.test(contents)
  ) {
    abort(
      "Expected Android configuration structure not found.",
      `${relPath} harus memakai \`namespace tenantApplicationId\` dan \`applicationId tenantApplicationId\`.`,
    );
  }
  const block = `def tenantApplicationId = ${jsStr(tenant.appId)}`;
  queue(
    abs,
    replaceMarkerBlock(contents, relPath, block),
    "Android applicationId + namespace (build.gradle)",
  );
}

// ---------------------------------------------------------------------------
// 5. strings.xml
// ---------------------------------------------------------------------------
{
  const relPath = "android/app/src/main/res/values/strings.xml";
  const { abs, contents } = await mustRead(relPath);
  const values = {
    app_name: tenant.appName,
    title_activity_main: tenant.appName,
    package_name: tenant.appId,
    custom_url_scheme: tenant.appId,
  };
  let next = contents;
  for (const [key, value] of Object.entries(values)) {
    const re = new RegExp(`(<string name="${key}">)([\\s\\S]*?)(</string>)`);
    if (!re.test(next)) {
      abort(
        "Expected Android configuration structure not found.",
        `String "${key}" tidak ada di ${relPath}.`,
      );
    }
    next = next.replace(re, (_m, open, _old, close) => `${open}${xmlEscape(value)}${close}`);
  }
  queue(abs, next, "Android strings.xml (app_name, title, package)");
}

// ---------------------------------------------------------------------------
// 6. Package Java (direktori + deklarasi package + trusted host)
// ---------------------------------------------------------------------------
{
  const javaRoot = path.join(ROOT, "android", "app", "src", "main", "java");
  if (!existsSync(javaRoot)) {
    abort(
      "Expected Android configuration structure not found.",
      "Folder android/app/src/main/java tidak ada.",
    );
  }

  // Cari direktori yang berisi MainActivity.java (satu-satunya sumber paket app).
  const found = [];
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(abs);
      else if (entry.name === "MainActivity.java") found.push(abs);
    }
  };
  await walk(javaRoot);
  if (found.length !== 1) {
    abort(
      "Unsafe tenant sync. Manual review required.",
      `Ditemukan ${found.length} MainActivity.java di android/app/src/main/java (harus tepat 1).`,
    );
  }

  const currentDir = path.dirname(found[0]);
  const targetDir = path.join(javaRoot, ...tenant.appId.split("."));
  const entries = await readdir(currentDir, { withFileTypes: true });
  if (entries.some((e) => e.isDirectory())) {
    abort(
      "Unsafe tenant sync. Manual review required.",
      `${rel(currentDir)} memiliki sub-package; pindahkan paket Java secara manual.`,
    );
  }

  const currentPackage = path.relative(javaRoot, currentDir).split(path.sep).join(".");
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".java")) continue;
    const abs = path.join(currentDir, entry.name);
    let source = await readFile(abs, "utf8");
    if (!new RegExp(`^package\\s+${currentPackage.replace(/\./g, "\\.")}\\s*;`, "m").test(source)) {
      abort(
        "Expected configuration structure not found.",
        `Deklarasi package di ${rel(abs)} tidak cocok dengan direktorinya (${currentPackage}).`,
      );
    }
    source = source.replace(/^package\s+[\w.]+\s*;/m, `package ${tenant.appId};`);

    if (entry.name === "MainActivity.java") {
      const hostRe = /(private static final String TRUSTED_HOST_SUFFIX = )"[^"]*"(;)/;
      if (!hostRe.test(source)) {
        abort(
          "Expected configuration structure not found.",
          "Konstanta TRUSTED_HOST_SUFFIX tidak ditemukan di MainActivity.java.",
        );
      }
      source = source.replace(hostRe, (_m, a, b) => `${a}${jsStr(tenant.trustedHostSuffix)}${b}`);
    }
    files.push({ name: entry.name, contents: source });
  }
  if (files.length === 0) {
    abort(
      "Unsafe tenant sync. Manual review required.",
      "Tidak ada file .java pada paket aplikasi.",
    );
  }

  if (path.resolve(currentDir) !== path.resolve(targetDir)) {
    javaMove = { from: currentDir, to: targetDir, files, javaRoot };
    summary.push(`Java package ${currentPackage} -> ${tenant.appId}`);
  } else {
    for (const file of files) {
      queue(
        path.join(targetDir, file.name),
        file.contents,
        `Java ${file.name} (package + trusted host)`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 7. Tulis (atau tampilkan dry-run)
// ---------------------------------------------------------------------------
const changed = [];
for (const w of writes) {
  const isNew = !existsSync(w.abs);
  if (isNew || (await readFile(w.abs, "utf8")) !== w.contents) changed.push(w);
}

if (dryRun) {
  console.log("\n--dry-run: tidak ada file yang ditulis.\nWill change:");
  if (changed.length === 0 && !javaMove) console.log("  (tidak ada perubahan — sudah sinkron)");
  for (const w of changed) console.log(`  ${rel(w.abs)}`);
  if (javaMove)
    console.log(
      `  ${rel(javaMove.from)} -> ${rel(javaMove.to)} (${javaMove.files.length} file .java)`,
    );
  process.exit(0);
}

if (javaMove) {
  await mkdir(javaMove.to, { recursive: true });
  for (const file of javaMove.files) {
    await writeFile(path.join(javaMove.to, file.name), file.contents, "utf8");
  }
  await rm(javaMove.from, { recursive: true, force: true });
  // Bersihkan direktori induk yang menjadi kosong.
  let parent = path.dirname(javaMove.from);
  while (parent.startsWith(javaMove.javaRoot) && parent !== javaMove.javaRoot) {
    if ((await readdir(parent)).length > 0) break;
    await rm(parent, { recursive: true, force: true });
    parent = path.dirname(parent);
  }
}

for (const w of writes) {
  await writeFile(w.abs, w.contents, "utf8");
}

console.log("✓ Android identity updated");
console.log("✓ Web target updated");
console.log("\n========================================");
console.log("TENANT SYNC SUCCESS");
console.log("========================================\n");
console.log(`Village       : ${tenant.villageName}`);
console.log(`App Name      : ${tenant.appName}`);
console.log(`App ID        : ${tenant.appId}`);
console.log(`Target URL    : ${tenant.targetUrl}\n`);
console.log("Updated:");
const labels = [...new Set([...changed.map((w) => w.label), ...summary])];
if (labels.length === 0) console.log("  (semua file sudah sinkron)");
for (const label of labels) console.log(`✓ ${label}`);
console.log(`\n⚠ Application ID = ${tenant.appId}`);
console.log("  Mengubah Application ID berarti APK/aplikasi Android yang BERBEDA");
console.log("  (tidak bisa update aplikasi lama di Play Store).");
console.log("\nNext steps:");
console.log("1. git diff        (periksa perubahan tenant)");
console.log("2. npm run build:capacitor");
console.log("3. npx cap sync android");
console.log(
  "4. cd android && .\\gradlew.bat assembleDebug   (macOS/Linux: ./gradlew assembleDebug)",
);
console.log("========================================\n");
