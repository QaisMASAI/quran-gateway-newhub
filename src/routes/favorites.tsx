import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { useFavorites } from "@/lib/favorites";
import { cleanText } from "@/lib/quran-api";
import { Star, Trash2, BookOpen } from "lucide-react";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const { items, remove, isAuthenticated } = useFavorites();
  const { t } = useTranslation("pages");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
            <Star className="h-5 w-5 fill-current" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{t("favorites.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("favorites.subtitle")}</p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="surface-card flex flex-col items-center px-6 py-14 text-center">
            <Star
              className="h-10 w-10 text-muted-foreground/50"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="mt-3 text-sm text-muted-foreground">{t("favorites.signInPrompt")}</p>
            <Link
              to="/auth"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("favorites.signInCta")}
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="surface-card flex flex-col items-center px-6 py-14 text-center">
            <BookOpen
              className="h-10 w-10 text-muted-foreground/50"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="mt-3 text-sm text-muted-foreground">{t("favorites.emptyTitle")}</p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("favorites.browseSurahs")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <article key={`${it.surah}-${it.ayah}`} className="surface-card px-5 py-5">
                <div className="mb-2 flex items-center justify-between">
                  <Link
                    to="/surah/$id"
                    params={{ id: String(it.surah) }}
                    search={{ q: undefined }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {t("favorites.verseLabel", { s: it.surah, a: it.ayah })} •{" "}
                    <span className="font-arabic">{it.surahName}</span>
                  </Link>
                  <button
                    onClick={() => remove(it.surah, it.ayah)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={t("favorites.remove")}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
                <p className="ayah-text text-end">{it.arabic}</p>
                <p className="hebrew-text mt-3 border-t border-border pt-3 text-[14.5px] text-foreground/80">
                  {cleanText(it.hebrew)}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
