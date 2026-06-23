CREATE TABLE IF NOT EXISTS public.tafsir_hebrew (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_tafsir_id uuid NOT NULL REFERENCES public.tafsir_passages(id) ON DELETE CASCADE,
  surah_id smallint NOT NULL CHECK (surah_id BETWEEN 1 AND 114),
  ayah_number smallint NOT NULL CHECK (ayah_number > 0),
  ayah_key text GENERATED ALWAYS AS ((surah_id::text || ':' || ayah_number::text)) STORED,
  source_tafsir_name text NOT NULL,
  original_arabic_text text NOT NULL,
  hebrew_translation text NOT NULL,
  translation_model text NOT NULL,
  quality_score numeric(4,3) CHECK (quality_score >= 0 AND quality_score <= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (original_tafsir_id, ayah_number)
);
GRANT SELECT ON public.tafsir_hebrew TO anon, authenticated;
GRANT ALL ON public.tafsir_hebrew TO service_role;
ALTER TABLE public.tafsir_hebrew ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tafsir_hebrew is public read" ON public.tafsir_hebrew;
CREATE POLICY "tafsir_hebrew is public read" ON public.tafsir_hebrew FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS tafsir_hebrew_surah_ayah_idx ON public.tafsir_hebrew (surah_id, ayah_number);
CREATE INDEX IF NOT EXISTS tafsir_hebrew_source_idx ON public.tafsir_hebrew (source_tafsir_name);

CREATE TABLE IF NOT EXISTS public.grounded_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('quran_ayah','tafsir','asbab','lesson')),
  language text NOT NULL CHECK (language IN ('he','ar','en')),
  source_table text NOT NULL,
  source_row_id uuid,
  surah smallint CHECK (surah BETWEEN 1 AND 114),
  ayah_start smallint CHECK (ayah_start > 0),
  ayah_end smallint CHECK (ayah_end > 0),
  ayah_key text,
  source_name text NOT NULL,
  translator_name text,
  chunk_text text NOT NULL,
  embedding vector(3072),
  embedding_model text NOT NULL DEFAULT 'openai/text-embedding-3-large',
  fts tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(chunk_text, '') || ' ' || coalesce(source_name, '') || ' ' || coalesce(translator_name, ''))
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.grounded_chunks TO anon, authenticated;
GRANT ALL ON public.grounded_chunks TO service_role;
ALTER TABLE public.grounded_chunks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "grounded_chunks is public read" ON public.grounded_chunks;
CREATE POLICY "grounded_chunks is public read" ON public.grounded_chunks FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS grounded_chunks_lookup_idx ON public.grounded_chunks (content_type, language, surah, ayah_start, ayah_end);
CREATE INDEX IF NOT EXISTS grounded_chunks_fts_idx ON public.grounded_chunks USING gin (fts);

CREATE OR REPLACE FUNCTION public.match_grounded_chunks(
  query_embedding vector,
  match_count integer DEFAULT 8,
  min_similarity double precision DEFAULT 0.2,
  language_filter text DEFAULT NULL,
  surah_filter smallint DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content_type text,
  language text,
  source_name text,
  translator_name text,
  surah smallint,
  ayah_start smallint,
  ayah_end smallint,
  ayah_key text,
  chunk_text text,
  similarity double precision
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    g.id,
    g.content_type,
    g.language,
    g.source_name,
    g.translator_name,
    g.surah,
    g.ayah_start,
    g.ayah_end,
    g.ayah_key,
    g.chunk_text,
    1 - (g.embedding <=> query_embedding) AS similarity
  FROM public.grounded_chunks g
  WHERE g.embedding IS NOT NULL
    AND (language_filter IS NULL OR g.language = language_filter)
    AND (surah_filter IS NULL OR g.surah = surah_filter)
    AND 1 - (g.embedding <=> query_embedding) >= min_similarity
  ORDER BY g.embedding <=> query_embedding
  LIMIT GREATEST(1, LEAST(match_count, 100));
$$;

GRANT EXECUTE ON FUNCTION public.match_grounded_chunks(vector, integer, double precision, text, smallint) TO anon, authenticated, service_role;