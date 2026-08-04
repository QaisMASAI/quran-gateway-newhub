import { buildQuranIndex, type SearchOutput } from "./quran-api";
import { searchWithFallback } from "./quran-search";
import { searchHadith } from "./hadith.functions";
import {
  listEntitiesByKind,
  searchKnowledgeTexts,
  pickLocale,
  type KnowledgeEntity,
  type EntityKind,
} from "./knowledge";
import { ALL_PROPHETS } from "./prophets";

export type KnowledgeCategory =
  | "quran"
  | "hadith"
  | "tafsir"
  | "topics"
  | "prophets"
  | "stories"
  | "narrators"
  | "places";

export interface UnifiedSearchResultItem {
  id: string;
  category: KnowledgeCategory;
  domain: KnowledgeCategory; // Alias for backward compatibility
  title: string;
  subtitle?: string;
  snippet: string;
  arabicSnippet?: string;
  hebrewSnippet?: string;
  englishSnippet?: string;
  url: string;
  badge?: string;
  relevanceScore: number;
  metadata?: Record<string, unknown>;
}

export interface UnifiedSearchResponse {
  query: string;
  totalResults: number;
  items: UnifiedSearchResultItem[];
  categoryResults: Record<KnowledgeCategory, UnifiedSearchResultItem[]>;
  categoryCounts: Record<KnowledgeCategory, number>;
}

function entityMatchesQuery(
  entity: KnowledgeEntity,
  query: string,
  locale: "ar" | "en" | "he",
): { matches: boolean; score: number } {
  const q = query.trim().toLowerCase();
  if (!q) return { matches: false, score: 0 };

  const titleAr = (entity.title_i18n?.ar ?? "").toLowerCase();
  const titleHe = (entity.title_i18n?.he ?? "").toLowerCase();
  const titleEn = (entity.title_i18n?.en ?? "").toLowerCase();

  const summaryAr = (entity.summary_i18n?.ar ?? "").toLowerCase();
  const summaryHe = (entity.summary_i18n?.he ?? "").toLowerCase();
  const summaryEn = (entity.summary_i18n?.en ?? "").toLowerCase();

  const slug = entity.slug.toLowerCase();
  const keywords = (entity.keywords ?? []).map((k) => k.toLowerCase());

  let score = 0;

  if (titleAr === q || titleHe === q || titleEn === q || slug === q) {
    score += 100;
  } else if (titleAr.startsWith(q) || titleHe.startsWith(q) || titleEn.startsWith(q)) {
    score += 80;
  } else if (titleAr.includes(q) || titleHe.includes(q) || titleEn.includes(q)) {
    score += 60;
  } else if (keywords.some((k) => k.includes(q))) {
    score += 50;
  } else if (summaryAr.includes(q) || summaryHe.includes(q) || summaryEn.includes(q)) {
    score += 30;
  }

  return { matches: score > 0, score };
}

export async function performUnifiedSearch(
  query: string,
  locale: "ar" | "en" | "he" = "he",
  categoryFilter: "all" | KnowledgeCategory = "all",
): Promise<UnifiedSearchResponse> {
  const q = query.trim();
  const categoryResults: Record<KnowledgeCategory, UnifiedSearchResultItem[]> = {
    quran: [],
    hadith: [],
    tafsir: [],
    topics: [],
    prophets: [],
    stories: [],
    narrators: [],
    places: [],
  };

  const categoryCounts: Record<KnowledgeCategory, number> = {
    quran: 0,
    hadith: 0,
    tafsir: 0,
    topics: 0,
    prophets: 0,
    stories: 0,
    narrators: 0,
    places: 0,
  };

  if (!q || q.length < 2) {
    return {
      query,
      totalResults: 0,
      items: [],
      categoryResults,
      categoryCounts,
    };
  }

  const qLower = q.toLowerCase();

  // Parallel execution across all categories
  await Promise.allSettled([
    // 1. QURAN
    (async () => {
      if (categoryFilter !== "all" && categoryFilter !== "quran") return;
      try {
        const index = await buildQuranIndex();
        const quranResults: SearchOutput = searchWithFallback(index, qLower, locale);
        const verseHits = quranResults.groups.flatMap((group) => group.hits);
        categoryCounts.quran = verseHits.length;

        categoryResults.quran = verseHits.slice(0, 12).map((hit) => {
          const verseText =
            locale === "ar"
              ? hit.verse.arabic
              : locale === "he"
                ? hit.verse.hebrew || hit.verse.english
                : hit.verse.english;

          let score = 50;
          if (hit.verse.arabic.includes(q) || hit.verse.english?.toLowerCase().includes(qLower)) {
            score += 30;
          }

          return {
            id: `quran-${hit.verse.surah}-${hit.verse.ayah}`,
            category: "quran" as const,
            domain: "quran" as const,
            title: `Surah ${hit.verse.surah}:${hit.verse.ayah}`,
            subtitle: hit.verse.arabic,
            snippet: verseText,
            arabicSnippet: hit.verse.arabic,
            hebrewSnippet: hit.verse.hebrew,
            englishSnippet: hit.verse.english,
            url: `/surah/${hit.verse.surah}?ayah=${hit.verse.ayah}`,
            badge: "Quran",
            relevanceScore: score,
          };
        });
      } catch (err) {
        console.error("Error searching Quran in unified search:", err);
      }
    })(),

    // 2. HADITH
    (async () => {
      if (categoryFilter !== "all" && categoryFilter !== "hadith") return;
      try {
        const hadithRes = await searchHadith({ data: { q: qLower, page: 0, pageSize: 15 } });
        if (hadithRes?.items) {
          categoryCounts.hadith = hadithRes.total ?? hadithRes.items.length;
          categoryResults.hadith = hadithRes.items.map((h) => {
            const snippet =
              locale === "ar"
                ? h.arabic_text || h.english_text || h.hebrew_text || ""
                : locale === "he"
                  ? h.hebrew_text || h.english_text || h.arabic_text || ""
                  : h.english_text || h.arabic_text || h.hebrew_text || "";

            const collection = h.collection_slug || "hadith";
            const entryNum = h.id_in_book || h.id;

            return {
              id: `hadith-${collection}-${entryNum}`,
              category: "hadith" as const,
              domain: "hadith" as const,
              title: `${collection === "bukhari" ? "Sahih al-Bukhari" : collection === "muslim" ? "Sahih Muslim" : collection} #${entryNum}`,
              subtitle: h.narrator ?? undefined,
              snippet,
              arabicSnippet: h.arabic_text,
              hebrewSnippet: h.hebrew_text,
              englishSnippet: h.english_text,
              url: `/hadith/${collection}/entry/${entryNum}`,
              badge: "Hadith",
              relevanceScore: 60,
              metadata: {
                collection,
                id_in_book: h.id_in_book,
                grade: h.grade,
                chapter: h.chapter,
              },
            };
          });
        }
      } catch (err) {
        console.error("Error searching Hadith in unified search:", err);
      }
    })(),

    // 3. TAFSIR
    (async () => {
      if (categoryFilter !== "all" && categoryFilter !== "tafsir") return;
      try {
        const hits = await searchKnowledgeTexts(qLower, 10);
        categoryCounts.tafsir = hits.length;
        categoryResults.tafsir = hits.map((hit) => {
          const url = hit.surah && hit.ayah_start ? `/tafsir/${hit.surah}/${hit.ayah_start}` : "/tafsir";

          return {
            id: `tafsir-${hit.id}`,
            category: "tafsir" as const,
            domain: "tafsir" as const,
            title: `${hit.source_name}${hit.surah ? ` (${hit.surah}:${hit.ayah_start})` : ""}`,
            snippet: hit.text.slice(0, 220),
            url,
            badge: "Tafsir",
            relevanceScore: 55,
          };
        });
      } catch (err) {
        console.error("Error searching Tafsir in unified search:", err);
      }
    })(),

    // 4. PROPHETS
    (async () => {
      if (categoryFilter !== "all" && categoryFilter !== "prophets") return;
      try {
        const prophetsList = await listEntitiesByKind("prophet");
        const matched = prophetsList
          .map((p) => {
            const { matches, score } = entityMatchesQuery(p, qLower, locale);
            return { p, matches, score };
          })
          .filter(
            (m) =>
              m.matches ||
              ALL_PROPHETS.some(
                (ap) => ap.slug === m.p.slug && (ap.nameAr.includes(qLower) || ap.nameHe.includes(qLower)),
              ),
          );

        categoryCounts.prophets = matched.length;
        categoryResults.prophets = matched.slice(0, 8).map(({ p, score }) => {
          const title = pickLocale(p.title_i18n, locale);
          const snippet = pickLocale(p.summary_i18n, locale);

          return {
            id: `prophet-${p.slug}`,
            category: "prophets" as const,
            domain: "prophets" as const,
            title,
            subtitle: p.title_i18n?.ar,
            snippet,
            arabicSnippet: p.summary_i18n?.ar,
            hebrewSnippet: p.summary_i18n?.he,
            englishSnippet: p.summary_i18n?.en,
            url: `/prophets/${p.slug}`,
            badge: "Prophet",
            relevanceScore: Math.max(score, 70),
          };
        });
      } catch (err) {
        console.error("Error searching Prophets in unified search:", err);
      }
    })(),

    // 5. TOPICS
    (async () => {
      if (categoryFilter !== "all" && categoryFilter !== "topics") return;
      try {
        const [topics, concepts, themes] = await Promise.all([
          listEntitiesByKind("topic"),
          listEntitiesByKind("concept"),
          listEntitiesByKind("theme"),
        ]);
        const allTopics = [...topics, ...concepts, ...themes];
        const matched = allTopics
          .map((t) => {
            const { matches, score } = entityMatchesQuery(t, qLower, locale);
            return { t, matches, score };
          })
          .filter((m) => m.matches);

        categoryCounts.topics = matched.length;
        categoryResults.topics = matched.slice(0, 10).map(({ t, score }) => {
          const title = pickLocale(t.title_i18n, locale);
          const snippet = pickLocale(t.summary_i18n, locale);

          return {
            id: `topic-${t.slug}`,
            category: "topics" as const,
            domain: "topics" as const,
            title,
            subtitle: t.title_i18n?.ar,
            snippet,
            arabicSnippet: t.summary_i18n?.ar,
            hebrewSnippet: t.summary_i18n?.he,
            englishSnippet: t.summary_i18n?.en,
            url: `/topics/${t.slug}`,
            badge: "Topic",
            relevanceScore: Math.max(score, 65),
          };
        });
      } catch (err) {
        console.error("Error searching Topics in unified search:", err);
      }
    })(),

    // 6. STORIES
    (async () => {
      if (categoryFilter !== "all" && categoryFilter !== "stories") return;
      try {
        const [stories, events] = await Promise.all([listEntitiesByKind("story"), listEntitiesByKind("event")]);
        const allStories = [...stories, ...events];
        const matched = allStories
          .map((s) => {
            const { matches, score } = entityMatchesQuery(s, qLower, locale);
            return { s, matches, score };
          })
          .filter((m) => m.matches);

        categoryCounts.stories = matched.length;
        categoryResults.stories = matched.slice(0, 10).map(({ s, score }) => {
          const title = pickLocale(s.title_i18n, locale);
          const snippet = pickLocale(s.summary_i18n, locale);

          return {
            id: `story-${s.slug}`,
            category: "stories" as const,
            domain: "stories" as const,
            title,
            subtitle: s.title_i18n?.ar,
            snippet,
            arabicSnippet: s.summary_i18n?.ar,
            hebrewSnippet: s.summary_i18n?.he,
            englishSnippet: s.summary_i18n?.en,
            url: `/stories/${s.slug}`,
            badge: "Story",
            relevanceScore: Math.max(score, 65),
          };
        });
      } catch (err) {
        console.error("Error searching Stories in unified search:", err);
      }
    })(),

    // 7. NARRATORS
    (async () => {
      if (categoryFilter !== "all" && categoryFilter !== "narrators") return;
      try {
        const [narrators, companions, scholars] = await Promise.all([
          listEntitiesByKind("narrator"),
          listEntitiesByKind("companion"),
          listEntitiesByKind("scholar"),
        ]);
        const allNarrators = [...narrators, ...companions, ...scholars];
        const matched = allNarrators
          .map((n) => {
            const { matches, score } = entityMatchesQuery(n, qLower, locale);
            return { n, matches, score };
          })
          .filter((m) => m.matches);

        categoryCounts.narrators = matched.length;
        categoryResults.narrators = matched.slice(0, 10).map(({ n, score }) => {
          const title = pickLocale(n.title_i18n, locale);
          const snippet = pickLocale(n.summary_i18n, locale);

          return {
            id: `narrator-${n.slug}`,
            category: "narrators" as const,
            domain: "narrators" as const,
            title,
            subtitle: n.title_i18n?.ar,
            snippet,
            arabicSnippet: n.summary_i18n?.ar,
            hebrewSnippet: n.summary_i18n?.he,
            englishSnippet: n.summary_i18n?.en,
            url: `/hadith?narrator=${n.slug}`,
            badge: "Narrator",
            relevanceScore: Math.max(score, 70),
          };
        });
      } catch (err) {
        console.error("Error searching Narrators in unified search:", err);
      }
    })(),

    // 8. PLACES
    (async () => {
      if (categoryFilter !== "all" && categoryFilter !== "places") return;
      try {
        const [places, nations] = await Promise.all([listEntitiesByKind("place"), listEntitiesByKind("nation")]);
        const allPlaces = [...places, ...nations];
        const matched = allPlaces
          .map((p) => {
            const { matches, score } = entityMatchesQuery(p, qLower, locale);
            return { p, matches, score };
          })
          .filter((m) => m.matches);

        categoryCounts.places = matched.length;
        categoryResults.places = matched.slice(0, 10).map(({ p, score }) => {
          const title = pickLocale(p.title_i18n, locale);
          const snippet = pickLocale(p.summary_i18n, locale);

          return {
            id: `place-${p.slug}`,
            category: "places" as const,
            domain: "places" as const,
            title,
            subtitle: p.title_i18n?.ar,
            snippet,
            arabicSnippet: p.summary_i18n?.ar,
            hebrewSnippet: p.summary_i18n?.he,
            englishSnippet: p.summary_i18n?.en,
            url: `/topics/${p.slug}`,
            badge: "Place",
            relevanceScore: Math.max(score, 65),
          };
        });
      } catch (err) {
        console.error("Error searching Places in unified search:", err);
      }
    })(),
  ]);

  // Combine and sort top overall results by relevance score
  const allItems: UnifiedSearchResultItem[] = Object.values(categoryResults)
    .flat()
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  const totalResults = Object.values(categoryCounts).reduce((acc, c) => acc + c, 0);

  return {
    query,
    totalResults,
    items: allItems,
    categoryResults,
    categoryCounts,
  };
}
