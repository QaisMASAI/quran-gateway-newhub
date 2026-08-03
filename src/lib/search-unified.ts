import { buildQuranIndex, type SearchOutput } from "./quran-api";
import { searchWithFallback } from "./quran-search";
import { searchHadith } from "./hadith.functions";
import { listEntitiesByKind, pickLocale, type KnowledgeEntity } from "./knowledge";
import { ALL_PROPHETS } from "./prophets";

export interface UnifiedSearchResultItem {
  id: string;
  domain: "quran" | "hadith" | "tafsir" | "topics" | "prophets";
  title: string;
  subtitle?: string;
  snippet: string;
  url: string;
  badge?: string;
  relevanceScore?: number;
}

export interface UnifiedSearchResponse {
  query: string;
  totalResults: number;
  items: UnifiedSearchResultItem[];
  domainCounts: {
    quran: number;
    hadith: number;
    tafsir: number;
    topics: number;
    prophets: number;
  };
}

function topicMatchesQuery(topic: KnowledgeEntity, query: string, locale: "ar" | "en" | "he"): boolean {
  const localizedTitle = pickLocale(topic.title_i18n, locale).toLowerCase();
  const localizedSummary = pickLocale(topic.summary_i18n, locale).toLowerCase();
  const allTitles = `${topic.title_i18n.en ?? ""} ${topic.title_i18n.ar ?? ""} ${topic.title_i18n.he ?? ""}`.toLowerCase();
  const allSummaries = `${topic.summary_i18n.en ?? ""} ${topic.summary_i18n.ar ?? ""} ${topic.summary_i18n.he ?? ""}`.toLowerCase();
  return (
    localizedTitle.includes(query) ||
    localizedSummary.includes(query) ||
    allTitles.includes(query) ||
    allSummaries.includes(query)
  );
}

export async function performUnifiedSearch(
  query: string,
  locale: "ar" | "en" | "he" = "en",
  domainFilter: "all" | "quran" | "hadith" | "tafsir" | "topics" | "prophets" = "all",
): Promise<UnifiedSearchResponse> {
  const items: UnifiedSearchResultItem[] = [];
  const counts = { quran: 0, hadith: 0, tafsir: 0, topics: 0, prophets: 0 };

  const q = query.trim().toLowerCase();
  if (!q) {
    return { query, totalResults: 0, items, domainCounts: counts };
  }

  // 1. Quran & Tafsir search (if applicable)
  if (domainFilter === "all" || domainFilter === "quran" || domainFilter === "tafsir") {
    try {
      const index = await buildQuranIndex();
      const quranResults: SearchOutput = searchWithFallback(index, q, locale);
      const verseHits = quranResults.groups.flatMap((group) => group.hits);

      if (verseHits.length > 0) {
        counts.quran = verseHits.length;
        if (domainFilter === "all" || domainFilter === "quran") {
          verseHits.slice(0, 15).forEach((hit) => {
            const verseText =
              locale === "ar"
                ? hit.verse.arabic
                : locale === "he"
                  ? hit.verse.hebrew || hit.verse.english
                  : hit.verse.english;
            items.push({
              id: `quran-${hit.verse.surah}-${hit.verse.ayah}`,
              domain: "quran",
              title: `Surah ${hit.verse.surah}:${hit.verse.ayah}`,
              subtitle: hit.verse.arabic,
              snippet: verseText,
              url: `/surah/${hit.verse.surah}?ayah=${hit.verse.ayah}`,
              badge: "Quran",
            });
          });
        }
      }
    } catch {
      // Fallback silent handle
    }
  }

  // 2. Hadith search (if applicable)
  if (domainFilter === "all" || domainFilter === "hadith") {
    try {
      const hadithRes = await searchHadith({ data: { q, page: 0, pageSize: 15 } });
      if (hadithRes?.items) {
        counts.hadith = hadithRes.items.length;
        hadithRes.items.forEach((h) => {
          const snippet =
            locale === "ar"
              ? h.arabic_text || h.english_text || h.hebrew_text || ""
              : locale === "he"
                ? h.hebrew_text || h.english_text || h.arabic_text || ""
                : h.english_text || h.arabic_text || h.hebrew_text || "";

          const collection = h.collection_slug || "hadith";
          const entryNum = h.id_in_book || h.id;

          items.push({
            id: `hadith-${collection}-${entryNum}`,
            domain: "hadith",
            title: `${collection} #${entryNum}`,
            subtitle: h.narrator ?? undefined,
            snippet,
            url: `/hadith/${collection}/entry/${entryNum}`,
            badge: "Hadith",
          });
        });
      }
    } catch {
      // Fallback
    }
  }

  // 3. Topics search
  if (domainFilter === "all" || domainFilter === "topics") {
    try {
      const topics = await listEntitiesByKind("topic");
      const matchedTopics = topics.filter((t) => topicMatchesQuery(t, q, locale));
      counts.topics = matchedTopics.length;
      matchedTopics.slice(0, 10).forEach((t) => {
        items.push({
          id: `topic-${t.slug}`,
          domain: "topics",
          title: pickLocale(t.title_i18n, locale),
          snippet: pickLocale(t.summary_i18n, locale),
          url: `/topics/${t.slug}`,
          badge: "Topic",
        });
      });
    } catch {
      // Fallback
    }
  }

  // 4. Prophets search
  if (domainFilter === "all" || domainFilter === "prophets") {
    try {
      const matchedProphets = ALL_PROPHETS.filter(
        (p) =>
          p.slug.toLowerCase().includes(q) ||
          p.nameAr.includes(q) ||
          p.nameHe.includes(q) ||
          p.nameHeAlt?.includes(q) === true,
      );
      counts.prophets = matchedProphets.length;
      matchedProphets.slice(0, 10).forEach((p) => {
        const title = locale === "ar" ? p.nameAr : p.nameHe;
        const snippet = `Referenced in ${p.refs.length} Quran passage${p.refs.length === 1 ? "" : "s"}`;
        items.push({
          id: `prophet-${p.slug}`,
          domain: "prophets",
          title,
          snippet,
          url: `/prophets/${p.slug}`,
          badge: "Prophet",
        });
      });
    } catch {
      // Fallback
    }
  }

  return {
    query,
    totalResults: items.length,
    items,
    domainCounts: counts,
  };
}
