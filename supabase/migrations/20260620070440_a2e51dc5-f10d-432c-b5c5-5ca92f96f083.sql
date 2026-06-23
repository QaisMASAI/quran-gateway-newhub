CREATE TABLE public.knowledge_journey_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id uuid NOT NULL REFERENCES public.knowledge_journeys(id) ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES public.knowledge_journey_steps(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, step_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_journey_progress TO authenticated;
GRANT ALL ON public.knowledge_journey_progress TO service_role;

ALTER TABLE public.knowledge_journey_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage their own journey progress"
  ON public.knowledge_journey_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX kjp_user_journey_idx ON public.knowledge_journey_progress (user_id, journey_id);