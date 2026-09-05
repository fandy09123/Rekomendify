-- ============ 1. QR: region ownership + print state ============
ALTER TABLE public.qr_assets
  ADD COLUMN IF NOT EXISTS region_id uuid REFERENCES public.regions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS printed_at timestamptz;

UPDATE public.qr_assets q
SET region_id = a.region_id
FROM public.qr_assignments a
WHERE a.qr_id = q.id AND q.region_id IS NULL;

CREATE INDEX IF NOT EXISTS qr_assets_region_idx ON public.qr_assets(region_id);

DROP POLICY IF EXISTS qr_admin_select ON public.qr_assets;
DROP POLICY IF EXISTS qr_admin_update ON public.qr_assets;
DROP POLICY IF EXISTS qr_admin_write ON public.qr_assets;
DROP POLICY IF EXISTS qr_admin_delete ON public.qr_assets;

CREATE POLICY qr_admin_select ON public.qr_assets FOR SELECT TO authenticated
USING (
  private.has_role(auth.uid(), 'super_admin'::app_role)
  OR (region_id IS NOT NULL AND region_id = private.current_admin_region_id())
  OR EXISTS (SELECT 1 FROM public.qr_assignments qa
             WHERE qa.qr_id = qr_assets.id AND qa.region_id = private.current_admin_region_id())
);

CREATE POLICY qr_admin_write ON public.qr_assets FOR INSERT TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND private.is_active_admin(auth.uid())
  AND (
    private.has_role(auth.uid(), 'super_admin'::app_role)
    OR (region_id IS NOT NULL AND region_id = private.current_admin_region_id())
  )
);

CREATE POLICY qr_admin_update ON public.qr_assets FOR UPDATE TO authenticated
USING (
  private.has_role(auth.uid(), 'super_admin'::app_role)
  OR (region_id IS NOT NULL AND region_id = private.current_admin_region_id())
)
WITH CHECK (
  private.has_role(auth.uid(), 'super_admin'::app_role)
  OR (region_id IS NOT NULL AND region_id = private.current_admin_region_id())
);

CREATE POLICY qr_admin_delete ON public.qr_assets FOR DELETE TO authenticated
USING (
  private.has_role(auth.uid(), 'super_admin'::app_role)
  OR (region_id IS NOT NULL AND region_id = private.current_admin_region_id())
);

-- ============ 2. Engagement events ============
DO $$ BEGIN
  CREATE TYPE public.engagement_kind AS ENUM ('whatsapp', 'gmaps', 'save', 'share');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.engagement_events (
  id bigserial PRIMARY KEY,
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
  kind public.engagement_kind NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.engagement_events TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.engagement_events_id_seq TO anon, authenticated;
GRANT SELECT ON public.engagement_events TO authenticated;
GRANT ALL ON public.engagement_events TO service_role;

ALTER TABLE public.engagement_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS engagement_public_insert ON public.engagement_events;
CREATE POLICY engagement_public_insert ON public.engagement_events FOR INSERT TO anon, authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.regions r WHERE r.id = region_id AND r.is_published = true)
  AND (
    location_id IS NULL
    OR EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.region_id = engagement_events.region_id)
  )
);

DROP POLICY IF EXISTS engagement_admin_read ON public.engagement_events;
CREATE POLICY engagement_admin_read ON public.engagement_events FOR SELECT TO authenticated
USING (
  private.has_role(auth.uid(), 'super_admin'::app_role)
  OR region_id = private.current_admin_region_id()
);

CREATE INDEX IF NOT EXISTS engagement_region_created_idx ON public.engagement_events(region_id, created_at DESC);
CREATE INDEX IF NOT EXISTS visits_region_created_idx ON public.visits(region_id, created_at DESC);

-- ============ 3. Analytics summary RPC (region-scoped, aggregated in DB) ============
CREATE OR REPLACE FUNCTION public.admin_analytics_summary(_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_region uuid := private.current_admin_region_id();
  v_days integer := greatest(1, least(coalesce(_days, 30), 365));
  v_from timestamptz := date_trunc('day', now()) - ((v_days - 1) || ' days')::interval;
  result jsonb;
BEGIN
  IF v_region IS NULL THEN
    RETURN jsonb_build_object('region_id', null);
  END IF;

  SELECT jsonb_build_object(
    'region_id', v_region,
    'days', v_days,
    'totals', (
      SELECT jsonb_build_object(
        'total', count(*),
        'today', count(*) FILTER (WHERE created_at >= date_trunc('day', now())),
        'yesterday', count(*) FILTER (WHERE created_at >= date_trunc('day', now()) - interval '1 day'
                                        AND created_at < date_trunc('day', now())),
        'd7', count(*) FILTER (WHERE created_at >= now() - interval '7 days'),
        'prev7', count(*) FILTER (WHERE created_at >= now() - interval '14 days' AND created_at < now() - interval '7 days'),
        'd30', count(*) FILTER (WHERE created_at >= now() - interval '30 days'),
        'prev30', count(*) FILTER (WHERE created_at >= now() - interval '60 days' AND created_at < now() - interval '30 days')
      ) FROM public.visits WHERE region_id = v_region
    ),
    'by_source', (
      SELECT coalesce(jsonb_object_agg(source, c), '{}'::jsonb) FROM (
        SELECT source::text AS source, count(*) AS c
        FROM public.visits WHERE region_id = v_region AND created_at >= v_from
        GROUP BY source
      ) s
    ),
    'trend', (
      SELECT coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'visits', c) ORDER BY d), '[]'::jsonb)
      FROM (
        SELECT g.d, count(v.id) AS c
        FROM generate_series(v_from, date_trunc('day', now()), interval '1 day') g(d)
        LEFT JOIN public.visits v
          ON v.region_id = v_region AND v.created_at >= g.d AND v.created_at < g.d + interval '1 day'
        GROUP BY g.d
      ) t
    ),
    'top_locations', (
      SELECT coalesce(jsonb_agg(x ORDER BY (x->>'visits')::int DESC), '[]'::jsonb) FROM (
        SELECT jsonb_build_object(
          'id', l.id, 'name', l.name, 'slug', l.slug,
          'visits', count(v.id),
          'whatsapp', (SELECT count(*) FROM public.engagement_events e WHERE e.location_id = l.id AND e.kind = 'whatsapp' AND e.created_at >= v_from),
          'gmaps', (SELECT count(*) FROM public.engagement_events e WHERE e.location_id = l.id AND e.kind = 'gmaps' AND e.created_at >= v_from),
          'saves', (SELECT count(*) FROM public.engagement_events e WHERE e.location_id = l.id AND e.kind = 'save' AND e.created_at >= v_from)
        ) AS x
        FROM public.locations l
        LEFT JOIN public.visits v ON v.location_id = l.id AND v.created_at >= v_from
        WHERE l.region_id = v_region
        GROUP BY l.id, l.name, l.slug
      ) q
    ),
    'top_categories', (
      SELECT coalesce(jsonb_agg(jsonb_build_object('name', name, 'visits', c) ORDER BY c DESC), '[]'::jsonb)
      FROM (
        SELECT coalesce(c.name, 'Tanpa kategori') AS name, count(v.id) AS c
        FROM public.visits v
        JOIN public.locations l ON l.id = v.location_id
        LEFT JOIN public.categories c ON c.id = l.category_id
        WHERE v.region_id = v_region AND v.created_at >= v_from
        GROUP BY 1
      ) t
    ),
    'engagement', (
      SELECT jsonb_build_object(
        'whatsapp', count(*) FILTER (WHERE kind = 'whatsapp'),
        'gmaps', count(*) FILTER (WHERE kind = 'gmaps'),
        'save', count(*) FILTER (WHERE kind = 'save'),
        'share', count(*) FILTER (WHERE kind = 'share')
      ) FROM public.engagement_events WHERE region_id = v_region AND created_at >= v_from
    ),
    'qr', (
      SELECT jsonb_build_object(
        'total', count(*),
        'printed', count(*) FILTER (WHERE printed_at IS NOT NULL),
        'active', count(*) FILTER (WHERE status = 'active'),
        'draft', count(*) FILTER (WHERE status = 'draft'),
        'retired', count(*) FILTER (WHERE status = 'retired')
      ) FROM public.qr_assets WHERE region_id = v_region
    ),
    'content', (
      SELECT jsonb_build_object(
        'locations', (SELECT count(*) FROM public.locations WHERE region_id = v_region),
        'published_locations', (SELECT count(*) FROM public.locations WHERE region_id = v_region AND is_published),
        'categories', (SELECT count(*) FROM public.categories WHERE region_id = v_region),
        'info_posts', (SELECT count(*) FROM public.info_posts WHERE region_id = v_region)
      )
    )
  ) INTO result;

  RETURN result;
END $$;

REVOKE ALL ON FUNCTION public.admin_analytics_summary(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_analytics_summary(integer) TO authenticated;