import React, { useState } from "react";
import { Trophy, Award, Lock, CheckCircle2, Sparkles, Flame, ShieldCheck } from "lucide-react";
import { ALL_BADGES, getGamificationStats, calculateLevel } from "@/lib/gamification";
import { Badge } from "@/components/ui/badge";

interface AchievementSystemViewProps {
  locale: string;
}

export const AchievementSystemView: React.FC<AchievementSystemViewProps> = ({ locale }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const [gameStats] = useState(getGamificationStats());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const levelInfo = calculateLevel(gameStats.xp);

  const filteredBadges = ALL_BADGES.filter((b) => {
    if (selectedCategory === "all") return true;
    return b.category === selectedCategory;
  });

  return (
    <div className="rounded-3xl border border-gold/30 bg-zinc-900 p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gold/10 text-gold border border-gold/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {isAr ? "نظام الأوسمة والإنجازات العلمية" : isHe ? "מערכת ההישגים והתגים" : "Achievement & Badge System"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAr
                ? "احصل على الأوسمة والمكافآت مع كل خطوة تخطوها في العلم النافع"
                : isHe
                  ? "אוסף תגים ופרסים עם כל צעד בלמידת התורה האסלאמית"
                  : "Earn badges and unlock milestones as you deepen your knowledge"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-gold/10 border border-gold/30 text-gold font-black text-xs flex items-center gap-2">
            <Flame className="w-4 h-4 fill-gold text-gold" />
            <span>{gameStats.xp} XP</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs">
            {gameStats.unlockedAchievements.length} / {ALL_BADGES.length} {isAr ? "مفتوح" : isHe ? "פתוחים" : "Unlocked"}
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", labelEn: "All Badges", labelAr: "جميع الأوسمة", labelHe: "כל התגים" },
          { id: "streak", labelEn: "Streaks", labelAr: "التتابع", labelHe: "רצף" },
          { id: "mastery", labelEn: "Mastery", labelAr: "الإتقان", labelHe: "מיומנות" },
          { id: "knowledge", labelEn: "Knowledge", labelAr: "المعرفة", labelHe: "ידע" },
          { id: "modes", labelEn: "Modes", labelAr: "الأنماط", labelHe: "מצבים" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.id
                ? "bg-gold text-zinc-950 font-black shadow-md shadow-gold/20"
                : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            {isAr ? cat.labelAr : isHe ? cat.labelHe : cat.labelEn}
          </button>
        ))}
      </div>

      {/* BADGES GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredBadges.map((b) => {
          const isUnlocked = gameStats.unlockedAchievements.includes(b.id);
          const name = isAr ? b.nameAr : isHe ? b.nameHe : b.nameEn;
          const desc = isAr ? b.descAr : isHe ? b.descHe : b.descEn;

          return (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between space-y-2 ${
                isUnlocked
                  ? "bg-gradient-to-b from-gold/10 to-zinc-950 border-gold/50 shadow-md shadow-gold/10"
                  : "bg-zinc-950/60 border-zinc-800/80 grayscale opacity-50"
              }`}
            >
              <div className="space-y-1">
                <div className="text-3xl mb-1">{b.icon}</div>
                <h4 className="text-xs font-black text-white">{name}</h4>
                <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">{desc}</p>
              </div>

              <div className="pt-2">
                {isUnlocked ? (
                  <Badge className="bg-gold/20 text-gold border-gold/40 text-[9px] font-extrabold px-2 py-0.5">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    {isAr ? "مكتمل" : isHe ? "הושלם" : "Unlocked"}
                  </Badge>
                ) : (
                  <Badge className="bg-zinc-900 text-zinc-500 border-zinc-800 text-[9px] font-bold px-2 py-0.5">
                    <Lock className="w-3 h-3 inline mr-1" />
                    {isAr ? "مغلق" : isHe ? "נעול" : "Locked"}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
