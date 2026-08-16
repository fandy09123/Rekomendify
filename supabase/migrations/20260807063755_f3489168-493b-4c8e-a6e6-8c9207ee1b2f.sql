CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_region_name text := NEW.raw_user_meta_data->>'region_name';
  v_region_slug text := NEW.raw_user_meta_data->>'region_slug';
  v_region_tagline text := NEW.raw_user_meta_data->>'region_tagline';
  v_region_welcome text := NEW.raw_user_meta_data->>'region_welcome';
  v_region_coords text := NEW.raw_user_meta_data->>'region_coordinates';
  v_full_name text := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  v_region_id uuid;
  v_slug text;
BEGIN
  IF v_region_coords IS NOT NULL AND v_region_coords !~ '^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$' THEN
    v_region_coords := NULL;
  END IF;

  IF v_region_name IS NOT NULL AND length(trim(v_region_name)) > 0 THEN
    v_slug := COALESCE(NULLIF(trim(v_region_slug), ''), lower(regexp_replace(v_region_name, '[^a-zA-Z0-9]+', '-', 'g')));
    v_slug := trim(both '-' from v_slug);
    IF EXISTS (SELECT 1 FROM public.regions WHERE slug = v_slug) THEN
      v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);
    END IF;

    INSERT INTO public.regions (slug, name, tagline, welcome_message, coordinates, is_published)
    VALUES (v_slug, v_region_name, v_region_tagline, v_region_welcome, v_region_coords, false)
    RETURNING id INTO v_region_id;

    INSERT INTO public.user_roles (user_id, role, region_id)
    VALUES (NEW.id, 'regional_admin', v_region_id)
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, region_id, is_active)
  VALUES (NEW.id, NEW.email, v_full_name, v_region_id, false)
  ON CONFLICT (id) DO UPDATE SET region_id = COALESCE(public.profiles.region_id, EXCLUDED.region_id);

  RETURN NEW;
END $function$;