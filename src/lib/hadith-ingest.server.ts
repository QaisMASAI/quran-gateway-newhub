import type { Database } from "@/integrations/supabase/types";
import { runWithProviderFallback } from "@/lib/hadith-providers.server";

export type HadithImportReport = {
  ok: boolean;
  jobId: string;
  provider: string;
  collection: string;
  totalBooks: number;
  booksProcessed: number;
  rowsReceived: number;
  rowsWritten: number;
  failedRows: number;
  statusMessage?: string;
  failedBatches?: Array<{
    phase: "fetch" | "validate" | "upsert";
    collection: string;
    bookId: number;
    page: number;
    error: string;
    rowIndex?: number;
    idInBook?: number | null;
    globalId?: number | null;
  }>;
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

  const checkpoint = (jobRow?.checkpoint ?? {}) as {
    bookOffset?: number;
    page?: number;
    totalBooks?: number;
  };
  const stats = (jobRow?.stats ?? {}) as {
    rowsReceived?: number;
    rowsWritten?: number;
    failedRows?: number;
    booksProcessed?: number;
    totalBooks?: number;
  };
  const failedBatches = Array.isArray(
    (jobRow as { failed_batches?: unknown } | null)?.failed_batches,
  )
    ? ((jobRow as { failed_batches?: HadithImportReport["failedBatches"] }).failed_batches ?? [])
    : [];

  let rowsReceived = stats.rowsReceived ?? 0;
  let rowsWritten = stats.rowsWritten ?? 0;
  let failedRows = stats.failedRows ?? 0;
  let currentBookOffset = checkpoint.bookOffset ?? stats.booksProcessed ?? 0;
  let totalBooks = stats.totalBooks ?? checkpoint.totalBooks ?? 0;
  let earlyResult: HadithImportReport | null = null;

  const appendFailed = (entry: NonNullable<HadithImportReport["failedBatches"]>[number]) => {
    failedBatches.push(entry);
    if (failedBatches.length > 250) failedBatches.splice(0, failedBatches.length - 250);
  };

  try {
    const providerResult = await runWithProviderFallback(async (provider) => {
      const books = await provider.listBooks(args.collection);
      totalBooks = books.length;
      const slice = books
        .sort((a, b) => a.book_id - b.book_id)
        .slice(currentBookOffset, currentBookOffset + args.maxBooks);

      if (slice.length === 0) {
        return provider.id;
      }

      for (let bIndex = 0; bIndex < slice.length; bIndex += 1) {
        const book = slice[bIndex];
        const bookOffset = currentBookOffset + bIndex;
        const startPage = bIndex === 0 ? (checkpoint.page ?? 0) : 0;
        for (let page = startPage; page < startPage + args.maxPagesPerBook; page += 1) {
          let items: Awaited<ReturnType<(typeof provider)["listBookEntries"]>>["items"] = [];
          let total = 0;
          try {
            const fetched = await provider.listBookEntries({
              collection: args.collection,
              book: book.book_id,
              page,
              pageSize: args.pageSize,
            });
            items = fetched.items;
            total = fetched.total;
          } catch (error) {
            appendFailed({
              phase: "fetch",
              collection: args.collection,
              bookId: book.book_id,
              page,
              error: error instanceof Error ? error.message : String(error),
            });
            await supabaseAdmin
              .from("import_jobs")
              .update({
                status: "retrying",
                checkpoint: {
                  collection: args.collection,
                  bookOffset,
                  page,
                  totalBooks,
                },
                stats: {
                  rowsReceived,
                  rowsWritten,
                  failedRows,
                  booksProcessed: bookOffset,
                  totalBooks,
                },
                failed_batches: failedBatches as never,
                updated_at: new Date().toISOString(),
              })
              .eq("id", jobId);
            earlyResult = {
              ok: true,
              jobId,
              provider: provider.id,
              collection: args.collection,
              totalBooks,
              booksProcessed: bookOffset,
              rowsReceived,
              rowsWritten,
              failedRows,
              failedBatches,
              status: "retrying",
              statusMessage: `Paused on fetch error at book ${book.book_id}, page ${page}`,
            };
            break;
          }
          rowsReceived += items.length;
          if (items.length === 0) break;

          const payload = items
            .map((i, idx) => {
              if (
                !i.collection_slug ||
                !i.book_id ||
                !i.id_in_book ||
                !i.global_id ||
                !i.arabic_text
              ) {
                failedRows += 1;
                appendFailed({
                  phase: "validate",
                  collection: args.collection,
                  bookId: book.book_id,
                  page,
                  error: "Missing required fields for hadith row",
                  rowIndex: idx,
                  idInBook: i.id_in_book ?? null,
                  globalId: i.global_id ?? null,
                });
                return null;
              }
              return {
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
                source_payload:
                  i.source_payload as unknown as Database["public"]["Tables"]["hadith_entries"]["Insert"]["source_payload"],
                import_run_id: jobId,
              };
            })
            .filter((row): row is NonNullable<typeof row> => row !== null);

          const dedupedPayload = Array.from(
            new Map(
              payload.map((row) => [`${row.collection_slug}:${row.global_id}`, row]),
            ).values(),
          );

          if (dedupedPayload.length === 0) {
            continue;
          }

          const { error: upErr, count } = await supabaseAdmin
            .from("hadith_entries")
            .upsert(dedupedPayload, {
              onConflict: "collection_slug,global_id",
              ignoreDuplicates: false,
              count: "exact",
            });

          if (upErr) {
            failedRows += dedupedPayload.length;
            appendFailed({
              phase: "upsert",
              collection: args.collection,
              bookId: book.book_id,
              page,
              error: upErr.message,
            });
          } else {
            rowsWritten += count ?? dedupedPayload.length;
          }

          const reachedEnd = total > 0 && (page + 1) * args.pageSize >= total;
          await supabaseAdmin
            .from("import_jobs")
            .update({
              status: "running",
              checkpoint: {
                collection: args.collection,
                bookOffset,
                page: page + 1,
                totalBooks,
              },
              stats: {
                rowsReceived,
                rowsWritten,
                failedRows,
                booksProcessed: bookOffset,
                totalBooks,
              },
              failed_batches: failedBatches as never,
              updated_at: new Date().toISOString(),
            })
            .eq("id", jobId);
          if (reachedEnd) break;
        }
        if (earlyResult) break;
        currentBookOffset = bookOffset + 1;
      }
      return provider.id;
    });

    if (earlyResult) return earlyResult;

    const finalBookOffset = currentBookOffset;
    const isDone = totalBooks > 0 && finalBookOffset >= totalBooks;

    if (!isDone) {
      await supabaseAdmin
        .from("import_jobs")
        .update({
          status: "running",
          checkpoint: {
            collection: args.collection,
            bookOffset: finalBookOffset,
            page: 0,
            totalBooks,
          },
          stats: {
            rowsReceived,
            rowsWritten,
            failedRows,
            booksProcessed: finalBookOffset,
            totalBooks,
          },
          failed_batches: failedBatches as never,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      return {
        ok: true,
        jobId,
        provider: providerResult.provider,
        collection: args.collection,
        totalBooks,
        booksProcessed: finalBookOffset,
        rowsReceived,
        rowsWritten,
        failedRows,
        failedBatches,
        status: "running",
        statusMessage: `Progress ${Math.min(finalBookOffset, totalBooks)}/${totalBooks} books`,
      };
    }

    await supabaseAdmin
      .from("import_jobs")
      .update({
        status: "succeeded",
        finished_at: new Date().toISOString(),
        checkpoint: { collection: args.collection, done: true, totalBooks },
        stats: {
          rowsReceived,
          rowsWritten,
          failedRows,
          booksProcessed: finalBookOffset,
          totalBooks,
        },
        failed_batches: failedBatches as never,
      })
      .eq("id", jobId);

    return {
      ok: true,
      jobId,
      provider: providerResult.provider,
      collection: args.collection,
      totalBooks,
      booksProcessed: finalBookOffset,
      rowsReceived,
      rowsWritten,
      failedRows,
      failedBatches,
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
        stats: {
          rowsReceived,
          rowsWritten,
          failedRows,
          booksProcessed: currentBookOffset,
          totalBooks,
        },
        failed_batches: failedBatches as never,
      })
      .eq("id", jobId);
    return {
      ok: false,
      jobId,
      provider: "none",
      collection: args.collection,
      totalBooks,
      booksProcessed: currentBookOffset,
      rowsReceived,
      rowsWritten,
      failedRows,
      failedBatches,
      status: "failed",
      error: message,
    };
  }
}
