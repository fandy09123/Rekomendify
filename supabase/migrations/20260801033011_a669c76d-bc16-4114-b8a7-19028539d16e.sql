
CREATE OR REPLACE FUNCTION public.resolve_qr_public(_code text)
RETURNS TABLE (id uuid, code text, status public.qr_status)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.code, q.status
  FROM public.qr_assets q
  WHERE q.code = _code
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.resolve_qr_public(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_qr_public(text) TO anon, authenticated, service_role;
