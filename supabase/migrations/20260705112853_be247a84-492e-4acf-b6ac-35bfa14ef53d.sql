CREATE TYPE public.quran_dataset_kind AS ENUM (
  'translation',
  'tafsir',
  'hadith',
  'asbab',
  'word_by_word',
  'root_lexicon',
  'morphology',
  'grammar',
  'tajweed',
  'recitation',
  'topic_map',
  'entity_map',
  'timeline',
  'revelation_metadata',
  'cross_reference',
  'audio_asset',
  'other'
);

CREATE TABLE public.quran_datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  kind public.quran_dataset_kind NOT NULL,
  title_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  language_code text,
  source_name text,
  source_url text,
  source_license text,
  version text NOT NULL DEFAULT 'v1',
  schema_version integer NOT NULL DEFAULT 1,
  import_mode text NOT NULL DEFAULT 'json',
  is_active boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quran_datasets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quran_datasets TO authenticated;
GRANT ALL ON public.quran_datasets TO service_role;
ALTER TABLE public.quran_datasets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public readable Quran datasets"
  ON public.quran_datasets
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true AND is_active = true);
CREATE POLICY "Admins manage Quran datasets"
  ON public.quran_datasets
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quran_dataset_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid NOT NULL REFERENCES public.quran_datasets(id) ON DELETE CASCADE,
  external_key text NOT NULL,
  content_type text NOT NULL DEFAULT 'entry',
  language_code text,
  surah smallint,
  ayah_start smallint,
  ayah_end smallint,
  juz smallint,
  hizb smallint,
  page smallint,
  revelation_order smallint,
  chronology_order integer,
  is_meccan boolean,
  tags text[] NOT NULL DEFAULT '{}',
  title_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  body_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  publication_status public.knowledge_publication_status NOT NULL DEFAULT 'published',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  checksum text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dataset_id, external_key),
  CONSTRAINT quran_dataset_items_surah_check CHECK (
    surah IS NULL OR (surah >= 1 AND surah <= 114)
  ),
  CONSTRAINT quran_dataset_items_ayah_check CHECK (
    (ayah_start IS NULL AND ayah_end IS NULL) OR
    (ayah_start IS NOT NULL AND ayah_end IS NOT NULL AND ayah_start > 0 AND ayah_end >= ayah_start)
  )
);
GRANT SELECT ON public.quran_dataset_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quran_dataset_items TO authenticated;
GRANT ALL ON public.quran_dataset_items TO service_role;
ALTER TABLE public.quran_dataset_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public readable Quran dataset items"
  ON public.quran_dataset_items
  FOR SELECT
  TO anon, authenticated
  USING (
    publication_status = 'published'
    AND EXISTS (
      SELECT 1
      FROM public.quran_datasets d
      WHERE d.id = quran_dataset_items.dataset_id
        AND d.is_public = true
        AND d.is_active = true
    )
  );
CREATE POLICY "Admins manage Quran dataset items"
  ON public.quran_dataset_items
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quran_item_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.quran_dataset_items(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  chunk_index integer NOT NULL DEFAULT 0,
  chunk_text text NOT NULL,
  embedding vector(3072),
  embedding_model text NOT NULL DEFAULT 'openai/text-embedding-3-large',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, language_code, chunk_index, embedding_model)
);
GRANT SELECT ON public.quran_item_embeddings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quran_item_embeddings TO authenticated;
GRANT ALL ON public.quran_item_embeddings TO service_role;
ALTER TABLE public.quran_item_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read Quran item embeddings"
  ON public.quran_item_embeddings
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage Quran item embeddings"
  ON public.quran_item_embeddings
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quran_item_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_item_id uuid NOT NULL REFERENCES public.quran_dataset_items(id) ON DELETE CASCADE,
  to_item_id uuid NOT NULL REFERENCES public.quran_dataset_items(id) ON DELETE CASCADE,
  relation_type text NOT NULL,
  weight numeric(6,3) NOT NULL DEFAULT 1,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_item_id, to_item_id, relation_type)
);
GRANT SELECT ON public.quran_item_relations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quran_item_relations TO authenticated;
GRANT ALL ON public.quran_item_relations TO service_role;
ALTER TABLE public.quran_item_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public readable Quran item relations"
  ON public.quran_item_relations
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.quran_dataset_items fi
      JOIN public.quran_datasets fd ON fd.id = fi.dataset_id
      WHERE fi.id = quran_item_relations.from_item_id
        AND fi.publication_status = 'published'
        AND fd.is_public = true
        AND fd.is_active = true
    )
    AND EXISTS (
      SELECT 1
      FROM public.quran_dataset_items ti
      JOIN public.quran_datasets td ON td.id = ti.dataset_id
      WHERE ti.id = quran_item_relations.to_item_id
        AND ti.publication_status = 'published'
        AND td.is_public = true
        AND td.is_active = true
    )
  );
CREATE POLICY "Admins manage Quran item relations"
  ON public.quran_item_relations
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quran_word_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surah smallint NOT NULL,
  ayah smallint NOT NULL,
  word_index smallint NOT NULL,
  token_ar text NOT NULL,
  token_uthmani text,
  normalized_ar text,
  transliteration_en text,
  transliteration_he text,
  translation_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  root_ar text,
  lemma_ar text,
  morphology_code text,
  morphology_detail_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  pos_tag text,
  grammar_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  tajweed_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  tajweed_rule_codes text[] NOT NULL DEFAULT '{}',
  audio_start_ms integer,
  audio_end_ms integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (surah, ayah, word_index),
  CONSTRAINT quran_word_annotations_surah_check CHECK (surah BETWEEN 1 AND 114),
  CONSTRAINT quran_word_annotations_ayah_check CHECK (ayah > 0)
);
GRANT SELECT ON public.quran_word_annotations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quran_word_annotations TO authenticated;
GRANT ALL ON public.quran_word_annotations TO service_role;
ALTER TABLE public.quran_word_annotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public readable Quran word annotations"
  ON public.quran_word_annotations
  FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "Admins manage Quran word annotations"
  ON public.quran_word_annotations
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quran_reciters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  style text,
  language_code text NOT NULL DEFAULT 'ar',
  country_code text,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quran_reciters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quran_reciters TO authenticated;
GRANT ALL ON public.quran_reciters TO service_role;
ALTER TABLE public.quran_reciters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public readable Quran reciters"
  ON public.quran_reciters
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
CREATE POLICY "Admins manage Quran reciters"
  ON public.quran_reciters
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quran_audio_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reciter_id uuid NOT NULL REFERENCES public.quran_reciters(id) ON DELETE CASCADE,
  surah smallint NOT NULL,
  ayah smallint,
  quality_label text NOT NULL,
  bitrate_kbps integer,
  format text NOT NULL DEFAULT 'mp3',
  url text NOT NULL,
  duration_ms integer,
  checksum text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reciter_id, surah, ayah, quality_label),
  CONSTRAINT quran_audio_files_surah_check CHECK (surah BETWEEN 1 AND 114),
  CONSTRAINT quran_audio_files_ayah_check CHECK (ayah IS NULL OR ayah > 0)
);
GRANT SELECT ON public.quran_audio_files TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quran_audio_files TO authenticated;
GRANT ALL ON public.quran_audio_files TO service_role;
ALTER TABLE public.quran_audio_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public readable Quran audio files"
  ON public.quran_audio_files
  FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "Admins manage Quran audio files"
  ON public.quran_audio_files
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX quran_datasets_kind_idx ON public.quran_datasets(kind, is_active, is_public);
CREATE INDEX quran_dataset_items_dataset_idx ON public.quran_dataset_items(dataset_id, language_code);
CREATE INDEX quran_dataset_items_verse_idx ON public.quran_dataset_items(surah, ayah_start, ayah_end);
CREATE INDEX quran_dataset_items_filter_idx ON public.quran_dataset_items(is_meccan, revelation_order, chronology_order);
CREATE INDEX quran_dataset_items_tags_idx ON public.quran_dataset_items USING gin(tags);
CREATE INDEX quran_item_embeddings_item_idx ON public.quran_item_embeddings(item_id, language_code);
CREATE INDEX quran_word_annotations_lookup_idx ON public.quran_word_annotations(surah, ayah, word_index);
CREATE INDEX quran_word_annotations_root_idx ON public.quran_word_annotations(root_ar, lemma_ar);
CREATE INDEX quran_audio_files_lookup_idx ON public.quran_audio_files(reciter_id, surah, ayah, quality_label);
CREATE INDEX quran_item_relations_from_idx ON public.quran_item_relations(from_item_id, relation_type);
CREATE INDEX quran_item_relations_to_idx ON public.quran_item_relations(to_item_id, relation_type);

CREATE OR REPLACE FUNCTION public.search_quran_items_hybrid(
  q text,
  query_embedding vector DEFAULT NULL,
  language_filter text DEFAULT NULL,
  kind_filter public.quran_dataset_kind[] DEFAULT NULL,
  meccan_filter boolean DEFAULT NULL,
  match_count integer DEFAULT 20
)
RETURNS TABLE (
  item_id uuid,
  dataset_id uuid,
  dataset_kind public.quran_dataset_kind,
  language_code text,
  surah smallint,
  ayah_start smallint,
  ayah_end smallint,
  title_i18n jsonb,
  body_i18n jsonb,
  score double precision
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH text_hits AS (
    SELECT
      i.id AS item_id,
      ts_rank(
        to_tsvector('simple', coalesce(i.title_i18n::text, '') || ' ' || coalesce(i.body_i18n::text, '') || ' ' || coalesce(i.payload::text, '')),
        websearch_to_tsquery('simple', coalesce(q, ''))
      ) AS text_score
    FROM public.quran_dataset_items i
    JOIN public.quran_datasets d ON d.id = i.dataset_id
    WHERE i.publication_status = 'published'
      AND d.is_public = true
      AND d.is_active = true
      AND (language_filter IS NULL OR i.language_code = language_filter)
      AND (kind_filter IS NULL OR d.kind = ANY(kind_filter))
      AND (meccan_filter IS NULL OR i.is_meccan = meccan_filter)
      AND (
        q IS NULL OR q = '' OR
        to_tsvector('simple', coalesce(i.title_i18n::text, '') || ' ' || coalesce(i.body_i18n::text, '') || ' ' || coalesce(i.payload::text, ''))
          @@ websearch_to_tsquery('simple', q)
      )
  ),
  vec_hits AS (
    SELECT
      e.item_id,
      max(1 - (e.embedding <=> query_embedding)) AS vec_score
    FROM public.quran_item_embeddings e
    JOIN public.quran_dataset_items i ON i.id = e.item_id
    JOIN public.quran_datasets d ON d.id = i.dataset_id
    WHERE query_embedding IS NOT NULL
      AND e.embedding IS NOT NULL
      AND i.publication_status = 'published'
      AND d.is_public = true
      AND d.is_active = true
      AND (language_filter IS NULL OR i.language_code = language_filter)
      AND (kind_filter IS NULL OR d.kind = ANY(kind_filter))
      AND (meccan_filter IS NULL OR i.is_meccan = meccan_filter)
    GROUP BY e.item_id
    ORDER BY vec_score DESC
    LIMIT GREATEST(20, match_count * 3)
  ),
  combined AS (
    SELECT item_id, text_score AS s FROM text_hits
    UNION ALL
    SELECT item_id, vec_score * 0.85 AS s FROM vec_hits
  ),
  ranked AS (
    SELECT item_id, sum(s) AS score
    FROM combined
    GROUP BY item_id
  )
  SELECT
    i.id,
    i.dataset_id,
    d.kind,
    i.language_code,
    i.surah,
    i.ayah_start,
    i.ayah_end,
    i.title_i18n,
    i.body_i18n,
    r.score
  FROM ranked r
  JOIN public.quran_dataset_items i ON i.id = r.item_id
  JOIN public.quran_datasets d ON d.id = i.dataset_id
  ORDER BY r.score DESC NULLS LAST
  LIMIT GREATEST(1, LEAST(match_count, 100));
$$;

GRANT EXECUTE ON FUNCTION public.search_quran_items_hybrid(text, vector, text, public.quran_dataset_kind[], boolean, integer) TO anon, authenticated, service_role;

CREATE TRIGGER trg_quran_datasets_updated
  BEFORE UPDATE ON public.quran_datasets
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_quran_dataset_items_updated
  BEFORE UPDATE ON public.quran_dataset_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_quran_item_embeddings_updated
  BEFORE UPDATE ON public.quran_item_embeddings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_quran_word_annotations_updated
  BEFORE UPDATE ON public.quran_word_annotations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_quran_reciters_updated
  BEFORE UPDATE ON public.quran_reciters
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_quran_audio_files_updated
  BEFORE UPDATE ON public.quran_audio_files
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();