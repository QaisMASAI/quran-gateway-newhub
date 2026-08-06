import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, Send, BookOpen, ShieldCheck, ChevronLeft } from "lucide-react";
import { surahDisplayName } from "@/lib/surah-names-he";
import { askQuranResearch, type ResearchResult } from "@/lib/ai-research.functions";
import { Header } from "@/components/Header";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { getNextMcpRetryDelay } from "@/lib/mcp-outage";
import { localeTextDir, tafsirFontClass, uiFontClass } from "@/lib/locale-ui";
import { useQueryPrefillInput } from "@/hooks/useQueryPrefillInput";
import { trackHomePromptEvent } from "@/lib/home-prompts.functions";
import { StructuredAnswer } from "@/components/ai/StructuredAnswer";
import { DiscoveryRail } from "@/components/discovery/DiscoveryRail";
import { useRecentlyViewed } from "@/lib/recently-viewed";

export const Route = createLazyFileRoute("/ask")({
  component: AskPage,
});

function AskPage() {
  const { q, qState, src } = Route.useSearch();
  const navigate = useNavigate({ from: "/ask" });
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const examples = t("ask.examples", { returnObjects: true }) as string[];
  const uiClass = uiFontClass(locale);
  const tafsirClass = tafsirFontClass(locale);
  const textDir = localeTextDir(locale);

  const ask = useServerFn(askQuranResearch);
  const { input: question, setInput: setQuestion, trimmed } = useQueryPrefillInput({ initialQ: q });
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [retryEta, setRetryEta] = useState<number | null>(null);
  const [chatTurns, setChatTurns] = useState<Array<{ question: string; answer: string }>>([]);
  const trackPrompt = useServerFn(trackHomePromptEvent);
  const { items: recentViews } = useRecentlyViewed();
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

  useEffect(() => {
    if (src !== "hero_input" && src !== "popular_questions") return;
    if (qState !== "ok" || !q) return;
    void trackPrompt({
      data: {
        event: "prefill_applied",
        destination: "/ask",
        source: src,
        q,
        qState,
      },
    });
  }, [q, qState, src, trackPrompt]);

  const prefillMessage =
    qState === "missing"
      ? locale === "ar"
        ? "اكتب سؤالك لبدء الإجابة الموثقة."
        : locale === "he"
          ? "כתוב שאלה כדי לקבל תשובה עם מקורות."
          : "Type your question to get a source-grounded answer."
      : qState === "empty"
        ? locale === "ar"
          ? "قيمة السؤال فارغة — اكتب سؤالًا للمتابعة."
          : locale === "he"
            ? "ערך השאלה ריק — כתוב שאלה כדי להמשיך."
            : "The question value is empty — enter a question to continue."
        : qState === "invalid"
          ? locale === "ar"
            ? "قيمة ?q غير صالحة وتم تنظيفها. راجعها ثم أرسل."
            : locale === "he"
              ? "הערך ?q לא תקין ונוקה. אפשר לערוך ואז לשלוח."
              : "The ?q value was invalid and has been sanitized. You can edit and submit."
          : null;

  function submitQuestion() {
    if (trimmed.length < 2) return;
    void navigate({
      to: "/ask",
      search: {
        q: trimmed,
        qState: "ok",
        src,
      },
      replace: true,
    });
    mutation.mutate(trimmed);
  }

  function submitSuggestedQuestion(nextQuestion: string) {
    setQuestion(nextQuestion);
    void navigate({
      to: "/ask",
      search: {
        q: nextQuestion,
        qState: "ok",
        src,
      },
      replace: true,
    });
    mutation.mutate(nextQuestion);
  }

  const suggestedQuestions = useMemo(() => {
    const verseSuggestion =
      result?.verses
        .slice(0, 2)
        .map((v) =>
          locale === "ar"
            ? `ما تفسير ${v.surah}:${v.ayah}؟`
            : locale === "he"
              ? `מה ההקשר של ${v.surah}:${v.ayah}?`
              : `What is the context of ${v.surah}:${v.ayah}?`,
        ) ?? [];
    const base =
      locale === "ar"
        ? ["ما الروابط بين هذه الآيات؟", "ما الدروس العملية اليوم؟"]
        : locale === "he"
          ? ["מה הקשרים בין הפסוקים האלה?", "מה היישום המעשי לימינו?"]
          : ["What links these verses together?", "How does this apply today?"];
    return [...base, ...verseSuggestion];
  }, [result?.verses, locale]);

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
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-white/85">
            {t("ask.subtitle")}
          </p>
        </div>
      </section>

      <main id="main" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>
            {t("research.subtitle", "Grounded in local Quran/Tafsir database with citations.")}
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitQuestion();
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
        {prefillMessage ? (
          <p className="mt-3 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            {prefillMessage}
          </p>
        ) : null}

        {!result && !loading && (
          <div className="mt-5">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              {t("ask.examplesLabel")}
            </div>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setQuestion(ex);
                    void navigate({
                      to: "/ask",
                      search: { q: ex, qState: "ok", src: "unknown" },
                      replace: true,
                    });
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
        {result &&
          !loading &&
          (result.answer || result.error) &&
          (result.error ? (
            <div className="mt-6 surface-card p-5">
              <p className="text-sm text-destructive">{result.error}</p>
            </div>
          ) : (
            <div className="mt-6">
              <StructuredAnswer
                answer={result.answer}
                locale={locale}
                versesCount={result.verses.length}
                tafsirCount={result.tafsir.length}
                hadithCount={result.hadith.length}
                suggestedQuestions={suggestedQuestions}
                onSuggestedQuestion={submitSuggestedQuestion}
              />
            </div>
          ))}

        {result?.mcpUnavailable && !loading && (
          <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {t(
                "research.mcpUnavailable",
                "Quran.ai verification service is currently unavailable. Please retry for fully verified grounding.",
              )}
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
          <div
            className="mt-6 surface-card flex items-center gap-2 p-5 text-sm text-muted-foreground"
            aria-live="polite"
          >
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
                  search={{ q: "" }}
                  hash={`v-${v.ayah}`}
                  className="surface-card group block px-4 py-3.5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-primary">
                      {surahDisplayName(v.surah, locale)} {v.surah}:{v.ayah}
                    </span>
                    <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary ltr:rotate-180" />
                  </div>
                  <p
                    className="font-quran mt-1.5 text-right text-lg leading-loose text-foreground"
                    dir="rtl"
                  >
                    {v.arabic}
                  </p>
                  <p
                    className={`mt-1.5 text-[13.5px] text-foreground/80 ${locale === "en" ? "font-reading-en" : "font-reading-he"}`}
                    dir={textDir}
                  >
                    {v.hebrew}
                  </p>
                  {(v.translation_source || v.translator) && (
                    <div className="mt-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] text-muted-foreground">
                      <p>
                        {t("research.translationSource", {
                          source: v.translation_source || t("research.localQuranDb"),
                        })}
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
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              {t("research.tafsirCitations", "Tafsir citations")}
            </h3>
            <div className="space-y-2">
              {result.tafsir.map((tf, i) => (
                <div
                  key={`${tf.source}-${tf.surah}-${tf.ayah}-${i}`}
                  className="rounded-lg border border-border bg-background px-3 py-2"
                >
                  <div className="text-xs text-primary">
                    {tf.kind === "asbab" ? "Asbab al-Nuzul" : tf.source} · {tf.surah}:{tf.ayah}
                    {tf.translator ? ` · ${tf.translator}` : ""}
                  </div>
                  <p
                    className={`ai-explanation-block mt-1 text-xs text-muted-foreground ${tafsirClass}`}
                    dir={textDir}
                  >
                    {tf.text}
                  </p>
                  <div className="mt-2 rounded-md border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground">
                    {t("research.tafsirSource", { source: tf.source })}
                    {tf.translator
                      ? ` · ${t("research.translator", { translator: tf.translator })}`
                      : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result &&
          (result.verses.length > 0 || recentViews.length > 0) && (
            <DiscoveryRail
              locale={locale}
              relatedVerses={result.verses.slice(0, 6).map((v) => ({
                surah: v.surah,
                ayah: v.ayah,
                label: `${surahDisplayName(v.surah, locale)} ${v.surah}:${v.ayah}`,
              }))}
              recentViews={recentViews}
              suggestedQuestions={suggestedQuestions}
              onSuggestedQuestion={submitSuggestedQuestion}
            />
          )}
      </main>
    </div>
  );
}
