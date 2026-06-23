import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Pause, Sparkles, BookText, Star, Loader2, NotebookPen, User, Tag, HeartHandshake } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { ayahAudioUrl, cleanText, normalizeHebrew, RECITERS, reciterName, getStoredReciter, setStoredReciter, type ReciterKey } from "@/lib/quran-api";
import { useFavorites } from "@/lib/favorites";
import { useServerFn } from "@tanstack/react-start";
import { explainAyah } from "@/lib/quran-ai.functions";
import { TAFSIR_SOURCES_META, tafsirSourceName } from "@/lib/tafsir-sources";
import { ShareButtons } from "./ShareButtons";
import { NotePanel } from "./NotePanel";
import { getAyahLinks } from "@/lib/ayah-links";
import { useReadingSettings, stripArabicDiacritics } from "@/lib/reading-settings";

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
  const locale = ((i18n.language?.split("-")[0] as "he" | "ar" | "en") || "he");


  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [reciter, setReciter] = useState<ReciterKey>(() => getStoredReciter());
  const [showReciter, setShowReciter] = useState(false);

  const [panel, setPanel] = useState<null | "tafsir" | "sabab">(null);
  const [showNote, setShowNote] = useState(false);
  const [tafsirSource, setTafsirSource] = useState<typeof TAFSIR_SOURCES_META[number]["key"]>("ibn-kathir");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  // Cache results per (mode + source). Sabab uses key "sabab".
  const [cache, setCache] = useState<Record<string, { text?: string; source?: { name_he: string; name_ar: string; name_en?: string }; error?: string }>>({});

  const ask = useServerFn(explainAyah);

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

  const pickReciter = (k: ReciterKey) => {
    setStoredReciter(k);
    setReciter(k);
    setShowReciter(false);
  };

  const cacheKey = (mode: "tafsir" | "sabab", src?: string) =>
    mode === "sabab" ? "sabab" : `tafsir:${src ?? "ibn-kathir"}`;

  const loadContent = async (mode: "tafsir" | "sabab", src?: typeof TAFSIR_SOURCES_META[number]["key"]) => {
    const k = cacheKey(mode, src);
    if (cache[k]) return;
    setLoadingKey(k);
    try {
      const res = await ask({
        data: { surah, ayah, arabic, surahName, mode, lang: locale, ...(mode === "tafsir" && src ? { source: src } : {}) },
      });
      setCache((c) => ({
        ...c,
        [k]: res.error
          ? { error: res.error }
          : { text: res.text, source: (res as { source?: { name_he: string; name_ar: string; name_en?: string } }).source },
      }));
    } catch {
      setCache((c) => ({ ...c, [k]: { error: t("ui.ayah.networkError") } }));
    } finally {
      setLoadingKey((curr) => (curr === k ? null : curr));
    }
  };

  const openPanel = async (mode: "tafsir" | "sabab") => {
    if (panel === mode) {
      setPanel(null);
      return;
    }
    setPanel(mode);
    await loadContent(mode, mode === "tafsir" ? tafsirSource : undefined);
  };

  const selectTafsirSource = async (src: typeof TAFSIR_SOURCES_META[number]["key"]) => {
    setTafsirSource(src);
    await loadContent("tafsir", src);
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

      {/* Translation in the active UI language */}
      <div className="mt-4 border-t border-border pt-4">
        {(() => {
          const isHe = locale === "he";
          const translationClass = isHe
            ? "hebrew-text text-[15px] text-foreground/85"
            : "text-[15px] leading-relaxed text-foreground/85 text-start";
          const translationDir = isHe ? "rtl" : "ltr";
          return heHighlight ? (
            <p className={translationClass} dir={translationDir}>{heHighlight}</p>
          ) : (
            <p className={translationClass} dir={translationDir}>{cleanText(hebrew)}</p>
          );
        })()}
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ActionBtn onClick={togglePlay} active={playing}>
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span>{playing ? t("ui.ayah.pause") : t("ui.ayah.play")}</span>
        </ActionBtn>

        <div className="relative">
          <ActionBtn onClick={() => setShowReciter((v) => !v)} active={showReciter}>
            <span className="text-[10px] opacity-70">{t("ui.ayah.reciter")}</span>
            <span>{(() => { const r = RECITERS.find((x) => x.key === reciter); return r ? reciterName(r, locale) : ""; })()}</span>
          </ActionBtn>
          {showReciter && (
            <div className="absolute end-0 z-20 mt-1 w-56 rounded-xl border border-border bg-background shadow-lg">
              {RECITERS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => pickReciter(r.key)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-[12.5px] hover:bg-secondary/60 ${
                    r.key === reciter ? "text-primary font-semibold" : "text-foreground/85"
                  }`}
                >
                  <span dir="rtl" lang="ar" className="font-arabic text-[11px] text-muted-foreground">{r.name_ar}</span>
                  <span>{reciterName(r, locale)}</span>
                </button>
              ))}
            </div>
          )}
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
            const to =
              l.kind === "prophet"
                ? "/prophets/$slug"
                : l.kind === "emotion"
                  ? "/emotions/$slug"
                  : "/topics/$slug";
            const styles =
              l.kind === "prophet"
                ? "border-gold/30 bg-gold/10 text-foreground/80 hover:border-gold hover:text-primary"
                : l.kind === "emotion"
                  ? "border-primary/15 bg-secondary/50 text-foreground/80 hover:border-primary/40 hover:text-primary"
                  : "border-primary/20 bg-primary/5 text-primary/90 hover:border-primary/50 hover:text-primary";
            const Icon =
              l.kind === "prophet" ? User : l.kind === "emotion" ? HeartHandshake : Tag;
            return (
              <Link
                key={`${l.kind}-${l.slug}`}
                to={to}
                params={{ slug: l.slug }}
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



      {/* AI panel */}
      {panel && (() => {
        const activeKey = panel === "tafsir" ? cacheKey("tafsir", tafsirSource) : "sabab";
        const entry = cache[activeKey];
        const isLoading = loadingKey === activeKey;
        return (
          <div className="mt-4 rounded-xl border border-border bg-secondary/40 px-4 py-3.5">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              {panel === "tafsir" ? <Sparkles className="h-3 w-3" /> : <BookText className="h-3 w-3" />}
              {panel === "tafsir" ? t("ui.ayah.tafsirCompare") : t("ui.ayah.sababTitle")}
            </div>

            {panel === "tafsir" && (
              <div className="mb-3 flex flex-wrap gap-1.5 border-b border-border/60 pb-2.5">
                {TAFSIR_SOURCES_META.map((s) => {
                  const active = tafsirSource === s.key;
                  const k = cacheKey("tafsir", s.key);
                  const hasError = cache[k]?.error;
                  return (
                    <button
                      key={s.key}
                      onClick={() => selectTafsirSource(s.key)}
                      title={s.name_ar}
                      className={`rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors ${
                        active
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : hasError
                            ? "border-border bg-background text-muted-foreground/60 line-through"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-primary"
                      }`}
                    >
                      {tafsirSourceName(s, locale)}
                    </button>
                  );
                })}
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
            {!isLoading && entry?.error && (
              <p className="text-sm text-destructive">{entry.error}</p>
            )}
            {!isLoading && !entry?.error && entry?.text && (
              <>
                <div className="hebrew-text prose prose-sm max-w-none text-[14.5px] text-foreground/90 [&>p]:my-1.5 [&>h1]:text-base [&>h2]:text-base [&>h3]:text-sm [&>ul]:my-1 [&>ol]:my-1">
                  <ReactMarkdown skipHtml>{entry.text}</ReactMarkdown>
                </div>
                {entry.source && (
                  <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-2 text-[11px] text-muted-foreground">
                    <BookText className="h-3 w-3" />
                    <span>
                      {t("ui.ayah.source")}{" "}
                      <strong className="text-foreground/80">{tafsirSourceName(entry.source, locale)}</strong>
                      {" · "}
                      <span dir="rtl" className="font-arabic">{entry.source.name_ar}</span>
                    </span>
                  </div>
                )}
              </>
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
    <button onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}
