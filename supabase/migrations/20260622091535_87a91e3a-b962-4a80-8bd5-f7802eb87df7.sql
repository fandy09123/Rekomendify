
CREATE TYPE public.app_role AS ENUM ('super_admin', 'regional_admin', 'field_operator');
CREATE TYPE public.qr_status AS ENUM ('draft', 'active', 'retired');
CREATE TYPE public.visit_source AS ENUM ('qr', 'gps', 'direct');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  region_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, region_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.has_region_access(_user_id UUID, _region_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = 'super_admin' OR (region_id = _region_id AND role IN ('regional_admin','field_operator')))
  )
$$;

-- REGIONS
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  cover_image_url TEXT,
  welcome_message TEXT,
  mascot_name TEXT DEFAULT 'Cak Mulyo & Jeng Sari',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_km NUMERIC NOT NULL DEFAULT 5,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_regions_published ON public.regions(is_published) WHERE is_published;
CREATE INDEX idx_regions_slug ON public.regions(slug);
GRANT SELECT ON public.regions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.regions TO authenticated;
GRANT ALL ON public.regions TO service_role;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sees published regions" ON public.regions FOR SELECT TO anon, authenticated USING (is_published OR public.has_region_access(auth.uid(), id));
CREATE POLICY "Super admin manages regions" ON public.regions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Regional admin updates own region" ON public.regions FOR UPDATE TO authenticated USING (public.has_region_access(auth.uid(), id)) WITH CHECK (public.has_region_access(auth.uid(), id));

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES public.regions(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (region_id, slug)
);
CREATE INDEX idx_categories_region ON public.categories(region_id);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Region admin manages categories" ON public.categories FOR ALL TO authenticated USING ((region_id IS NULL AND public.has_role(auth.uid(), 'super_admin')) OR public.has_region_access(auth.uid(), region_id)) WITH CHECK ((region_id IS NULL AND public.has_role(auth.uid(), 'super_admin')) OR public.has_region_access(auth.uid(), region_id));

-- LOCATIONS
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  gmaps_url TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  description TEXT,
  whatsapp TEXT,
  hours TEXT,
  price_range TEXT,
  socials JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (region_id, slug)
);
CREATE INDEX idx_locations_region ON public.locations(region_id);
CREATE INDEX idx_locations_category ON public.locations(category_id);
CREATE INDEX idx_locations_featured ON public.locations(region_id, is_featured) WHERE is_featured;
GRANT SELECT ON public.locations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.locations TO authenticated;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sees published locations" ON public.locations FOR SELECT TO anon, authenticated USING (is_published OR public.has_region_access(auth.uid(), region_id));
CREATE POLICY "Region admin manages locations" ON public.locations FOR ALL TO authenticated USING (public.has_region_access(auth.uid(), region_id)) WITH CHECK (public.has_region_access(auth.uid(), region_id));

-- QR ASSETS
CREATE TABLE public.qr_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  status qr_status NOT NULL DEFAULT 'draft',
  batch_label TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_qr_code ON public.qr_assets(code);
CREATE INDEX idx_qr_status ON public.qr_assets(status);
GRANT SELECT ON public.qr_assets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.qr_assets TO authenticated;
GRANT ALL ON public.qr_assets TO service_role;
ALTER TABLE public.qr_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public resolves qr by code" ON public.qr_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage qr" ON public.qr_assets FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'regional_admin') OR public.has_role(auth.uid(),'field_operator')) WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'regional_admin') OR public.has_role(auth.uid(),'field_operator'));

-- QR ASSIGNMENTS
CREATE TABLE public.qr_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id UUID NOT NULL REFERENCES public.qr_assets(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  placement_note TEXT,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  released_at TIMESTAMPTZ,
  released_by UUID REFERENCES auth.users(id)
);
CREATE UNIQUE INDEX idx_qr_one_active ON public.qr_assignments(qr_id) WHERE released_at IS NULL;
CREATE INDEX idx_assign_location ON public.qr_assignments(location_id);
CREATE INDEX idx_assign_region ON public.qr_assignments(region_id);
GRANT SELECT ON public.qr_assignments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.qr_assignments TO authenticated;
GRANT ALL ON public.qr_assignments TO service_role;
ALTER TABLE public.qr_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public resolves active assignment" ON public.qr_assignments FOR SELECT TO anon, authenticated USING (released_at IS NULL);
CREATE POLICY "Region admin manages assignments" ON public.qr_assignments FOR ALL TO authenticated USING (public.has_region_access(auth.uid(), region_id)) WITH CHECK (public.has_region_access(auth.uid(), region_id));

-- VISITS
CREATE TABLE public.visits (
  id BIGSERIAL PRIMARY KEY,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  qr_assignment_id UUID REFERENCES public.qr_assignments(id) ON DELETE SET NULL,
  source visit_source NOT NULL DEFAULT 'direct',
  referrer TEXT,
  user_agent_hash TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_visits_region_time ON public.visits(region_id, created_at DESC);
CREATE INDEX idx_visits_location_time ON public.visits(location_id, created_at DESC);
CREATE INDEX idx_visits_assignment ON public.visits(qr_assignment_id);
GRANT INSERT ON public.visits TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE visits_id_seq TO anon, authenticated;
GRANT SELECT ON public.visits TO authenticated;
GRANT ALL ON public.visits TO service_role;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone inserts visit" ON public.visits FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Region admin reads visits" ON public.visits FOR SELECT TO authenticated USING (region_id IS NULL OR public.has_region_access(auth.uid(), region_id));

-- AUDIT
CREATE TABLE public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_region ON public.audit_logs(region_id, created_at DESC);
GRANT INSERT, SELECT ON public.audit_logs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE audit_logs_id_seq TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'super_admin') OR (region_id IS NOT NULL AND public.has_region_access(auth.uid(), region_id)));
CREATE POLICY "Authed insert audit" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_regions_updated BEFORE UPDATE ON public.regions FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_locations_updated BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_qr_updated BEFORE UPDATE ON public.qr_assets FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.tg_qr_sync_status() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.qr_assets SET status='active' WHERE id = NEW.qr_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.released_at IS NOT NULL AND OLD.released_at IS NULL THEN
    UPDATE public.qr_assets SET status='draft' WHERE id = NEW.qr_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_qr_assign_status AFTER INSERT OR UPDATE ON public.qr_assignments FOR EACH ROW EXECUTE FUNCTION public.tg_qr_sync_status();
