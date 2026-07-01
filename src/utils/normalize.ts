/**
 * Text normalization for search
 */

// Strip Hebrew niqqud (vowel/cantillation marks U+0591–U+05C7)
const HE_DIACRITICS = /[\u0591-\u05C7]/g;
// Strip Arabic diacritics (tashkeel U+064B–U+0652 etc) and tatweel
const AR_DIACRITICS = /[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g;

export function normalizeHebrew(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFKD")
    .replace(HE_DIACRITICS, "")
    .replace(/["׳״'`.,;:!?()\[\]{}\-–—_/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizeArabic(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFKD")
    .replace(AR_DIACRITICS, "")
    .replace(/[ٱإأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/["'`.,;:!?()\[\]{}\-–—_/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeEnglish(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFKD")
    .replace(/["'`.,;:!?()\[\]{}\-–—_/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Detect script of text
 */
export function isArabic(q: string): boolean {
  return /[\u0600-\u06FF]/.test(q);
}

export function isHebrew(q: string): boolean {
  return /[\u0590-\u05FF]/.test(q);
}

export function isEnglish(q: string): boolean {
  return /[a-zA-Z]/.test(q) && !isHebrew(q) && !isArabic(q);
}
