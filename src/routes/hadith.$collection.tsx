import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { listHadithBooks, listHadithCollections } from "@/lib/hadith.functions";
import { ChevronRight, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/hadith/$collection")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.collection === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim"} — Books` },
      { property: "og:url", content: `/hadith/${params.collection}` },
    ],
    links: [{ rel: "canonical", href: `/hadith/${params.collection}` }],
  }),
  loader: async ({ context, params }) => {
    if (!params.collection || params.collection.trim().length === 0) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["hadith", "books", params.collection],
        queryFn: () => listHadithBooks({ data: { collection: params.collection } }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["hadith", "collections"],
        queryFn: () => listHadithCollections(),
      }),
    ]);
  },
  component: HadithCollectionPage,
});

function HadithCollectionPage() {
  const { collection } = Route.useParams();
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const Chev = isRtl ? ChevronLeft : ChevronRight;
  const booksFn = useServerFn(listHadithBooks);
  const collFn = useServerFn(listHadithCollections);
  const {
    data: books = [],
    isLoading: booksLoading,
    isError: booksError,
    refetch: refetchBooks,
  } = useQuery({
    queryKey: ["hadith", "books", collection],
    queryFn: () => booksFn({ data: { collection } }),
  });
  const { data: cols = [], isError: collectionsError } = useQuery({
    queryKey: ["hadith", "collections"],
    queryFn: () => collFn(),
  });
  const meta = cols.find((c) => c.slug === collection);

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link to="/hadith" className="text-sm text-muted-foreground hover:text-foreground">
          ← Hadith Library
        </Link>
        {meta && (
          <header className="mt-2">
            <div className="font-arabic-ui text-2xl" dir="rtl">
              {meta.title_ar}
            </div>
            <h1 className="text-xl font-bold text-foreground">{meta.title_en}</h1>
            {meta.author_en && <p className="text-sm text-muted-foreground">{meta.author_en}</p>}
          </header>
        )}

        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
          {booksLoading && (
            <div className="px-4 py-3 text-sm text-muted-foreground">Loading books…</div>
          )}
          {(booksError || collectionsError) && (
            <div className="px-4 py-3 text-sm text-destructive">
              Failed to load this collection.
              <button
                type="button"
                onClick={() => void refetchBooks()}
                className="ms-2 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}
          {books.map((b) => (
            <Link
              key={b.book_id}
              to="/hadith/$collection/$book"
              params={{ collection, book: String(b.book_id) }}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-secondary/40"
            >
              <div className="min-w-0">
                <div className="font-arabic-ui text-base" dir="rtl">
                  {b.name_ar}
                </div>
                <div className="truncate text-sm text-muted-foreground">
                  {b.book_id}. {b.name_en}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {b.hadith_count}
                <Chev className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
