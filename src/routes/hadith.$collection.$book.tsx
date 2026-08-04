import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Header } from "@/components/Header";
import { listHadithEntries } from "@/lib/hadith.functions";
import { normalizeLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, ChevronLeft, ChevronRight, Search, ExternalLink, UserCheck, Award } from "lucide-react";

export const Route = createFileRoute("/hadith/$collection/$book")({
  head: ({ params }) => {
    const collectionLabel = params.collection.replace(/-/g, " ").toUpperCase();
    const title = `${collectionLabel} — Book #${params.book} | Authentic Hadith Listing`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Read ${collectionLabel} book #${params.book} with verified Arabic hadith text, Hebrew, and English translations.`,
        },
        { property: "og:title", content: title },
        { property: "og:url", content: `/hadith/${params.collection}/${params.book}` },
      ],
      links: [{ rel: "canonical", href: `/hadith/${params.collection}/${params.book}` }],
    };
  },
  loader: async ({ context, params }) => {
    if (!params.collection || params.collection.trim().length === 0) throw notFound();
    const book = Number(params.book);
    if (!Number.isFinite(book) || book < 1) throw notFound();
    await context.queryClient.ensureQueryData({
      queryKey: ["hadith", "entries", params.collection, book, 0],
      queryFn: () => listHadithEntries({ data: { collection: params.collection, book, page: 0, pageSize: 40 } }),
    });
  },
  component: HadithBookPage,
});

function HadithBookPage() {
  const { collection, book } = Route.useParams();
  const bookNum = Number(book);
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const locale = normalizeLocale(i18n.language) ?? "he";

  const [page, setPage] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");

  const fn = useServerFn(listHadithEntries);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["hadith", "entries", collection, bookNum, page],
    queryFn: () => fn({ data: { collection, book: bookNum, page, pageSize: 40 } }),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const collectionTitle =
    collection === "bukhari" ? "Sahih al-Bukhari" : collection === "muslim" ? "Sahih Muslim" : collection.toUpperCase();

  const filteredItems = filterQuery.trim()
    ? items.filter(
        (h) =>
          h.arabic_text.includes(filterQuery) ||
          (h.english_text && h.english_text.toLowerCase().includes(filterQuery.toLowerCase())) ||
          (h.hebrew_text && h.hebrew_text.includes(filterQuery)) ||
          (h.narrator && h.narrator.toLowerCase().includes(filterQuery.toLowerCase())) ||
          String(h.id_in_book) === filterQuery.trim(),
      )
    : items;

  return (
    <div className="min-h-screen bg-background pb-16" dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Link to="/hadith" className="hover:text-primary transition-colors flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>{locale === "ar" ? "الفهرس" : locale === "he" ? "אינדקס" : "Hadith Hub"}</span>
            </Link>
            <span>/</span>
            <Link to="/hadith/$collection" params={{ collection }} className="hover:text-primary transition-colors">
              {collectionTitle}
            </Link>
            <span>/</span>
            <span className="text-foreground font-bold">Book #{bookNum}</span>
          </div>

          <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">
            {total} Hadiths Total
          </Badge>
        </div>

        {/* Page Header & Filter Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              {collectionTitle} — Book #{bookNum}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {locale === "ar"
                ? "تصفح أحاديث الكُتّاب المعتمدة مع النص العربي، الترجَمات والتحليل الإسنادي"
                : locale === "he"
                  ? "עיון בחדית'ים המוסמכים בספר זה כולל טקסט בערבית, תרגומים וניתוח"
                  : "Browse authenticated Hadith entries with Arabic text, Hebrew, English, and Isnad analysis."}
            </p>
          </div>

          {/* Quick Filter Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={
                locale === "ar" ? "تصفية الأحاديث…" : locale === "he" ? "סינון חדית'ים…" : "Filter in this book…"
              }
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="pl-9 rounded-xl border-border/80 text-xs"
            />
          </div>
        </div>

        {/* Hadith List */}
        <div className="space-y-4">
          {isLoading && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
              <span>Loading Hadith entries…</span>
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive flex items-center justify-between">
              <span>Failed to load Hadith entries for Book #{bookNum}.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="rounded-xl text-xs"
              >
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && filteredItems.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No matching Hadith entries found for this query.
            </div>
          )}

          {filteredItems.map((h) => (
            <article
              key={h.id}
              className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 hover:border-primary/40 transition-all shadow-2xs group"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-xs font-bold bg-primary/5 text-primary border-primary/20"
                  >
                    Hadith #{h.id_in_book}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20"
                  >
                    <Award className="h-3 w-3 mr-1" />
                    Authentic
                  </Badge>
                </div>

                <Link
                  to="/hadith/$collection/entry/$num"
                  params={{ collection, num: String(h.id_in_book) }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline"
                >
                  <span>
                    {locale === "ar" ? "الدراسة والشرح الكامل" : locale === "he" ? "ניתוח מלא" : "Open Full Entry"}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Narrator */}
              {h.narrator && (
                <p className="text-xs font-semibold text-primary/90 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Narrated by: {h.narrator}</span>
                </p>
              )}

              {/* Arabic Text */}
              <p className="font-quran text-right text-lg md:text-xl text-foreground leading-loose" dir="rtl" lang="ar">
                {h.arabic_text}
              </p>

              {/* Multilingual Preview */}
              {h.hebrew_text ? (
                <p
                  className="text-xs text-foreground/80 leading-relaxed pt-1 border-t border-border/30 font-sans"
                  dir="rtl"
                >
                  {h.hebrew_text}
                </p>
              ) : h.english_text ? (
                <p
                  className="text-xs text-muted-foreground leading-relaxed italic pt-1 border-t border-border/30"
                  dir="ltr"
                >
                  {h.english_text}
                </p>
              ) : null}
            </article>
          ))}
        </div>

        {/* Pagination Toolbar */}
        {!isLoading && total > 40 && (
          <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs font-medium text-muted-foreground">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-xl gap-1 text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Page</span>
            </Button>

            <span>
              Page {page + 1} of {Math.max(1, Math.ceil(total / 40))}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(page + 1) * 40 >= total}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl gap-1 text-xs"
            >
              <span>Next Page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
