
-- Expand knowledge graph: add 'person' kind + metadata columns + FTS + hybrid search RPC
-- + collections, study workspaces, achievements, daily journeys

ALTER TYPE public.knowledge_kind ADD VALUE IF NOT EXISTS 'person';

-- Metadata columns on knowledge_entities
ALTER TABLE public.knowledge_entities
  ADD COLUMN IF NOT EXISTS alt_names_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS era_start_year integer,
  ADD COLUMN IF NOT EXISTS era_end_year integer,
  ADD COLUMN IF NOT EXISTS revelation_period text,
  ADD COLUMN IF NOT EXISTS latitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS verse_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fts tsvector
    GENERATED ALWAYS AS (
      to_tsvector('simple',
        coalesce(slug,'') || ' ' ||
        coalesce(title_i18n->>'en','') || ' ' ||
        coalesce(title_i18n->>'he','') || ' ' ||
        coalesce(title_i18n->>'ar','') || ' ' ||
        coalesce(summary_i18n->>'en','') || ' ' ||
        coalesce(summary_i18n->>'he','') || ' ' ||
        coalesce(summary_i18n->>'ar','') || ' ' ||
        coalesce(keywords_i18n->>'en','') || ' ' ||
        coalesce(keywords_i18n->>'he','') || ' ' ||
        coalesce(keywords_i18n->>'ar','')
      )
    ) STORED;

CREATE INDEX IF NOT EXISTS knowledge_entities_fts_idx ON public.knowledge_entities USING gin(fts);
CREATE INDEX IF NOT EXISTS knowledge_entities_kind_idx ON public.knowledge_entities(kind) WHERE published = true;
CREATE INDEX IF NOT EXISTS knowledge_entities_geo_idx ON public.knowledge_entities(latitude, longitude) WHERE latitude IS NOT NULL;

-- FTS on verse_embeddings (arabic + hebrew)
ALTER TABLE public.verse_embeddings
  ADD COLUMN IF NOT EXISTS fts tsvector
    GENERATED ALWAYS AS (
      to_tsvector('simple', coalesce(arabic,'') || ' ' || coalesce(hebrew,''))
    ) STORED;
CREATE INDEX IF NOT EXISTS verse_embeddings_fts_idx ON public.verse_embeddings USING gin(fts);

-- Hybrid entity search
CREATE OR REPLACE FUNCTION public.search_entities_hybrid(
  q text,
  query_embedding vector DEFAULT NULL,
  kind_filter public.knowledge_kind[] DEFAULT NULL,
  match_count integer DEFAULT 20
) RETURNS TABLE (
  id uuid, kind public.knowledge_kind, slug text,
  title_i18n jsonb, summary_i18n jsonb, hero_image text, icon text,
  score double precision
) LANGUAGE sql STABLE SET search_path = public AS $$
  WITH text_hits AS (
    SELECT e.id,
      ts_rank(e.fts, websearch_to_tsquery('simple', coalesce(q,''))) AS text_score
    FROM public.knowledge_entities e
    WHERE e.published = true
      AND (kind_filter IS NULL OR e.kind = ANY(kind_filter))
      AND (q IS NULL OR q = '' OR e.fts @@ websearch_to_tsquery('simple', q))
  ),
  vec_hits AS (
    SELECT e.id,
      1 - (e.embedding <=> query_embedding) AS vec_score
    FROM public.knowledge_entities e
    WHERE e.published = true
      AND query_embedding IS NOT NULL
      AND e.embedding IS NOT NULL
      AND (kind_filter IS NULL OR e.kind = ANY(kind_filter))
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count * 3
  ),
  combined AS (
    SELECT id, text_score AS s FROM text_hits
    UNION ALL
    SELECT id, vec_score * 0.7 FROM vec_hits
  ),
  ranked AS (
    SELECT id, sum(s) AS score FROM combined GROUP BY id
  )
  SELECT e.id, e.kind, e.slug, e.title_i18n, e.summary_i18n, e.hero_image, e.icon, r.score
  FROM ranked r JOIN public.knowledge_entities e ON e.id = r.id
  ORDER BY r.score DESC NULLS LAST
  LIMIT match_count;
$$;

-- Hybrid verse search (text + vector)
CREATE OR REPLACE FUNCTION public.search_verses_hybrid(
  q text,
  query_embedding vector DEFAULT NULL,
  theme_filter text[] DEFAULT NULL,
  match_count integer DEFAULT 20
) RETURNS TABLE (
  surah smallint, ayah smallint, arabic text, hebrew text, themes text[], score double precision
) LANGUAGE sql STABLE SET search_path = public AS $$
  WITH text_hits AS (
    SELECT v.surah, v.ayah,
      ts_rank(v.fts, websearch_to_tsquery('simple', coalesce(q,''))) AS s
    FROM public.verse_embeddings v
    WHERE (q IS NULL OR q = '' OR v.fts @@ websearch_to_tsquery('simple', q))
      AND (theme_filter IS NULL OR v.themes && theme_filter)
  ),
  vec_hits AS (
    SELECT v.surah, v.ayah, (1 - (v.embedding <=> query_embedding)) * 0.8 AS s
    FROM public.verse_embeddings v
    WHERE query_embedding IS NOT NULL AND v.embedding IS NOT NULL
      AND (theme_filter IS NULL OR v.themes && theme_filter)
    ORDER BY v.embedding <=> query_embedding
    LIMIT match_count * 3
  ),
  combined AS (
    SELECT surah, ayah, s FROM text_hits
    UNION ALL SELECT surah, ayah, s FROM vec_hits
  ),
  ranked AS (
    SELECT surah, ayah, sum(s) AS score FROM combined GROUP BY surah, ayah
  )
  SELECT v.surah, v.ayah, v.arabic, v.hebrew, v.themes, r.score
  FROM ranked r JOIN public.verse_embeddings v ON v.surah=r.surah AND v.ayah=r.ayah
  ORDER BY r.score DESC NULLS LAST
  LIMIT match_count;
$$;

-- Collections (user-curated groups of verses/entities)
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean NOT NULL DEFAULT false,
  cover_color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT SELECT ON public.collections TO anon;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or public collections readable" ON public.collections FOR SELECT USING (is_public OR auth.uid() = user_id);
CREATE POLICY "own collections writable" ON public.collections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  item_kind text NOT NULL CHECK (item_kind IN ('verse','entity','note')),
  surah smallint,
  ayah_start smallint,
  ayah_end smallint,
  entity_id uuid REFERENCES public.knowledge_entities(id) ON DELETE CASCADE,
  note text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_items TO authenticated;
GRANT SELECT ON public.collection_items TO anon;
GRANT ALL ON public.collection_items TO service_role;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collection items follow collection" ON public.collection_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND (c.is_public OR c.user_id = auth.uid())));
CREATE POLICY "collection items writable by owner" ON public.collection_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid()));

-- Daily learning journey (per-user one-per-day pick)
CREATE TABLE IF NOT EXISTS public.daily_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL,
  surah smallint NOT NULL,
  ayah smallint NOT NULL,
  entity_id uuid REFERENCES public.knowledge_entities(id) ON DELETE SET NULL,
  reflection text,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_journeys TO authenticated;
GRANT ALL ON public.daily_journeys TO service_role;
ALTER TABLE public.daily_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own daily journeys" ON public.daily_journeys FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(user_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own achievements" ON public.achievements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AI research queries log (for RAG history + analytics)
CREATE TABLE IF NOT EXISTS public.ai_research_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  question text NOT NULL,
  answer text,
  citations jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric(3,2),
  language text NOT NULL DEFAULT 'he',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ai_research_queries TO authenticated;
GRANT INSERT ON public.ai_research_queries TO anon;
GRANT ALL ON public.ai_research_queries TO service_role;
ALTER TABLE public.ai_research_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own queries readable" ON public.ai_research_queries FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "anyone can log query" ON public.ai_research_queries FOR INSERT WITH CHECK (true);
