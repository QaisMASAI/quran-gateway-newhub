// Hadith server functions — wired to authenticated external API (Sunnah API).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  SunnahApiError,
  fetchHadithBookEntries,
  fetchHadithBooks,
  fetchHadithByGlobalNumber,
  fetchHadithCollections,
  fetchHadithSearch,
  fetchTopNarrators,
  normalizeHadithCollection,
  probeSunnahApiConnection,
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

export type HadithDiagnostics = {
  apiConfigured: boolean;
  connectionOk: boolean;
  has403: boolean;
  endpoints: Array<{
    endpoint: string;
    ok: boolean;
    status: number;
    requestId: string | null;
    error: string | null;
  }>;
};

export type HadithTelemetrySnapshot = {
  totalTopicClicks24h: number;
  totalLearnNotFound24h: number;
  topicClicksBySlug: Array<{ slug: string; count: number }>;
  notFoundRatePercent: number;
  alerts: Array<{ key: string; level: "warning" | "critical"; message: string }>;
};

function collectionLabel(slug: string) {
  return slug === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim";
}

export const listHadithCollections = createServerFn({ method: "GET" }).handler(
  async (): Promise<HadithCollection[]> => {
    try {
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
    } catch (error) {
      if (error instanceof SunnahApiError) {
        console.error(
          JSON.stringify({
            type: "hadith_collections_failed",
            status: error.status,
            endpoint: error.endpoint,
            request_id: error.requestId,
          }),
        );
      }
      return [];
    }
  },
);

export const listHadithBooks = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ collection: z.string().min(1).max(40) }).parse(input),
  )
  .handler(async ({ data }): Promise<HadithBook[]> => {
    try {
      const collection = normalizeHadithCollection(data.collection);
      if (!collection) return [];
      return (await fetchHadithBooks(collection)) as HadithBook[];
    } catch (error) {
      if (error instanceof SunnahApiError) {
        console.error(
          JSON.stringify({
            type: "hadith_books_failed",
            status: error.status,
            endpoint: error.endpoint,
            request_id: error.requestId,
          }),
        );
      }
      return [];
    }
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
    try {
      const collection = normalizeHadithCollection(data.collection);
      if (!collection) return { items: [], total: 0 };
      return (await fetchHadithBookEntries({
        collection,
        book: data.book,
        page: data.page,
        pageSize: data.pageSize,
      })) as { items: HadithEntry[]; total: number };
    } catch (error) {
      if (error instanceof SunnahApiError) {
        console.error(
          JSON.stringify({
            type: "hadith_entries_failed",
            status: error.status,
            endpoint: error.endpoint,
            request_id: error.requestId,
          }),
        );
      }
      return { items: [], total: 0 };
    }
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
    try {
      const collection = normalizeHadithCollection(data.collection);
      if (!collection) return null;
      const entry = await fetchHadithByGlobalNumber({ collection, num: data.num });
      if (!entry || entry.collection_slug !== collection) return null;
      return entry as HadithEntry;
    } catch (error) {
      if (error instanceof SunnahApiError) {
        console.error(
          JSON.stringify({
            type: "hadith_entry_failed",
            status: error.status,
            endpoint: error.endpoint,
            request_id: error.requestId,
          }),
        );
      }
      return null;
    }
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
    try {
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
    } catch (error) {
      if (error instanceof SunnahApiError) {
        console.error(
          JSON.stringify({
            type: "hadith_bundle_failed",
            status: error.status,
            endpoint: error.endpoint,
            request_id: error.requestId,
          }),
        );
      }
      return null;
    }
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
    try {
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
    } catch (error) {
      if (error instanceof SunnahApiError) {
        console.error(
          JSON.stringify({
            type: "hadith_search_failed",
            status: error.status,
            endpoint: error.endpoint,
            request_id: error.requestId,
          }),
        );
      }
      return {
        items: [],
        total: 0,
        hasMore: false,
      };
    }
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
      try {
        return await fetchTopNarrators(data.limit);
      } catch {
        return [];
      }
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
    try {
      const collections = ["bukhari", "muslim"];
      const out: HadithTopicBook[] = [];

      for (const collection of collections) {
        const rows = await fetchHadithBooks(collection as "bukhari" | "muslim");
        out.push(...rows.sort((a, b) => b.hadith_count - a.hadith_count).slice(0, data.limitPerCollection));
      }

      return out.sort((a, b) => b.hadith_count - a.hadith_count);
    } catch {
      return [];
    }
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
    try {
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
    } catch {
      return [];
    }
  });

const HadithApiKeySchema = z.object({ apiKey: z.string().min(16).max(500) });

export const getHadithDiagnostics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<HadithDiagnostics> => {
    const apiConfigured = !!process.env.SUNNAH_API_KEY;
    if (!apiConfigured) {
      return {
        apiConfigured: false,
        connectionOk: false,
        has403: false,
        endpoints: [],
      };
    }
    const probe = await probeSunnahApiConnection();
    return {
      apiConfigured: true,
      connectionOk: probe.ok,
      has403: probe.has403,
      endpoints: probe.results,
    };
  });

export const testSunnahConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => HadithApiKeySchema.parse(input))
  .handler(async ({ data }): Promise<HadithDiagnostics> => {
    const key = data.apiKey.trim();
    const base = "https://api.sunnah.com/v1";
    const checks = [
      { endpoint: "collections", path: "/collections?page=1&limit=1" },
      { endpoint: "bukhari_books", path: "/collections/bukhari/books?page=1&limit=1" },
      { endpoint: "muslim_books", path: "/collections/muslim/books?page=1&limit=1" },
    ] as const;

    const endpoints: HadithDiagnostics["endpoints"] = [];
    for (const check of checks) {
      const response = await fetch(`${base}${check.path}`, {
        headers: { Accept: "application/json", "X-API-Key": key },
      }).catch(() => null);

      if (!response) {
        endpoints.push({ endpoint: check.endpoint, ok: false, status: 0, requestId: null, error: "network_error" });
        continue;
      }

      const requestId = response.headers.get("x-request-id") || response.headers.get("request-id");
      if (response.ok) {
        endpoints.push({ endpoint: check.endpoint, ok: true, status: response.status, requestId, error: null });
      } else {
        const body = await response.text().catch(() => "");
        endpoints.push({
          endpoint: check.endpoint,
          ok: false,
          status: response.status,
          requestId,
          error: body.slice(0, 160) || `http_${response.status}`,
        });
      }
    }

    return {
      apiConfigured: true,
      connectionOk: endpoints.every((e) => e.ok),
      has403: endpoints.some((e) => e.status === 403),
      endpoints,
    };
  });

export const updateSunnahApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => HadithApiKeySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const key = data.apiKey.trim();
    if (!key) throw new Error("Invalid API key");

    const fs = await import("node:fs/promises");
    const envPath = ".env";
    const existing = await fs.readFile(envPath, "utf8").catch(() => "");
    const hasEntry = /(^|\n)SUNNAH_API_KEY=/.test(existing);
    const next = hasEntry
      ? existing.replace(/(^|\n)SUNNAH_API_KEY=.*/g, `$1SUNNAH_API_KEY=${key}`)
      : `${existing}${existing.endsWith("\n") || existing.length === 0 ? "" : "\n"}SUNNAH_API_KEY=${key}\n`;
    await fs.writeFile(envPath, next, "utf8");

    return { ok: true as const };
  });

const HadithTelemetryEventSchema = z.object({
  event: z.enum(["topic_card_click", "learn_not_found"]),
  slug: z.string().min(1).max(120).optional(),
  route: z.string().min(1).max(200).optional(),
});

export const trackHadithTelemetryEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => HadithTelemetryEventSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bucketDate = new Date().toISOString().slice(0, 10);
    const key = `hadith_telemetry_${bucketDate}`;
    const { data: current } = await supabaseAdmin
      .from("admin_runtime_settings")
      .select("value_json")
      .eq("key", key)
      .maybeSingle();

    const value = (current?.value_json ?? {
      topic_card_click: 0,
      learn_not_found: 0,
      topic_clicks_by_slug: {},
      routes_not_found: {},
    }) as {
      topic_card_click?: number;
      learn_not_found?: number;
      topic_clicks_by_slug?: Record<string, number>;
      routes_not_found?: Record<string, number>;
    };

    if (data.event === "topic_card_click") {
      value.topic_card_click = (value.topic_card_click ?? 0) + 1;
      const slug = data.slug ?? "unknown";
      value.topic_clicks_by_slug = value.topic_clicks_by_slug ?? {};
      value.topic_clicks_by_slug[slug] = (value.topic_clicks_by_slug[slug] ?? 0) + 1;
    }
    if (data.event === "learn_not_found") {
      value.learn_not_found = (value.learn_not_found ?? 0) + 1;
      const route = data.route ?? "unknown";
      value.routes_not_found = value.routes_not_found ?? {};
      value.routes_not_found[route] = (value.routes_not_found[route] ?? 0) + 1;
    }

    await supabaseAdmin.from("admin_runtime_settings").upsert(
      {
        key,
        value_json: value as never,
      },
      { onConflict: "key" },
    );
    return { ok: true as const };
  });

export const getHadithTelemetrySnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<HadithTelemetrySnapshot> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bucketDate = new Date().toISOString().slice(0, 10);
    const key = `hadith_telemetry_${bucketDate}`;
    const { data: current } = await supabaseAdmin
      .from("admin_runtime_settings")
      .select("value_json")
      .eq("key", key)
      .maybeSingle();

    const value = (current?.value_json ?? {}) as {
      topic_card_click?: number;
      learn_not_found?: number;
      topic_clicks_by_slug?: Record<string, number>;
    };

    const totalTopicClicks24h = value.topic_card_click ?? 0;
    const totalLearnNotFound24h = value.learn_not_found ?? 0;
    const notFoundRatePercent = totalTopicClicks24h
      ? Math.round((totalLearnNotFound24h / totalTopicClicks24h) * 1000) / 10
      : 0;

    const alerts: HadithTelemetrySnapshot["alerts"] = [];
    if (totalLearnNotFound24h >= 10 || notFoundRatePercent >= 10) {
      alerts.push({
        key: "learn_404_spike",
        level: totalLearnNotFound24h >= 30 || notFoundRatePercent >= 25 ? "critical" : "warning",
        message: `Learn-route not-found elevated: ${totalLearnNotFound24h} in 24h (${notFoundRatePercent}%).`,
      });
    }
    if (totalTopicClicks24h >= 150) {
      alerts.push({
        key: "topic_click_volume_spike",
        level: totalTopicClicks24h >= 300 ? "critical" : "warning",
        message: `Hadith topic click volume is high: ${totalTopicClicks24h} in 24h.`,
      });
    }

    return {
      totalTopicClicks24h,
      totalLearnNotFound24h,
      topicClicksBySlug: Object.entries(value.topic_clicks_by_slug ?? {})
        .map(([slug, count]) => ({ slug, count: Number(count) || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12),
      notFoundRatePercent,
      alerts,
    };
  });
