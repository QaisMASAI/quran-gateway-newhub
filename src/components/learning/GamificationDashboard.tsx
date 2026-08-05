import React, { useState } from "react";
import {
  Trophy,
  Flame,
  Heart,
  Sparkles,
  BookOpen,
  RotateCcw,
  Compass,
  Award,
  Users,
  PenTool,
  Shield,
  Sun,
  Layers,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  getGamificationStats,
  calculate100Level,
  buyStreakFreeze,
  toggleVacationMode,
  savePrivateReflection,
  QUEST_CHAINS_CATALOG,
  getAiMentorRecommendations,
  type UserStats,
} from "@/lib/gamification";
import { AchievementsView } from "./AchievementsView";
import { LeaderboardView } from "./LeaderboardView";
import { LearningPathTree, PATH_STAGES, type PathNode } from "./LearningPathTree";
import { SpacedRepetitionView } from "./SpacedRepetitionView";

interface GamificationDashboardProps {
  locale: "en" | "ar" | "he";
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ locale }) => {
  const [stats, setStats] = useState<UserStats>(getGamificationStats);
  const [activeTab, setActiveTab] = useState<
    "journey" | "missions" | "tree" | "achievements" | "circles" | "coach" | "reflections"
  >("journey");

  const [reflectionInput, setReflectionInput] = useState("");
  const [reflectionType, setReflectionType] = useState<"surah" | "hadith" | "topic">("surah");

  const isAr = locale === "ar";
  const isHe = locale === "he";

  const levelDetails = calculate100Level(stats.xp);
  const aiRec = getAiMentorRecommendations(stats);

  const handleBuyFreeze = () => {
    const res = buyStreakFreeze();
    setStats(res.stats);
  };

  const handleToggleVacation = () => {
    const updated = toggleVacationMode();
    setStats(updated);
  };

  const handleAddReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionInput.trim()) return;
    const updated = savePrivateReflection(reflectionType, "تأمل خاص", reflectionInput);
    setStats(updated);
    setReflectionInput("");
  };

  const mockPathNodes: PathNode[] = [
    {
      id: "node_1",
      stageId: 1,
      titleAr: "فاتحة الكتاب وأول النور",
      titleEn: "Al-Fatihah & The First Light",
      titleHe: "אל-פאתיחה והאור הראשון",
      category: "quran",
      unlocked: true,
      completed: true,
      stars: 3,
      icon: "📖",
    },
    {
      id: "node_2",
      stageId: 1,
      titleAr: "أركان العقيدة والإيمان",
      titleEn: "Pillars of Faith & Belief",
      titleHe: "יסודות האמונה",
      category: "ethics",
      unlocked: true,
      completed: false,
      stars: 2,
      icon: "✨",
    },
    {
      id: "node_3",
      stageId: 2,
      titleAr: "قصة الخليل إبراهيم عليه السلام",
      titleEn: "Prophet Ibrahim's Quest",
      titleHe: "מסע אברהם",
      category: "prophets",
      unlocked: true,
      completed: false,
      stars: 1,
      icon: "🌟",
    },
    {
      id: "node_4",
      stageId: 2,
      titleAr: "دعوة موسى ومناجاة الجبل",
      titleEn: "Musa & Mt. Sinai Dialogue",
      titleHe: "משה והר סיני",
      category: "prophets",
      unlocked: false,
      completed: false,
      stars: 0,
      icon: "🏔️",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-6 px-4">
      {/* 1. Header Bar: Level, XP, Streak, Hearts, Streak Freeze */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md flex flex-wrap items-center justify-between gap-6">
        {/* User Level Banner */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-black flex flex-col items-center justify-center shadow-lg ring-4 ring-amber-500/20">
            <span className="text-[10px] uppercase tracking-wider opacity-80">
              {isAr ? "مستوى" : isHe ? "שלב" : "LVL"}
            </span>
            <span className="text-2xl leading-none">{levelDetails.levelInfo.level}</span>
          </div>

          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 dir-auto">
              {isAr
                ? levelDetails.levelInfo.titleAr
                : isHe
                  ? levelDetails.levelInfo.titleHe
                  : levelDetails.levelInfo.titleEn}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-36 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${levelDetails.progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-600">
                {levelDetails.xpInLevel} /{" "}
                {levelDetails.levelInfo.maxXP - levelDetails.levelInfo.minXP} XP
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Widgets */}
        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 font-extrabold text-xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>
              {stats.streak} {isAr ? "يوم ثبات" : "Day Streak"}
            </span>
          </div>

          {/* Hearts */}
          <div className="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 font-extrabold text-xs">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>{stats.hearts} / 5</span>
          </div>

          {/* Streak Freeze Button */}
          <button
            onClick={handleBuyFreeze}
            title={isAr ? "شراء حماية الثبات (150 XP)" : "Buy Streak Freeze (150 XP)"}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-500/20 transition-colors"
          >
            <Shield className="w-4 h-4 text-blue-500" />
            <span>{stats.streakFreezeCount}</span>
          </button>

          {/* Vacation Mode Toggle */}
          <button
            onClick={handleToggleVacation}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-colors ${
              stats.vacationMode
                ? "bg-purple-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
            }`}
          >
            <Sun className="w-4 h-4 inline-block mr-1" />
            {stats.vacationMode
              ? isAr
                ? "إجازة مفعلة"
                : "Vacation On"
              : isAr
                ? "وضع الإجازة"
                : "Vacation"}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-200 dark:border-zinc-800">
        {[
          {
            id: "journey",
            labelAr: "الرحلة والمستويات",
            labelEn: "100 Levels Journey",
            labelHe: "מסע 100 השלבים",
            icon: Trophy,
          },
          {
            id: "missions",
            labelAr: "المهام والرحلات",
            labelEn: "Daily Missions & Quests",
            labelHe: "משימות ומסעות",
            icon: Compass,
          },
          {
            id: "tree",
            labelAr: "شجرة المعرفة",
            labelEn: "Knowledge Tree",
            labelHe: "עץ הידע",
            icon: Layers,
          },
          {
            id: "achievements",
            labelAr: "300+ الأوسمة",
            labelEn: "300+ Achievements",
            labelHe: "300+ תגים",
            icon: Award,
          },
          {
            id: "circles",
            labelAr: "حلقات التعلم",
            labelEn: "Study Circles",
            labelHe: "מעגלי לימוד",
            icon: Users,
          },
          {
            id: "coach",
            labelAr: "الموجه وتكرار SM-2",
            labelEn: "AI Coach & SM-2",
            labelHe: "מאמן וחזרה",
            icon: RotateCcw,
          },
          {
            id: "reflections",
            labelAr: "دفتر التأملات",
            labelEn: "Private Reflections",
            labelHe: "יומן התבוננות",
            icon: PenTool,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isAr ? tab.labelAr : isHe ? tab.labelHe : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: JOURNEY & LEVELS */}
      {activeTab === "journey" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white shadow-lg space-y-3">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              {isAr ? "ميزة المستوى المفتوحة" : "Level Perk Unlocked"}
            </span>
            <h3 className="text-xl font-bold dir-auto">
              {isAr
                ? levelDetails.levelInfo.unlockedPerkAr
                : isHe
                  ? levelDetails.levelInfo.unlockedPerkHe
                  : levelDetails.levelInfo.unlockedPerkEn}
            </h3>
            <p className="text-xs text-amber-100 opacity-90 dir-auto">
              {isAr
                ? "تأهل للمستوى القادم عن طريق القراءة والمواظبة على الاختبارات والتفكر اليومي."
                : "Advance to the next level by completing daily recitation, quizzes, and private reflections."}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {isAr ? "خريطة تقدم الـ 100 مستوى" : "100-Level Tier Roadmap"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { lvl: "1 - 12", titleAr: "مبتدئ في العلم", titleEn: "Novice Seeker", icon: "🌱" },
                { lvl: "13 - 25", titleAr: "طالب مواظب", titleEn: "Steadfast Seeker", icon: "📖" },
                {
                  lvl: "26 - 50",
                  titleAr: "دارس الأثر والتفسير",
                  titleEn: "Student of Tafsir",
                  icon: "📚",
                },
                {
                  lvl: "51 - 100",
                  titleAr: "جامع الفنون والعلوم",
                  titleEn: "Master Polymath",
                  icon: "👑",
                },
              ].map((tierItem) => (
                <div
                  key={tierItem.lvl}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-1"
                >
                  <span className="text-2xl">{tierItem.icon}</span>
                  <div className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 dir-auto">
                    {isAr ? tierItem.titleAr : tierItem.titleEn}
                  </div>
                  <div className="text-[10px] text-amber-600 font-mono font-bold">
                    Levels {tierItem.lvl}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MISSIONS & QUESTS */}
      {activeTab === "missions" && (
        <div className="space-y-8">
          {/* Daily Missions */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {isAr ? "المهام اليومية المتجددة" : "Daily Dynamic Missions"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.dailyMissions.map((m) => (
                <div
                  key={m.id}
                  className={`p-5 rounded-2xl border space-y-3 flex flex-col justify-between ${
                    m.completed
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-600">
                      <span>+{m.rewardXP} XP</span>
                      {m.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 dir-auto">
                      {isAr ? m.titleAr : isHe ? m.titleHe : m.titleEn}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
                      {isAr ? m.descAr : isHe ? m.descHe : m.descEn}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400 font-mono">
                      <span>Progress</span>
                      <span>
                        {m.currentCount} / {m.targetCount}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(m.currentCount / m.targetCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quest Chains Catalog */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-500" />
              {isAr ? "كتالوج الرحلات والمستويات" : "Quest Chains & Historical Journeys"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUEST_CHAINS_CATALOG.map((quest) => (
                <div
                  key={quest.id}
                  className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-2xl flex items-center justify-center border border-indigo-500/20 shrink-0">
                      {quest.badgeIcon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 dir-auto">
                        {isAr ? quest.titleAr : isHe ? quest.titleHe : quest.titleEn}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
                        {isAr ? quest.descAr : isHe ? quest.descHe : quest.descEn}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
                    <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Checkpoints ({quest.checkpoints.length}):
                    </div>
                    {quest.checkpoints.map((cp) => (
                      <div
                        key={cp.id}
                        className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between dir-auto"
                      >
                        <span>• {isAr ? cp.titleAr : cp.titleEn}</span>
                        <span className="text-[10px] text-amber-600 font-mono font-bold">
                          +{cp.rewardXP} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KNOWLEDGE TREE */}
      {activeTab === "tree" && (
        <LearningPathTree nodes={mockPathNodes} locale={locale} onSelectNode={() => {}} />
      )}

      {/* TAB 4: 300+ ACHIEVEMENTS */}
      {activeTab === "achievements" && <AchievementsView stats={stats} locale={locale} />}

      {/* TAB 5: STUDY CIRCLES */}
      {activeTab === "circles" && <LeaderboardView userStats={stats} locale={locale} />}

      {/* TAB 6: AI COACH & SM-2 */}
      {activeTab === "coach" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-800 to-purple-900 text-white shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>{isAr ? "توصيات الموجه المعرفي الذكي" : "AI Learning Mentor Advice"}</span>
            </div>
            <p className="text-sm font-bold dir-auto">
              {isAr ? aiRec.reasonAr : isHe ? aiRec.reasonHe : aiRec.reasonEn}
            </p>
          </div>

          <SpacedRepetitionView stats={stats} locale={locale} onStartRevision={() => {}} />
        </div>
      )}

      {/* TAB 7: PRIVATE REFLECTIONS */}
      {activeTab === "reflections" && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddReflection}
            className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-4"
          >
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-emerald-600" />
              {isAr ? "تدوين تأمل وتفكر خاص" : "Add Private Reflection Journal Entry"}
            </h3>

            <textarea
              rows={3}
              value={reflectionInput}
              onChange={(e) => setReflectionInput(e.target.value)}
              placeholder={
                isAr
                  ? "اكتب خواطرك وتأملاتك الإيمانية المعرفية هنا (خاصة ومحفوظة لك بالكامل)..."
                  : "Write your private reflections, insights, and spiritual notes here..."
              }
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
            >
              {isAr ? "حفظ التأمل (+30 XP)" : "Save Reflection (+30 XP)"}
            </button>
          </form>

          {/* Reflections List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {isAr ? "دفتر التأملات المحفوظة" : "Saved Reflection Entries"} (
              {stats.reflections.length})
            </h4>

            {stats.reflections.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800">
                {isAr
                  ? "لا توجد تأملات مسجلة بعد. ابدأ بتدوين أفكارك الشريفة."
                  : "No private reflections saved yet."}
              </div>
            ) : (
              stats.reflections.map((ref) => (
                <div
                  key={ref.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>{ref.referenceTitle}</span>
                    <span>{new Date(ref.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 dir-auto leading-relaxed">
                    {ref.noteText}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
