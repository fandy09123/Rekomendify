import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { PageShell } from "@/components/rekomendify";
import { ArrowLeft, Bell, BellOff, CheckCheck, Trash2 } from "lucide-react";
import {
  listNotifications,
  markRead,
  markAllRead,
  clearNotifications,
  subscribeInbox,
  formatRelative,
  type InboxItem,
} from "@/lib/notification-inbox";

export const Route = createFileRoute("/notifikasi")({
  head: () => ({
    meta: [
      { title: "Notifikasi — Rekomendify" },
      {
        name: "description",
        content: "Riwayat notifikasi Rekomendify yang tersimpan di perangkat Anda, tetap bisa dibuka saat offline.",
      },
      { property: "og:title", content: "Notifikasi — Rekomendify" },
      { property: "og:description", content: "Riwayat notifikasi wilayah yang tersimpan lokal di perangkat Anda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotifikasiPage,
});

function NotifikasiPage() {
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    listNotifications().then((rows) => {
      setItems(rows);
      setLoaded(true);
    });
  }, []);

  // Semua akses IndexedDB terjadi setelah hidrasi agar markup SSR identik.
  useEffect(() => {
    refresh();
    return subscribeInbox(refresh);
  }, [refresh]);

  const open = async (n: InboxItem) => {
    await markRead(n.id);
    refresh();
    if (n.url?.startsWith("/")) router.navigate({ to: n.url });
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-5 pt-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Kembali
        </Link>

        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">Notifikasi</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {unread > 0 ? `${unread} belum dibaca` : "Riwayat notifikasi di perangkat ini"}
            </p>
          </div>
          {items.length > 0 && (
            <div className="flex gap-2 pb-1">
              <button
                type="button"
                onClick={() => markAllRead().then(refresh)}
                title="Tandai semua dibaca"
                aria-label="Tandai semua dibaca"
                className="rounded-full border border-border bg-card p-2 text-muted-foreground transition hover:text-foreground"
              >
                <CheckCheck className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => clearNotifications().then(refresh)}
                title="Hapus riwayat"
                aria-label="Hapus riwayat notifikasi"
                className="rounded-full border border-border bg-card p-2 text-muted-foreground transition hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}
        </div>

        {loaded && items.length === 0 ? (
          <div className="mt-8 grid place-items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <BellOff className="size-7" />
            </div>
            <h2 className="mt-4 font-display text-xl">Belum ada notifikasi</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Aktifkan tombol “Ikuti” di halaman wilayah untuk menerima kabar terbaru. Notifikasi yang masuk akan
              tersimpan di sini dan tetap bisa dibaca tanpa internet.
            </p>
          </div>
        ) : (
          <ul className="mt-5 space-y-2.5">
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => open(n)}
                  className={`flex w-full gap-3 rounded-2xl border p-3.5 text-left transition ${
                    n.read ? "border-border bg-card" : "border-primary/40 bg-primary/5"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${
                      n.read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                    }`}
                  >
                    <Bell className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-display text-base leading-tight">{n.title}</span>
                      {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                    </span>
                    {n.body && <span className="mt-0.5 block line-clamp-2 text-sm text-foreground/80">{n.body}</span>}
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formatRelative(n.receivedAt)}</span>
                      {n.regionSlug && (
                        <span className="rounded-full bg-muted px-2 py-0.5 uppercase tracking-wide">{n.regionSlug}</span>
                      )}
                      {n.type && <span className="rounded-full bg-muted px-2 py-0.5">{n.type}</span>}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Riwayat ini tersimpan lokal di perangkat Anda. Notifikasi baru tetap dikirim lewat Web Push dan membutuhkan
          koneksi internet.
        </p>
      </div>
    </PageShell>
  );
}
