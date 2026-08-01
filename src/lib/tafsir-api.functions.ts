import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  fetchAsbabForVerseFromApi,
  fetchJalalaynForVerse,
  fetchTafsirBySourceKey,
  generateTafsirAiAnalysis,
} from "@/lib/tafsir-api.server";
import { getTafsirMetaByKey, type TafsirSourceKey } from "@/lib/tafsir-sources";

const TafsirInput = z.object({
  surah: z.number().int().min(1).max(114),
  ayah: z.number().int().min(1).max(286),
  lang: z.enum(["he", "ar", "en"]),
});

const SingleSourceInput = z.object({
  surah: z.number().int().min(1).max(114),
  ayah: z.number().int().min(1).max(286),
  sourceKey: z.string(),
  lang: z.enum(["he", "ar", "en"]),
});

const MultiSourceInput = z.object({
  surah: z.number().int().min(1).max(114),
  ayah: z.number().int().min(1).max(286),
  sourceKeys: z.array(z.string()),
  lang: z.enum(["he", "ar", "en"]),
});

const AiAnalysisInput = z.object({
  surah: z.number().int().min(1).max(114),
  ayah: z.number().int().min(1).max(286),
  arabicText: z.string().optional(),
  translationText: z.string().optional(),
  mode: z.enum([
    "summary",
    "difficult_arabic",
    "compare_scholars",
    "highlight_differences",
    "grammar",
  ]),
  sourcesToCompare: z.array(z.string()).optional(),
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

export const fetchTafsirBySourceFn = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => SingleSourceInput.parse(input))
  .handler(async ({ data }) => {
    const res = await fetchTafsirBySourceKey({
      surah: data.surah,
      ayah: data.ayah,
      sourceKey: data.sourceKey as TafsirSourceKey,
      lang: data.lang,
    });
    return res;
  });

export const fetchTafsirMultiSourceFn = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => MultiSourceInput.parse(input))
  .handler(async ({ data }) => {
    const promises = data.sourceKeys.map(async (key) => {
      const meta = getTafsirMetaByKey(key);
      const res = await fetchTafsirBySourceKey({
        surah: data.surah,
        ayah: data.ayah,
        sourceKey: key as TafsirSourceKey,
        lang: data.lang,
      });
      return {
        key,
        meta: meta || null,
        data: res,
      };
    });

    const results = await Promise.all(promises);
    return results;
  });

export const generateTafsirAiAnalysisFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AiAnalysisInput.parse(input))
  .handler(async ({ data }) => {
    const res = await generateTafsirAiAnalysis({
      surah: data.surah,
      ayah: data.ayah,
      arabicText: data.arabicText,
      translationText: data.translationText,
      mode: data.mode,
      sourcesToCompare: data.sourcesToCompare as TafsirSourceKey[] | undefined,
      lang: data.lang,
    });
    return res;
  });
