CREATE TABLE public.quran_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_number smallint NOT NULL UNIQUE CHECK (chapter_number BETWEEN 1 AND 114),
  name_ar text NOT NULL,
  name_simple_en text NOT NULL,
  name_translated_en text,
  name_he text,
  revelation_place text,
  verses_count integer NOT NULL CHECK (verses_count > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.quran_chapters TO anon;
GRANT SELECT ON public.quran_chapters TO authenticated;
GRANT ALL ON public.quran_chapters TO service_role;

ALTER TABLE public.quran_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quran_chapters_public_read"
ON public.quran_chapters
FOR SELECT
TO public
USING (true);

CREATE TRIGGER quran_chapters_set_updated_at
BEFORE UPDATE ON public.quran_chapters
FOR EACH ROW
EXECUTE FUNCTION public.tg_set_updated_at();