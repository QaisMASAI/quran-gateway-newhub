CREATE TABLE IF NOT EXISTS public.admin_job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_key text NOT NULL,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running','succeeded','failed')),
  requested_by uuid NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb,
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.admin_job_runs TO authenticated;
GRANT ALL ON public.admin_job_runs TO service_role;

ALTER TABLE public.admin_job_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own admin job runs" ON public.admin_job_runs;
CREATE POLICY "Users can read their own admin job runs"
ON public.admin_job_runs
FOR SELECT
TO authenticated
USING (requested_by = auth.uid());

DROP POLICY IF EXISTS "Users can create their own admin job runs" ON public.admin_job_runs;
CREATE POLICY "Users can create their own admin job runs"
ON public.admin_job_runs
FOR INSERT
TO authenticated
WITH CHECK (requested_by = auth.uid());

DROP POLICY IF EXISTS "Users can update their own admin job runs" ON public.admin_job_runs;
CREATE POLICY "Users can update their own admin job runs"
ON public.admin_job_runs
FOR UPDATE
TO authenticated
USING (requested_by = auth.uid())
WITH CHECK (requested_by = auth.uid());

CREATE TABLE IF NOT EXISTS public.admin_runtime_settings (
  key text PRIMARY KEY,
  value_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.admin_runtime_settings TO authenticated;
GRANT ALL ON public.admin_runtime_settings TO service_role;

ALTER TABLE public.admin_runtime_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read admin runtime settings" ON public.admin_runtime_settings;
CREATE POLICY "Authenticated can read admin runtime settings"
ON public.admin_runtime_settings
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can insert admin runtime settings" ON public.admin_runtime_settings;
CREATE POLICY "Authenticated can insert admin runtime settings"
ON public.admin_runtime_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update admin runtime settings" ON public.admin_runtime_settings;
CREATE POLICY "Authenticated can update admin runtime settings"
ON public.admin_runtime_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'tg_admin_job_runs_updated_at'
  ) THEN
    CREATE TRIGGER tg_admin_job_runs_updated_at
    BEFORE UPDATE ON public.admin_job_runs
    FOR EACH ROW
    EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'tg_admin_runtime_settings_updated_at'
  ) THEN
    CREATE TRIGGER tg_admin_runtime_settings_updated_at
    BEFORE UPDATE ON public.admin_runtime_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;
END $$;

INSERT INTO public.admin_runtime_settings (key, value_json)
VALUES ('research_cache', jsonb_build_object('ttl_minutes', 360))
ON CONFLICT (key) DO NOTHING;