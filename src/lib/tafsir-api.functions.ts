import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchAsbabForVerseFromApi, fetchJalalaynForVerse } from "@/lib/tafsir-api.server";

const TafsirInput = z.object({
  surah: z.number().int().min(1).max(114),
  ayah: z.number().int().min(1).max(286),
  lang: z.enum(["he", "ar", "en"]),
});

export const fetchTafsirFromApi = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => TafsirInput.parse(input))
  .handler(async ({ data }) => {
    const row = await fetchJalalaynForVerse({
      surah: data.surah,
      ayah: data.ayah,
      lang: data.lang,
    });
    if (!row) return [];
    return [
      {
        id: `api-tafsir-${data.surah}-${data.ayah}-${data.lang}`,
        source_id: row.source.id,
        surah: data.surah,
        ayah_start: data.ayah,
        ayah_end: data.ayah,
        lang: row.lang,
        body: row.body,
        citation: `${data.surah}:${data.ayah}`,
        source: {
          id: row.source.id,
          slug: row.source.slug,
          name_he: row.source.name_he,
          name_ar: row.source.name_ar,
          name_en: row.source.name_en,
          author: row.source.author,
        },
      },
    ];
  });

export const fetchAsbabFromApi = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => TafsirInput.parse(input))
  .handler(async ({ data }) => {
    const row = await fetchAsbabForVerseFromApi({
      surah: data.surah,
      ayah: data.ayah,
      lang: data.lang,
    });
    if (!row) return [];
    return [
      {
        id: `api-asbab-${data.surah}-${data.ayah}-${data.lang}`,
        source_id: row.source.id,
        surah: data.surah,
        ayah_start: data.ayah,
        ayah_end: data.ayah,
        lang: row.lang,
        body: row.body,
        citation: `${data.surah}:${data.ayah}`,
        source: {
          id: row.source.id,
          slug: row.source.slug,
          name_he: row.source.name_he,
          name_ar: row.source.name_ar,
          name_en: row.source.name_en,
          author: row.source.author,
        },
      },
    ];
  });
