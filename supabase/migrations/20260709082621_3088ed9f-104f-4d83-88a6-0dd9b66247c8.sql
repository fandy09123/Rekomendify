
DROP POLICY IF EXISTS "IMAGE public read" ON storage.objects;

CREATE POLICY "IMAGE authenticated read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'IMAGE');
