import React from "react";
import { Award, Lock, CheckCircle2, Sparkles, Star, Trophy } from "lucide-react";
import { ALL_BADGES, type UserStats } from "@/lib/gamification";

interface AchievementsViewProps {
  stats: UserStats;
  locale: "en" | "ar" | "he";
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ stats, locale }) => {
  const unlockedIds = stats.badges || [];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            {locale === "ar"
              ? "معرض الإنجازات والأوسمة"
              : locale === "he"
                ? "הישגים ותגים"
                : "Achievements & Badges"}
          </span>
          <h2 className="text-xl font-black dir-auto">
            {unlockedIds.length} / {ALL_BADGES.length}{" "}
            {locale === "ar"
              ? "أوسمة مكتملة"
              : locale === "he"
                ? "תגים שהושלמו"
                : "Badges Unlocked"}
          </h2>
          <p className="text-xs text-indigo-100 dir-auto">
            {locale === "ar"
              ? "واصل التحديات والمراجعة اليومية لفتح أوسمة العلم الرفيعة"
              : locale === "he"
                ? "המשך לאתגרים יומיים כדי לפתוח תגי כבוד"
                : "Complete challenges and daily reviews to unlock rare scholar badges"}
          </p>
        </div>
        <Trophy className="w-16 h-16 text-indigo-200 opacity-90 stroke-[1.5]" />
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {ALL_BADGES.map((badge) => {
          const isUnlocked = unlockedIds.includes(badge.id);
          const name =
            locale === "ar" ? badge.nameAr : locale === "he" ? badge.nameHe : badge.nameEn;
          const desc =
            locale === "ar" ? badge.descAr : locale === "he" ? badge.descHe : badge.descEn;

          return (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col items-center text-center space-y-3 ${
                isUnlocked
                  ? "bg-white dark:bg-zinc-900 border-amber-400/50 shadow-lg ring-1 ring-amber-400/20"
                  : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 opacity-60"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                  isUnlocked
                    ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white ring-4 ring-amber-400/20"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400"
                }`}
              >
                {isUnlocked ? badge.icon : <Lock className="w-6 h-6" />}
              </div>

              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 dir-auto">
                  {name}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto mt-1 leading-snug">
                  {desc}
                </p>
              </div>

              {isUnlocked && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  UNLOCKED
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
