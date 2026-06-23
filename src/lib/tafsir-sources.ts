// Client-safe metadata for approved tafsir sources used by AyahCard.
// Tafsir content is fetched directly from database tables by source slug.
export type TafsirSourceKey =
  | "muyassar"
  | "qurtubi"
  | "saadi"
  | "jalalayn"
  | "baghawi"
  | "waseet"
  | "tanweer";

export interface TafsirSourceMeta {
  key: TafsirSourceKey;
  name_he: string;
  name_ar: string;
  name_en: string;
}

export const TAFSIR_SOURCES_META: TafsirSourceMeta[] = [
  { key: "muyassar", name_he: "מויסר", name_ar: "الميسر", name_en: "Al-Muyassar" },
  { key: "qurtubi", name_he: "קורטובי", name_ar: "القرطبي", name_en: "Al-Qurtubi" },
  { key: "saadi", name_he: "סעדי", name_ar: "السعدي", name_en: "Al-Sa'di" },
  { key: "jalalayn", name_he: "ג׳לאלין", name_ar: "الجلالين", name_en: "Al-Jalalayn" },
  { key: "baghawi", name_he: "בע׳אווי", name_ar: "البغوي", name_en: "Al-Baghawi" },
  { key: "waseet", name_he: "ווסיט", name_ar: "الوسيط", name_en: "Al-Waseet" },
  { key: "tanweer", name_he: "תנוויר", name_ar: "التنوير", name_en: "Al-Tanweer" },
];

export function tafsirSourceName(meta: { name_he: string; name_ar: string; name_en?: string }, locale: "he" | "ar" | "en"): string {
  if (locale === "ar") return meta.name_ar;
  if (locale === "en") return meta.name_en ?? meta.name_he;
  return meta.name_he;
}
