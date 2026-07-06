/**
 * Centralized API service for Quran data.
 * Consolidates all fetch logic in one place.
 */

import { supabase } from "@/integrations/supabase/client";

export type ApiLang = "he" | "ar" | "en";

const TRANSLATION_SOURCE_CODE: Record<ApiLang, string> = {
  he: "ben-shemesh",
  ar: "arabic-original",
  en: "saheeh-international",
};

const sourceIdCache = new Map<string, string>();

/**
 * Resolve translation source ID with caching
 */
export async function resolveSourceId(code: string): Promise<string | null> {
  const cached = sourceIdCache.get(code);
  if (cached) return cached;

  const { data, error } = await supabase
    .from("translation_sources")
    .select("id")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) return null;
  sourceIdCache.set(code, data.id);
  return data.id;
}

/**
 * Get source ID for a language
 */
export async function getSourceIdForLang(lang: ApiLang): Promise<string | null> {
  return resolveSourceId(TRANSLATION_SOURCE_CODE[lang]);
}

/**
 * Fetch Quran chapters with translations
 */
export async function fetchChaptersFromDb(lang: ApiLang = "he"): Promise<
  Array<{
    id: number;
    name_arabic: string;
    name_simple: string;
    translated_name: { name: string };
    verses_count: number;
    revelation_place: string;
  }>
> {
  const { data: dbRows } = await supabase
    .from("quran_chapters" as never)
    .select(
      "chapter_number,name_ar,name_simple_en,name_translated_en,name_he,revelation_place,verses_count",
    )
    .order("chapter_number", { ascending: true });

  if (!dbRows || !Array.isArray(dbRows)) return [];

  return (dbRows as any[]).map((r) => ({
    id: r.chapter_number,
    name_arabic: r.name_ar,
    name_simple: r.name_simple_en,
    translated_name: {
      name:
        lang === "he"
          ? (r.name_he ?? r.name_simple_en)
          : lang === "ar"
            ? r.name_ar
            : r.name_simple_en,
    },
    verses_count: r.verses_count,
    revelation_place: r.revelation_place ?? "makkah",
  }));
}

/**
 * Fetch bilingual verse (Arabic + locale translation)
 */
export async function fetchVerseBilingualFromDb(
  surah: number,
  ayah: number,
  lang: ApiLang,
): Promise<{ arabic: string; translation: string } | null> {
  const [arSid, locSid] = await Promise.all([getSourceIdForLang("ar"), getSourceIdForLang(lang)]);

  if (!arSid) return null;
  if (lang !== "ar" && !locSid) return null;

  const { data, error } = await supabase
    .from("ayah_translations")
    .select("source_id, text")
    .in("source_id", Array.from(new Set([arSid, locSid].filter(Boolean) as string[])))
    .eq("surah", surah)
    .eq("ayah", ayah);

  if (error || !data || data.length === 0) return null;

  const arRow = (data as any[]).find((r) => r.source_id === arSid);
  const locRow = (data as any[]).find((r) => r.source_id === locSid);

  const arabic = arRow?.text ?? "";

  const translation = lang === "ar" ? arabic : (locRow?.text ?? arabic);

  if (!arabic && !translation) return null;

  return { arabic, translation };
}

/**
 * Fetch entire surah bilingual
 */
export async function fetchSurahBilingualFromDb(
  surah: number,
  lang: ApiLang,
): Promise<
  Array<{
    surah: number;
    ayah: number;
    arabic: string;
    translation: string;
  }>
> {
  const [arSid, locSid] = await Promise.all([getSourceIdForLang("ar"), getSourceIdForLang(lang)]);

  if (!arSid) return [];
  if (lang !== "ar" && !locSid) return [];

  const sourceIds = Array.from(new Set([arSid, locSid].filter(Boolean) as string[]));
  const { data, error } = await supabase
    .from("ayah_translations")
    .select("source_id,surah,ayah,text")
    .eq("surah", surah)
    .in("source_id", sourceIds)
    .order("ayah", { ascending: true });

  if (error || !data) return [];

  const byAyah = new Map<
    number,
    {
      surah: number;
      ayah: number;
      arabic: string;
      translation: string;
    }
  >();

  for (const row of data as any[]) {
    const current = byAyah.get(row.ayah) ?? {
      surah: row.surah,
      ayah: row.ayah,
      arabic: "",
      translation: "",
    };
    if (row.source_id === arSid) current.arabic = row.text;
    if (row.source_id === locSid) current.translation = row.text;
    byAyah.set(row.ayah, current);
  }

  return Array.from(byAyah.values())
    .sort((a, b) => a.ayah - b.ayah)
    .map((v) => ({
      ...v,
      translation: lang === "ar" ? v.arabic : v.translation,
    }));
}
