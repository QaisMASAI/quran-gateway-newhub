
-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles are insertable by owner" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles are updatable by owner" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- generic updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- TRANSLATION ABSTRACTION
-- =========================
CREATE TABLE public.translation_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name_he TEXT NOT NULL,
  name_en TEXT,
  language TEXT NOT NULL DEFAULT 'he',
  author TEXT,
  license TEXT,
  source_url TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.translation_sources TO anon, authenticated;
GRANT ALL ON public.translation_sources TO service_role;
ALTER TABLE public.translation_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Translation sources are public" ON public.translation_sources FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.ayah_translations (
  id BIGSERIAL PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.translation_sources(id) ON DELETE CASCADE,
  surah SMALLINT NOT NULL CHECK (surah BETWEEN 1 AND 114),
  ayah  SMALLINT NOT NULL CHECK (ayah >= 1),
  text TEXT NOT NULL,
  UNIQUE (source_id, surah, ayah)
);
CREATE INDEX ayah_translations_surah_idx ON public.ayah_translations (source_id, surah);
GRANT SELECT ON public.ayah_translations TO anon, authenticated;
GRANT ALL ON public.ayah_translations TO service_role;
ALTER TABLE public.ayah_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Translations are public" ON public.ayah_translations FOR SELECT TO anon, authenticated USING (true);

-- Seed default translation source (Aharon Ben-Shemesh, Phase 1)
INSERT INTO public.translation_sources (code, name_he, name_en, language, author, license, is_default)
VALUES ('ben-shemesh', 'תרגום אהרון בן-שמש', 'Aharon Ben-Shemesh', 'he', 'אהרון בן-שמש', 'historical / pending verification', true);

-- =========================
-- BOOKMARKS
-- =========================
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah SMALLINT NOT NULL,
  ayah  SMALLINT NOT NULL,
  surah_name TEXT,
  arabic_snapshot TEXT,
  hebrew_snapshot TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, surah, ayah)
);
CREATE INDEX bookmarks_user_idx ON public.bookmarks (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bookmarks owner select" ON public.bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Bookmarks owner insert" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Bookmarks owner update" ON public.bookmarks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Bookmarks owner delete" ON public.bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================
-- NOTES
-- =========================
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah SMALLINT NOT NULL,
  ayah  SMALLINT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notes_user_idx ON public.notes (user_id, surah, ayah);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notes owner select" ON public.notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Notes owner insert" ON public.notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Notes owner update" ON public.notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Notes owner delete" ON public.notes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER set_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- READING PROGRESS
-- =========================
CREATE TABLE public.reading_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  surah SMALLINT NOT NULL,
  ayah  SMALLINT NOT NULL DEFAULT 1,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_progress TO authenticated;
GRANT ALL ON public.reading_progress TO service_role;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Progress owner select" ON public.reading_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Progress owner upsert" ON public.reading_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Progress owner update" ON public.reading_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
