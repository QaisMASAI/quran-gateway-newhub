import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, Send, BookOpen, ShieldCheck, ChevronLeft } from "lucide-react";
import { surahDisplayName } from "@/lib/surah-names-he";
import { askQuranResearch, type ResearchResult } from "@/lib/ai-research.functions";
import { Header } from "@/components/Header";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { getNextMcpRetryDelay } from "@/lib/mcp-outage";
import { localeTextDir, readingFontClass, tafsirFontClass, uiFontClass } from "@/lib/locale-ui";

export const Route = createLazyFileRoute("/ask")({
  component: AskPage,
});

function AskPage() {
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const examples = t("ask.examples", { returnObjects: true }) as string[];
  const uiClass = uiFontClass(locale);
  const tafsirClass = tafsirFontClass(locale);
  const readingClass = readingFontClass(locale);
  const textDir = localeTextDir(locale);

  const ask = useServerFn(askQuranResearch);
  const [question, setQuestion] = useState("");
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [retryEta, setRetryEta] = useState<number | null>(null);
  const [chatTurns, setChatTurns] = useState<Array<{ question: string; answer: string }>>([]);
  const historyPayload = useMemo(
    () =>
      chatTurns.flatMap((turn) => [
        { role: "user" as const, content: turn.question },
        { role: "assistant" as const, content: turn.answer },
      ]),
    [chatTurns],
  );

  const mutation = useMutation<ResearchResult, Error, string>({
    mutationFn: (q) =>
      ask({
        data: {
          question: q,
          language: locale,
          history: historyPayload,
        },
      }),
    onSuccess: (res, q) => {
      if (!res.mcpUnavailable) {
        setRetryAttempt(0);
        setRetryEta(null);
      }
      if (res.answer) {
        setChatTurns((prev) => [...prev.slice(-5), { question: q, answer: res.answer }]);
      }
    },
  });

  const result = mutation.data;
  const loading = mutation.isPending;

  return (
    <div className={`min-h-screen bg-background ${uiClass}`}>
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
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{t("research.subtitle", "Grounded in local Quran/Tafsir database with citations.")}</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (question.trim().length > 1) mutation.mutate(question.trim());
          }}
          className="surface-card flex items-center gap-2 p-2"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t("ask.placeholder")}
            aria-label={t("ask.placeholder")}
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-2.5 text-[15px] outline-none placeholder:text-muted-foreground/70"
            dir="auto"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>{t("ask.send")}</span>
          </button>
        </form>

        {!result && !loading && (
          <div className="mt-5">
            <div className="mb-2 text-xs font-medium text-muted-foreground">{t("ask.examplesLabel")}</div>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setQuestion(ex);
                    mutation.mutate(ex);
                  }}
                  disabled={loading}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
        {result && !loading && (result.answer || result.error) && (
          <div className="mt-6 surface-card p-5">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" /> {t("ask.answerLabel")}
            </div>
            {result.error ? (
              <p className="text-sm text-destructive">{result.error}</p>
            ) : (
              <div className={`ai-explanation-block prose prose-sm max-w-none text-[15px] text-foreground/90 [&>p]:my-2 ${tafsirClass}`} dir={textDir}>
                <ReactMarkdown skipHtml>{result.answer}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {result?.mcpUnavailable && !loading && (
          <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {t("research.mcpUnavailable", "Quran.ai verification service is currently unavailable. Please retry for fully verified grounding.")}
            </p>
            <button
              type="button"
              onClick={() => {
                const nextQ = question.trim() || chatTurns.at(-1)?.question;
                if (!nextQ) return;
                const nextAttempt = retryAttempt + 1;
                const delayMs = getNextMcpRetryDelay(nextAttempt);
                setRetryAttempt(nextAttempt);
                setRetryEta(Date.now() + delayMs);
                window.setTimeout(() => {
                  mutation.mutate(nextQ);
                }, delayMs);
              }}
              className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-destructive/30 bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              {t("research.retryMcp", "Retry verification")}
            </button>
            {retryEta && (
              <p className="mt-2 text-xs text-destructive/80">
                {t("research.retryingIn", {
                  defaultValue: "Retry scheduled in {{seconds}}s.",
                  seconds: Math.max(1, Math.ceil((retryEta - Date.now()) / 1000)),
                })}
              </p>
            )}
          </div>
        )}

        {loading && (
          <div className="mt-6 surface-card flex items-center gap-2 p-5 text-sm text-muted-foreground" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("ask.searching")}</span>
          </div>
        )}

        {result && result.verses.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              {t("ask.versesFound", { n: result.verses.length })}
            </h2>
            <div className="space-y-3">
              {result.verses.map((v) => (
                <Link
                  key={`${v.surah}-${v.ayah}`}
                  to="/surah/$id"
                  params={{ id: String(v.surah) }}
                  hash={`v-${v.ayah}`}
                  className="surface-card group block px-4 py-3.5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-primary">
                      {surahDisplayName(v.surah, locale)} {v.surah}:{v.ayah}
                    </span>
                    <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary ltr:rotate-180" />
                  </div>
                  <p className="font-quran mt-1.5 text-right text-lg leading-loose text-foreground" dir="rtl">
                    {v.arabic}
                  </p>
                  <p className={`mt-1.5 text-[13.5px] text-foreground/80 ${readingClass}`} dir={textDir}>
                    {v.hebrew}
                  </p>
                  {(v.translation_source || v.translator) && (
                    <div className="mt-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] text-muted-foreground">
                      <p>
                        {t("research.translationSource", { source: v.translation_source || t("research.localQuranDb") })}
                      </p>
                      <p>
                        {t("research.translator", {
                          translator: v.translator || t("research.localAuthenticatedSource"),
                        })}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {result && result.tafsir.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">{t("research.tafsirCitations", "Tafsir citations")}</h3>
            <div className="space-y-2">
              {result.tafsir.map((tf, i) => (
                <div key={`${tf.source}-${tf.surah}-${tf.ayah}-${i}`} className="rounded-lg border border-border bg-background px-3 py-2">
                  <div className="text-xs text-primary">
                    {tf.kind === "asbab" ? "Asbab al-Nuzul" : tf.source} · {tf.surah}:{tf.ayah}
                    {tf.translator ? ` · ${tf.translator}` : ""}
                  </div>
                  <p className={`ai-explanation-block mt-1 text-xs text-muted-foreground ${tafsirClass}`} dir={textDir}>{tf.text}</p>
                  <div className="mt-2 rounded-md border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground">
                      {t("research.tafsirSource", { source: tf.source })}
                      {tf.translator ? ` · ${t("research.translator", { translator: tf.translator })}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && result.hadith && result.hadith.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              {t("research.hadithCitations", "Hadith citations")}
            </h3>
            <div className="space-y-2">
              {result.hadith.map((h, i) => (
                <a
                  key={`${h.collection}-${h.global_id}-${i}`}
                  href={`/hadith/${h.collection}/entry/${h.global_id}`}
                  className="block rounded-lg border border-border bg-background px-3 py-2 hover:border-primary/40"
                >
                  <div className="text-xs text-primary">
                    {h.collection_label} · #{h.id_in_book}
                  </div>
                  {h.narrator && <div className="text-[11px] italic text-muted-foreground">{h.narrator}</div>}
                  {h.english && <p className="font-reading-en mt-1 text-xs text-muted-foreground">{h.english}</p>}
                  <p className="font-reading-ar mt-1 text-right text-xs text-foreground" dir="rtl" lang="ar">
                    {h.arabic}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}