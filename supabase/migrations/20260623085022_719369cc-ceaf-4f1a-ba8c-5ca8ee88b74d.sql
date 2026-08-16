GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_region_access(uuid, uuid) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_region_access(uuid, uuid) FROM anon, public;

DROP POLICY IF EXISTS "Public sees published regions" ON public.regions;
CREATE POLICY "Public sees published regions"
ON public.regions
FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Region members see managed regions"
ON public.regions
FOR SELECT
TO authenticated
USING (public.has_region_access(auth.uid(), id));

CREATE POLICY "Authenticated users create regions"
ON public.regions
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Public sees published locations" ON public.locations;
CREATE POLICY "Public sees published locations"
ON public.locations
FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Region members see managed locations"
ON public.locations
FOR SELECT
TO authenticated
USING (public.has_region_access(auth.uid(), region_id));

CREATE POLICY "Authenticated users create own regional role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'regional_admin'::public.app_role);

CREATE POLICY "Super admins manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));