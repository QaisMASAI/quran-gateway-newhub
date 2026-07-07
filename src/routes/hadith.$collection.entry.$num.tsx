import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import {
  generateHadithStudySummary,
  getHadithKnowledgeBundle,
} from "@/lib/hadith.functions";
import { PassageCard } from "@/components/discovery/PassageCard";
import { EntityCard } from "@/components/discovery/EntityCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { normalizeLocale } from "@/lib/i18n";
import { pickLocale, type EntityKind } from "@/lib/knowledge";

export const Route = createFileRoute("/hadith/$collection/entry/$num")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.collection === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim"} — Hadith #${params.num}`,
      },
      { property: "og:url", content: `/hadith/${params.collection}/entry/${params.num}` },
    ],
    links: [{ rel: "canonical", href: `/hadith/${params.collection}/entry/${params.num}` }],
  }),
  loader: async ({ context, params }) => {
    if (!["bukhari", "muslim"].includes(params.collection)) throw notFound();
    const num = Number(params.num);
    if (!Number.isFinite(num) || num < 1) throw notFound();
    await context.queryClient.ensureQueryData({
      queryKey: ["hadith", "knowledge", params.collection, num],
      queryFn: () => getHadithKnowledgeBundle({ data: { collection: params.collection, num } }),
    });
  },
  component: HadithDetailPage,
});

function HadithDetailPage() {
  const { collection, num } = Route.useParams();
  const numId = Number(num);
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const locale = normalizeLocale(i18n.language) ?? "he";
  const bundleFn = useServerFn(getHadithKnowledgeBundle);
  const summaryFn = useServerFn(generateHadithStudySummary);

  const { data: bundle } = useQuery({
    queryKey: ["hadith", "knowledge", collection, numId],
    queryFn: () => bundleFn({ data: { collection, num: numId } }),
  });

  const h = bundle?.entry;

  const studySummaryQ = useQuery({
    queryKey: ["hadith", "study-summary", collection, numId, locale],
    enabled: !!h,
    staleTime: 1000 * 60 * 60 * 24 * 14,
    queryFn: () =>
      summaryFn({
        data: {
          collectionLabel:
            bundle?.collection?.title_en ??
            (collection === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim"),
          hadithNumber: h?.id_in_book ?? numId,
          narrator: h?.narrator,
          arabicText: h?.arabic_text ?? "",
          translationText: h?.english_text,
          verseRefs: (bundle?.relatedVerses ?? []).map((v) => `${v.surah}:${v.ayah}`),
          tafsirSnippets: (bundle?.relatedTafsir ?? []).map((t) => t.body.slice(0, 420)),
          relatedHadithSnippets: (bundle?.relatedHadith ?? []).map(
            (rh) => rh.english_text?.slice(0, 280) || rh.arabic_text.slice(0, 280),
          ),
          lang: locale,
        },
      }),
  });

  if (!h) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">
          Hadith not found.
        </main>
      </div>
    );
  }

  const label = bundle?.collection?.title_en || (collection === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim");
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
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          to="/hadith/$collection/$book"
          params={{ collection, book: String(h.book_id) }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Book {h.book_id}
        </Link>
        <h1 className="mt-2 text-xl font-bold text-foreground">
          {label} · #{h.id_in_book}
        </h1>
        {h.narrator && <p className="mt-1 text-sm italic text-muted-foreground">{h.narrator}</p>}

        {bundle?.collection && (
          <p className="mt-1 text-xs text-muted-foreground">
            {bundle.collection.total_hadith.toLocaleString()} hadith · {bundle.collection.total_books} books
          </p>
        )}

        <article className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-5">
          <p
            className="font-reading-ar text-right text-xl leading-loose text-foreground"
            dir="rtl"
            lang="ar"
          >
            {h.arabic_text}
          </p>
          {h.english_text && (
            <p
              className="font-reading-en border-t border-border pt-4 text-base leading-relaxed text-foreground/90"
              dir="ltr"
            >
              {h.english_text}
            </p>
          )}
          {h.hebrew_text && (
            <p
              className="font-reading-he border-t border-border pt-4 text-base leading-relaxed text-foreground/90"
              dir="rtl"
            >
              {h.hebrew_text}
            </p>
          )}
        </article>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">
            {locale === "ar" ? "مركز دراسة الحديث" : locale === "he" ? "מרכז לימוד חדית׳" : "Hadith Study Center"}
          </h2>
          <Accordion type="multiple" className="mt-3">
            <AccordionItem value="explanation">
              <AccordionTrigger>
                {locale === "ar" ? "الشرح" : locale === "he" ? "הסבר" : "Explanation"}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {studySummaryQ.data?.explanation ||
                    (locale === "ar"
                      ? "لم تتوفر أدلة كافية لاستخراج شرح مفصل بعد."
                      : locale === "he"
                        ? "עדיין אין מספיק עדויות כדי להפיק הסבר מפורט."
                        : "Not enough grounded evidence was found yet for a detailed explanation.")}
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="context">
              <AccordionTrigger>
                {locale === "ar" ? "السياق التاريخي" : locale === "he" ? "הקשר היסטורי" : "Historical context"}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {studySummaryQ.data?.historical_context ||
                    (locale === "ar"
                      ? "يعرض هذا القسم السياق المتاح فقط من الأدلة المرتبطة."
                      : locale === "he"
                        ? "חלק זה מציג הקשר רק מתוך הראיות המקושרות."
                        : "This section presents context only from linked evidence.")}
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="narrated">
              <AccordionTrigger>
                {locale === "ar"
                  ? "سبب الرواية"
                  : locale === "he"
                    ? "למה נמסר החדית׳"
                    : "Why this hadith was narrated"}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {studySummaryQ.data?.why_narrated ||
                    (locale === "ar"
                      ? "يتم استنتاج السبب من النصوص المرتبطة فقط."
                      : locale === "he"
                        ? "הסיבה נלמדת רק מהטקסטים המקושרים."
                        : "The reason is inferred only from linked textual evidence.")}
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="lessons">
              <AccordionTrigger>
                {locale === "ar" ? "الدروس الرئيسية" : locale === "he" ? "לקחים מרכזיים" : "Main lessons"}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {studySummaryQ.data?.main_lessons ||
                    (locale === "ar"
                      ? "الدروس المعروضة هنا تعتمد على النصوص المعتمدة المتاحة."
                      : locale === "he"
                        ? "הלקחים כאן מבוססים רק על הטקסטים המאומתים הזמינים."
                        : "Lessons shown here are grounded in available authenticated texts only.")}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {(bundle?.relatedVerses?.length ?? 0) > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {locale === "ar" ? "آيات مرتبطة" : locale === "he" ? "פסוקים קשורים" : "Related Quran verses"}
            </h2>
            <div className="space-y-3">
              {bundle?.relatedVerses.map((v) => (
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

        {(bundle?.relatedTafsir?.length ?? 0) > 0 && (
          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {locale === "ar" ? "تفسير مرتبط" : locale === "he" ? "תפסיר קשור" : "Related Tafsir"}
            </h2>
            <div className="space-y-3">
              {bundle?.relatedTafsir.map((t) => (
                <article key={t.id} className="rounded-lg border border-border bg-background px-3 py-2">
                  <p className="text-xs text-primary">
                    {t.source_name} · {t.surah}:{t.ayah_start}
                    {t.ayah_end !== t.ayah_start ? `-${t.ayah_end}` : ""}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                    {t.body.slice(0, 420)}
                    {t.body.length > 420 ? "…" : ""}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {(bundle?.relatedTopics?.length ?? 0) > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {locale === "ar" ? "موضوعات مرتبطة" : locale === "he" ? "נושאים קשורים" : "Related topics"}
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {bundle?.relatedTopics.map((e) => (
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

        {(bundle?.relatedProphets?.length ?? 0) > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {locale === "ar" ? "أنبياء مرتبطون" : locale === "he" ? "נביאים קשורים" : "Related prophets"}
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {bundle?.relatedProphets.map((e) => (
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

        {(bundle?.relatedHadith?.length ?? 0) > 0 && (
          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {locale === "ar" ? "أحاديث مشابهة" : locale === "he" ? "חדית׳ דומה" : "Related hadith"}
            </h2>
            <div className="space-y-3">
              {bundle?.relatedHadith.map((rh) => (
                <Link
                  key={`${rh.collection_slug}-${rh.global_id}`}
                  to="/hadith/$collection/entry/$num"
                  params={{ collection: rh.collection_slug, num: String(rh.global_id) }}
                  className="block rounded-lg border border-border bg-background px-3 py-2 hover:border-primary/40"
                >
                  <p className="text-xs text-primary">
                    {rh.collection_slug === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim"} · #{rh.id_in_book}
                  </p>
                  {rh.narrator ? <p className="text-[11px] italic text-muted-foreground">{rh.narrator}</p> : null}
                  {rh.english_text ? (
                    <p className="mt-1 text-xs text-foreground/85">
                      {rh.english_text.slice(0, 230)}
                      {rh.english_text.length > 230 ? "…" : ""}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        )}

        {bundle?.narrator && (
          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-2 text-sm font-semibold text-foreground">
              {locale === "ar" ? "الراوي" : locale === "he" ? "המספר" : "Narrator profile"}
            </h2>
            <p className="text-sm font-medium text-foreground">{bundle.narrator.narrator}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {bundle.narrator.hadith_count} hadith · {bundle.narrator.collections.join(", ")}
            </p>
          </section>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Source: {label}, Book {h.book_id}, Hadith {h.id_in_book} (global #{h.global_id}).
        </p>
      </main>
    </div>
  );
}
