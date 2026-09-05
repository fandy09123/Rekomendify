-- 1) qr_assets_public_resolve_overexposure: remove broad public SELECT policy and revoke anon table access
DROP POLICY IF EXISTS "qr_public_resolve" ON public.qr_assets;
REVOKE SELECT ON public.qr_assets FROM anon;

-- 2) storage_content_type: remove client-side insert path; uploads must go through server function using service_role
DROP POLICY IF EXISTS "IMAGE admin insert" ON storage.objects;