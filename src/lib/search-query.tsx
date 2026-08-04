import type { ConceptualQueryProfile } from "@/types/entity-metadata";

type LocaleBucket = "ar" | "he" | "en";

const ARABIC_RE = /[\u0600-\u06FF]/;
const HEBREW_RE = /[\u0590-\u05FF]/;
const EN_RE = /[A-Za-z]/;

const QUERY_SYNONYMS: Record<string, string[]> = {
  tawhid: ["توحيد", "التوحيد", "אחדות האל", "oneness of allah"],
  sabr: ["صبر", "الصبر", "סבלנות", "patience"],
  salah: ["صلاة", "الصلاة", "תפילה", "prayer"],
  zakat: ["زكاة", "الزكاة", "זכאת", "charity"],
  hajj: ["حج", "الحج", "חג'", "pilgrimage"],
  qiyamah: ["قيامة", "יום הדין", "judgment day"],
  musa: ["موسى", "משה", "moses"],
  ibrahim: ["إبراهيم", "אברהם", "abraham"],
  yusuf: ["يوسف", "יוסף", "joseph"],
};

function detectLanguage(input: string): ConceptualQueryProfile["language"] {
  const hasArabic = ARABIC_RE.test(input);
  const hasHebrew = HEBREW_RE.test(input);
  const hasEnglish = EN_RE.test(input);
  const count = Number(hasArabic) + Number(hasHebrew) + Number(hasEnglish);

  if (count > 1) return "mixed";
  if (hasArabic) return "ar";
  if (hasHebrew) return "he";
  return "en";
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[.,!?;:()[\]{}"'`~@#$%^&*_+=|\\/<>]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

function splitByScript(items: string[]): { ar: string[]; he: string[]; en: string[] } {
  const buckets = { ar: [] as string[], he: [] as string[], en: [] as string[] };
  for (const item of items) {
    if (ARABIC_RE.test(item)) buckets.ar.push(item);
    else if (HEBREW_RE.test(item)) buckets.he.push(item);
    else buckets.en.push(item);
  }
  return buckets;
}

export function buildConceptualQueryProfile(query: string): ConceptualQueryProfile {
  const normalizedQuery = query.trim().toLowerCase();
  const primaryConcepts = tokenize(normalizedQuery);

  const synonymPool = new Set<string>();
  for (const token of primaryConcepts) {
    const local = QUERY_SYNONYMS[token];
    if (local) {
      for (const entry of local) synonymPool.add(entry);
    }
  }

  const synonyms = splitByScript(Array.from(synonymPool));
  const language = detectLanguage(query);

  return {
    rawQuery: query,
    normalizedQuery,
    language,
    primaryConcepts,
    rootWords: primaryConcepts,
    synonyms,
    transliterations: synonyms.en,
    semanticTags: primaryConcepts,
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
}

export function expandSearchQuery(query: string): { expandedQuery: string; expandedTokens: string[] } {
  const profile = buildConceptualQueryProfile(query);
  const expandedTokens = Array.from(
    new Set([...profile.primaryConcepts, ...profile.synonyms.ar, ...profile.synonyms.he, ...profile.synonyms.en]),
  );

  return {
    expandedQuery: expandedTokens.join(" ").trim(),
    expandedTokens,
  };
}
