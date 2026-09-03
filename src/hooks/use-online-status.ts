import { useEffect, useState } from "react";

/**
 * Status koneksi perangkat. Hanya membaca event online/offline browser —
 * tidak melakukan request apa pun, sehingga aman dipakai di WebView Capacitor
 * maupun PWA terpasang.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const sync = () => setOnline(navigator.onLine !== false);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return online;
}
