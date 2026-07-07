CREATE TABLE public.quran_ingest_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind TEXT NOT NULL,
  dataset_id UUID,
  reciter_id UUID,
  received INTEGER NOT NULL DEFAULT 0,
  deduped INTEGER NOT NULL DEFAULT 0,
  written INTEGER NOT NULL DEFAULT 0,
  batches INTEGER NOT NULL DEFAULT 0,
  actor_user_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.quran_ingest_reports TO authenticated;
GRANT ALL ON public.quran_ingest_reports TO service_role;

ALTER TABLE public.quran_ingest_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read ingest reports"
  ON public.quran_ingest_reports
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_quran_ingest_reports_created_at ON public.quran_ingest_reports (created_at DESC);
