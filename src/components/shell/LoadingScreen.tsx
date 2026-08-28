import { APP_CONFIG } from "@/config";

export function LoadingScreen({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {APP_CONFIG.VILLAGE_NAME}
        </h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <div
        role="status"
        aria-label={message}
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
      />
    </main>
  );
}
