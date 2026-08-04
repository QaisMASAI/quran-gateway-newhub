import React from "react";
import { HelpCircle, ChevronDown, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SearchResearchBrief } from "@/lib/search-brief.functions";

interface PerplexityRelatedQuestionsProps {
  brief: SearchResearchBrief;
  onSelectTopic?: (topic: string) => void;
}

export const PerplexityRelatedQuestions: React.FC<PerplexityRelatedQuestionsProps> = ({
  brief,
  onSelectTopic,
}) => {
  const isAr = brief.locale === "ar";
  const isHe = brief.locale === "he";

  const faqs = brief.faqs || [];

  return (
    <section id="related-questions" className="space-y-4 scroll-mt-24">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <HelpCircle className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold text-white dir-auto">
              {isAr ? "الأسئلة والاستفسارات ذات الصلة" : isHe ? "שאלות ותשובות קשורות" : "Related Follow-up Questions"}
            </h3>
            <p className="text-xs text-zinc-400 dir-auto">
              {isAr
                ? "إجابات فورية موثقة بالنصوص مع إمكانية تحويل أي سؤال إلى بحث مستقل"
                : isHe
                  ? "תשובות מיידיות מגובות במקורות עם אפשרות להפיכת כל שאלה למחקר נפרד"
                  : "Interactive grounded answers with citation chips & one-click AI inquiry"}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-bold text-xs">
          {faqs.length} {isAr ? "أسئلة شائعة" : isHe ? "שאלות" : "Questions"}
        </Badge>
      </div>

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-2 sm:p-4 shadow-xl">
        <Accordion type="single" collapsible defaultValue="faq-0" className="space-y-2">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="border border-zinc-800/80 rounded-xl px-4 py-1 bg-zinc-950/60 transition-all hover:border-indigo-500/40"
            >
              <AccordionTrigger className="text-sm font-extrabold text-zinc-100 hover:text-indigo-300 hover:no-underline py-3 dir-auto">
                <div className="flex items-center gap-2.5 text-left">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                    Q{idx + 1}
                  </span>
                  <span>{faq.question}</span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="text-xs text-zinc-300 space-y-3 pt-2 pb-4 border-t border-zinc-800/60 dir-auto">
                <p className="leading-relaxed">{faq.answer}</p>

                {/* Citations */}
                {faq.citations && faq.citations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <span className="text-[10px] text-zinc-400 font-bold">
                      {isAr ? "الشواهد:" : isHe ? "מקורות:" : "Citations:"}
                    </span>
                    {faq.citations.map((cit, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2 py-0.5 rounded-lg bg-zinc-800 text-emerald-400 font-bold text-[10px] flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>{cit}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* One Click Deep Dive */}
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => onSelectTopic?.(faq.question)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-xl py-1 px-3 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAr ? "ابحث في هذا السؤال بشكل مستقل" : isHe ? "חקור שאלה זו ב-AI" : "Launch Deep Research on This Question"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
