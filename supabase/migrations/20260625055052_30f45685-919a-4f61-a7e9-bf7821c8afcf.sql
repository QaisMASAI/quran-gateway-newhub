
ALTER TABLE public.hadith_entries
  ADD COLUMN IF NOT EXISTS embedding vector(3072),
  ADD COLUMN IF NOT EXISTS embedding_model text,
  ADD COLUMN IF NOT EXISTS embedded_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS hadith_entity_links_hadith_entity_uidx
  ON public.hadith_entity_links (hadith_id, entity_id)
  WHERE entity_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS hadith_entity_links_hadith_verse_uidx
  ON public.hadith_entity_links (hadith_id, surah, ayah)
  WHERE surah IS NOT NULL AND ayah IS NOT NULL;

CREATE OR REPLACE FUNCTION public.match_hadith_to_verses(
  query_embedding vector,
  match_count int DEFAULT 5,
  min_similarity float DEFAULT 0.25
)
RETURNS TABLE(surah smallint, ayah smallint, similarity float)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT g.surah, g.ayah_start AS ayah,
         1 - (g.embedding <=> query_embedding) AS similarity
  FROM public.grounded_chunks g
  WHERE g.content_type = 'quran_ayah'
    AND g.embedding IS NOT NULL
    AND g.surah IS NOT NULL
    AND g.ayah_start IS NOT NULL
    AND 1 - (g.embedding <=> query_embedding) >= min_similarity
  ORDER BY g.embedding <=> query_embedding
  LIMIT GREATEST(1, LEAST(match_count, 25));
$$;

CREATE OR REPLACE FUNCTION public.match_hadith_to_entities(
  query_embedding vector,
  match_count int DEFAULT 3,
  min_similarity float DEFAULT 0.3
)
RETURNS TABLE(entity_id uuid, similarity float)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT e.id AS entity_id,
         1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_entities e
  WHERE e.published = true
    AND e.embedding IS NOT NULL
    AND 1 - (e.embedding <=> query_embedding) >= min_similarity
  ORDER BY e.embedding <=> query_embedding
  LIMIT GREATEST(1, LEAST(match_count, 25));
$$;
