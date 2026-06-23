// Server-side semantic retrieval over the Quran corpus.
// Uses the verse_embeddings table populated by the offline backfill job.
// Returns ONLY authenticated verse data (Arabic + Hebrew translation #233)
// — no AI-generated text is ever read from or written to this table.

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { embedTexts } from "./embeddings.server";

const RetrieveSchema = z.object({
  question: z.string().min(2).max(500),
  k: z.number().int().min(1).max(20).optional().default(8),
  themes: z.array(z.string().min(1).max(80)).max(10).optional(),
  minSimilarity: z.number().min(0).max(1).optional().default(0.2),
});

export interface RetrievedVerse {
  surah: number;
  ayah: number;
  arabic: string;
  hebrew: string;
  themes: string[];
  similarity: number;
}

export const semanticRetrieveVerses = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RetrieveSchema.parse(input))
  .handler(async ({ data }): Promise<{ verses: RetrievedVerse[]; error?: string }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!apiKey || !supabaseUrl || !publishableKey) {
      return { verses: [], error: "Server not configured for semantic retrieval." };
    }

    let queryEmbedding: number[];
    try {
      const [vec] = await embedTexts({ apiKey, input: data.question });
      if (!vec) return { verses: [], error: "Embedding failed." };
      queryEmbedding = vec;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429")) return { verses: [], error: "rate_limit" };
      if (msg.includes("402")) return { verses: [], error: "credits_exhausted" };
      return { verses: [], error: "embedding_failed" };
    }

    // Server publishable client; RPC runs as SECURITY INVOKER. Anon role does
    // not have EXECUTE on match_verses, so we authenticate as the requesting
    // user via their session — but for app-internal RAG we use a service-role
    // path inside the same module to avoid coupling to auth.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows, error } = await supabaseAdmin.rpc("match_verses", {
      query_embedding: queryEmbedding as unknown as string,
      match_count: data.k,
      min_similarity: data.minSimilarity,
      ...(data.themes && data.themes.length > 0 ? { theme_filter: data.themes } : {}),
    });

    if (error) {
      return { verses: [], error: `retrieval_failed: ${error.message.slice(0, 120)}` };
    }

    type Row = Database["public"]["Functions"]["match_verses"]["Returns"][number];
    const verses: RetrievedVerse[] = (rows ?? []).map((r: Row) => ({
      surah: r.surah as number,
      ayah: r.ayah as number,
      arabic: r.arabic,
      hebrew: r.hebrew,
      themes: r.themes ?? [],
      similarity: r.similarity ?? 0,
    }));
    return { verses };
  });

/**
 * Lightweight status check used by the admin/dev surface (and by the
 * backfill script) to verify embeddings exist.
 */
export const embeddingsStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [total, embedded] = await Promise.all([
    supabaseAdmin.from("verse_embeddings").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("verse_embeddings")
      .select("*", { count: "exact", head: true })
      .not("embedding", "is", null),
  ]);
  return {
    total: total.count ?? 0,
    embedded: embedded.count ?? 0,
  };
});
