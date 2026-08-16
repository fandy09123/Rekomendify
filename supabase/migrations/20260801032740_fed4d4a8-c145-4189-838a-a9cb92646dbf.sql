
-- Public buckets serve object downloads without RLS, so a broad SELECT policy
-- only adds bucket *listing* (enumeration). Restrict listing to owners.
DROP POLICY IF EXISTS "IMAGE public read" ON storage.objects;

CREATE POLICY "IMAGE owner list"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'IMAGE' AND owner = auth.uid());
