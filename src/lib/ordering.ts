import { useEffect, useState } from "react";

/** PRNG deterministik agar urutan stabil untuk seed yang sama. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Pengacakan stabil: urutan berubah antar sesi, tetapi tidak berubah
 * saat komponen re-render. seed = 0 berarti urutan asli (SSR & render pertama).
 */
export function seededShuffle<T>(items: readonly T[], seed: number, salt = ""): T[] {
  const out = items.slice();
  if (!seed) return out;
  const rnd = mulberry32(seed ^ hash(salt));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Seed per pemuatan halaman (bukan per sesi): setiap refresh/reload menghasilkan
 * urutan baru, tetapi tetap stabil selama halaman dibuka & saat navigasi antar
 * rute (nilai disimpan di modul, bukan di state komponen).
 * Bernilai 0 pada server dan render pertama agar hidrasi tetap cocok.
 */
let PAGE_SEED = 0;

function getPageSeed(): number {
  if (!PAGE_SEED) PAGE_SEED = Math.floor(Math.random() * 2147483647) + 1;
  return PAGE_SEED;
}

export function useSessionSeed(): number {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    setSeed(getPageSeed());
  }, []);
  return seed;
}

