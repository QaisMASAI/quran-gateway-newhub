import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { TrustBadge } from "@/components/TrustBadge";
import { getEmotion } from "@/lib/emotions";
import type { AyahRef } from "@/lib/topics";
import { useEmotionT } from "@/lib/content-i18n";
import { SURAH_NAMES_HE } from "@/lib/surah-names-he";
import { ArrowRight, ChevronLeft, BookOpen } from "lucide-react";

export const Route = createFileRoute("/emotions/$slug")({
  loader: ({ params }) => {
    const emotion = getEmotion(params.slug);
    if (!emotion) throw notFound();
    return { emotion };
  },
  head: ({ params, loaderData }) => {
    const e = loaderData?.emotion;
    const title = e ? `${e.title} — פסוקים מהקוראן` : "רגש בקוראן";
    const description = e?.description ?? "פסוקים מתוך הקוראן הקדוש המתייחסים לרגשות.";
    const url = `/emotions/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
  component: EmotionPage,
});

function NotFound() {
  const { t } = useTranslation("pages");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="mb-2 font-display text-2xl font-bold text-primary">
          {t("detail.notFoundEmotion")}
        </h1>
        <Link to="/emotions" className="text-sm text-gold underline">
          {t("detail.backToEmotions")}
        </Link>
      </div>
    </div>
  );
}
function ErrorView({ reset }: { reset: () => void }) {
  const { t } = useTranslation("pages");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="mb-4 text-sm text-destructive">{t("detail.errorGeneric")}</p>
        <button
          onClick={() => reset()}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          {t("detail.retry")}
        </button>
      </div>
    </div>
  );
}

function EmotionPage() {
  const { emotion } = Route.useLoaderData();
  const { t } = useTranslation("pages");
  const e = useEmotionT(emotion.slug);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          to="/emotions"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowRight className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
          {t("detail.backToEmotions")}
        </Link>

        <header className="mt-6 rounded-3xl border border-primary/10 bg-card p-8 text-center shadow-sm">
          <h1 className="font-display text-4xl font-bold text-primary">{e.title}</h1>
          {e.subtitle && <p className="mt-2 text-sm text-muted-foreground">{e.subtitle}</p>}
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-foreground/80">
            {e.description}
          </p>
        </header>

        <div className="mt-6">
          <TrustBadge variant="block" />
        </div>

        <section className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-primary">
            <BookOpen className="h-5 w-5 text-gold" aria-hidden="true" />
            {t("detail.versesFromQuran")}
          </h2>

          <ul className="space-y-2">
            {emotion.refs.map((ref: AyahRef, i: number) => {
              const surahName =
                SURAH_NAMES_HE[ref.surah] ?? t("detail.surahFallback", { n: ref.surah });
              const label = ref.to
                ? t("detail.rangeVerses", { from: ref.ayah, to: ref.to })
                : t("detail.singleVerse", { n: ref.ayah });
              return (
                <li key={i}>
                  <Link
                    to="/surah/$id"
                    params={{ id: String(ref.surah) }}
                    search={{ q: undefined }}
                    hash={`v-${ref.ayah}`}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-primary/5 bg-card p-4 transition-all hover:border-gold hover:shadow-md"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-primary">{surahName}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                    <ChevronLeft
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-gold ltr:rotate-180"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <p className="mt-10 rounded-xl border border-primary/10 bg-secondary/40 p-4 text-xs leading-relaxed text-muted-foreground">
          {t("detail.emotionsNote")}
        </p>
      </main>
    </div>
  );
}
