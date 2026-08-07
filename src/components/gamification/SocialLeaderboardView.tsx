import React, { useState } from "react";
import { Users, Trophy, Heart, Sparkles, MessageCircle } from "lucide-react";
import {
  getLeaderboardData,
  awardXpEngine,
  type LeaderboardEntry,
  type UserGameification,
} from "@/lib/gamification-engine-v2";

interface SocialLeaderboardViewProps {
  data: UserGameification;
  onUpdate: (updated: UserGameification) => void;
  locale?: "en" | "ar" | "he";
}

export const SocialLeaderboardView: React.FC<SocialLeaderboardViewProps> = ({
  data,
  onUpdate,
  locale = "en",
}) => {
  const isAr = locale === "ar";
  const [tab, setTab] = useState<"global" | "weekly" | "topic">("global");

  const leaderboardEntries = getLeaderboardData(tab, data.userId);

  const handleSendPraise = (entry: LeaderboardEntry) => {
    entry.praiseCount += 1;
    data.engagementStats.praiseSentCount += 1;

    // Award +25 Social XP for encouraging peer learning
    const updated = awardXpEngine(data, 25, "social");
    onUpdate({ ...updated });
    alert(`Sent Barakah Du'a to ${entry.displayName}! Awarded +25 Social XP!`);
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <Trophy className="w-5 h-5 text-amber-500" />
            {isAr ? "لوحة الشرف وحلقات التعلم" : "Leaderboard & Study Circles"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
            {isAr
              ? "تشجيع وتبادل الدعاء والبركة دون منافسة مذمومة."
              : "Encouraging collective growth and sending barakah praise without ostentation."}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          {(["global", "weekly", "topic"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                tab === t
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-3">
        {leaderboardEntries.map((entry) => {
          const isCurrentUser = entry.userId === data.userId;
          return (
            <div
              key={entry.userId}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                isCurrentUser
                  ? "bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-500/20"
                  : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="w-8 text-center font-mono font-black text-sm text-amber-600">
                  #{entry.rank}
                </span>

                <img
                  src={entry.avatarUrl}
                  alt={entry.displayName}
                  className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white"
                />

                <div>
                  <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>{entry.displayName}</span>
                    {entry.prestige > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 text-[10px] font-mono font-black">
                        P{entry.prestige}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                    Level {entry.level} • {entry.topTopic}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <div className="text-xs font-black text-amber-600">
                    {tab === "weekly" ? entry.weeklyXp : entry.totalXp.toLocaleString()} XP
                  </div>
                  <div className="text-[10px] text-zinc-400 font-bold">
                    {entry.praiseCount} Barakah Du'as
                  </div>
                </div>

                {!isCurrentUser && (
                  <button
                    onClick={() => handleSendPraise(entry)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-600 text-xs font-bold transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Send Du'a</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
