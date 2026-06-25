import { z } from "zod";
import { generateText } from "ai";
import { embedTexts } from "./embeddings.server";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const EMBED_MODEL = "openai/text-embedding-3-large";

function toVectorLiteral(vec: number[]) {
  return `[${vec.join(",")}]`;
}

function clip(s: string, max = 1800) {
  return s.replace(/\s+/g, " ").trim().slice(0, max);
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

const EmbedSchema = z.object({
  batch: z.number().int().min(1).max(500).optional().default(200),
});

export async function embedHadithBatchJob(input: unknown) {
  const data = EmbedSchema.parse(input);
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return { ok: false as const, error: "ai_not_configured" };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: rows, error } = await supabaseAdmin
    .from("hadith_entries")
    .select("id, english_text, arabic_text, narrator")
    .is("embedding", null)
    .order("id", { ascending: true })
    .limit(data.batch);
  if (error) return { ok: false as const, error: error.message };
  if (!rows || rows.length === 0) return { ok: true as const, embedded: 0, done: true };

  const inputs = rows.map((r) =>
    clip([r.narrator ?? "", r.english_text ?? r.arabic_text ?? ""].filter(Boolean).join(" — ")),
  );
  const vectors = await embedTexts({ apiKey, model: EMBED_MODEL, input: inputs });

  const now = new Date().toISOString();
  let embedded = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const v = vectors[i];
    if (!v) continue;
    const { error: upErr } = await supabaseAdmin
      .from("hadith_entries")
      .update({
        embedding: toVectorLiteral(v) as unknown as never,
        embedding_model: EMBED_MODEL,
        embedded_at: now,
      })
      .eq("id", rows[i].id);
    if (!upErr) embedded += 1;
  }

  return { ok: true as const, embedded, model: EMBED_MODEL, done: false };
}

const LinkSchema = z.object({
  batch: z.number().int().min(1).max(500).optional().default(150),
  topVerses: z.number().int().min(1).max(10).optional().default(5),
  topEntities: z.number().int().min(0).max(10).optional().default(3),
  minVerseSim: z.number().min(0).max(1).optional().default(0.32),
  minEntitySim: z.number().min(0).max(1).optional().default(0.35),
});

export async function linkHadithToGraphJob(input: unknown) {
  const data = LinkSchema.parse(input);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: rows, error } = await supabaseAdmin
    .from("hadith_entries")
    .select("id, embedding")
    .not("embedding", "is", null)
    .order("id", { ascending: true })
    .limit(data.batch * 4);
  if (error) return { ok: false as const, error: error.message };
  if (!rows || rows.length === 0)
    return { ok: true as const, processed: 0, linkedVerses: 0, linkedEntities: 0, done: true };

  const ids = rows.map((r) => r.id as number);
  const { data: existing } = await supabaseAdmin
    .from("hadith_entity_links")
    .select("hadith_id")
    .in("hadith_id", ids);
  const seen = new Set((existing ?? []).map((e) => e.hadith_id as number));
  const queue = rows.filter((r) => !seen.has(r.id as number)).slice(0, data.batch);
  if (queue.length === 0)
    return { ok: true as const, processed: 0, linkedVerses: 0, linkedEntities: 0, done: true };

  let linkedVerses = 0;
  let linkedEntities = 0;
  const verseRows: Array<{ hadith_id: number; surah: number; ayah: number; weight: number }> = [];
  const entityRows: Array<{ hadith_id: number; entity_id: string; weight: number }> = [];

  for (const r of queue) {
    const embedding = r.embedding as unknown as string;
    const [{ data: vMatches }, { data: eMatches }] = await Promise.all([
      supabaseAdmin.rpc("match_hadith_to_verses", {
        query_embedding: embedding,
        match_count: data.topVerses,
        min_similarity: data.minVerseSim,
      }),
      data.topEntities > 0
        ? supabaseAdmin.rpc("match_hadith_to_entities", {
            query_embedding: embedding,
            match_count: data.topEntities,
            min_similarity: data.minEntitySim,
          })
        : Promise.resolve({ data: [] as Array<{ entity_id: string; similarity: number }> }),
    ]);

    for (const m of (vMatches ?? []) as Array<{ surah: number; ayah: number; similarity: number }>) {
      verseRows.push({
        hadith_id: r.id as number,
        surah: m.surah,
        ayah: m.ayah,
        weight: Math.max(1, Math.min(10, Math.round(m.similarity * 10))),
      });
    }
    for (const m of (eMatches ?? []) as Array<{ entity_id: string; similarity: number }>) {
      entityRows.push({
        hadith_id: r.id as number,
        entity_id: m.entity_id,
        weight: Math.max(1, Math.min(10, Math.round(m.similarity * 10))),
      });
    }
  }

  if (verseRows.length > 0) {
    const { error: upErr, count } = await supabaseAdmin
      .from("hadith_entity_links")
      .upsert(verseRows, {
        onConflict: "hadith_id,surah,ayah",
        ignoreDuplicates: true,
        count: "exact",
      });
    if (upErr) return { ok: false as const, error: `verse_upsert:${upErr.message}` };
    linkedVerses = count ?? verseRows.length;
  }
  if (entityRows.length > 0) {
    const { error: upErr, count } = await supabaseAdmin
      .from("hadith_entity_links")
      .upsert(entityRows, {
        onConflict: "hadith_id,entity_id",
        ignoreDuplicates: true,
        count: "exact",
      });
    if (upErr) return { ok: false as const, error: `entity_upsert:${upErr.message}` };
    linkedEntities = count ?? entityRows.length;
  }

  return {
    ok: true as const,
    processed: queue.length,
    linkedVerses,
    linkedEntities,
    done: false,
  };
}

const TranslateSchema = z.object({
  batch: z.number().int().min(1).max(50).optional().default(20),
  model: z.string().min(3).optional().default("google/gemini-2.5-flash"),
});

export async function translateHadithHebrewBatchJob(input: unknown) {
  const data = TranslateSchema.parse(input);
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return { ok: false as const, error: "ai_not_configured" };
  const gateway = createLovableAiGatewayProvider(apiKey);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: rows, error } = await supabaseAdmin
    .from("hadith_entries")
    .select("id, english_text, arabic_text, narrator, collection_slug, id_in_book")
    .is("hebrew_text", null)
    .not("english_text", "is", null)
    .order("id", { ascending: true })
    .limit(data.batch);
  if (error) return { ok: false as const, error: error.message };
  if (!rows || rows.length === 0) return { ok: true as const, translated: 0, done: true };

  let translated = 0;
  for (const r of rows) {
    const prompt = `Translate the following hadith into clear, faithful Hebrew suitable for a Quran & Hadith learning platform.
Rules:
- Preserve the meaning, narrator chain spirit, and Islamic terminology.
- Do not add commentary or remove content.
- Return ONLY the Hebrew translation text, no preamble.

Collection: ${r.collection_slug} #${r.id_in_book}
Narrator: ${r.narrator ?? ""}
English source:
${r.english_text}`;
    try {
      const { text } = await withTimeout(
        generateText({
          model: gateway(data.model),
          prompt,
          temperature: 0,
          maxOutputTokens: 1200,
        }),
        25_000,
      );
      const heb = clip(text, 6000);
      if (!heb) continue;
      const { error: upErr } = await supabaseAdmin
        .from("hadith_entries")
        .update({ hebrew_text: heb })
        .eq("id", r.id);
      if (!upErr) translated += 1;
    } catch {
      // continue batch on failure
    }
  }

  return { ok: true as const, translated, model: data.model, done: false };
}
