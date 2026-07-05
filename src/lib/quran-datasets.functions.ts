import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DatasetKindSchema = z.enum([
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
]);

async function requireAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (data !== true) throw new Error("Forbidden: admin access required");
}

const UpsertDatasetSchema = z.object({
  dataset: z.object({
    code: z.string().min(2).max(120),
    kind: DatasetKindSchema,
    title_i18n: z.record(z.string(), z.string()).optional().default({}),
    description_i18n: z.record(z.string(), z.string()).optional().default({}),
    language_code: z.string().max(20).optional(),
    source_name: z.string().max(200).optional(),
    source_url: z.string().url().optional(),
    source_license: z.string().max(200).optional(),
    version: z.string().max(40).optional(),
    import_mode: z.string().max(40).optional(),
    metadata: z.record(z.string(), z.unknown()).optional().default({}),
    is_public: z.boolean().optional().default(true),
    is_active: z.boolean().optional().default(true),
  }),
  items: z
    .array(
      z.object({
        external_key: z.string().min(1).max(300),
        content_type: z.string().min(1).max(80).optional().default("entry"),
        language_code: z.string().max(20).optional(),
        surah: z.number().int().min(1).max(114).optional(),
        ayah_start: z.number().int().min(1).max(286).optional(),
        ayah_end: z.number().int().min(1).max(286).optional(),
        juz: z.number().int().min(1).max(30).optional(),
        hizb: z.number().int().min(1).max(60).optional(),
        page: z.number().int().min(1).max(1000).optional(),
        revelation_order: z.number().int().min(1).max(114).optional(),
        chronology_order: z.number().int().min(1).optional(),
        is_meccan: z.boolean().optional(),
        tags: z.array(z.string().max(80)).max(60).optional().default([]),
        title_i18n: z.record(z.string(), z.string()).optional().default({}),
        body_i18n: z.record(z.string(), z.string()).optional().default({}),
        payload: z.record(z.string(), z.unknown()).optional().default({}),
        metadata: z.record(z.string(), z.unknown()).optional().default({}),
      }),
    )
    .max(5000)
    .default([]),
});

export const upsertQuranDatasetBundle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpsertDatasetSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: datasetRow, error: datasetError } = await supabaseAdmin
      .from("quran_datasets")
      .upsert(
        {
          code: data.dataset.code,
          kind: data.dataset.kind,
          title_i18n: data.dataset.title_i18n,
          description_i18n: data.dataset.description_i18n,
          language_code: data.dataset.language_code ?? null,
          source_name: data.dataset.source_name ?? null,
          source_url: data.dataset.source_url ?? null,
          source_license: data.dataset.source_license ?? null,
          version: data.dataset.version ?? "v1",
          import_mode: data.dataset.import_mode ?? "json",
          metadata: data.dataset.metadata as any,
          is_public: data.dataset.is_public,
          is_active: data.dataset.is_active,
          created_by: context.userId,
        },
        { onConflict: "code" },
      )
      .select("id,code")
      .single();

    if (datasetError || !datasetRow?.id) {
      throw new Error(datasetError?.message ?? "Failed to create dataset");
    }

    if (data.items.length === 0) {
      return { ok: true as const, datasetId: datasetRow.id, items: 0 };
    }

    const records = data.items.map((item) => ({
      dataset_id: datasetRow.id,
      external_key: item.external_key,
      content_type: item.content_type,
      language_code: item.language_code ?? data.dataset.language_code ?? null,
      surah: item.surah ?? null,
      ayah_start: item.ayah_start ?? null,
      ayah_end: item.ayah_end ?? null,
      juz: item.juz ?? null,
      hizb: item.hizb ?? null,
      page: item.page ?? null,
      revelation_order: item.revelation_order ?? null,
      chronology_order: item.chronology_order ?? null,
      is_meccan: item.is_meccan ?? null,
      tags: item.tags,
      title_i18n: item.title_i18n,
      body_i18n: item.body_i18n,
      payload: item.payload,
      metadata: item.metadata,
      publication_status: "published",
    }));

    const BATCH = 500;
    let inserted = 0;
    for (let i = 0; i < records.length; i += BATCH) {
      const slice = records.slice(i, i + BATCH);
      const { error } = await supabaseAdmin
        .from("quran_dataset_items")
        .upsert(slice as any, { onConflict: "dataset_id,external_key" });
      if (error) throw new Error(error.message);
      inserted += slice.length;
    }

    return { ok: true as const, datasetId: datasetRow.id, items: inserted };
  });

const UpsertWordAnnotationsSchema = z.object({
  rows: z
    .array(
      z.object({
        surah: z.number().int().min(1).max(114),
        ayah: z.number().int().min(1).max(286),
        word_index: z.number().int().min(1).max(400),
        token_ar: z.string().min(1).max(120),
        token_uthmani: z.string().max(120).optional(),
        normalized_ar: z.string().max(120).optional(),
        transliteration_en: z.string().max(240).optional(),
        transliteration_he: z.string().max(240).optional(),
        translation_i18n: z.record(z.string(), z.string()).optional().default({}),
        root_ar: z.string().max(40).optional(),
        lemma_ar: z.string().max(80).optional(),
        morphology_code: z.string().max(80).optional(),
        morphology_detail_i18n: z.record(z.string(), z.string()).optional().default({}),
        pos_tag: z.string().max(40).optional(),
        grammar_i18n: z.record(z.string(), z.string()).optional().default({}),
        tajweed_i18n: z.record(z.string(), z.string()).optional().default({}),
        tajweed_rule_codes: z.array(z.string().max(60)).max(20).optional().default([]),
        audio_start_ms: z.number().int().min(0).optional(),
        audio_end_ms: z.number().int().min(0).optional(),
        metadata: z.record(z.string(), z.unknown()).optional().default({}),
      }),
    )
    .max(4000),
});

export const upsertQuranWordAnnotations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpsertWordAnnotationsSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("quran_word_annotations")
      .upsert(data.rows as any, { onConflict: "surah,ayah,word_index" });
    if (error) throw new Error(error.message);
    return { ok: true as const, rows: data.rows.length };
  });

const UpsertAudioSchema = z.object({
  reciter: z.object({
    code: z.string().min(2).max(120),
    name_i18n: z.record(z.string(), z.string()).optional().default({}),
    style: z.string().max(80).optional(),
    country_code: z.string().max(10).optional(),
    metadata: z.record(z.string(), z.unknown()).optional().default({}),
  }),
  files: z
    .array(
      z.object({
        surah: z.number().int().min(1).max(114),
        ayah: z.number().int().min(1).max(286).optional(),
        quality_label: z.string().min(2).max(40),
        bitrate_kbps: z.number().int().min(8).max(1024).optional(),
        format: z.string().max(20).optional().default("mp3"),
        url: z.string().url(),
        duration_ms: z.number().int().min(1).optional(),
        checksum: z.string().max(120).optional(),
        metadata: z.record(z.string(), z.unknown()).optional().default({}),
      }),
    )
    .max(5000),
});

export const upsertQuranAudioBundle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpsertAudioSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: reciterRow, error: reciterError } = await supabaseAdmin
      .from("quran_reciters")
      .upsert(
        {
          code: data.reciter.code,
          name_i18n: data.reciter.name_i18n,
          style: data.reciter.style ?? null,
          country_code: data.reciter.country_code ?? null,
          metadata: data.reciter.metadata as any,
          is_active: true,
        },
        { onConflict: "code" },
      )
      .select("id")
      .single();

    if (reciterError || !reciterRow?.id) {
      throw new Error(reciterError?.message ?? "Failed to upsert reciter");
    }

    const rows = data.files.map((f) => ({
      reciter_id: reciterRow.id,
      surah: f.surah,
      ayah: f.ayah ?? null,
      quality_label: f.quality_label,
      bitrate_kbps: f.bitrate_kbps ?? null,
      format: f.format,
      url: f.url,
      duration_ms: f.duration_ms ?? null,
      checksum: f.checksum ?? null,
      metadata: f.metadata,
    }));

    const BATCH = 500;
    for (let i = 0; i < rows.length; i += BATCH) {
      const slice = rows.slice(i, i + BATCH);
      const { error } = await supabaseAdmin
        .from("quran_audio_files")
        .upsert(slice as any, { onConflict: "reciter_id,surah,ayah,quality_label" });
      if (error) throw new Error(error.message);
    }

    return { ok: true as const, reciterId: reciterRow.id, files: rows.length };
  });
