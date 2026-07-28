import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, Send, BookOpen, ShieldCheck, ChevronLeft } from "lucide-react";
import { askQuranResearch, type ResearchResult } from "@/lib/ai-research.functions";
import { surahDisplayName } from "@/lib/surah-names-he";
import { Header } from "@/components/Header";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { getNextMcpRetryDelay } from "@/lib/mcp-outage";
import { localeTextDir, tafsirFontClass, uiFontClass } from "@/lib/locale-ui";

export const Route = createLazyFileRoute("/research")({
  component: ResearchPage,
});

function ResearchPage() {
  const { t, i18n } = useTranslation("pages");
  const lang = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const uiClass = uiFontClass(lang);
  const tafsirClass = tafsirFontClass(lang);
  const textDir = localeTextDir(lang);
  const [q, setQ] = useState("");
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
  const ask = useServerFn(askQuranResearch);
  const mutation = useMutation<ResearchResult, Error, string>({
    mutationFn: (question) =>
      ask({
        data: {
          question,
          language: lang,
          history: historyPayload,
        },
      }),
    onSuccess: (res, question) => {
      if (!res.mcpUnavailable) {
        setRetryAttempt(0);
        setRetryEta(null);
      }
      if (res.answer) {
        setChatTurns((prev) => [...prev.slice(-5), { question, answer: res.answer }]);
      }
    },
  });

  const result = mutation.data;
  const examples =
    lang === "he"
      ? ["מהם עיקרי האמונה בקוראן?", "מה אומר הקוראן על צדקה?", "מי היה הנביא יוסף לפי הקוראן?"]
      : lang === "ar"
        ? [
            "ما هي أركان الإيمان في القرآن؟",
            "ماذا يقول القرآن عن الصدقة؟",
            "من هو يوسف عليه السلام؟",
          ]
        : [
            "What are the pillars of faith in the Quran?",
            "What does the Quran say about charity?",
            "Who was Prophet Joseph according to the Quran?",
          ];

  return (
    <div className={`min-h-screen bg-background ${uiClass}`}>
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link
          to="/"
          className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> {t("research.back", "Back")}
        </Link>

        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("research.title", "AI Research Assistant")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t(
                "research.subtitle",
                "Grounded in local Quran and authenticated tafsir with full citations.",
              )}
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim().length > 1) {
              mutation.mutate(q.trim());
            }
          }}
          className="mt-6 flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("research.placeholder", "Ask a question about the Quran…")}
            aria-label={t("research.placeholder", "Ask a question about the Quran…")}
            className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={mutation.isPending || q.trim().length < 2}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {t("research.ask", "Ask")}
          </button>
        </form>

        {!result && !mutation.isPending && (
          <div className="mt-6 flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                type="button"
                key={ex}
                onClick={() => {
                  setQ(ex);
                  mutation.mutate(ex);
                }}
                className="rounded-full bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-accent"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {result?.error && (
          <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm">
            {t("research.error", "Could not generate an answer.")}: {result.error}
          </div>
        )}

        {result && !result.error && (
          <div className="mt-8 space-y-6">
            {result.mcpUnavailable && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">
                  {t(
                    "research.mcpUnavailable",
                    "Quran.ai verification service is currently unavailable. Please retry for fully verified grounding.",
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const nextQ = q.trim() || chatTurns.at(-1)?.question;
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
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {t("research.answer", "Answer")}
                </h2>
                <ConfidenceBadge confidence={result.confidence} />
              </div>
              <div
                className={`ai-explanation-block prose prose-sm max-w-none dark:prose-invert ${tafsirClass}`}
                dir={textDir}
              >
                <ReactMarkdown skipHtml>{result.answer}</ReactMarkdown>
              </div>
            </div>

            {result.verses.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {t("research.verseCitations", "Verse Citations")} ({result.verses.length})
                </h3>
                <div className="grid gap-3">
                  {result.verses.map((v) => (
                    <Link
                      key={`${v.surah}-${v.ayah}`}
                      to="/surah/$id"
                      params={{ id: String(v.surah) }}
                      search={{ q: undefined }}
                      hash={`v-${v.ayah}`}
                      className="block rounded-xl border border-border bg-card p-4 transition hover:border-primary"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {surahDisplayName(v.surah, lang)} · {v.surah}:{v.ayah}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(v.similarity * 100)}% match
                        </span>
                      </div>
                      <p className="font-arabic text-right text-lg leading-loose" dir="rtl">
                        {v.arabic}
                      </p>
                      <p
                        className="mt-2 text-sm text-muted-foreground"
                        dir={lang === "en" ? "ltr" : "rtl"}
                      >
                        {v.hebrew}
                      </p>
                      {(v.translation_source || v.translator) && (
                        <div className="mt-2 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground">
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

            {result.tafsir.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  {t("research.tafsirCitations", "Tafsir Citations")} ({result.tafsir.length})
                </h3>
                <div className="space-y-3">
                  {result.tafsir.map((tf, i) => (
                    <div
                      key={`${tf.source}-${tf.surah}-${tf.ayah}-${i}`}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <div className="mb-1 text-xs font-medium text-primary">
                        {tf.kind === "asbab" ? "Asbab al-Nuzul" : tf.source} · {tf.surah}:{tf.ayah}
                        {tf.translator ? ` · ${tf.translator}` : ""}
                      </div>
                      <p
                        className={`ai-explanation-block text-sm text-foreground/90 ${tafsirClass}`}
                        dir={textDir}
                      >
                        {tf.text}
                      </p>
                      <div className="mt-2 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground">
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

            {result.hadith && result.hadith.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  {t("research.hadithCitations", "Hadith Citations")} ({result.hadith.length})
                </h3>
                <div className="space-y-3">
                  {result.hadith.map((h, i) => (
                    <Link
                      key={`${h.collection}-${h.global_id}-${i}`}
                      to="/hadith/$collection/entry/$num"
                      params={{ collection: h.collection, num: String(h.global_id) }}
                      className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40"
                    >
                      <div className="mb-1 text-xs font-medium text-primary">
                        {h.collection_label} · #{h.id_in_book}
                      </div>
                      {h.narrator && (
                        <div className="text-[11px] italic text-muted-foreground">{h.narrator}</div>
                      )}
                      {h.english && <p className="mt-1 text-sm text-foreground/90">{h.english}</p>}
                      <p
                        className="font-arabic mt-2 text-right text-sm text-foreground"
                        dir="rtl"
                        lang="ar"
                      >
                        {h.arabic}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const tone =
    confidence >= 0.6
      ? "bg-primary-soft text-primary"
      : confidence >= 0.35
        ? "bg-gold-soft text-foreground"
        : "bg-secondary text-muted-foreground";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      {pct}% confidence
    </span>
  );
}
