DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

DROP POLICY IF EXISTS "Users can read their own admin job runs" ON public.admin_job_runs;
DROP POLICY IF EXISTS "Users can create their own admin job runs" ON public.admin_job_runs;
DROP POLICY IF EXISTS "Users can update their own admin job runs" ON public.admin_job_runs;

CREATE POLICY "Admins can read admin job runs"
ON public.admin_job_runs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create admin job runs"
ON public.admin_job_runs
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  AND requested_by = auth.uid()
);

CREATE POLICY "Admins can update admin job runs"
ON public.admin_job_runs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can read own or shared admin runtime settings" ON public.admin_runtime_settings;
DROP POLICY IF EXISTS "Users can insert their own admin runtime settings" ON public.admin_runtime_settings;
DROP POLICY IF EXISTS "Users can update their own admin runtime settings" ON public.admin_runtime_settings;

CREATE POLICY "Admins can read admin runtime settings"
ON public.admin_runtime_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert admin runtime settings"
ON public.admin_runtime_settings
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  AND updated_by = auth.uid()
);

CREATE POLICY "Admins can update admin runtime settings"
ON public.admin_runtime_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));