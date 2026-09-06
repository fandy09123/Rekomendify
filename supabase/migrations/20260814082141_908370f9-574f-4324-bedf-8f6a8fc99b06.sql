CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  is_active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.push_region_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.push_subscriptions(id) ON DELETE CASCADE,
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subscription_id, region_id)
);
CREATE INDEX idx_push_region_follows_region ON public.push_region_follows(region_id);
GRANT ALL ON public.push_region_follows TO service_role;
ALTER TABLE public.push_region_follows ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.push_dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id),
  entity_type text NOT NULL,
  entity_id text,
  dedupe_key text UNIQUE,
  title text NOT NULL,
  body text NOT NULL,
  url text,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_push_dispatches_region ON public.push_dispatches(region_id, created_at DESC);
GRANT SELECT ON public.push_dispatches TO authenticated;
GRANT ALL ON public.push_dispatches TO service_role;
ALTER TABLE public.push_dispatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin wilayah melihat riwayat push wilayahnya"
ON public.push_dispatches FOR SELECT TO authenticated
USING (region_id = private.current_admin_region_id());

CREATE TRIGGER push_subscriptions_set_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();