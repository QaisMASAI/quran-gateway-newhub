import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  BadgeCheck,
  BookOpen,
  Brain,
  Library,
  MessageCircleQuestion,
  ScrollText,
  Share2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareCardModal } from "@/components/ShareCardModal";

type Props = {
  answer: string;
  locale: "he" | "ar" | "en";
  versesCount: number;
  tafsirCount: number;
  hadithCount: number;
  confidence?: number;
  suggestedQuestions?: string[];
  onSuggestedQuestion?: (question: string) => void;
};

function stripMarkdown(input: string) {
  return input
    .replace(/[`*_>#\\[\\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function quickSummary(answer: string) {
  const plain = stripMarkdown(answer);
  if (plain.length <= 220) return plain;
  const clipped = plain.slice(0, 220);
  const lastDot = Math.max(clipped.lastIndexOf("."), clipped.lastIndexOf("؟"), clipped.lastIndexOf("!"));
  return (lastDot > 80 ? clipped.slice(0, lastDot + 1) : clipped).trim();
}

const COPY = {
  en: {
    heading: "AI explanation",
    summary: "Quick summary",
    deep: "Deep explanation",
    evidence: "Evidence",
    references: "Quran / Tafsir / Hadith references",
    context: "Historical context",
    reflection: "Modern reflection",
    cross: "Cross references",
    followups: "Suggested next questions",
  },
  he: {
    heading: "הסבר AI",
    summary: "סיכום מהיר",
    deep: "הסבר מעמיק",
    evidence: "ראיות",
    references: "הפניות קוראן / תפסיר / חדית׳",
    context: "הקשר היסטורי",
    reflection: "השתקפות מודרנית",
    cross: "הצלבות",
    followups: "שאלות המשך מוצעות",
  },
  ar: {
    heading: "شرح الذكاء الاصطناعي",
    summary: "ملخص سريع",
    deep: "شرح معمّق",
    evidence: "الأدلّة",
    references: "مراجع القرآن / التفسير / الحديث",
    context: "السياق التاريخي",
    reflection: "انعكاس معاصر",
    cross: "إحالات متقاطعة",
    followups: "أسئلة متابعة مقترحة",
  },
} as const;

export function StructuredAnswer({
  answer,
  locale,
  versesCount,
  tafsirCount,
  hadithCount,
  confidence = 0.96,
  suggestedQuestions = [],
  onSuggestedQuestion,
}: Props) {
  const copy = COPY[locale];
  const summary = quickSummary(answer);
  const [shareOpen, setShareOpen] = useState(false);
  const confidencePercent = Math.round(confidence * 100);

  return (
    <section className="rounded-3xl border border-border/80 bg-card/90 p-5 md:p-6 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5 text-base font-bold text-primary">
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-2">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3>{copy.heading}</h3>
            <span className="text-xs text-muted-foreground font-normal">Noor Al-Huda Multi-Agent Verification</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Grounded Confidence Badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{confidencePercent}% Grounded</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShareOpen(true)}
            className="rounded-full gap-1.5 text-xs border-border/80 hover:bg-secondary"
          >
            <Share2 className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Share Card</span>
          </Button>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["summary", "deep", "evidence"]}>
        <AccordionItem value="summary" className="border-border/60">
          <AccordionTrigger className="text-sm font-bold text-foreground hover:no-underline">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <span>{copy.summary}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm leading-relaxed text-foreground/90 bg-secondary/40 p-3.5 rounded-2xl border border-border/50">
              {summary}
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="deep" className="border-border/60">
          <AccordionTrigger className="text-sm font-bold text-foreground hover:no-underline">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-primary" />
              <span>{copy.deep}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
              <ReactMarkdown skipHtml>{answer}</ReactMarkdown>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="evidence" className="border-border/60">
          <AccordionTrigger className="text-sm font-bold text-foreground hover:no-underline">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{copy.evidence}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-xs">
                <div className="mb-1.5 flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" /> Quran Verses
                  </span>
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] text-white">{versesCount}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Direct Quranic evidence with Arabic text & translations
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs">
                <div className="mb-1.5 flex items-center justify-between text-amber-900 dark:text-amber-300 font-bold">
                  <span className="flex items-center gap-1">
                    <Library className="h-4 w-4" /> Authentic Hadiths
                  </span>
                  <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] text-white">{hadithCount}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">Sahih Bukhari, Muslim & authenticated Sunnah</div>
              </div>

              <div className="rounded-2xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 p-3 text-xs">
                <div className="mb-1.5 flex items-center justify-between text-sky-900 dark:text-sky-300 font-bold">
                  <span className="flex items-center gap-1">
                    <ScrollText className="h-4 w-4" /> Tafsir & Scholars
                  </span>
                  <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] text-white">{tafsirCount}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Tafsir Ibn Kathir, Asbab Nuzul & Scholarly Consensus
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {suggestedQuestions.length > 0 && onSuggestedQuestion && (
        <div className="mt-4 border-t border-border/60 pt-4">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <MessageCircleQuestion className="h-3.5 w-3.5" />
            {copy.followups}
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 6).map((question) => (
              <Button
                key={question}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto whitespace-normal text-start text-xs rounded-xl border-border/70 hover:bg-secondary hover:text-primary py-2 px-3"
                onClick={() => onSuggestedQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      <ShareCardModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share Grounded Answer"
        translationText={summary}
        reference="AI Research Grounded Summary"
        type="topic"
      />
    </section>
  );
}
