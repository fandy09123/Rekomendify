-- 1. Audit logs: remove client insert policy
DROP POLICY IF EXISTS "audit_authed_insert" ON public.audit_logs;

-- 2. QR assets: replace permissive policy to prevent self-assign privilege escalation
DROP POLICY IF EXISTS "qr_admin_all" ON public.qr_assets;
CREATE POLICY "qr_admin_select" ON public.qr_assets
  FOR SELECT TO authenticated
  USING (
    private.has_role(auth.uid(), 'super_admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM qr_assignments qa
      WHERE qa.qr_id = qr_assets.id
        AND qa.region_id = private.current_admin_region_id()
    )
  );
CREATE POLICY "qr_admin_write" ON public.qr_assets
  FOR INSERT TO authenticated
  WITH CHECK (
    private.has_role(auth.uid(), 'super_admin'::app_role)
    OR private.current_admin_region_id() IS NOT NULL
  );
CREATE POLICY "qr_admin_update" ON public.qr_assets
  FOR UPDATE TO authenticated
  USING (
    private.has_role(auth.uid(), 'super_admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM qr_assignments qa
      WHERE qa.qr_id = qr_assets.id
        AND qa.region_id = private.current_admin_region_id()
    )
  )
  WITH CHECK (
    private.has_role(auth.uid(), 'super_admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM qr_assignments qa
      WHERE qa.qr_id = qr_assets.id
        AND qa.region_id = private.current_admin_region_id()
    )
  );
CREATE POLICY "qr_admin_delete" ON public.qr_assets
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::app_role));

-- 3. QR assignments: hide sensitive columns from anon while keeping public resolution working
REVOKE SELECT ON public.qr_assignments FROM anon;
GRANT SELECT (id, qr_id, location_id, region_id, assigned_at, released_at) ON public.qr_assignments TO anon;

-- 4. IMAGE storage bucket: require activated regional admin session for uploads
DROP POLICY IF EXISTS "IMAGE authenticated insert" ON storage.objects;
CREATE POLICY "IMAGE admin insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'IMAGE'
    AND (
      private.has_role(auth.uid(), 'super_admin'::app_role)
      OR private.current_admin_region_id() IS NOT NULL
    )
  );