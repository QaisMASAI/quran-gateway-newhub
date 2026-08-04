import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import type { UnifiedSearchResultItem, RankingFactors } from "./search-unified";

const RerankSchema = z.object({
  query: z.string().min(1).max(300),
  locale: z.enum(["ar", "en", "he"]).default("he"),
  items: z
    .array(
      z.object({
        id: z.string(),
        category: z.string(),
        domain: z.string(),
        title: z.string(),
        subtitle: z.string().optional(),
        snippet: z.string(),
        url: z.string(),
        badge: z.string().optional(),
        relevanceScore: z.number(),
      }),
    )
    .max(30),
});

export interface AiRankingExplanationResponse {
  overallRankingRationale: string;
  rerankedItems: UnifiedSearchResultItem[];
  isAiRanked: boolean;
}

export const rerankSearchResultsWithAiServerFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RerankSchema.parse(input))
  .handler(async ({ data }): Promise<AiRankingExplanationResponse> => {
    const { query, locale, items } = data;

    if (!items || items.length === 0) {
      return {
        overallRankingRationale: "",
        rerankedItems: [],
        isAiRanked: false,
      };
    }

    const provider = createLovableAiGatewayProvider();
    if (!provider) {
      // Return baseline sorted items with default explanation rationale
      const fallbackRationale =
        locale === "ar"
          ? `تم ترتيب النتائج بناءً على الخوارزمية المعتمدة (التطابق الدلالي، العلاقات المفهومية، الأهمية الموضوعية، والتكرار في المصادر).`
          : locale === "he"
            ? `תוצאות החיפוש דורגו לפי האלגוריתם המרובה-ממדים (דמיון סמנטי, גרף ידע, חשיבות נושאית והפניות צולבות בקוראן ובחديת').`
            : `Results ranked using multi-dimensional scoring evaluating semantic similarity, knowledge graph depth, historical context, and cross-source citations.`;

      return {
        overallRankingRationale: fallbackRationale,
        rerankedItems: items as UnifiedSearchResultItem[],
        isAiRanked: false,
      };
    }

    const model = provider("google/gemini-2.5-flash");

    const systemPrompt = `You are an elite Islamic Knowledge Search Ranking AI.
Your task is to re-rank search results for the user query: "${query}" (Locale: ${locale}).

CRITICAL MANDATE:
You MUST rank results based on holistic evaluation of:
1. Semantic Similarity: How closely the record matches the conceptual meaning of the query.
2. Knowledge Graph Relationships: Connection depth to core Islamic topics, Prophets, scholars, or events.
3. Historical Relevance: Chronological & context relevance (Makkan/Madinan era, Asbab Nuzul, Seerah).
4. Topic Importance: Theological centrality (e.g., Aqeeda, Tawhid, Sabr, Salah > minor details).
5. Frequency across Islamic sources: Citation density across Quran, Sahih Hadith, and Tafsir.
6. Cross References: Inter-textual links between verses, hadiths, and historical commentaries.
7. User Intent: True search intent (Devotional, Legal, Historical, Analytical).

For each item, output:
- "id": item id
- "score": score from 1 to 100
- "explanation": concise 1-sentence explanation of WHY this result appears in its specific rank (e.g. "Ranked #1 due to direct Quranic foundation on Sabr with 14 Hadith cross-references").
- "rankingFactors": object with 0-100 values for:
  - "semanticSimilarity"
  - "knowledgeGraph"
  - "historicalRelevance"
  - "topicImportance"
  - "sourceFrequency"
  - "crossReferences"
  - "userIntent"

Also provide "overallRankingRationale": a 2-sentence summary explaining why top-ranked results appear first for this query.

INPUT ITEMS:
${JSON.stringify(
  items.map((it) => ({
    id: it.id,
    category: it.category,
    title: it.title,
    snippet: it.snippet.slice(0, 150),
    currentScore: it.relevanceScore,
  })),
  null,
  2,
)}

Respond ONLY with valid JSON in this exact structure:
{
  "overallRankingRationale": "...",
  "rankedItems": [
    {
      "id": "...",
      "score": 95,
      "explanation": "...",
      "rankingFactors": {
        "semanticSimilarity": 95,
        "knowledgeGraph": 90,
        "historicalRelevance": 85,
        "topicImportance": 90,
        "sourceFrequency": 92,
        "crossReferences": 88,
        "userIntent": 95
      }
    }
  ]
}`;

    try {
      const response = await generateText({
        model,
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.2,
      });

      const cleanJson = response.text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleanJson);

      const rankedMap = new Map<string, { score: number; explanation: string; factors: RankingFactors }>();
      if (Array.isArray(parsed.rankedItems)) {
        for (const item of parsed.rankedItems) {
          if (item.id) {
            rankedMap.set(item.id, {
              score: typeof item.score === "number" ? Math.min(100, Math.max(10, item.score)) : 80,
              explanation: item.explanation || "",
              factors: {
                semanticSimilarity: item.rankingFactors?.semanticSimilarity ?? 85,
                knowledgeGraph: item.rankingFactors?.knowledgeGraph ?? 80,
                historicalRelevance: item.rankingFactors?.historicalRelevance ?? 75,
                topicImportance: item.rankingFactors?.topicImportance ?? 85,
                sourceFrequency: item.rankingFactors?.sourceFrequency ?? 80,
                crossReferences: item.rankingFactors?.crossReferences ?? 75,
                userIntent: item.rankingFactors?.userIntent ?? 90,
              },
            });
          }
        }
      }

      const rerankedItems = items.map((orig) => {
        const aiData = rankedMap.get(orig.id);
        if (aiData) {
          return {
            ...orig,
            relevanceScore: aiData.score,
            rankingExplanation: aiData.explanation,
            rankingFactors: aiData.factors,
          } as UnifiedSearchResultItem;
        }
        return orig as UnifiedSearchResultItem;
      });

      rerankedItems.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return {
        overallRankingRationale:
          parsed.overallRankingRationale || "AI-optimized ranking based on multi-dimensional relevance.",
        rerankedItems,
        isAiRanked: true,
      };
    } catch (err) {
      console.error("AI re-ranking failed, returning original items:", err);
      return {
        overallRankingRationale: "Ranked via multi-factor search engine.",
        rerankedItems: items as UnifiedSearchResultItem[],
        isAiRanked: false,
      };
    }
  });
