
DROP VIEW IF EXISTS public.hadith_narrators;
CREATE VIEW public.hadith_narrators
  WITH (security_invoker = true) AS
  SELECT trim(narrator) AS narrator,
         count(*)::int  AS hadith_count,
         array_agg(DISTINCT collection_slug) AS collections
  FROM public.hadith_entries
  WHERE narrator IS NOT NULL AND length(trim(narrator)) > 0
  GROUP BY trim(narrator);
GRANT SELECT ON public.hadith_narrators TO anon, authenticated;

UPDATE public.hadith_collections c SET total_hadith = s.cnt, total_books = s.bk
FROM (SELECT collection_slug, count(*) cnt, count(DISTINCT book_id) bk
      FROM public.hadith_entries GROUP BY collection_slug) s
WHERE c.slug = s.collection_slug;
