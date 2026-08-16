import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Deteksi sesi admin di sisi klien saja. Nilai awal `null` = belum diketahui,
 * sehingga markup SSR & hidrasi pertama identik (tidak ada hydration mismatch)
 * dan menu admin tidak pernah "berkedip" untuk pengguna biasa.
 */
export function useAdminSession() {
  const [email, setEmail] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setEmail(data.session?.user?.email ?? null);
      setResolved(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
      setResolved(true);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { email, isAdmin: !!email, resolved };
}
