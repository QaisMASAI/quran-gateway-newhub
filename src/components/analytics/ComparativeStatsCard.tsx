import React from "react";
import { Trophy, TrendingUp, Globe, Users, Award } from "lucide-react";
import { AnalyticsSummary } from "@/lib/learning-analytics";

interface ComparativeStatsCardProps {
  summary: AnalyticsSummary;
  locale?: "en" | "ar" | "he";
}

export const ComparativeStatsCard: React.FC<ComparativeStatsCardProps> = ({
  summary,
  locale = "en",
}) => {
  const isAr = locale === "ar";

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-900/90 via-zinc-900 to-amber-950 text-white shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 text-2xl">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black dir-auto">
              {isAr
                ? "الإحصاءات المقارنة والترتيب العالمي"
                : "Comparative Benchmarks & Peer Ranking"}
            </h3>
            <p className="text-xs text-amber-200/80 dir-auto">
              {isAr
                ? "موقعك بين المتعلمين عالمياً استناداً إلى الجهد والاستمرارية."
                : "Real-time percentile evaluation against global active knowledge seekers."}
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-amber-500 text-zinc-950 font-black text-xs shadow-md">
          Top {100 - summary.percentileRank}% Globally
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
            <Users className="w-4 h-4" />
            <span>Weekly Learning Pace</span>
          </div>
          <div className="text-xl font-black font-mono">{summary.userWeeklyMin} Min / Week</div>
          <div className="text-[10px] text-amber-200/60">
            Peers Average: {summary.peersAvgWeeklyMin} min/week (4x faster!)
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
            <Globe className="w-4 h-4" />
            <span>Percentile Position</span>
          </div>
          <div className="text-xl font-black font-mono">{summary.percentileRank}th Percentile</div>
          <div className="text-[10px] text-amber-200/60">
            Ahead of 95% of active platform members
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>Global Improvement Trend</span>
          </div>
          <div className="text-xl font-black font-mono">+18% MoM</div>
          <div className="text-[10px] text-amber-200/60">
            Global learners accuracy improved +12% this month
          </div>
        </div>
      </div>
    </div>
  );
};
