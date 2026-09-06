
-- =========================================================
-- SECURITY HARDENING (consolidated)
-- =========================================================

-- 1) Private schema for RLS helpers (not exposed via PostgREST)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION private.has_region_access(_user_id uuid, _region_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = 'super_admin' OR (region_id = _region_id AND role IN ('regional_admin','field_operator')))
  )
$$;

CREATE OR REPLACE FUNCTION private.current_admin_region_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT region_id FROM public.profiles
  WHERE id = auth.uid() AND is_active = true AND region_id IS NOT NULL
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_region_access(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.current_admin_region_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION private.has_region_access(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION private.current_admin_region_id() TO authenticated, anon, service_role;

-- 2) Drop ALL existing policies (we recreate the canonical set below).
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname='public'
      AND tablename IN ('audit_logs','categories','locations','profiles',
                        'qr_assets','qr_assignments','regions','user_roles','visits')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 3) Drop legacy public helpers now that no policy depends on them.
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.has_region_access(uuid, uuid);
DROP FUNCTION IF EXISTS public.current_admin_region_id();

-- 4) Lock down handle_new_user (trigger system runs it as table owner).
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 5) Canonical RLS policies (referencing private.* helpers).

-- REGIONS
CREATE POLICY "regions_public_read" ON public.regions
  FOR SELECT TO anon, authenticated
  USING (is_published = true
         OR id = private.current_admin_region_id()
         OR private.has_role(auth.uid(),'super_admin'));
CREATE POLICY "regions_admin_update" ON public.regions
  FOR UPDATE TO authenticated
  USING (id = private.current_admin_region_id() OR private.has_role(auth.uid(),'super_admin'))
  WITH CHECK (id = private.current_admin_region_id() OR private.has_role(auth.uid(),'super_admin'));
CREATE POLICY "regions_super_admin_insert" ON public.regions
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(),'super_admin'));
CREATE POLICY "regions_super_admin_delete" ON public.regions
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(),'super_admin'));

-- LOCATIONS
CREATE POLICY "locations_public_read" ON public.locations
  FOR SELECT TO anon, authenticated
  USING (
    (is_published = true AND EXISTS (
      SELECT 1 FROM public.regions r
      WHERE r.id = locations.region_id AND r.is_published = true
    ))
    OR region_id = private.current_admin_region_id()
    OR private.has_role(auth.uid(),'super_admin')
  );
CREATE POLICY "locations_admin_write" ON public.locations
  FOR ALL TO authenticated
  USING (region_id = private.current_admin_region_id() OR private.has_role(auth.uid(),'super_admin'))
  WITH CHECK (region_id = private.current_admin_region_id() OR private.has_role(auth.uid(),'super_admin'));

-- CATEGORIES
CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.regions r
            WHERE r.id = categories.region_id AND r.is_published = true)
    OR region_id = private.current_admin_region_id()
    OR private.has_role(auth.uid(),'super_admin')
  );
CREATE POLICY "categories_admin_write" ON public.categories
  FOR ALL TO authenticated
  USING (region_id = private.current_admin_region_id() OR private.has_role(auth.uid(),'super_admin'))
  WITH CHECK (region_id = private.current_admin_region_id() OR private.has_role(auth.uid(),'super_admin'));

-- QR ASSETS
CREATE POLICY "qr_public_resolve" ON public.qr_assets
  FOR SELECT TO anon, authenticated
  USING (status = 'active');
CREATE POLICY "qr_admin_all" ON public.qr_assets
  FOR ALL TO authenticated
  USING (
    private.has_role(auth.uid(),'super_admin')
    OR EXISTS (SELECT 1 FROM public.qr_assignments qa
               WHERE qa.qr_id = qr_assets.id
                 AND qa.region_id = private.current_admin_region_id())
    OR created_by = auth.uid()
  )
  WITH CHECK (private.has_role(auth.uid(),'super_admin') OR created_by = auth.uid());

-- QR ASSIGNMENTS
CREATE POLICY "qr_assign_public_active" ON public.qr_assignments
  FOR SELECT TO anon, authenticated
  USING (
    released_at IS NULL
    AND EXISTS (SELECT 1 FROM public.regions r
                WHERE r.id = qr_assignments.region_id AND r.is_published = true)
  );
CREATE POLICY "qr_assign_admin_all" ON public.qr_assignments
  FOR ALL TO authenticated
  USING (region_id = private.current_admin_region_id() OR private.has_role(auth.uid(),'super_admin'))
  WITH CHECK (region_id = private.current_admin_region_id() OR private.has_role(auth.uid(),'super_admin'));

-- VISITS (anonymous insert allowed only for valid, published context)
CREATE POLICY "visits_public_insert" ON public.visits
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    region_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.regions r
                WHERE r.id = visits.region_id AND r.is_published = true)
    AND (location_id IS NULL OR EXISTS (
      SELECT 1 FROM public.locations l
      WHERE l.id = visits.location_id AND l.region_id = visits.region_id
    ))
    AND (qr_assignment_id IS NULL OR EXISTS (
      SELECT 1 FROM public.qr_assignments qa
      WHERE qa.id = visits.qr_assignment_id AND qa.region_id = visits.region_id
    ))
  );
CREATE POLICY "visits_admin_read" ON public.visits
  FOR SELECT TO authenticated
  USING (region_id = private.current_admin_region_id() OR private.has_role(auth.uid(),'super_admin'));

-- AUDIT LOGS
CREATE POLICY "audit_admin_read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    private.has_role(auth.uid(),'super_admin')
    OR (region_id IS NOT NULL AND private.has_region_access(auth.uid(), region_id))
  );
CREATE POLICY "audit_authed_insert" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);

-- PROFILES
CREATE POLICY "profiles_self_read" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR private.has_role(auth.uid(),'super_admin'));
CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND is_active = (SELECT p.is_active FROM public.profiles p WHERE p.id = auth.uid())
    AND region_id IS NOT DISTINCT FROM (SELECT p.region_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- USER ROLES
CREATE POLICY "user_roles_self_read" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.has_role(auth.uid(),'super_admin'));
CREATE POLICY "user_roles_super_admin_write" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(),'super_admin'))
  WITH CHECK (private.has_role(auth.uid(),'super_admin'));
