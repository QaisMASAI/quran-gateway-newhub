import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  DatasetBundleSchema,
  WordAnnotationsSchema,
  AudioBundleSchema,
} from "@/lib/quran-ingest.server";
import { z } from "zod";

async function requireAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (data !== true) throw new Error("Forbidden: admin access required");
}

export const upsertQuranDatasetBundle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DatasetBundleSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { ingestDatasetBundle } = await import("@/lib/quran-ingest.server");
    return ingestDatasetBundle(data, context.userId);
  });

export const upsertQuranWordAnnotations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => WordAnnotationsSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { ingestWordAnnotations } = await import("@/lib/quran-ingest.server");
    return ingestWordAnnotations(data);
  });

export const upsertQuranAudioBundle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AudioBundleSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { ingestAudioBundle } = await import("@/lib/quran-ingest.server");
    return ingestAudioBundle(data);
  });

const IngestReportIdSchema = z.object({ id: z.string().uuid() });

const IngestUploadsListSchema = z
  .object({
    limit: z.number().int().min(1).max(100).optional().default(20),
    cursor: z.string().datetime().optional(),
    status: z.enum(["running", "completed", "failed"]).optional(),
  })
  .optional()
  .default({});

export const getIngestReportById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IngestReportIdSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { data: report, error } = await context.supabase
      .from("quran_ingest_reports")
      .select(
        "id, kind, status, dataset_id, reciter_id, received, deduped, written, batches, failed_count, batch_errors, row_errors, actor_user_id, metadata, started_at, completed_at, created_at",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return report;
  });

export const listIngestReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IngestUploadsListSchema.parse(input ?? {}))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);

    let query = context.supabase
      .from("quran_ingest_reports")
      .select(
        "id, kind, status, dataset_id, reciter_id, received, deduped, written, batches, failed_count, started_at, completed_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit + 1);

    if (data.status) query = query.eq("status", data.status);
    if (data.cursor) query = query.lt("created_at", data.cursor);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    const entries = rows ?? [];
    const hasMore = entries.length > data.limit;
    const page = hasMore ? entries.slice(0, data.limit) : entries;
    const nextCursor = hasMore ? page[page.length - 1]?.created_at ?? null : null;

    return { entries: page, nextCursor, hasMore };
  });