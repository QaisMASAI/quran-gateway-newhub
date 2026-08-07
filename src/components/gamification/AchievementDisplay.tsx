import React, { useState } from "react";
import { Award, Lock, Sparkles, CheckCircle2, Filter, BookOpen } from "lucide-react";
import {
  ALL_300_ACHIEVEMENTS,
  type AchievementItem,
  type AchievementCategory,
} from "@/lib/gamification";
import { type UserGameification } from "@/lib/gamification-engine-v2";

interface AchievementDisplayProps {
  data: UserGameification;
  locale?: "en" | "ar" | "he";
}

export const AchievementDisplay: React.FC<AchievementDisplayProps> = ({ data, locale = "en" }) => {
  const isAr = locale === "ar";
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeStoryModal, setActiveStoryModal] = useState<AchievementItem | null>(null);

  const unlockedIds = new Set(data.achievements.filter((a) => a.progress >= 100).map((a) => a.id));

  const filteredAchievements = ALL_300_ACHIEVEMENTS.filter((ach) => {
    if (selectedRarity !== "all" && ach.rarity !== selectedRarity) return false;
    if (selectedCategory !== "all" && ach.category !== selectedCategory) return false;
    return true;
  });

  const rarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700";
      case "rare":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "epic":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20";
      case "legendary":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-black";
      default:
        return "bg-zinc-100 text-zinc-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
              <Award className="w-5 h-5 text-amber-500" />
              {isAr ? "سجل الأوسمة والإنجازات (300+)" : "300+ Achievements Catalog"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
              {unlockedIds.size} / {ALL_300_ACHIEVEMENTS.length} {isAr ? "وسام مفتوح" : "unlocked"}
            </p>
          </div>

          {/* Rarity Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {["all", "common", "rare", "epic", "legendary"].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRarity(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedRarity === r
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.slice(0, 30).map((ach) => {
          const isUnlocked = unlockedIds.has(ach.id);
          return (
            <div
              key={ach.id}
              onClick={() => setActiveStoryModal(ach)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between hover:scale-[1.01] ${
                isUnlocked
                  ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-md"
                  : "bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 opacity-75"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-2xl flex items-center justify-center border border-amber-500/20 shrink-0">
                    {ach.icon}
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${rarityColor(
                      ach.rarity,
                    )}`}
                  >
                    {ach.rarity}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 dir-auto flex items-center gap-1.5">
                    <span>{isAr ? ach.nameAr : ach.nameEn}</span>
                    {isUnlocked && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto line-clamp-2">
                    {isAr ? ach.descAr : ach.descEn}
                  </p>
                </div>
              </div>

              {/* Reward & Progress */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-amber-600">+{ach.rewardXP} XP</span>
                <span className="text-zinc-400">
                  {isUnlocked ? "Unlocked" : `Target: ${ach.targetCount}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Story / Context Modal */}
      {activeStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-3xl flex items-center justify-center border border-amber-500/20">
                {activeStoryModal.icon}
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 dir-auto">
                  {isAr ? activeStoryModal.nameAr : activeStoryModal.nameEn}
                </h3>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border mt-1 ${rarityColor(
                    activeStoryModal.rarity,
                  )}`}
                >
                  {activeStoryModal.rarity} Tier
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 dir-auto leading-relaxed">
              {isAr ? activeStoryModal.descAr : activeStoryModal.descEn}
            </p>

            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 dir-auto space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>{isAr ? "السياق المعرفي والتاريخي" : "Narrative Context"}</span>
              </div>
              <p className="opacity-90">
                {isAr
                  ? "إرث معرفي قائم على طلب العلم بصدق وإتقان دون رياء."
                  : "Earned by cultivating deep comprehension and steadfast devotion in learning."}
              </p>
            </div>

            <button
              onClick={() => setActiveStoryModal(null)}
              className="w-full py-2.5 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs hover:opacity-90 transition-opacity"
            >
              {isAr ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
