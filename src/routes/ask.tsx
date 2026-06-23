import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, Send, BookOpen, Shield, ChevronLeft, MessageCircleQuestion, Compass } from "lucide-react";
import { buildQuranIndex, cleanText } from "@/lib/quran-api";
import { semanticSearch } from "@/lib/quran-search";
import { surahNameHe } from "@/lib/surah-names-he";
import { askQuran, expandQuery } from "@/lib/quran-ai.functions";
import { getAyahLinks } from "@/lib/ayah-links";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Noor Al Quran| Ask Noor Al QuranAI" },
      {
        name: "description",
        content:
          "Ask questions in Hebrew, Arabic or English and get answers built only on verses from the Holy Quran, with precise references.",
      },
      { property: "og:title", content: "Noor Al Quran| Ask Noor Al QuranAI" },
      { property: "og:description", content: "Verse-grounded answers — no fabrications." },
    ],
  }),
  component: AskPage,
});

function AskPage() {
  const { t, i18n } = useTranslation("pages");
  const locale = ((i18n.language?.split("-")[0] as "he" | "ar" | "en") || "he");
  const examples = t("ask.examples", { returnObjects: true }) as string[];

  const { data: index, isLoading: indexLoading } = useQuery({
    queryKey: ["quran-index"],
    queryFn: buildQuranIndex,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  const ask = useServerFn(askQuran);
  const expand = useServerFn(expandQuery);
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [verses, setVerses] = useState<
    { surah: number; ayah: number; surahNameHe: string; arabic: string; hebrew: string }[]
  >([]);
  const [answer, setAnswer] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<{ hebrew: string[]; arabic: string[] } | null>(null);
  const [entities, setEntities] = useState<
    { slug: string; kind: string; title_he: string; title_ar: string; title_en: string; summary_he: string; summary_ar: string; summary_en: string }[]
  >([]);

  const followUps = useMemo(() => {
    if (verses.length === 0) return [] as { key: string; label: string; question: string }[];
    const seen = new Set<string>();
    const out: { key: string; label: string; question: string }[] = [];
    const norm = (s: string) => s.replace(/[?!.\s]+/g, "").toLowerCase();
    const askedNorm = norm(submitted);
    for (const v of verses) {
      for (const l of getAyahLinks(v.surah, v.ayah)) {
        const key = `${l.kind}:${l.slug}`;
        if (seen.has(key)) continue;
        const q = t("ask.askAbout", { topic: l.title });
        if (norm(q).includes(askedNorm) || askedNorm.includes(norm(l.title))) continue;
        seen.add(key);
        out.push({ key, label: l.title, question: q });
        if (out.length >= 4) return out;
      }
    }
    return out;
  }, [verses, submitted, t]);

  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleAsk = async (q: string) => {
    const query = q.trim();
    if (!query || !index) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const myRequestId = ++requestIdRef.current;
    const isStale = () => myRequestId !== requestIdRef.current || controller.signal.aborted;

    setQuestion(query);
    setSubmitted(query);
    setVerses([]);
    setAnswer("");
    setError("");
    setExpanded(null);
    setEntities([]);
    setLoading(true);

    let expandedTerms: { hebrew: string[]; arabic: string[] } = { hebrew: [], arabic: [] };
    try {
      expandedTerms = await expand({ data: { question: query } });
    } catch {
      /* non-fatal */
    }
    if (isStale()) return;
    setExpanded(expandedTerms);

    const enrichedQuery = [query, ...expandedTerms.hebrew, ...expandedTerms.arabic].join(" ");
    const { hits } = semanticSearch(index, enrichedQuery, { maxResults: 60 });
    if (isStale()) return;

    const topHits = hits.slice(0, 6).map((h) => ({
      surah: h.verse.surah,
      ayah: h.verse.ayah,
      surahNameHe: surahNameHe(h.verse.surah) || h.chapter.name_he || h.chapter.name_simple,
      arabic: h.verse.arabic,
      hebrew: cleanText(h.verse.hebrew),
    }));

    setVerses(topHits);

    try {
      const res = await ask({ data: { question: query, verses: topHits, lang: locale } });
      if (isStale()) return;
      if (res.entities) setEntities(res.entities);
      if (res.error) setError(res.error);
      else {
        setAnswer(res.text ?? "");
        if (res.verses && res.verses.length > 0) {
          setVerses(
            res.verses.map((v) => ({
              surah: v.surah,
              ayah: v.ayah,
              surahNameHe: v.surahNameHe,
              arabic: v.arabic,
              hebrew: v.hebrew,
            })),
          );
        }
      }
    } catch (err) {
      if (isStale()) return;
      if ((err as { name?: string })?.name === "AbortError") return;
      setError(t("ask.networkError"));
    } finally {
      if (!isStale()) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section
        className="arabesque-bg relative overflow-hidden px-4 pt-10 pb-12 sm:px-6"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="relative mx-auto max-w-3xl text-center text-white">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            <span>{t("ask.badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{t("ask.title")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-white/85">{t("ask.subtitle")}</p>
        </div>
      </section>

      <main id="main" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{t("ask.trust")}</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(question);
          }}
          className="surface-card flex items-center gap-2 p-2"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t("ask.placeholder")}
            disabled={indexLoading || loading}
            className="flex-1 bg-transparent px-3 py-2.5 text-[15px] outline-none placeholder:text-muted-foreground/70"
            dir="auto"
          />
          <button
            type="submit"
            disabled={!question.trim() || indexLoading || loading}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>{t("ask.send")}</span>
          </button>
        </form>

        {!submitted && (
          <div className="mt-5">
            <div className="mb-2 text-xs font-medium text-muted-foreground">{t("ask.examplesLabel")}</div>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => handleAsk(ex)}
                  disabled={indexLoading}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {indexLoading && (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("ask.loadingIndex")}</span>
          </div>
        )}

        {submitted && !loading && (answer || error) && (
          <div className="mt-6 surface-card p-5">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" /> {t("ask.answerLabel")}
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <div className="prose prose-sm max-w-none text-[15px] text-foreground/90 [&>p]:my-2">
                <ReactMarkdown
                  skipHtml
                  disallowedElements={[
                    "script",
                    "iframe",
                    "img",
                    "video",
                    "audio",
                    "object",
                    "embed",
                    "form",
                    "input",
                    "style",
                    "link",
                  ]}
                  unwrapDisallowed
                >
                  {answer}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {!loading && entities.length > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-3.5">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <Compass className="h-3 w-3" />
              {t("ask.relatedTopicsLabel")}
            </div>
            <div className="flex flex-wrap gap-2">
              {entities.map((e) => {
                const title = locale === "ar" ? e.title_ar : locale === "en" ? e.title_en : e.title_he;
                const summary = locale === "ar" ? e.summary_ar : locale === "en" ? e.summary_en : e.summary_he;
                return (
                  <Link
                    key={e.slug}
                    to="/learn/$kind/$slug"
                    params={{ kind: e.kind, slug: e.slug }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-background px-3 py-1 text-xs text-foreground hover:border-primary/60 hover:text-primary"
                    title={summary}
                  >
                    <span className="text-primary/70">#</span>
                    <span>{title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-6 surface-card flex items-center gap-2 p-5 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("ask.searching")}</span>
          </div>
        )}

        {!loading && expanded && (expanded.hebrew.length > 0 || expanded.arabic.length > 0) && (
          <div className="mt-6 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" />
              {t("ask.expansionLabel")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {expanded.hebrew.map((t2) => (
                <span
                  key={`he-${t2}`}
                  className="rounded-full bg-background px-2.5 py-0.5 text-[11px] text-foreground/80 border border-border"
                >
                  {t2}
                </span>
              ))}
              {expanded.arabic.map((t2) => (
                <span
                  key={`ar-${t2}`}
                  dir="rtl"
                  className="font-arabic rounded-full bg-background px-2.5 py-0.5 text-[12px] text-foreground/80 border border-border"
                >
                  {t2}
                </span>
              ))}
            </div>
          </div>
        )}

        {verses.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              {t("ask.versesFound", { n: verses.length })}
            </h2>
            <div className="space-y-3">
              {verses.map((v) => (
                <Link
                  key={`${v.surah}-${v.ayah}`}
                  to="/surah/$id"
                  params={{ id: String(v.surah) }}
                  hash={`v-${v.ayah}`}
                  className="surface-card group block px-4 py-3.5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-primary">
                      {v.surahNameHe} {v.surah}:{v.ayah}
                    </span>
                    <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary ltr:rotate-180" />
                  </div>
                  <p className="font-arabic mt-1.5 text-right text-lg leading-loose text-foreground" dir="rtl">
                    {v.arabic}
                  </p>
                  <p className="mt-1.5 text-[13.5px] text-foreground/80">{v.hebrew}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && followUps.length > 0 && (
          <div className="mt-6 rounded-xl border border-primary/15 bg-primary/5 p-4">
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <MessageCircleQuestion className="h-3.5 w-3.5" />
              {t("ask.followUpsLabel")}
            </div>
            <div className="flex flex-wrap gap-2">
              {followUps.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => handleAsk(f.question)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground/85 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {f.question}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
