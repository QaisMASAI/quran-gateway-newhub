// Hadith server functions — local DB first, provider-backed import only.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import type { Database, Json } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { probeHadithProviders, runWithProviderFallback } from "@/lib/hadith-providers.server";
import { runHadithImportStep, type HadithImportReport } from "@/lib/hadith-ingest.server";

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
  arabic_translation: string | null;
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
  relatedAsbab: Array<{
    id: string;
    surah: number;
    ayah_start: number;
    ayah_end: number;
    lang: string;
    body: string;
  }>;
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
  citations?: string[];
};

export type HadithSearchResult = {
  items: HadithEntry[];
  total: number;
  hasMore: boolean;
};

type HadithAsbabLite = {
  id: string;
  surah: number;
  ayah_start: number;
  ayah_end: number;
  lang: string;
  body: string;
};

export type HadithAdminDashboard = {
  imports: Array<{
    id: string;
    job_name: string;
    status: Database["public"]["Enums"]["knowledge_job_status"];
    checkpoint: Json;
    stats: Json;
    failed_batches: Json;
    error_message: string | null;
    created_at: string;
    updated_at: string;
    started_at: string | null;
    finished_at: string | null;
  }>;
  embeddings: {
    total: number;
    embedded: number;
    pending: number;
    latestEmbeddedAt: string | null;
  };
};

function coerceI18n(value: unknown): { he?: string; ar?: string; en?: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const v = value as Record<string, unknown>;
  return {
    he: typeof v.he === "string" ? v.he : undefined,
    ar: typeof v.ar === "string" ? v.ar : undefined,
    en: typeof v.en === "string" ? v.en : undefined,
  };
}

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
  const map: Record<string, string> = {
    bukhari: "Sahih al-Bukhari",
    muslim: "Sahih Muslim",
    abudawud: "Sunan Abu Dawud",
    tirmidhi: "Jami at-Tirmidhi",
    ibnmajah: "Sunan Ibn Majah",
    nasai: "Sunan an-Nasa'i",
    malik: "Muwatta Malik",
  };
  return map[slug] ?? slug;
}

function normalizeHadithCollection(collection: string): string | null {
  const value = collection
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  if (!value) return null;
  return value;
}

type HadithEntryRow = Database["public"]["Tables"]["hadith_entries"]["Row"];

function mapEntryRow(row: HadithEntryRow): HadithEntry {
  return {
    id: row.id,
    collection_slug: row.collection_slug,
    book_id: row.book_id,
    id_in_book: row.id_in_book,
    global_id: row.global_id,
    narrator: row.narrator,
    arabic_text: row.arabic_text,
    english_text: row.english_text,
    hebrew_text: row.hebrew_text,
    arabic_translation: null,
  };
}

export const listHadithCollections = createServerFn({ method: "GET" }).handler(
  async (): Promise<HadithCollection[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("hadith_collections")
      .select("slug,title_ar,title_en,title_he,author_ar,author_en,total_hadith,total_books,sort_order")
      .order("sort_order", { ascending: true })
      .order("slug", { ascending: true });
    if (error || !data) {
      console.error("hadith_collections_read_failed", error?.message ?? "unknown_error");
      return [];
    }
    return data;
  },
);

export const listHadithBooks = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ collection: z.string().min(1).max(40) }).parse(input))
  .handler(async ({ data }): Promise<HadithBook[]> => {
    const collection = normalizeHadithCollection(data.collection);
    if (!collection) return [];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("hadith_books")
      .select("collection_slug,book_id,name_ar,name_en,name_he,hadith_count")
      .eq("collection_slug", collection)
      .order("book_id", { ascending: true });
    if (!error && rows && rows.length > 0) {
      return rows;
    }
    try {
      const { value } = await runWithProviderFallback((p) => p.listBooks(collection));
      if (value && value.length > 0) return value;
    } catch (e) {
      console.warn("hadith_books_provider_fallback_failed", e);
    }
    return rows ?? [];
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const from = data.page * data.pageSize;
    const to = from + data.pageSize - 1;

    const {
      data: rows,
      error,
      count,
    } = await supabaseAdmin
      .from("hadith_entries")
      .select("id,collection_slug,book_id,id_in_book,global_id,narrator,arabic_text,english_text,hebrew_text", {
        count: "exact",
      })
      .eq("collection_slug", collection)
      .eq("book_id", data.book)
      .order("id_in_book", { ascending: true })
      .range(from, to);

    if (!error && rows && rows.length > 0) {
      return {
        items: rows.map((row) => mapEntryRow(row as HadithEntryRow)),
        total: count ?? rows.length,
      };
    }

    try {
      const { value } = await runWithProviderFallback((p) =>
        p.listBookEntries({
          collection,
          book: data.book,
          page: data.page,
          pageSize: data.pageSize,
        }),
      );
      if (value && value.items.length > 0) {
        return {
          items: value.items.map((i) => ({
            id: i.global_id || i.id_in_book,
            collection_slug: i.collection_slug,
            book_id: i.book_id,
            id_in_book: i.id_in_book,
            global_id: i.global_id || i.id_in_book,
            narrator: i.narrator,
            arabic_text: i.arabic_text,
            english_text: i.english_text,
            hebrew_text: null,
            arabic_translation: null,
          })),
          total: value.total,
        };
      }
    } catch (e) {
      console.warn("hadith_entries_provider_fallback_failed", e);
    }

    return { items: [], total: 0 };
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("hadith_entries")
      .select("id,collection_slug,book_id,id_in_book,global_id,narrator,arabic_text,english_text,hebrew_text")
      .eq("collection_slug", collection)
      .or(`global_id.eq.${data.num},id_in_book.eq.${data.num}`)
      .limit(1)
      .maybeSingle();

    if (row) {
      const entry = mapEntryRow(row as HadithEntryRow);
      const { data: translations } = await supabaseAdmin
        .from("hadith_translations")
        .select("language_code,body")
        .eq("hadith_id", entry.id)
        .in("language_code", ["en", "he", "ar"]);

      for (const t of translations ?? []) {
        if (t.language_code === "en" && t.body) entry.english_text = t.body;
        if (t.language_code === "he" && t.body) entry.hebrew_text = t.body;
        if (t.language_code === "ar" && t.body) entry.arabic_translation = t.body;
      }
      return entry;
    }

    // Provider Fallback if not in DB
    try {
      const { value } = await runWithProviderFallback(async (p) => {
        return findHadithInProvider(p, collection, data.num);
      });
      if (value) {
        return {
          id: value.global_id || value.id_in_book,
          collection_slug: value.collection_slug,
          book_id: value.book_id,
          id_in_book: value.id_in_book,
          global_id: value.global_id || value.id_in_book,
          narrator: value.narrator,
          arabic_text: value.arabic_text,
          english_text: value.english_text,
          hebrew_text: value.hebrew_text || null,
          arabic_translation: null,
        };
      }
    } catch {
      // Silently return null
    }

    return null;
  });

async function findHadithInProvider(
  p: import("@/lib/hadith-providers.server").HadithProvider,
  collection: string,
  num: number,
): Promise<import("@/lib/hadith-providers.server").ProviderEntry | null> {
  let books: import("@/lib/hadith-providers.server").ProviderBook[] = [];
  try {
    books = await p.listBooks(collection);
  } catch {
    books = [];
  }

  if (books.length === 0) {
    for (let page = 0; page < 5; page += 1) {
      const res = await p.listBookEntries({ collection, book: 1, page, pageSize: 50 });
      const found = res.items.find((i) => i.global_id === num || i.id_in_book === num);
      if (found) return found;
      if (res.items.length < 50) break;
    }
    return null;
  }

  const targetBooks: import("@/lib/hadith-providers.server").ProviderBook[] = [];
  let cumulative = 0;

  for (const b of books) {
    if (b.book_id === num) {
      targetBooks.push(b);
    }
    if (num > cumulative && num <= cumulative + (b.hadith_count || 100)) {
      if (!targetBooks.includes(b)) targetBooks.push(b);
    }
    cumulative += b.hadith_count || 100;
  }

  if (targetBooks.length === 0) {
    targetBooks.push(books[0]);
  }

  for (const tb of targetBooks) {
    const approxPage = Math.max(0, Math.floor((num - 1) / 50));
    const pagesToTry = Array.from(new Set([approxPage, 0, 1, 2, 3]));
    for (const page of pagesToTry) {
      try {
        const res = await p.listBookEntries({
          collection,
          book: tb.book_id,
          page,
          pageSize: 50,
        });
        const found = res.items.find((i) => i.global_id === num || i.id_in_book === num);
        if (found) return found;
      } catch {
        continue;
      }
    }
  }

  for (const b of books.slice(0, 10)) {
    if (targetBooks.includes(b)) continue;
    try {
      const res = await p.listBookEntries({
        collection,
        book: b.book_id,
        page: 0,
        pageSize: 50,
      });
      const found = res.items.find((i) => i.global_id === num || i.id_in_book === num);
      if (found) return found;
    } catch {
      continue;
    }
  }

  return null;
}

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
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: entryRow } = await supabaseAdmin
        .from("hadith_entries")
        .select("id,collection_slug,book_id,id_in_book,global_id,narrator,arabic_text,english_text,hebrew_text")
        .eq("collection_slug", collection)
        .or(`global_id.eq.${data.num},id_in_book.eq.${data.num}`)
        .limit(1)
        .maybeSingle();

      let entry: HadithEntry;
      if (entryRow) {
        entry = mapEntryRow(entryRow as HadithEntryRow);
      } else {
        // Fallback to provider entry if not in DB
        try {
          const { value } = await runWithProviderFallback(async (p) => {
            return findHadithInProvider(p, collection, data.num);
          });
          if (!value) return null;
          entry = {
            id: value.global_id || value.id_in_book,
            collection_slug: value.collection_slug,
            book_id: value.book_id,
            id_in_book: value.id_in_book,
            global_id: value.global_id || value.id_in_book,
            narrator: value.narrator,
            arabic_text: value.arabic_text,
            english_text: value.english_text,
            hebrew_text: value.hebrew_text || null,
            arabic_translation: null,
          };
        } catch {
          return null;
        }
      }

      const { data: translationRows } = await supabaseAdmin
        .from("hadith_translations")
        .select("language_code,body")
        .eq("hadith_id", entry.id)
        .in("language_code", ["en", "he", "ar"]);

      for (const t of translationRows ?? []) {
        if (t.language_code === "en" && t.body) entry.english_text = t.body;
        if (t.language_code === "he" && t.body) entry.hebrew_text = t.body;
        if (t.language_code === "ar" && t.body) entry.arabic_translation = t.body;
      }

      const [{ data: collectionMeta }, { data: narratorRows }, { data: links }] = await Promise.all([
        supabaseAdmin
          .from("hadith_collections")
          .select("slug,title_ar,title_en,title_he,author_ar,author_en,total_hadith,total_books,sort_order")
          .eq("slug", entry.collection_slug)
          .maybeSingle(),
        entry.narrator
          ? supabaseAdmin
              .from("hadith_narrators")
              .select("narrator,hadith_count,collections")
              .eq("narrator", entry.narrator)
          : Promise.resolve({
              data: [] as Array<{
                narrator: string;
                hadith_count: number;
                collections: string[];
              }>,
            }),
        supabaseAdmin
          .from("hadith_entity_links")
          .select("entity_id,surah,ayah,weight")
          .eq("hadith_id", entry.id)
          .order("weight", { ascending: false })
          .limit(40),
      ]);

      const verseRows = (links ?? []).filter((r) => r.surah !== null && r.ayah !== null);
      const relatedVerses = verseRows.map((r) => ({
        surah: r.surah!,
        ayah: r.ayah!,
        weight: r.weight,
      }));

      const entityIds = (links ?? []).map((r) => r.entity_id).filter((v): v is string => !!v);
      const { data: entities } = entityIds.length
        ? await supabaseAdmin
            .from("knowledge_entities")
            .select("id,slug,kind,title_i18n,summary_i18n")
            .in("id", entityIds)
        : {
            data: [] as Array<{
              id: string;
              slug: string;
              kind: string;
              title_i18n: Record<string, string>;
              summary_i18n: Record<string, string>;
            }>,
          };

      const relatedEntities: HadithEntityLite[] = (entities ?? []).map((e) => ({
        id: e.id,
        slug: e.slug,
        kind: e.kind,
        title_i18n: coerceI18n(e.title_i18n),
        summary_i18n: coerceI18n(e.summary_i18n),
      }));

      const relatedTopics = relatedEntities.filter((e) => e.kind === "topic");
      const relatedProphets = relatedEntities.filter((e) => e.kind === "prophet");

      const { data: tafsirRows } = relatedVerses.length
        ? await supabaseAdmin
            .from("tafsir_passages")
            .select("id,surah,ayah_start,ayah_end,lang,body,source_name")
            .in("surah", [...new Set(relatedVerses.map((v) => v.surah))].slice(0, 8))
            .limit(12)
        : { data: [] as Array<HadithTafsirLite> };

      const { data: asbabRows } = relatedVerses.length
        ? await supabaseAdmin
            .from("asbab_nuzul")
            .select("id,surah,ayah_start,ayah_end,lang,body")
            .in("surah", [...new Set(relatedVerses.map((v) => v.surah))].slice(0, 8))
            .limit(16)
        : { data: [] as HadithAsbabLite[] };

      const { data: relatedHadithRows } = entry.narrator
        ? await supabaseAdmin
            .from("hadith_entries")
            .select("id,collection_slug,book_id,id_in_book,global_id,narrator,arabic_text,english_text,hebrew_text")
            .eq("narrator", entry.narrator)
            .neq("id", entry.id)
            .order("global_id", { ascending: false })
            .limit(8)
        : { data: [] as HadithEntryRow[] };

      const narrator = (narratorRows ?? [])[0]
        ? {
            narrator: narratorRows![0].narrator ?? entry.narrator ?? "Unknown",
            hadith_count: narratorRows![0].hadith_count ?? 0,
            collections: narratorRows![0].collections ?? [entry.collection_slug],
          }
        : null;

      return {
        entry,
        collection: (collectionMeta as HadithCollection | null) ?? null,
        narrator,
        relatedVerses,
        relatedTafsir: (tafsirRows ?? []) as HadithTafsirLite[],
        relatedAsbab: (asbabRows ?? []) as HadithAsbabLite[],
        relatedTopics,
        relatedProphets,
        relatedEntities,
        relatedHadith: (relatedHadithRows ?? []).map((row) => mapEntryRow(row as HadithEntryRow)),
      };
    } catch (error) {
      console.error("hadith_bundle_failed", error instanceof Error ? error.message : String(error));
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
        citations: z.array(z.string().min(1).max(120)).max(24).optional().default([]),
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
      data.relatedHadithSnippets.length ? `Related hadith snippets:\n- ${data.relatedHadithSnippets.join("\n- ")}` : "",
      data.citations.length ? `Citations you must ground on:\n- ${data.citations.join("\n- ")}` : "",
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
        citations: data.citations.slice(0, 12),
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const normalizedCollections = (data.collections ?? [])
      .map((c) => normalizeHadithCollection(c))
      .filter((v): v is string => !!v);

    const query = data.q.trim();
    if (!query) {
      return {
        items: [],
        total: 0,
        hasMore: false,
      };
    }

    const fetchLimit = Math.min(100, Math.max(data.pageSize * (data.page + 2), 30));
    const { data: ranked, error } = await supabaseAdmin.rpc("search_hadith_hybrid", {
      q: query,
      collections: normalizedCollections.length > 0 ? normalizedCollections : undefined,
      match_count: fetchLimit,
    });

    if (error) {
      console.error("hadith_search_rpc_failed", error.message);
      return { items: [], total: 0, hasMore: false };
    }

    const start = data.page * data.pageSize;
    const end = start + data.pageSize;
    const exactRows = (ranked ?? []).map((row) => ({
      id: row.id,
      collection_slug: row.collection_slug,
      book_id: row.book_id,
      id_in_book: row.id_in_book,
      global_id: row.global_id,
      narrator: row.narrator,
      arabic_text: row.arabic_text,
      english_text: row.english_text,
      hebrew_text: null,
      arabic_translation: null,
      created_at: new Date().toISOString(),
      fts: null,
      embedding: null,
      embedding_model: null,
      embedded_at: null,
      chapter_id: null,
      grade: null,
      grade_source: null,
      chain_text: null,
      reference_text: null,
      notes: null,
      api_source: "import",
      source_payload: {},
      import_run_id: null,
      updated_at: new Date().toISOString(),
    })) as HadithEntryRow[];
    const typoTokens = query
      .toLowerCase()
      .split(/\s+/)
      .map((v) => v.trim())
      .filter((v) => v.length >= 3)
      .slice(0, 3);

    let fallbackRows: HadithEntry[] = [];
    if (typoTokens.length > 0) {
      let fallbackQuery = supabaseAdmin
        .from("hadith_entries")
        .select("id,collection_slug,book_id,id_in_book,global_id,narrator,arabic_text,english_text,hebrew_text")
        .order("global_id", { ascending: false })
        .limit(40);

      if (normalizedCollections.length > 0) {
        fallbackQuery = fallbackQuery.in("collection_slug", normalizedCollections);
      }

      const joined = typoTokens.join(" ");
      fallbackQuery = fallbackQuery.or(
        `english_text.ilike.%${joined}%,hebrew_text.ilike.%${joined}%,arabic_text.ilike.%${joined}%,narrator.ilike.%${joined}%`,
      );

      const { data: fallback } = await fallbackQuery;
      fallbackRows = (fallback ?? []).map((row) => mapEntryRow(row as HadithEntryRow));
    }

    const merged = new Map<number, HadithEntry>();
    for (const row of exactRows) merged.set(row.id, mapEntryRow(row as HadithEntryRow));
    for (const row of fallbackRows) {
      if (!merged.has(row.id)) merged.set(row.id, row);
    }

    const rows = Array.from(merged.values());
    return {
      items: rows.slice(start, end),
      total: rows.length,
      hasMore: end < rows.length,
    };
  });

export const listTopNarrators = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(500).optional().default(100) }).parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<Array<{ narrator: string; hadith_count: number; collections: string[] }>> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("hadith_narrators")
      .select("narrator,hadith_count,collections")
      .order("hadith_count", { ascending: false })
      .limit(data.limit);
    if (error || !rows) return [];
    return rows
      .filter((row) => typeof row.narrator === "string" && row.narrator.trim().length > 0)
      .map((row) => ({
        narrator: row.narrator!,
        hadith_count: row.hadith_count ?? 0,
        collections: row.collections ?? [],
      }));
  });

export const listHadithTopicBooks = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        limitPerCollection: z.number().int().min(1).max(30).optional().default(10),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<HadithTopicBook[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: collections, error: cErr } = await supabaseAdmin
      .from("hadith_collections")
      .select("slug")
      .order("sort_order", { ascending: true });
    if (cErr || !collections) return [];

    const out: HadithTopicBook[] = [];
    for (const c of collections) {
      const { data: rows } = await supabaseAdmin
        .from("hadith_books")
        .select("collection_slug,book_id,name_ar,name_en,name_he,hadith_count")
        .eq("collection_slug", c.slug)
        .order("hadith_count", { ascending: false })
        .limit(data.limitPerCollection);
      out.push(...((rows ?? []) as HadithTopicBook[]));
    }
    return out.sort((a, b) => b.hadith_count - a.hadith_count);
  });

export const runHadithImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        collection: z.string().min(1).max(60),
        maxBooks: z.number().int().min(1).max(20).optional().default(2),
        maxPagesPerBook: z.number().int().min(1).max(20).optional().default(3),
        pageSize: z.number().int().min(10).max(200).optional().default(100),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<HadithImportReport> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const collection = normalizeHadithCollection(data.collection);
    if (!collection) throw new Error("Invalid collection");
    return runHadithImportStep({
      collection,
      maxBooks: data.maxBooks,
      maxPagesPerBook: data.maxPagesPerBook,
      pageSize: data.pageSize,
      requestedBy: context.userId,
    });
  });

export const listHadithImportJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(50).optional().default(20) }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("import_jobs")
      .select(
        "id,job_name,status,checkpoint,stats,failed_batches,error_message,created_at,updated_at,started_at,finished_at",
      )
      .ilike("job_name", "hadith_import:%")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    return rows ?? [];
  });

export const cancelHadithImportJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("import_jobs")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", data.id)
      .ilike("job_name", "hadith_import:%");
    return { ok: true as const };
  });

export const retryHadithImportJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("import_jobs")
      .update({
        status: "queued",
        error_message: null,
        cancelled_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .ilike("job_name", "hadith_import:%");
    return { ok: true as const };
  });

export const runHadithEmbeddingsWorker = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        batch: z.number().int().min(1).max(500).optional().default(200),
        untilDone: z.boolean().optional().default(false),
        maxRuns: z.number().int().min(1).max(100).optional().default(5),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { embedHadithBatchJob } = await import("@/lib/hadith-graph.server");
    return embedHadithBatchJob({
      batch: data.batch,
      untilDone: data.untilDone,
      maxRuns: data.maxRuns,
    });
  });

export const getHadithAdminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<HadithAdminDashboard> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: imports }, { count: total }, { count: embedded }, { data: latestEmbedded }] = await Promise.all([
      supabaseAdmin
        .from("import_jobs")
        .select(
          "id,job_name,status,checkpoint,stats,failed_batches,error_message,created_at,updated_at,started_at,finished_at",
        )
        .ilike("job_name", "hadith_import:%")
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin.from("hadith_entries").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("hadith_entries").select("id", { count: "exact", head: true }).not("embedding", "is", null),
      supabaseAdmin
        .from("hadith_entries")
        .select("embedded_at")
        .not("embedded_at", "is", null)
        .order("embedded_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const totalRows = total ?? 0;
    const embeddedRows = embedded ?? 0;
    return {
      imports:
        (imports ?? []).map((row) => ({
          ...row,
          checkpoint: row.checkpoint,
          stats: row.stats,
          failed_batches: row.failed_batches,
        })) ?? [],
      embeddings: {
        total: totalRows,
        embedded: embeddedRows,
        pending: Math.max(0, totalRows - embeddedRows),
        latestEmbeddedAt: latestEmbedded?.embedded_at ?? null,
      },
    };
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
      const topicIds = topicRows.map((topic) => topic.id);

      const relatedRows: Array<{
        entity_id: string | null;
        hadith_id: number | null;
        hadith: { collection_slug: string | null } | null;
      }> = [];
      const pageSize = 1000;
      const maxRows = 50_000;
      for (let from = 0; from < maxRows; from += pageSize) {
        const to = from + pageSize - 1;
        const { data: page, error: pageError } = await supabaseAdmin
          .from("hadith_entity_links")
          .select("entity_id,hadith_id,hadith:hadith_entries!inner(collection_slug)")
          .in("entity_id", topicIds)
          .range(from, to);

        if (pageError || !page || page.length === 0) break;

        relatedRows.push(
          ...page.map((row) => ({
            entity_id: row.entity_id,
            hadith_id: typeof row.hadith_id === "number" ? row.hadith_id : null,
            hadith: Array.isArray(row.hadith) ? (row.hadith[0] ?? null) : row.hadith,
          })),
        );

        if (page.length < pageSize) break;
      }

      const statsByTopic = new Map<string, { hadithIds: Set<number>; collections: Set<string> }>();
      for (const topicId of topicIds) {
        statsByTopic.set(topicId, { hadithIds: new Set<number>(), collections: new Set<string>() });
      }

      for (const row of relatedRows) {
        if (!row.entity_id) continue;
        const stats = statsByTopic.get(row.entity_id);
        if (!stats) continue;
        if (row.hadith_id !== null) stats.hadithIds.add(row.hadith_id);
        if (row.hadith?.collection_slug) stats.collections.add(row.hadith.collection_slug);
      }

      return topicRows.map((topic) => {
        const stats = statsByTopic.get(topic.id);
        const titleI18n = coerceI18n(topic.title_i18n);
        return {
          id: topic.id,
          slug: topic.slug,
          title_i18n: titleI18n,
          hadith_count: stats?.hadithIds.size ?? 0,
          collections: Array.from(stats?.collections ?? []),
        };
      });
    } catch {
      return [];
    }
  });

export const getHadithDiagnostics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<HadithDiagnostics> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const probe = await probeHadithProviders();
    const apiConfigured = probe.length > 0;
    return {
      apiConfigured,
      connectionOk: probe.some((p) => p.ok),
      has403: probe.some((p) => p.status === 403),
      endpoints: probe.map((p) => ({
        endpoint: p.id,
        ok: p.ok,
        status: p.status,
        requestId: null,
        error: p.error,
      })),
    };
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
  .handler(async ({ context }): Promise<HadithTelemetrySnapshot> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

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

export type HadithByTopicResult = {
  items: HadithEntry[];
  total: number;
  page: number;
  pageSize: number;
  collections: string[];
  narrators: string[];
};

export const listHadithByTopicSlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1).max(160),
        page: z.number().int().min(1).max(200).optional().default(1),
        pageSize: z.number().int().min(1).max(50).optional().default(10),
        collection: z.string().max(40).optional().nullable(),
        narrator: z.string().max(300).optional().nullable(),
        sort: z.enum(["relevance", "narrator", "collection"]).optional().default("relevance"),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<HadithByTopicResult> => {
    const empty: HadithByTopicResult = {
      items: [],
      total: 0,
      page: data.page,
      pageSize: data.pageSize,
      collections: [],
      narrators: [],
    };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: entity } = await supabaseAdmin
        .from("knowledge_entities")
        .select("id")
        .eq("slug", data.slug)
        .maybeSingle();
      if (!entity) return empty;

      const { data: linkRows } = await supabaseAdmin
        .from("hadith_entity_links")
        .select("hadith_id,weight")
        .eq("entity_id", entity.id)
        .order("weight", { ascending: false })
        .limit(1000);

      const ids = Array.from(
        new Set((linkRows ?? []).map((r) => r.hadith_id).filter((v): v is number => typeof v === "number")),
      );
      if (ids.length === 0) return empty;

      let query = supabaseAdmin
        .from("hadith_entries")
        .select("id,collection_slug,book_id,id_in_book,global_id,narrator,arabic_text,english_text,hebrew_text", {
          count: "exact",
        })
        .in("id", ids);

      const collection = data.collection ? normalizeHadithCollection(data.collection) : null;
      if (collection) query = query.eq("collection_slug", collection);
      if (data.narrator) query = query.eq("narrator", data.narrator);

      if (data.sort === "narrator") query = query.order("narrator", { ascending: true, nullsFirst: false });
      else if (data.sort === "collection") query = query.order("collection_slug", { ascending: true });
      query = query.order("global_id", { ascending: true });

      const from = (data.page - 1) * data.pageSize;
      const { data: rows, count } = await query.range(from, from + data.pageSize - 1);

      const { data: facetRows } = await supabaseAdmin
        .from("hadith_entries")
        .select("collection_slug,narrator")
        .in("id", ids)
        .limit(1000);

      return {
        items: (rows ?? []).map((row) => mapEntryRow(row as HadithEntryRow)),
        total: count ?? 0,
        page: data.page,
        pageSize: data.pageSize,
        collections: Array.from(new Set((facetRows ?? []).map((r) => r.collection_slug))).sort(),
        narrators: Array.from(
          new Set(
            (facetRows ?? [])
              .map((r) => r.narrator)
              .filter((v): v is string => typeof v === "string" && v.trim().length > 0),
          ),
        )
          .sort()
          .slice(0, 60),
      };
    } catch {
      return empty;
    }
  });
