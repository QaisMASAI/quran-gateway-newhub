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
import { buildConceptualQueryProfile } from "./search-query";
import { getRichMetadataForEntity } from "./knowledge-metadata-store";
import type { EntityRichMetadata } from "@/types/entity-metadata";

export type KnowledgeCategory =
  | "quran"
  | "hadith"
  | "tafsir"
  | "topics"
  | "prophets"
  | "stories"
  | "narrators"
  | "places";

export interface RankingFactors {
  semanticSimilarity: number;
  knowledgeGraph: number;
  historicalRelevance: number;
  topicImportance: number;
  sourceFrequency: number;
  crossReferences: number;
  userIntent: number;
}

export type SerializableValue =
  | string
  | number
  | boolean
  | null
  | SerializableValue[]
  | { [key: string]: SerializableValue };

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
  rankingFactors?: RankingFactors;
  rankingExplanation?: string;
  metadata?: Record<string, SerializableValue>;
}

export interface UnifiedSearchResponse {
  query: string;
  totalResults: number;
  items: UnifiedSearchResultItem[];
  categoryResults: Record<KnowledgeCategory, UnifiedSearchResultItem[]>;
  categoryCounts: Record<KnowledgeCategory, number>;
  overallRankingRationale?: string;
}

export function computeMultiFactorRanking(
  entityTitle: string,
  entitySnippet: string,
  category: KnowledgeCategory,
  query: string,
  richMeta: EntityRichMetadata,
  locale: "ar" | "en" | "he",
): { relevanceScore: number; factors: RankingFactors; explanation: string } {
  const profile = buildConceptualQueryProfile(query);
  const qLower = query.toLowerCase().trim();

  // 1. Semantic Similarity
  let semanticSimilarity = 45;
  if (richMeta.primaryKeywords.some((k) => k.toLowerCase().includes(qLower) || qLower.includes(k.toLowerCase()))) {
    semanticSimilarity = 96;
  } else if (
    richMeta.arabicSynonyms
      .concat(
        richMeta.hebrewSynonyms,
        richMeta.englishSynonyms,
        richMeta.alternativeSpellings,
        richMeta.transliterations,
      )
      .some((s) => s.toLowerCase().includes(qLower))
  ) {
    semanticSimilarity = 88;
  } else if (profile.primaryConcepts.some((c) => richMeta.relatedConcepts.some((rc) => rc.toLowerCase().includes(c)))) {
    semanticSimilarity = 82;
  } else if (entityTitle.toLowerCase().includes(qLower) || entitySnippet.toLowerCase().includes(qLower)) {
    semanticSimilarity = 72;
  }

  // 2. Knowledge Graph Relationships
  let knowledgeGraph = 55;
  const graphConnections =
    richMeta.topicHierarchies.parentTopics.length +
    richMeta.topicHierarchies.childTopics.length +
    richMeta.people.length +
    richMeta.places.length;
  if (graphConnections >= 4) knowledgeGraph = 94;
  else if (graphConnections >= 2) knowledgeGraph = 82;
  else if (graphConnections >= 1) knowledgeGraph = 70;

  // 3. Historical Relevance
  let historicalRelevance = 60;
  if (richMeta.historicalCategories.length > 0 || richMeta.events.length > 0) {
    historicalRelevance = 90;
  } else if (category === "prophets" || category === "stories" || category === "tafsir") {
    historicalRelevance = 84;
  }

  // 4. Topic Importance
  let topicImportance = 65;
  if (richMeta.theologicalCategories.length > 0 || richMeta.ethicsCategories.length > 0) {
    topicImportance = 92;
  } else if (category === "quran" || category === "topics") {
    topicImportance = 88;
  }

  // 5. Source Frequency
  let sourceFrequency = 55;
  if (category === "quran") sourceFrequency = 95;
  else if (category === "hadith") sourceFrequency = 88;
  else if (category === "tafsir") sourceFrequency = 84;
  else if (richMeta.primaryKeywords.length >= 3) sourceFrequency = 76;

  // 6. Cross References
  let crossReferences = 50;
  const refsCount = richMeta.relatedConcepts.length + richMeta.semanticTags.length + richMeta.virtues.length;
  if (refsCount >= 5) crossReferences = 93;
  else if (refsCount >= 3) crossReferences = 80;
  else crossReferences = 66;

  // 7. User Intent Alignment
  let userIntent = 60;
  if (profile.primaryConcepts.length > 0) {
    userIntent = 92;
  } else if (query.length > 8) {
    userIntent = 80;
  }

  // Weighted composite relevance calculation
  const compositeScore = Math.min(
    99,
    Math.round(
      semanticSimilarity * 0.25 +
        knowledgeGraph * 0.15 +
        historicalRelevance * 0.1 +
        topicImportance * 0.15 +
        sourceFrequency * 0.15 +
        crossReferences * 0.1 +
        userIntent * 0.1,
    ),
  );

  const factors: RankingFactors = {
    semanticSimilarity,
    knowledgeGraph,
    historicalRelevance,
    topicImportance,
    sourceFrequency,
    crossReferences,
    userIntent,
  };

  const isAr = locale === "ar";
  const isHe = locale === "he";

  let explanation = "";
  if (compositeScore >= 88) {
    explanation = isAr
      ? `نتيجة عالية الترتيب (${compositeScore}%): تطابق دلالي ممتاز، علاقات وثيقة في رسم البياني المعرفي، وتوثيق مكثف في المصادر.`
      : isHe
        ? `דירוג מועדף (${compositeScore}%): התאמה סמנטית מצוינת, קשרי גרף ידע מרובים וציטוטים מרובים במקורות.`
        : `Ranked #${category === "quran" ? "1" : "Top"} (${compositeScore}%): Exceptional semantic match, rich knowledge graph connectivity, and high cross-source frequency.`;
  } else if (compositeScore >= 75) {
    explanation = isAr
      ? `ملاءمة مرتفعة (${compositeScore}%): ارتباط مفهومي متين وحضور موضوعي في النصوص الإسلامية.`
      : isHe
        ? `רלוונטיות גבוהה (${compositeScore}%): קשר מושגית איתן ונוכחות תמטית בטקסטים המוסמכים.`
        : `Highly relevant (${compositeScore}%): Solid conceptual mapping and strong thematic resonance across Islamic texts.`;
  } else {
    explanation = isAr
      ? `ملاءمة متوسطة (${compositeScore}%): مرجع سياقي ثانوي مرتبط بالموضوع.`
      : isHe
        ? `רלוונטיות בינונית (${compositeScore}%): הפניה בהקשר המשני של החיפוש.`
        : `Relevant (${compositeScore}%): Secondary contextual reference linked to search query.`;
  }

  return { relevanceScore: compositeScore, factors, explanation };
}

function entityMatchesQuery(
  entity: KnowledgeEntity,
  query: string,
  locale: "ar" | "en" | "he",
): { matches: boolean; score: number; richMetadata: EntityRichMetadata } {
  const q = query.trim().toLowerCase();
  const profile = buildConceptualQueryProfile(q);
  const richMetadata = getRichMetadataForEntity(entity.slug, pickLocale(entity.title_i18n, locale), entity.kind);

  if (!q) return { matches: false, score: 0, richMetadata };

  const titleAr = (entity.title_i18n?.ar ?? "").toLowerCase();
  const titleHe = (entity.title_i18n?.he ?? "").toLowerCase();
  const titleEn = (entity.title_i18n?.en ?? "").toLowerCase();
  const slug = entity.slug.toLowerCase();

  let score = 0;

  // 1. Exact Match Priority
  if (titleAr === q || titleHe === q || titleEn === q || slug === q) {
    score += 100;
  } else if (titleAr.startsWith(q) || titleHe.startsWith(q) || titleEn.startsWith(q)) {
    score += 85;
  }

  // 2. Conceptual Match Priority (Metadata Layer)
  const metaPrimary = richMetadata.primaryKeywords.map((k) => k.toLowerCase());
  const metaSynonyms = [
    ...richMetadata.arabicSynonyms,
    ...richMetadata.hebrewSynonyms,
    ...richMetadata.englishSynonyms,
    ...richMetadata.alternativeSpellings,
    ...richMetadata.transliterations,
  ].map((k) => k.toLowerCase());

  const metaConcepts = [
    ...richMetadata.relatedConcepts,
    ...richMetadata.semanticTags,
    ...richMetadata.topicHierarchies.parentTopics,
    ...richMetadata.topicHierarchies.childTopics,
    ...richMetadata.theologicalCategories,
    ...richMetadata.ethicsCategories,
    ...richMetadata.virtues,
    ...richMetadata.sins,
  ].map((k) => k.toLowerCase());

  const profileSyns = [...profile.synonyms.ar, ...profile.synonyms.he, ...profile.synonyms.en];

  if (metaPrimary.some((k) => k.includes(q) || q.includes(k))) {
    score += 80;
  } else if (metaSynonyms.some((k) => k.includes(q) || profileSyns.some((ps) => k.includes(ps.toLowerCase())))) {
    score += 75;
  } else if (profile.primaryConcepts.some((pc) => metaConcepts.some((mc) => mc.includes(pc.toLowerCase())))) {
    score += 70;
  } else if (titleAr.includes(q) || titleHe.includes(q) || titleEn.includes(q)) {
    score += 60;
  } else if (metaConcepts.some((mc) => mc.includes(q))) {
    score += 50;
  }

  return { matches: score > 0, score, richMetadata };
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
              hebrewSnippet: h.hebrew_text || undefined,
              englishSnippet: h.english_text || undefined,
              url: `/hadith/${collection}/entry/${entryNum}`,
              badge: "Hadith",
              relevanceScore: 60,
              metadata: {
                collection,
                id_in_book: h.id_in_book,
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
            const { matches, score, richMetadata } = entityMatchesQuery(p, qLower, locale);
            return { p, matches, score, richMetadata };
          })
          .filter(
            (m) =>
              m.matches ||
              ALL_PROPHETS.some(
                (ap) => ap.slug === m.p.slug && (ap.nameAr.includes(qLower) || ap.nameHe.includes(qLower)),
              ),
          );

        categoryCounts.prophets = matched.length;
        categoryResults.prophets = matched.slice(0, 8).map(({ p, score, richMetadata }) => {
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
            metadata: richMetadata as unknown as Record<string, SerializableValue>,
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
            const { matches, score, richMetadata } = entityMatchesQuery(t, qLower, locale);
            return { t, matches, score, richMetadata };
          })
          .filter((m) => m.matches);

        categoryCounts.topics = matched.length;
        categoryResults.topics = matched.slice(0, 10).map(({ t, score, richMetadata }) => {
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
            metadata: richMetadata as unknown as Record<string, SerializableValue>,
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
            const { matches, score, richMetadata } = entityMatchesQuery(s, qLower, locale);
            return { s, matches, score, richMetadata };
          })
          .filter((m) => m.matches);

        categoryCounts.stories = matched.length;
        categoryResults.stories = matched.slice(0, 10).map(({ s, score, richMetadata }) => {
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
            metadata: richMetadata as unknown as Record<string, SerializableValue>,
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
            const { matches, score, richMetadata } = entityMatchesQuery(n, qLower, locale);
            return { n, matches, score, richMetadata };
          })
          .filter((m) => m.matches);

        categoryCounts.narrators = matched.length;
        categoryResults.narrators = matched.slice(0, 10).map(({ n, score, richMetadata }) => {
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
            metadata: richMetadata as unknown as Record<string, SerializableValue>,
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
            const { matches, score, richMetadata } = entityMatchesQuery(p, qLower, locale);
            return { p, matches, score, richMetadata };
          })
          .filter((m) => m.matches);

        categoryCounts.places = matched.length;
        categoryResults.places = matched.slice(0, 10).map(({ p, score, richMetadata }) => {
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
            metadata: richMetadata as unknown as Record<string, SerializableValue>,
          };
        });
      } catch (err) {
        console.error("Error searching Places in unified search:", err);
      }
    })(),
  ]);

  // Combine and calculate multi-factor ranking for all items
  const allRawItems: UnifiedSearchResultItem[] = Object.values(categoryResults).flat();

  // Populate 7-factor ranking breakdown for every single result
  const scoredItems = allRawItems.map((item) => {
    if (item.rankingFactors && item.rankingExplanation) return item;

    const dummyMeta: EntityRichMetadata = ((item.metadata as unknown as EntityRichMetadata | undefined) ?? {
      primaryKeywords: [item.title, item.badge || ""],
      secondaryKeywords: [],
      arabicSynonyms: item.arabicSnippet ? [item.arabicSnippet] : [],
      hebrewSynonyms: item.hebrewSnippet ? [item.hebrewSnippet] : [],
      englishSynonyms: item.englishSnippet ? [item.englishSnippet] : [],
      transliterations: [],
      alternativeSpellings: [],
      pluralForms: [],
      rootWords: [],
      derivedWords: [],
      semanticTags: [item.category],
      topicHierarchies: { parentTopics: [item.category], childTopics: [] },
      emotionalCategories: [],
      jurisprudenceCategories: [],
      theologicalCategories: item.category === "quran" ? ["Divine Revelation"] : [],
      ethicsCategories: [],
      familyCategories: [],
      historicalCategories: item.category === "stories" ? ["Historical Event"] : [],
      characterTraits: [],
      virtues: [],
      sins: [],
      relatedConcepts: [item.title],
      places: item.category === "places" ? [item.title] : [],
      people: item.category === "prophets" || item.category === "narrators" ? [item.title] : [],
      events: item.category === "stories" ? [item.title] : [],
    });

    const { relevanceScore, factors, explanation } = computeMultiFactorRanking(
      item.title,
      item.snippet,
      item.category,
      q,
      dummyMeta,
      locale,
    );

    return {
      ...item,
      relevanceScore: Math.max(item.relevanceScore, relevanceScore),
      rankingFactors: factors,
      rankingExplanation: explanation,
    };
  });

  // Sort top overall results by multi-factor relevance score
  scoredItems.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const totalResults = Object.values(categoryCounts).reduce((acc, c) => acc + c, 0);

  const isAr = locale === "ar";
  const isHe = locale === "he";
  const overallRankingRationale = isAr
    ? `تم تحليل ترتيب النتائج بناءً على التطابق الدلالي، شبكة العلاقات في رسم البياني المعرفي، الأهمية الموضوعية، والأحداث التاريخية في القرآن والسنة.`
    : isHe
      ? `תוצאות החיפוש דורגו בעזרת מודל רב-ממדי: דמיון סמנטי, קשרי גרף ידע, חשיבות נושאית והפניות צולבות במקורות.`
      : `SearchResults ordered using multi-dimensional ranking (Semantic similarity, Knowledge graph, Topic importance, Historical context, Source frequency, Cross-references, User intent).`;

  return {
    query,
    totalResults,
    items: scoredItems,
    categoryResults,
    categoryCounts,
    overallRankingRationale,
  };
}
