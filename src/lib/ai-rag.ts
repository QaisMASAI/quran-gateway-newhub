import { buildQuranIndex } from "./quran-api";
import { searchWithFallback } from "./quran-search";
import { listEntitiesByKind, pickLocale, type KnowledgeEntity } from "./knowledge";

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

function topicMatchesQuery(
  topic: KnowledgeEntity,
  query: string,
  locale: "ar" | "en" | "he",
): boolean {
  const q = query.toLowerCase();
  const localizedTitle = pickLocale(topic.title_i18n, locale).toLowerCase();
  const localizedSummary = pickLocale(topic.summary_i18n, locale).toLowerCase();
  const allTitles =
    `${topic.title_i18n.en ?? ""} ${topic.title_i18n.ar ?? ""} ${topic.title_i18n.he ?? ""}`.toLowerCase();
  const allSummaries =
    `${topic.summary_i18n.en ?? ""} ${topic.summary_i18n.ar ?? ""} ${topic.summary_i18n.he ?? ""}`.toLowerCase();

  return (
    localizedTitle.includes(q) ||
    localizedSummary.includes(q) ||
    allTitles.includes(q) ||
    allSummaries.includes(q)
  );
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
    const index = await buildQuranIndex();
    const quranResults = searchWithFallback(index, q, locale);
    const verseHits = quranResults.groups.flatMap((group) => group.hits);

    if (verseHits.length > 0) {
      verseHits.slice(0, 4).forEach((hit) => {
        const text =
          locale === "ar"
            ? hit.verse.arabic
            : locale === "he"
              ? `${hit.verse.hebrew || hit.verse.english} (Arabic: ${hit.verse.arabic})`
              : `${hit.verse.english} (Arabic: ${hit.verse.arabic})`;
        chunks.push({
          source: "quran",
          reference: `Surah ${hit.verse.surah}:${hit.verse.ayah}`,
          text,
        });
      });
    }
  } catch {
    // Silent catch
  }

  // 3. Fetch matching topics
  try {
    const topics = await listEntitiesByKind("topic");
    const matchedTopics = topics.filter((topic) => topicMatchesQuery(topic, q, locale));
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

  const systemContextPrompt = `The following authenticated Islamic knowledge chunks were retrieved for query "${q}":\n\n${contextFormatted}`;

  return {
    query,
    chunks,
    systemContextPrompt,
  };
}
