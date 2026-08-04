import React from "react";
import { Sparkles, BookOpen, ExternalLink, X, Award, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuestionItem } from "@/lib/gamification-questions";

interface AiExplanationModalProps {
  question: QuestionItem;
  locale: "en" | "ar" | "he";
  isOpen: boolean;
  onClose: () => void;
}

export const AiExplanationModal: React.FC<AiExplanationModalProps> = ({
  question,
  locale,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const explanation =
    locale === "ar"
      ? question.aiExplanationAr
      : locale === "he"
        ? question.aiExplanationHe
        : question.aiExplanationEn;

  const title =
    locale === "ar" ? question.titleAr : locale === "he" ? question.titleHe : question.titleEn;

  const prompt =
    locale === "ar" ? question.promptAr : locale === "he" ? question.promptHe : question.promptEn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        id="ai-explanation-modal"
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {locale === "ar"
                  ? "التفسير الذكي والشرح الموثق"
                  : locale === "he"
                    ? "הסבר AI ומקורות מאומתים"
                    : "Noor AI Certified Explanation"}
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                {locale === "ar"
                  ? "تحليل الفوائد وتأصيل المصادر"
                  : locale === "he"
                    ? "ניתוח עמוק ומקורות מוסמכים"
                    : "Authentic sources & deep contextual wisdom"}
              </p>
            </div>
          </div>
          <button
            id="close-ai-modal"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed">
          {/* Question Summary */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
              <BookOpen className="w-4 h-4" />
              <span>{title}</span>
            </div>
            <p className="font-medium dir-auto">{prompt}</p>
          </div>

          {/* AI Detailed Wisdom */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>
                {locale === "ar"
                  ? "الشرح والتفصيل الشرعي:"
                  : locale === "he"
                    ? "הסבר מפורט:"
                    : "Scholarly Explanation & Insight:"}
              </span>
            </div>
            <p className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-base dir-auto leading-relaxed">
              {explanation}
            </p>
          </div>

          {/* Authentic Citation Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span className="text-xs font-bold uppercase block tracking-wider opacity-80">
                  {locale === "ar"
                    ? "المصدر الموثق"
                    : locale === "he"
                      ? "מקור מאומת"
                      : "Verified Source"}
                </span>
                <span className="font-semibold text-sm dir-auto">{question.citation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <Button
            id="got-it-ai-modal"
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 rounded-xl"
          >
            {locale === "ar" ? "فهمت ذلك" : locale === "he" ? "הבנתי" : "Got it"}
          </Button>
        </div>
      </div>
    </div>
  );
};
