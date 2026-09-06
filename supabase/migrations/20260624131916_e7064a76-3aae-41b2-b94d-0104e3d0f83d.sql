
-- =========================================================
-- Rekomendify simplification: 1 admin = 1 region, manual activation
-- =========================================================

-- 1) Simplify REGIONS: drop geo coords/radius, add gmaps_url
ALTER TABLE public.regions DROP COLUMN IF EXISTS latitude;
ALTER TABLE public.regions DROP COLUMN IF EXISTS longitude;
ALTER TABLE public.regions DROP COLUMN IF EXISTS radius_km;
ALTER TABLE public.regions ADD COLUMN IF NOT EXISTS gmaps_url text;

-- 2) Simplify LOCATIONS: drop coords/gallery/socials (gmaps_url remains)
ALTER TABLE public.locations DROP COLUMN IF EXISTS latitude;
ALTER TABLE public.locations DROP COLUMN IF EXISTS longitude;
ALTER TABLE public.locations DROP COLUMN IF EXISTS gallery;
ALTER TABLE public.locations DROP COLUMN IF EXISTS socials;

-- 3) PROFILES: link to one region, activation flag
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS region_id uuid REFERENCES public.regions(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_region_id_unique ON public.profiles(region_id) WHERE region_id IS NOT NULL;

-- 4) Helper: current active admin's region (security definer to bypass RLS recursion)
CREATE OR REPLACE FUNCTION public.current_admin_region_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT region_id FROM public.profiles
  WHERE id = auth.uid() AND is_active = true AND region_id IS NOT NULL
$$;

REVOKE EXECUTE ON FUNCTION public.current_admin_region_id() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.current_admin_region_id() TO authenticated, service_role;

-- 5) Updated signup trigger: creates region + role + profile from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_region_name text := NEW.raw_user_meta_data->>'region_name';
  v_region_slug text := NEW.raw_user_meta_data->>'region_slug';
  v_region_tagline text := NEW.raw_user_meta_data->>'region_tagline';
  v_region_welcome text := NEW.raw_user_meta_data->>'region_welcome';
  v_region_gmaps text := NEW.raw_user_meta_data->>'region_gmaps_url';
  v_full_name text := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  v_region_id uuid;
  v_slug text;
BEGIN
  IF v_region_name IS NOT NULL AND length(trim(v_region_name)) > 0 THEN
    v_slug := COALESCE(NULLIF(trim(v_region_slug), ''), lower(regexp_replace(v_region_name, '[^a-zA-Z0-9]+', '-', 'g')));
    v_slug := trim(both '-' from v_slug);
    -- Ensure slug uniqueness with random suffix if needed
    IF EXISTS (SELECT 1 FROM public.regions WHERE slug = v_slug) THEN
      v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);
    END IF;

    INSERT INTO public.regions (slug, name, tagline, welcome_message, gmaps_url, is_published)
    VALUES (v_slug, v_region_name, v_region_tagline, v_region_welcome, v_region_gmaps, false)
    RETURNING id INTO v_region_id;

    INSERT INTO public.user_roles (user_id, role, region_id)
    VALUES (NEW.id, 'regional_admin', v_region_id)
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, region_id, is_active)
  VALUES (NEW.id, NEW.email, v_full_name, v_region_id, false)
  ON CONFLICT (id) DO UPDATE SET region_id = COALESCE(public.profiles.region_id, EXCLUDED.region_id);

  RETURN NEW;
END $$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6) RLS: scope everything to current_admin_region_id

-- REGIONS
DROP POLICY IF EXISTS "Public can view published regions" ON public.regions;
DROP POLICY IF EXISTS "Managers can view their regions" ON public.regions;
DROP POLICY IF EXISTS "Authenticated can insert regions" ON public.regions;
DROP POLICY IF EXISTS "Admins can update their regions" ON public.regions;
DROP POLICY IF EXISTS "Super admins manage regions" ON public.regions;

CREATE POLICY "regions_public_read" ON public.regions FOR SELECT TO anon, authenticated
  USING (is_published = true OR id = public.current_admin_region_id() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "regions_admin_update" ON public.regions FOR UPDATE TO authenticated
  USING (id = public.current_admin_region_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (id = public.current_admin_region_id() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "regions_super_admin_insert" ON public.regions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "regions_super_admin_delete" ON public.regions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'));

-- LOCATIONS
DROP POLICY IF EXISTS "Public can view published locations" ON public.locations;
DROP POLICY IF EXISTS "Managers manage their locations" ON public.locations;
DROP POLICY IF EXISTS "Admins manage locations" ON public.locations;

CREATE POLICY "locations_public_read" ON public.locations FOR SELECT TO anon, authenticated
  USING (is_published = true OR region_id = public.current_admin_region_id() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "locations_admin_write" ON public.locations FOR ALL TO authenticated
  USING (region_id = public.current_admin_region_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (region_id = public.current_admin_region_id() OR public.has_role(auth.uid(),'super_admin'));

-- CATEGORIES
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Managers manage their categories" ON public.categories;
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;

CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL TO authenticated
  USING (region_id = public.current_admin_region_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (region_id = public.current_admin_region_id() OR public.has_role(auth.uid(),'super_admin'));

-- QR ASSETS (created by admins; visible to assignee region)
DROP POLICY IF EXISTS "Managers view qr" ON public.qr_assets;
DROP POLICY IF EXISTS "Admins view qr" ON public.qr_assets;

CREATE POLICY "qr_admin_all" ON public.qr_assets FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin')
    OR EXISTS (SELECT 1 FROM public.qr_assignments qa WHERE qa.qr_id = qr_assets.id AND qa.region_id = public.current_admin_region_id())
    OR created_by = auth.uid()
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin') OR created_by = auth.uid()
  );

-- QR ASSIGNMENTS
DROP POLICY IF EXISTS "Managers view assignments" ON public.qr_assignments;
DROP POLICY IF EXISTS "Admins manage assignments" ON public.qr_assignments;

CREATE POLICY "qr_assign_admin_all" ON public.qr_assignments FOR ALL TO authenticated
  USING (region_id = public.current_admin_region_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (region_id = public.current_admin_region_id() OR public.has_role(auth.uid(),'super_admin'));

-- VISITS analytics scoped to admin region
DROP POLICY IF EXISTS "Managers view their visits" ON public.visits;
DROP POLICY IF EXISTS "Admins view visits" ON public.visits;

CREATE POLICY "visits_admin_read" ON public.visits FOR SELECT TO authenticated
  USING (region_id = public.current_admin_region_id() OR public.has_role(auth.uid(),'super_admin'));

-- PROFILES: user reads/updates own
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "profiles_self_read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid() AND is_active = (SELECT is_active FROM public.profiles WHERE id = auth.uid()));

-- USER ROLES: read own; only super admin writes
DROP POLICY IF EXISTS "Authenticated create own regional role" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "user_roles_super_admin_write" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));
