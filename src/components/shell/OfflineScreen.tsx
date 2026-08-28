import { APP_CONFIG } from "@/config";

export function OfflineScreen({
  title,
  description,
  onRetry,
  retrying,
}: {
  title: string;
  description: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">{APP_CONFIG.VILLAGE_NAME}</p>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="inline-flex h-11 min-w-36 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {retrying ? "Mencoba..." : "Coba Lagi"}
      </button>
    </main>
  );
}
