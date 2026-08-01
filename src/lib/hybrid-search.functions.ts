// Hybrid search server functions: combine full-text + vector + metadata
// over both knowledge_entities and verse_embeddings.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { embedTexts } from "./embeddings.server";
import { expandSearchQuery } from "./search-query";

const EntitySearchSchema = z.object({
  q: z.string().max(300).optional().default(""),
  kinds: z.array(z.string()).max(10).optional(),
  semantic: z.boolean().optional().default(true),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

export interface EntityHit {
  id: string;
  kind: string;
  slug: string;
  title_i18n: Record<string, string>;
  summary_i18n: Record<string, string>;
  hero_image: string | null;
  icon: string | null;
  score: number;
}

export const searchEntitiesHybrid = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EntitySearchSchema.parse(input))
  .handler(async ({ data }): Promise<{ hits: EntityHit[]; error?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const apiKey = process.env.LOVABLE_API_KEY;

    let embedding: number[] | null = null;
    if (data.semantic && apiKey && data.q && data.q.trim().length > 1) {
      try {
        const [vec] = await embedTexts({ apiKey, input: data.q });
        embedding = vec ?? null;
      } catch {
        embedding = null;
      }
    }

    const { data: rows, error } = await supabaseAdmin.rpc(
      "search_entities_hybrid" as never,
      {
        q: data.q || null,
        query_embedding: embedding as unknown as string,
        kind_filter: (data.kinds as unknown as string[]) ?? null,
        match_count: data.limit,
      } as never,
    );

    if (error) {
      console.error("searchEntitiesHybrid_failed", error);
      return { hits: [], error: "search_failed" };
    }
    return { hits: (rows ?? []) as EntityHit[] };
  });

const VerseSearchSchema = z.object({
  q: z.string().max(300).optional().default(""),
  themes: z.array(z.string()).max(10).optional(),
  semantic: z.boolean().optional().default(true),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

export interface VerseHit {
  surah: number;
  ayah: number;
  arabic: string;
  hebrew: string;
  themes: string[];
  score: number;
}

export const searchVersesHybrid = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => VerseSearchSchema.parse(input))
  .handler(async ({ data }): Promise<{ hits: VerseHit[]; error?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const apiKey = process.env.LOVABLE_API_KEY;

    let embedding: number[] | null = null;
    const expanded = data.q ? expandSearchQuery(data.q) : null;
    const queryText = expanded?.expandedQuery?.trim() || data.q || "";

    if (data.semantic && apiKey && queryText && queryText.length > 1) {
      try {
        const [vec] = await embedTexts({ apiKey, input: queryText });
        embedding = vec ?? null;
      } catch {
        embedding = null;
      }
    }

    const { data: rows, error } = await supabaseAdmin.rpc(
      "search_verses_hybrid" as never,
      {
        q: queryText || null,
        query_embedding: embedding as unknown as string,
        theme_filter: data.themes ?? null,
        match_count: data.limit,
      } as never,
    );

    if (error) {
      console.error("searchVersesHybrid_failed", error);
      return { hits: [], error: "search_failed" };
    }
    return { hits: (rows ?? []) as VerseHit[] };
  });

const QuranItemsHybridSearchSchema = z.object({
  q: z.string().max(400),
  language: z.enum(["he", "ar", "en"]).optional(),
  kinds: z
    .array(
      z.enum([
        "translation",
        "tafsir",
        "hadith",
        "asbab",
        "word_by_word",
        "root_lexicon",
        "morphology",
        "grammar",
        "tajweed",
        "recitation",
        "topic_map",
        "entity_map",
        "timeline",
        "revelation_metadata",
        "cross_reference",
        "audio_asset",
        "other",
      ]),
    )
    .max(20)
    .optional(),
  meccanOnly: z.boolean().optional(),
  semantic: z.boolean().optional().default(true),
  limit: z.number().int().min(1).max(60).optional().default(20),
});

export interface QuranItemHit {
  item_id: string;
  dataset_id: string;
  dataset_kind: string;
  language_code: string | null;
  surah: number | null;
  ayah_start: number | null;
  ayah_end: number | null;
  title_i18n: Record<string, string>;
  body_i18n: Record<string, string>;
  score: number;
}

export const searchQuranItemsHybrid = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => QuranItemsHybridSearchSchema.parse(input))
  .handler(
    async ({
      data,
    }): Promise<{ hits: QuranItemHit[]; expandedTokens: string[]; error?: string }> => {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const apiKey = process.env.LOVABLE_API_KEY;

      const expanded = expandSearchQuery(data.q);
      const queryText = expanded.expandedQuery || data.q;
      let embedding: number[] | null = null;

      if (data.semantic && apiKey && queryText.trim().length > 1) {
        try {
          const [vec] = await embedTexts({ apiKey, input: queryText });
          embedding = vec ?? null;
        } catch {
          embedding = null;
        }
      }

      const { data: rows, error } = await supabaseAdmin.rpc(
        "search_quran_items_hybrid" as never,
        {
          q: queryText,
          query_embedding: embedding as unknown as string,
          language_filter: data.language ?? null,
          kind_filter: data.kinds ?? null,
          meccan_filter: data.meccanOnly ?? null,
          match_count: data.limit,
        } as never,
      );

      if (error) {
        console.error("searchQuranItemsHybrid_failed", error);
        return { hits: [], expandedTokens: expanded.expandedTokens, error: "search_failed" };
      }
      return {
        hits: (rows ?? []) as QuranItemHit[],
        expandedTokens: expanded.expandedTokens,
      };
    },
  );
