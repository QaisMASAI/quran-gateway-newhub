import { z } from "zod";

// Shared ingestion helpers for uploaded Quran datasets. Server-only:
// loads supabaseAdmin lazily so it cannot leak into client bundles.

const RecordString = z.record(z.string(), z.string());
const RecordUnknown = z.record(z.string(), z.unknown());

export const DatasetKindSchema = z.enum([
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

export const DatasetBundleSchema = z.object({
  dataset: z.object({
    code: z.string().min(2).max(120),
    kind: DatasetKindSchema,
    title_i18n: RecordString.optional().default({}),
    description_i18n: RecordString.optional().default({}),
    language_code: z.string().max(20).optional(),
    source_name: z.string().max(200).optional(),
    source_url: z.string().url().optional(),
    source_license: z.string().max(200).optional(),
    version: z.string().max(40).optional(),
    import_mode: z.string().max(40).optional(),
    metadata: RecordUnknown.optional().default({}),
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
        title_i18n: RecordString.optional().default({}),
        body_i18n: RecordString.optional().default({}),
        payload: RecordUnknown.optional().default({}),
        metadata: RecordUnknown.optional().default({}),
      }),
    )
    .max(20000)
    .default([]),
});

export const WordAnnotationsSchema = z.object({
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
        translation_i18n: RecordString.optional().default({}),
        root_ar: z.string().max(40).optional(),
        lemma_ar: z.string().max(80).optional(),
        morphology_code: z.string().max(80).optional(),
        morphology_detail_i18n: RecordString.optional().default({}),
        pos_tag: z.string().max(40).optional(),
        grammar_i18n: RecordString.optional().default({}),
        tajweed_i18n: RecordString.optional().default({}),
        tajweed_rule_codes: z.array(z.string().max(60)).max(20).optional().default([]),
        audio_start_ms: z.number().int().min(0).optional(),
        audio_end_ms: z.number().int().min(0).optional(),
        metadata: RecordUnknown.optional().default({}),
      }),
    )
    .max(20000),
});

export const AudioBundleSchema = z.object({
  reciter: z.object({
    code: z.string().min(2).max(120),
    name_i18n: RecordString.optional().default({}),
    style: z.string().max(80).optional(),
    country_code: z.string().max(10).optional(),
    metadata: RecordUnknown.optional().default({}),
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
        metadata: RecordUnknown.optional().default({}),
      }),
    )
    .max(20000),
});

export type DatasetBundleInput = z.infer<typeof DatasetBundleSchema>;
export type WordAnnotationsInput = z.infer<typeof WordAnnotationsSchema>;
export type AudioBundleInput = z.infer<typeof AudioBundleSchema>;

export interface IngestReport {
  ok: true;
  received: number;
  deduped: number;
  written: number;
  batches: number;
  datasetId?: string;
  reciterId?: string;
  uploadId?: string;
}

async function recordReport(
  kind: "dataset" | "words" | "audio",
  report: IngestReport,
  actorUserId: string | null,
  metadata: Record<string, unknown> = {},
): Promise<string | undefined> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("quran_ingest_reports")
      .insert({
        kind,
        dataset_id: report.datasetId ?? null,
        reciter_id: report.reciterId ?? null,
        received: report.received,
        deduped: report.deduped,
        written: report.written,
        batches: report.batches,
        actor_user_id: actorUserId,
        metadata: metadata as never,
      } as never)
      .select("id")
      .single();
    if (error || !data?.id) return undefined;
    return (data as { id: string }).id;
  } catch {
    return undefined;
  }
}

function dedupeBy<T>(rows: T[], keyFn: (row: T) => string): { rows: T[]; deduped: number } {
  const seen = new Map<string, T>();
  for (const r of rows) seen.set(keyFn(r), r); // later occurrences win
  return { rows: Array.from(seen.values()), deduped: rows.length - seen.size };
}

async function batchUpsert<T>(
  table: string,
  rows: T[],
  onConflict: string,
  batchSize = 500,
): Promise<number> {
  if (rows.length === 0) return 0;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let batches = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const slice = rows.slice(i, i + batchSize);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin.from(table as never) as any).upsert(slice, {
      onConflict,
    });
    if (error) throw new Error(`${table} upsert failed at batch ${batches + 1}: ${error.message}`);
    batches += 1;
  }
  return batches;
}

export async function ingestDatasetBundle(
  input: DatasetBundleInput,
  actorUserId: string | null,
): Promise<IngestReport> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: datasetRow, error: datasetError } = await supabaseAdmin
    .from("quran_datasets")
    .upsert(
      {
        code: input.dataset.code,
        kind: input.dataset.kind,
        title_i18n: input.dataset.title_i18n,
        description_i18n: input.dataset.description_i18n,
        language_code: input.dataset.language_code ?? null,
        source_name: input.dataset.source_name ?? null,
        source_url: input.dataset.source_url ?? null,
        source_license: input.dataset.source_license ?? null,
        version: input.dataset.version ?? "v1",
        import_mode: input.dataset.import_mode ?? "json",
        metadata: input.dataset.metadata as never,
        is_public: input.dataset.is_public,
        is_active: input.dataset.is_active,
        created_by: actorUserId,
      } as never,
      { onConflict: "code" },
    )
    .select("id")
    .single();

  if (datasetError || !datasetRow?.id) {
    throw new Error(datasetError?.message ?? "Failed to upsert dataset");
  }

  const received = input.items.length;
  const mapped = input.items.map((item) => ({
    dataset_id: datasetRow.id,
    external_key: item.external_key,
    content_type: item.content_type,
    language_code: item.language_code ?? input.dataset.language_code ?? null,
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
  const { rows, deduped } = dedupeBy(mapped, (r) => `${r.dataset_id}::${r.external_key}`);
  const batches = await batchUpsert(
    "quran_dataset_items",
    rows,
    "dataset_id,external_key",
  );
  return {
    ok: true,
    received,
    deduped,
    written: rows.length,
    batches,
    datasetId: datasetRow.id,
  };
}

export async function ingestWordAnnotations(
  input: WordAnnotationsInput,
): Promise<IngestReport> {
  const received = input.rows.length;
  const { rows, deduped } = dedupeBy(
    input.rows,
    (r) => `${r.surah}::${r.ayah}::${r.word_index}`,
  );
  const batches = await batchUpsert(
    "quran_word_annotations",
    rows,
    "surah,ayah,word_index",
  );
  return { ok: true, received, deduped, written: rows.length, batches };
}

export async function ingestAudioBundle(
  input: AudioBundleInput,
): Promise<IngestReport> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: reciterRow, error: reciterError } = await supabaseAdmin
    .from("quran_reciters")
    .upsert(
      {
        code: input.reciter.code,
        name_i18n: input.reciter.name_i18n,
        style: input.reciter.style ?? null,
        country_code: input.reciter.country_code ?? null,
        metadata: input.reciter.metadata as never,
        is_active: true,
      } as never,
      { onConflict: "code" },
    )
    .select("id")
    .single();
  if (reciterError || !reciterRow?.id) {
    throw new Error(reciterError?.message ?? "Failed to upsert reciter");
  }

  const received = input.files.length;
  const mapped = input.files.map((f) => ({
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
  const { rows, deduped } = dedupeBy(
    mapped,
    (r) => `${r.reciter_id}::${r.surah}::${r.ayah ?? "_"}::${r.quality_label}`,
  );
  const batches = await batchUpsert(
    "quran_audio_files",
    rows,
    "reciter_id,surah,ayah,quality_label",
  );
  return {
    ok: true,
    received,
    deduped,
    written: rows.length,
    batches,
    reciterId: reciterRow.id,
  };
}

export const IngestEnvelopeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("dataset"), payload: DatasetBundleSchema }),
  z.object({ kind: z.literal("words"), payload: WordAnnotationsSchema }),
  z.object({ kind: z.literal("audio"), payload: AudioBundleSchema }),
]);

export type IngestEnvelope = z.infer<typeof IngestEnvelopeSchema>;

export async function ingestEnvelope(
  env: IngestEnvelope,
  actorUserId: string | null,
): Promise<IngestReport> {
  let report: IngestReport;
  switch (env.kind) {
    case "dataset":
      report = await ingestDatasetBundle(env.payload, actorUserId);
      break;
    case "words":
      report = await ingestWordAnnotations(env.payload);
      break;
    case "audio":
      report = await ingestAudioBundle(env.payload);
      break;
  }
  const uploadId = await recordReport(env.kind, report, actorUserId);
  return { ...report, uploadId };
}