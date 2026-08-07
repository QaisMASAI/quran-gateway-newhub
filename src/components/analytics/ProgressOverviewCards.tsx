import React from "react";
import { Clock, BookOpen, CheckCircle2, Award, Flame, Shield, TrendingUp, Zap } from "lucide-react";
import { AnalyticsSummary } from "@/lib/learning-analytics";

interface ProgressOverviewCardsProps {
  summary: AnalyticsSummary;
  locale?: "en" | "ar" | "he";
}

export const ProgressOverviewCards: React.FC<ProgressOverviewCardsProps> = ({
  summary,
  locale = "en",
}) => {
  const isAr = locale === "ar";

  const cards = [
    {
      title: isAr ? "إجمالي وقت التعلم" : "Total Learning Time",
      value: `${summary.totalLearningHours} hrs`,
      sub: isAr ? "180 دقيقة هذا الأسبوع" : `${summary.userWeeklyMin} min this week`,
      icon: Clock,
      color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: isAr ? "الآيات والرموز المقروءة" : "Total Verses Read",
      value: summary.totalVersesRead.toLocaleString(),
      sub: isAr ? "تتبع الورد اليومي" : "1,420 verses in 30 days",
      icon: BookOpen,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: isAr ? "الاختبارات المكتملة" : "Quizzes Completed",
      value: summary.totalQuizzesCompleted.toString(),
      sub: isAr ? "متوسط دقة 84%" : "84% avg accuracy",
      icon: CheckCircle2,
      color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: isAr ? "نسبة إتقان الموضوعات" : "Topics Mastered",
      value: `${summary.topicsMasteredPct}%`,
      sub: isAr ? "4 من أصل 6 عوالم" : "4 of 6 Worlds Mastered",
      icon: Award,
      color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: isAr ? "المستوى ونقاط الخبرة" : "Level & XP",
      value: `Level ${summary.currentLevel}`,
      sub: `${summary.xpInLevel} / 1,000 XP to Lvl ${summary.currentLevel + 1}`,
      icon: Zap,
      color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: isAr ? "سلسلة الأيام المتتالية" : "Streak Status",
      value: `${summary.currentStreakDays} Days`,
      sub: isAr ? "سلسلة الحماية مفعلة" : "Streak Freeze Active (2)",
      icon: Flame,
      color: "text-rose-600 bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-3 flex flex-col justify-between hover:scale-[1.01] transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 dir-auto">
                {card.title}
              </span>
              <div className={`p-2 rounded-2xl border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
                {card.value}
              </div>
              <div className="text-[11px] font-bold text-zinc-400 mt-0.5 dir-auto">{card.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
