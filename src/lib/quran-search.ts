// ============================================================
// Semantic-ish tokenized search for the local Quran index.
// Designed to handle natural Hebrew questions like:
//   "מה הקוראן אומר על משה"
// by stripping stopwords, expanding Hebrew → Arabic equivalents
// (proper names, key religious terms), and scoring verses by
// how many distinct tokens they match.
// ============================================================

import {
  normalizeArabic,
  normalizeHebrew,
  normalizeEnglish,
  searchIndex,
  type IndexedVerse,
  type QuranIndex,
  type SearchOutput,
  type SurahGroup,
  type SurahMeta,
  type VerseHit,
} from "./quran-api";

// Hebrew stopwords — drop before searching
const HE_STOPWORDS = new Set([
  "מה",
  "מי",
  "איך",
  "איפה",
  "למה",
  "מתי",
  "כמה",
  "איזה",
  "איזו",
  "על",
  "של",
  "עם",
  "את",
  "אל",
  "מן",
  "מ",
  "ה",
  "ו",
  "ש",
  "ב",
  "ל",
  "כש",
  "כ",
  "הוא",
  "היא",
  "הם",
  "הן",
  "אני",
  "אתה",
  "את",
  "אנחנו",
  "אנו",
  "אתם",
  "אתן",
  "זה",
  "זו",
  "זאת",
  "אלה",
  "אלו",
  "הזה",
  "הזו",
  "הזאת",
  "ההוא",
  "ההיא",
  "יש",
  "אין",
  "היה",
  "היתה",
  "הייתי",
  "להיות",
  "עוד",
  "כבר",
  "רק",
  "גם",
  "אבל",
  "אך",
  "או",
  "וגם",
  "אם",
  "כי",
  "אז",
  "אחרי",
  "לפני",
  "בין",
  "תוך",
  "כל",
  "כך",
  "ככה",
  "כדי",
  "כמו",
  "כן",
  "לא",
  "לכן",
  "למרות",
  "בגלל",
  "אומר",
  "אומרת",
  "אומרים",
  "אומרות",
  "מספר",
  "מסביר",
  "קוראן",
  "הקוראן",
  "קראן",
  "הקראן",
  "פסוק",
  "פסוקים",
  "סורה",
  "סורות",
  "אללה",
  "אלוהים",
  "הקדוש",
  "הקדושה",
]);

// Hebrew root/keyword → Arabic forms found in the Uthmani text.
// Multiple Arabic stems per Hebrew word are allowed.
const HE_TO_AR: Record<string, string[]> = {
  // Prophets
  משה: ["موسى", "موسي"],
  אברהם: ["إبراهيم", "ابراهيم"],
  ישו: ["عيسى", "عيسي"],
  ישוע: ["عيسى"],
  יוסף: ["يوسف"],
  נח: ["نوح"],
  אדם: ["آدم", "ادم"],
  חוה: ["حواء"],
  מרים: ["مريم"],
  דוד: ["داود", "داوود"],
  שלמה: ["سليمان"],
  יעקב: ["يعقوب"],
  יצחק: ["إسحاق", "اسحاق", "اسحق"],
  ישמעאל: ["إسماعيل", "اسماعيل"],
  מוחמד: ["محمد"],
  יוחנן: ["يحيى"],
  אהרון: ["هارون"],
  אהרן: ["هارون"],
  אליהו: ["إلياس", "الياس"],
  יונה: ["يونس"],
  איוב: ["أيوب", "ايوب"],
  זכריה: ["زكريا", "زكرياء"],
  לוט: ["لوط"],
  פרעה: ["فرعون"],
  // Theology / values
  סבלנות: ["صبر", "الصابرين", "الصبر", "صابر"],
  סליחה: ["مغفرة", "غفر", "استغفر", "الغفور"],
  מחילה: ["مغفرة", "غفر"],
  רחמים: ["رحمة", "رحم", "الرحمن", "الرحيم", "الراحمين"],
  צדקה: ["صدقة", "زكاة", "ينفقون", "الإنفاق", "صدقات"],
  תפילה: ["صلاة", "الصلاة", "يصلي", "المصلين"],
  אמונה: ["إيمان", "ايمان", "آمن", "يؤمنون", "المؤمنين", "المؤمنون"],
  כפירה: ["كفر", "الكافرين", "يكفرون"],
  צדק: ["عدل", "العدل", "قسط", "القسط"],
  משפט: ["حكم", "الحكم", "يحكم"],
  צום: ["صيام", "الصيام"],
  "חאג'": ["حج", "الحج"],
  "ג'יהאד": ["جهاد", "يجاهدون"],
  תורה: ["توراة", "التوراة"],
  "אינג'יל": ["إنجيل", "الإنجيل"],
  בשורה: ["إنجيل"],
  ספר: ["كتاب", "الكتاب"],
  כתבי: ["كتاب", "الكتاب"],
  מלאך: ["ملك", "الملائكة", "ملائكة"],
  מלאכים: ["الملائكة", "ملائكة"],
  "ג'ין": ["جن", "الجن"],
  שטן: ["شيطان", "الشيطان", "شياطين"],
  גן: ["جنة", "الجنة", "جنات"],
  עדן: ["جنة", "الجنة"],
  גיהנום: ["جهنم", "النار", "نار"],
  אש: ["النار", "نار"],
  אללה: ["الله"],
  אלוהים: ["الله", "الإله"],
  "ה'": ["الله"],
  כעבה: ["الكعبة"],
  מכה: ["مكة"],
  ירושלים: ["القدس", "الأقصى", "الأقصي"],
  בית: ["البيت"],
  אומה: ["أمة", "الأمة"],
  בני: ["بني"],
  ישראל: ["إسرائيل", "اسرائيل"],
  יהודים: ["اليهود", "يهود"],
  נוצרים: ["النصارى", "نصارى"],
  מאמינים: ["المؤمنين", "المؤمنون"],
  אהבה: ["يحب", "الحب"],
  ידע: ["علم", "العلم"],
  חוכמה: ["حكمة", "الحكمة"],
  אור: ["نور", "النور"],
  חושך: ["ظلمات", "الظلمات"],
  ברית: ["عهد", "ميثاق"],
  נישואין: ["نكاح", "النكاح", "زوج"],
  אישה: ["النساء", "امرأة"],
  נשים: ["النساء", "نساء"],
  ילדים: ["أولاد", "الأولاد", "ذرية"],
  הורים: ["والدين", "الوالدين"],
  אב: ["أب", "الأب", "والد"],
  אם: ["أم", "الأم", "والدة"],
  מוות: ["موت", "الموت"],
  חיים: ["حياة", "الحياة"],
  יום: ["يوم", "اليوم"],
  דין: ["الدين", "دين"],
  תחייה: ["البعث", "يبعث"],
  שלום: ["سلام", "السلام"],
  מלחמה: ["قتال", "يقاتلون", "حرب"],
  עשיר: ["غني", "الأغنياء"],
  עני: ["فقير", "الفقراء", "المساكين"],
};

const EN_TO_AR: Record<string, string[]> = {
  moses: HE_TO_AR["משה"],
  abraham: HE_TO_AR["אברהם"],
  jesus: HE_TO_AR["ישו"],
  joseph: HE_TO_AR["יוסף"],
  noah: HE_TO_AR["נח"],
  adam: HE_TO_AR["אדם"],
  mary: HE_TO_AR["מרים"],
  david: HE_TO_AR["דוד"],
  solomon: HE_TO_AR["שלמה"],
  jacob: HE_TO_AR["יעקב"],
  ishmael: HE_TO_AR["ישמעאל"],
  muhammad: HE_TO_AR["מוחמד"],
  patience: HE_TO_AR["סבלנות"],
  forgiveness: HE_TO_AR["סליחה"],
  mercy: HE_TO_AR["רחמים"],
  charity: HE_TO_AR["צדקה"],
  prayer: HE_TO_AR["תפילה"],
  faith: HE_TO_AR["אמונה"],
  justice: HE_TO_AR["צדק"],
  god: HE_TO_AR["אללה"],
  allah: HE_TO_AR["אללה"],
  heaven: HE_TO_AR["גן"],
  hell: HE_TO_AR["גיהנום"],
  peace: HE_TO_AR["שלום"],
  love: HE_TO_AR["אהבה"],
  knowledge: HE_TO_AR["ידע"],
  light: HE_TO_AR["אור"],
  death: HE_TO_AR["מוות"],
  life: HE_TO_AR["חיים"],
};

const STOP_EN = new Set([
  "what",
  "who",
  "how",
  "where",
  "why",
  "when",
  "which",
  "does",
  "say",
  "about",
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "and",
  "or",
  "but",
  "not",
  "with",
  "quran",
  "koran",
  "verse",
  "verses",
  "surah",
  "chapter",
]);

const STOP_AR = new Set([
  "في",
  "من",
  "على",
  "إلى",
  "عن",
  "ثم",
  "قد",
  "لا",
  "ما",
  "إن",
  "أن",
  "أنا",
  "نحن",
  "هو",
  "هي",
  "هم",
  "هن",
  "الذي",
  "التي",
  "الذين",
  "ذلك",
  "تلك",
  "هذه",
  "هذا",
  "الله",
  "الرحمن",
  "الرحيم",
]);

const STOP_AR_NORM = new Set(Array.from(STOP_AR).map((w) => normalizeArabic(w)));

function tokenize(query: string): { he: string[]; ar: string[] } {
  // Split on whitespace + punctuation, keep both scripts.
  const parts = query
    .replace(/["׳״'`.,;:!?()\[\]{}\-–—_/\\]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const he: string[] = [];
  const ar: string[] = [];
  for (const p of parts) {
    if (/[\u0600-\u06FF]/.test(p)) ar.push(p);
    else if (/[\u0590-\u05FF]/.test(p)) he.push(p);
    else {
      // pure latin → ignore (rare for our content)
    }
  }
  return { he, ar };
}

export interface Term {
  display: string; // original token
  heNorm?: string; // normalized Hebrew form to look up in v.hebrewNorm
  enNorm?: string; // normalized English form to look up in v.englishNorm
  arNorms: string[]; // normalized Arabic forms (from dictionary + the token itself if Arabic)
}

export function expandTerms(query: string): Term[] {
  const { he, ar } = tokenize(query);
  const terms: Term[] = [];

  for (const w of he) {
    if (HE_STOPWORDS.has(w)) continue;
    // Drop very short tokens that are usually noise (e.g. single letters)
    if (w.length < 2) continue;
    const heNorm = normalizeHebrew(w);
    const arEquivs = HE_TO_AR[w] ?? [];
    const arNorms = arEquivs.map((a) => normalizeArabic(a)).filter(Boolean);
    terms.push({ display: w, heNorm, arNorms });
  }

  // Latin-script tokens (English)
  const parts = query
    .replace(/["׳״'`.,;:!?()\[\]{}\-–—_/\\]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  for (const w of parts) {
    if (/[\u0590-\u05FF\u0600-\u06FF]/.test(w)) continue;
    const lower = w.toLowerCase();
    if (STOP_EN.has(lower) || lower.length < 2) continue;
    const enNorm = normalizeEnglish(w);
    const arEquivs = EN_TO_AR[lower] ?? [];
    const arNorms = arEquivs.map((a) => normalizeArabic(a)).filter(Boolean);
    terms.push({ display: w, enNorm, arNorms });
  }

  for (const w of ar) {
    const arN = normalizeArabic(w);
    if (!arN || STOP_AR_NORM.has(arN)) continue;
    if (arN.length < 2) continue;
    terms.push({ display: w, arNorms: [arN] });
  }

  return terms;
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    count++;
    idx = haystack.indexOf(needle, idx + needle.length);
  }
  return count;
}

export interface ScoredHit {
  verse: IndexedVerse;
  chapter: SurahMeta;
  matched: number; // distinct terms matched
  arabicMatches: number; // how many term-occurrences in arabic
  hebrewMatches: number; // how many term-occurrences in hebrew
}

export interface ScoredSearchResult {
  hits: ScoredHit[];
  termsUsed: Term[];
}

export function semanticSearch(
  idx: QuranIndex,
  query: string,
  opts: { maxResults?: number; minTerms?: number } = {},
): ScoredSearchResult {
  const maxResults = opts.maxResults ?? 50;
  const terms = expandTerms(query);
  if (terms.length === 0) return { hits: [], termsUsed: [] };

  const minTerms = opts.minTerms ?? 1;

  const scored: ScoredHit[] = [];
  for (const v of idx.verses) {
    let matched = 0;
    let arMatches = 0;
    let heMatches = 0;
    for (const t of terms) {
      let termHit = false;
      if (t.heNorm && v.hebrewNorm.includes(t.heNorm)) {
        termHit = true;
        // count occurrences for ranking
        heMatches += countOccurrences(v.hebrewNorm, t.heNorm);
      }
      if (t.enNorm && v.englishNorm.includes(t.enNorm)) {
        termHit = true;
        heMatches += countOccurrences(v.englishNorm, t.enNorm);
      }
      for (const a of t.arNorms) {
        if (v.arabicNorm.includes(a)) {
          termHit = true;
          arMatches += countOccurrences(v.arabicNorm, a);
        }
      }
      if (termHit) matched++;
    }
    if (matched >= minTerms) {
      const chapter = idx.chapters[v.surah - 1];
      if (!chapter) continue;
      scored.push({ verse: v, chapter, matched, arabicMatches: arMatches, hebrewMatches: heMatches });
    }
  }

  // Rank: more distinct terms first, then by total occurrences, then by ayah order.
  scored.sort((a, b) => {
    if (b.matched !== a.matched) return b.matched - a.matched;
    const aTotal = a.arabicMatches + a.hebrewMatches;
    const bTotal = b.arabicMatches + b.hebrewMatches;
    if (bTotal !== aTotal) return bTotal - aTotal;
    if (a.verse.surah !== b.verse.surah) return a.verse.surah - b.verse.surah;
    return a.verse.ayah - b.verse.ayah;
  });

  return { hits: scored.slice(0, maxResults), termsUsed: terms };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function truncateSnippet(text: string, max = 120): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

/** Convert semantic search hits into the SearchOutput shape used by /search. */
export function semanticToSearchOutput(
  idx: QuranIndex,
  hits: ScoredHit[],
  locale: "he" | "ar" | "en" = "he",
): SearchOutput {
  const verseHits: VerseHit[] = hits.map((h) => {
    const matchedIn: VerseHit["matchedIn"] =
      h.hebrewMatches >= h.arabicMatches ? (locale === "en" ? "english" : "hebrew") : "arabic";
    const snippetSource =
      matchedIn === "english" ? h.verse.english : matchedIn === "hebrew" ? h.verse.hebrew : h.verse.arabic;
    return {
      verse: h.verse,
      chapter: h.chapter,
      matchedIn,
      snippet: escapeHtml(truncateSnippet(snippetSource)),
    };
  });

  const groupMap = new Map<number, SurahGroup>();
  for (const hit of verseHits) {
    const g = groupMap.get(hit.chapter.id);
    if (g) {
      g.count++;
      g.hits.push(hit);
    } else {
      groupMap.set(hit.chapter.id, { chapter: hit.chapter, count: 1, hits: [hit] });
    }
  }

  return {
    total: verseHits.length,
    groups: [...groupMap.values()].sort((a, b) => b.count - a.count),
    chapterMatches: [],
  };
}

/** Keyword search with semantic fallback when few results are found. */
export function searchWithFallback(idx: QuranIndex, query: string, locale: "he" | "ar" | "en" = "he"): SearchOutput {
  const keyword = searchIndex(idx, query);
  if (keyword.total >= 3 || query.trim().length < 2) return keyword;

  const { hits } = semanticSearch(idx, query, { maxResults: 50 });
  if (hits.length === 0) return keyword;

  const semantic = semanticToSearchOutput(idx, hits, locale);
  if (semantic.total <= keyword.total) return keyword;
  return semantic;
}
