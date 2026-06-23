import { supabase } from "@/integrations/supabase/client";

export type LocaleCode = "he" | "ar" | "en";

// Maps UI locale → translation_sources.code stored in DB.
export const TRANSLATION_SOURCE_CODE: Record<LocaleCode, string> = {
  he: "ben-shemesh",
  ar: "arabic-original",
  en: "saheeh-international",
};

export interface AyahTranslation {
  surah: number;
  ayah: number;
  text: string;
}

export interface SurahBilingualVerse {
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
}

// Cache resolved source ids per session.
const sourceIdCache = new Map<string, string>();

async function resolveSourceId(code: string): Promise<string | null> {
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

/** Fetch a single verse translation for a given locale from our DB. */
export async function fetchVerseTranslation(
  surah: number,
  ayah: number,
  locale: LocaleCode,
): Promise<AyahTranslation | null> {
  const sourceId = await resolveSourceId(TRANSLATION_SOURCE_CODE[locale]);
  if (!sourceId) return null;
  const { data, error } = await supabase
    .from("ayah_translations")
    .select("surah, ayah, text")
    .eq("source_id", sourceId)
    .eq("surah", surah)
    .eq("ayah", ayah)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

/** Fetch a single verse's Arabic + locale translation in one call. */
export async function fetchVerseBilingual(
  surah: number,
  ayah: number,
  locale: LocaleCode,
): Promise<{ arabic: string; translation: string } | null> {
  const [arSid, locSid] = await Promise.all([
    resolveSourceId(TRANSLATION_SOURCE_CODE.ar),
    resolveSourceId(TRANSLATION_SOURCE_CODE[locale]),
  ]);
  if (!arSid || !locSid) return null;
  const { data, error } = await supabase
    .from("ayah_translations")
    .select("source_id, text")
    .in("source_id", Array.from(new Set([arSid, locSid])))
    .eq("surah", surah)
    .eq("ayah", ayah);
  if (error || !data) return null;
  const arRow = data.find((r) => r.source_id === arSid);
  const locRow = data.find((r) => r.source_id === locSid);
  return {
    arabic: arRow?.text ?? "",
    translation: locRow?.text ?? arRow?.text ?? "",
  };
}

/** Fetch all translations for an entire surah in a given locale. */
export async function fetchSurahTranslation(
  surah: number,
  locale: LocaleCode,
): Promise<AyahTranslation[]> {
  const sourceId = await resolveSourceId(TRANSLATION_SOURCE_CODE[locale]);
  if (!sourceId) return [];
  const { data, error } = await supabase
    .from("ayah_translations")
    .select("surah, ayah, text")
    .eq("source_id", sourceId)
    .eq("surah", surah)
    .order("ayah", { ascending: true });
  if (error || !data) return [];
  return data;
}

/** Fetch an entire surah with Arabic + selected locale translation from DB. */
export async function fetchSurahBilingual(
  surah: number,
  locale: LocaleCode,
): Promise<SurahBilingualVerse[]> {
  const [arSid, locSid] = await Promise.all([
    resolveSourceId(TRANSLATION_SOURCE_CODE.ar),
    resolveSourceId(TRANSLATION_SOURCE_CODE[locale]),
  ]);
  if (!arSid) return [];
  const sourceIds = Array.from(new Set([arSid, locSid].filter(Boolean) as string[]));
  const { data, error } = await supabase
    .from("ayah_translations")
    .select("source_id,surah,ayah,text")
    .eq("surah", surah)
    .in("source_id", sourceIds)
    .order("ayah", { ascending: true });
  if (error || !data) return [];

  const byAyah = new Map<number, SurahBilingualVerse>();
  for (const row of data) {
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
      translation: v.translation || v.arabic,
    }));
}

export interface PassageVerse {
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
}

/** Fetch a passage (range of verses) with both Arabic and locale translation. */
export async function fetchPassage(
  surah: number,
  ayahStart: number,
  ayahEnd: number,
  locale: LocaleCode,
): Promise<PassageVerse[]> {
  const [arSid, locSid] = await Promise.all([
    resolveSourceId(TRANSLATION_SOURCE_CODE.ar),
    resolveSourceId(TRANSLATION_SOURCE_CODE[locale]),
  ]);
  if (!arSid) return [];
  const ids = Array.from(new Set([arSid, locSid].filter(Boolean) as string[]));
  const { data, error } = await supabase
    .from("ayah_translations")
    .select("source_id, surah, ayah, text")
    .in("source_id", ids)
    .eq("surah", surah)
    .gte("ayah", ayahStart)
    .lte("ayah", ayahEnd)
    .order("ayah", { ascending: true });
  if (error || !data) return [];
  const byAyah = new Map<number, PassageVerse>();
  for (const row of data) {
    const v = byAyah.get(row.ayah) ?? {
      surah: row.surah,
      ayah: row.ayah,
      arabic: "",
      translation: "",
    };
    if (row.source_id === arSid) v.arabic = row.text;
    if (row.source_id === locSid) v.translation = row.text;
    byAyah.set(row.ayah, v);
  }
  return Array.from(byAyah.values()).sort((a, b) => a.ayah - b.ayah);
}
