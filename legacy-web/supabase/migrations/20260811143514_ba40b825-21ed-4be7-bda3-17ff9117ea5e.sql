
-- ===== ENUMS =====
CREATE TYPE public.ad_placement AS ENUM ('banner', 'featured', 'contextual');
CREATE TYPE public.ad_status AS ENUM ('draft', 'active', 'paused', 'expired');

-- ===== PRICING =====
CREATE TABLE public.promo_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement public.ad_placement NOT NULL,
  duration_days integer NOT NULL CHECK (duration_days > 0),
  credits integer NOT NULL CHECK (credits >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (placement, duration_days)
);
GRANT SELECT ON public.promo_prices TO authenticated;
GRANT ALL ON public.promo_prices TO service_role;
ALTER TABLE public.promo_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promo_prices readable by admins" ON public.promo_prices
  FOR SELECT TO authenticated USING (is_active);
CREATE TRIGGER trg_promo_prices_updated BEFORE UPDATE ON public.promo_prices
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.promo_prices (placement, duration_days, credits) VALUES
  ('banner', 3, 3), ('banner', 7, 6), ('banner', 14, 11), ('banner', 30, 20),
  ('featured', 3, 2), ('featured', 7, 4), ('featured', 14, 7), ('featured', 30, 13),
  ('contextual', 3, 2), ('contextual', 7, 3), ('contextual', 14, 6), ('contextual', 30, 10);

-- ===== CREDITS =====
CREATE TABLE public.region_credits (
  region_id uuid PRIMARY KEY REFERENCES public.regions(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.region_credits TO authenticated;
GRANT ALL ON public.region_credits TO service_role;
ALTER TABLE public.region_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "region_credits owner read" ON public.region_credits
  FOR SELECT TO authenticated USING (region_id = private.current_admin_region_id());
CREATE TRIGGER trg_region_credits_updated BEFORE UPDATE ON public.region_credits
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.credit_ledger (
  id bigserial PRIMARY KEY,
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  ad_id uuid,
  delta integer NOT NULL,
  balance_after integer NOT NULL,
  reason text NOT NULL,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_credit_ledger_region ON public.credit_ledger(region_id, created_at DESC);
GRANT SELECT ON public.credit_ledger TO authenticated;
GRANT ALL ON public.credit_ledger TO service_role;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credit_ledger owner read" ON public.credit_ledger
  FOR SELECT TO authenticated USING (region_id = private.current_admin_region_id());

-- ===== ADS =====
CREATE TABLE public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  placement public.ad_placement NOT NULL,
  status public.ad_status NOT NULL DEFAULT 'draft',
  title text NOT NULL,
  description text,
  image_url text,
  location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  host_location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
  duration_days integer,
  credits_spent integer NOT NULL DEFAULT 0,
  start_at timestamptz,
  end_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ads_region_placement ON public.ads(region_id, placement, status);
CREATE INDEX idx_ads_window ON public.ads(start_at, end_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads TO authenticated;
GRANT SELECT ON public.ads TO anon;
GRANT ALL ON public.ads TO service_role;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ads public read active" ON public.ads
  FOR SELECT TO anon, authenticated
  USING (
    status = 'active'
    AND start_at IS NOT NULL AND end_at IS NOT NULL
    AND now() >= start_at AND now() < end_at
    AND EXISTS (SELECT 1 FROM public.regions r WHERE r.id = ads.region_id AND r.is_published)
  );

CREATE POLICY "ads admin manage" ON public.ads
  FOR ALL TO authenticated
  USING (region_id = private.current_admin_region_id())
  WITH CHECK (region_id = private.current_admin_region_id());

CREATE TRIGGER trg_ads_updated BEFORE UPDATE ON public.ads
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.ad_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ad_id, location_id)
);
CREATE INDEX idx_ad_targets_ad ON public.ad_targets(ad_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_targets TO authenticated;
GRANT SELECT ON public.ad_targets TO anon;
GRANT ALL ON public.ad_targets TO service_role;
ALTER TABLE public.ad_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_targets public read active" ON public.ad_targets
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.ads a
    JOIN public.regions r ON r.id = a.region_id AND r.is_published
    WHERE a.id = ad_targets.ad_id
      AND a.status = 'active'
      AND a.start_at IS NOT NULL AND a.end_at IS NOT NULL
      AND now() >= a.start_at AND now() < a.end_at
  ));

CREATE POLICY "ad_targets admin manage" ON public.ad_targets
  FOR ALL TO authenticated
  USING (region_id = private.current_admin_region_id())
  WITH CHECK (region_id = private.current_admin_region_id());

-- max 5 target per iklan
CREATE OR REPLACE FUNCTION public.tg_ad_targets_limit()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.ad_targets WHERE ad_id = NEW.ad_id) >= 5 THEN
    RAISE EXCEPTION 'Maksimal 5 lokasi tujuan per iklan.';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_ad_targets_limit BEFORE INSERT ON public.ad_targets
  FOR EACH ROW EXECUTE FUNCTION public.tg_ad_targets_limit();

-- ===== ATOMIC ACTIVATION =====
CREATE OR REPLACE FUNCTION public.activate_ad(_ad_id uuid, _duration_days integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_region uuid := private.current_admin_region_id();
  v_ad public.ads%ROWTYPE;
  v_cost integer;
  v_balance integer;
BEGIN
  IF v_region IS NULL THEN
    RAISE EXCEPTION 'Akun belum diaktifkan.';
  END IF;

  SELECT * INTO v_ad FROM public.ads WHERE id = _ad_id AND region_id = v_region;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Iklan tidak ditemukan di wilayah Anda.';
  END IF;
  IF v_ad.status = 'active' AND v_ad.end_at IS NOT NULL AND v_ad.end_at > now() THEN
    RAISE EXCEPTION 'Iklan sudah aktif.';
  END IF;

  SELECT credits INTO v_cost FROM public.promo_prices
   WHERE placement = v_ad.placement AND duration_days = _duration_days AND is_active;
  IF v_cost IS NULL THEN
    RAISE EXCEPTION 'Paket durasi tidak tersedia.';
  END IF;

  INSERT INTO public.region_credits (region_id, balance)
  VALUES (v_region, 0) ON CONFLICT (region_id) DO NOTHING;

  SELECT balance INTO v_balance FROM public.region_credits
   WHERE region_id = v_region FOR UPDATE;

  IF v_balance < v_cost THEN
    RAISE EXCEPTION 'Kredit promosi tidak mencukupi. Butuh % kredit, saldo %.', v_cost, v_balance;
  END IF;

  UPDATE public.region_credits
     SET balance = balance - v_cost
   WHERE region_id = v_region
  RETURNING balance INTO v_balance;

  UPDATE public.ads
     SET status = 'active',
         duration_days = _duration_days,
         credits_spent = v_cost,
         start_at = now(),
         end_at = now() + (_duration_days || ' days')::interval
   WHERE id = _ad_id;

  INSERT INTO public.credit_ledger (region_id, ad_id, delta, balance_after, reason, actor_id)
  VALUES (v_region, _ad_id, -v_cost, v_balance,
          'Aktivasi iklan ' || v_ad.placement::text || ' ' || _duration_days || ' hari', auth.uid());

  RETURN jsonb_build_object('ok', true, 'cost', v_cost, 'balance', v_balance);
END $$;

REVOKE ALL ON FUNCTION public.activate_ad(uuid, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.activate_ad(uuid, integer) TO authenticated;
