import { searchVersesWithConcepts } from "./quran-search";
import { searchHadithAction } from "./hadith.functions";
import { searchTopics } from "./topics";
import { pickLocale } from "./content-i18n";

export interface RagContextChunk {
  source: "quran" | "hadith" | "tafsir" | "topic";
  reference: string;
  text: string;
  score?: number;
}

export interface RagContextResult {
  query: string;
  chunks: RagContextChunk[];
  systemContextPrompt: string;
}

export async function buildRagContext(
  query: string,
  locale: "ar" | "en" | "he" = "en",
): Promise<RagContextResult> {
  const chunks: RagContextChunk[] = [];
  const q = query.trim();

  if (!q) {
    return {
      query,
      chunks: [],
      systemContextPrompt: "No search context available.",
    };
  }

  // 1. Fetch relevant Quranic verses
  try {
    const quranHits = await searchVersesWithConcepts(q, locale);
    if (quranHits?.hits) {
      quranHits.hits.slice(0, 4).forEach((hit) => {
        const text =
          locale === "ar"
            ? hit.verse.text_ar
            : locale === "he"
              ? `${hit.verse.text_he || hit.verse.text_en} (Arabic: ${hit.verse.text_ar})`
              : `${hit.verse.text_en} (Arabic: ${hit.verse.text_ar})`;
        chunks.push({
          source: "quran",
          reference: `Surah ${hit.verse.surah_id}:${hit.verse.ayah_number}`,
          text,
        });
      });
    }
  } catch {
    // Silent catch
  }

  // 2. Fetch relevant Hadith entries
  try {
    const hadithHits = await searchHadithAction({ data: { query: q, locale, limit: 3 } });
    if (hadithHits?.items) {
      hadithHits.items
        .slice(0, 3)
        .forEach(
          (h: {
            collection_name?: string;
            hadith_number?: string | number;
            id?: string;
            text?: string;
            english_text?: string;
            hebrew_text?: string;
          }) => {
            const text = h.text || h.english_text || h.hebrew_text || "";
            chunks.push({
              source: "hadith",
              reference: `${h.collection_name || "Hadith"} #${h.hadith_number || h.id}`,
              text,
            });
          },
        );
    }
  } catch {
    // Silent catch
  }

  // 3. Fetch matching topics
  try {
    const matchedTopics = searchTopics(q, locale);
    if (matchedTopics.length > 0) {
      const topTopic = matchedTopics[0];
      chunks.push({
        source: "topic",
        reference: `Topic: ${pickLocale(topTopic.title_i18n, locale)}`,
        text: pickLocale(topTopic.summary_i18n, locale),
      });
    }
  } catch {
    // Silent catch
  }

  const contextFormatted = chunks
    .map(
      (c, i) => `[Context Item ${i + 1} - ${c.source.toUpperCase()} - ${c.reference}]\n${c.text}`,
    )
    .join("\n\n");

  const systemContextPrompt = `The following authenticated authentic Islamic knowledge chunks were retrieved for query "${q}":\n\n${contextFormatted}`;

  return {
    query,
    chunks,
    systemContextPrompt,
  };
}
