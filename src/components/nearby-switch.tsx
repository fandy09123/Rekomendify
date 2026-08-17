import { MapPin, Loader2, Shuffle } from "lucide-react";

/**
 * Sakelar urutan: acak (default) atau terdekat dari posisi pengguna.
 * Permission tidak pernah dipaksa — jika ditolak, daftar tetap tampil normal.
 */
export function NearbySwitch({
  active,
  state,
  onNearby,
  onDefault,
}: {
  active: boolean;
  state: "idle" | "loading" | "granted" | "denied" | "unsupported";
  onNearby: () => void;
  onDefault: () => void;
}) {
  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDefault}
          aria-pressed={!active}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
            !active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
          }`}
        >
          <Shuffle className="size-3.5" /> Semua
        </button>
        <button
          type="button"
          onClick={onNearby}
          aria-pressed={active}
          disabled={state === "loading"}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
            active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
          }`}
        >
          {state === "loading" ? <Loader2 className="size-3.5 animate-spin" /> : <MapPin className="size-3.5" />} Terdekat
        </button>
      </div>
      {state === "idle" && (
        <p className="mt-2 text-xs text-muted-foreground">
          Pilih “Terdekat” untuk mengurutkan tempat berdasarkan jarak. Browser akan menanyakan izin lokasi, dan
          posisi Anda hanya dipakai di perangkat ini untuk menghitung jarak.
        </p>
      )}
      {state === "denied" && (
        <p className="mt-2 text-xs text-muted-foreground">
          Aktifkan izin lokasi di browser (ikon gembok pada address bar → Lokasi) untuk melihat tempat terdekat.
          Daftar tetap bisa dijelajahi seperti biasa.
        </p>
      )}
      {state === "unsupported" && (
        <p className="mt-2 text-xs text-muted-foreground">Perangkat ini belum mendukung deteksi lokasi.</p>
      )}

    </div>
  );
}
