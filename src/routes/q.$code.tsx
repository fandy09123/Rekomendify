import { createFileRoute, redirect } from "@tanstack/react-router";
import { resolveQrCode, recordVisit } from "@/lib/public-data";

export const Route = createFileRoute("/q/$code")({
  loader: async ({ params }) => {
    const code = params.code?.trim();
    if (!code) {
      throw redirect({ to: "/", search: { qr: "not_found" } as any });
    }

    const result = await resolveQrCode({ data: { code } });
    if (!result) {
      throw redirect({ to: "/", search: { qr: "not_found" } as any });
    }

    const { assignment } = result;
    if (!assignment) {
      throw redirect({ to: "/", search: { qr: "inactive" } as any });
    }

    const region = (assignment as any).regions;
    const location = (assignment as any).locations;

    // Catat kunjungan QR hanya jika region_id valid (bot otomatis diabaikan oleh recordVisit)
    if (assignment.region_id) {
      recordVisit({
        data: {
          regionId: assignment.region_id,
          locationId: assignment.location_id,
          qrAssignmentId: assignment.id,
          source: "qr",
        },
      }).catch(() => {});
    }

    if (location?.slug && region?.slug) {
      throw redirect({
        to: "/r/$slug/$loc",
        params: { slug: region.slug, loc: location.slug },
        search: { src: "qr" } as any,
      });
    }

    if (region?.slug) {
      throw redirect({
        to: "/r/$slug",
        params: { slug: region.slug },
        search: { src: "qr" } as any,
      });
    }

    throw redirect({ to: "/" });
  },
  component: () => null,
});
