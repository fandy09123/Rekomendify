/**
 * Perhitungan hari pasaran Jawa (siklus 5 hari) secara deterministik.
 * Tidak memakai database, API eksternal, maupun randomisasi.
 *
 * Acuan:
 * 1 Januari 1970 = Kamis Wage
 * 1 Januari 2000 = Sabtu Legi
 *
 * Dengan urutan pasaran:
 * Legi → Pahing → Pon → Wage → Kliwon
 *
 * Rumus:
 * PASARAN[(hari sejak epoch + 3) % 5]
 */

export const PASARAN = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"] as const;
export type Pasaran = (typeof PASARAN)[number];

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const;

const TZ = "Asia/Jakarta";

/** Ambil komponen tanggal lokal Indonesia (WIB) apa pun timezone perangkat. */
export function jakartaDateParts(now: Date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const [y, m, d] = fmt.format(now).split("-").map(Number);

  return {
    year: y,
    month: m,
    day: d,
  };
}

/** Info hari & pasaran untuk tanggal lokal Indonesia. */
export function javaneseDayInfo(now: Date = new Date()) {
  const { year, month, day } = jakartaDateParts(now);

  const utcMs = Date.UTC(year, month - 1, day);
  const days = Math.floor(utcMs / 86400000);

  // 1 Januari 1970 = Kamis Wage.
  // Dengan array PASARAN [Legi, Pahing, Pon, Wage, Kliwon],
  // maka offset yang benar adalah +3.
  const pasaran = PASARAN[((days + 3) % 5 + 5) % 5];

  // 1 Januari 1970 = Kamis (index 4).
  const dayName = HARI[((days + 4) % 7 + 7) % 7];

  return {
    pasaran,
    dayName,
    dateLabel: `${day} ${BULAN[month - 1]}`,

    /** Contoh: "Senin Legi" */
    short: `${dayName} ${pasaran}`,

    /** Contoh: "Senin, 25 Agustus" */
    long: `${dayName}, ${day} ${BULAN[month - 1]} ${year}`,

    iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}