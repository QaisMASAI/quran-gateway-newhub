
INSERT INTO public.translation_sources (code, name_he, name_en, language, author, license, source_url, is_default)
VALUES
  ('muyassar',    'תפסיר אל-מויסר',         'Tafsir al-Muyassar',                 'ar', 'King Fahd Complex',          'public',  'https://quran.com', true),
  ('clear-quran', 'הקוראן הצלול',           'The Clear Quran',                    'en', 'Dr. Mustafa Khattab',        'CC-BY-ND','https://www.clearquran.com', true)
ON CONFLICT (code) DO NOTHING;
