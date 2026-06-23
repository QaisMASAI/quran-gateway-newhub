import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { getProphet, type AyahRef } from "@/lib/prophets";
import { useProphetT } from "@/lib/content-i18n";
import { SURAH_NAMES_HE } from "@/lib/surah-names-he";
import { ChevronLeft, BookOpen, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/prophets/$slug")({
  loader: ({ params }) => {
    const prophet = getProphet(params.slug);
    if (!prophet) throw notFound();
    return { prophet };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.prophet;
    const title = p ? `${p.nameHe} (${p.nameAr}) — נביא בקוראן` : "נביא בקוראן";
    const description = p
      ? `פסוקים בקוראן הקדוש בהם נזכר ${p.nameHe}${p.nameHeAlt ? ` (${p.nameHeAlt})` : ""}.`
      : "נביאי הקוראן הקדוש.";
    const url = `/prophets/${params.slug}`;
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
  component: ProphetPage,
});


function NotFound() {
  const { t } = useTranslation("pages");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="mb-2 font-display text-2xl font-bold text-primary">{t("detail.notFoundProphet")}</h1>
        <Link to="/prophets" className="text-sm text-gold underline">{t("detail.backToProphets")}</Link>
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
        <button onClick={() => reset()} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">{t("detail.retry")}</button>
      </div>
    </div>
  );
}

function ProphetPage() {
  const { prophet } = Route.useLoaderData();
  const { t } = useTranslation("pages");
  const p = useProphetT(prophet.slug);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link to="/prophets" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowRight className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
          {t("detail.backToProphets")}
        </Link>

        <header className="mt-6 rounded-3xl border border-primary/10 bg-card p-8 text-center shadow-sm">
          <p className="font-arabic text-4xl text-primary" dir="rtl">{prophet.nameAr}</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-primary">{p.name}</h1>
          {p.alt && (
            <p className="mt-1 text-sm text-muted-foreground">
              {t("detail.alsoKnownAs")}: {p.alt}
            </p>
          )}
        </header>

        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-primary">
            <BookOpen className="h-5 w-5 text-gold" aria-hidden="true" />
            {t("detail.verseReferences")}
          </h2>
          <p className="mb-5 text-xs text-muted-foreground">
            {t("detail.prophetIntro", { name: p.name })}
          </p>

          <ul className="space-y-2">
            {prophet.refs.map((ref: AyahRef, i: number) => {
              const surahName = SURAH_NAMES_HE[ref.surah] ?? t("detail.surahFallback", { n: ref.surah });
              const label = ref.to ? t("detail.rangeVerses", { from: ref.ayah, to: ref.to }) : t("detail.singleVerse", { n: ref.ayah });
              return (
                <li key={i}>
                  <Link
                    to="/surah/$id"
                    params={{ id: String(ref.surah) }}
                    hash={`v-${ref.ayah}`}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-primary/5 bg-card p-4 transition-all hover:border-gold hover:shadow-md"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-primary">{surahName}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                    <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-gold ltr:rotate-180" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <p className="mt-10 rounded-xl border border-primary/10 bg-secondary/40 p-4 text-xs leading-relaxed text-muted-foreground">
          {t("detail.prophetsNote")}
        </p>
      </main>
    </div>
  );
}
