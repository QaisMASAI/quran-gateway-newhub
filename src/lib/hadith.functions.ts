// Hadith server functions — Bukhari, Muslim and unified retrieval.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

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

export const listHadithCollections = createServerFn({ method: "GET" }).handler(
  async (): Promise<HadithCollection[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("hadith_collections" as never)
      .select("*")
      .order("sort_order", { ascending: true });
    return (data ?? []) as unknown as HadithCollection[];
  },
);

export const listHadithBooks = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ collection: z.string().min(1).max(40) }).parse(input),
  )
  .handler(async ({ data }): Promise<HadithBook[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("hadith_books" as never)
      .select("collection_slug,book_id,name_ar,name_en,name_he,hadith_count")
      .eq("collection_slug", data.collection)
      .order("book_id", { ascending: true });
    return (rows ?? []) as unknown as HadithBook[];
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const from = data.page * data.pageSize;
    const to = from + data.pageSize - 1;
    const { data: rows, count } = await supabaseAdmin
      .from("hadith_entries" as never)
      .select(
        "id,collection_slug,book_id,id_in_book,global_id,narrator,arabic_text,english_text,hebrew_text",
        {
          count: "exact",
        },
      )
      .eq("collection_slug", data.collection)
      .eq("book_id", data.book)
      .order("id_in_book", { ascending: true })
      .range(from, to);
    return { items: (rows ?? []) as unknown as HadithEntry[], total: count ?? 0 };
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("hadith_entries" as never)
      .select(
        "id,collection_slug,book_id,id_in_book,global_id,narrator,arabic_text,english_text,hebrew_text",
      )
      .eq("collection_slug", data.collection)
      .eq("global_id", data.num)
      .maybeSingle();
    return (row ?? null) as unknown as HadithEntry | null;
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: hadithRow } = await supabaseAdmin
      .from("hadith_entries" as never)
      .select(
        "id,collection_slug,book_id,id_in_book,global_id,narrator,arabic_text,english_text,hebrew_text",
      )
      .eq("collection_slug", data.collection)
      .eq("global_id", data.num)
      .maybeSingle();

    const entry = (hadithRow ?? null) as unknown as HadithEntry | null;
    if (!entry) return null;

    const [{ data: collectionRow }, { data: narratorRows }, { data: linkRows }] = await Promise.all([
      supabaseAdmin
        .from("hadith_collections" as never)
        .select("slug,title_ar,title_en,title_he,author_ar,author_en,total_hadith,total_books,sort_order")
        .eq("slug", entry.collection_slug)
        .maybeSingle(),
      entry.narrator
        ? supabaseAdmin
            .from("hadith_narrators" as never)
            .select("narrator,hadith_count,collections")
            .eq("narrator", entry.narrator)
            .limit(1)
        : Promise.resolve({ data: [] as unknown[] }),
      supabaseAdmin
        .from("hadith_entity_links" as never)
        .select(
          "hadith_id,entity_id,surah,ayah,weight,knowledge_entities(id,slug,kind,title_i18n,summary_i18n,published)",
        )
        .eq("hadith_id", entry.id)
        .limit(150),
    ]);

    const collection = (collectionRow ?? null) as unknown as HadithCollection | null;
    const narrator = ((narratorRows ?? [])[0] ?? null) as unknown as HadithNarratorProfile | null;

    const verseMap = new Map<string, { surah: number; ayah: number; weight: number }>();
    const entityMap = new Map<string, HadithEntityLite>();

    for (const row of (linkRows ?? []) as Array<{
      surah: number | null;
      ayah: number | null;
      weight: number | null;
      entity_id: string | null;
      knowledge_entities:
        | {
            id: string;
            slug: string;
            kind: string;
            published: boolean;
            title_i18n: { he?: string; ar?: string; en?: string };
            summary_i18n: { he?: string; ar?: string; en?: string };
          }
        | null;
    }>) {
      if (row.surah && row.ayah) {
        const key = `${row.surah}:${row.ayah}`;
        const prev = verseMap.get(key);
        const weight = Number(row.weight ?? 5);
        if (!prev || weight > prev.weight) {
          verseMap.set(key, { surah: row.surah, ayah: row.ayah, weight });
        }
      }
      if (row.entity_id && row.knowledge_entities?.published) {
        entityMap.set(row.entity_id, {
          id: row.knowledge_entities.id,
          slug: row.knowledge_entities.slug,
          kind: row.knowledge_entities.kind,
          title_i18n: row.knowledge_entities.title_i18n ?? {},
          summary_i18n: row.knowledge_entities.summary_i18n ?? {},
        });
      }
    }

    const relatedVerses = [...verseMap.values()]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10);

    const entityList = [...entityMap.values()];
    const relatedTopics = entityList.filter((e) => e.kind === "topic").slice(0, 8);
    const relatedProphets = entityList.filter((e) => e.kind === "prophet").slice(0, 8);
    const relatedEntities = entityList.filter((e) => e.kind !== "topic" && e.kind !== "prophet").slice(0, 8);

    const tafsirRows: HadithTafsirLite[] = [];
    for (const v of relatedVerses.slice(0, 4)) {
      const { data: tRows } = await supabaseAdmin
        .from("tafsir_passages" as never)
        .select("id,surah,ayah_start,ayah_end,lang,body,source:tafsir_sources(name_en,name_ar,name_he)")
        .eq("surah", v.surah)
        .lte("ayah_start", v.ayah)
        .gte("ayah_end", v.ayah)
        .order("created_at", { ascending: false })
        .limit(2);

      for (const tr of (tRows ?? []) as Array<{
        id: string;
        surah: number;
        ayah_start: number;
        ayah_end: number;
        lang: string;
        body: string;
        source: { name_en?: string; name_ar?: string; name_he?: string } | null;
      }>) {
        tafsirRows.push({
          id: tr.id,
          surah: tr.surah,
          ayah_start: tr.ayah_start,
          ayah_end: tr.ayah_end,
          lang: tr.lang,
          body: tr.body,
          source_name: tr.source?.name_en ?? tr.source?.name_ar ?? tr.source?.name_he ?? "Tafsir",
        });
      }
    }

    const relatedScore = new Map<number, number>();
    const entityIds = entityList.map((e) => e.id);

    if (entityIds.length > 0) {
      const { data: relatedLinkRows } = await supabaseAdmin
        .from("hadith_entity_links" as never)
        .select("hadith_id,weight")
        .in("entity_id", entityIds)
        .neq("hadith_id", entry.id)
        .limit(500);
      for (const r of (relatedLinkRows ?? []) as Array<{ hadith_id: number; weight: number | null }>) {
        relatedScore.set(r.hadith_id, (relatedScore.get(r.hadith_id) ?? 0) + Number(r.weight ?? 3));
      }
    }

    if (entry.narrator) {
      const { data: sameNarratorRows } = await supabaseAdmin
        .from("hadith_entries" as never)
        .select("id")
        .eq("narrator", entry.narrator)
        .neq("id", entry.id)
        .limit(30);
      for (const r of (sameNarratorRows ?? []) as Array<{ id: number }>) {
        relatedScore.set(r.id, (relatedScore.get(r.id) ?? 0) + 2);
      }
    }

    const relatedIds = [...relatedScore.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);

    let relatedHadith: HadithEntry[] = [];
    if (relatedIds.length > 0) {
      const { data: relatedRows } = await supabaseAdmin
        .from("hadith_entries" as never)
        .select(
          "id,collection_slug,book_id,id_in_book,global_id,narrator,arabic_text,english_text,hebrew_text",
        )
        .in("id", relatedIds)
        .limit(10);

      const byId = new Map(
        ((relatedRows ?? []) as HadithEntry[]).map((r) => [r.id, r] as const),
      );
      relatedHadith = relatedIds.map((id) => byId.get(id)).filter((v): v is HadithEntry => !!v);
    }

    return {
      entry,
      collection,
      narrator,
      relatedVerses,
      relatedTafsir: tafsirRows.slice(0, 8),
      relatedTopics,
      relatedProphets,
      relatedEntities,
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
        limit: z.number().int().min(1).max(50).optional().default(20),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<HadithEntry[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin.rpc(
      "search_hadith_hybrid" as never,
      {
        q: data.q,
        collections: data.collections ?? null,
        match_count: data.limit,
      } as never,
    );
    return (rows ?? []) as unknown as HadithEntry[];
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
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: rows } = await supabaseAdmin
        .from("hadith_narrators" as never)
        .select("narrator,hadith_count,collections")
        .order("hadith_count", { ascending: false })
        .limit(data.limit);
      return (rows ?? []) as unknown as Array<{
        narrator: string;
        hadith_count: number;
        collections: string[];
      }>;
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const collections = ["bukhari", "muslim"];
    const out: HadithTopicBook[] = [];

    for (const collection of collections) {
      const { data: rows } = await supabaseAdmin
        .from("hadith_books" as never)
        .select("collection_slug,book_id,name_ar,name_en,name_he,hadith_count")
        .eq("collection_slug", collection)
        .order("hadith_count", { ascending: false })
        .limit(data.limitPerCollection);
      out.push(...((rows ?? []) as unknown as HadithTopicBook[]));
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
      .from("hadith_entity_links" as never)
      .select(
        "entity_id, hadith_id, hadith_entries!inner(collection_slug), knowledge_entities!inner(id,slug,title_i18n,published,kind)",
      )
      .not("entity_id", "is", null)
      .eq("knowledge_entities.published", true)
      .eq("knowledge_entities.kind", "topic")
      .limit(25000);

    const byEntity = new Map<
      string,
      {
        id: string;
        slug: string;
        title_i18n: { he?: string; ar?: string; en?: string };
        hadithIds: Set<number>;
        collections: Set<string>;
      }
    >();

    for (const row of (rows ?? []) as Array<{
      entity_id: string | null;
      hadith_id: number;
      hadith_entries: { collection_slug: string } | null;
      knowledge_entities: {
        id: string;
        slug: string;
        title_i18n: { he?: string; ar?: string; en?: string };
      } | null;
    }>) {
      if (!row.entity_id || !row.knowledge_entities) continue;
      const current = byEntity.get(row.entity_id) ?? {
        id: row.knowledge_entities.id,
        slug: row.knowledge_entities.slug,
        title_i18n: row.knowledge_entities.title_i18n ?? {},
        hadithIds: new Set<number>(),
        collections: new Set<string>(),
      };
      current.hadithIds.add(row.hadith_id);
      if (row.hadith_entries?.collection_slug)
        current.collections.add(row.hadith_entries.collection_slug);
      byEntity.set(row.entity_id, current);
    }

    return [...byEntity.values()]
      .map((entry) => ({
        id: entry.id,
        slug: entry.slug,
        title_i18n: entry.title_i18n,
        hadith_count: entry.hadithIds.size,
        collections: [...entry.collections],
      }))
      .sort((a, b) => b.hadith_count - a.hadith_count)
      .slice(0, data.limit);
  });
