DROP POLICY IF EXISTS "Authenticated users create regions" ON public.regions;
CREATE POLICY "Authenticated users create regions"
ON public.regions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);