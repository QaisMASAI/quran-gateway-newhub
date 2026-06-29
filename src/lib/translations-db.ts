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

function cleanHtml(input: string): string {
  return input.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchQuranComVerse(
  surah: number,
  ayah: number,
  locale: LocaleCode,
): Promise<{ arabic: string; translation: string } | null> {
  try {
    const [arRes, trRes] = await Promise.all([
      fetch(`https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?words=false&translations=`),
      fetch(
        `https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?words=false&translations=${
          locale === "he" ? 233 : locale === "en" ? 20 : 0
        }`,
      ),
    ]);
    if (!arRes.ok || !trRes.ok) return null;
    const arJson = (await arRes.json()) as {
      verse?: { text_uthmani?: string };
    };
    const trJson = (await trRes.json()) as {
      verse?: { text_uthmani?: string; translations?: Array<{ text: string }> };
    };
    const arabic = arJson.verse?.text_uthmani ?? trJson.verse?.text_uthmani ?? "";
    const translation =
      locale === "ar"
        ? arabic
        : cleanHtml(trJson.verse?.translations?.[0]?.text ?? "") || arabic;
    if (!arabic && !translation) return null;
    return { arabic, translation };
  } catch {
    return null;
  }
}

async function fetchAltVerse(
  surah: number,
  ayah: number,
  locale: LocaleCode,
): Promise<{ arabic: string; translation: string } | null> {
  try {
    const translationEdition = locale === "en" ? "en.asad" : locale === "ar" ? "ar.uthmani" : "en.asad";
    const [arRes, trRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ar.uthmani`),
      fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${translationEdition}`),
    ]);
    if (!arRes.ok || !trRes.ok) return null;
    const arJson = (await arRes.json()) as { data?: { text?: string } };
    const trJson = (await trRes.json()) as { data?: { text?: string } };
    const arabic = arJson.data?.text ?? "";
    const translation = locale === "ar" ? arabic : cleanHtml(trJson.data?.text ?? "") || arabic;
    if (!arabic && !translation) return null;
    return { arabic, translation };
  } catch {
    return null;
  }
}

async function fetchQuranComSurah(
  surah: number,
  locale: LocaleCode,
): Promise<SurahBilingualVerse[]> {
  try {
    const trId = locale === "he" ? 233 : locale === "en" ? 20 : 0;
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${surah}?per_page=300&words=false${
        trId ? `&translations=${trId}` : ""
      }`,
    );
    if (!res.ok) return [];
    const json = (await res.json()) as {
      verses?: Array<{
        verse_key: string;
        text_uthmani: string;
        translations?: Array<{ text: string }>;
      }>;
    };
    return (json.verses ?? []).map((v) => {
      const [, ayahStr] = v.verse_key.split(":");
      const ayah = Number(ayahStr);
      return {
        surah,
        ayah,
        arabic: v.text_uthmani ?? "",
        translation:
          locale === "ar"
            ? v.text_uthmani ?? ""
            : cleanHtml(v.translations?.[0]?.text ?? "") || v.text_uthmani || "",
      };
    });
  } catch {
    return [];
  }
}

async function fetchAltSurah(surah: number, locale: LocaleCode): Promise<SurahBilingualVerse[]> {
  try {
    const translationEdition = locale === "en" ? "en.asad" : locale === "ar" ? "ar.uthmani" : "en.asad";
    const [arRes, trRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${surah}/ar.uthmani`),
      fetch(`https://api.alquran.cloud/v1/surah/${surah}/${translationEdition}`),
    ]);
    if (!arRes.ok || !trRes.ok) return [];
    const arJson = (await arRes.json()) as {
      data?: { ayahs?: Array<{ numberInSurah: number; text: string }> };
    };
    const trJson = (await trRes.json()) as {
      data?: { ayahs?: Array<{ numberInSurah: number; text: string }> };
    };
    const trByAyah = new Map(
      (trJson.data?.ayahs ?? []).map((a) => [a.numberInSurah, cleanHtml(a.text ?? "")]),
    );
    return (arJson.data?.ayahs ?? []).map((a) => ({
      surah,
      ayah: a.numberInSurah,
      arabic: a.text ?? "",
      translation: locale === "ar" ? a.text ?? "" : trByAyah.get(a.numberInSurah) ?? a.text ?? "",
    }));
  } catch {
    return [];
  }
}

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

async function fetchVerseFromEmbeddings(
  surah: number,
  ayah: number,
  locale: LocaleCode,
): Promise<{ arabic: string; translation: string } | null> {
  const { data, error } = await supabase
    .from("verse_embeddings")
    .select("arabic, hebrew")
    .eq("surah", surah)
    .eq("ayah", ayah)
    .maybeSingle();
  if (error || !data) return null;
  const arabic = data.arabic ?? "";
  const translation = locale === "ar" ? arabic : data.hebrew ?? arabic;
  if (!arabic && !translation) return null;
  return { arabic, translation };
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
  if (!arSid || (locale !== "ar" && !locSid)) {
    if (locale === "ar") {
      return (
        (await fetchVerseFromEmbeddings(surah, ayah, locale)) ??
        (await fetchQuranComVerse(surah, ayah, locale)) ??
        (await fetchAltVerse(surah, ayah, locale))
      );
    }
    return (
      (await fetchVerseFromEmbeddings(surah, ayah, locale)) ??
      (await fetchQuranComVerse(surah, ayah, locale)) ??
      (await fetchAltVerse(surah, ayah, locale))
    );
  }
  const { data, error } = await supabase
    .from("ayah_translations")
    .select("source_id, text")
    .in("source_id", Array.from(new Set([arSid, locSid])))
    .eq("surah", surah)
    .eq("ayah", ayah);
  if (error || !data || data.length === 0) {
    return (
      (await fetchVerseFromEmbeddings(surah, ayah, locale)) ??
      (await fetchQuranComVerse(surah, ayah, locale)) ??
      (await fetchAltVerse(surah, ayah, locale))
    );
  }
  const arRow = data.find((r) => r.source_id === arSid);
  const locRow = data.find((r) => r.source_id === locSid);
  const localArabic = arRow?.text ?? "";
  const localTranslation = locale === "ar" ? arRow?.text ?? "" : locRow?.text ?? "";

  if (localArabic && (locale === "ar" || !!localTranslation)) {
    return {
      arabic: localArabic,
      translation: localTranslation,
    };
  }

  const remote =
    (await fetchVerseFromEmbeddings(surah, ayah, locale)) ??
    (await fetchQuranComVerse(surah, ayah, locale)) ??
    (await fetchAltVerse(surah, ayah, locale));
  return {
    arabic: localArabic || remote?.arabic || "",
    translation: localTranslation || remote?.translation || localArabic || "",
  };
}

/** Fetch all translations for an entire surah in a given locale. */
export async function fetchSurahTranslation(
  surah: number,
  locale: LocaleCode,
): Promise<AyahTranslation[]> {
  const sourceId = await resolveSourceId(TRANSLATION_SOURCE_CODE[locale]);
  if (!sourceId) {
    const remote = await fetchQuranComSurah(surah, locale);
    if (remote.length === 0) {
      const alt = await fetchAltSurah(surah, locale);
      return alt.map((v) => ({ surah: v.surah, ayah: v.ayah, text: v.translation }));
    }
    return remote.map((v) => ({ surah: v.surah, ayah: v.ayah, text: v.translation }));
  }
  const { data, error } = await supabase
    .from("ayah_translations")
    .select("surah, ayah, text")
    .eq("source_id", sourceId)
    .eq("surah", surah)
    .order("ayah", { ascending: true });
  if (error || !data || data.length === 0) {
    const remote = await fetchQuranComSurah(surah, locale);
    if (remote.length === 0) {
      const alt = await fetchAltSurah(surah, locale);
      return alt.map((v) => ({ surah: v.surah, ayah: v.ayah, text: v.translation }));
    }
    return remote.map((v) => ({ surah: v.surah, ayah: v.ayah, text: v.translation }));
  }
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
  if (locale !== "ar" && !locSid) {
    const remote = await fetchQuranComSurah(surah, locale);
    if (remote.length > 0) return remote;
    return fetchAltSurah(surah, locale);
  }
  if (!arSid) {
    const remote = await fetchQuranComSurah(surah, locale);
    if (remote.length > 0) return remote;
    return fetchAltSurah(surah, locale);
  }
  const sourceIds = Array.from(new Set([arSid, locSid].filter(Boolean) as string[]));
  const { data, error } = await supabase
    .from("ayah_translations")
    .select("source_id,surah,ayah,text")
    .eq("surah", surah)
    .in("source_id", sourceIds)
    .order("ayah", { ascending: true });
  if (error || !data || data.length === 0) {
    const remote = await fetchQuranComSurah(surah, locale);
    if (remote.length > 0) return remote;
    return fetchAltSurah(surah, locale);
  }

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

  const localRows = Array.from(byAyah.values())
    .sort((a, b) => a.ayah - b.ayah)
    .map((v) => ({
      ...v,
      translation: locale === "ar" ? v.arabic : v.translation,
    }));

  if (locale === "ar") return localRows;

  const missingTranslations = localRows.some((v) => !v.translation || v.translation === v.arabic);
  if (!missingTranslations) return localRows;

  const remote = await fetchQuranComSurah(surah, locale);
  if (remote.length === 0) {
    const alt = await fetchAltSurah(surah, locale);
    if (alt.length === 0) return localRows;
    const byAyahRemote = new Map(alt.map((v) => [v.ayah, v]));
    return localRows.map((v) => {
      const r = byAyahRemote.get(v.ayah);
      if (!r) return v;
      return {
        ...v,
        translation:
          !v.translation || v.translation === v.arabic
            ? r.translation || v.translation || v.arabic
            : v.translation,
      };
    });
  }

  const byAyahRemote = new Map(remote.map((v) => [v.ayah, v]));
  return localRows.map((v) => {
    const r = byAyahRemote.get(v.ayah);
    if (!r) return v;
    return {
      ...v,
      translation:
        !v.translation || v.translation === v.arabic
          ? r.translation || v.translation || v.arabic
          : v.translation,
    };
  });
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
  if (locale !== "ar" && !locSid) {
    const remote = await fetchQuranComSurah(surah, locale);
    if (remote.length === 0) {
      const alt = await fetchAltSurah(surah, locale);
      return alt.filter((v) => v.ayah >= ayahStart && v.ayah <= ayahEnd);
    }
    return remote.filter((v) => v.ayah >= ayahStart && v.ayah <= ayahEnd);
  }
  if (!arSid) {
    const remote = await fetchQuranComSurah(surah, locale);
    if (remote.length === 0) {
      const alt = await fetchAltSurah(surah, locale);
      return alt.filter((v) => v.ayah >= ayahStart && v.ayah <= ayahEnd);
    }
    return remote.filter((v) => v.ayah >= ayahStart && v.ayah <= ayahEnd);
  }
  const ids = Array.from(new Set([arSid, locSid].filter(Boolean) as string[]));
  const { data, error } = await supabase
    .from("ayah_translations")
    .select("source_id, surah, ayah, text")
    .in("source_id", ids)
    .eq("surah", surah)
    .gte("ayah", ayahStart)
    .lte("ayah", ayahEnd)
    .order("ayah", { ascending: true });
  if (error || !data || data.length === 0) {
    const remote = await fetchQuranComSurah(surah, locale);
    if (remote.length === 0) {
      const alt = await fetchAltSurah(surah, locale);
      return alt.filter((v) => v.ayah >= ayahStart && v.ayah <= ayahEnd);
    }
    return remote.filter((v) => v.ayah >= ayahStart && v.ayah <= ayahEnd);
  }
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
  const localRows = Array.from(byAyah.values()).sort((a, b) => a.ayah - b.ayah);
  if (locale === "ar") return localRows;

  const missingTranslations = localRows.some((v) => !v.translation);
  if (!missingTranslations) return localRows;

  const remote = await fetchQuranComSurah(surah, locale);
  if (remote.length === 0) {
    const alt = await fetchAltSurah(surah, locale);
    if (alt.length === 0) return localRows;
    const altByAyah = new Map(alt.map((v) => [v.ayah, v.translation]));
    return localRows.map((v) => ({
      ...v,
      translation: v.translation || altByAyah.get(v.ayah) || v.arabic,
    }));
  }

  const remoteByAyah = new Map(remote.map((v) => [v.ayah, v.translation]));
  return localRows.map((v) => ({
    ...v,
    translation: v.translation || remoteByAyah.get(v.ayah) || v.arabic,
  }));
}
