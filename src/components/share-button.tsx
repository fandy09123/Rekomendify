import { useEffect, useState } from "react";
import { Share2, Copy, Check, X, MessageCircle, Send, Facebook } from "lucide-react";
import { toast } from "sonner";

const SHARE_TEXT = "Rekomendify — pemandu wisata digital hyperlocal. Scan QR atau pilih wilayah, langsung dapat info lokal.";

function targets(url: string, text: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, Icon: MessageCircle },
    { label: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}`, Icon: Send },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: Facebook },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, Icon: X },
  ];
}

export function ShareButton({
  title = "Rekomendify",
  text = SHARE_TEXT,
  url,
  className,
  label = "Bagikan",
}: {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(url ?? "");

  // window hanya tersedia di browser — hindari hydration mismatch.
  useEffect(() => {
    setShareUrl(url ?? window.location.href);
  }, [url]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const share = async () => {
    const link = shareUrl || window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: link });
        return;
      } catch {
        return; // user membatalkan
      }
    }
    setOpen(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || window.location.href);
      setCopied(true);
      toast.success("Tautan disalin");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Gagal menyalin tautan");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={share}
        aria-label="Bagikan Rekomendify"
        title="Bagikan"
        className={
          className ??
          "inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card p-1.5 text-xs font-semibold text-foreground transition hover:bg-accent/10 active:scale-95 min-[380px]:px-2.5 min-[380px]:py-1.5"
        }
      >
        <Share2 className="size-3.5" />
        <span className="hidden min-[380px]:inline">{label}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bagikan Rekomendify"
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-lift"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-lg">Bagikan Rekomendify</h2>
                <p className="truncate text-xs text-muted-foreground">{shareUrl}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Tutup" className="grid size-8 shrink-0 place-items-center rounded-full border border-border">
                <X className="size-4" />
              </button>
            </div>

            <ul className="mt-4 grid grid-cols-4 gap-3">
              {targets(shareUrl, text).map(({ label: l, href, Icon }) => (
                <li key={l}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-background p-3 text-[11px] font-medium transition hover:bg-accent/10 active:scale-95"
                  >
                    <Icon className="size-5 text-primary" />
                    {l}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={copy}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground active:scale-[0.99]"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Tautan disalin" : "Salin tautan"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
