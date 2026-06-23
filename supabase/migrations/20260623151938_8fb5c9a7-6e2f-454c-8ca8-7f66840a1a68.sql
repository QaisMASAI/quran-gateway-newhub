ALTER TABLE public.grounded_chunks ADD COLUMN IF NOT EXISTS source_key text;
UPDATE public.grounded_chunks
SET source_key = coalesce(source_key, content_type || ':' || language || ':' || coalesce(source_table,'') || ':' || coalesce(source_row_id::text,'') || ':' || coalesce(surah::text,'') || ':' || coalesce(ayah_start::text,'') || ':' || coalesce(ayah_end::text,''));
ALTER TABLE public.grounded_chunks ALTER COLUMN source_key SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS grounded_chunks_source_key_uidx ON public.grounded_chunks (source_key);