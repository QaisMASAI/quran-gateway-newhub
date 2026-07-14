// Hadith server functions — wired to authenticated external API (Sunnah API).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import type { Database } from "@/integrations/supabase/types";
import {
  fetchHadithBookEntries,
  fetchHadithBooks,
  fetchHadithByGlobalNumber,
  fetchHadithCollections,
  fetchHadithSearch,
  fetchTopNarrators,
  normalizeHadithCollection,
} from "@/lib/hadith-api.server";

export type HadithCollection = {
  slug: string;
  title_ar: string;
  title_en: string;
  title_he: string | null;
  author_ar: string | null;
  author_en: string | null;
  total_hadith: number;
  total_books: number;
  sort_order: number;
};

export type HadithBook = {
  collection_slug: string;
  book_id: number;
  name_ar: string;
  name_en: string;
  name_he: string | null;
  hadith_count: number;
};

export type HadithTopicBook = {
  collection_slug: string;
  book_id: number;
  name_ar: string;
  name_en: string;
  name_he: string | null;
  hadith_count: number;
};

export type HadithTopic = {
  id: string;
  slug: string;
  title_i18n: { he?: string; ar?: string; en?: string };
  hadith_count: number;
  collections: string[];
};

export type HadithEntry = {
  id: number;
  collection_slug: string;
  book_id: number;
  id_in_book: number;
  global_id: number;
  narrator: string | null;
  arabic_text: string;
  english_text: string | null;
  hebrew_text: string | null;
};

type HadithEntityLite = {
  id: string;
  slug: string;
  kind: string;
  title_i18n: { he?: string; ar?: string; en?: string };
  summary_i18n: { he?: string; ar?: string; en?: string };
};

type HadithTafsirLite = {
  id: string;
  surah: number;
  ayah_start: number;
  ayah_end: number;
  lang: string;
  body: string;
  source_name: string;
};

export type HadithNarratorProfile = {
  narrator: string;
  hadith_count: number;
  collections: string[];
};

export type HadithKnowledgeBundle = {
  entry: HadithEntry;
  collection: HadithCollection | null;
  narrator: HadithNarratorProfile | null;
  relatedVerses: Array<{ surah: number; ayah: number; weight: number }>;
  relatedTafsir: HadithTafsirLite[];
  relatedTopics: HadithEntityLite[];
  relatedProphets: HadithEntityLite[];
  relatedEntities: HadithEntityLite[];
  relatedHadith: HadithEntry[];
};

export type HadithStudySummary = {
  explanation: string;
  historical_context: string;
  why_narrated: string;
  main_lessons: string;
};

export type HadithSearchResult = {
  items: HadithEntry[];
  total: number;
  hasMore: boolean;
};

function collectionLabel(slug: string) {
  return slug === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim";
}

export const listHadithCollections = createServerFn({ method: "GET" }).handler(
  async (): Promise<HadithCollection[]> => {
    const collections = await fetchHadithCollections();
    const booksByCollection = await Promise.all(
      collections.map(async (row) => {
        const books = await fetchHadithBooks(row.slug as "bukhari" | "muslim");
        return [row.slug, books.length] as const;
      }),
    );
    const map = new Map(booksByCollection);
    return collections.map((row) => ({
      ...row,
      total_books: map.get(row.slug) ?? 0,
    }));
  },
);

export const listHadithBooks = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ collection: z.string().min(1).max(40) }).parse(input),
  )
  .handler(async ({ data }): Promise<HadithBook[]> => {
    const collection = normalizeHadithCollection(data.collection);
    if (!collection) return [];
    return (await fetchHadithBooks(collection)) as HadithBook[];
  });

export const listHadithEntries = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        collection: z.string().min(1).max(40),
        book: z.number().int().min(1),
        page: z.number().int().min(0).max(500).optional().default(0),
        pageSize: z.number().int().min(1).max(100).optional().default(40),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ items: HadithEntry[]; total: number }> => {
    const collection = normalizeHadithCollection(data.collection);
    if (!collection) return { items: [], total: 0 };
    return (await fetchHadithBookEntries({
      collection,
      book: data.book,
      page: data.page,
      pageSize: data.pageSize,
    })) as { items: HadithEntry[]; total: number };
  });

export const getHadithEntry = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        collection: z.string().min(1).max(40),
        num: z.number().int().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<HadithEntry | null> => {
    const collection = normalizeHadithCollection(data.collection);
    if (!collection) return null;
    const entry = await fetchHadithByGlobalNumber({ collection, num: data.num });
    if (!entry || entry.collection_slug !== collection) return null;
    return entry as HadithEntry;
  });

export const getHadithKnowledgeBundle = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        collection: z.string().min(1).max(40),
        num: z.number().int().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<HadithKnowledgeBundle | null> => {
    const collection = normalizeHadithCollection(data.collection);
    if (!collection) return null;

    const entry = (await fetchHadithByGlobalNumber({ collection, num: data.num })) as HadithEntry | null;
    if (!entry || entry.collection_slug !== collection) return null;

    const [collections, books, relatedHadithResult] = await Promise.all([
      fetchHadithCollections(),
      fetchHadithBooks(collection),
      entry.narrator
        ? fetchHadithSearch({ q: entry.narrator, page: 0, pageSize: 8 })
        : Promise.resolve({ items: [] as HadithEntry[], total: 0, hasMore: false }),
    ]);

    const relatedHadith = relatedHadithResult.items.filter((r) => r.id !== entry.id);

    const collectionMeta = collections.find((c) => c.slug === entry.collection_slug) ?? null;

    const collectionData: HadithCollection | null = collectionMeta
      ? {
          ...collectionMeta,
          total_books: books.length,
        }
      : null;

    const narrator: HadithNarratorProfile | null = entry.narrator
      ? {
          narrator: entry.narrator,
          hadith_count: Math.max(relatedHadithResult.total, 1),
          collections: [entry.collection_slug],
        }
      : null;

    return {
      entry,
      collection: collectionData,
      narrator,
      relatedVerses: [],
      relatedTafsir: [],
      relatedTopics: [],
      relatedProphets: [],
      relatedEntities: [],
      relatedHadith,
    };
  });

export const generateHadithStudySummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        collectionLabel: z.string().min(1).max(160),
        hadithNumber: z.number().int().min(1),
        narrator: z.string().max(300).optional().nullable(),
        arabicText: z.string().min(1).max(12000),
        translationText: z.string().max(12000).optional().nullable(),
        verseRefs: z.array(z.string().min(3).max(20)).max(12).optional().default([]),
        tafsirSnippets: z.array(z.string().min(1).max(700)).max(8).optional().default([]),
        relatedHadithSnippets: z.array(z.string().min(1).max(500)).max(6).optional().default([]),
        lang: z.enum(["he", "ar", "en"]).optional().default("en"),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<HadithStudySummary | null> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return null;

    const gateway = createLovableAiGatewayProvider(apiKey);
    const system =
      data.lang === "ar"
        ? "أنت مساعد دراسي للحديث. اكتب ملخصاً تعليميًا فقط من النصوص المقدمة دون اختلاق معلومات. إذا لم توجد قرينة كافية فاذكر عدم كفاية الأدلة. أعد JSON فقط بالحقول: explanation,historical_context,why_narrated,main_lessons."
        : data.lang === "he"
          ? "אתה עוזר לימודי לחדית'. כתוב סיכום חינוכי רק מהעדויות הנתונות, בלי להמציא פרטים. אם אין די עדות, ציין שאין די ראיות. החזר JSON בלבד עם השדות: explanation,historical_context,why_narrated,main_lessons."
          : "You are a hadith study assistant. Produce educational summaries strictly from provided evidence only, with no fabrication. If evidence is insufficient, explicitly state that. Return JSON only with fields: explanation,historical_context,why_narrated,main_lessons.";

    const prompt = [
      `Collection: ${data.collectionLabel}`,
      `Hadith number in book: ${data.hadithNumber}`,
      `Narrator: ${data.narrator ?? "unknown"}`,
      `Arabic text:\n${data.arabicText}`,
      data.translationText ? `Translation:\n${data.translationText}` : "",
      data.verseRefs.length ? `Related Quran references: ${data.verseRefs.join(", ")}` : "",
      data.tafsirSnippets.length ? `Related tafsir evidence:\n- ${data.tafsirSnippets.join("\n- ")}` : "",
      data.relatedHadithSnippets.length
        ? `Related hadith snippets:\n- ${data.relatedHadithSnippets.join("\n- ")}`
        : "",
      "Return strict JSON only.",
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-2.5-flash"),
        system,
        prompt,
        temperature: 0,
        maxOutputTokens: 900,
      });

      const parsed = JSON.parse(
        text
          .trim()
          .replace(/^```(?:json)?/i, "")
          .replace(/```$/i, "")
          .trim(),
      ) as Partial<HadithStudySummary>;

      const safe = (s: unknown) => (typeof s === "string" ? s.trim().slice(0, 1200) : "");
      return {
        explanation: safe(parsed.explanation),
        historical_context: safe(parsed.historical_context),
        why_narrated: safe(parsed.why_narrated),
        main_lessons: safe(parsed.main_lessons),
      };
    } catch {
      return null;
    }
  });

export const searchHadith = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        q: z.string().min(1).max(300),
        collections: z.array(z.string()).max(5).optional(),
        page: z.number().int().min(0).max(300).optional().default(0),
        pageSize: z.number().int().min(1).max(50).optional().default(8),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<HadithSearchResult> => {
    const collections = (data.collections ?? [])
      .map(normalizeHadithCollection)
      .filter(Boolean) as Array<"bukhari" | "muslim">;
    const result = await fetchHadithSearch({
      q: data.q,
      collections,
      page: data.page,
      pageSize: data.pageSize,
    });
    return {
      items: result.items as HadithEntry[],
      total: result.total,
      hasMore: result.hasMore,
    };
  });

export const listTopNarrators = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({ limit: z.number().int().min(1).max(500).optional().default(100) })
      .parse(input ?? {}),
  )
  .handler(
    async ({
      data,
    }): Promise<Array<{ narrator: string; hadith_count: number; collections: string[] }>> => {
      return await fetchTopNarrators(data.limit);
    },
  );

export const listHadithTopicBooks = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        limitPerCollection: z.number().int().min(1).max(30).optional().default(10),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<HadithTopicBook[]> => {
    const collections = ["bukhari", "muslim"];
    const out: HadithTopicBook[] = [];

    for (const collection of collections) {
      const rows = await fetchHadithBooks(collection as "bukhari" | "muslim");
      out.push(...rows.sort((a, b) => b.hadith_count - a.hadith_count).slice(0, data.limitPerCollection));
    }

    return out.sort((a, b) => b.hadith_count - a.hadith_count);
  });

export const listHadithTopics = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        limit: z.number().int().min(1).max(60).optional().default(24),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<HadithTopic[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows } = await supabaseAdmin
      .from("knowledge_entities")
      .select("id,slug,title_i18n")
      .eq("published", true)
      .eq("kind", "topic")
      .order("sort_order", { ascending: true })
      .limit(data.limit);

    type TopicEntityRow = Pick<
      Database["public"]["Tables"]["knowledge_entities"]["Row"],
      "id" | "slug" | "title_i18n"
    >;

    const topicRows = (rows ?? []) as TopicEntityRow[];
    if (topicRows.length === 0) return [];

    const fallbackBooks = await Promise.all([fetchHadithBooks("bukhari"), fetchHadithBooks("muslim")]).then(
      (all) => all.flat().sort((a, b) => b.hadith_count - a.hadith_count),
    );

    return topicRows.map((topic, index) => {
      const fallbackCount = fallbackBooks[index]?.hadith_count ?? 0;
      const title = topic.title_i18n;
      const titleI18n =
        title && typeof title === "object" && !Array.isArray(title)
          ? {
              he: typeof title.he === "string" ? title.he : undefined,
              ar: typeof title.ar === "string" ? title.ar : undefined,
              en: typeof title.en === "string" ? title.en : undefined,
            }
          : {};
      return {
        id: topic.id,
        slug: topic.slug,
        title_i18n: titleI18n,
        hadith_count: fallbackCount,
        collections: ["bukhari", "muslim"],
      };
    });
  });
