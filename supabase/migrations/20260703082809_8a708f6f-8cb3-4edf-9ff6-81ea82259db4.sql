CREATE TYPE public.knowledge_publication_status AS ENUM ('draft', 'published', 'scheduled', 'archived');
CREATE TYPE public.knowledge_job_status AS ENUM ('queued', 'running', 'succeeded', 'failed', 'retrying', 'paused', 'cancelled');
CREATE TYPE public.translation_review_status AS ENUM ('pending', 'reviewed', 'approved', 'rejected');

CREATE TABLE public.knowledge_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  source_type text NOT NULL,
  code text,
  name_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  last_import_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.knowledge_sources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.knowledge_sources TO authenticated;
GRANT ALL ON public.knowledge_sources TO service_role;
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published knowledge sources are public"
  ON public.knowledge_sources
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
CREATE POLICY "Admins manage knowledge sources"
  ON public.knowledge_sources
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.knowledge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.knowledge_sources(id) ON DELETE CASCADE,
  external_key text NOT NULL,
  content_kind text NOT NULL,
  surah smallint,
  ayah_start smallint,
  ayah_end smallint,
  canonical_ref text,
  publication_status public.knowledge_publication_status NOT NULL DEFAULT 'draft',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  checksum text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, external_key)
);
GRANT SELECT ON public.knowledge_entries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.knowledge_entries TO authenticated;
GRANT ALL ON public.knowledge_entries TO service_role;
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published knowledge entries are public"
  ON public.knowledge_entries
  FOR SELECT
  TO anon, authenticated
  USING (publication_status = 'published');
CREATE POLICY "Admins manage knowledge entries"
  ON public.knowledge_entries
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.knowledge_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  body text NOT NULL,
  title text,
  summary text,
  source_language_code text,
  translation_version text NOT NULL DEFAULT 'v1',
  source_kind text NOT NULL DEFAULT 'imported',
  translation_status public.knowledge_job_status NOT NULL DEFAULT 'succeeded',
  review_status public.translation_review_status NOT NULL DEFAULT 'pending',
  is_manual_edit boolean NOT NULL DEFAULT false,
  manual_locked boolean NOT NULL DEFAULT false,
  ai_provider text,
  ai_model text,
  prompt_version text,
  token_count integer NOT NULL DEFAULT 0,
  estimated_cost_usd numeric(12,6) NOT NULL DEFAULT 0,
  duration_ms integer,
  quality_score numeric(5,2),
  checksum text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entry_id, language_code, translation_version)
);
GRANT SELECT ON public.knowledge_translations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.knowledge_translations TO authenticated;
GRANT ALL ON public.knowledge_translations TO service_role;
ALTER TABLE public.knowledge_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published knowledge translations are public"
  ON public.knowledge_translations
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.knowledge_entries e
      WHERE e.id = knowledge_translations.entry_id
        AND e.publication_status = 'published'
    )
  );
CREATE POLICY "Admins manage knowledge translations"
  ON public.knowledge_translations
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.knowledge_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  translation_id uuid REFERENCES public.knowledge_translations(id) ON DELETE SET NULL,
  language_code text NOT NULL,
  embedding_model text NOT NULL DEFAULT 'google/gemini-embedding-001',
  dimensions integer NOT NULL DEFAULT 3072,
  embedding vector(3072),
  checksum text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entry_id, language_code, embedding_model, checksum)
);
GRANT SELECT ON public.knowledge_embeddings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.knowledge_embeddings TO authenticated;
GRANT ALL ON public.knowledge_embeddings TO service_role;
ALTER TABLE public.knowledge_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read embeddings"
  ON public.knowledge_embeddings
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage embeddings"
  ON public.knowledge_embeddings
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.knowledge_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_entry_id uuid NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  to_entry_id uuid NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  relation_type text NOT NULL,
  weight numeric(4,2) NOT NULL DEFAULT 1,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_entry_id, to_entry_id, relation_type)
);
GRANT SELECT ON public.knowledge_relationships TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.knowledge_relationships TO authenticated;
GRANT ALL ON public.knowledge_relationships TO service_role;
ALTER TABLE public.knowledge_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published relationships are public"
  ON public.knowledge_relationships
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.knowledge_entries a WHERE a.id = knowledge_relationships.from_entry_id AND a.publication_status = 'published')
    AND EXISTS (SELECT 1 FROM public.knowledge_entries b WHERE b.id = knowledge_relationships.to_entry_id AND b.publication_status = 'published')
  );
CREATE POLICY "Admins manage relationships"
  ON public.knowledge_relationships
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  source_id uuid REFERENCES public.knowledge_sources(id) ON DELETE SET NULL,
  status public.knowledge_job_status NOT NULL DEFAULT 'queued',
  requested_by uuid,
  worker_id text,
  checkpoint jsonb NOT NULL DEFAULT '{}'::jsonb,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  failed_batches jsonb NOT NULL DEFAULT '[]'::jsonb,
  checksum text,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 5,
  paused_at timestamptz,
  cancelled_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.import_jobs TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.import_jobs TO authenticated;
GRANT ALL ON public.import_jobs TO service_role;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read import jobs"
  ON public.import_jobs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage import jobs"
  ON public.import_jobs
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.translation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  source_language_code text NOT NULL,
  target_language_code text NOT NULL,
  status public.knowledge_job_status NOT NULL DEFAULT 'queued',
  provider text,
  model text,
  prompt_version text,
  requested_by uuid,
  worker_id text,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 5,
  token_count integer NOT NULL DEFAULT 0,
  estimated_cost_usd numeric(12,6) NOT NULL DEFAULT 0,
  duration_ms integer,
  quality_score numeric(5,2),
  failed_reason text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entry_id, source_language_code, target_language_code)
);
GRANT SELECT ON public.translation_jobs TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.translation_jobs TO authenticated;
GRANT ALL ON public.translation_jobs TO service_role;
ALTER TABLE public.translation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read translation jobs"
  ON public.translation_jobs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage translation jobs"
  ON public.translation_jobs
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.embedding_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  embedding_model text NOT NULL DEFAULT 'google/gemini-embedding-001',
  status public.knowledge_job_status NOT NULL DEFAULT 'queued',
  requested_by uuid,
  worker_id text,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 5,
  duration_ms integer,
  failed_reason text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entry_id, language_code, embedding_model)
);
GRANT SELECT ON public.embedding_jobs TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.embedding_jobs TO authenticated;
GRANT ALL ON public.embedding_jobs TO service_role;
ALTER TABLE public.embedding_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read embedding jobs"
  ON public.embedding_jobs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage embedding jobs"
  ON public.embedding_jobs
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.knowledge_job_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  job_id uuid NOT NULL,
  status public.knowledge_job_status,
  level text NOT NULL DEFAULT 'info',
  message text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.knowledge_job_logs TO authenticated;
GRANT INSERT ON public.knowledge_job_logs TO authenticated;
GRANT ALL ON public.knowledge_job_logs TO service_role;
ALTER TABLE public.knowledge_job_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read job logs"
  ON public.knowledge_job_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write job logs"
  ON public.knowledge_job_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  template_key text,
  status public.knowledge_publication_status NOT NULL DEFAULT 'draft',
  title_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  body_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_title_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  canonical_url text,
  og_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  twitter_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  jsonld jsonb NOT NULL DEFAULT '{}'::jsonb,
  menu_visible boolean NOT NULL DEFAULT true,
  search_visible boolean NOT NULL DEFAULT true,
  language_visibility text[] NOT NULL DEFAULT ARRAY['ar','en','he'],
  breadcrumbs jsonb NOT NULL DEFAULT '[]'::jsonb,
  scheduled_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  last_editor uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cms_pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cms_pages TO authenticated;
GRANT ALL ON public.cms_pages TO service_role;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public published pages are readable"
  ON public.cms_pages
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');
CREATE POLICY "Admins manage pages"
  ON public.cms_pages
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.cms_page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
  version_no integer NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  change_note text,
  editor_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_id, version_no)
);
GRANT SELECT ON public.cms_page_versions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cms_page_versions TO authenticated;
GRANT ALL ON public.cms_page_versions TO service_role;
ALTER TABLE public.cms_page_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read page versions"
  ON public.cms_page_versions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage page versions"
  ON public.cms_page_versions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.admin_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT false,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_feature_flags TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.admin_feature_flags TO authenticated;
GRANT ALL ON public.admin_feature_flags TO service_role;
ALTER TABLE public.admin_feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read feature flags"
  ON public.admin_feature_flags
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage feature flags"
  ON public.admin_feature_flags
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.admin_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'configured',
  masked_value text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_integrations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.admin_integrations TO authenticated;
GRANT ALL ON public.admin_integrations TO service_role;
ALTER TABLE public.admin_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read integrations"
  ON public.admin_integrations
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage integrations"
  ON public.admin_integrations
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX knowledge_sources_slug_idx ON public.knowledge_sources(slug);
CREATE INDEX knowledge_entries_source_kind_idx ON public.knowledge_entries(source_id, content_kind);
CREATE INDEX knowledge_entries_ref_idx ON public.knowledge_entries(surah, ayah_start, ayah_end);
CREATE INDEX knowledge_entries_status_idx ON public.knowledge_entries(publication_status, updated_at DESC);
CREATE INDEX knowledge_translations_entry_lang_idx ON public.knowledge_translations(entry_id, language_code);
CREATE INDEX knowledge_translations_status_idx ON public.knowledge_translations(translation_status, review_status);
CREATE INDEX knowledge_embeddings_entry_idx ON public.knowledge_embeddings(entry_id, language_code);
CREATE INDEX knowledge_relationships_from_idx ON public.knowledge_relationships(from_entry_id, relation_type);
CREATE INDEX knowledge_relationships_to_idx ON public.knowledge_relationships(to_entry_id, relation_type);
CREATE INDEX import_jobs_status_idx ON public.import_jobs(status, created_at DESC);
CREATE INDEX translation_jobs_status_idx ON public.translation_jobs(status, target_language_code, created_at DESC);
CREATE INDEX embedding_jobs_status_idx ON public.embedding_jobs(status, language_code, created_at DESC);
CREATE INDEX knowledge_job_logs_job_idx ON public.knowledge_job_logs(job_type, job_id, created_at DESC);
CREATE INDEX cms_pages_status_idx ON public.cms_pages(status, updated_at DESC);
CREATE INDEX cms_pages_menu_idx ON public.cms_pages(menu_visible, search_visible);
CREATE INDEX cms_page_versions_page_idx ON public.cms_page_versions(page_id, version_no DESC);

CREATE OR REPLACE FUNCTION public.log_knowledge_job_event(
  _job_type text,
  _job_id uuid,
  _status public.knowledge_job_status,
  _level text,
  _message text,
  _details jsonb,
  _actor_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.knowledge_job_logs(job_type, job_id, status, level, message, details, actor_user_id)
  VALUES (_job_type, _job_id, _status, COALESCE(_level, 'info'), _message, COALESCE(_details, '{}'::jsonb), _actor_user_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_next_translation_job(_worker_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id
  INTO v_id
  FROM public.translation_jobs
  WHERE status IN ('queued', 'retrying')
  ORDER BY created_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF v_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.translation_jobs
  SET status = 'running',
      worker_id = _worker_id,
      started_at = COALESCE(started_at, now()),
      updated_at = now()
  WHERE id = v_id;

  PERFORM public.log_knowledge_job_event('translation', v_id, 'running', 'info', 'Worker claimed translation job', jsonb_build_object('worker_id', _worker_id), NULL);
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_next_embedding_job(_worker_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id
  INTO v_id
  FROM public.embedding_jobs
  WHERE status IN ('queued', 'retrying')
  ORDER BY created_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF v_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.embedding_jobs
  SET status = 'running',
      worker_id = _worker_id,
      started_at = COALESCE(started_at, now()),
      updated_at = now()
  WHERE id = v_id;

  PERFORM public.log_knowledge_job_event('embedding', v_id, 'running', 'info', 'Worker claimed embedding job', jsonb_build_object('worker_id', _worker_id), NULL);
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_knowledge_job_event(text, uuid, public.knowledge_job_status, text, text, jsonb, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_next_translation_job(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_next_embedding_job(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_knowledge_job_event(text, uuid, public.knowledge_job_status, text, text, jsonb, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_next_translation_job(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_next_embedding_job(text) TO service_role;

CREATE OR REPLACE TRIGGER trg_knowledge_sources_updated_at
BEFORE UPDATE ON public.knowledge_sources
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE TRIGGER trg_knowledge_entries_updated_at
BEFORE UPDATE ON public.knowledge_entries
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE TRIGGER trg_knowledge_translations_updated_at
BEFORE UPDATE ON public.knowledge_translations
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE TRIGGER trg_knowledge_embeddings_updated_at
BEFORE UPDATE ON public.knowledge_embeddings
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE TRIGGER trg_import_jobs_updated_at
BEFORE UPDATE ON public.import_jobs
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE TRIGGER trg_translation_jobs_updated_at
BEFORE UPDATE ON public.translation_jobs
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE TRIGGER trg_embedding_jobs_updated_at
BEFORE UPDATE ON public.embedding_jobs
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE TRIGGER trg_cms_pages_updated_at
BEFORE UPDATE ON public.cms_pages
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE TRIGGER trg_admin_feature_flags_updated_at
BEFORE UPDATE ON public.admin_feature_flags
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE TRIGGER trg_admin_integrations_updated_at
BEFORE UPDATE ON public.admin_integrations
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();