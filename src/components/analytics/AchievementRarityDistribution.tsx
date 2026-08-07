import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Award, Share2, Sparkles, CheckCircle2, Lock } from "lucide-react";
import { ALL_300_ACHIEVEMENTS } from "@/lib/gamification";

interface AchievementRarityDistributionProps {
  rarityData: {
    rarity: "common" | "rare" | "epic" | "legendary";
    count: number;
    unlockedCount: number;
  }[];
  locale?: "en" | "ar" | "he";
}

const RARITY_COLORS = {
  common: "#71717a",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
};

export const AchievementRarityDistribution: React.FC<AchievementRarityDistributionProps> = ({
  rarityData,
  locale = "en",
}) => {
  const isAr = locale === "ar";

  const handleShare = (title: string) => {
    if (navigator.share) {
      navigator.share({
        title: "Bayan Islamic Learning Achievement",
        text: `I just unlocked "${title}" on Bayan Platform!`,
        url: window.location.href,
      });
    } else {
      alert(`Copied share link for "${title}"!`);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <Award className="w-5 h-5 text-amber-500" />
            {isAr
              ? "استعراض وتوزيع الأوسمة والإنجازات"
              : "Achievement Showcase & Rarity Distribution"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
            {isAr
              ? "تحليل الأوسمة المفتوحة حسب درجة الندرة (Common, Rare, Epic, Legendary)."
              : "Distribution of 300+ achievements by rarity and unlocked milestone progress."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Bar Chart: Rarity Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider dir-auto">
            {isAr ? "توزيع الأوسمة حسب درجة الندرة" : "Unlocked vs Total by Rarity Tier"}
          </h4>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rarityData} layout="vertical">
                <XAxis type="number" stroke="#a1a1aa" fontSize={11} />
                <YAxis dataKey="rarity" type="category" stroke="#a1a1aa" fontSize={11} width={70} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "16px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="unlockedCount" name="Unlocked" fill="#f59e0b">
                  {rarityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RARITY_COLORS[entry.rarity]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recently Unlocked Achievements Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider dir-auto">
            {isAr ? "آخر الأوسمة المكتسبة" : "Recently Unlocked Badges"}
          </h4>

          <div className="space-y-2">
            {ALL_300_ACHIEVEMENTS.slice(0, 3).map((ach) => (
              <div
                key={ach.id}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ach.icon}</span>
                  <div>
                    <div className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                      {isAr ? ach.nameAr : ach.nameEn}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      +{ach.rewardXP} XP • {ach.rarity}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleShare(ach.nameEn)}
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 transition-colors"
                  title="Share Achievement"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
