import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Header } from "@/components/Header";
import { listHadithEntries } from "@/lib/hadith.functions";

export const Route = createFileRoute("/hadith/$collection/$book")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.collection === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim"} — Book ${params.book}` },
      { property: "og:url", content: `/hadith/${params.collection}/${params.book}` },
    ],
    links: [{ rel: "canonical", href: `/hadith/${params.collection}/${params.book}` }],
  }),
  loader: async ({ context, params }) => {
    if (!["bukhari", "muslim"].includes(params.collection)) throw notFound();
    const book = Number(params.book);
    if (!Number.isFinite(book) || book < 1) throw notFound();
    await context.queryClient.ensureQueryData({
      queryKey: ["hadith", "entries", params.collection, book, 0],
      queryFn: () =>
        listHadithEntries({ data: { collection: params.collection, book, page: 0, pageSize: 40 } }),
    });
  },
  component: HadithBookPage,
});

function HadithBookPage() {
  const { collection, book } = Route.useParams();
  const bookNum = Number(book);
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [page, setPage] = useState(0);
  const fn = useServerFn(listHadithEntries);
  const { data } = useQuery({
    queryKey: ["hadith", "entries", collection, bookNum, page],
    queryFn: () => fn({ data: { collection, book: bookNum, page, pageSize: 40 } }),
  });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link to="/hadith/$collection" params={{ collection }} className="text-sm text-muted-foreground hover:text-foreground">
          ← Books
        </Link>
        <h1 className="mt-2 text-lg font-bold text-foreground">Book {bookNum} · {total} hadith</h1>

        <ol className="mt-4 space-y-3">
          {items.map((h) => (
            <li key={h.id} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>#{h.id_in_book}</span>
                <Link
                  to="/hadith/$collection/entry/$num"
                  params={{ collection, num: String(h.global_id) }}
                  className="text-primary hover:underline"
                >
                  Open
                </Link>
              </div>
              {h.narrator && <p className="text-xs italic text-muted-foreground">{h.narrator}</p>}
              {h.english_text && (
                <p className="font-reading-en mt-1 text-sm text-foreground/90">
                  {h.english_text.slice(0, 320)}
                  {h.english_text.length > 320 ? "…" : ""}
                </p>
              )}
              <p className="font-reading-ar mt-2 text-right text-base text-foreground" dir="rtl" lang="ar">
                {h.arabic_text.slice(0, 300)}
                {h.arabic_text.length > 300 ? "…" : ""}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="text-muted-foreground">Page {page + 1} / {Math.max(1, Math.ceil(total / 40))}</span>
          <button
            type="button"
            disabled={(page + 1) * 40 >= total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </main>
    </div>
  );
}