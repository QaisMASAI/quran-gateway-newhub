import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { EntityRichMetadata } from "@/types/entity-metadata";
import { getRichMetadataForEntity, validateMetadataAgainstDb } from "./knowledge-metadata-store";

const GenerateMetadataSchema = z.object({
  entityId: z.string().optional(),
  query: z.string().min(1).max(300),
  locale: z.enum(["ar", "en", "he"]).default("he"),
});

export const generateEntityMetadataServerFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GenerateMetadataSchema.parse(input))
  .handler(
    async ({ data }): Promise<{ metadata: EntityRichMetadata; source: "ai" | "curated" }> => {
      const { entityId, query, locale } = data;

      // Check curated database first
      if (entityId) {
        const curated = getRichMetadataForEntity(entityId, query);
        if (curated && curated.primaryKeywords.length > 2) {
          return { metadata: curated, source: "curated" };
        }
      }

      const provider = createLovableAiGatewayProvider();
      if (!provider) {
        // Fallback to local heuristic metadata
        return { metadata: getRichMetadataForEntity(entityId ?? query, query), source: "curated" };
      }

      const model = provider("google/gemini-2.5-flash");

      const systemPrompt = `You are an expert Islamic Metadata Indexing AI for a comprehensive Quran & Hadith knowledge platform.
Your task is to analyze the entity or search query "${query}" (Locale: ${locale}) and generate a rich, accurate, multi-dimensional metadata JSON object.

YOU MUST strictly generate valid JSON with ALL of the following keys:
1. "primaryKeywords": array of 3-6 core keywords in Arabic, Hebrew, English.
2. "secondaryKeywords": array of 4-8 descriptive keywords.
3. "alternativeSpellings": array of common spelling variations.
4. "arabicSynonyms": array of Arabic terms & classical synonyms.
5. "hebrewSynonyms": array of Hebrew equivalents & terms.
6. "englishSynonyms": array of English equivalents & terms.
7. "transliterations": array of accurate transliterations.
8. "pluralForms": array of plural forms in AR, HE, EN.
9. "rootWords": array of root words (e.g., "س-ل-م", "ش-ر-ك").
10. "derivedWords": array of morphological derivations.
11. "relatedConcepts": array of connected Islamic theological or ethical concepts.
12. "semanticTags": array of general indexing tags.
13. "topicHierarchies": object with "parentTopics" (array) and "childTopics" (array).
14. "emotionalCategories": array of emotional states (e.g., "fear of Allah", "tranquility", "grief").
15. "jurisprudenceCategories": array of Fiqh domains (e.g., "Ibadat", "Muamalat", "Hajj").
16. "theologicalCategories": array of Aqeeda domains (e.g., "Tawhid", "Nubuwwah", "Ma'ad").
17. "ethicsCategories": array of Akhlaq domains (e.g., "Sabr", "Adl", "Ikhlas").
18. "familyCategories": array of family/social categories.
19. "historicalCategories": array of historical eras (e.g., "Makkan Era", "Madinan State").
20. "characterTraits": array of character attributes (e.g., "truthful", "patient", "resolute").
21. "virtues": array of Islamic virtues (e.g., "honesty", "hospitality", "repentance").
22. "sins": array of prohibited conduct or spiritual diseases (e.g., "arrogance", "envy", "shirk").
23. "places": array of geographical/sacred places mentioned or linked.
24. "people": array of Prophets, Companions, Scholars, or groups.
25. "events": array of historical/quranic events.

Output ONLY clean, raw JSON inside a JSON code block. Never invent fabricated verses or false facts.`;

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
        const validated = validateMetadataAgainstDb(parsed);

        return { metadata: validated, source: "ai" };
      } catch (err) {
        console.error("AI metadata generation failed, returning curated store:", err);
        return { metadata: getRichMetadataForEntity(entityId ?? query, query), source: "curated" };
      }
    },
  );
