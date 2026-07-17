CREATE TABLE IF NOT EXISTS public.hadith_chapters (
  id bigserial PRIMARY KEY,
  collection_slug text NOT NULL REFERENCES public.hadith_collections(slug) ON DELETE CASCADE,
  book_id integer NOT NULL,
  chapter_number integer NOT NULL,
  title_ar text,
  title_en text,
  title_he text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_slug, book_id, chapter_number)
);
GRANT SELECT ON public.hadith_chapters TO anon, authenticated;
GRANT ALL ON public.hadith_chapters TO service_role;
ALTER TABLE public.hadith_chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hadith_chapters public read" ON public.hadith_chapters FOR SELECT USING (true);

ALTER TABLE public.hadith_entries
  ADD COLUMN IF NOT EXISTS chapter_id bigint REFERENCES public.hadith_chapters(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS grade text,
  ADD COLUMN IF NOT EXISTS grade_source text,
  ADD COLUMN IF NOT EXISTS chain_text text,
  ADD COLUMN IF NOT EXISTS reference_text text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS api_source text NOT NULL DEFAULT 'import',
  ADD COLUMN IF NOT EXISTS source_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS import_run_id uuid REFERENCES public.import_jobs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS hadith_entries_chapter_idx ON public.hadith_entries(chapter_id);
CREATE INDEX IF NOT EXISTS hadith_entries_import_run_idx ON public.hadith_entries(import_run_id);
CREATE INDEX IF NOT EXISTS hadith_entries_narrator_idx ON public.hadith_entries(narrator);
CREATE INDEX IF NOT EXISTS hadith_entries_collection_book_chapter_idx ON public.hadith_entries(collection_slug, book_id, chapter_id, id_in_book);

CREATE TABLE IF NOT EXISTS public.hadith_translations (
  id bigserial PRIMARY KEY,
  hadith_id bigint NOT NULL REFERENCES public.hadith_entries(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  title text,
  body text NOT NULL,
  translator text,
  source text,
  is_machine boolean NOT NULL DEFAULT false,
  translated_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  fts tsvector GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(title,'') || ' ' ||
      coalesce(body,'') || ' ' ||
      coalesce(translator,'')
    )
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hadith_translations TO anon, authenticated;
GRANT ALL ON public.hadith_translations TO service_role;
ALTER TABLE public.hadith_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hadith_translations public read" ON public.hadith_translations FOR SELECT USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS hadith_translations_unique_idx
  ON public.hadith_translations (hadith_id, language_code, coalesce(translator, ''));
CREATE INDEX IF NOT EXISTS hadith_translations_lang_idx ON public.hadith_translations(language_code, hadith_id);
CREATE INDEX IF NOT EXISTS hadith_translations_fts_idx ON public.hadith_translations USING gin(fts);

CREATE INDEX IF NOT EXISTS hadith_chapters_lookup_idx ON public.hadith_chapters(collection_slug, book_id, chapter_number);

DROP TRIGGER IF EXISTS trg_hadith_entries_updated_at ON public.hadith_entries;
CREATE TRIGGER trg_hadith_entries_updated_at
BEFORE UPDATE ON public.hadith_entries
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS trg_hadith_translations_updated_at ON public.hadith_translations;
CREATE TRIGGER trg_hadith_translations_updated_at
BEFORE UPDATE ON public.hadith_translations
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();