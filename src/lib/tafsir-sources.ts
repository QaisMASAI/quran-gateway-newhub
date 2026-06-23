// Client-safe metadata for the approved tafsir sources used by AyahCard.
// The server fetches & translates these on demand via explainAyah({ source }).
export type TafsirSourceKey =
  | "ibn-kathir"
  | "tabari"
  | "qurtubi"
  | "saadi"
  | "muyassar";

export interface TafsirSourceMeta {
  key: TafsirSourceKey;
  name_he: string;
  name_ar: string;
  name_en: string;
}

export const TAFSIR_SOURCES_META: TafsirSourceMeta[] = [
  { key: "ibn-kathir", name_he: "אבן כתיר", name_ar: "ابن كثير",  name_en: "Ibn Kathir" },
  { key: "tabari",     name_he: "טברי",     name_ar: "الطبري",   name_en: "Al-Tabari" },
  { key: "qurtubi",    name_he: "קורטובי",  name_ar: "القرطبي",  name_en: "Al-Qurtubi" },
  { key: "saadi",      name_he: "סעדי",     name_ar: "السعدي",   name_en: "Al-Sa'di" },
  { key: "muyassar",   name_he: "מויסר",    name_ar: "الميسر",   name_en: "Al-Muyassar" },
];

export function tafsirSourceName(meta: { name_he: string; name_ar: string; name_en?: string }, locale: "he" | "ar" | "en"): string {
  if (locale === "ar") return meta.name_ar;
  if (locale === "en") return meta.name_en ?? meta.name_he;
  return meta.name_he;
}
