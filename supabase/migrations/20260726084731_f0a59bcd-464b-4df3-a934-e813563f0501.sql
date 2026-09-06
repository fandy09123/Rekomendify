
-- Helper: is caller an activated admin?
CREATE OR REPLACE FUNCTION private.is_active_admin(_uid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _uid AND p.is_active = true)
$$;

-- 1) storage_insert_any_authed + input_validation: restrict IMAGE bucket inserts
DROP POLICY IF EXISTS "IMAGE admin insert" ON storage.objects;
CREATE POLICY "IMAGE admin insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'IMAGE'
  AND owner = auth.uid()
  AND (
    private.has_role(auth.uid(), 'super_admin'::app_role)
    OR (private.current_admin_region_id() IS NOT NULL AND private.is_active_admin(auth.uid()))
  )
  AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif')
);

-- 2) audit_logs_arbitrary_insert: add scoped insert policy
DROP POLICY IF EXISTS audit_scoped_insert ON public.audit_logs;
CREATE POLICY audit_scoped_insert ON public.audit_logs
FOR INSERT TO authenticated
WITH CHECK (
  actor_id = auth.uid()
  AND private.is_active_admin(auth.uid())
  AND (
    private.has_role(auth.uid(), 'super_admin'::app_role)
    OR (region_id IS NOT NULL AND private.has_region_access(auth.uid(), region_id))
  )
);

-- 3) qr_assets_created_by_self_assign: require active admin + created_by = auth.uid()
DROP POLICY IF EXISTS qr_admin_write ON public.qr_assets;
CREATE POLICY qr_admin_write ON public.qr_assets
FOR INSERT TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND private.is_active_admin(auth.uid())
  AND (
    private.has_role(auth.uid(), 'super_admin'::app_role)
    OR private.current_admin_region_id() IS NOT NULL
  )
);

-- 4) qr_assignments_public_region_leak: hide internal columns from public roles
REVOKE SELECT (placement_note, assigned_by, released_by) ON public.qr_assignments FROM anon, authenticated;
-- Admins access these via server functions using service_role or explicit grants; region admins
-- do not need to read placement_note through the client. Re-grant to service_role for admin tooling.
GRANT SELECT (placement_note, assigned_by, released_by) ON public.qr_assignments TO service_role;

-- 5) gmaps_url_no_scheme_check: enforce http(s) scheme on stored URLs
ALTER TABLE public.locations
  DROP CONSTRAINT IF EXISTS locations_gmaps_url_scheme_chk;
ALTER TABLE public.locations
  ADD CONSTRAINT locations_gmaps_url_scheme_chk
  CHECK (gmaps_url IS NULL OR gmaps_url ~* '^https?://');

ALTER TABLE public.regions
  DROP CONSTRAINT IF EXISTS regions_gmaps_url_scheme_chk;
ALTER TABLE public.regions
  ADD CONSTRAINT regions_gmaps_url_scheme_chk
  CHECK (gmaps_url IS NULL OR gmaps_url ~* '^https?://');
