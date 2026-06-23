import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, Send, BookOpen, ShieldCheck, ChevronLeft } from "lucide-react";
import { surahNameHe } from "@/lib/surah-names-he";
import { askQuranResearch, type ResearchResult } from "@/lib/ai-research.functions";
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
  const locale = (i18n.language?.startsWith("he") ? "he" : i18n.language?.startsWith("ar") ? "ar" : "en") as
    | "he"
    | "en"
    | "ar";
  const examples = t("ask.examples", { returnObjects: true }) as string[];

  const ask = useServerFn(askQuranResearch);
  const [question, setQuestion] = useState("");
  const mutation = useMutation<ResearchResult, Error, string>({
    mutationFn: (q) => ask({ data: { question: q, language: locale } }),
  });

  const result = mutation.data;
  const loading = mutation.isPending;

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
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-2.5 text-[15px] outline-none placeholder:text-muted-foreground/70"
            dir="auto"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
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
              <div className="prose prose-sm max-w-none text-[15px] text-foreground/90 [&>p]:my-2">
                <ReactMarkdown>{result.answer}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="mt-6 surface-card flex items-center gap-2 p-5 text-sm text-muted-foreground">
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
                      {v.surahNameHe} {v.surah}:{v.ayah}
                    </span>
                    <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary ltr:rotate-180" />
                  </div>
                  <p className="font-arabic mt-1.5 text-right text-lg leading-loose text-foreground" dir="rtl">
                    {v.arabic}
                  </p>
                  <p className="mt-1.5 text-[13.5px] text-foreground/80">{v.hebrew}</p>
                  {(v.translation_source || v.translator) && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
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

        {result && result.tafsir.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">{t("research.tafsirCitations", "Tafsir citations")}</h3>
            <div className="space-y-2">
              {result.tafsir.map((tf, i) => (
                <div key={`${tf.source}-${tf.surah}-${tf.ayah}-${i}`} className="rounded-lg border border-border bg-background px-3 py-2">
                  <div className="text-xs text-primary">
                    {tf.source} · {tf.surah}:{tf.ayah}
                    {tf.translator ? ` · ${tf.translator}` : ""}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{tf.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
