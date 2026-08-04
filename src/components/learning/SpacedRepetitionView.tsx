import React from "react";
import { RotateCcw, Sparkles, CheckCircle2, Clock, Calendar, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserStats, SpacedRepetitionItem } from "@/lib/gamification";
import { QUESTION_DATABASE } from "@/lib/gamification-questions";

interface SpacedRepetitionViewProps {
  stats: UserStats;
  locale: "en" | "ar" | "he";
  onStartRevision: (questionId: string) => void;
}

export const SpacedRepetitionView: React.FC<SpacedRepetitionViewProps> = ({
  stats,
  locale,
  onStartRevision,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];

  const queue = stats.spacedRepetitionQueue || [];
  const dueItems = queue.filter((item) => item.nextReviewDate <= todayStr);
  const scheduledItems = queue.filter((item) => item.nextReviewDate > todayStr);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4">
      {/* Overview Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-emerald-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
              <Brain className="w-6 h-6 text-amber-300" />
            </span>
            <h2 className="text-xl font-bold dir-auto">
              {locale === "ar"
                ? "محرك المراجعة الذكية (SuperMemo SM-2)"
                : locale === "he"
                  ? "מנוע חזרה במרווחים (SM-2)"
                  : "Spaced Repetition Revision Engine"}
            </h2>
          </div>
          <p className="text-xs text-emerald-100 max-w-xl dir-auto">
            {locale === "ar"
              ? "يحلل النظام منحنى النسيان البشري لبرمجة الأسئلة في الموعد الأمثل قبل زوالها من الذاكرة طويلة المدى."
              : locale === "he"
                ? "המערכת מנתחת את עקומת השכחה של הזיכרון ומזמנת שאלות בזמן המדויק לחיזוק הזיכרון."
                : "Algorithmically schedules questions based on memory strength decay to guarantee lifelong retention."}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
          <div className="text-center">
            <span className="text-2xl font-black text-amber-300">{dueItems.length}</span>
            <span className="text-xs block text-emerald-100 font-medium">
              {locale === "ar" ? "مستحقة اليوم" : locale === "he" ? "להיום" : "Due Today"}
            </span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <span className="text-2xl font-black">{queue.length}</span>
            <span className="text-xs block text-emerald-100 font-medium">
              {locale === "ar" ? "إجمالي بالذاكرة" : locale === "he" ? "בזיכרון" : "In Queue"}
            </span>
          </div>
        </div>
      </div>

      {/* Due Questions Queue */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
          <Clock className="w-5 h-5 text-emerald-500" />
          <span>
            {locale === "ar"
              ? "الأسئلة المستحقة للمراجعة الآن"
              : locale === "he"
                ? "שאלות הזקוקות לחזרה כעת"
                : "Items Requiring Active Memory Recall"}
          </span>
        </h3>

        {dueItems.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300 dir-auto">
              {locale === "ar"
                ? "ممتاز! ذاكرتك في أوج القوة وليس لديك مراجعات مستحقة اليوم."
                : locale === "he"
                  ? "מעולה! הזיכרון שלך בשיא ואין שאלות לחזרה היום."
                  : "Great job! All memory items are freshly consolidated."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dueItems.map((item) => {
              const q = QUESTION_DATABASE.find((qItem) => qItem.id === item.questionId);
              if (!q) return null;
              const qTitle = locale === "ar" ? q.titleAr : locale === "he" ? q.titleHe : q.titleEn;

              return (
                <div
                  key={item.questionId}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {q.category.toUpperCase()} • Interval: {item.intervalDays}d
                    </span>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 dir-auto">
                      {qTitle}
                    </h4>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block dir-auto">
                      {q.citation}
                    </span>
                  </div>
                  <Button
                    onClick={() => onStartRevision(q.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    {locale === "ar" ? "راجِع الآن" : locale === "he" ? "חזור עכשיו" : "Review"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
