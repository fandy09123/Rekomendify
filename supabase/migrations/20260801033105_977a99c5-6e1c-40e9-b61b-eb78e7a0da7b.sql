
DROP FUNCTION IF EXISTS public.resolve_qr_public(text);

-- Column-scoped public read of qr_assets: only id, code, status.
REVOKE SELECT ON public.qr_assets FROM anon;
GRANT SELECT (id, code, status) ON public.qr_assets TO anon;

DROP POLICY IF EXISTS qr_public_resolve ON public.qr_assets;
CREATE POLICY qr_public_resolve
ON public.qr_assets FOR SELECT
TO anon
USING (true);
