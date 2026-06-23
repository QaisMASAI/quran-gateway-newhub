
UPDATE public.translation_sources
SET code='arabic-original', name_he='ערבית מקור (עות׳מאני)', name_en='Original Arabic (Uthmani)', author='Quran.com', license='public', source_url='https://quran.com'
WHERE code='muyassar';

UPDATE public.translation_sources
SET code='saheeh-international', name_he='סאחיה אינטרנשיונל', name_en='Saheeh International', author='Saheeh International', license='non-commercial', source_url='https://quran.com'
WHERE code='clear-quran';
