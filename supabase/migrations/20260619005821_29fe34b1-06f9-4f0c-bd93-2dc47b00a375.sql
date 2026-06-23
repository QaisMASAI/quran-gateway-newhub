-- Semantic retrieval foundation for the Quran corpus.
-- Source-only: each row mirrors an authenticated Quran verse (Arabic Uthmani
-- + Hebrew translation #233 from Quran.com) plus curated thematic labels
-- from the platform's own topic/emotion/prophet indices. No AI-generated
-- content is stored here.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE public.verse_embeddings (
  surah SMALLINT NOT NULL,
  ayah SMALLINT NOT NULL,
  arabic TEXT NOT NULL,
  hebrew TEXT NOT NULL,
  themes TEXT[] NOT NULL DEFAULT '{}',
  embedding vector(3072),
  embedding_model TEXT,
  embedded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (surah, ayah)
);

GRANT SELECT ON public.verse_embeddings TO authenticated;
GRANT ALL ON public.verse_embeddings TO service_role;

ALTER TABLE public.verse_embeddings ENABLE ROW LEVEL SECURITY;

-- Quran text is public knowledge; transparent read access for signed-in users.
CREATE POLICY "Verse embeddings are readable by authenticated users"
  ON public.verse_embeddings
  FOR SELECT
  TO authenticated
  USING (true);

-- Themes filter index (for future "patience + mercy"-style filtered retrieval).
CREATE INDEX verse_embeddings_themes_idx
  ON public.verse_embeddings USING gin (themes);

-- updated_at trigger (reuses existing public.tg_set_updated_at).
CREATE TRIGGER trg_verse_embeddings_updated_at
  BEFORE UPDATE ON public.verse_embeddings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Cosine-similarity retrieval RPC. Returns the top-k verses ranked by
-- semantic similarity to a query embedding, optionally filtered by theme.
CREATE OR REPLACE FUNCTION public.match_verses(
  query_embedding vector(3072),
  match_count INT DEFAULT 8,
  min_similarity FLOAT DEFAULT 0.2,
  theme_filter TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  surah SMALLINT,
  ayah SMALLINT,
  arabic TEXT,
  hebrew TEXT,
  themes TEXT[],
  similarity FLOAT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    v.surah,
    v.ayah,
    v.arabic,
    v.hebrew,
    v.themes,
    1 - (v.embedding <=> query_embedding) AS similarity
  FROM public.verse_embeddings v
  WHERE v.embedding IS NOT NULL
    AND (theme_filter IS NULL OR v.themes && theme_filter)
    AND 1 - (v.embedding <=> query_embedding) >= min_similarity
  ORDER BY v.embedding <=> query_embedding
  LIMIT GREATEST(1, LEAST(match_count, 50));
$$;

GRANT EXECUTE ON FUNCTION public.match_verses(vector, INT, FLOAT, TEXT[]) TO authenticated, service_role;