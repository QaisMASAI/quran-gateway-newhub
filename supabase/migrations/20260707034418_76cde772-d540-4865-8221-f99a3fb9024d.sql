ALTER TABLE public.quran_ingest_reports
  ADD COLUMN status text NOT NULL DEFAULT 'completed',
  ADD COLUMN started_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN completed_at timestamptz,
  ADD COLUMN failed_count integer NOT NULL DEFAULT 0,
  ADD COLUMN batch_errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN row_errors jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_quran_ingest_reports_status_created_at
  ON public.quran_ingest_reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quran_ingest_reports_created_at_id
  ON public.quran_ingest_reports (created_at DESC, id DESC);