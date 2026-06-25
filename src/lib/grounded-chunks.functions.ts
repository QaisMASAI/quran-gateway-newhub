import { z } from "zod";
import { embedTexts } from "./embeddings.server";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { generateText } from "ai";

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("generation_timeout")), timeoutMs),
    ),
  ]);
}

const RETRIEVAL_MODEL = "openai/text-embedding-3-large";

const IngestSchema = z.object({
  limit: z.number().int().min(1).max(10000).optional().default(2000),
});

type UpsertChunk = {
  source_key: string;
  content_type: "quran_ayah" | "tafsir" | "asbab" | "lesson";
  language: "he" | "ar" | "en";
  source_table: string;
  source_row_id: string | null;
  surah: number | null;
  ayah_start: number | null;
  ayah_end: number | null;
  ayah_key: string | null;
  source_name: string;
  translator_name: string | null;
  chunk_text: string;
  embedding: string | null;
  embedding_model: string;
};

function clip(input: string, max = 1800) {
  return input.replace(/\s+/g, " ").trim().slice(0, max);
}

async function buildChunkEmbeddings(texts: string[], apiKey: string) {
  if (texts.length === 0) return [] as number[][];
  const BATCH = 256;
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const slice = texts.slice(i, i + BATCH);
    const vectors = await embedTexts({
      apiKey,
      model: RETRIEVAL_MODEL,
      input: slice,
    });
    out.push(...vectors);
  }
  return out;
}

function toVectorLiteral(vec: number[]) {
  return `[${vec.join(",")}]`;
}

export async function rebuildGroundedChunksJob(input: unknown) {
  const data = IngestSchema.parse(input);
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false, error: "ai_not_configured" as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [
      arQuran,
      heQuran,
      enQuran,
      tafsirRows,
      asbabRows,
      lessonRows,
      tafsirHebRows,
      sourceRows,
    ] = await Promise.all([
      supabaseAdmin
        .from("ayah_translations")
        .select("id, source_id, surah, ayah, text")
        .eq("source_id", (await supabaseAdmin.from("translation_sources").select("id").eq("code", "arabic-original").maybeSingle()).data?.id ?? "")
        .limit(data.limit),
      supabaseAdmin
        .from("ayah_translations")
        .select("id, source_id, surah, ayah, text")
        .eq("source_id", (await supabaseAdmin.from("translation_sources").select("id").eq("code", "ben-shemesh").maybeSingle()).data?.id ?? "")
        .limit(data.limit),
      supabaseAdmin
        .from("ayah_translations")
        .select("id, source_id, surah, ayah, text")
        .eq("source_id", (await supabaseAdmin.from("translation_sources").select("id").eq("code", "saheeh-international").maybeSingle()).data?.id ?? "")
        .limit(data.limit),
      supabaseAdmin
        .from("tafsir_passages")
        .select("id, source_id, surah, ayah_start, ayah_end, lang, body")
        .limit(data.limit),
      supabaseAdmin
        .from("asbab_nuzul")
        .select("id, source_id, surah, ayah_start, ayah_end, lang, body")
        .limit(data.limit),
      supabaseAdmin
        .from("topic_lessons")
        .select("id, source_id, entity_id, lang, body")
        .limit(data.limit),
      supabaseAdmin
        .from("tafsir_hebrew")
        .select("id, original_tafsir_id, surah_id, ayah_number, source_tafsir_name, hebrew_translation")
        .limit(data.limit),
      supabaseAdmin.from("tafsir_sources").select("id, name_he, name_ar, name_en, author"),
    ]);

    const sourceById = new Map<string, { name_he: string; name_ar: string; name_en: string; author: string | null }>(
      ((sourceRows.data ?? []) as Array<{ id: string; name_he: string; name_ar: string; name_en: string; author: string | null }>).map((s) => [
        s.id,
        { name_he: s.name_he, name_ar: s.name_ar, name_en: s.name_en, author: s.author },
      ]),
    );

    const chunks: UpsertChunk[] = [];

    const pushQuran = (
      rows: Array<{ id: number; source_id: string; surah: number; ayah: number; text: string }>,
      language: "he" | "ar" | "en",
      sourceName: string,
      translatorName: string,
    ) => {
      for (const r of rows) {
        chunks.push({
          source_key: `quran:${language}:${r.surah}:${r.ayah}`,
          content_type: "quran_ayah",
          language,
          source_table: "ayah_translations",
          source_row_id: String(r.id),
          surah: r.surah,
          ayah_start: r.ayah,
          ayah_end: r.ayah,
          ayah_key: `${r.surah}:${r.ayah}`,
          source_name: sourceName,
          translator_name: translatorName,
          chunk_text: clip(r.text),
          embedding: null,
          embedding_model: RETRIEVAL_MODEL,
        });
      }
    };

    pushQuran((arQuran.data ?? []) as Array<{ id: number; source_id: string; surah: number; ayah: number; text: string }>, "ar", "Quran Arabic", "Uthmani Script");
    pushQuran((heQuran.data ?? []) as Array<{ id: number; source_id: string; surah: number; ayah: number; text: string }>, "he", "Quran Hebrew", "Aharon Ben-Shemesh");
    pushQuran((enQuran.data ?? []) as Array<{ id: number; source_id: string; surah: number; ayah: number; text: string }>, "en", "Quran English", "Saheeh International");

    for (const r of (tafsirRows.data ?? []) as Array<{ id: string; source_id: string; surah: number; ayah_start: number; ayah_end: number; lang: "he" | "ar" | "en"; body: string }>) {
      const src = sourceById.get(r.source_id);
      chunks.push({
        source_key: `tafsir:${r.id}:${r.lang}`,
        content_type: "tafsir",
        language: r.lang,
        source_table: "tafsir_passages",
        source_row_id: r.id,
        surah: r.surah,
        ayah_start: r.ayah_start,
        ayah_end: r.ayah_end,
        ayah_key: `${r.surah}:${r.ayah_start}`,
        source_name: src?.name_en ?? "Tafsir",
        translator_name: src?.author ?? null,
        chunk_text: clip(r.body),
        embedding: null,
        embedding_model: RETRIEVAL_MODEL,
      });
    }

    for (const r of (tafsirHebRows.data ?? []) as Array<{ id: string; original_tafsir_id: string; surah_id: number; ayah_number: number; source_tafsir_name: string; hebrew_translation: string }>) {
      chunks.push({
        source_key: `tafsir-he:${r.id}`,
        content_type: "tafsir",
        language: "he",
        source_table: "tafsir_hebrew",
        source_row_id: r.id,
        surah: r.surah_id,
        ayah_start: r.ayah_number,
        ayah_end: r.ayah_number,
        ayah_key: `${r.surah_id}:${r.ayah_number}`,
        source_name: r.source_tafsir_name,
        translator_name: "Hebrew Local Translation",
        chunk_text: clip(r.hebrew_translation),
        embedding: null,
        embedding_model: RETRIEVAL_MODEL,
      });
    }

    for (const r of (asbabRows.data ?? []) as Array<{ id: string; source_id: string; surah: number; ayah_start: number; ayah_end: number; lang: "he" | "ar" | "en"; body: string }>) {
      const src = sourceById.get(r.source_id);
      chunks.push({
        source_key: `asbab:${r.id}:${r.lang}`,
        content_type: "asbab",
        language: r.lang,
        source_table: "asbab_nuzul",
        source_row_id: r.id,
        surah: r.surah,
        ayah_start: r.ayah_start,
        ayah_end: r.ayah_end,
        ayah_key: `${r.surah}:${r.ayah_start}`,
        source_name: src?.name_en ?? "Asbab",
        translator_name: src?.author ?? null,
        chunk_text: clip(r.body),
        embedding: null,
        embedding_model: RETRIEVAL_MODEL,
      });
    }

    for (const r of (lessonRows.data ?? []) as Array<{ id: string; source_id: string; entity_id: string; lang: "he" | "ar" | "en"; body: string }>) {
      const src = sourceById.get(r.source_id);
      chunks.push({
        source_key: `lesson:${r.id}:${r.lang}`,
        content_type: "lesson",
        language: r.lang,
        source_table: "topic_lessons",
        source_row_id: r.id,
        surah: null,
        ayah_start: null,
        ayah_end: null,
        ayah_key: null,
        source_name: src?.name_en ?? "Lesson",
        translator_name: src?.author ?? null,
        chunk_text: clip(r.body),
        embedding: null,
        embedding_model: RETRIEVAL_MODEL,
      });
    }

    if (chunks.length === 0) return { ok: false, error: "no_source_rows" as const };

    const texts = chunks.map((c) => c.chunk_text || c.source_name);
    const vectors = await buildChunkEmbeddings(texts, apiKey);
    for (let i = 0; i < chunks.length; i += 1) {
      chunks[i].embedding = vectors[i] ? toVectorLiteral(vectors[i]) : null;
    }

    const UPSERT_BATCH = 100;
    for (let i = 0; i < chunks.length; i += UPSERT_BATCH) {
      const slice = chunks.slice(i, i + UPSERT_BATCH);
      const { error: upsertError } = await supabaseAdmin
        .from("grounded_chunks")
        .upsert(slice, { onConflict: "source_key" });
      if (upsertError) {
        return {
          ok: false,
          error: `upsert_failed:${upsertError.message}` as const,
          upserted: i,
        };
      }
    }

    return {
      ok: true,
      chunks: chunks.length,
      vectors: vectors.length,
      model: RETRIEVAL_MODEL,
    };
  }

const TranslateSchema = z.object({
  batch: z.number().int().min(1).max(200).optional().default(60),
  model: z.string().min(3).optional().default("google/gemini-2.5-flash"),
});

export async function generateHebrewTafsirJob(input: unknown) {
  const data = TranslateSchema.parse(input);
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false, error: "ai_not_configured" as const };
    const gateway = createLovableAiGatewayProvider(apiKey);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows, error } = await supabaseAdmin
      .from("tafsir_passages")
      .select("id, source_id, surah, ayah_start, ayah_end, body, source:tafsir_sources!inner(name_en,name_ar)")
      .eq("lang", "ar")
      .order("surah", { ascending: true })
      .order("ayah_start", { ascending: true })
      .limit(data.batch);

    if (error) return { ok: false, error: error.message };

    const out: Array<{
      original_tafsir_id: string;
      surah_id: number;
      ayah_number: number;
      source_tafsir_name: string;
      original_arabic_text: string;
      hebrew_translation: string;
      translation_model: string;
      quality_score: number;
    }> = [];

    for (const r of (rows ?? []) as Array<{
      id: string;
      source_id: string;
      surah: number;
      ayah_start: number;
      ayah_end: number;
      body: string;
      source: { name_en?: string; name_ar?: string } | null;
    }>) {
      const prompt = `Translate the following Arabic tafsir passage into high-quality Hebrew for a Quran learning platform.
Rules:
- Preserve Islamic meaning, scholarly tone, and verse context.
- Do not add or remove claims.
- Keep references explicit.
- Return only Hebrew translation text.

Source tafsir: ${r.source?.name_en ?? r.source?.name_ar ?? "Tafsir"}
Surah: ${r.surah}
Ayah range: ${r.ayah_start}-${r.ayah_end}
Arabic source:
${r.body}`;

      try {
        const { text } = await withTimeout(
          generateText({
            model: gateway(data.model),
            prompt,
            temperature: 0,
            maxOutputTokens: 900,
          }),
          25_000,
        );
        const heb = clip(text, 5000);
        if (!heb) continue;
        for (let ay = r.ayah_start; ay <= r.ayah_end; ay += 1) {
          out.push({
            original_tafsir_id: r.id,
            surah_id: r.surah,
            ayah_number: ay,
            source_tafsir_name: r.source?.name_en ?? "Tafsir",
            original_arabic_text: clip(r.body, 5000),
            hebrew_translation: heb,
            translation_model: data.model,
            quality_score: 0.85,
          });
        }
      } catch {
        // Skip failed row to preserve batch progress.
      }
    }

    if (out.length === 0) return { ok: false, error: "no_translations_generated" as const };

    const { error: upsertErr } = await supabaseAdmin
      .from("tafsir_hebrew")
      .upsert(out, { onConflict: "original_tafsir_id,ayah_number" });
    if (upsertErr) return { ok: false, error: upsertErr.message };

    return {
      ok: true,
      translated_rows: out.length,
      model: data.model,
    };
  }
