import React from "react";
import { Flame, Shield, RotateCcw, Gem, Award, CheckCircle2 } from "lucide-react";
import { restoreStreak, type UserGameification } from "@/lib/gamification-engine-v2";

interface StreakWidgetProps {
  data: UserGameification;
  onUpdate: (updated: UserGameification) => void;
  locale?: "en" | "ar" | "he";
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({ data, onUpdate, locale = "en" }) => {
  const isAr = locale === "ar";

  const handleRestore = () => {
    const res = restoreStreak(data);
    if (res.success) {
      onUpdate({ ...data });
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Streak Main Indicator */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-2xl shadow-md ring-4 ring-amber-500/20">
            <Flame className="w-8 h-8 fill-white text-white animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 dir-auto">
                {data.streaks.current} {isAr ? "يوم متتالي" : "Days Streak"}
              </h3>
              <span className="text-xs text-zinc-400 font-bold font-mono">
                (Record: {data.streaks.longest}d)
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
              {isAr
                ? "حافظ على ورود القراءة اليومي لحماية السلسلة."
                : "Complete 1 daily challenge or reading goal to maintain your streak."}
            </p>
          </div>
        </div>

        {/* Gems & Freeze Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-extrabold text-xs">
            <Gem className="w-4 h-4 fill-cyan-500" />
            <span>{data.gems} Gems</span>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-extrabold text-xs">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>{data.streaks.streakFreezeCount} Freezes</span>
          </div>
        </div>
      </div>

      {/* Streak Restoration Action if broken */}
      {data.streaks.current === 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">
              {isAr ? "انقطعت السلسلة اليومية!" : "Streak Lost Recently"}
            </h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              {isAr
                ? "يمكنك استعادة السلسلة السابقة مقابل 100 جوهرة."
                : "Restore your longest record using 100 gems."}
            </p>
          </div>

          <button
            onClick={handleRestore}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-sm shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? "استعادة (100 جوهرة)" : "Restore (100 Gems)"}</span>
          </button>
        </div>
      )}

      {/* Streak Milestones */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider dir-auto">
          {isAr ? "محطات إنجاز السلسلة" : "Streak Milestones"}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.streaks.milestones.map((ms) => {
            const reached = data.streaks.current >= ms.days;
            return (
              <div
                key={ms.days}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  reached
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                    : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{ms.badge}</span>
                  <div>
                    <div className="text-xs font-black">{ms.days} Days</div>
                    <div className="text-[10px] font-mono font-bold">+{ms.bonusXp} XP</div>
                  </div>
                </div>
                {reached && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
