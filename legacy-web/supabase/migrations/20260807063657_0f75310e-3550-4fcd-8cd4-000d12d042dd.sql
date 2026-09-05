-- 1. locations: gmaps_url -> coordinates (nullable, koordinat)
ALTER TABLE public.locations DROP CONSTRAINT IF EXISTS locations_gmaps_url_scheme_chk;
ALTER TABLE public.locations RENAME COLUMN gmaps_url TO coordinates;
ALTER TABLE public.locations ALTER COLUMN coordinates DROP NOT NULL;
ALTER TABLE public.locations ALTER COLUMN coordinates DROP DEFAULT;
UPDATE public.locations SET coordinates = (
  CASE WHEN coordinates ~ '(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)'
    THEN regexp_replace(substring(coordinates from '(-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+)'), '\s', '', 'g')
    ELSE NULL END
);
ALTER TABLE public.locations ADD CONSTRAINT locations_coordinates_chk
  CHECK (coordinates IS NULL OR coordinates ~ '^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$');

-- 2. regions: gmaps_url -> coordinates + admin_whatsapp
ALTER TABLE public.regions DROP CONSTRAINT IF EXISTS regions_gmaps_url_scheme_chk;
ALTER TABLE public.regions RENAME COLUMN gmaps_url TO coordinates;
UPDATE public.regions SET coordinates = (
  CASE WHEN coordinates ~ '(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)'
    THEN regexp_replace(substring(coordinates from '(-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+)'), '\s', '', 'g')
    ELSE NULL END
);
ALTER TABLE public.regions ADD CONSTRAINT regions_coordinates_chk
  CHECK (coordinates IS NULL OR coordinates ~ '^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$');
ALTER TABLE public.regions ADD COLUMN IF NOT EXISTS admin_whatsapp text;
ALTER TABLE public.regions ADD CONSTRAINT regions_admin_whatsapp_chk
  CHECK (admin_whatsapp IS NULL OR admin_whatsapp ~ '^[0-9]{8,20}$');

-- 3. couriers
CREATE TABLE public.couriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  name text NOT NULL,
  whatsapp text NOT NULL,
  coordinates text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT couriers_whatsapp_chk CHECK (whatsapp ~ '^[0-9]{8,20}$'),
  CONSTRAINT couriers_coordinates_chk CHECK (coordinates IS NULL OR coordinates ~ '^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$')
);

GRANT SELECT ON public.couriers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.couriers TO authenticated;
GRANT ALL ON public.couriers TO service_role;

ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "couriers public read active in published region"
ON public.couriers FOR SELECT TO anon, authenticated
USING (
  is_active AND EXISTS (
    SELECT 1 FROM public.regions r WHERE r.id = couriers.region_id AND r.is_published
  )
);

CREATE POLICY "couriers admin manage own region"
ON public.couriers FOR ALL TO authenticated
USING (region_id = private.current_admin_region_id())
WITH CHECK (region_id = private.current_admin_region_id());

CREATE TRIGGER trg_couriers_updated BEFORE UPDATE ON public.couriers
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE INDEX idx_couriers_region ON public.couriers(region_id);