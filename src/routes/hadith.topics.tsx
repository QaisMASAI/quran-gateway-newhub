import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { listHadithTopicBooks, listHadithTopics } from "@/lib/hadith.functions";
import { pickLocale } from "@/lib/knowledge";
import { normalizeLocale } from "@/lib/i18n";

export const Route = createFileRoute("/hadith/topics")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["hadith", "topic-books"],
      queryFn: () => listHadithTopicBooks({ data: { limitPerCollection: 10 } }),
    });
  },
  component: HadithTopicsPage,
});

function HadithTopicsPage() {
  const { i18n } = useTranslation();
  const locale = (normalizeLocale(i18n.language) ?? "he") as "he" | "ar" | "en";
  const isRtl = i18n.dir() === "rtl";
  const fn = useServerFn(listHadithTopicBooks);
  const topicsFn = useServerFn(listHadithTopics);
  const { data = [] } = useQuery({
    queryKey: ["hadith", "topic-books"],
    queryFn: () => fn({ data: { limitPerCollection: 10 } }),
  });
  const { data: topics = [] } = useQuery({
    queryKey: ["hadith", "topics"],
    queryFn: () => topicsFn({ data: { limit: 24 } }),
  });

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "he"
            ? "חדית' לפי נושאים"
            : locale === "ar"
              ? "الحديث حسب الموضوع"
              : "Hadith by Topics"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {locale === "he"
            ? "עיינו בספרי החדית' המובילים בכל אוסף כנושאי לימוד."
            : locale === "ar"
              ? "تصفح كتب الحديث الأبرز في كل مجموعة كموضوعات تعلم."
              : "Browse the top hadith books in each collection as learning topics."}
        </p>

        {topics.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-foreground">
              {locale === "he"
                ? "נושאים קשורים אמיתיים"
                : locale === "ar"
                  ? "موضوعات مرتبطة فعلاً"
                  : "Real related topics"}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  to="/learn/$kind/$slug"
                  params={{ kind: "topic", slug: topic.slug }}
                  className="surface-card block p-4 transition-colors hover:border-primary/40"
                >
                  <div className="text-sm font-semibold text-foreground">
                    {pickLocale(topic.title_i18n, locale)}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {topic.hadith_count} hadith · {topic.collections.join(", ")}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            {locale === "he"
              ? "עדיין אין קישורי נושאים ב־DB. הפעילו תחילה את קישור נושאי החדית׳ מלוח הניהול."
              : locale === "ar"
                ? "لا توجد روابط موضوعات في قاعدة البيانات حتى الآن. شغّل ربط موضوعات الحديث أولاً من لوحة الإدارة."
                : "No DB topic links are available yet. Run Hadith topic linking from the admin dashboard first."}
          </div>
        )}

        <h2 className="mt-8 text-sm font-semibold text-foreground">
          {locale === "he"
            ? "ספרים מובילים לפי אוספים"
            : locale === "ar"
              ? "أبرز الكتب حسب المجموعات"
              : "Top books by collection"}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {data.map((b) => (
            <Link
              key={`${b.collection_slug}-${b.book_id}`}
              to="/hadith/$collection/$book"
              params={{ collection: b.collection_slug, book: String(b.book_id) }}
              className="surface-card block p-4 transition-colors hover:border-primary/40"
            >
              <div className="text-xs font-semibold uppercase text-primary">
                {b.collection_slug === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim"}
              </div>
              <div className="mt-1 font-arabic-ui text-lg" dir="rtl">
                {b.name_ar}
              </div>
              <div className="text-sm text-foreground/90">{b.name_en}</div>
              <div className="mt-2 text-xs text-muted-foreground">{b.hadith_count} hadith</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
