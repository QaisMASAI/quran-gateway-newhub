// Client-side helpers for Quran data stored in the local database and recitation audio.

import { supabase } from "@/integrations/supabase/client";
import { SURAH_NAMES_AR, SURAH_NAMES_EN, SURAH_NAMES_HE } from "@/lib/surah-names-he";
import { fetchSurahBilingual } from "@/lib/translations-db";

export interface Chapter {
  id: number;
  name_arabic: string;
  name_simple: string;
  translated_name: { name: string };
  verses_count: number;
  revelation_place: string;
}

type ChapterRow = {
  chapter_number: number;
  name_ar: string;
  name_simple_en: string;
  name_translated_en: string | null;
  name_he: string | null;
  revelation_place: string | null;
  verses_count: number;
};

export interface Verse {
  id: number;
  verse_key: string; // "2:255"
  verse_number: number;
  text_uthmani: string;
  translations: { id: number; text: string; resource_name?: string }[];
}

const VERSE_COUNTS: Record<number, number> = {
  1: 7,
  2: 286,
  3: 200,
  4: 176,
  5: 120,
  6: 165,
  7: 206,
  8: 75,
  9: 129,
  10: 109,
  11: 123,
  12: 111,
  13: 43,
  14: 52,
  15: 99,
  16: 128,
  17: 111,
  18: 110,
  19: 98,
  20: 135,
  21: 112,
  22: 78,
  23: 118,
  24: 64,
  25: 77,
  26: 227,
  27: 93,
  28: 88,
  29: 69,
  30: 60,
  31: 34,
  32: 30,
  33: 73,
  34: 54,
  35: 45,
  36: 83,
  37: 182,
  38: 88,
  39: 75,
  40: 85,
  41: 54,
  42: 53,
  43: 89,
  44: 59,
  45: 37,
  46: 35,
  47: 38,
  48: 29,
  49: 18,
  50: 45,
  51: 60,
  52: 49,
  53: 62,
  54: 55,
  55: 78,
  56: 96,
  57: 29,
  58: 22,
  59: 24,
  60: 13,
  61: 14,
  62: 11,
  63: 11,
  64: 18,
  65: 12,
  66: 12,
  67: 30,
  68: 52,
  69: 52,
  70: 44,
  71: 28,
  72: 28,
  73: 20,
  74: 56,
  75: 40,
  76: 31,
  77: 50,
  78: 40,
  79: 46,
  80: 42,
  81: 29,
  82: 19,
  83: 36,
  84: 25,
  85: 22,
  86: 17,
  87: 19,
  88: 26,
  89: 30,
  90: 20,
  91: 15,
  92: 21,
  93: 11,
  94: 8,
  95: 8,
  96: 19,
  97: 5,
  98: 8,
  99: 8,
  100: 11,
  101: 11,
  102: 8,
  103: 3,
  104: 9,
  105: 5,
  106: 4,
  107: 7,
  108: 3,
  109: 6,
  110: 3,
  111: 5,
  112: 4,
  113: 5,
  114: 6,
};

const TRANSLATION_SOURCE_CODE: Record<ApiLang, string> = {
  he: "ben-shemesh",
  ar: "arabic-original",
  en: "saheeh-international",
};

const sourceIdCache = new Map<string, string>();

async function resolveSourceId(code: string): Promise<string | null> {
  const cached = sourceIdCache.get(code);
  if (cached) return cached;
  const { data } = await supabase
    .from("translation_sources")
    .select("id")
    .eq("code", code)
    .maybeSingle();
  if (!data?.id) return null;
  sourceIdCache.set(code, data.id);
  return data.id;
}

export type ApiLang = "he" | "ar" | "en";

function translationIdFor(lang: ApiLang): number {
  if (lang === "en") return 20;
  if (lang === "ar") return 16;
  return 233;
}

export async function fetchChapters(lang: ApiLang = "he"): Promise<Chapter[]> {
  const { data: dbRows } = await supabase
    .from("quran_chapters" as never)
    .select(
      "chapter_number,name_ar,name_simple_en,name_translated_en,name_he,revelation_place,verses_count",
    )
    .order("chapter_number", { ascending: true });

  const rows = (dbRows as unknown as ChapterRow[] | null) ?? [];
  if (rows.length === 114) {
    return rows.map((r) => ({
      id: r.chapter_number,
      name_arabic: r.name_ar,
      name_simple: r.name_simple_en,
      translated_name: {
        name:
          lang === "he"
            ? (r.name_he ?? r.name_simple_en)
            : lang === "ar"
              ? r.name_ar
              : r.name_simple_en,
      },
      verses_count: r.verses_count,
      revelation_place: r.revelation_place ?? "makkah",
    }));
  }

  return Array.from({ length: 114 }, (_, idx) => {
    const id = idx + 1;
    return {
      id,
      name_arabic: SURAH_NAMES_AR[id] ?? `سورة ${id}`,
      name_simple: SURAH_NAMES_EN[id] ?? `Surah ${id}`,
      translated_name: {
        name:
          lang === "he"
            ? (SURAH_NAMES_HE[id] ?? SURAH_NAMES_EN[id])
            : lang === "ar"
              ? (SURAH_NAMES_AR[id] ?? SURAH_NAMES_EN[id])
              : (SURAH_NAMES_EN[id] ?? `Surah ${id}`),
      },
      verses_count: VERSE_COUNTS[id] ?? 0,
      revelation_place: "makkah",
    };
  });
}

export async function fetchChapter(id: number, lang: ApiLang = "he"): Promise<Chapter> {
  const all = await fetchChapters(lang);
  const chapter = all.find((c) => c.id === id);
  if (!chapter) throw new Error("Failed to load chapter");
  return chapter;
}

export async function fetchVerses(chapterId: number, lang: ApiLang = "he"): Promise<Verse[]> {
  const rows = await fetchSurahBilingual(chapterId, lang);
  return rows.map((row) => ({
    id: Number(`${row.surah}${String(row.ayah).padStart(3, "0")}`),
    verse_key: `${row.surah}:${row.ayah}`,
    verse_number: row.ayah,
    text_uthmani: row.arabic,
    translations: [
      {
        id: translationIdFor(lang),
        text: lang === "ar" ? "" : row.translation,
        resource_name:
          lang === "he" ? "Ben Shemesh" : lang === "en" ? "Sahih International" : "Arabic Original",
      },
    ],
  }));
}

// Full-surah recitation audio mirrors (Quranicaudio CDN + mp3quran)
export function surahAudioUrls(surahId: number): string[] {
  const n = String(surahId).padStart(3, "0");
  return [
    `https://server11.mp3quran.net/yasser/${n}.mp3`,
    `https://server8.mp3quran.net/afs/${n}.mp3`,
    `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${surahId}.mp3`,
    `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahId}.mp3`,
  ];
}

export function surahAudioUrl(surahId: number): string {
  return surahAudioUrls(surahId)[0];
}

// ============================================================
// Per-ayah recitation — multiple authenticated reciters
// Source: everyayah.com (public CDN of well-known murattal recitations)
// ============================================================
export type ReciterKey = "yasser-ad-dussary" | "abdul-basit-murattal" | "mishary-alafasy";
export type AudioQualityKey = "64k" | "128k" | "192k";

export interface Reciter {
  key: ReciterKey;
  name_he: string;
  name_ar: string;
  name_en: string;
  foldersByQuality: Record<AudioQualityKey, string>;
}

export const RECITERS: Reciter[] = [
  {
    key: "yasser-ad-dussary",
    name_he: "יאסר א-דוסרי",
    name_ar: "ياسر الدوسري",
    name_en: "Yasser Al-Dosari",
    foldersByQuality: {
      "64k": "Yasser_Ad-Dussary_64kbps",
      "128k": "Yasser_Ad-Dussary_128kbps",
      "192k": "Yasser_Ad-Dussary_192kbps",
    },
  },
  {
    key: "abdul-basit-murattal",
    name_he: "עבד אל-באסט (מורתל)",
    name_ar: "عبد الباسط (مرتّل)",
    name_en: "Abdul Basit Murattal",
    foldersByQuality: {
      "64k": "Abdul_Basit_Murattal_64kbps",
      "128k": "Abdul_Basit_Murattal_128kbps",
      "192k": "Abdul_Basit_Murattal_192kbps",
    },
  },
  {
    key: "mishary-alafasy",
    name_he: "משארי אל-עפאסי",
    name_ar: "مشاري العفاسي",
    name_en: "Mishary Alafasy",
    foldersByQuality: {
      "64k": "Alafasy_64kbps",
      "128k": "Alafasy_128kbps",
      "192k": "Alafasy_192kbps",
    },
  },
];

export function reciterName(r: Reciter, locale: "he" | "ar" | "en"): string {
  if (locale === "ar") return r.name_ar;
  if (locale === "en") return r.name_en;
  return r.name_he;
}

const RECITER_STORAGE_KEY = "qc:reciter";
const AUDIO_QUALITY_STORAGE_KEY = "qc:audio-quality";

export function getStoredReciter(): ReciterKey {
  if (typeof window === "undefined") return "yasser-ad-dussary";
  const v = window.localStorage.getItem(RECITER_STORAGE_KEY) as ReciterKey | null;
  return v && RECITERS.some((r) => r.key === v) ? v : "yasser-ad-dussary";
}

export function setStoredReciter(key: ReciterKey) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RECITER_STORAGE_KEY, key);
  window.dispatchEvent(new CustomEvent("qc:reciter-change", { detail: key }));
}

export function getStoredAudioQuality(): AudioQualityKey {
  if (typeof window === "undefined") return "128k";
  const v = window.localStorage.getItem(AUDIO_QUALITY_STORAGE_KEY) as AudioQualityKey | null;
  return v === "64k" || v === "128k" || v === "192k" ? v : "128k";
}

export function setStoredAudioQuality(quality: AudioQualityKey) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUDIO_QUALITY_STORAGE_KEY, quality);
  window.dispatchEvent(new CustomEvent("qc:audio-quality-change", { detail: quality }));
}

export function ayahAudioUrl(
  surahId: number,
  ayahNumber: number,
  reciter: ReciterKey = "yasser-ad-dussary",
  quality: AudioQualityKey = "128k",
): string {
  return ayahAudioUrls(surahId, ayahNumber, reciter, quality)[0];
}

export function ayahAudioUrls(
  surahId: number,
  ayahNumber: number,
  reciter: ReciterKey = "yasser-ad-dussary",
  quality: AudioQualityKey = "128k",
): string[] {
  const s = String(surahId).padStart(3, "0");
  const a = String(ayahNumber).padStart(3, "0");
  const selected = RECITERS.find((r) => r.key === reciter) ?? RECITERS[0];
  const qualityOrder: AudioQualityKey[] = [quality, "128k", "64k", "192k"].filter(
    (q, index, arr): q is AudioQualityKey => arr.indexOf(q) === index,
  );
  return qualityOrder.map((q) => {
    const folder = selected.foldersByQuality[q] ?? selected.foldersByQuality["128k"];
    return `https://everyayah.com/data/${folder}/${s}${a}.mp3`;
  });
}

// Strip HTML tags that sometimes appear in translation text
export function cleanText(s: string): string {
  return s
    .replace(/<sup[^>]*>.*?<\/sup>/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

// ============================================================
// Full-Quran local index (for advanced Hebrew/Arabic search)
// ============================================================

export interface IndexedVerse {
  surah: number;
  ayah: number;
  verse_key: string;
  arabic: string;
  hebrew: string;
  english: string;
  // normalized for searching
  hebrewNorm: string;
  arabicNorm: string;
  englishNorm: string;
}

export interface SurahMeta {
  id: number;
  name_arabic: string;
  name_he: string;
  name_simple: string;
  verses_count: number;
}

export interface QuranIndex {
  verses: IndexedVerse[];
  chapters: SurahMeta[];
  bySurah: Map<number, IndexedVerse[]>;
}

function cleanRemoteText(s: string): string {
  return s
    .replace(/<sup[^>]*>.*?<\/sup>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchRemoteQuranIndex(): Promise<IndexedVerse[]> {
  const [arRes, heRes, enRes] = await Promise.all([
    fetch("https://api.quran.com/api/v4/quran/verses/uthmani"),
    fetch("https://api.quran.com/api/v4/quran/translations/233"),
    fetch("https://api.quran.com/api/v4/quran/translations/20"),
  ]);
  if (!arRes.ok || !heRes.ok || !enRes.ok) return [];

  const arJson = (await arRes.json()) as {
    verses: Array<{ verse_key: string; text_uthmani: string }>;
  };
  const heJson = (await heRes.json()) as {
    translations: Array<{ verse_key: string; text: string }>;
  };
  const enJson = (await enRes.json()) as {
    translations: Array<{ verse_key: string; text: string }>;
  };

  const heByKey = new Map(heJson.translations.map((v) => [v.verse_key, cleanRemoteText(v.text)]));
  const enByKey = new Map(enJson.translations.map((v) => [v.verse_key, cleanRemoteText(v.text)]));

  return arJson.verses.map((v) => {
    const [s, a] = v.verse_key.split(":").map(Number);
    const hebrew = heByKey.get(v.verse_key) ?? "";
    const english = enByKey.get(v.verse_key) ?? "";
    return {
      surah: s,
      ayah: a,
      verse_key: v.verse_key,
      arabic: v.text_uthmani,
      hebrew,
      english,
      hebrewNorm: normalizeHebrew(hebrew),
      arabicNorm: normalizeArabic(v.text_uthmani),
      englishNorm: normalizeEnglish(english),
    } satisfies IndexedVerse;
  });
}

// --- normalization ---

// Strip Hebrew niqqud (vowel/cantillation marks U+0591–U+05C7)
const HE_DIACRITICS = /[\u0591-\u05C7]/g;
// Strip Arabic diacritics (tashkeel U+064B–U+0652 etc) and tatweel
// eslint-disable-next-line no-misleading-character-class
const AR_DIACRITICS = /[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g;

export function normalizeHebrew(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFKD")
    .replace(HE_DIACRITICS, "")
    .replace(/["׳״'`.,;:!?()[\]{}\-–—_/\\]/g, " ")
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
    .replace(/["'`.,;:!?()[\]{}\-–—_/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// --- loaders (full Quran in two requests) ---

export async function buildQuranIndex(): Promise<QuranIndex> {
  if (QURAN_INDEX_CACHE && Date.now() - QURAN_INDEX_CACHE.at < 10 * 60_000) {
    return QURAN_INDEX_CACHE.value;
  }
  if (QURAN_INDEX_INFLIGHT) return QURAN_INDEX_INFLIGHT;

  QURAN_INDEX_INFLIGHT = (async () => {
    const [chaptersRaw, arSourceId, heSourceId, enSourceId] = await Promise.all([
      fetchChapters(),
      resolveSourceId(TRANSLATION_SOURCE_CODE.ar),
      resolveSourceId(TRANSLATION_SOURCE_CODE.he),
      resolveSourceId(TRANSLATION_SOURCE_CODE.en),
    ]);

    const chapters: SurahMeta[] = chaptersRaw.map((c) => ({
      id: c.id,
      name_arabic: c.name_arabic,
      name_he: c.translated_name?.name ?? "",
      name_simple: c.name_simple,
      verses_count: c.verses_count,
    }));

    const sourceIds = [arSourceId, heSourceId, enSourceId].filter(Boolean) as string[];
    if (sourceIds.length === 0) {
      const verses = await fetchRemoteQuranIndex();
      const bySurah = new Map<number, IndexedVerse[]>();
      for (const v of verses) {
        const arr = bySurah.get(v.surah) ?? [];
        arr.push(v);
        bySurah.set(v.surah, arr);
      }
      const out = { verses, chapters, bySurah };
      QURAN_INDEX_CACHE = { value: out, at: Date.now() };
      return out;
    }

    const { data: rows, error } = await supabase
      .from("ayah_translations")
      .select("source_id,surah,ayah,text")
      .in("source_id", sourceIds)
      .order("surah", { ascending: true })
      .order("ayah", { ascending: true });

    if (error || !rows) throw new Error("Failed to load verses");

    const verseMap = new Map<
      string,
      { surah: number; ayah: number; arabic: string; hebrew: string; english: string }
    >();
    for (const row of rows) {
      const key = `${row.surah}:${row.ayah}`;
      const current = verseMap.get(key) ?? {
        surah: row.surah,
        ayah: row.ayah,
        arabic: "",
        hebrew: "",
        english: "",
      };
      if (row.source_id === arSourceId) current.arabic = row.text;
      if (row.source_id === heSourceId) current.hebrew = cleanText(row.text);
      if (row.source_id === enSourceId) current.english = cleanText(row.text);
      verseMap.set(key, current);
    }

    const verses: IndexedVerse[] = Array.from(verseMap.values()).map((v) => {
      const s = v.surah;
      const a = v.ayah;
      const heRaw = v.hebrew;
      const enRaw = v.english;
      const arRaw = v.arabic;
      return {
        surah: s,
        ayah: a,
        verse_key: `${s}:${a}`,
        arabic: arRaw,
        hebrew: heRaw,
        english: enRaw,
        hebrewNorm: normalizeHebrew(heRaw),
        arabicNorm: normalizeArabic(arRaw),
        englishNorm: normalizeEnglish(enRaw),
      };
    });

    const bySurah = new Map<number, IndexedVerse[]>();
    for (const v of verses) {
      const arr = bySurah.get(v.surah) ?? [];
      arr.push(v);
      bySurah.set(v.surah, arr);
    }

    if (verses.length === 0) {
      const remoteVerses = await fetchRemoteQuranIndex();
      const remoteBySurah = new Map<number, IndexedVerse[]>();
      for (const v of remoteVerses) {
        const arr = remoteBySurah.get(v.surah) ?? [];
        arr.push(v);
        remoteBySurah.set(v.surah, arr);
      }
      const out = { verses: remoteVerses, chapters, bySurah: remoteBySurah };
      QURAN_INDEX_CACHE = { value: out, at: Date.now() };
      return out;
    }

    const out = { verses, chapters, bySurah };
    QURAN_INDEX_CACHE = { value: out, at: Date.now() };
    return out;
  })();

  try {
    return await QURAN_INDEX_INFLIGHT;
  } finally {
    QURAN_INDEX_INFLIGHT = null;
  }
}

let QURAN_INDEX_CACHE: { value: QuranIndex; at: number } | null = null;
let QURAN_INDEX_INFLIGHT: Promise<QuranIndex> | null = null;

// --- search ---

export interface VerseHit {
  verse: IndexedVerse;
  chapter: SurahMeta;
  matchedIn: "hebrew" | "arabic" | "english";
  snippet: string; // already with <mark>
}

export interface SurahGroup {
  chapter: SurahMeta;
  count: number;
  hits: VerseHit[];
}

export interface SearchOutput {
  total: number;
  groups: SurahGroup[];
  chapterMatches: SurahMeta[]; // direct surah-name matches
}

function highlight(text: string, term: string, normalize: (s: string) => string): string {
  if (!term) return escapeHtml(text);
  const normTerm = normalize(term);
  if (!normTerm) return escapeHtml(text);

  // Locate match in normalized form, then map back roughly by walking
  const normText = normalize(text);
  const idx = normText.indexOf(normTerm);
  if (idx < 0) return escapeHtml(text);

  // Approximate snippet around match in ORIGINAL text:
  // Since normalization changes length (strips niqqud/diacritics), we cannot
  // perfectly map indices. Strategy: find term ignoring marks via regex on
  // original text by inserting `[\u0591-\u05C7\u064B-\u065F\u0670]*` between
  // characters of the search term.
  const escapedChars = [...term.trim()].map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = escapedChars.join("[\\u0591-\\u05C7\\u064B-\\u065F\\u0670\\s]*");
  const re = new RegExp(pattern, "i");
  const m = text.match(re);
  if (!m || m.index == null) return escapeHtml(text);

  const start = Math.max(0, m.index - 40);
  const end = Math.min(text.length, m.index + m[0].length + 40);
  const before = (start > 0 ? "… " : "") + text.slice(start, m.index);
  const hit = text.slice(m.index, m.index + m[0].length);
  const after = text.slice(m.index + m[0].length, end) + (end < text.length ? " …" : "");
  return (
    escapeHtml(before) + `<mark class="search-hit">${escapeHtml(hit)}</mark>` + escapeHtml(after)
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function normalizeEnglish(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFKD")
    .replace(/["'`.,;:!?()[\]{}\-–—_/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Detect script of query for search routing
function isArabic(q: string): boolean {
  return /[\u0600-\u06FF]/.test(q);
}
function isHebrew(q: string): boolean {
  return /[\u0590-\u05FF]/.test(q);
}
function isEnglish(q: string): boolean {
  return /[a-zA-Z]/.test(q) && !isHebrew(q) && !isArabic(q);
}

/** Locale-aware surah display name from index metadata. */
export function chapterDisplayName(c: SurahMeta, locale: "he" | "ar" | "en"): string {
  if (locale === "ar") return c.name_arabic;
  if (locale === "en") return c.name_simple;
  return c.name_he || c.name_simple;
}

export function searchIndex(idx: QuranIndex, rawQuery: string, limit = 500): SearchOutput {
  const q = rawQuery.trim();
  if (!q) return { total: 0, groups: [], chapterMatches: [] };

  const arabicQuery = isArabic(q);
  const hebrewQuery = isHebrew(q);
  const englishQuery = isEnglish(q);
  const normHe = normalizeHebrew(q);
  const normAr = normalizeArabic(q);
  const normEn = normalizeEnglish(q);
  const heTerms = normHe.split(" ").filter((t) => t.length >= 2);
  const arTerms = normAr.split(" ").filter((t) => t.length >= 2);
  const enTerms = normEn.split(" ").filter((t) => t.length >= 2);

  const includesAny = (haystack: string, terms: string[]) =>
    terms.some((term) => haystack.includes(term));

  // Chapter matches (Hebrew + Arabic + English simple name)
  const chapterMatches: SurahMeta[] = [];
  for (const c of idx.chapters) {
    const heN = normalizeHebrew(c.name_he);
    const arN = normalizeArabic(c.name_arabic);
    const simpleN = c.name_simple.toLowerCase();
    if (
      (heTerms.length > 0 && (includesAny(heN, heTerms) || includesAny(simpleN, heTerms))) ||
      (arTerms.length > 0 && includesAny(arN, arTerms)) ||
      (enTerms.length > 0 && includesAny(simpleN, enTerms))
    ) {
      chapterMatches.push(c);
    }
  }

  const hits: VerseHit[] = [];
  for (const v of idx.verses) {
    let matched: "hebrew" | "arabic" | "english" | null = null;
    if (arabicQuery) {
      if (arTerms.length > 0 && includesAny(v.arabicNorm, arTerms)) matched = "arabic";
    } else if (hebrewQuery) {
      if (heTerms.length > 0 && includesAny(v.hebrewNorm, heTerms)) matched = "hebrew";
    } else if (englishQuery) {
      if (enTerms.length > 0 && includesAny(v.englishNorm, enTerms)) matched = "english";
    } else {
      // Mixed or unknown script — try all
      if (heTerms.length > 0 && includesAny(v.hebrewNorm, heTerms)) matched = "hebrew";
      else if (arTerms.length > 0 && includesAny(v.arabicNorm, arTerms)) matched = "arabic";
      else if (enTerms.length > 0 && includesAny(v.englishNorm, enTerms)) matched = "english";
    }
    if (!matched) continue;

    const chapter = idx.chapters[v.surah - 1];
    if (!chapter) continue;
    const snippetSource =
      matched === "hebrew" ? v.hebrew : matched === "english" ? v.english : v.arabic;
    const normFn =
      matched === "hebrew"
        ? normalizeHebrew
        : matched === "english"
          ? normalizeEnglish
          : normalizeArabic;
    const snippet = highlight(snippetSource, q, normFn);
    hits.push({ verse: v, chapter, matchedIn: matched, snippet });
    if (hits.length >= limit) break;
  }

  // Group by surah
  const groupMap = new Map<number, SurahGroup>();
  for (const h of hits) {
    const g = groupMap.get(h.chapter.id);
    if (g) {
      g.count++;
      g.hits.push(h);
    } else {
      groupMap.set(h.chapter.id, { chapter: h.chapter, count: 1, hits: [h] });
    }
  }
  const groups = [...groupMap.values()].sort((a, b) => b.count - a.count);

  return { total: hits.length, groups, chapterMatches };
}
