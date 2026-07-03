CREATE OR REPLACE FUNCTION public.claim_first_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('claim_first_admin_lock'));

  IF EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE role = 'admin'
  ) THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = 'admin'
    );
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_first_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_first_admin(uuid) TO service_role;