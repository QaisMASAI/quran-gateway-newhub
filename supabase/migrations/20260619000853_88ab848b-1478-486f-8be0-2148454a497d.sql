
CREATE TABLE public.reading_plan_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_slug text NOT NULL,
  day smallint NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, plan_slug, day)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_plan_progress TO authenticated;
GRANT ALL ON public.reading_plan_progress TO service_role;

ALTER TABLE public.reading_plan_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plan progress owner select"
  ON public.reading_plan_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Plan progress owner insert"
  ON public.reading_plan_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Plan progress owner delete"
  ON public.reading_plan_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
