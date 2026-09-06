
-- Media gallery + YouTube link for locations and info_posts
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS youtube_url text;

ALTER TABLE public.info_posts
  ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS youtube_url text;

-- Storage policies for IMAGE bucket:
-- public read (bucket is already public, but explicit SELECT policy allows anon)
-- authenticated users may insert/update/delete objects they own
CREATE POLICY "IMAGE public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'IMAGE');

CREATE POLICY "IMAGE authenticated insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'IMAGE');

CREATE POLICY "IMAGE authenticated update own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'IMAGE' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'IMAGE' AND owner = auth.uid());

CREATE POLICY "IMAGE authenticated delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'IMAGE' AND owner = auth.uid());
