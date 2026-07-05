import { normalizeArabic, normalizeEnglish, normalizeHebrew } from "@/utils/normalize";

export type SearchLang = "he" | "ar" | "en" | "mixed";

const AR_SYNONYMS: Record<string, string[]> = {
  صلاه: ["صلاة", "الصلاة", "المصلين"],
  ايمان: ["إيمان", "مؤمن", "المؤمنين"],
  رحمه: ["رحمة", "الرحيم", "الرحمن"],
  جنه: ["جنة", "جنات", "الفردوس"],
  نار: ["جهنم", "السعير"],
};

const HE_SYNONYMS: Record<string, string[]> = {
  תפלה: ["תפילה", "תפלת"],
  אמונה: ["מאמין", "מאמינים"],
  רחמים: ["רחום", "חסד"],
  גן: ["גןעדן", "עדן"],
  גיהנום: ["אש", "שאול"],
};

const EN_SYNONYMS: Record<string, string[]> = {
  prayer: ["pray", "salat", "salah"],
  faith: ["belief", "iman"],
  mercy: ["compassion", "rahma"],
  paradise: ["heaven", "jannah"],
  hell: ["fire", "jahannam"],
};

export function detectSearchLang(input: string): SearchLang {
  const hasAr = /[\u0600-\u06FF]/.test(input);
  const hasHe = /[\u0590-\u05FF]/.test(input);
  const hasEn = /[a-zA-Z]/.test(input);
  const count = Number(hasAr) + Number(hasHe) + Number(hasEn);
  if (count !== 1) return "mixed";
  if (hasAr) return "ar";
  if (hasHe) return "he";
  return "en";
}

function stemEnglishToken(token: string): string[] {
  const out = new Set<string>([token]);
  if (token.length > 4 && token.endsWith("ing")) out.add(token.slice(0, -3));
  if (token.length > 3 && token.endsWith("ed")) out.add(token.slice(0, -2));
  if (token.length > 3 && token.endsWith("es")) out.add(token.slice(0, -2));
  if (token.length > 2 && token.endsWith("s")) out.add(token.slice(0, -1));
  if (token.length > 4 && token.endsWith("tion")) out.add(token.slice(0, -4));
  return [...out].filter((t) => t.length >= 2);
}

function stemHebrewToken(token: string): string[] {
  const out = new Set<string>([token]);
  const prefixes = ["ו", "ה", "ב", "ל", "כ", "מ", "ש"];
  for (const p of prefixes) {
    if (token.length > 3 && token.startsWith(p)) out.add(token.slice(1));
  }
  if (token.length > 3 && token.endsWith("ים")) out.add(token.slice(0, -2));
  if (token.length > 3 && token.endsWith("ות")) out.add(token.slice(0, -2));
  return [...out].filter((t) => t.length >= 2);
}

function stemArabicToken(token: string): string[] {
  const out = new Set<string>([token]);
  const prefixes = ["ال", "و", "ف", "ب", "ك", "ل"];
  for (const p of prefixes) {
    if (token.length > 4 && token.startsWith(p)) out.add(token.slice(p.length));
  }
  const suffixes = ["ات", "ون", "ين", "ان", "ة", "ه"];
  for (const s of suffixes) {
    if (token.length > 4 && token.endsWith(s)) out.add(token.slice(0, -s.length));
  }
  return [...out].filter((t) => t.length >= 2);
}

export function expandSearchQuery(input: string): {
  language: SearchLang;
  normalized: string;
  tokens: string[];
  expandedTokens: string[];
  expandedQuery: string;
} {
  const language = detectSearchLang(input);
  const normalized =
    language === "ar"
      ? normalizeArabic(input)
      : language === "he"
        ? normalizeHebrew(input)
        : normalizeEnglish(input);

  const tokens = normalized
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .slice(0, 12);

  const expanded = new Set<string>(tokens);

  for (const token of tokens) {
    if (language === "en") {
      for (const t of stemEnglishToken(token)) expanded.add(t);
      for (const t of EN_SYNONYMS[token] ?? []) expanded.add(normalizeEnglish(t));
    } else if (language === "he") {
      for (const t of stemHebrewToken(token)) expanded.add(t);
      for (const t of HE_SYNONYMS[token] ?? []) expanded.add(normalizeHebrew(t));
    } else if (language === "ar") {
      for (const t of stemArabicToken(token)) expanded.add(t);
      for (const t of AR_SYNONYMS[token] ?? []) expanded.add(normalizeArabic(t));
    } else {
      for (const t of stemEnglishToken(token)) expanded.add(t);
      for (const t of stemHebrewToken(token)) expanded.add(t);
      for (const t of stemArabicToken(token)) expanded.add(t);
    }
  }

  const expandedTokens = [...expanded].filter(Boolean).slice(0, 40);
  return {
    language,
    normalized,
    tokens,
    expandedTokens,
    expandedQuery: expandedTokens.join(" "),
  };
}
