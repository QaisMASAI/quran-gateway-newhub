DO $$
DECLARE
  v_jalalayn_id uuid;
BEGIN
  SELECT id INTO v_jalalayn_id
  FROM public.tafsir_sources
  WHERE slug = 'al_jalalayn'
  LIMIT 1;

  IF v_jalalayn_id IS NULL THEN
    RAISE EXCEPTION 'Missing Tafsir source slug al_jalalayn';
  END IF;

  DELETE FROM public.tafsir_hebrew th
  WHERE EXISTS (
    SELECT 1
    FROM public.tafsir_passages tp
    WHERE tp.id = th.original_tafsir_id
      AND tp.source_id <> v_jalalayn_id
  );

  DELETE FROM public.topic_lessons
  WHERE source_id <> v_jalalayn_id;

  DELETE FROM public.asbab_nuzul
  WHERE source_id <> v_jalalayn_id;

  DELETE FROM public.tafsir_passages
  WHERE source_id <> v_jalalayn_id;

  DELETE FROM public.grounded_chunks gc
  WHERE gc.content_type = 'tafsir'
    AND NOT (
      gc.source_table = 'tafsir_passages'
      AND gc.source_row_id IN (
        SELECT tp.id
        FROM public.tafsir_passages tp
        WHERE tp.source_id = v_jalalayn_id
      )
    )
    AND NOT (
      gc.source_table = 'tafsir_hebrew'
      AND gc.source_row_id IN (
        SELECT th.id
        FROM public.tafsir_hebrew th
        JOIN public.tafsir_passages tp ON tp.id = th.original_tafsir_id
        WHERE tp.source_id = v_jalalayn_id
      )
    );
END $$;