import { searchVersesWithConcepts, type SearchOutput } from "./quran-search";
import { searchHadithAction } from "./hadith.functions";
import { searchTopics } from "./topics";
import { PROPHETS } from "./prophets";
import { pickLocale } from "./content-i18n";

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
      const quranResults: SearchOutput = await searchVersesWithConcepts(q, locale);
      if (quranResults?.hits) {
        counts.quran = quranResults.hits.length;
        if (domainFilter === "all" || domainFilter === "quran") {
          quranResults.hits.slice(0, 15).forEach((hit) => {
            const verseText =
              locale === "ar"
                ? hit.verse.text_ar
                : locale === "he"
                  ? hit.verse.text_he || hit.verse.text_en
                  : hit.verse.text_en;
            items.push({
              id: `quran-${hit.verse.surah_id}-${hit.verse.ayah_number}`,
              domain: "quran",
              title: `Surah ${hit.verse.surah_id}:${hit.verse.ayah_number}`,
              subtitle: hit.verse.text_ar,
              snippet: verseText,
              url: `/surah/${hit.verse.surah_id}?ayah=${hit.verse.ayah_number}`,
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
      const hadithRes = await searchHadithAction({ data: { query: q, locale, limit: 15 } });
      if (hadithRes?.items) {
        counts.hadith = hadithRes.items.length;
        hadithRes.items.forEach(
          (h: {
            collection?: string;
            hadith_number?: number | string;
            id?: string;
            collection_name?: string;
            grade?: string;
            narrator?: string;
            text?: string;
            english_text?: string;
            hebrew_text?: string;
          }) => {
            items.push({
              id: `hadith-${h.collection || "sys"}-${h.hadith_number || h.id}`,
              domain: "hadith",
              title: `${h.collection_name || "Hadith"} #${h.hadith_number || ""}`,
              subtitle: h.grade || h.narrator,
              snippet: h.text || h.english_text || h.hebrew_text || "",
              url: `/hadith/${h.collection}/${h.hadith_number}`,
              badge: h.collection_name || "Hadith",
            });
          },
        );
      }
    } catch {
      // Fallback
    }
  }

  // 3. Topics search
  if (domainFilter === "all" || domainFilter === "topics") {
    try {
      const matchedTopics = searchTopics(q, locale);
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
      const matchedProphets = PROPHETS.filter(
        (p) =>
          p.nameEn.toLowerCase().includes(q) ||
          p.nameAr.includes(q) ||
          p.nameHe.includes(q) ||
          p.summary.toLowerCase().includes(q),
      );
      counts.prophets = matchedProphets.length;
      matchedProphets.slice(0, 10).forEach((p) => {
        const title = locale === "ar" ? p.nameAr : locale === "he" ? p.nameHe : p.nameEn;
        items.push({
          id: `prophet-${p.slug}`,
          domain: "prophets",
          title,
          snippet: p.summary,
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
