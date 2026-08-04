import React from "react";
import { Trophy, Shield, Flame, Star, Award, Crown } from "lucide-react";
import type { UserStats } from "@/lib/gamification";

interface LeaderboardViewProps {
  userStats: UserStats;
  locale: "en" | "ar" | "he";
}

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Tariq ibn Ziyad", xp: 3450, league: "Diamond", streak: 28, isUser: false },
  { rank: 2, name: "Fatima Al-Fihri", xp: 3120, league: "Diamond", streak: 21, isUser: false },
  { rank: 3, name: "Ibn Sina Scholar", xp: 2890, league: "Gold", streak: 14, isUser: false },
  { rank: 4, name: "Aisha Bint Ahmad", xp: 2450, league: "Gold", streak: 19, isUser: false },
  { rank: 5, name: "Al-Khwarizmi", xp: 2100, league: "Silver", streak: 9, isUser: false },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ userStats, locale }) => {
  // Insert current user into ranking dynamically based on XP
  const fullLeaderboard = [
    ...MOCK_LEADERBOARD,
    {
      rank: 6,
      name:
        locale === "ar"
          ? "أنت (طالب العلم)"
          : locale === "he"
            ? "אתה (תלמיד)"
            : "You (Knowledge Seeker)",
      xp: userStats.xp,
      league: userStats.xp > 1000 ? "Gold" : "Bronze",
      streak: userStats.streak,
      isUser: true,
    },
  ]
    .sort((a, b) => b.xp - a.xp)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 py-4">
      {/* League Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            {locale === "ar"
              ? "دوري العلماء الأسبوعي"
              : locale === "he"
                ? "ליגת החוקרים השבועית"
                : "Weekly Scholar League"}
          </span>
          <h2 className="text-xl font-black dir-auto">
            {locale === "ar"
              ? "لوحة صدارة المتفوقين"
              : locale === "he"
                ? "טבלת המובילים"
                : "Global Leaderboard"}
          </h2>
          <p className="text-xs text-amber-100 dir-auto">
            {locale === "ar"
              ? "يتأهل أول 3 متنافسين أسبوعياً للدوري الماسي الأرقى"
              : locale === "he"
                ? "שלושת המובילים עולים לליגת היהלום"
                : "Top 3 learners promote to the Diamond League at midnight"}
          </p>
        </div>
        <Trophy className="w-16 h-16 text-amber-200 opacity-90 stroke-[1.5]" />
      </div>

      {/* Ranks Table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800">
        {fullLeaderboard.map((user) => {
          return (
            <div
              key={user.name}
              className={`flex items-center justify-between p-4 transition-colors ${
                user.isUser
                  ? "bg-emerald-500/10 border-l-4 border-l-emerald-500 font-bold"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full font-black text-sm flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  {user.rank === 1 ? (
                    <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                  ) : user.rank === 2 ? (
                    <Award className="w-5 h-5 text-slate-400" />
                  ) : user.rank === 3 ? (
                    <Award className="w-5 h-5 text-amber-700" />
                  ) : (
                    user.rank
                  )}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 dir-auto">
                    {user.name}
                  </h4>
                  <span className="text-xs text-zinc-400 font-medium dir-auto">
                    {user.league} League • {user.streak} day streak 🔥
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {user.xp} XP
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
