
-- Public read for the public IMAGE bucket (needed by anonymous visitors)
DROP POLICY IF EXISTS "IMAGE public read" ON storage.objects;
CREATE POLICY "IMAGE public read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'IMAGE');

DROP POLICY IF EXISTS "IMAGE authenticated read" ON storage.objects;

-- Active regional admins may upload only into their own region prefix,
-- with a strict image-extension whitelist, and must own the object.
DROP POLICY IF EXISTS "IMAGE active admin insert" ON storage.objects;
CREATE POLICY "IMAGE active admin insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'IMAGE'
  AND owner = auth.uid()
  AND private.is_active_admin(auth.uid())
  AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif')
  AND private.current_admin_region_id() IS NOT NULL
  AND name LIKE 'regions/' || private.current_admin_region_id()::text || '/%'
);
