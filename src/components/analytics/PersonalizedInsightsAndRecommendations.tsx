import React from "react";
import { Sparkles, ArrowRight, Clock, Users, RotateCcw, Compass } from "lucide-react";
import { AnalyticsSummary } from "@/lib/learning-analytics";

interface PersonalizedInsightsAndRecommendationsProps {
  summary: AnalyticsSummary;
  locale?: "en" | "ar" | "he";
}

export const PersonalizedInsightsAndRecommendations: React.FC<
  PersonalizedInsightsAndRecommendationsProps
> = ({ summary, locale = "en" }) => {
  const isAr = locale === "ar";

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {isAr ? "التوصيات الذكية والموجهة" : "Personalized Learning Insights"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
            {isAr
              ? "خطوات عملية قابلة للتنفيذ لتسريع الحفظ والإتقان."
              : "Actionable recommendations crafted based on your weekly accuracy and learning speed."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summary.recommendations.map((rec) => {
          let recIcon = Compass;
          let recColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";

          if (rec.type === "time_to_mastery") {
            recIcon = Clock;
            recColor = "bg-blue-500/10 text-blue-600 border-blue-500/20";
          } else if (rec.type === "friends_catch") {
            recIcon = Users;
            recColor = "bg-purple-500/10 text-purple-600 border-purple-500/20";
          } else if (rec.type === "retry_weak") {
            recIcon = RotateCcw;
            recColor = "bg-rose-500/10 text-rose-600 border-rose-500/20";
          }

          const Icon = recIcon;

          return (
            <div
              key={rec.title}
              className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div
                  className={`w-10 h-10 rounded-2xl border ${recColor} flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 dir-auto">
                  {rec.title}
                </h4>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed dir-auto">
                  {rec.description}
                </p>
              </div>

              <button className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <span>{rec.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
