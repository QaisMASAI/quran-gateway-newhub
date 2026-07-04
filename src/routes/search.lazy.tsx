import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { buildQuranIndex, chapterDisplayName, type SurahGroup } from "@/lib/quran-api";
import { searchWithFallback } from "@/lib/quran-search";
import { Header } from "@/components/Header";
import { Search as SearchIcon, Loader2, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { searchEntities, searchKnowledgeTexts, type EntityKind } from "@/lib/knowledge";
import { EntityCard } from "@/components/discovery/EntityCard";
import { normalizeLocale, type Locale } from "@/lib/i18n";

export const Route = createLazyFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const isRtl = i18n.dir() === "rtl";
  const [input, setInput] = useState("");
  const deferred = useDeferredValue(input);
  const trimmed = deferred.trim();

  const indexQ = useQuery({
    queryKey: ["quran-index"],
    queryFn: buildQuranIndex,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const entitiesQ = useQuery({
    queryKey: ["entity-search", trimmed],
    queryFn: () => searchEntities(trimmed, 12),
    enabled: trimmed.length >= 2,
    staleTime: 60_000,
  });

  const textsQ = useQuery({
    queryKey: ["knowledge-text-search", trimmed],
    queryFn: () => searchKnowledgeTexts(trimmed, 10),
    enabled: trimmed.length >= 2,
    staleTime: 60_000,
  });

  const results = useMemo(() => {
    if (!indexQ.data) return null;
    if (trimmed.length < 2) return null;
    return searchWithFallback(indexQ.data, trimmed, locale);
  }, [indexQ.data, trimmed, locale]);

  const suggestions = t("search.suggestions", { returnObjects: true }) as string[];

  const kindLabel = (k: EntityKind) => t(`search.kind${k.charAt(0).toUpperCase()}${k.slice(1)}` as const);

  return (
    <div className={`min-h-screen bg-background ${locale === "ar" ? "font-ui-ar" : locale === "en" ? "font-ui-en" : "font-ui-he"}`} dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <div className="border-b border-border bg-gradient-to-b from-primary-soft/40 to-transparent">
        <div className="mx-auto max-w-3xl px-4 pb-2 pt-8 sm:px-6">
          <h1 className="text-2xl font-bold text-foreground">{t("search.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("search.subtitle")}</p>
        </div>
        <div className="mosque-arch" aria-hidden />
      </div>

      <main id="main" className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="surface-card flex items-center gap-2 px-3 py-2.5">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("search.placeholder")}
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70"
            dir="auto"
          />
          {indexQ.isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {indexQ.isLoading && (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("search.loadingIndex")}
          </p>
        )}
        {indexQ.error && (
          <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {t("search.indexError")}
          </p>
        )}

        {!results && input.trim().length < 2 && indexQ.data && (
          <div className="mt-8">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t("search.suggestionsLabel")}</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:border-primary/40 hover:bg-primary-soft"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {entitiesQ.data && entitiesQ.data.length > 0 && (
          <section className="mt-6">
            <SectionTitle>{t("search.discoveryHeading")}</SectionTitle>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {entitiesQ.data.map((e) => (
                <EntityCard key={e.id} entity={e} locale={locale} kindLabel={kindLabel(e.kind)} />
              ))}
            </div>
          </section>
        )}

        {textsQ.data && textsQ.data.length > 0 && (
          <section className="mt-6">
            <SectionTitle>{t("search.tafsirHits", "Tafsir and context matches")}</SectionTitle>
            <div className="space-y-2">
              {textsQ.data.map((row) => (
                <article key={`${row.kind}-${row.id}`} className="surface-card px-4 py-3">
                  <p className="text-xs font-semibold text-primary">
                    {row.kind.toUpperCase()} · {row.source_name}
                    {row.surah && row.ayah_start ? ` · ${row.surah}:${row.ayah_start}${row.ayah_end && row.ayah_end !== row.ayah_start ? `-${row.ayah_end}` : ""}` : ""}
                  </p>
                  <p className={`mt-1 text-sm leading-relaxed text-foreground/90 ${locale === "ar" ? "font-tafsir-hadith-ar" : locale === "en" ? "font-tafsir-hadith-en" : "font-tafsir-hadith-he"}`} dir={locale === "en" ? "ltr" : "rtl"}>{row.text.slice(0, 220)}{row.text.length > 220 ? "…" : ""}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {results && (
          <div className="mt-6 space-y-6">
            {results.chapterMatches.length > 0 && (
              <section>
                <SectionTitle>{t("search.chapterMatches")}</SectionTitle>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {results.chapterMatches.map((c) => (
                    <Link
                      key={c.id}
                      to="/surah/$id"
                      params={{ id: String(c.id) }}
                      className={`surface-card flex items-center justify-between gap-3 px-4 py-3 hover:border-primary/40 ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <span className="font-arabic-ui text-lg" dir="rtl">
                          {c.name_arabic}
                        </span>
                        <span className="text-sm text-muted-foreground">{chapterDisplayName(c, locale)}</span>
                      </div>
                      {isRtl ? (
                        <ChevronRight className="h-4 w-4 text-primary" />
                      ) : (
                        <ChevronLeft className="h-4 w-4 text-primary" />
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.groups.length === 0 && results.chapterMatches.length === 0 && (
              <p className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                {t("search.noResultsFor", { q: deferred })}
              </p>
            )}

            {results.groups.length > 0 && (
              <section>
                <SectionTitle>
                  {t("search.foundVersesInSurahs", {
                    total: results.total,
                    groups: results.groups.length,
                  })}
                </SectionTitle>
                <div className="space-y-3">
                  {results.groups.map((g) => (
                    <SurahGroupCard key={g.chapter.id} group={g} query={deferred.trim()} locale={locale} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
      <span className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
    </h2>
  );
}

function SurahGroupCard({ group, query, locale }: { group: SurahGroup; query: string; locale: Locale }) {
  const { t, i18n } = useTranslation("pages");
  const isRtl = i18n.dir() === "rtl";
  const [open, setOpen] = useState(group.count <= 3);
  const preview = open ? group.hits : group.hits.slice(0, 2);

  return (
    <div className="surface-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-start hover:bg-secondary/40 ${isRtl ? "flex-row-reverse" : ""}`}
      >
        <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-xs font-bold text-primary">
            {group.chapter.id}
          </div>
          <div>
            <div className={`flex items-baseline gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
              <span className="font-arabic text-base font-semibold" dir="rtl">
                {group.chapter.name_arabic}
              </span>
              <span className="text-sm text-muted-foreground">{chapterDisplayName(group.chapter, locale)}</span>
            </div>
            <div className="text-[11px] text-muted-foreground">{t("search.matchingVerses", { n: group.count })}</div>
          </div>
        </div>
        {isRtl ? (
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
        ) : (
          <ChevronLeft className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "-rotate-90" : ""}`} />
        )}
      </button>

      <div className="divide-y divide-border border-t border-border">
        {preview.map((h) => (
          <Link
            key={h.verse.verse_key}
            to="/surah/$id"
            params={{ id: String(h.verse.surah) }}
            hash={`v-${h.verse.ayah}`}
            search={{ q: query }}
            className="block px-4 py-3 hover:bg-secondary/30"
          >
            <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
              <span className="font-medium text-primary">{t("search.verseN", { n: h.verse.ayah })}</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                {t("search.openInSurah")}
              </span>
            </div>
            {(() => {
              if (locale === "en" && h.verse.english) {
                return (
                  <>
                    <p className="text-start text-sm text-foreground/90" dir="ltr">
                      {truncate(h.verse.english, 180)}
                    </p>
                    <p className="font-quran mt-1.5 text-right text-base text-muted-foreground/80" dir="rtl" lang="ar">
                      {truncateArabic(h.verse.arabic)}
                    </p>
                  </>
                );
              }
              if (h.matchedIn === "hebrew" || h.matchedIn === "english") {
                return (
                  <>
                    <p
                      className={`text-sm text-foreground/90 ${h.matchedIn === "hebrew" ? "hebrew-text" : "text-start"}`}
                      dir={h.matchedIn === "hebrew" ? "rtl" : "ltr"}
                    >
                      {stripSnippetHtml(h.snippet)}
                    </p>
                    <p className="font-quran mt-1.5 text-right text-base text-muted-foreground/80" dir="rtl" lang="ar">
                      {truncateArabic(h.verse.arabic)}
                    </p>
                  </>
                );
              }
              return (
                <>
                  <p className="font-quran text-right text-lg text-foreground" dir="rtl" lang="ar">
                    {stripSnippetHtml(h.snippet)}
                  </p>
                  {locale === "he" && h.verse.hebrew && (
                    <p className="hebrew-text mt-1.5 text-sm text-muted-foreground">{truncate(h.verse.hebrew, 140)}</p>
                  )}
                </>
              );
            })()}
          </Link>
        ))}
        {!open && group.hits.length > preview.length && (
          <button
            onClick={() => setOpen(true)}
            className="block w-full px-4 py-2 text-center text-xs font-medium text-primary hover:bg-secondary/30"
          >
            {t("search.showMore", { n: group.hits.length - preview.length })}
          </button>
        )}
      </div>
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function truncateArabic(s: string): string {
  return truncate(s, 120);
}

function stripSnippetHtml(value: string): string {
  return value.replace(/<[^>]+>/g, "").trim();
}