import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { useRecentlyViewed } from "@/lib/recently-viewed";

const HOME_RECENT_PROMPTS_KEY = "noor:home:recent-prompts:v1";

export const Route = createFileRoute("/recent-ai")({
  head: () => ({
    meta: [
      { title: "Recent AI Sessions — Noor Quran & Hadith" },
      {
        name: "description",
        content:
          "Resume your latest Quran AI prompts, jump back to cited verses, and continue grounded study sessions.",
      },
      { property: "og:title", content: "Recent AI Sessions — Noor Quran & Hadith" },
      {
        property: "og:description",
        content:
          "Reopen recent AI conversations and continue from your latest grounded Quran research questions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/recent-ai" }],
  }),
  component: RecentAiPage,
});

function RecentAiPage() {
  const { i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const isRtl = i18n.dir() === "rtl";
  const { items: recentViews } = useRecentlyViewed();

  const recentPrompts = useMemo(() => {
    if (typeof window === "undefined") return [] as string[];
    try {
      const raw = window.localStorage.getItem(HOME_RECENT_PROMPTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 8);
    } catch {
      return [];
    }
  }, []);

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "ar" ? "جلسات AI الأخيرة" : locale === "he" ? "שיחות AI אחרונות" : "Recent AI Sessions"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {locale === "ar"
            ? "استأنف أسئلتك السابقة أو ابدأ جلسة جديدة مع مصادر موثقة."
            : locale === "he"
              ? "המשיכו שאלות קודמות או פתחו שיחה חדשה עם מקורות מאומתים."
              : "Resume previous prompts or start a new grounded session with citations."}
        </p>

        {recentPrompts.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-foreground">
              {locale === "ar" ? "أسئلة حديثة" : locale === "he" ? "שאלות אחרונות" : "Recent prompts"}
            </h2>
            <div className="mt-3 space-y-2">
              {recentPrompts.map((prompt) => (
                <Link
                  key={prompt}
                  to="/ask"
                  search={{ q: prompt, qState: "ok", src: "recent_ai" }}
                  className="surface-card block p-3 text-sm text-foreground transition-colors hover:border-primary/40"
                >
                  {prompt}
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            {locale === "ar"
              ? "لا توجد جلسات محفوظة حتى الآن."
              : locale === "he"
                ? "אין עדיין שיחות שמורות."
                : "No saved sessions yet."}
          </section>
        )}

        {recentViews.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-foreground">
              {locale === "ar" ? "آيات عُدت إليها" : locale === "he" ? "פסוקים שחזרת אליהם" : "Recently revisited verses"}
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {recentViews
                .filter((item) => item.kind === "surah")
                .slice(0, 6)
                .map((item) => (
                  <Link
                    key={`${item.surah}-${item.ayah}`}
                    to="/surah/$id"
                    params={{ id: String(item.surah) }}
                    hash={item.ayah ? `v-${item.ayah}` : undefined}
                    className="surface-card block p-3 text-sm text-foreground transition-colors hover:border-primary/40"
                  >
                    {item.label}
                  </Link>
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
