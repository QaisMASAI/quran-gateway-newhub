
CREATE TABLE IF NOT EXISTS public.hadith_collections (
  slug text PRIMARY KEY,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  title_he text,
  author_ar text,
  author_en text,
  total_hadith integer NOT NULL DEFAULT 0,
  total_books integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hadith_collections TO anon, authenticated;
GRANT ALL ON public.hadith_collections TO service_role;
ALTER TABLE public.hadith_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hadith_collections public read" ON public.hadith_collections FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.hadith_books (
  id bigserial PRIMARY KEY,
  collection_slug text NOT NULL REFERENCES public.hadith_collections(slug) ON DELETE CASCADE,
  book_id integer NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  name_he text,
  hadith_count integer NOT NULL DEFAULT 0,
  UNIQUE (collection_slug, book_id)
);
CREATE INDEX IF NOT EXISTS hadith_books_collection_idx ON public.hadith_books(collection_slug, book_id);
GRANT SELECT ON public.hadith_books TO anon, authenticated;
GRANT ALL ON public.hadith_books TO service_role;
ALTER TABLE public.hadith_books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hadith_books public read" ON public.hadith_books FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.hadith_entries (
  id bigserial PRIMARY KEY,
  collection_slug text NOT NULL REFERENCES public.hadith_collections(slug) ON DELETE CASCADE,
  book_id integer NOT NULL,
  id_in_book integer NOT NULL,
  global_id integer NOT NULL,
  narrator text,
  arabic_text text NOT NULL,
  english_text text NOT NULL,
  hebrew_text text,
  fts tsvector GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(arabic_text,'') || ' ' ||
      coalesce(english_text,'') || ' ' ||
      coalesce(hebrew_text,'') || ' ' ||
      coalesce(narrator,'')
    )
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_slug, global_id)
);
CREATE INDEX IF NOT EXISTS hadith_entries_book_idx ON public.hadith_entries(collection_slug, book_id, id_in_book);
CREATE INDEX IF NOT EXISTS hadith_entries_fts_idx ON public.hadith_entries USING gin(fts);
GRANT SELECT ON public.hadith_entries TO anon, authenticated;
GRANT ALL ON public.hadith_entries TO service_role;
ALTER TABLE public.hadith_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hadith_entries public read" ON public.hadith_entries FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.hadith_entity_links (
  id bigserial PRIMARY KEY,
  hadith_id bigint NOT NULL REFERENCES public.hadith_entries(id) ON DELETE CASCADE,
  entity_id uuid REFERENCES public.knowledge_entities(id) ON DELETE CASCADE,
  surah smallint,
  ayah smallint,
  weight integer NOT NULL DEFAULT 5,
  CHECK (entity_id IS NOT NULL OR surah IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS hadith_links_hadith_idx ON public.hadith_entity_links(hadith_id);
CREATE INDEX IF NOT EXISTS hadith_links_entity_idx ON public.hadith_entity_links(entity_id);
CREATE INDEX IF NOT EXISTS hadith_links_verse_idx ON public.hadith_entity_links(surah, ayah);
GRANT SELECT ON public.hadith_entity_links TO anon, authenticated;
GRANT ALL ON public.hadith_entity_links TO service_role;
ALTER TABLE public.hadith_entity_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hadith_entity_links public read" ON public.hadith_entity_links FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.search_hadith_hybrid(
  q text,
  collections text[] DEFAULT NULL,
  match_count int DEFAULT 20
) RETURNS TABLE (
  id bigint, collection_slug text, book_id integer, id_in_book integer, global_id integer,
  narrator text, arabic_text text, english_text text, score float
) LANGUAGE sql STABLE SET search_path = public AS $fn$
  SELECT h.id, h.collection_slug, h.book_id, h.id_in_book, h.global_id,
         h.narrator, h.arabic_text, h.english_text,
         ts_rank(h.fts, websearch_to_tsquery('simple', coalesce(q,''))) AS score
  FROM public.hadith_entries h
  WHERE (q IS NULL OR q = '' OR h.fts @@ websearch_to_tsquery('simple', q))
    AND (collections IS NULL OR h.collection_slug = ANY(collections))
  ORDER BY score DESC NULLS LAST
  LIMIT GREATEST(1, LEAST(match_count, 100));
$fn$;

CREATE OR REPLACE VIEW public.hadith_narrators AS
  SELECT trim(narrator) AS narrator,
         count(*)::int  AS hadith_count,
         array_agg(DISTINCT collection_slug) AS collections
  FROM public.hadith_entries
  WHERE narrator IS NOT NULL AND length(trim(narrator)) > 0
  GROUP BY trim(narrator);
GRANT SELECT ON public.hadith_narrators TO anon, authenticated;

INSERT INTO public.hadith_collections (slug, title_ar, title_en, title_he, author_ar, author_en, sort_order) VALUES
  ('bukhari', E'\u0635\u062D\u064A\u062D \u0627\u0644\u0628\u062E\u0627\u0631\u064A', 'Sahih al-Bukhari', E'\u05E1\u05D4\u05D9\u05D7 \u05D0\u05DC-\u05D1\u05D5\u05DB\u05D0\u05E8\u05D9', E'\u0627\u0644\u0625\u0645\u0627\u0645 \u0645\u062D\u0645\u062F \u0628\u0646 \u0625\u0633\u0645\u0627\u0639\u064A\u0644 \u0627\u0644\u0628\u062E\u0627\u0631\u064A', 'Imam Muhammad ibn Ismail al-Bukhari', 1),
  ('muslim',  E'\u0635\u062D\u064A\u062D \u0645\u0633\u0644\u0645',           'Sahih Muslim',     E'\u05E1\u05D4\u05D9\u05D7 \u05DE\u05D5\u05E1\u05DC\u05D9\u05DD',           E'\u0627\u0644\u0625\u0645\u0627\u0645 \u0645\u0633\u0644\u0645 \u0628\u0646 \u0627\u0644\u062D\u062C\u0627\u062C', 'Imam Muslim ibn al-Hajjaj', 2)
ON CONFLICT (slug) DO NOTHING;
