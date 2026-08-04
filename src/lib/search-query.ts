import { normalizeArabic, normalizeEnglish, normalizeHebrew } from "@/utils/normalize";
import { ConceptualQueryProfile } from "@/types/entity-metadata";

export type SearchLang = "he" | "ar" | "en" | "mixed";

// Multi-lingual rich concept dictionary
const CONCEPT_DICTIONARY: Record<
  string,
  {
    roots: string[];
    synonyms: { ar: string[]; he: string[]; en: string[] };
    categories: string[];
    virtues?: string[];
    sins?: string[];
  }
> = {
  patience: {
    roots: ["ص-ب-ر", "ס-ב-ر"],
    synonyms: {
      ar: ["صبر", "الصبر", "الصابرين", "اصطبار", "مصابرة"],
      he: ["סבלנות", "אורך רוח", "עמידות", "התמדה"],
      en: ["patience", "perseverance", "steadfastness", "endurance", "sabr"],
    },
    categories: ["Ethics", "Spiritual Purification"],
    virtues: ["Sabr", "Perseverance"],
  },
  prayer: {
    roots: ["ص-ل-و", "ص-ل-ى"],
    synonyms: {
      ar: ["صلاة", "الصلاة", "المصلين", "اقام الصلاة", "سجود"],
      he: ["תפילה", "עבודה שבלב", "סלאת"],
      en: ["prayer", "salat", "salah", "supplication", "prostration"],
    },
    categories: ["Ibadat", "Pillars of Islam"],
    virtues: ["Devotion", "Humility in Worship"],
  },
  monotheism: {
    roots: ["و-ح-د", "ו-ח-ד"],
    synonyms: {
      ar: ["توحيد", "التوحيد", "لا إله إلا الله", "إخلاص", "وحدانية"],
      he: ["ייחוד האל", "אמונה באל אחד", "אחדות הבורא"],
      en: ["tawhid", "monotheism", "oneness of god", "unitarianism"],
    },
    categories: ["Aqeeda", "Theology"],
    virtues: ["Sincerity", "Pure Monotheism"],
    sins: ["Shirk"],
  },
  justice: {
    roots: ["ع-د-ل", "ق-س-ط"],
    synonyms: {
      ar: ["عدل", "العدل", "قسط", "إنصاف", "ميزان"],
      he: ["צדק", "יושר", "הגינות", "משפט צדק"],
      en: ["justice", "equity", "fairness", "impartiality", "adl"],
    },
    categories: ["Governance", "Ethics", "Social Order"],
    virtues: ["Impartiality", "Fairness"],
    sins: ["Injustice (Zulm)"],
  },
  mercy: {
    roots: ["ر-ح-م", "ר-ח-מ"],
    synonyms: {
      ar: ["رحمة", "الرحمن", "الرحيم", "رأفة", "شفقة"],
      he: ["רחמים", "חמלה", "חסד", "טוב לב"],
      en: ["mercy", "compassion", "loving-kindness", "grace", "rahmah"],
    },
    categories: ["Divine Attributes", "Ethics"],
    virtues: ["Compassion", "Forgiveness"],
    sins: ["Cruelty"],
  },
  repentance: {
    roots: ["ت-و-ب", "ת-ו-ב"],
    synonyms: {
      ar: ["توبة", "التواب", "استغفار", "إنابة", "ندم"],
      he: ["תשובה", "חרטה", "סליחה", "מחילה"],
      en: ["repentance", "tawbah", "seeking forgiveness", "contrition"],
    },
    categories: ["Aqeeda", "Ethics"],
    virtues: ["Immediate Repentance", "Humility"],
  },
  charity: {
    roots: ["ز-ك-و", "ص-د-ق"],
    synonyms: {
      ar: ["زكاة", "صدقة", "إنفاق", "إحسان", "إطعام"],
      he: ["צדקה", "זכאת", "נתינה", "תרומה"],
      en: ["charity", "zakat", "sadaqah", "almsgiving", "spending in god's cause"],
    },
    categories: ["Ibadat", "Social Welfare"],
    virtues: ["Generosity", "Altruism"],
    sins: ["Miserliness", "Stinginess"],
  },
};

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
  גיהנום: ["אש", "שאول"],
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

export function buildConceptualQueryProfile(input: string): ConceptualQueryProfile {
  const language = detectSearchLang(input);
  const normalized =
    language === "ar" ? normalizeArabic(input) : language === "he" ? normalizeHebrew(input) : normalizeEnglish(input);

  const tokens = normalized
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  const profile: ConceptualQueryProfile = {
    rawQuery: input,
    normalizedQuery: normalized,
    language,
    primaryConcepts: [],
    rootWords: [],
    synonyms: { ar: [], he: [], en: [] },
    transliterations: [],
    semanticTags: [],
    topicCategories: [],
    theologicalCategories: [],
    ethicsCategories: [],
    jurisprudenceCategories: [],
    virtues: [],
    sins: [],
    people: [],
    places: [],
    events: [],
  };

  for (const token of tokens) {
    for (const [conceptKey, conceptData] of Object.entries(CONCEPT_DICTIONARY)) {
      const matchInAr = conceptData.synonyms.ar.some((s) => s.includes(token));
      const matchInHe = conceptData.synonyms.he.some((s) => s.includes(token));
      const matchInEn = conceptData.synonyms.en.some((s) => s.includes(token));

      if (matchInAr || matchInHe || matchInEn || conceptKey.includes(token)) {
        profile.primaryConcepts.push(conceptKey);
        profile.rootWords.push(...conceptData.roots);
        profile.synonyms.ar.push(...conceptData.synonyms.ar);
        profile.synonyms.he.push(...conceptData.synonyms.he);
        profile.synonyms.en.push(...conceptData.synonyms.en);
        profile.semanticTags.push(...conceptData.categories);
        if (conceptData.virtues) profile.virtues.push(...conceptData.virtues);
        if (conceptData.sins) profile.sins.push(...conceptData.sins);
      }
    }
  }

  // Deduplicate entries
  profile.primaryConcepts = Array.from(new Set(profile.primaryConcepts));
  profile.rootWords = Array.from(new Set(profile.rootWords));
  profile.synonyms.ar = Array.from(new Set(profile.synonyms.ar));
  profile.synonyms.he = Array.from(new Set(profile.synonyms.he));
  profile.synonyms.en = Array.from(new Set(profile.synonyms.en));
  profile.semanticTags = Array.from(new Set(profile.semanticTags));
  profile.virtues = Array.from(new Set(profile.virtues));
  profile.sins = Array.from(new Set(profile.sins));

  return profile;
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
    language === "ar" ? normalizeArabic(input) : language === "he" ? normalizeHebrew(input) : normalizeEnglish(input);

  const tokens = normalized
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .slice(0, 12);

  const expanded = new Set<string>(tokens);

  // Apply concept profile expansion
  const profile = buildConceptualQueryProfile(input);
  for (const arSyn of profile.synonyms.ar) expanded.add(arSyn);
  for (const heSyn of profile.synonyms.he) expanded.add(heSyn);
  for (const enSyn of profile.synonyms.en) expanded.add(enSyn);

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

  const expandedTokens = [...expanded].filter(Boolean).slice(0, 50);
  return {
    language,
    normalized,
    tokens,
    expandedTokens,
    expandedQuery: expandedTokens.join(" "),
  };
}
