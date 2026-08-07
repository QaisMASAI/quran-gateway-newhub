import React from "react";
import { Sparkles, Clock, CheckCircle2, Award, Zap, Flame } from "lucide-react";
import {
  awardXpEngine,
  type DailyChallenge,
  type UserGameification,
} from "@/lib/gamification-engine-v2";

interface DailyChallengesWidgetProps {
  data: UserGameification;
  onUpdate: (updated: UserGameification) => void;
  locale?: "en" | "ar" | "he";
}

export const DailyChallengesWidget: React.FC<DailyChallengesWidgetProps> = ({
  data,
  onUpdate,
  locale = "en",
}) => {
  const isAr = locale === "ar";

  const handleClaim = (ch: DailyChallenge) => {
    if (ch.claimed) return;

    ch.claimed = true;
    ch.completed = true;
    ch.claimedAt = new Date().toISOString();

    const updated = awardXpEngine(data, ch.xpReward, "challenge");
    onUpdate({ ...updated });
  };

  const getDifficultyBadge = (diff: DailyChallenge["difficulty"]) => {
    switch (diff) {
      case "easy":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600";
      case "medium":
        return "bg-amber-500/10 border-amber-500/20 text-amber-600";
      case "hard":
        return "bg-rose-500/10 border-rose-500/20 text-rose-600 font-bold";
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {isAr ? "التحديات اليومية المتجددة" : "Daily Rotating Challenges"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
            {isAr
              ? "إكمال التحديات يمنحك نقاط التحدي (Challenge XP) والجواهر."
              : "Earn Challenge XP and gems by completing daily tasks before expiry."}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-400">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Resets in 14h 22m</span>
        </div>
      </div>

      {/* 3 Challenge Cards: Easy, Medium, Hard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.dailyChallenges.map((ch) => (
          <div
            key={ch.id}
            className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 transition-all ${
              ch.claimed
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 shadow-sm"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getDifficultyBadge(
                    ch.difficulty,
                  )}`}
                >
                  {ch.difficulty} ({ch.durationMinutes} min)
                </span>

                <span className="text-xs font-mono font-black text-amber-600">
                  +{ch.xpReward} XP
                </span>
              </div>

              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 dir-auto">
                {ch.title}
              </h4>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto leading-relaxed">
                {ch.description}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex justify-between text-[10px] font-bold text-zinc-400 font-mono">
                <span>Progress</span>
                <span>{ch.progress}%</span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${ch.progress}%` }}
                />
              </div>

              {ch.claimed ? (
                <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Claimed</span>
                </div>
              ) : (
                <button
                  onClick={() => handleClaim(ch)}
                  className="w-full py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-sm"
                >
                  Claim +{ch.xpReward} XP
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
