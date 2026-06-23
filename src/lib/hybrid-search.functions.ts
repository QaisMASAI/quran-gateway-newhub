// Hybrid search server functions: combine full-text + vector + metadata
// over both knowledge_entities and verse_embeddings.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { embedTexts } from "./embeddings.server";

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

    const { data: rows, error } = await supabaseAdmin.rpc("search_entities_hybrid" as never, {
      q: data.q || null,
      query_embedding: embedding as unknown as string,
      kind_filter: (data.kinds as unknown as string[]) ?? null,
      match_count: data.limit,
    } as never);

    if (error) return { hits: [], error: error.message };
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
    if (data.semantic && apiKey && data.q && data.q.trim().length > 1) {
      try {
        const [vec] = await embedTexts({ apiKey, input: data.q });
        embedding = vec ?? null;
      } catch {
        embedding = null;
      }
    }

    const { data: rows, error } = await supabaseAdmin.rpc("search_verses_hybrid" as never, {
      q: data.q || null,
      query_embedding: embedding as unknown as string,
      theme_filter: data.themes ?? null,
      match_count: data.limit,
    } as never);

    if (error) return { hits: [], error: error.message };
    return { hits: (rows ?? []) as VerseHit[] };
  });
