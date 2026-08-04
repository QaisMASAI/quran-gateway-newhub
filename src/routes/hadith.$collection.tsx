import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Header } from "@/components/Header";
import { listHadithBooks, listHadithCollections } from "@/lib/hadith.functions";
import { normalizeLocale } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, ChevronRight, ChevronLeft, Award, Layers } from "lucide-react";

export const Route = createFileRoute("/hadith/$collection")({
  head: ({ params }) => {
    const collectionLabel = params.collection.replace(/-/g, " ").toUpperCase();
    return {
      meta: [
        { title: `${collectionLabel} — Canonical Books & Hadiths` },
        {
          name: "description",
          content: `Browse verified Hadith books in ${collectionLabel} with authentic Arabic text, Hebrew, and English translations.`,
        },
        { property: "og:title", content: `${collectionLabel} — Canonical Books` },
        {
          property: "og:description",
          content: `Explore canonical books in ${collectionLabel} with authenticated narrations, multilingual text, and structured navigation.`,
        },
        { property: "og:url", content: `/hadith/${params.collection}` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: `/hadith/${params.collection}` }],
    };
  },
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
  const locale = normalizeLocale(i18n.language) ?? "he";
  const Chev = isRtl ? ChevronLeft : ChevronRight;

  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: cols = [] } = useQuery({
    queryKey: ["hadith", "collections"],
    queryFn: () => collFn(),
  });

  const meta = cols.find((c) => c.slug === collection);

  const filteredBooks = searchQuery.trim()
    ? books.filter(
        (b) =>
          b.name_ar.includes(searchQuery) ||
          b.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.name_he && b.name_he.includes(searchQuery)) ||
          String(b.book_id) === searchQuery.trim(),
      )
    : books;

  return (
    <div className="min-h-screen bg-background pb-16" dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <Link
            to="/hadith"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            <span>
              {locale === "ar" ? "العودة إلى المكتبة" : locale === "he" ? "חזרה לספרייה" : "Back to Hadith Hub"}
            </span>
          </Link>

          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20 text-xs"
          >
            <Award className="h-3.5 w-3.5 mr-1" />
            Canonical Collection
          </Badge>
        </div>

        {/* Collection Hero Box */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-3">
          <div className="font-quran text-2xl md:text-3xl text-right text-primary font-bold" dir="rtl">
            {meta?.title_ar || collection.toUpperCase()}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-foreground">
            {meta?.title_en || collection.toUpperCase()}
          </h1>
          {meta?.author_en && (
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              Compiled by: {meta.author_en} {meta.author_ar ? `(${meta.author_ar})` : ""}
            </p>
          )}

          <div className="flex items-center gap-3 border-t border-border/50 pt-3 text-xs font-mono text-muted-foreground">
            <span>{meta?.total_books ?? books.length} Books</span>
            <span>•</span>
            <span>{(meta?.total_hadith ?? 0).toLocaleString()} Verified Hadiths</span>
          </div>
        </div>

        {/* Filter Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <h2 className="font-bold text-base text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span>
              {locale === "ar" ? "فهرس الكُتُب والموضوعات" : locale === "he" ? "אינדקס ספרים" : "Books Index"}
            </span>
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={
                locale === "ar"
                  ? "البحث في أسماء الكتب…"
                  : locale === "he"
                    ? "חיפוש לפי שם ספר…"
                    : "Filter books by title…"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-border/80 text-xs"
            />
          </div>
        </div>

        {/* Books Grid/List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {booksLoading && (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
              <span>Loading collection books…</span>
            </div>
          )}

          {booksError && (
            <div className="col-span-full rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive flex items-center justify-between">
              <span>Failed to load books.</span>
              <button type="button" onClick={() => void refetchBooks()} className="underline font-semibold">
                Retry
              </button>
            </div>
          )}

          {!booksLoading && !booksError && filteredBooks.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
              No matching books found.
            </div>
          )}

          {filteredBooks.map((b) => (
            <Link
              key={b.book_id}
              to="/hadith/$collection/$book"
              params={{ collection, book: String(b.book_id) }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 hover:border-primary/50 hover:bg-secondary/20 transition-all shadow-2xs group"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold font-mono text-primary">
                    Book #{b.book_id}
                  </span>
                </div>
                <div
                  className="font-quran text-base text-right text-foreground font-semibold group-hover:text-primary transition-colors"
                  dir="rtl"
                >
                  {b.name_ar}
                </div>
                <div className="truncate text-xs text-muted-foreground font-medium">{b.name_en}</div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Badge variant="secondary" className="text-[11px]">
                  {b.hadith_count}
                </Badge>
                <Chev className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
