import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Pause, Sparkles, BookText, Star, Loader2, NotebookPen, User, Tag, HeartHandshake } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { ayahAudioUrl, cleanText, normalizeHebrew, RECITERS, reciterName, getStoredReciter, type ReciterKey } from "@/lib/quran-api";
import { useFavorites } from "@/lib/favorites";
import { useQuery } from "@tanstack/react-query";
import { TAFSIR_SOURCES_META, tafsirSourceName } from "@/lib/tafsir-sources";
import { ShareButtons } from "./ShareButtons";
import { NotePanel } from "./NotePanel";
import { getAyahLinks } from "@/lib/ayah-links";
import { useReadingSettings, stripArabicDiacritics } from "@/lib/reading-settings";
import { normalizeLocale } from "@/lib/i18n";
import { getAsbabForVerse, getTafsirForVerseBySource, sourceName, TAFSIR_SOURCE_SLUG_BY_KEY } from "@/lib/tafsir-content";

interface Props {
  surah: number;
  surahName: string;
  ayah: number;
  arabic: string;
  hebrew: string;
  highlight?: string;
}

function highlightHebrew(text: string, term?: string): ReactNode | null {
  if (!term) return null;
  const cleaned = cleanText(text);
  const normTerm = normalizeHebrew(term);
  if (!normTerm) return null;
  if (!normalizeHebrew(cleaned).includes(normTerm)) return null;
  const escapedChars = [...term.trim()].map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = escapedChars.join("[\\u0591-\\u05C7\\s]*");
  try {
    const re = new RegExp(pattern, "gi");
    const matches = [...cleaned.matchAll(re)];
    if (!matches.length) return null;
    let lastIndex = 0;
    const nodes: ReactNode[] = [];
    for (const match of matches) {
      const value = match[0] ?? "";
      const index = match.index ?? 0;
      if (index > lastIndex) nodes.push(cleaned.slice(lastIndex, index));
      nodes.push(
        <mark key={`${index}-${value}`} className="search-hit">
          {value}
        </mark>,
      );
      lastIndex = index + value.length;
    }
    if (lastIndex < cleaned.length) nodes.push(cleaned.slice(lastIndex));
    return nodes;
  } catch {
    return null;
  }
}

export function AyahCard({ surah, surahName, ayah, arabic, hebrew, highlight }: Props) {
  const { isFav, toggle } = useFavorites();
  const fav = isFav(surah, ayah);
  const { t, i18n } = useTranslation("common");
  const locale = (normalizeLocale(i18n.language) ?? "he") as "he" | "ar" | "en";


  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [reciter, setReciter] = useState<ReciterKey>(() => getStoredReciter());

  const [panel, setPanel] = useState<null | "tafsir" | "sabab">(null);
  const [showNote, setShowNote] = useState(false);
  const [tafsirSource] = useState<typeof TAFSIR_SOURCES_META[number]["key"]>("jalalayn");
  const selectedTafsirSlug = TAFSIR_SOURCE_SLUG_BY_KEY[tafsirSource] ?? "al_jalalayn";
  const tafsirQ = useQuery({
    queryKey: ["tafsir-verse", surah, ayah, locale, selectedTafsirSlug],
    queryFn: () => getTafsirForVerseBySource(surah, ayah, locale, selectedTafsirSlug),
    enabled: panel === "tafsir",
    staleTime: 15 * 60_000,
  });
  const asbabQ = useQuery({
    queryKey: ["asbab-verse", surah, ayah, locale],
    queryFn: () => getAsbabForVerse(surah, ayah, locale),
    enabled: panel === "sabab",
    staleTime: 15 * 60_000,
  });

  // Sync reciter across cards
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ReciterKey>).detail;
      if (detail) setReciter(detail);
    };
    window.addEventListener("qc:reciter-change", onChange as EventListener);
    return () => window.removeEventListener("qc:reciter-change", onChange as EventListener);
  }, []);

  // Reset audio when reciter changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlaying(false);
    }
  }, [reciter]);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(ayahAudioUrl(surah, ayah, reciter));
      audioRef.current.addEventListener("ended", () => setPlaying(false));
      audioRef.current.addEventListener("error", () => setPlaying(false));
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const openPanel = (mode: "tafsir" | "sabab") => {
    if (panel === mode) {
      setPanel(null);
      return;
    }
    setPanel(mode);
  };

  const heHighlight = useMemo(() => highlightHebrew(hebrew, highlight), [hebrew, highlight]);
  const links = useMemo(() => getAyahLinks(surah, ayah), [surah, ayah]);
  const [reading] = useReadingSettings();
  const displayArabic = useMemo(
    () => (reading.stripTashkil ? stripArabicDiacritics(arabic) : arabic),
    [arabic, reading.stripTashkil],
  );
  const articleRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (heHighlight && articleRef.current) {
      articleRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <article
      ref={articleRef}
      id={`v-${ayah}`}
      className={`surface-card relative px-5 py-6 sm:px-7 sm:py-7 scroll-mt-24 ${
        heHighlight ? "ring-2 ring-primary/40" : ""
      }`}
    >
      {/* Ayah number badge — pinned to logical start corner */}
      <div className="absolute top-4 start-4 flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
        {ayah}
      </div>

      {/* Arabic — always RTL regardless of UI direction */}
      <p
        className="ayah-text ps-12 text-right"
        dir="rtl"
        lang="ar"
        style={{ fontSize: `${1.85 * reading.arabicScale}rem` }}
      >
        {displayArabic}
      </p>

      {/* Translation in the active UI language (hidden for Arabic UI) */}
      {locale !== "ar" && (
        <div className="mt-4 border-t border-border pt-4">
          {(() => {
            const isHe = locale === "he";
            const translationClass = isHe
              ? "hebrew-text text-[15px] text-foreground/85"
              : "font-reading-en text-[15px] leading-relaxed text-foreground/85 text-start";
            const translationDir = isHe ? "rtl" : "ltr";
            return heHighlight ? (
              <p className={translationClass} dir={translationDir}>{heHighlight}</p>
            ) : (
              <p className={translationClass} dir={translationDir}>{cleanText(hebrew)}</p>
            );
          })()}
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ActionBtn onClick={togglePlay} active={playing}>
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span>{playing ? t("ui.ayah.pause") : t("ui.ayah.play")}</span>
        </ActionBtn>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <span className="text-[10px] opacity-70">{t("ui.ayah.reciter")}</span>
          <span>{(() => { const r = RECITERS.find((x) => x.key === reciter); return r ? reciterName(r, locale) : ""; })()}</span>
        </div>


        <ActionBtn onClick={() => openPanel("tafsir")} active={panel === "tafsir"}>
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t("ui.ayah.tafsir")}</span>
        </ActionBtn>

        <ActionBtn onClick={() => openPanel("sabab")} active={panel === "sabab"}>
          <BookText className="h-3.5 w-3.5" />
          <span>{t("ui.ayah.sabab")}</span>
        </ActionBtn>

        <ActionBtn
          onClick={() => toggle({ surah, ayah, surahName, arabic, hebrew })}
          active={fav}
          tone={fav ? "gold" : "default"}
        >
          <Star className={`h-3.5 w-3.5 ${fav ? "fill-current" : ""}`} />
          <span>{fav ? t("ui.ayah.saved") : t("ui.ayah.save")}</span>
        </ActionBtn>

        <ActionBtn onClick={() => setShowNote((v) => !v)} active={showNote}>
          <NotebookPen className="h-3.5 w-3.5" />
          <span>{t("ui.ayah.note")}</span>
        </ActionBtn>
      </div>

      {showNote && <NotePanel surah={surah} ayah={ayah} onClose={() => setShowNote(false)} />}

      {links.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("ui.ayah.related")}
          </span>
          {links.map((l) => {
            const styles =
              l.kind === "prophet"
                ? "border-gold/30 bg-gold/10 text-foreground/80 hover:border-gold hover:text-primary"
                : l.kind === "emotion"
                  ? "border-primary/15 bg-secondary/50 text-foreground/80 hover:border-primary/40 hover:text-primary"
                  : "border-primary/20 bg-primary/5 text-primary/90 hover:border-primary/50 hover:text-primary";
            const Icon =
              l.kind === "prophet" ? User : l.kind === "emotion" ? HeartHandshake : Tag;
            if (l.kind === "emotion") {
              return (
                <Link
                  key={`${l.kind}-${l.slug}`}
                  to="/emotions/$slug"
                  params={{ slug: l.slug }}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${styles}`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{l.title}</span>
                </Link>
              );
            }

            return (
              <Link
                key={`${l.kind}-${l.slug}`}
                to="/learn/$kind/$slug"
                params={{ kind: l.kind === "prophet" ? "prophet" : "topic", slug: l.slug }}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${styles}`}
              >
                <Icon className="h-3 w-3" />
                <span>{l.title}</span>
              </Link>
            );
          })}
        </div>
      )}




      <div className="mt-4 border-t border-border pt-3">
        <ShareButtons
          surah={surah}
          ayah={ayah}
          surahName={surahName}
          arabic={arabic}
          hebrew={cleanText(hebrew)}
        />
      </div>



      {/* Tafsir/Asbab panel */}
      {panel && (() => {
        const isLoading = panel === "tafsir" ? tafsirQ.isLoading : asbabQ.isLoading;
        const hasError = panel === "tafsir" ? tafsirQ.isError : asbabQ.isError;
        return (
          <div className="mt-4 rounded-xl border border-border bg-secondary/40 px-4 py-3.5">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              {panel === "tafsir" ? <Sparkles className="h-3 w-3" /> : <BookText className="h-3 w-3" />}
              {panel === "tafsir" ? t("ui.ayah.tafsirTitle") : t("ui.ayah.sababTitle")}
            </div>

            {panel === "tafsir" && (
              <div className="mb-3 flex flex-wrap gap-1.5 border-b border-border/60 pb-2.5">
                <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11.5px] font-medium text-primary">
                  {tafsirSourceName(
                    TAFSIR_SOURCES_META.find((s) => s.key === "jalalayn") ?? TAFSIR_SOURCES_META[0],
                    locale,
                  )}
                </span>
                {(tafsirQ.data ?? []).some((row) => row.lang === "en") && (
                  <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11.5px] font-medium text-gold">
                    EN
                  </span>
                )}
              </div>
            )}

            {isLoading && (
              <div className="space-y-2 py-1" aria-label={t("ui.ayah.loadingContent")}>
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-11/12 animate-pulse rounded bg-muted" />
                <div className="h-3 w-9/12 animate-pulse rounded bg-muted" />
                <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("ui.ayah.loadingSource")}
                </div>
              </div>
            )}
            {!isLoading && hasError && (
              <p className="text-sm text-destructive">{t("ui.ayah.networkError")}</p>
            )}
            {!isLoading && panel === "tafsir" && tafsirQ.data && tafsirQ.data.length > 0 && (
              <div className="space-y-3">
                {tafsirQ.data.slice(0, 3).map((row) => (
                  <div key={row.id} className="rounded-lg border border-border/70 bg-background/60 p-3">
                    <div className="prose prose-sm max-w-none text-[14.5px] text-foreground/90 [&>p]:my-1.5 [&>h1]:text-base [&>h2]:text-base [&>h3]:text-sm [&>ul]:my-1 [&>ol]:my-1">
                      <div
                        className={`ai-explanation-block ${row.lang === "ar" ? "font-tafsir-hadith-ar" : row.lang === "en" ? "font-tafsir-hadith-en" : "font-tafsir-hadith-he"}`}
                        dir={row.lang === "en" ? "ltr" : "rtl"}
                      >
                        <ReactMarkdown skipHtml>{row.body}</ReactMarkdown>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-2 text-[11px] text-muted-foreground">
                      <BookText className="h-3 w-3" />
                      <span>
                        {t("ui.ayah.source")} <strong className="text-foreground/80">{sourceName(row.source, locale)}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && panel === "sabab" && asbabQ.data && asbabQ.data.length > 0 && (
              <div className="space-y-3">
                {asbabQ.data.slice(0, 2).map((row) => (
                  <div key={row.id} className="rounded-lg border border-border/70 bg-background/60 p-3">
                    <div className="prose prose-sm max-w-none text-[14.5px] text-foreground/90 [&>p]:my-1.5 [&>h1]:text-base [&>h2]:text-base [&>h3]:text-sm [&>ul]:my-1 [&>ol]:my-1">
                      <div
                        className={`ai-explanation-block ${row.lang === "ar" ? "font-tafsir-hadith-ar" : row.lang === "en" ? "font-tafsir-hadith-en" : "font-tafsir-hadith-he"}`}
                        dir={row.lang === "en" ? "ltr" : "rtl"}
                      >
                        <ReactMarkdown skipHtml>{row.body}</ReactMarkdown>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-2 text-[11px] text-muted-foreground">
                      <BookText className="h-3 w-3" />
                      <span>
                        {t("ui.ayah.source")} <strong className="text-foreground/80">{sourceName(row.source, locale)}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && panel === "tafsir" && tafsirQ.data && tafsirQ.data.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("ui.ayah.noTafsir")}</p>
            )}
            {!isLoading && panel === "sabab" && asbabQ.data && asbabQ.data.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("ui.ayah.noAsbab")}</p>
            )}
          </div>
        );
      })()}
    </article>
  );
}

function ActionBtn({
  children,
  onClick,
  active,
  tone = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  tone?: "default" | "gold";
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors";
  const styles = active
    ? tone === "gold"
      ? "border-gold/40 bg-gold/15 text-foreground"
      : "border-primary/30 bg-primary/10 text-primary"
    : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-primary";
  return (
    <button type="button" onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}
