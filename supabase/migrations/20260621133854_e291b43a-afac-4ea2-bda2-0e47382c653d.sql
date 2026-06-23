
CREATE TABLE public.tafsir_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_he text NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  author text,
  era text,
  license text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tafsir_sources TO anon, authenticated;
GRANT ALL ON public.tafsir_sources TO service_role;
ALTER TABLE public.tafsir_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tafsir_sources are public" ON public.tafsir_sources FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.tafsir_passages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.tafsir_sources(id) ON DELETE CASCADE,
  surah smallint NOT NULL,
  ayah_start smallint NOT NULL,
  ayah_end smallint NOT NULL,
  lang text NOT NULL CHECK (lang IN ('he','ar','en')),
  body text NOT NULL,
  citation text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tafsir_passages_lookup_idx ON public.tafsir_passages (surah, ayah_start, ayah_end, lang);
CREATE INDEX tafsir_passages_source_idx ON public.tafsir_passages (source_id);
GRANT SELECT ON public.tafsir_passages TO anon, authenticated;
GRANT ALL ON public.tafsir_passages TO service_role;
ALTER TABLE public.tafsir_passages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tafsir_passages are public" ON public.tafsir_passages FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.asbab_nuzul (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.tafsir_sources(id) ON DELETE CASCADE,
  surah smallint NOT NULL,
  ayah_start smallint NOT NULL,
  ayah_end smallint NOT NULL,
  lang text NOT NULL CHECK (lang IN ('he','ar','en')),
  body text NOT NULL,
  citation text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX asbab_nuzul_lookup_idx ON public.asbab_nuzul (surah, ayah_start, ayah_end, lang);
GRANT SELECT ON public.asbab_nuzul TO anon, authenticated;
GRANT ALL ON public.asbab_nuzul TO service_role;
ALTER TABLE public.asbab_nuzul ENABLE ROW LEVEL SECURITY;
CREATE POLICY "asbab_nuzul are public" ON public.asbab_nuzul FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.topic_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES public.knowledge_entities(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.tafsir_sources(id) ON DELETE CASCADE,
  lang text NOT NULL CHECK (lang IN ('he','ar','en')),
  body text NOT NULL,
  citation text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX topic_lessons_entity_idx ON public.topic_lessons (entity_id, lang);
GRANT SELECT ON public.topic_lessons TO anon, authenticated;
GRANT ALL ON public.topic_lessons TO service_role;
ALTER TABLE public.topic_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topic_lessons are public" ON public.topic_lessons FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.knowledge_entity_verses
  ADD COLUMN IF NOT EXISTS tafsir_passage_id uuid REFERENCES public.tafsir_passages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS asbab_id uuid REFERENCES public.asbab_nuzul(id) ON DELETE SET NULL;

INSERT INTO public.tafsir_sources (slug, name_he, name_ar, name_en, author, era, license) VALUES
  ('ibn_kathir',  $$תפסיר אבן כת'יר$$, 'تفسير ابن كثير', 'Tafsir Ibn Kathir',  'Ibn Kathir',         '14th century', 'public-domain'),
  ('al_saadi',    $$תפסיר א-סעדי$$,    'تفسير السعدي',    'Tafsir Al-Saadi',    'Al-Saadi',           '20th century', 'public-domain'),
  ('al_muyassar', $$אל-תפסיר אל-מיסר$$,'التفسير الميسر',  'Tafsir Al-Muyassar', 'King Fahd Complex',  '21st century', 'public-domain'),
  ('al_tabari',   $$תפסיר א-טברי$$,    'تفسير الطبري',    'Tafsir Al-Tabari',   'Al-Tabari',          '10th century', 'public-domain'),
  ('al_qurtubi',  $$תפסיר אל-קורטובי$$,'تفسير القرطبي',   'Tafsir Al-Qurtubi',  'Al-Qurtubi',         '13th century', 'public-domain')
ON CONFLICT (slug) DO NOTHING;
