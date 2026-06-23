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
SECURITY INVOKER
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

-- Re-grant after replace.
REVOKE ALL ON FUNCTION public.match_verses(vector, INT, FLOAT, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_verses(vector, INT, FLOAT, TEXT[]) TO authenticated, service_role;