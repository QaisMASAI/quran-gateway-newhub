import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Flame,
  Heart,
  Trophy,
  Award,
  BookOpen,
  RotateCcw,
  Bookmark,
  Map as MapIcon,
  Gamepad2,
  Calendar,
  CheckCircle2,
  Brain,
  Globe,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getGamificationStats,
  calculateLevel,
  updateAdaptiveDifficulty,
  refillHearts,
  type UserStats,
} from "@/lib/gamification";
import { QUESTION_DATABASE, type QuestionItem, type GameMode } from "@/lib/gamification-questions";
import { LearningPathTree, type PathNode } from "@/components/learning/LearningPathTree";
import { InteractiveQuestionCard } from "@/components/learning/InteractiveQuestionCard";
import { AiExplanationModal } from "@/components/learning/AiExplanationModal";
import { SpacedRepetitionView } from "@/components/learning/SpacedRepetitionView";
import { LeaderboardView } from "@/components/learning/LeaderboardView";
import { AchievementsView } from "@/components/learning/AchievementsView";
import { BookmarksHistoryView } from "@/components/learning/BookmarksHistoryView";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/kids")({
  head: () => ({
    meta: [
      { title: "Noor Islamic Learning Platform — Duolingo-Style Islamic Quizzes & Knowledge" },
      {
        name: "description",
        content:
          "Master Quranic Sciences, Hadiths, Seerah, and Islamic Ethics with adaptive difficulty, spaced repetition, AI explanations, and 13 interactive game modes in Arabic, English, and Hebrew.",
      },
    ],
  }),
  component: IslamicLearningPlatformPage,
});

type PlatformTab = "path" | "quests" | "modes" | "spaced_repetition" | "leaderboard" | "achievements" | "bookmarks";

const INITIAL_NODES: PathNode[] = [
  {
    id: "node_1",
    stageId: 1,
    titleAr: "سورة الفاتحة",
    titleEn: "Surah Al-Fatihah",
    titleHe: "סורת אל-פאתיחה",
    category: "quran",
    unlocked: true,
    completed: true,
    stars: 3,
    icon: "📖",
  },
  {
    id: "node_2",
    stageId: 1,
    titleAr: "خلق آدم عليه السلام",
    titleEn: "Creation of Adam",
    titleHe: "בריאת אדם",
    category: "prophets",
    unlocked: true,
    completed: true,
    stars: 2,
    icon: "🌱",
  },
  {
    id: "node_3",
    stageId: 1,
    titleAr: "أركان الإسلام الخمسة",
    titleEn: "Pillars of Islam",
    titleHe: "עמודי האסלאם",
    category: "ethics",
    unlocked: true,
    completed: false,
    stars: 0,
    icon: "🕌",
  },
  {
    id: "node_4",
    stageId: 2,
    titleAr: "سيرة النبي موسى",
    titleEn: "Prophet Moses (pbuh)",
    titleHe: "הנביא משה",
    category: "prophets",
    unlocked: true,
    completed: false,
    stars: 0,
    icon: "🌊",
  },
  {
    id: "node_5",
    stageId: 2,
    titleAr: "حديث الأعمال بالنيات",
    titleEn: "Hadith of Intentions",
    titleHe: "חדית' הכוונות",
    category: "hadith",
    unlocked: false,
    completed: false,
    stars: 0,
    icon: "📜",
  },
];

function IslamicLearningPlatformPage() {
  const [stats, setStats] = useState<UserStats>(getGamificationStats());
  const [activeTab, setActiveTab] = useState<PlatformTab>("path");
  const [platformLocale, setPlatformLocale] = useState<"en" | "ar" | "he">("en");

  // Active quiz playing state
  const [activeQuestion, setActiveQuestion] = useState<QuestionItem | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setStats(getGamificationStats());
  }, []);

  const levelInfo = calculateLevel(stats.xp);

  const handleStartQuestion = (questionId?: string, modeFilter?: GameMode) => {
    let targetQuestion: QuestionItem | undefined;
    if (questionId) {
      targetQuestion = QUESTION_DATABASE.find((q) => q.id === questionId);
    } else if (modeFilter) {
      targetQuestion = QUESTION_DATABASE.find((q) => q.mode === modeFilter);
    } else {
      // Pick random question based on adaptive difficulty
      const suitable = QUESTION_DATABASE.filter(
        (q) => q.difficulty === stats.adaptiveDifficulty || q.difficulty === "easy",
      );
      targetQuestion = suitable[Math.floor(Math.random() * suitable.length)] || QUESTION_DATABASE[0];
    }

    if (targetQuestion) {
      setActiveQuestion(targetQuestion);
    }
  };

  const handleAnswerSubmit = (isCorrect: boolean, xpEarned: number) => {
    if (!activeQuestion) return;
    const updated = updateAdaptiveDifficulty(
      activeQuestion.category,
      isCorrect,
      xpEarned,
      activeQuestion.id,
      platformLocale === "ar"
        ? activeQuestion.titleAr
        : platformLocale === "he"
          ? activeQuestion.titleHe
          : activeQuestion.titleEn,
      activeQuestion.mode,
    );
    setStats(updated);
  };

  const handleRefillHearts = () => {
    const updated = refillHearts();
    setStats(updated);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased">
      <Header />

      {/* DUOLINGO TOP STATS BAR */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Left Brand / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-base leading-tight dir-auto">
                {platformLocale === "ar"
                  ? "منصة نور التعليمية الإسلامية"
                  : platformLocale === "he"
                    ? "פלטפורמת הלימוד האסלאמית"
                    : "Noor Islamic Learning Platform"}
              </h1>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold dir-auto">
                {levelInfo.titleEn} • Level {levelInfo.level}
              </span>
            </div>
          </div>

          {/* Center Stats (Hearts, Streak, XP) */}
          <div className="flex items-center gap-4">
            {/* Hearts (Lives) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400">{stats.hearts} / 5</span>
              {stats.hearts < 5 && (
                <button
                  onClick={handleRefillHearts}
                  className="ml-1 text-[10px] font-bold underline text-rose-600 hover:text-rose-700"
                  title="Refill Hearts"
                >
                  <Plus className="w-3.5 h-3.5 inline" /> Refill
                </button>
              )}
            </div>

            {/* Streak Flame */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">
                {stats.streak} {platformLocale === "ar" ? "أيام" : platformLocale === "he" ? "ימים" : "Days"}
              </span>
            </div>

            {/* XP Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <Trophy className="w-5 h-5 text-emerald-500" />
              <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{stats.xp} XP</span>
            </div>
          </div>

          {/* Right Language Selector */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            {(["en", "ar", "he"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setPlatformLocale(lang)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  platformLocale === lang
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIVE QUIZ OVERLAY MODAL */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {platformLocale === "ar" ? "تحدي فرعي" : platformLocale === "he" ? "אתגר" : "Challenge Mode"}
                </span>
              </div>
              <Button variant="ghost" onClick={() => setActiveQuestion(null)} className="text-xs font-bold">
                ✕ {platformLocale === "ar" ? "خروج" : platformLocale === "he" ? "יציאה" : "Close"}
              </Button>
            </div>

            <InteractiveQuestionCard
              question={activeQuestion}
              locale={platformLocale}
              onAnswerSubmit={handleAnswerSubmit}
              onOpenAiExplanation={() => setIsAiModalOpen(true)}
            />

            <AiExplanationModal
              question={activeQuestion}
              locale={platformLocale}
              isOpen={isAiModalOpen}
              onClose={() => setIsAiModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* MAIN NAVIGATION TABS */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-200 dark:border-zinc-800">
          {[
            {
              id: "path",
              labelEn: "Learning Path",
              labelAr: "مسار التعلم",
              labelHe: "מסלול לימוד",
              icon: MapIcon,
            },
            {
              id: "quests",
              labelEn: "Daily Quests",
              labelAr: "التحديات اليومية",
              labelHe: "אתגרים יומיים",
              icon: Calendar,
            },
            {
              id: "modes",
              labelEn: "13 Game Modes",
              labelAr: "ألعاب وأنماط 13",
              labelHe: "13 מצבי משחק",
              icon: Gamepad2,
            },
            {
              id: "spaced_repetition",
              labelEn: "Revision Mode",
              labelAr: "المراجعة الذكية",
              labelHe: "חזרה קצובה",
              icon: Brain,
            },
            {
              id: "leaderboard",
              labelEn: "Leaderboard",
              labelAr: "لوحة الصدارة",
              labelHe: "לוח מובילים",
              icon: Trophy,
            },
            {
              id: "achievements",
              labelEn: "Badges",
              labelAr: "الأوسمة",
              labelHe: "הישגים",
              icon: Award,
            },
            {
              id: "bookmarks",
              labelEn: "History & Notes",
              labelAr: "المحفوظات والسجل",
              labelHe: "סימניות והיסטוריה",
              icon: Bookmark,
            },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            const label = platformLocale === "ar" ? tab.labelAr : platformLocale === "he" ? tab.labelHe : tab.labelEn;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PlatformTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DUOLINGO LEARNING PATH */}
        {activeTab === "path" && (
          <div className="space-y-6">
            {/* Quick Practice CTA */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl flex items-center justify-between">
              <div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                  {platformLocale === "ar"
                    ? "التكيف الذكي التلقائي"
                    : platformLocale === "he"
                      ? "התאמה אוטומטית"
                      : "Adaptive Learning Engine"}
                </span>
                <h2 className="text-xl font-extrabold dir-auto">
                  {platformLocale === "ar"
                    ? "ابدأ الجلسة التفاعلية الآن"
                    : platformLocale === "he"
                      ? "התחל סשן למידה"
                      : "Start Adaptive Learning Session"}
                </h2>
                <p className="text-xs text-emerald-100 dir-auto mt-1">
                  {platformLocale === "ar"
                    ? "يتكيف صعوبة الأسئلة تلقائياً بناءً على دقة إجاباتك السابقة."
                    : platformLocale === "he"
                      ? "רמת הקושי תותאם אוטומטית על סמך ביצועיך."
                      : "Questions dynamically scale based on your recent accuracy rate."}
                </p>
              </div>

              <Button
                onClick={() => handleStartQuestion()}
                className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-all text-sm"
              >
                <Sparkles className="w-5 h-5 mr-2 inline fill-amber-950" />
                {platformLocale === "ar" ? "ابدأ الآن" : platformLocale === "he" ? "התחל עכשיו" : "START SESSION"}
              </Button>
            </div>

            <LearningPathTree
              nodes={INITIAL_NODES}
              locale={platformLocale}
              onSelectNode={(node) => handleStartQuestion()}
            />
          </div>
        )}

        {/* TAB 2: DAILY & WEEKLY QUESTS */}
        {activeTab === "quests" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xl">
              <h2 className="text-xl font-black dir-auto">
                {platformLocale === "ar"
                  ? "التحديات والمهمات اليومية والأسبوعية"
                  : platformLocale === "he"
                    ? "אתגרים יומיים ושבועיים"
                    : "Daily & Weekly Missions"}
              </h2>
              <p className="text-xs text-amber-100 dir-auto mt-1">
                {platformLocale === "ar"
                  ? "أكمل التحديات قبل نهاية اليوم للحصول على نقاط XP مضاعفة وأوسمة خاصة"
                  : platformLocale === "he"
                    ? "השלם את המשימות לקבלת בונוסים"
                    : "Complete missions before midnight to claim double XP bonuses"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Daily Quest */}
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">
                    {platformLocale === "ar" ? "تحدي اليوم" : platformLocale === "he" ? "אתגר יומי" : "DAILY QUEST"}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">+50 XP</span>
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 dir-auto">
                  {platformLocale === "ar"
                    ? "أجب على 3 أسئلة في سياق الآيات بشكل صحيح"
                    : platformLocale === "he"
                      ? "ענה נכון על 3 שאלות בהקשר הפסוקים"
                      : "Answer 3 Verse Context questions correctly"}
                </h3>
                <Button
                  onClick={() => handleStartQuestion(undefined, "verse_context")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  {platformLocale === "ar"
                    ? "ابدأ التحدي اليومي"
                    : platformLocale === "he"
                      ? "התחל אתגר יומי"
                      : "PLAY DAILY QUEST"}
                </Button>
              </div>

              {/* Weekly Quest */}
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400">
                    {platformLocale === "ar"
                      ? "التحدي الأسبوعي"
                      : platformLocale === "he"
                        ? "אתגר שבועי"
                        : "WEEKLY QUEST"}
                  </span>
                  <span className="text-xs font-bold text-purple-600">+150 XP</span>
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 dir-auto">
                  {platformLocale === "ar"
                    ? "أكمل نمط الترتيب الزمني للأحداث النبوية"
                    : platformLocale === "he"
                      ? "השלם את סדר האירועים הכרונולוגי"
                      : "Complete Prophetic History Chronology Ordering"}
                </h3>
                <Button
                  onClick={() => handleStartQuestion(undefined, "chronology")}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                >
                  {platformLocale === "ar"
                    ? "ابدأ التحدي الأسبوعي"
                    : platformLocale === "he"
                      ? "התחל אתגר שבועי"
                      : "PLAY WEEKLY QUEST"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALL 13 GAME MODES */}
        {activeTab === "modes" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 dir-auto">
              {platformLocale === "ar"
                ? "جميع أنماط وألعاب التعلم الـ 13"
                : platformLocale === "he"
                  ? "כל 13 מצבי המשחק"
                  : "All 13 Interactive Game Modes"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  id: "guess_surah",
                  titleAr: "خَمِّن السورة",
                  titleEn: "Guess the Surah",
                  titleHe: "זהה את הסורה",
                  icon: "📖",
                },
                {
                  id: "guess_prophet",
                  titleAr: "خَمِّن النبي",
                  titleEn: "Guess the Prophet",
                  titleHe: "זהה את הנביא",
                  icon: "🌱",
                },
                {
                  id: "guess_companion",
                  titleAr: "خَمِّن الصحابي",
                  titleEn: "Guess the Companion",
                  titleHe: "זהه את הסחאבי",
                  icon: "🌟",
                },
                {
                  id: "complete_verse",
                  titleAr: "أكمل الآية",
                  titleEn: "Complete the Verse",
                  titleHe: "השלם את הפסוק",
                  icon: "✍️",
                },
                {
                  id: "complete_hadith",
                  titleAr: "أكمل الحديث",
                  titleEn: "Complete the Hadith",
                  titleHe: "השלם את החדית'",
                  icon: "📜",
                },
                {
                  id: "verse_context",
                  titleAr: "أسباب النزول والسياق",
                  titleEn: "Verse Context",
                  titleHe: "הקשר הפסוק",
                  icon: "💡",
                },
                {
                  id: "hadith_context",
                  titleAr: "سياق الحديث والرواد",
                  titleEn: "Hadith Context",
                  titleHe: "הקשר החדית'",
                  icon: "📚",
                },
                {
                  id: "chronology",
                  titleAr: "الترتيب الزمني",
                  titleEn: "Chronology Ordering",
                  titleHe: "סדר כרונולוגי",
                  icon: "⌛",
                },
                {
                  id: "true_false",
                  titleAr: "صواب أم خطأ",
                  titleEn: "True or False",
                  titleHe: "אמת או שקר",
                  icon: "⚖️",
                },
                {
                  id: "multiple_choice",
                  titleAr: "خيارات متعددة",
                  titleEn: "Multiple Choice",
                  titleHe: "שאלה אמריקאית",
                  icon: "🎯",
                },
                {
                  id: "image_recognition",
                  titleAr: "التمييز البصري للمعالم",
                  titleEn: "Image Recognition",
                  titleHe: "זיהוי תמונות",
                  icon: "🖼️",
                },
                {
                  id: "relationship_matching",
                  titleAr: "مطابقة العلاقات",
                  titleEn: "Relationship Matching",
                  titleHe: "התאמת קשרים",
                  icon: "🔗",
                },
                {
                  id: "topic_matching",
                  titleAr: "مطابقة الموضوعات",
                  titleEn: "Topic Matching",
                  titleHe: "התאמת נושאים",
                  icon: "🏷️",
                },
              ].map((mode) => {
                const title =
                  platformLocale === "ar" ? mode.titleAr : platformLocale === "he" ? mode.titleHe : mode.titleEn;

                return (
                  <div
                    key={mode.id}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between hover:border-emerald-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">{mode.icon}</span>
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 dir-auto">{title}</span>
                    </div>

                    <Button
                      onClick={() => handleStartQuestion(undefined, mode.id as GameMode)}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                    >
                      {platformLocale === "ar" ? "العب" : platformLocale === "he" ? "שחק" : "PLAY"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: SPACED REPETITION */}
        {activeTab === "spaced_repetition" && (
          <SpacedRepetitionView
            stats={stats}
            locale={platformLocale}
            onStartRevision={(qId) => handleStartQuestion(qId)}
          />
        )}

        {/* TAB 5: LEADERBOARD */}
        {activeTab === "leaderboard" && <LeaderboardView userStats={stats} locale={platformLocale} />}

        {/* TAB 6: ACHIEVEMENTS & BADGES */}
        {activeTab === "achievements" && <AchievementsView stats={stats} locale={platformLocale} />}

        {/* TAB 7: BOOKMARKS & HISTORY */}
        {activeTab === "bookmarks" && <BookmarksHistoryView stats={stats} locale={platformLocale} />}
      </main>
    </div>
  );
}
