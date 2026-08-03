import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useDeferredValue, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { buildQuranIndex, chapterDisplayName, type SurahGroup } from "@/lib/quran-api";
import { searchWithFallback } from "@/lib/quran-search";
import { useServerFn } from "@tanstack/react-start";
import { searchQuranItemsHybrid } from "@/lib/hybrid-search.functions";
import { Header } from "@/components/Header";
import {
  Search as SearchIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Brain,
  Library,
  Users,
} from "lucide-react";
import { searchEntities, searchKnowledgeTexts, type EntityKind } from "@/lib/knowledge";
import { searchHadith } from "@/lib/hadith.functions";
import { EntityCard } from "@/components/discovery/EntityCard";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { localeTextDir, tafsirFontClass, uiFontClass } from "@/lib/locale-ui";
import type { ReactNode } from "react";
import { useQueryPrefillInput } from "@/hooks/useQueryPrefillInput";
import { trackHomePromptEvent } from "@/lib/home-prompts.functions";

export const Route = createLazyFileRoute("/research")({
  component: SearchPage,
});

function SearchPage() {
  const { q, qState, src } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const isRtl = i18n.dir() === "rtl";
  const uiClass = uiFontClass(locale);
  const tafsirClass = tafsirFontClass(locale);
  const textDir = localeTextDir(locale);
  const { input, setInput, trimmed } = useQueryPrefillInput({ initialQ: q });
  const [hadithPage, setHadithPage] = useState(0);
  const deferred = useDeferredValue(input);
  const deferredTrimmed = deferred.trim();
  const runQuranItemsHybrid = useServerFn(searchQuranItemsHybrid);
  const runHadithSearch = useServerFn(searchHadith);
  const trackPrompt = useServerFn(trackHomePromptEvent);

  const indexQ = useQuery({
    queryKey: ["quran-index"],
    queryFn: buildQuranIndex,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const entitiesQ = useQuery({
    queryKey: ["entity-search", deferredTrimmed],
    queryFn: () => searchEntities(deferredTrimmed, 12),
    enabled: deferredTrimmed.length >= 2,
    staleTime: 60_000,
  });

  const textsQ = useQuery({
    queryKey: ["knowledge-text-search", deferredTrimmed],
    queryFn: () => searchKnowledgeTexts(deferredTrimmed, 10),
    enabled: deferredTrimmed.length >= 2,
    staleTime: 60_000,
  });

  const quranItemsQ = useQuery({
    queryKey: ["quran-items-hybrid", deferredTrimmed, locale],
    queryFn: () =>
      runQuranItemsHybrid({
        data: {
          q: deferredTrimmed,
          language: locale,
          semantic: true,
          limit: 8,
        },
      }),
    enabled: deferredTrimmed.length >= 2,
    staleTime: 60_000,
  });

  const hadithQ = useQuery({
    queryKey: ["hadith-search", deferredTrimmed, hadithPage],
    queryFn: () =>
      runHadithSearch({
        data: {
          q: deferredTrimmed,
          page: hadithPage,
          pageSize: 8,
        },
      }),
    enabled: deferredTrimmed.length >= 2,
    staleTime: 60_000,
  });

  const hadithItems = hadithQ.data?.items ?? [];

  useEffect(() => {
    if (hadithPage !== 0 && hadithItems.length === 0 && !hadithQ.isFetching) {
      setHadithPage(0);
    }
  }, [hadithItems.length, hadithPage, hadithQ.isFetching]);

  useEffect(() => {
    setHadithPage(0);
  }, [deferredTrimmed]);

  useEffect(() => {
    if (src !== "hero_input" && src !== "popular_questions") return;
    if (qState !== "ok" || !q) return;
    void trackPrompt({
      data: {
        event: "prefill_applied",
        destination: "/search",
        source: src,
        q,
        qState,
      },
    });
  }, [q, qState, src, trackPrompt]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQ = trimmed;
    if (nextQ.length < 2) return;
    void navigate({
      to: "/search",
      search: {
        q: nextQ,
        qState: "ok",
        src,
      },
      replace: true,
    });
  }

  const prefillMessage =
    qState === "missing"
      ? locale === "ar"
        ? "ابدأ بكتابة سؤال للبحث."
        : locale === "he"
          ? "התחל בהקלדת שאלה לחיפוש."
          : "Start by typing a question to search."
      : qState === "empty"
        ? locale === "ar"
          ? "قيمة البحث فارغة — اكتب سؤالًا للمتابعة."
          : locale === "he"
            ? "ערך החיפוש ריק — כתוב שאלה כדי להמשיך."
            : "The search query is empty — enter a question to continue."
        : qState === "invalid"
          ? locale === "ar"
            ? "قيمة ?q غير صالحة وتم تنظيفها. يمكنك تعديلها ثم البحث."
            : locale === "he"
              ? "הערך ?q לא תקין ונוקה. אפשר לערוך ולהמשיך בחיפוש."
              : "The ?q value was invalid and has been sanitized. You can edit it and continue."
          : null;

  const results = useMemo(() => {
    if (!indexQ.data) return null;
    if (deferredTrimmed.length < 2) return null;
    return searchWithFallback(indexQ.data, deferredTrimmed, locale);
  }, [indexQ.data, deferredTrimmed, locale]);

  const rawSuggestions = t("search.suggestions", { returnObjects: true }) as string[];
  const suggestions = useMemo(
    () => Array.from(new Set(Array.isArray(rawSuggestions) ? rawSuggestions : [])),
    [rawSuggestions],
  );

  const quickSuggestions = useMemo(() => {
    const base =
      locale === "ar"
        ? ["الرحمة", "الصبر", "موسى", "إبراهيم", "العدل", "التوبة"]
        : locale === "he"
          ? ["רחמים", "סבלנות", "משה", "אברהם", "צדק", "תשובה"]
          : ["mercy", "patience", "Musa", "Abraham", "justice", "repentance"];
    return Array.from(new Set(base));
  }, [locale]);

  const groupedResultCounts = useMemo(
    () => ({
      verses: (results?.total ?? 0) + (quranItemsQ.data?.hits.length ?? 0),
      tafsir: textsQ.data?.length ?? 0,
      hadith: hadithItems.length,
      entities: entitiesQ.data?.length ?? 0,
      prophets: (entitiesQ.data ?? []).filter((e) => e.kind === "prophet").length,
      stories: (entitiesQ.data ?? []).filter((e) => e.kind === "story").length,
      topics: (entitiesQ.data ?? []).filter((e) => e.kind === "topic").length,
      places: (entitiesQ.data ?? []).filter((e) => e.kind === "place").length,
      people: (entitiesQ.data ?? []).filter((e) => e.kind === "nation").length,
    }),
    [results?.total, quranItemsQ.data?.hits.length, textsQ.data?.length, hadithItems.length, entitiesQ.data],
  );

  const kindLabel = (k: EntityKind) => t(`search.kind${k.charAt(0).toUpperCase()}${k.slice(1)}` as const);

  return (
    <div className={`min-h-screen bg-background ${uiClass}`} dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <div className="border-b border-border bg-gradient-to-b from-primary-soft/40 to-transparent">
        <div className="mx-auto max-w-3xl px-4 pb-2 pt-8 sm:px-6">
          <h1 className="text-2xl font-bold text-foreground">
            {locale === "ar"
              ? "المساعد الذكي للمعرفة"
              : locale === "he"
                ? "עוזר הידע החכם"
                : "Intelligent Knowledge Assistant"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("search.subtitle")}</p>
        </div>
        <div className="mosque-arch" aria-hidden />
      </div>

      <main id="main" className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="surface-card border-primary/20 bg-gradient-to-br from-card to-primary-soft/20 px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {locale === "ar" ? "بحث دلالي" : locale === "he" ? "חיפוש סמנטי" : "Semantic Search"}
          </div>
          <form
            onSubmit={submitSearch}
            className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5"
          >
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("search.placeholder")}
              aria-label={t("search.placeholder")}
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70"
              dir="auto"
              list="search-suggestions"
            />
            <button
              type="submit"
              className="rounded-lg border border-border px-2 py-1 text-xs text-foreground hover:border-primary/40"
            >
              {locale === "ar" ? "ابحث" : locale === "he" ? "חפש" : "Search"}
            </button>
            {indexQ.isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <datalist id="search-suggestions">
              {Array.from(new Set([...suggestions, ...quickSuggestions])).map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </form>
          {prefillMessage ? (
            <p className="mt-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
              {prefillMessage}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {quickSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setInput(s)}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground hover:border-primary/40"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {deferredTrimmed.length >= 2 && (
          <section className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ResultPill icon={<BookOpen className="h-3.5 w-3.5" />} label="Verses" value={groupedResultCounts.verses} />
            <ResultPill icon={<Library className="h-3.5 w-3.5" />} label="Tafsir" value={groupedResultCounts.tafsir} />
            <ResultPill icon={<Brain className="h-3.5 w-3.5" />} label="Hadith" value={groupedResultCounts.hadith} />
            <ResultPill
              icon={<Users className="h-3.5 w-3.5" />}
              label="Knowledge"
              value={groupedResultCounts.entities}
            />
          </section>
        )}

        {deferredTrimmed.length >= 2 && (
          <section className="mt-2 flex flex-wrap gap-1.5">
            <CategoryChip label="Prophets" value={groupedResultCounts.prophets} />
            <CategoryChip label="Stories" value={groupedResultCounts.stories} />
            <CategoryChip label="Topics" value={groupedResultCounts.topics} />
            <CategoryChip label="Places" value={groupedResultCounts.places} />
            <CategoryChip label="People" value={groupedResultCounts.people} />
          </section>
        )}

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
                    {row.surah && row.ayah_start
                      ? ` · ${row.surah}:${row.ayah_start}${row.ayah_end && row.ayah_end !== row.ayah_start ? `-${row.ayah_end}` : ""}`
                      : ""}
                  </p>
                  <p className={`mt-1 text-sm leading-relaxed text-foreground/90 ${tafsirClass}`} dir={textDir}>
                    {row.text.slice(0, 220)}
                    {row.text.length > 220 ? "…" : ""}
                  </p>
                  {(row.kind === "tafsir" || row.kind === "asbab") && row.surah && row.ayah_start ? (
                    <Link
                      to="/surah/$id"
                      params={{ id: String(row.surah) }}
                      search={{ q: undefined }}
                      hash={`v-${row.ayah_start}`}
                      className="mt-2 inline-flex text-xs font-medium text-primary hover:underline"
                    >
                      {locale === "ar" ? "افتح في السورة" : locale === "he" ? "פתח בסורה" : "Open in surah"}
                    </Link>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        )}

        {quranItemsQ.data && quranItemsQ.data.hits.length > 0 && (
          <section className="mt-6">
            <SectionTitle>{t("search.discoveryHeading")}</SectionTitle>
            <div className="space-y-2">
              {quranItemsQ.data.hits.map((hit) => {
                const title = hit.title_i18n?.[locale] || hit.title_i18n?.en || hit.title_i18n?.ar || "";
                const body = hit.body_i18n?.[locale] || hit.body_i18n?.en || hit.body_i18n?.ar || "";
                return (
                  <article key={hit.item_id} className="surface-card px-4 py-3">
                    <p className="text-xs font-semibold text-primary">
                      {hit.dataset_kind.toUpperCase()}
                      {hit.surah && hit.ayah_start
                        ? ` · ${hit.surah}:${hit.ayah_start}${hit.ayah_end && hit.ayah_end !== hit.ayah_start ? `-${hit.ayah_end}` : ""}`
                        : ""}
                    </p>
                    {title ? <p className="mt-1 text-sm font-semibold text-foreground">{title}</p> : null}
                    {body ? (
                      <p className={`mt-1 text-sm leading-relaxed text-foreground/85 ${tafsirClass}`} dir={textDir}>
                        {body.slice(0, 180)}
                        {body.length > 180 ? "…" : ""}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {hadithQ.isError && (
          <section className="mt-6">
            <SectionTitle>{t("search.hadithHits", "Hadith matches")}</SectionTitle>
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {t("search.indexError")}
            </p>
          </section>
        )}

        {hadithItems.length > 0 && (
          <section className="mt-6">
            <SectionTitle>{t("search.hadithHits", "Hadith matches")}</SectionTitle>
            <div className="space-y-3">
              {hadithItems.map((h) => (
                <Link
                  key={`${h.collection_slug}-${h.global_id}`}
                  to="/hadith/$collection/entry/$num"
                  params={{ collection: h.collection_slug, num: String(h.global_id) }}
                  className="surface-card block border-primary/10 bg-gradient-to-br from-card to-primary-soft/10 px-4 py-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                      {h.collection_slug === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim"}
                    </span>
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-muted-foreground">
                      #{h.id_in_book}
                    </span>
                  </div>
                  {h.narrator ? <p className="text-[11px] italic text-muted-foreground">{h.narrator}</p> : null}
                  {h.english_text ? (
                    <p className="mt-1 text-sm text-foreground/85">
                      {h.english_text.slice(0, 180)}
                      {h.english_text.length > 180 ? "…" : ""}
                    </p>
                  ) : null}
                  {h.hebrew_text ? (
                    <p className="mt-1 text-sm text-foreground/75" dir="rtl">
                      {h.hebrew_text.slice(0, 150)}
                      {h.hebrew_text.length > 150 ? "…" : ""}
                    </p>
                  ) : null}
                  <p className="mt-1 text-right text-sm text-foreground" dir="rtl" lang="ar">
                    {h.arabic_text.slice(0, 140)}
                    {h.arabic_text.length > 140 ? "…" : ""}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setHadithPage((p) => Math.max(0, p - 1))}
                disabled={hadithPage === 0 || hadithQ.isFetching}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                {hadithQ.data?.total
                  ? `${hadithPage * 8 + 1}-${Math.min((hadithPage + 1) * 8, hadithQ.data.total)} / ${hadithQ.data.total}`
                  : ""}
              </span>
              <button
                type="button"
                onClick={() => setHadithPage((p) => p + 1)}
                disabled={!hadithQ.data?.hasMore || hadithQ.isFetching}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {deferredTrimmed.length >= 2 && (
          <section className="mt-8 rounded-xl border border-border bg-card/60 p-4">
            <h2 className="text-sm font-semibold text-foreground">
              {locale === "ar" ? "شفافية المصادر" : locale === "he" ? "שקיפות מקורות" : "Source Transparency"}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {locale === "ar"
                ? "النصوص القرآنية والحديثية والتفسيرية تُعرض كما هي مع الإحالات. أي تلخيص ذكي يُعرض منفصلًا بوضوح."
                : locale === "he"
                  ? "טקסטי קוראן, חדית' ותפסיר מוצגים כמקור עם הפניות. כל סיכום חכם מוצג בנפרד ובסימון ברור."
                  : "Quran, Hadith, and Tafsir source text is shown as-is with references; any AI summarization is clearly separated."}
            </p>
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
                      search={{ q: undefined }}
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

function ResultPill({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <div className="mb-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold text-foreground">{value.toLocaleString()}</div>
    </div>
  );
}

function CategoryChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value.toLocaleString()}</span>
    </span>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
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
