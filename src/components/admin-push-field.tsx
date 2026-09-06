import { Bell } from "lucide-react";
import { sendRegionPush } from "@/lib/push-admin.functions";
import { toast } from "sonner";

/**
 * Kontrol "kirim notifikasi" yang dipakai ulang di dialog admin.
 * Hanya mengumpulkan input; pengiriman dilakukan setelah entitas tersimpan.
 */
export interface PushDraft {
  enabled: boolean;
  title: string;
  body: string;
}

export const emptyPushDraft = (): PushDraft => ({ enabled: false, title: "", body: "" });

export function AdminPushField({
  value,
  onChange,
  label = "Kirim notifikasi ke pengikut wilayah",
  hint,
  titlePlaceholder,
  bodyPlaceholder,
}: {
  value: PushDraft;
  onChange: (v: PushDraft) => void;
  label?: string;
  hint?: string;
  titlePlaceholder?: string;
  bodyPlaceholder?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-3">
      <label className="flex items-start gap-2 text-sm font-medium">
        <input
          type="checkbox"
          className="mt-1"
          checked={value.enabled}
          onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
        />
        <span className="flex items-center gap-1.5">
          <Bell className="size-4 text-primary" /> {label}
        </span>
      </label>
      {hint && <p className="mt-1 pl-6 text-xs text-muted-foreground">{hint}</p>}
      {value.enabled && (
        <div className="mt-3 space-y-2 pl-6">
          <input
            maxLength={80}
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            placeholder={titlePlaceholder ?? "Judul notifikasi"}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <textarea
            maxLength={180}
            rows={2}
            value={value.body}
            onChange={(e) => onChange({ ...value, body: e.target.value })}
            placeholder={bodyPlaceholder ?? "Isi singkat notifikasi"}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Mengirim push setelah entitas tersimpan. Kegagalan push tidak boleh
 * menggagalkan penyimpanan data, jadi error hanya ditampilkan sebagai toast.
 */
export async function dispatchPush(input: {
  draft: PushDraft;
  entityType: "info_post" | "location" | "ad";
  entityId?: string | null;
  path?: string | null;
  fallbackTitle: string;
  fallbackBody: string;
}) {
  if (!input.draft.enabled) return;
  const title = input.draft.title.trim() || input.fallbackTitle;
  const body = input.draft.body.trim() || input.fallbackBody;
  if (!title || !body) {
    toast.error("Judul dan isi notifikasi tidak boleh kosong.");
    return;
  }
  try {
    const res = await sendRegionPush({
      data: { entityType: input.entityType, entityId: input.entityId ?? null, title, body, path: input.path ?? null },
    });
    if (res.duplicated) toast.info("Notifikasi serupa baru saja dikirim.");
    else toast.success(`Notifikasi terkirim ke ${res.sent} perangkat${res.failed ? `, ${res.failed} gagal` : ""}.`);
  } catch (e: any) {
    toast.error(e?.message ?? "Notifikasi gagal dikirim.");
  }
}
