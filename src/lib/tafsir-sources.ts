// Client-safe metadata for approved tafsir sources used by AyahCard.
// Tafsir content is fetched directly from database tables by source slug.
export type TafsirSourceKey =
  | "jalalayn";

export interface TafsirSourceMeta {
  key: TafsirSourceKey;
  name_he: string;
  name_ar: string;
  name_en: string;
}

export const TAFSIR_SOURCES_META: TafsirSourceMeta[] = [
  { key: "jalalayn", name_he: "ג׳לאלין", name_ar: "الجلالين", name_en: "Al-Jalalayn" },
];

export function tafsirSourceName(meta: { name_he: string; name_ar: string; name_en?: string }, locale: "he" | "ar" | "en"): string {
  if (locale === "ar") return meta.name_ar;
  if (locale === "en") return meta.name_en ?? meta.name_he;
  return meta.name_he;
}
