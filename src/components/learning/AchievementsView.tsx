import React, { useState, useMemo } from "react";
import { Award, Lock, CheckCircle2, Sparkles, Trophy, Search, Filter } from "lucide-react";
import {
  ALL_300_ACHIEVEMENTS,
  CATEGORY_LABELS,
  type AchievementCategory,
  type AchievementItem,
  type UserStats,
} from "@/lib/gamification";

interface AchievementsViewProps {
  stats: UserStats;
  locale: "en" | "ar" | "he";
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ stats, locale }) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const unlockedSet = useMemo(() => {
    return new Set(stats.unlockedAchievements || []);
  }, [stats.unlockedAchievements]);

  const filteredAchievements = useMemo(() => {
    return ALL_300_ACHIEVEMENTS.filter((ach) => {
      const matchCat = selectedCategory === "all" || ach.category === selectedCategory;
      const name = locale === "ar" ? ach.nameAr : locale === "he" ? ach.nameHe : ach.nameEn;
      const desc = locale === "ar" ? ach.descAr : locale === "he" ? ach.descHe : ach.descEn;
      const matchSearch =
        !searchQuery ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery, locale]);

  const categoryOptions = useMemo(() => {
    return Object.entries(CATEGORY_LABELS) as [AchievementCategory, { ar: string; en: string; he: string }][];
  }, []);

  const totalUnlocked = unlockedSet.size;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-4">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/5 skew-x-12" />
        <div className="space-y-2 relative z-10 text-center sm:text-start">
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md inline-block">
            {locale === "ar"
              ? "مكتبة الإنجازات والأوسمة الشريفة"
              : locale === "he"
                ? "אוסף ההישגים והתגים"
                : "300+ Islamic Achievement Catalog"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black dir-auto">
            {totalUnlocked} / {ALL_300_ACHIEVEMENTS.length}{" "}
            {locale === "ar" ? "أوسمة مكتملة" : locale === "he" ? "תגים שהושלמו" : "Achievements Unlocked"}
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 dir-auto max-w-xl">
            {locale === "ar"
              ? "سجل إنجازاتك في التلاوة والتفسير والتفكر والاستمرارية. افتح أوسمة المعرفة الرفيعة."
              : locale === "he"
                ? "תיעוד ההישגים שלך בקריאה, תפסיר והתבוננות."
                : "Track your milestones in Quran recitation, Tafsir, AI research, and daily devotion."}
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-[120px]">
          <Trophy className="w-10 h-10 text-amber-300 mb-1" />
          <span className="text-xs font-bold text-amber-200">
            {Math.round((totalUnlocked / ALL_300_ACHIEVEMENTS.length) * 100)}% Complete
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === "ar" ? "ابحث عن وسام..." : locale === "he" ? "חפש תג..." : "Search achievement..."
              }
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === "all"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
              }`}
            >
              {locale === "ar" ? "الكل" : locale === "he" ? "הכל" : "All Categories"} ({ALL_300_ACHIEVEMENTS.length})
            </button>
            {categoryOptions.map(([catKey, labels]) => (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === catKey
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                }`}
              >
                {locale === "ar" ? labels.ar : locale === "he" ? labels.he : labels.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAchievements.slice(0, 80).map((ach) => {
          const isUnlocked = unlockedSet.has(ach.id);
          const name = locale === "ar" ? ach.nameAr : locale === "he" ? ach.nameHe : ach.nameEn;
          const desc = locale === "ar" ? ach.descAr : locale === "he" ? ach.descHe : ach.descEn;

          const rarityColor =
            ach.rarity === "sacred_milestone"
              ? "border-amber-500/80 bg-amber-500/5 text-amber-600"
              : ach.rarity === "legendary"
                ? "border-purple-500/70 bg-purple-500/5 text-purple-600"
                : ach.rarity === "epic"
                  ? "border-indigo-500/60 bg-indigo-500/5 text-indigo-600"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500";

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative ${
                isUnlocked
                  ? "bg-white dark:bg-zinc-900 border-purple-500/40 shadow-md"
                  : "bg-zinc-50/70 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                    isUnlocked
                      ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white ring-2 ring-purple-400/30"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {isUnlocked ? ach.icon : <Lock className="w-5 h-5 text-zinc-400" />}
                </div>

                <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${rarityColor}`}>
                  {ach.rarity.replace("_", " ")}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 dir-auto line-clamp-1">{name}</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 dir-auto mt-1 leading-snug line-clamp-2">
                  {desc}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
                <span>+{ach.rewardXP} XP</span>
                {isUnlocked ? (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span>Target: {ach.targetCount}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
