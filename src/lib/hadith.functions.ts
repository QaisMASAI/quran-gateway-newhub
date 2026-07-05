// Hadith server functions — Bukhari, Muslim and unified retrieval.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
