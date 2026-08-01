import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { listHadithCollections } from "@/lib/hadith.functions";
import { BookMarked, Users } from "lucide-react";

export const Route = createFileRoute("/hadith/")({
  head: () => ({
    meta: [
      { title: "Hadith Library — Canonical Collections" },
      {
        name: "description",
        content:
          "Explore canonical Hadith collections with Arabic text, multilingual translations, topic hubs, and narrator pathways.",
      },
      { property: "og:title", content: "Hadith Library" },
      {
        property: "og:description",
        content: "Browse authenticated Hadith collections in one searchable library.",
      },
      { property: "og:url", content: "/hadith" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Hadith Library" },
      {
        name: "twitter:description",
        content: "Browse authenticated Hadith collections with Arabic text and translations.",
      },
    ],
    links: [{ rel: "canonical", href: "/hadith" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [{ "@type": "ListItem", position: 1, name: "Hadith", item: "/hadith" }],
        }),
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["hadith", "collections"],
      queryFn: () => listHadithCollections(),
    });
  },
  component: HadithIndex,
});

function HadithIndex() {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const locale = (i18n.language?.slice(0, 2) ?? "he") as "he" | "ar" | "en";
  const fn = useServerFn(listHadithCollections);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["hadith", "collections"],
    queryFn: () => fn(),
  });

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "he" ? "ספריית החדית'" : locale === "ar" ? "مكتبة الحديث" : "Hadith Library"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {locale === "he"
            ? "אוספי חדית׳ מרכזיים — טקסט ערבי מקורי עם תרגומים."
            : locale === "ar"
              ? "مجموعات الحديث الأساسية — النص العربي الأصلي مع ترجمات."
              : "Core hadith collections with original Arabic text and translations."}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {isLoading && (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Loading hadith collections…
            </div>
          )}
          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Failed to load hadith collections.
              <button
                type="button"
                onClick={() => void refetch()}
                className="ms-2 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}
          {(data ?? []).map((c) => (
            <Link
              key={c.slug}
              to="/hadith/$collection"
              params={{ collection: c.slug }}
              className="group rounded-2xl border border-primary/10 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-xl"
            >
              <div className="flex items-center gap-3">
                <BookMarked className="h-5 w-5 text-primary" aria-hidden />
                <div className="font-arabic-ui text-xl" dir="rtl">
                  {c.title_ar}
                </div>
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">{c.title_en}</div>
              {c.author_en && <div className="text-xs text-muted-foreground">{c.author_en}</div>}
              <div className="mt-3 text-xs text-muted-foreground">
                {c.total_hadith.toLocaleString()} hadith · {c.total_books} books
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap gap-2">
            <Link
              to="/hadith/topics"
              className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-card px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <BookMarked className="h-4 w-4" />
              {locale === "he" ? "לפי נושאים" : locale === "ar" ? "حسب الموضوع" : "By topics"}
            </Link>
            <Link
              to="/hadith/narrators"
              className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-card px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <Users className="h-4 w-4" /> Narrators
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
