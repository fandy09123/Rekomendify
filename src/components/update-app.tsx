import { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type UpdateStatus = "idle" | "checking" | "success" | "up-to-date" | "error";

/**
 * Kartu "Perbarui Aplikasi" untuk halaman Pengaturan.
 * Memungkinkan pengguna secara manual memeriksa dan menerapkan pembaruan Service Worker/PWA.
 */
export function UpdateAppCard() {
  const [status, setStatus] = useState<UpdateStatus>("idle");

  const handleUpdate = async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      setStatus("up-to-date");
      return;
    }

    if (typeof navigator.onLine === "boolean" && !navigator.onLine) {
      setStatus("error");
      return;
    }

    setStatus("checking");

    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
      }

      if (!reg) {
        setStatus("up-to-date");
        return;
      }

      let updateFound = false;

      // Listener bila ada Service Worker baru yang sedang di-install
      const handleUpdateFound = () => {
        const installingWorker = reg.installing;
        if (!installingWorker) return;
        updateFound = true;

        installingWorker.addEventListener("statechange", () => {
          if (installingWorker.state === "installed" || installingWorker.state === "activated") {
            setStatus("success");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        });
      };

      reg.addEventListener("updatefound", handleUpdateFound, { once: true });

      // Jika sudah ada Service Worker baru yang menggantung di state `waiting`
      if (reg.waiting) {
        updateFound = true;
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
        setStatus("success");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      }

      // Minta browser memeriksa bytecode/konten Service Worker di server
      await reg.update();

      // Berikan jeda toleransi untuk mendeteksi updatefound jika ada perbedaan
      setTimeout(() => {
        reg?.removeEventListener("updatefound", handleUpdateFound);
        if (!updateFound && !reg?.waiting && !reg?.installing) {
          setStatus("up-to-date");
        }
      }, 1500);

    } catch (err) {
      console.warn("[PWA Update] Gagal memeriksa pembaruan:", err);
      setStatus("error");
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">Pembaruan Aplikasi</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Pastikan aplikasi menggunakan resource terbaru.
      </p>

      {status === "idle" && (
        <button
          onClick={handleUpdate}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <RefreshCw className="size-3.5" /> Perbarui Aplikasi
        </button>
      )}

      {status === "checking" && (
        <button
          disabled
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/60 px-4 py-2 text-xs font-semibold text-primary-foreground opacity-80 cursor-not-allowed"
        >
          <Loader2 className="size-3.5 animate-spin" /> Memeriksa pembaruan...
        </button>
      )}

      {status === "success" && (
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Pembaruan berhasil diterapkan.</span>
        </div>
      )}

      {status === "up-to-date" && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Aplikasi sudah menggunakan versi terbaru.</span>
          </div>
          <button
            onClick={handleUpdate}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/10 transition"
          >
            <RefreshCw className="size-3.5" /> Periksa Lagi
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>Pembaruan belum berhasil. Pastikan koneksi internet Anda baik lalu coba lagi.</span>
          </div>
          <button
            onClick={handleUpdate}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <RefreshCw className="size-3.5" /> Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}
