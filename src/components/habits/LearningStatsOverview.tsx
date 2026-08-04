import React from "react";
import {
  BarChart3,
  Clock,
  BookOpen,
  ScrollText,
  Sparkles,
  Trophy,
  Brain,
  CheckCircle,
} from "lucide-react";
import { getGamificationStats, calculateLevel } from "@/lib/gamification";
import { getHabitData } from "@/lib/habit-engine";

interface LearningStatsOverviewProps {
  locale: string;
}

export const LearningStatsOverview: React.FC<LearningStatsOverviewProps> = ({ locale }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const gameStats = getGamificationStats();
  const habitData = getHabitData();
  const levelInfo = calculateLevel(gameStats.xp);

  const accuracyPercent =
    gameStats.totalQuestionsAnswered > 0
      ? Math.round((gameStats.totalCorrect / gameStats.totalQuestionsAnswered) * 100)
      : 100;

  const topics = [
    { key: "quran", labelEn: "Quran Sciences", labelAr: "علوم القرآن", labelHe: "מדעי הקورאן" },
    { key: "hadith", labelEn: "Hadith Studies", labelAr: "الحديث الشريف", labelHe: "חדית'" },
    { key: "prophets", labelEn: "Prophets' Lives", labelAr: "قصص الأنبياء", labelHe: "סיפורי נביאים" },
    { key: "tafsir", labelEn: "Tafsir Commentary", labelAr: "التفسير المعتمد", labelHe: "תפסיר" },
    { key: "history", labelEn: "Islamic History", labelAr: "التاريخ الإسلامي", labelHe: "היסטוריה אסלאמית" },
  ];

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {isAr ? "إحصائيات التعلم الشاملة" : isHe ? "סטטיסטיקת למידה מקיפה" : "Comprehensive Learning Statistics"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAr
                ? "متابعة دقيقة لمعدل التحصيل والمعرفة التراكمية"
                : isHe
                  ? "מעקב מדויק אחר הישגי הלימוד והידע המצטבר"
                  : "Accurate tracking of learning hours, accuracy & knowledge growth"}
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-black text-xs">
          {isAr ? "المستوى " : isHe ? "רמה " : "Level "} {levelInfo.level}
        </div>
      </div>

      {/* 4 CORE STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? "الآيات الملتوية" : isHe ? "פסוקים נקראו" : "Ayahs Read"}</span>
          </div>
          <div className="text-2xl font-black text-white">{gameStats.versesReadCount + habitData.goals.dailyAyahsRead}</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <ScrollText className="w-4 h-4 text-amber-400" />
            <span>{isAr ? "الأحاديث المدرسة" : isHe ? "חדית'ים שנלמדו" : "Hadiths Studied"}</span>
          </div>
          <div className="text-2xl font-black text-white">{gameStats.hadithsExploredCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? "دقائق التعلم" : isHe ? "דקות לימוד" : "Study Minutes"}</span>
          </div>
          <div className="text-2xl font-black text-white">{habitData.totalMinutesLearned}m</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>{isAr ? "نسبة الدقة" : isHe ? "אחוז דיוק" : "Accuracy Rate"}</span>
          </div>
          <div className="text-2xl font-black text-white">{accuracyPercent}%</div>
        </div>
      </div>

      {/* TOPIC MASTERY BARS */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          {isAr ? "إتقان الموضوعات والعلوم" : isHe ? "שליטה בנושאים ומדעים" : "Topic & Domain Mastery"}
        </h4>

        <div className="space-y-2.5">
          {topics.map((t) => {
            const data = gameStats.topicAccuracy[t.key] || { total: 0, correct: 0 };
            const percent =
              data.total > 0 ? Math.round((data.correct / data.total) * 100) : 75; // default benchmark
            const name = isAr ? t.labelAr : isHe ? t.labelHe : t.labelEn;

            return (
              <div key={t.key} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span>{name}</span>
                  <span className="text-teal-400">{percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800/80">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
