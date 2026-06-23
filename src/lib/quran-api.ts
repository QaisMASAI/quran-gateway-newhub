// Client-side helpers for the Quran.com public API and Yasser Al-Dossari audio.

export interface Chapter {
  id: number;
  name_arabic: string;
  name_simple: string;
  translated_name: { name: string };
  verses_count: number;
  revelation_place: string;
}

export interface Verse {
  id: number;
  verse_key: string; // "2:255"
  verse_number: number;
  text_uthmani: string;
  translations: { id: number; text: string; resource_name?: string }[];
}

const API = "https://api.quran.com/api/v4";
// Translation resource ids on Quran.com
const HEBREW_TRANSLATION_ID = 233;
const ENGLISH_TRANSLATION_ID = 20; // Saheeh International
const ARABIC_MUYASSAR_ID = 16; // Tafsir Muyassar (Arabic gloss)

export type ApiLang = "he" | "ar" | "en";

function translationIdFor(lang: ApiLang): number {
  if (lang === "en") return ENGLISH_TRANSLATION_ID;
  if (lang === "ar") return ARABIC_MUYASSAR_ID;
  return HEBREW_TRANSLATION_ID;
}

export async function fetchChapters(lang: ApiLang = "he"): Promise<Chapter[]> {
  const res = await fetch(`${API}/chapters?language=${lang}`);
  if (!res.ok) throw new Error("Failed to load chapters");
  const json = await res.json();
  return json.chapters as Chapter[];
}

export async function fetchChapter(id: number, lang: ApiLang = "he"): Promise<Chapter> {
  const res = await fetch(`${API}/chapters/${id}?language=${lang}`);
  if (!res.ok) throw new Error("Failed to load chapter");
  const json = await res.json();
  return json.chapter as Chapter;
}

export async function fetchVerses(chapterId: number, lang: ApiLang = "he"): Promise<Verse[]> {
  const tid = translationIdFor(lang);
  const res = await fetch(
    `${API}/verses/by_chapter/${chapterId}?translations=${tid}&fields=text_uthmani&per_page=300&language=${lang}`,
  );
  if (!res.ok) throw new Error("Failed to load verses");
  const json = await res.json();
  return json.verses as Verse[];
}

// Yasser Al-Dossari full-surah recitation via mp3quran.net
export function surahAudioUrl(surahId: number): string {
  const n = String(surahId).padStart(3, "0");
  return `https://server11.mp3quran.net/yasser/${n}.mp3`;
}

// ============================================================
// Per-ayah recitation — multiple authenticated reciters
// Source: everyayah.com (public CDN of well-known murattal recitations)
// ============================================================
export type ReciterKey = "yasser-ad-dussary" | "mishary-alafasy" | "abdul-basit-murattal" | "husary-muallim" | "sudais";

export interface Reciter {
  key: ReciterKey;
  name_he: string;
  name_ar: string;
  name_en: string;
  folder: string;
}

export const RECITERS: Reciter[] = [
  { key: "yasser-ad-dussary", name_he: "יאסר א-דוסרי", name_ar: "ياسر الدوسري", name_en: "Yasser Al-Dosari", folder: "Yasser_Ad-Dussary_128kbps" },
  { key: "mishary-alafasy", name_he: "משארי אל-עפאסי", name_ar: "مشاري العفاسي", name_en: "Mishary Al-Afasy", folder: "Alafasy_128kbps" },
  {
    key: "abdul-basit-murattal",
    name_he: "עבד אל-באסט (מורתל)",
    name_ar: "عبد الباسط مرتل",
    name_en: "Abdul-Basit (Murattal)",
    folder: "Abdul_Basit_Murattal_192kbps",
  },
  { key: "husary-muallim", name_he: "אל-חוסרי (מועלם)", name_ar: "الحصري معلم", name_en: "Al-Husary (Mu'allim)", folder: "Husary_128kbps" },
  { key: "sudais", name_he: "א-סודייס", name_ar: "السديس", name_en: "As-Sudais", folder: "Abdurrahmaan_As-Sudais_192kbps" },
];

export function reciterName(r: Reciter, locale: "he" | "ar" | "en"): string {
  if (locale === "ar") return r.name_ar;
  if (locale === "en") return r.name_en;
  return r.name_he;
}

const RECITER_STORAGE_KEY = "qc:reciter";

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

export function ayahAudioUrl(surahId: number, ayahNumber: number, reciter: ReciterKey = "yasser-ad-dussary"): string {
  const s = String(surahId).padStart(3, "0");
  const a = String(ayahNumber).padStart(3, "0");
  const folder = RECITERS.find((r) => r.key === reciter)?.folder ?? RECITERS[0].folder;
  return `https://everyayah.com/data/${folder}/${s}${a}.mp3`;
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

// --- normalization ---

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

// --- loaders (full Quran in two requests) ---

interface UthmaniVerse {
  id: number;
  verse_key: string;
  text_uthmani: string;
}
interface TranslationItem {
  resource_id: number;
  text: string;
}

async function fetchAllArabic(): Promise<UthmaniVerse[]> {
  const res = await fetch(`${API}/quran/verses/uthmani`);
  if (!res.ok) throw new Error("Failed to load Arabic Quran");
  const json = await res.json();
  return json.verses as UthmaniVerse[];
}

async function fetchAllHebrew(): Promise<TranslationItem[]> {
  const res = await fetch(`${API}/quran/translations/${HEBREW_TRANSLATION_ID}`);
  if (!res.ok) throw new Error("Failed to load Hebrew translations");
  const json = await res.json();
  return json.translations as TranslationItem[];
}

async function fetchAllEnglish(): Promise<TranslationItem[]> {
  const res = await fetch(`${API}/quran/translations/${ENGLISH_TRANSLATION_ID}`);
  if (!res.ok) throw new Error("Failed to load English translations");
  const json = await res.json();
  return json.translations as TranslationItem[];
}

export async function buildQuranIndex(): Promise<QuranIndex> {
  const [arabic, hebrew, english, chaptersRaw] = await Promise.all([
    fetchAllArabic(),
    fetchAllHebrew(),
    fetchAllEnglish(),
    fetchChapters(),
  ]);

  const chapters: SurahMeta[] = chaptersRaw.map((c) => ({
    id: c.id,
    name_arabic: c.name_arabic,
    name_he: c.translated_name?.name ?? "",
    name_simple: c.name_simple,
    verses_count: c.verses_count,
  }));

  const verses: IndexedVerse[] = arabic.map((v, i) => {
    const [s, a] = v.verse_key.split(":").map(Number);
    const heRaw = cleanText(hebrew[i]?.text ?? "");
    const enRaw = cleanText(english[i]?.text ?? "");
    const arRaw = v.text_uthmani;
    return {
      surah: s,
      ayah: a,
      verse_key: v.verse_key,
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

  return { verses, chapters, bySurah };
}

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
  return escapeHtml(before) + `<mark class="search-hit">${escapeHtml(hit)}</mark>` + escapeHtml(after);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

  // Chapter matches (Hebrew + Arabic + English simple name)
  const chapterMatches: SurahMeta[] = [];
  for (const c of idx.chapters) {
    const heN = normalizeHebrew(c.name_he);
    const arN = normalizeArabic(c.name_arabic);
    const simpleN = c.name_simple.toLowerCase();
    if (
      (normHe && (heN.includes(normHe) || simpleN.includes(normHe))) ||
      (normAr && arN.includes(normAr)) ||
      (normEn && simpleN.includes(normEn))
    ) {
      chapterMatches.push(c);
    }
  }

  const hits: VerseHit[] = [];
  for (const v of idx.verses) {
    let matched: "hebrew" | "arabic" | "english" | null = null;
    if (arabicQuery) {
      if (normAr && v.arabicNorm.includes(normAr)) matched = "arabic";
    } else if (hebrewQuery) {
      if (normHe && v.hebrewNorm.includes(normHe)) matched = "hebrew";
    } else if (englishQuery) {
      if (normEn && v.englishNorm.includes(normEn)) matched = "english";
    } else {
      // Mixed or unknown script — try all
      if (normHe && v.hebrewNorm.includes(normHe)) matched = "hebrew";
      else if (normAr && v.arabicNorm.includes(normAr)) matched = "arabic";
      else if (normEn && v.englishNorm.includes(normEn)) matched = "english";
    }
    if (!matched) continue;

    const chapter = idx.chapters[v.surah - 1];
    if (!chapter) continue;
    const snippetSource = matched === "hebrew" ? v.hebrew : matched === "english" ? v.english : v.arabic;
    const normFn = matched === "hebrew" ? normalizeHebrew : matched === "english" ? normalizeEnglish : normalizeArabic;
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
