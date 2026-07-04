import { z } from "zod";
import { embedTexts } from "./embeddings.server";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { generateText } from "ai";
import { validateHebrewTranslationTriplet } from "@/lib/hebrew-translation-guards";

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("generation_timeout")), timeoutMs)),
  ]);
}

const RETRIEVAL_MODEL = "openai/text-embedding-3-large";

const IngestSchema = z.object({
  limit: z.number().int().min(1).max(10000).optional().default(2000),
  offset: z.number().int().min(0).optional().default(0),
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

  const [arQuran, heQuran, enQuran, tafsirRows, asbabRows, lessonRows, tafsirHebRows, sourceRows] =
    await Promise.all([
      supabaseAdmin
        .from("ayah_translations")
        .select("id, source_id, surah, ayah, text")
        .eq(
          "source_id",
          (await supabaseAdmin.from("translation_sources").select("id").eq("code", "arabic-original").maybeSingle())
            .data?.id ?? "",
        )
        .limit(data.limit),
      supabaseAdmin
        .from("ayah_translations")
        .select("id, source_id, surah, ayah, text")
        .eq(
          "source_id",
          (await supabaseAdmin.from("translation_sources").select("id").eq("code", "ben-shemesh").maybeSingle()).data
            ?.id ?? "",
        )
        .limit(data.limit),
      supabaseAdmin
        .from("ayah_translations")
        .select("id, source_id, surah, ayah, text")
        .eq(
          "source_id",
          (await supabaseAdmin
            .from("translation_sources")
            .select("id")
            .eq("code", "saheeh-international")
            .maybeSingle()).data?.id ?? "",
        )
        .limit(data.limit),
      supabaseAdmin
        .from("tafsir_passages")
        .select("id, source_id, surah, ayah_start, ayah_end, lang, body")
        .order("id", { ascending: true })
        .range(data.offset, data.offset + data.limit - 1),
      supabaseAdmin.from("asbab_nuzul").select("id, source_id, surah, ayah_start, ayah_end, lang, body").limit(data.limit),
      supabaseAdmin.from("topic_lessons").select("id, source_id, entity_id, lang, body").limit(data.limit),
      supabaseAdmin
        .from("tafsir_hebrew")
        .select("id, original_tafsir_id, surah_id, ayah_number, source_tafsir_name, hebrew_translation")
        .limit(data.limit),
      supabaseAdmin.from("tafsir_sources").select("id, name_he, name_ar, name_en, author"),
    ]);

  const sourceById = new Map<
    string,
    { name_he: string; name_ar: string; name_en: string; author: string | null }
  >(
    (
      (sourceRows.data ?? []) as Array<{ id: string; name_he: string; name_ar: string; name_en: string; author: string | null }>
    ).map((s) => [s.id, { name_he: s.name_he, name_ar: s.name_ar, name_en: s.name_en, author: s.author }]),
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

  pushQuran(
    (arQuran.data ?? []) as Array<{ id: number; source_id: string; surah: number; ayah: number; text: string }>,
    "ar",
    "Quran Arabic",
    "Uthmani Script",
  );
  pushQuran(
    (heQuran.data ?? []) as Array<{ id: number; source_id: string; surah: number; ayah: number; text: string }>,
    "he",
    "Quran Hebrew",
    "Aharon Ben-Shemesh",
  );
  pushQuran(
    (enQuran.data ?? []) as Array<{ id: number; source_id: string; surah: number; ayah: number; text: string }>,
    "en",
    "Quran English",
    "Saheeh International",
  );

  for (const r of (tafsirRows.data ?? []) as Array<{
    id: string;
    source_id: string;
    surah: number;
    ayah_start: number;
    ayah_end: number;
    lang: "he" | "ar" | "en";
    body: string;
  }>) {
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

  for (const r of (tafsirHebRows.data ?? []) as Array<{
    id: string;
    original_tafsir_id: string;
    surah_id: number;
    ayah_number: number;
    source_tafsir_name: string;
    hebrew_translation: string;
  }>) {
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

  for (const r of (asbabRows.data ?? []) as Array<{
    id: string;
    source_id: string;
    surah: number;
    ayah_start: number;
    ayah_end: number;
    lang: "he" | "ar" | "en";
    body: string;
  }>) {
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

  for (const r of (lessonRows.data ?? []) as Array<{
    id: string;
    source_id: string;
    entity_id: string;
    lang: "he" | "ar" | "en";
    body: string;
  }>) {
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
    const { error: upsertError } = await supabaseAdmin.from("grounded_chunks").upsert(slice, { onConflict: "source_key" });
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
  batch: z.number().int().min(1).max(1200).optional().default(600),
  model: z.string().min(3).optional().default("google/gemini-2.5-flash"),
});

type QuranTafsirApiRow = {
  verse_key?: string;
  text?: string;
};

type QuranTafsirResource = {
  id: number;
  slug?: string;
  name?: string;
};

function stripHtml(input: string): string {
  return input
    .replace(/<sup[^>]*>.*?<\/sup>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAsbabSnippetEnglish(input: string): string | null {
  const clean = stripHtml(input);
  if (!clean) return null;
  const match = clean.match(
    /(occasion of revelation|reason for revelation|this verse was revealed|revealed concerning)([\s\S]{0,900})/i,
  );
  if (!match) return null;
  const body = `${match[1]} ${match[2]}`.trim();
  return body.length >= 60 ? body.slice(0, 1200) : null;
}

async function resolveTafsirResourceIds() {
  const [enRes, allRes] = await Promise.all([
    fetch("https://api.quran.com/api/v4/resources/tafsirs?language=en"),
    fetch("https://api.quran.com/api/v4/resources/tafsirs"),
  ]);

  const enJson = (await enRes.json().catch(() => ({}))) as { tafsirs?: QuranTafsirResource[] };
  const allJson = (await allRes.json().catch(() => ({}))) as { tafsirs?: QuranTafsirResource[] };
  const enRows = enJson.tafsirs ?? [];
  const allRows = allJson.tafsirs ?? [];

  const byName = (rows: QuranTafsirResource[], re: RegExp) =>
    rows.find((r) => re.test(`${r.slug ?? ""} ${r.name ?? ""}`));

  const tafsirEn =
    byName(enRows, /jalalayn|jalal/i) ??
    byName(enRows, /ibn\s*kathir|qurtubi|muyassar|saadi/i) ??
    enRows[0] ??
    null;
  const asbabEn =
    byName(allRows, /asbab|nuzul|occasion/i) ?? byName(enRows, /asbab|nuzul|occasion/i) ?? null;

  return {
    tafsirEnId: tafsirEn?.id ?? null,
    asbabEnId: asbabEn?.id ?? null,
  };
}

async function fetchQuranTafsirByChapter(tafsirId: number, surah: number, perPage = 50) {
  const out: QuranTafsirApiRow[] = [];
  let page = 1;

  while (page <= 20) {
    const res = await fetch(
      `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_chapter/${surah}?page=${page}&per_page=${perPage}`,
    );
    if (!res.ok) break;
    const json = (await res.json()) as {
      tafsirs?: QuranTafsirApiRow[];
      pagination?: { next_page?: number | null };
    };
    const rows = json.tafsirs ?? [];
    if (rows.length === 0) break;
    out.push(...rows);
    if (!json.pagination?.next_page) break;
    page = json.pagination.next_page;
  }

  return out;
}

export async function generateEnglishTafsirJob(input: unknown) {
  const data = TranslateSchema.parse(input);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ data: sourceRows, error: sourceError }, resourceIds] = await Promise.all([
    supabaseAdmin.from("tafsir_sources").select("id,slug"),
    resolveTafsirResourceIds(),
  ]);

  if (sourceError) return { ok: false, error: sourceError.message };
  if (!resourceIds.tafsirEnId) {
    return { ok: false, error: "No authenticated English tafsir source found in Quran API" };
  }

  const jalalaynSource =
    ((sourceRows ?? []) as Array<{ id: string; slug: string }>).find((s) => s.slug === "al_jalalayn") ??
    ((sourceRows ?? []) as Array<{ id: string; slug: string }>)[0] ??
    null;
  if (!jalalaynSource) return { ok: false, error: "No tafsir source configured" };

  type TafsirInsertRow = {
    source_id: string;
    surah: number;
    ayah_start: number;
    ayah_end: number;
    lang: "en";
    body: string;
    citation: string | null;
  };

  type AsbabInsertRow = {
    source_id: string;
    surah: number;
    ayah_start: number;
    ayah_end: number;
    lang: "en";
    body: string;
    citation: string | null;
  };

  const tafsirOut: TafsirInsertRow[] = [];
  const asbabOut: AsbabInsertRow[] = [];
  const failedBatches: string[] = [];
  let remaining = data.batch;

  for (let surah = 1; surah <= 114 && remaining > 0; surah += 1) {
    const rows = await fetchQuranTafsirByChapter(resourceIds.tafsirEnId, surah, 50);
    for (const r of rows) {
      const [sRaw, aRaw] = String(r.verse_key ?? "").split(":");
      const s = Number(sRaw);
      const a = Number(aRaw);
      const body = stripHtml(r.text ?? "");
      if (!s || !a || !body) {
        failedBatches.push(`tafsir:${surah}:${String(r.verse_key ?? "?")}`);
        continue;
      }

      tafsirOut.push({
        source_id: jalalaynSource.id,
        surah: s,
        ayah_start: a,
        ayah_end: a,
        lang: "en",
        body,
        citation: `Quran.com authenticated tafsir ${resourceIds.tafsirEnId} ${s}:${a}`,
      });

      const asbabFromTafsir = extractAsbabSnippetEnglish(body);
      if (asbabFromTafsir) {
        asbabOut.push({
          source_id: jalalaynSource.id,
          surah: s,
          ayah_start: a,
          ayah_end: a,
          lang: "en",
          body: asbabFromTafsir,
          citation: `Quran.com tafsir-derived asbab ${resourceIds.tafsirEnId} ${s}:${a}`,
        });
      }

      remaining -= 1;
      if (remaining <= 0) break;
    }
  }

  if (resourceIds.asbabEnId) {
    let left = Math.max(1, Math.floor(data.batch / 2));
    for (let surah = 1; surah <= 114 && left > 0; surah += 1) {
      const rows = await fetchQuranTafsirByChapter(resourceIds.asbabEnId, surah, 50);
      for (const r of rows) {
        const [sRaw, aRaw] = String(r.verse_key ?? "").split(":");
        const s = Number(sRaw);
        const a = Number(aRaw);
        const body = stripHtml(r.text ?? "");
        if (!s || !a || !body) continue;
        asbabOut.push({
          source_id: jalalaynSource.id,
          surah: s,
          ayah_start: a,
          ayah_end: a,
          lang: "en",
          body: clip(body, 1500),
          citation: `Quran.com authenticated asbab ${resourceIds.asbabEnId} ${s}:${a}`,
        });
        left -= 1;
        if (left <= 0) break;
      }
    }
  }

  if (tafsirOut.length === 0 && asbabOut.length === 0) {
    return { ok: false, error: "no_rows_fetched_from_authenticated_api" as const, failedBatches };
  }

  for (const row of tafsirOut) {
    await supabaseAdmin
      .from("tafsir_passages")
      .delete()
      .eq("source_id", row.source_id)
      .eq("surah", row.surah)
      .eq("ayah_start", row.ayah_start)
      .eq("ayah_end", row.ayah_end)
      .eq("lang", "en");
  }

  for (const row of asbabOut) {
    await supabaseAdmin
      .from("asbab_nuzul")
      .delete()
      .eq("source_id", row.source_id)
      .eq("surah", row.surah)
      .eq("ayah_start", row.ayah_start)
      .eq("ayah_end", row.ayah_end)
      .eq("lang", "en");
  }

  if (tafsirOut.length > 0) {
    const { error: tafErr } = await supabaseAdmin.from("tafsir_passages").insert(tafsirOut);
    if (tafErr) return { ok: false, error: tafErr.message };
  }

  if (asbabOut.length > 0) {
    const { error: asbErr } = await supabaseAdmin.from("asbab_nuzul").insert(asbabOut);
    if (asbErr) return { ok: false, error: asbErr.message };
  }

  return {
    ok: true,
    translated_rows: tafsirOut.length,
    asbab_rows: asbabOut.length,
    failedBatches,
    source: "Quran.com authenticated API",
    tafsirResourceId: resourceIds.tafsirEnId,
    asbabResourceId: resourceIds.asbabEnId,
  };
}

export async function generateHebrewTafsirJob(input: unknown) {
  const data = TranslateSchema.parse(input);
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return { ok: false, error: "ai_not_configured" as const };
  const gateway = createLovableAiGatewayProvider(apiKey);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: jalalaynSource, error: jalalaynErr } = await supabaseAdmin
    .from("tafsir_sources")
    .select("id")
    .eq("slug", "al_jalalayn")
    .maybeSingle();

  if (jalalaynErr) return { ok: false, error: jalalaynErr.message };
  if (!jalalaynSource?.id) {
    return { ok: false, error: "Al-Jalalayn source is not configured" as const };
  }

  const [heTafsirKeysRes, enTafsirRes, arTafsirRes, heAsbabKeysRes, enAsbabRes, arAsbabRes] = await Promise.all([
    supabaseAdmin
      .from("tafsir_passages")
      .select("source_id,surah,ayah_start,ayah_end")
      .eq("lang", "he")
      .eq("source_id", jalalaynSource.id),
    supabaseAdmin
      .from("tafsir_passages")
      .select("source_id,surah,ayah_start,ayah_end,body")
      .eq("lang", "en")
      .eq("source_id", jalalaynSource.id)
      .order("surah", { ascending: true })
      .order("ayah_start", { ascending: true })
      .limit(data.batch * 3),
    supabaseAdmin
      .from("tafsir_passages")
      .select("source_id,surah,ayah_start,ayah_end,body")
      .eq("lang", "ar")
      .eq("source_id", jalalaynSource.id)
      .order("surah", { ascending: true })
      .order("ayah_start", { ascending: true })
      .limit(data.batch * 3),
    supabaseAdmin.from("asbab_nuzul").select("source_id,surah,ayah_start,ayah_end").eq("lang", "he"),
    supabaseAdmin
      .from("asbab_nuzul")
      .select("source_id,surah,ayah_start,ayah_end,body")
      .eq("lang", "en")
      .order("surah", { ascending: true })
      .order("ayah_start", { ascending: true })
      .limit(data.batch * 2),
    supabaseAdmin
      .from("asbab_nuzul")
      .select("source_id,surah,ayah_start,ayah_end,body")
      .eq("lang", "ar")
      .order("surah", { ascending: true })
      .order("ayah_start", { ascending: true })
      .limit(data.batch * 2),
  ]);

  const error =
    heTafsirKeysRes.error ?? enTafsirRes.error ?? arTafsirRes.error ?? heAsbabKeysRes.error ?? enAsbabRes.error ?? arAsbabRes.error;
  if (error) return { ok: false, error: error.message };

  const existingTafsirKeys = new Set(
    ((heTafsirKeysRes.data ?? []) as Array<{ source_id: string; surah: number; ayah_start: number; ayah_end: number }>).map(
      (r) => `${r.source_id}:${r.surah}:${r.ayah_start}:${r.ayah_end}`,
    ),
  );
  const existingAsbabKeys = new Set(
    ((heAsbabKeysRes.data ?? []) as Array<{ source_id: string; surah: number; ayah_start: number; ayah_end: number }>).map(
      (r) => `${r.source_id}:${r.surah}:${r.ayah_start}:${r.ayah_end}`,
    ),
  );

  const enTafsirRows = (enTafsirRes.data ?? []) as Array<{
    source_id: string;
    surah: number;
    ayah_start: number;
    ayah_end: number;
    body: string;
  }>;
  const arTafsirRows = (arTafsirRes.data ?? []) as Array<{
    source_id: string;
    surah: number;
    ayah_start: number;
    ayah_end: number;
    body: string;
  }>;

  const enByKey = new Map<string, string>(
    enTafsirRows.map((r) => [`${r.source_id}:${r.surah}:${r.ayah_start}:${r.ayah_end}`, r.body]),
  );
  const arByKey = new Map<string, string>(
    arTafsirRows.map((r) => [`${r.source_id}:${r.surah}:${r.ayah_start}:${r.ayah_end}`, r.body]),
  );

  const tafsirKeysToTranslate = [...new Set([...enByKey.keys(), ...arByKey.keys()])]
    .filter((key) => !existingTafsirKeys.has(key))
    .slice(0, data.batch);

  const asbabRows = [
    ...((enAsbabRes.data ?? []) as Array<{
      source_id: string;
      surah: number;
      ayah_start: number;
      ayah_end: number;
      body: string;
    }>),
    ...((arAsbabRes.data ?? []) as Array<{
      source_id: string;
      surah: number;
      ayah_start: number;
      ayah_end: number;
      body: string;
    }>),
  ]
    .filter((r) => !existingAsbabKeys.has(`${r.source_id}:${r.surah}:${r.ayah_start}:${r.ayah_end}`))
    .slice(0, data.batch);

  const tafsirOut: Array<{
    source_id: string;
    surah: number;
    ayah_start: number;
    ayah_end: number;
    lang: "he";
    body: string;
    citation: string | null;
  }> = [];

  const asbabOut: Array<{
    source_id: string;
    surah: number;
    ayah_start: number;
    ayah_end: number;
    lang: "he";
    body: string;
    citation: string | null;
  }> = [];

  const failedBatches: string[] = [];
  let validationSkipped = 0;

  for (const key of tafsirKeysToTranslate) {
    const [sourceId, surahRaw, ayahStartRaw, ayahEndRaw] = key.split(":");
    const surah = Number(surahRaw);
    const ayahStart = Number(ayahStartRaw);
    const ayahEnd = Number(ayahEndRaw);
    const arabicBody = arByKey.get(key) ?? "";
    const englishBody = enByKey.get(key) ?? "";

    if (!sourceId || !surah || !ayahStart || !ayahEnd) {
      failedBatches.push(`tafsir:${surahRaw ?? "?"}:${ayahStartRaw ?? "?"}`);
      continue;
    }

    // Hard gate: Hebrew Al-Jalalayn is only generated when BOTH Arabic and
    // English source passages exist for the exact same verse range.
    if (!arabicBody || !englishBody) {
      const reason = !arabicBody ? "missing_arabic" : "missing_english";
      validationSkipped += 1;
      failedBatches.push(`tafsir:${surah}:${ayahStart}:${reason}`);
      continue;
    }

    const prompt = `Translate the following Al-Jalalayn tafsir passage into high-quality Hebrew for a Quran learning platform.
Rules:
- Preserve Islamic meaning, scholarly tone, and verse context.
- Do not add or remove claims.
- If Arabic and English differ, prioritize Arabic meaning while using English to resolve phrasing.
- Return only Hebrew translation text.

Surah: ${surah}
Ayah range: ${ayahStart}-${ayahEnd}

Arabic source:
${arabicBody || "(not available)"}

English source:
${englishBody || "(not available)"}`;

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
      const heb = clip(text, 6000);
      const qualityGate = validateHebrewTranslationTriplet({
        arabic: arabicBody,
        english: englishBody,
        hebrew: heb,
      });
      if (!qualityGate.ok) {
        validationSkipped += 1;
        failedBatches.push(`tafsir:${surah}:${ayahStart}:${qualityGate.reason}`);
        continue;
      }
      tafsirOut.push({
        source_id: sourceId,
        surah,
        ayah_start: ayahStart,
        ayah_end: ayahEnd,
        lang: "he",
        body: heb,
        citation: `HE translation from authenticated Al-Jalalayn tafsir ${surah}:${ayahStart}-${ayahEnd}`,
      });
    } catch {
      failedBatches.push(`tafsir:${surah}:${ayahStart}`);
    }
  }

  for (const r of asbabRows) {
    const prompt = `Translate the following Asbab al-Nuzul passage into accurate Hebrew.
Rules:
- Preserve context and historical wording.
- Do not add commentary.
- Return only Hebrew text.

Surah: ${r.surah}
Ayah range: ${r.ayah_start}-${r.ayah_end}
Source text:
${r.body}`;

    try {
      const { text } = await withTimeout(
        generateText({
          model: gateway(data.model),
          prompt,
          temperature: 0,
          maxOutputTokens: 800,
        }),
        25_000,
      );
      const heb = clip(text, 4000);
      if (!heb) {
        failedBatches.push(`asbab:${r.surah}:${r.ayah_start}`);
        continue;
      }
      asbabOut.push({
        source_id: r.source_id,
        surah: r.surah,
        ayah_start: r.ayah_start,
        ayah_end: r.ayah_end,
        lang: "he",
        body: heb,
        citation: `HE translation from authenticated asbab ${r.surah}:${r.ayah_start}-${r.ayah_end}`,
      });
    } catch {
      failedBatches.push(`asbab:${r.surah}:${r.ayah_start}`);
    }
  }

  if (tafsirOut.length === 0 && asbabOut.length === 0) {
    return { ok: false, error: "no_translations_generated" as const, failedBatches };
  }

  for (const row of tafsirOut) {
    await supabaseAdmin
      .from("tafsir_passages")
      .delete()
      .eq("source_id", row.source_id)
      .eq("surah", row.surah)
      .eq("ayah_start", row.ayah_start)
      .eq("ayah_end", row.ayah_end)
      .eq("lang", "he");
  }

  for (const row of asbabOut) {
    await supabaseAdmin
      .from("asbab_nuzul")
      .delete()
      .eq("source_id", row.source_id)
      .eq("surah", row.surah)
      .eq("ayah_start", row.ayah_start)
      .eq("ayah_end", row.ayah_end)
      .eq("lang", "he");
  }

  if (tafsirOut.length > 0) {
    const { error: tafErr } = await supabaseAdmin.from("tafsir_passages").insert(tafsirOut);
    if (tafErr) return { ok: false, error: tafErr.message };
  }

  if (asbabOut.length > 0) {
    const { error: asbErr } = await supabaseAdmin.from("asbab_nuzul").insert(asbabOut);
    if (asbErr) return { ok: false, error: asbErr.message };
  }

  return {
    ok: true,
    translated_rows: tafsirOut.length + asbabOut.length,
    tafsir_translated_rows: tafsirOut.length,
    asbab_translated_rows: asbabOut.length,
    validation_skipped_rows: validationSkipped,
    failedBatches,
    model: data.model,
  };
}
