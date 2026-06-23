import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, Send, BookOpen, ShieldCheck, ChevronLeft } from "lucide-react";
import { askQuranResearch, type ResearchResult } from "@/lib/ai-research.functions";
import { surahNameHe } from "@/lib/surah-names-he";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Discover Quran" },
      {
        name: "description",
        content:
          "Ask deep questions about the Quran. Every answer is grounded in verses and authenticated Tafsir, with citations and a confidence score.",
      },
      { property: "og:title", content: "Quran AI Research Assistant" },
      {
        property: "og:description",
        content: "Source-grounded answers with verse + Tafsir citations.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const { t, i18n } = useTranslation("pages");
  const lang = (i18n.language?.startsWith("he") ? "he" : i18n.language?.startsWith("ar") ? "ar" : "en") as
    | "he"
    | "en"
    | "ar";
  const [q, setQ] = useState("");
  const ask = useServerFn(askQuranResearch);
  const mutation = useMutation<ResearchResult, Error, string>({
    mutationFn: (question) => ask({ data: { question, language: lang } }),
  });

  const result = mutation.data;
  const examples =
    lang === "he"
      ? [
          "מהם עיקרי האמונה בקוראן?",
          "מה אומר הקוראן על צדקה?",
          "מי היה הנביא יוסף לפי הקוראן?",
        ]
      : lang === "ar"
        ? ["ما هي أركان الإيمان في القرآن؟", "ماذا يقول القرآن عن الصدقة؟", "من هو يوسف عليه السلام؟"]
        : [
            "What are the pillars of faith in the Quran?",
            "What does the Quran say about charity?",
            "Who was Prophet Joseph according to the Quran?",
          ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> {t("research.back", "Back")}
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("research.title", "AI Research Assistant")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t(
                "research.subtitle",
                "Grounded in the Quran and authenticated Tafsir — with full citations.",
              )}
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim().length > 1) mutation.mutate(q.trim());
          }}
          className="mt-6 flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("research.placeholder", "Ask a question about the Quran…")}
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={mutation.isPending || q.trim().length < 2}
            className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {t("research.ask", "Ask")}
          </button>
        </form>

        {!result && !mutation.isPending && (
          <div className="mt-6 flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setQ(ex);
                  mutation.mutate(ex);
                }}
                className="text-sm px-3 py-1.5 rounded-full bg-muted hover:bg-accent text-foreground"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {result?.error && (
          <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm">
            {t("research.error", "Could not generate an answer.")}: {result.error}
          </div>
        )}

        {result && !result.error && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  {t("research.answer", "Answer")}
                </h2>
                <ConfidenceBadge confidence={result.confidence} />
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result.answer}</ReactMarkdown>
              </div>
            </div>

            {result.verses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {t("research.verseCitations", "Verse Citations")} ({result.verses.length})
                </h3>
                <div className="grid gap-3">
                  {result.verses.map((v) => (
                    <Link
                      key={`${v.surah}-${v.ayah}`}
                      to="/surah/$id"
                      params={{ id: String(v.surah) }}
                      hash={`a-${v.ayah}`}
                      className="block rounded-xl border border-border bg-card p-4 hover:border-primary transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {surahNameHe(v.surah)} · {v.surah}:{v.ayah}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(v.similarity * 100)}% match
                        </span>
                      </div>
                      <p className="text-right font-arabic text-lg leading-loose" dir="rtl">
                        {v.arabic}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2" dir="rtl">
                        {v.hebrew}
                      </p>
                      {(v.translation_source || v.translator) && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {v.translation_source ? `Translation: ${v.translation_source}` : ""}
                          {v.translation_source && v.translator ? " · " : ""}
                          {v.translator ? `Translator: ${v.translator}` : ""}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {result.tafsir.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {t("research.tafsirCitations", "Tafsir Citations")} ({result.tafsir.length})
                </h3>
                <div className="space-y-3">
                  {result.tafsir.map((tf, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-4">
                      <div className="text-xs font-medium text-primary mb-1">
                        {tf.source} · {tf.surah}:{tf.ayah}
                        {tf.translator ? ` · ${tf.translator}` : ""}
                      </div>
                      <p className="text-sm text-foreground/90">{tf.text}</p>
                    </div>
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
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : confidence >= 0.35
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
        : "bg-rose-500/15 text-rose-700 dark:text-rose-300";
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tone}`}>
      {pct}% confidence
    </span>
  );
}
