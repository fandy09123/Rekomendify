import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rekomendify";
import { MessageSquare, Bell } from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Pesan — Rekomendify" },
      { name: "description", content: "Notifikasi dan pesan dari pengelola wilayah Rekomendify." },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-md px-5 pt-10">
        <h1 className="font-display text-3xl">Pesan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kotak masuk pengumuman dan info.</p>

        <Link
          to="/notifikasi"
          className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:bg-accent/10"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Bell className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-base">Riwayat Notifikasi</span>
            <span className="block text-xs text-muted-foreground">
              Notifikasi yang pernah masuk ke perangkat ini, bisa dibuka offline.
            </span>
          </span>
        </Link>


        <div className="mt-8 grid place-items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <MessageSquare className="size-7" />
          </div>
          <h2 className="mt-4 font-display text-xl">Belum ada pesan</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fitur pesan akan segera hadir. Pengumuman dari pengelola wilayah akan muncul di sini.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
