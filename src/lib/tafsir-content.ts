// Reads stored-in-DB Tafsir / Asbab / Lesson rows seeded via migrations.
// These rows are AUTHENTIC source excerpts — never AI-generated.
// When no row exists for a given (surah/ayah/lang) the UI shows the
// "no authenticated source was found" empty state.

import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/lib/i18n";

export interface TafsirSourceRow {
  id: string;
  slug: string;
  name_he: string;
  name_ar: string;
  name_en: string;
  author: string | null;
}

export interface TafsirPassageRow {
  id: string;
  source_id: string;
  surah: number;
  ayah_start: number;
  ayah_end: number;
  lang: string;
  body: string;
  citation: string | null;
  source?: TafsirSourceRow | null;
}

export interface AsbabRow extends TafsirPassageRow {}

export interface TopicLessonRow {
  id: string;
  entity_id: string;
  source_id: string;
  lang: string;
  body: string;
  citation: string | null;
  source?: TafsirSourceRow | null;
}

export const TAFSIR_SOURCE_SLUG_BY_KEY: Record<string, string> = {
  jalalayn: "al_jalalayn",
};

const JALALAYN_SLUG = "al_jalalayn";

export function sourceName(s: TafsirSourceRow | null | undefined, locale: Locale): string {
  if (!s) return "";
  if (locale === "ar") return s.name_ar;
  if (locale === "en") return s.name_en;
  return s.name_he;
}

export async function getTafsirForVerse(
  surah: number,
  ayah: number,
  lang: Locale,
): Promise<TafsirPassageRow[]> {
  const base = () =>
    supabase
      .from("tafsir_passages")
      .select("*, source:tafsir_sources!inner(*)")
      .eq("surah", surah)
      .lte("ayah_start", ayah)
      .gte("ayah_end", ayah)
      .eq("source.slug", JALALAYN_SLUG)
      .order("created_at", { ascending: false });

  const fallbackOrder: Locale[] = [lang, "he", "ar", "en"].filter(
    (v, i, arr): v is Locale => arr.indexOf(v) === i,
  );

  for (const candidate of fallbackOrder) {
    const { data } = await base().eq("lang", candidate);
    const rows = (data as TafsirPassageRow[] | null) ?? [];
    if (rows.length > 0) return rows;
  }

  return [];
}

export async function getTafsirForVerseBySource(
  surah: number,
  ayah: number,
  lang: Locale,
  sourceSlug?: string,
): Promise<TafsirPassageRow[]> {
  const effectiveSlug = sourceSlug === JALALAYN_SLUG ? sourceSlug : JALALAYN_SLUG;

  const base = () => {
    const q = supabase
      .from("tafsir_passages")
      .select("*, source:tafsir_sources!inner(*)")
      .eq("surah", surah)
      .lte("ayah_start", ayah)
      .gte("ayah_end", ayah)
      .eq("source.slug", effectiveSlug)
      .order("created_at", { ascending: false });
    return q;
  };

  const fallbackOrder: Locale[] = [lang, "he", "ar", "en"].filter(
    (v, i, arr): v is Locale => arr.indexOf(v) === i,
  );

  for (const candidate of fallbackOrder) {
    const { data } = await base().eq("lang", candidate);
    const rows = (data as TafsirPassageRow[] | null) ?? [];
    if (rows.length > 0) return rows;
  }
  return [];
}

export async function getAsbabForVerse(
  surah: number,
  ayah: number,
  lang: Locale,
): Promise<AsbabRow[]> {
  const base = () =>
    supabase
      .from("asbab_nuzul")
      .select("*, source:tafsir_sources!inner(*)")
      .eq("surah", surah)
      .lte("ayah_start", ayah)
      .gte("ayah_end", ayah)
      .eq("source.slug", JALALAYN_SLUG)
      .order("created_at", { ascending: false });

  const fallbackOrder: Locale[] = [lang, "he", "ar", "en"].filter(
    (v, i, arr): v is Locale => arr.indexOf(v) === i,
  );

  for (const candidate of fallbackOrder) {
    const { data } = await base().eq("lang", candidate);
    const rows = (data as AsbabRow[] | null) ?? [];
    if (rows.length > 0) return rows;
  }

  // Fallback: when dedicated asbab rows are missing, extract passages from
  // authenticated tafsir entries for the same verse that explicitly mention
  // sabab al-nuzul markers.
  for (const candidate of fallbackOrder) {
    const { data } = await supabase
      .from("tafsir_passages")
      .select("id,source_id,surah,ayah_start,ayah_end,lang,body,citation,source:tafsir_sources!inner(*)")
      .eq("surah", surah)
      .lte("ayah_start", ayah)
      .gte("ayah_end", ayah)
      .eq("lang", candidate)
      .eq("source.slug", JALALAYN_SLUG)
      .or("body.ilike.%سبب النزول%,body.ilike.%نزلت%")
      .order("created_at", { ascending: false })
      .limit(4);

    const rows = (data as TafsirPassageRow[] | null) ?? [];
    if (rows.length > 0) {
      return rows.map((r) => ({ ...r }));
    }
  }

  return [];
}

export async function getLessonsForEntity(
  entityId: string,
  lang: Locale,
): Promise<TopicLessonRow[]> {
  const fallbackOrder: Locale[] = [lang, "he", "ar", "en"].filter(
    (v, i, arr): v is Locale => arr.indexOf(v) === i,
  );

  for (const candidate of fallbackOrder) {
    const { data } = await supabase
      .from("topic_lessons")
      .select("*, source:tafsir_sources!inner(*)")
      .eq("entity_id", entityId)
      .eq("lang", candidate)
      .eq("source.slug", JALALAYN_SLUG)
      .order("created_at", { ascending: false });
    const rows = (data as TopicLessonRow[] | null) ?? [];
    if (rows.length > 0) return rows;
  }

  return [];
}
