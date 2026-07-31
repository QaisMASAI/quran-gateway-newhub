import ReactMarkdown from "react-markdown";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BadgeCheck, BookOpen, Brain, Library, MessageCircleQuestion, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  answer: string;
  locale: "he" | "ar" | "en";
  versesCount: number;
  tafsirCount: number;
  hadithCount: number;
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
  suggestedQuestions = [],
  onSuggestedQuestion,
}: Props) {
  const copy = COPY[locale];
  const summary = quickSummary(answer);

  return (
    <section className="surface-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
        <Brain className="h-4 w-4" />
        {copy.heading}
      </div>

      <Accordion type="multiple" defaultValue={["summary", "deep", "evidence"]}>
        <AccordionItem value="summary">
          <AccordionTrigger>{copy.summary}</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm leading-relaxed text-foreground/90">{summary}</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="deep">
          <AccordionTrigger>{copy.deep}</AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm max-w-none text-foreground/90">
              <ReactMarkdown skipHtml>{answer}</ReactMarkdown>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="evidence">
          <AccordionTrigger>{copy.evidence}</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
                <div className="mb-1 inline-flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" /> {copy.references}
                </div>
                <div className="font-semibold text-foreground">Quran: {versesCount}</div>
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground">
                Tafsir: {tafsirCount}
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground">
                Hadith: {hadithCount}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="context">
          <AccordionTrigger>{copy.context}</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="reflection">
          <AccordionTrigger>{copy.reflection}</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cross">
          <AccordionTrigger>{copy.cross}</AccordionTrigger>
          <AccordionContent>
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5" />
              {copy.references}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {suggestedQuestions.length > 0 && onSuggestedQuestion && (
        <div className="mt-4 border-t border-border pt-4">
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
                className="h-auto whitespace-normal text-start"
                onClick={() => onSuggestedQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <Library className="h-3.5 w-3.5" />
        <ScrollText className="h-3.5 w-3.5" />
        <span>Source text and AI explanation are displayed separately.</span>
      </div>
    </section>
  );
}
