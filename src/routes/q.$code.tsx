import { createFileRoute, redirect } from "@tanstack/react-router";
import { resolveQrCode, recordVisit } from "@/lib/public.functions";

export const Route = createFileRoute("/q/$code")({
  loader: async ({ params }) => {
    const result = await resolveQrCode({ data: { code: params.code } });
    if (!result) throw redirect({ to: "/", search: { qr: "not_found" } as any });
    const { assignment } = result;
    if (!assignment) throw redirect({ to: "/", search: { qr: "inactive" } as any });
    const region = (assignment as any).regions;
    const location = (assignment as any).locations;
    // Fire-and-forget visit record (best-effort during SSR; client will not re-run)
    recordVisit({
      data: {
        regionId: assignment.region_id,
        locationId: assignment.location_id,
        qrAssignmentId: assignment.id,
        source: "qr",
      },
    }).catch(() => {});
    if (location?.slug && region?.slug) {
      throw redirect({ to: "/r/$slug/$loc", params: { slug: region.slug, loc: location.slug }, search: { src: "qr" } as any });
    }
    if (region?.slug) {
      throw redirect({ to: "/r/$slug", params: { slug: region.slug }, search: { src: "qr" } });
    }
    throw redirect({ to: "/" });
  },
  component: () => null,
});
