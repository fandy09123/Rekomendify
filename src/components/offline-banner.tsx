import { useEffect, useRef, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * Indikator jaringan ringan.
 * - Offline  : bar permanen "Mode offline — menampilkan data tersimpan".
 * - Kembali  : bar hijau singkat, tanpa memicu refetch massal (data stale akan
 *              diperbarui secara alami pada navigasi/mount berikutnya).
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const wasOffline = useRef(false);
  const [reconnected, setReconnected] = useState(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      setReconnected(false);
      return;
    }
    if (!wasOffline.current) return;
    wasOffline.current = false;
    setReconnected(true);
    const t = setTimeout(() => setReconnected(false), 2500);
    return () => clearTimeout(t);
  }, [online]);

  if (online && !reconnected) return null;

  return (
    <div
      role="status"
      className={`fixed inset-x-0 bottom-0 z-[60] flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white ${
        online ? "bg-accent" : "bg-ink/90"
      }`}
      style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
    >
      {online ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
      {online ? "Koneksi kembali tersambung" : "Mode offline — menampilkan konten tersimpan"}
    </div>
  );
}
