import React from "react";
import { Award, Zap, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import {
  calculateLevelFromXp,
  executePrestigeReset,
  type UserGameification,
} from "@/lib/gamification-engine-v2";

interface XpTrackerProps {
  data: UserGameification;
  onUpdate: (updated: UserGameification) => void;
  locale?: "en" | "ar" | "he";
}

export const XpTracker: React.FC<XpTrackerProps> = ({ data, onUpdate, locale = "en" }) => {
  const isAr = locale === "ar";
  const levelInfo = calculateLevelFromXp(data.totalXp);

  const handlePrestige = () => {
    const res = executePrestigeReset(data);
    if (res.success) {
      onUpdate({ ...data });
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
      {/* Top Banner: Level & XP Progress */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 text-white font-black flex flex-col items-center justify-center shadow-lg ring-4 ring-amber-500/20">
              <span className="text-[10px] uppercase tracking-wider opacity-80">
                {isAr ? "مستوى" : "LVL"}
              </span>
              <span className="text-2xl leading-none">{levelInfo.level}</span>
            </div>
            {data.prestige > 0 && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black shadow-md border border-purple-400">
                P{data.prestige}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 dir-auto">
                {isAr ? `المستوى ${levelInfo.level}` : `Level ${levelInfo.level}`}
              </h2>
              {data.prestige > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-[11px] font-bold">
                  {1 + data.prestige * 0.1}x XP Multiplier
                </span>
              )}
            </div>

            {/* XP Bar */}
            <div className="flex items-center gap-3">
              <div className="w-48 h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                {levelInfo.xpInLevel} / 1,000 XP
              </span>
            </div>
          </div>
        </div>

        {/* Right Action: Prestige or XP Stats */}
        <div className="flex items-center gap-3">
          {levelInfo.canPrestige ? (
            <button
              onClick={handlePrestige}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg animate-bounce"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? "إعادة الضبط ورتبة التميز (Prestige)" : "Prestige Reset"}</span>
            </button>
          ) : (
            <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-extrabold flex items-center gap-2">
              <Zap className="w-4 h-4 fill-amber-500" />
              <span>{data.totalXp.toLocaleString()} Total XP</span>
            </div>
          )}
        </div>
      </div>

      {/* Meaningful XP Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        {[
          {
            label: "Knowledge",
            labelAr: "المعرفة",
            xp: data.xpBreakdown.knowledge,
            icon: "📖",
            color: "text-emerald-600 bg-emerald-500/10",
          },
          {
            label: "Mastery",
            labelAr: "الإتقان",
            xp: data.xpBreakdown.mastery,
            icon: "🎯",
            color: "text-blue-600 bg-blue-500/10",
          },
          {
            label: "Consistency",
            labelAr: "الاستمرارية",
            xp: data.xpBreakdown.consistency,
            icon: "🔥",
            color: "text-amber-600 bg-amber-500/10",
          },
          {
            label: "Challenge",
            labelAr: "التحديات",
            xp: data.xpBreakdown.challenge,
            icon: "⚔️",
            color: "text-indigo-600 bg-indigo-500/10",
          },
          {
            label: "Social",
            labelAr: "التفاعل",
            xp: data.xpBreakdown.social,
            icon: "🤝",
            color: "text-rose-600 bg-rose-500/10",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
              <span>{isAr ? item.labelAr : item.label}</span>
              <span>{item.icon}</span>
            </div>
            <div className="text-sm font-black text-zinc-900 dark:text-zinc-100 font-mono">
              +{item.xp.toLocaleString()} XP
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
