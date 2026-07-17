import type { Database } from "@/integrations/supabase/types";
import { runWithProviderFallback } from "@/lib/hadith-providers.server";

export type HadithImportReport = {
  ok: boolean;
  jobId: string;
  provider: string;
  collection: string;
  booksProcessed: number;
  rowsReceived: number;
  rowsWritten: number;
  failedRows: number;
  status: Database["public"]["Enums"]["knowledge_job_status"];
  error?: string;
};

export async function runHadithImportStep(args: {
  collection: string;
  maxBooks: number;
  maxPagesPerBook: number;
  pageSize: number;
  requestedBy: string;
}): Promise<HadithImportReport> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const jobName = `hadith_import:${args.collection}`;

  const { data: existingJob } = await supabaseAdmin
    .from("import_jobs")
    .select("id")
    .eq("job_name", jobName)
    .in("status", ["queued", "running", "retrying", "paused"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let jobId = existingJob?.id;
  if (!jobId) {
    const { data: created, error: cErr } = await supabaseAdmin
      .from("import_jobs")
      .insert({
        job_name: jobName,
        status: "running",
        requested_by: args.requestedBy,
        checkpoint: { collection: args.collection, bookOffset: 0, page: 0 },
        stats: { rowsReceived: 0, rowsWritten: 0, failedRows: 0, booksProcessed: 0 },
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (cErr || !created) throw new Error(cErr?.message ?? "failed_to_create_import_job");
    jobId = created.id;
  }

  const { data: jobRow } = await supabaseAdmin
    .from("import_jobs")
    .select("checkpoint,stats")
    .eq("id", jobId)
    .single();

  const checkpoint = (jobRow?.checkpoint ?? {}) as { bookOffset?: number; page?: number };
  const stats = (jobRow?.stats ?? {}) as {
    rowsReceived?: number;
    rowsWritten?: number;
    failedRows?: number;
    booksProcessed?: number;
  };

  let rowsReceived = stats.rowsReceived ?? 0;
  let rowsWritten = stats.rowsWritten ?? 0;
  let failedRows = stats.failedRows ?? 0;
  let booksProcessed = stats.booksProcessed ?? 0;

  try {
    const providerResult = await runWithProviderFallback(async (provider) => {
      const books = await provider.listBooks(args.collection);
      const slice = books
        .sort((a, b) => a.book_id - b.book_id)
        .slice(checkpoint.bookOffset ?? 0, (checkpoint.bookOffset ?? 0) + args.maxBooks);

      for (let bIndex = 0; bIndex < slice.length; bIndex += 1) {
        const book = slice[bIndex];
        const startPage = bIndex === 0 ? checkpoint.page ?? 0 : 0;
        for (let page = startPage; page < startPage + args.maxPagesPerBook; page += 1) {
          const { items, total } = await provider.listBookEntries({
            collection: args.collection,
            book: book.book_id,
            page,
            pageSize: args.pageSize,
          });
          rowsReceived += items.length;
          if (items.length === 0) break;

          const payload = items.map((i) => ({
            collection_slug: i.collection_slug,
            book_id: i.book_id,
            id_in_book: i.id_in_book,
            global_id: i.global_id,
            narrator: i.narrator,
            arabic_text: i.arabic_text,
            english_text: i.english_text,
            chapter_id: null,
            grade: i.grade,
            grade_source: i.grade_source,
            chain_text: i.chain_text,
            reference_text: i.reference_text,
            api_source: provider.id,
            source_payload: i.source_payload,
            import_run_id: jobId,
          }));

          const { error: upErr, count } = await supabaseAdmin
            .from("hadith_entries")
            .upsert(payload, {
              onConflict: "collection_slug,global_id",
              ignoreDuplicates: false,
              count: "exact",
            });

          if (upErr) {
            failedRows += payload.length;
          } else {
            rowsWritten += count ?? payload.length;
          }

          const reachedEnd = total > 0 && (page + 1) * args.pageSize >= total;
          await supabaseAdmin
            .from("import_jobs")
            .update({
              status: "running",
              checkpoint: { collection: args.collection, bookOffset: (checkpoint.bookOffset ?? 0) + bIndex, page: page + 1 },
              stats: { rowsReceived, rowsWritten, failedRows, booksProcessed },
              updated_at: new Date().toISOString(),
            })
            .eq("id", jobId);
          if (reachedEnd) break;
        }
        booksProcessed += 1;
      }
      return provider.id;
    });

    await supabaseAdmin
      .from("import_jobs")
      .update({
        status: "succeeded",
        finished_at: new Date().toISOString(),
        checkpoint: { collection: args.collection, done: true },
        stats: { rowsReceived, rowsWritten, failedRows, booksProcessed },
      })
      .eq("id", jobId);

    return {
      ok: true,
      jobId,
      provider: providerResult.provider,
      collection: args.collection,
      booksProcessed,
      rowsReceived,
      rowsWritten,
      failedRows,
      status: "succeeded",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabaseAdmin
      .from("import_jobs")
      .update({
        status: "failed",
        error_message: message,
        finished_at: new Date().toISOString(),
        stats: { rowsReceived, rowsWritten, failedRows, booksProcessed },
      })
      .eq("id", jobId);
    return {
      ok: false,
      jobId,
      provider: "none",
      collection: args.collection,
      booksProcessed,
      rowsReceived,
      rowsWritten,
      failedRows,
      status: "failed",
      error: message,
    };
  }
}
