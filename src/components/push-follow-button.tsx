import { Bell, BellRing, Loader2 } from "lucide-react";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import { toast } from "sonner";

/**
 * Tombol "Ikuti Wilayah" untuk pengunjung (tanpa login).
 * Tidak dirender sampai pemeriksaan klien selesai agar SSR & hidrasi identik.
 */
export function PushFollowButton({ regionSlug, regionName, className = "" }: { regionSlug: string; regionName?: string; className?: string }) {
  const push = usePushSubscription();

  // Hindari hidrasi SSR mismatch: tunggu sampai pemeriksaan klien selesai.
  if (!push.ready) return null;

  const following = push.isFollowing(regionSlug);

  const onClick = async () => {
    if (!push.supported) {
      toast.error("Browser Anda belum mendukung notifikasi Rekomendify.");
      return;
    }

    if (!push.configured) {
      toast.error("Notifikasi belum dikonfigurasi di server.");
      return;
    }

    const ok = await push.toggleFollow(regionSlug, !following);
    if (ok) {
      toast.success(
        following
          ? "Notifikasi wilayah dimatikan."
          : `Kabar terbaru${regionName ? ` dari ${regionName}` : ""} akan dikirim ke perangkat ini.`,
      );
    } else if (push.error) {
      toast.error(push.error);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={push.busy}
      aria-pressed={following}
      title={following ? "Berhenti mengikuti wilayah" : "Ikuti wilayah ini untuk menerima notifikasi"}
      aria-label={following ? "Berhenti mengikuti wilayah" : "Ikuti wilayah ini"}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
        following ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:bg-accent/10"
      } ${className}`}
    >
      {push.busy ? <Loader2 className="size-3.5 animate-spin" /> : following ? <BellRing className="size-3.5" /> : <Bell className="size-3.5" />}
      {following ? "Diikuti" : "Ikuti"}
    </button>
  );
}
