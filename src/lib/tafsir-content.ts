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
  const { data } = await supabase
    .from("tafsir_passages")
    .select("*, source:tafsir_sources(*)")
    .eq("surah", surah)
    .lte("ayah_start", ayah)
    .gte("ayah_end", ayah)
    .eq("lang", lang);
  return (data as TafsirPassageRow[] | null) ?? [];
}

export async function getAsbabForVerse(
  surah: number,
  ayah: number,
  lang: Locale,
): Promise<AsbabRow[]> {
  const { data } = await supabase
    .from("asbab_nuzul")
    .select("*, source:tafsir_sources(*)")
    .eq("surah", surah)
    .lte("ayah_start", ayah)
    .gte("ayah_end", ayah)
    .eq("lang", lang);
  return (data as AsbabRow[] | null) ?? [];
}

export async function getLessonsForEntity(
  entityId: string,
  lang: Locale,
): Promise<TopicLessonRow[]> {
  const { data } = await supabase
    .from("topic_lessons")
    .select("*, source:tafsir_sources(*)")
    .eq("entity_id", entityId)
    .eq("lang", lang);
  return (data as TopicLessonRow[] | null) ?? [];
}
