-- Restrict anonymous QR resolution: only QR assets with an active assignment in a published region
REVOKE SELECT ON public.qr_assets FROM anon;
GRANT SELECT (id, code, status) ON public.qr_assets TO anon;

DROP POLICY IF EXISTS qr_public_resolve ON public.qr_assets;
CREATE POLICY qr_public_resolve
ON public.qr_assets FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.qr_assignments qa
    JOIN public.regions r ON r.id = qa.region_id
    WHERE qa.qr_id = qr_assets.id
      AND qa.released_at IS NULL
      AND r.is_published = true
  )
);