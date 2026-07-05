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
      { title: "Hadith — Sahih al-Bukhari & Sahih Muslim" },
      {
        name: "description",
        content:
          "Browse Sahih al-Bukhari and Sahih Muslim with full Arabic text, English translation, and connections to Quran verses and topics.",
      },
      { property: "og:title", content: "Hadith Library" },
      {
        property: "og:description",
        content: "Sahih al-Bukhari and Sahih Muslim in one searchable library.",
      },
      { property: "og:url", content: "/hadith" },
    ],
    links: [{ rel: "canonical", href: "/hadith" }],
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
  const { data } = useQuery({ queryKey: ["hadith", "collections"], queryFn: () => fn() });

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "he" ? "ספריית החדית'" : locale === "ar" ? "مكتبة الحديث" : "Hadith Library"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {locale === "he"
            ? "סהיח אל-בוח'ארי וסהיח מוסלים — טקסט ערבי מקורי עם תרגום לאנגלית."
            : locale === "ar"
              ? "صحيح البخاري وصحيح مسلم — النص العربي الأصلي مع الترجمة الإنجليزية."
              : "Sahih al-Bukhari and Sahih Muslim — original Arabic with English translation."}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
