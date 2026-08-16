CREATE TABLE public.info_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  cover_image_url text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.info_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.info_posts TO authenticated;
GRANT ALL ON public.info_posts TO service_role;

ALTER TABLE public.info_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "info_posts_public_read"
  ON public.info_posts FOR SELECT
  USING (
    (is_published = true AND EXISTS (SELECT 1 FROM public.regions r WHERE r.id = info_posts.region_id AND r.is_published = true))
    OR (region_id = private.current_admin_region_id())
    OR private.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

CREATE POLICY "info_posts_admin_write"
  ON public.info_posts FOR ALL
  TO authenticated
  USING (
    (region_id = private.current_admin_region_id())
    OR private.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
  WITH CHECK (
    (region_id = private.current_admin_region_id())
    OR private.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

CREATE INDEX idx_info_posts_region_published ON public.info_posts (region_id, is_published, published_at DESC);
CREATE INDEX idx_info_posts_category ON public.info_posts (category_id);

CREATE TRIGGER info_posts_set_updated_at
  BEFORE UPDATE ON public.info_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
