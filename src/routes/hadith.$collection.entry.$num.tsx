import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Header } from "@/components/Header";
import { generateHadithStudySummary, getHadithKnowledgeBundle } from "@/lib/hadith.functions";
import { PassageCard } from "@/components/discovery/PassageCard";
import { EntityCard } from "@/components/discovery/EntityCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { normalizeLocale } from "@/lib/i18n";
import { pickLocale, type EntityKind } from "@/lib/knowledge";
import { useHadithUserStore } from "@/lib/hadith-user-store";
import { HadithTypographySettings } from "@/components/hadith/HadithTypographySettings";
import { HadithCard } from "@/components/hadith/HadithCard";
import { HadithSanadVisualizer } from "@/components/hadith/HadithSanadVisualizer";
import { HadithKnowledgeGraph } from "@/components/hadith/HadithKnowledgeGraph";
import { Sparkles, BookOpen, Layers, Users } from "lucide-react";

export const Route = createFileRoute("/hadith/$collection/entry/$num")({
  head: ({ params }) => {
    const label =
      params.collection === "bukhari"
        ? "Sahih al-Bukhari"
        : params.collection === "muslim"
          ? "Sahih Muslim"
          : params.collection;
    const title = `${label} — Hadith #${params.num}`;
    const description = `Read authenticated hadith text, related Quran verses, tafsir context, isnad chains, and linked references for ${label} hadith #${params.num}.`;
    const canonical = `/hadith/${params.collection}/entry/${params.num}`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            isPartOf: {
              "@type": "CreativeWorkSeries",
              name: label,
            },
            url: canonical,
            description,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Hadith", item: "/hadith" },
              {
                "@type": "ListItem",
                position: 2,
                name: label,
                item: `/hadith/${params.collection}`,
              },
              { "@type": "ListItem", position: 3, name: `Hadith #${params.num}`, item: canonical },
            ],
          }),
        },
      ],
    };
  },
  loader: async ({ context, params }) => {
    if (!params.collection || params.collection.trim().length === 0) throw notFound();
    const num = Number(params.num);
    if (!Number.isFinite(num) || num < 1) throw notFound();
    const bundle = await context.queryClient.ensureQueryData({
      queryKey: ["hadith", "knowledge", params.collection, num],
      queryFn: () => getHadithKnowledgeBundle({ data: { collection: params.collection, num } }),
    });
    return { bundle };
  },
  component: HadithDetailPage,
});

function HadithDetailPage() {
  const { collection, num } = Route.useParams();
  const numId = Number(num);
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const locale = normalizeLocale(i18n.language) ?? "en";
  const [focusMode, setFocusMode] = useState(false);

  const store = useHadithUserStore();
  const bundleFn = useServerFn(getHadithKnowledgeBundle);
  const summaryFn = useServerFn(generateHadithStudySummary);

  const {
    data: bundle,
    isLoading: bundleLoading,
    isError: bundleError,
  } = useQuery({
    queryKey: ["hadith", "knowledge", collection, numId],
    queryFn: () => bundleFn({ data: { collection, num: numId } }),
  });

  const h = bundle?.entry;
  const collectionLabel =
    bundle?.collection?.title_en ??
    (collection === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim");

  const studySummaryQ = useQuery({
    queryKey: ["hadith", "study-summary", collection, numId, locale],
    enabled: !!h,
    staleTime: 1000 * 60 * 60 * 24 * 14,
    queryFn: () =>
      summaryFn({
        data: {
          collectionLabel,
          hadithNumber: h?.id_in_book ?? numId,
          narrator: h?.narrator,
          arabicText: h?.arabic_text ?? "",
          translationText: h?.english_text,
          verseRefs: (bundle?.relatedVerses ?? []).map((v) => `${v.surah}:${v.ayah}`),
          tafsirSnippets: (bundle?.relatedTafsir ?? []).map((t) => t.body.slice(0, 420)),
          relatedHadithSnippets: (bundle?.relatedHadith ?? []).map(
            (rh) => rh.english_text?.slice(0, 280) || rh.arabic_text.slice(0, 280),
          ),
          citations: [
            `${collectionLabel}, Book ${h?.book_id ?? ""}, Hadith ${h?.id_in_book ?? numId}`,
            ...(bundle?.relatedVerses ?? []).map((v) => `Quran ${v.surah}:${v.ayah}`),
            ...(bundle?.relatedTafsir ?? []).map(
              (t) => `${t.source_name} ${t.surah}:${t.ayah_start}`,
            ),
            ...(bundle?.relatedAsbab ?? []).map((a) => `Asbab ${a.surah}:${a.ayah_start}`),
          ],
          lang: locale === "he" || locale === "ar" ? locale : "en",
        },
      }),
  });

  if (bundleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">
          Loading hadith details…
        </main>
      </div>
    );
  }

  if (bundleError || !h) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-destructive">
          Failed to load this hadith entry.
        </main>
      </div>
    );
  }

  const kindLabel = (k: string) =>
    k === "prophet"
      ? locale === "ar"
        ? "نبي"
        : locale === "he"
          ? "נביא"
          : "Prophet"
      : k === "topic"
        ? locale === "ar"
          ? "موضوع"
          : locale === "he"
            ? "נושא"
            : "Topic"
        : locale === "ar"
          ? "كيان"
          : locale === "he"
            ? "ישות"
            : "Entity";

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {!focusMode && <Header />}
      <main id="main" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        {!focusMode && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
            <div>
              <Link
                to="/hadith/$collection/$book"
                params={{ collection, book: String(h.book_id) }}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                ← Book #{h.book_id}
              </Link>
              <h1 className="text-2xl font-extrabold text-foreground">
                {collectionLabel} — Hadith #{h.id_in_book}
              </h1>
            </div>
            {bundle?.collection && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {bundle.collection.total_hadith.toLocaleString()} Total Hadiths
              </span>
            )}
          </div>
        )}

        {/* Reading Settings */}
        <HadithTypographySettings
          settings={store.settings}
          onUpdate={store.updateSettings}
          focusMode={focusMode}
          onToggleFocusMode={() => setFocusMode(!focusMode)}
        />

        {/* Primary Hadith Card */}
        <HadithCard
          id={h.id}
          globalId={h.global_id}
          collectionSlug={collection}
          collectionTitle={collectionLabel}
          bookId={h.book_id}
          idInBook={h.id_in_book}
          narrator={h.narrator}
          arabicText={h.arabic_text}
          englishText={h.english_text}
          hebrewText={h.hebrew_text}
          settings={store.settings}
          relatedVerses={bundle.relatedVerses}
          relatedTopics={bundle.relatedTopics.map((t) => ({
            id: t.id,
            slug: t.slug,
            title: t.title_i18n.en || t.title_i18n.ar || t.slug,
          }))}
        />

        {/* Detailed Chain of Narration (Isnad) */}
        <HadithSanadVisualizer
          arabicText={h.arabic_text}
          primaryNarrator={h.narrator}
          collectionSlug={collection}
        />

        {/* Detailed Knowledge Graph */}
        <HadithKnowledgeGraph
          hadithTitle={`Hadith #${h.id_in_book}`}
          hadithId={h.id_in_book}
          collectionSlug={collection}
          primaryNarrator={h.narrator}
          relatedVerses={bundle.relatedVerses}
          relatedTopics={bundle.relatedTopics.map((t) => ({
            id: t.id,
            slug: t.slug,
            title: t.title_i18n.en || t.title_i18n.ar || t.slug,
          }))}
        />

        {/* Scholarly Study & AI Analysis */}
        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <h2 className="text-base font-bold text-foreground">
              {locale === "ar"
                ? "الدراسة التحليلية والشرح الفقهي"
                : locale === "he"
                  ? "ניתוח לימודי ופירוש הלכתי"
                  : "Analytical Study & Juristic Rulings"}
            </h2>
          </div>

          <Accordion type="multiple" defaultValue={["explanation", "lessons"]} className="w-full">
            <AccordionItem value="explanation">
              <AccordionTrigger className="text-sm font-semibold">
                {locale === "ar"
                  ? "الشرح المعنائي واللغوي"
                  : locale === "he"
                    ? "הסבר מילולי"
                    : "Textual & Linguistic Explanation"}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-foreground/90">
                {studySummaryQ.data?.explanation ||
                  "Analytical explanation loaded from authentic commentaries."}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="context">
              <AccordionTrigger className="text-sm font-semibold">
                {locale === "ar"
                  ? "السياق والظروف التاريخية"
                  : locale === "he"
                    ? "הקשר היסטורי"
                    : "Historical Circumstances & Context"}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-foreground/90">
                {studySummaryQ.data?.historical_context ||
                  "Historical context extracted from linked classical records."}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lessons">
              <AccordionTrigger className="text-sm font-semibold">
                {locale === "ar"
                  ? "الفوائد والدروس الاستنباطية"
                  : locale === "he"
                    ? "לקחים הלכתיים"
                    : "Juristic Deductions & Key Lessons"}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-foreground/90">
                {studySummaryQ.data?.main_lessons ||
                  "Key takeaways and Fiqh rulings deduced from the text."}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Linked Quran Verses */}
        {bundle.relatedVerses.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">
              Directly Cross-Referenced Quran Verses
            </h2>
            <div className="space-y-3">
              {bundle.relatedVerses.map((v) => (
                <PassageCard
                  key={`${v.surah}:${v.ayah}`}
                  surah={v.surah}
                  ayahStart={v.ayah}
                  ayahEnd={v.ayah}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        )}

        {/* Related Topics & Entities */}
        {bundle.relatedTopics.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">Linked Topics & Concepts</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {bundle.relatedTopics.map((e) => (
                <EntityCard
                  key={e.id}
                  entity={{
                    ...e,
                    description_i18n: e.summary_i18n,
                    hero_image: null,
                    icon: null,
                    sort_order: 0,
                    kind: e.kind as EntityKind,
                  }}
                  locale={locale}
                  kindLabel={kindLabel(e.kind)}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
