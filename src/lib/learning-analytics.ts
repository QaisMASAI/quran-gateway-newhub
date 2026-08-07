/**
 * Learning Analytics Engine
 * Advanced Analytics, Insights, Heatmaps & Metrics Generator
 */

export interface LearningEvent {
  id: string;
  userId: string;
  eventType:
    | "verse_read"
    | "quiz_completed"
    | "achievement_unlocked"
    | "tafsir_studied"
    | "hadith_analyzed"
    | "social_praise";
  timestamp: string; // ISO String
  durationSeconds: number;
  topicId?: string;
  topicName?: string;
  accuracy?: number; // 0-100 %
  difficulty?: number; // 1-10
  xpEarned: number;
}

export interface DayHeatmapItem {
  date: string; // YYYY-MM-DD
  count: number;
  minutes: number;
  quizzes: number;
  intensity: 0 | 1 | 2 | 3 | 4; // 0=none, 1=light, 2=med, 3=high, 4=extreme
}

export interface TopicMasteryMetric {
  topicId: string;
  topicName: string;
  topicNameAr: string;
  userMasteryPct: number;
  globalAvgPct: number;
  quizzesTaken: number;
  timeSpentHours: number;
  status: "mastered" | "proficient" | "weak";
}

export interface TimeSpentBreakdown {
  weekLabel: string;
  readingHours: number;
  quizHours: number;
  tafsirHours: number;
  socialHours: number;
  totalHours: number;
}

export interface QuizAccuracyTrend {
  date: string;
  accuracyPct: number;
  avgTimePerQuestionSec: number;
  difficultyScale: number;
}

export interface AnalyticsSummary {
  userId: string;
  totalLearningHours: number;
  totalVersesRead: number;
  totalQuizzesCompleted: number;
  topicsMasteredPct: number;
  currentLevel: number;
  xpInLevel: number;
  xpNeededForNext: number;
  currentStreakDays: number;
  longestStreakDays: number;
  percentileRank: number; // e.g., Top 5% globally
  peersAvgWeeklyMin: number;
  userWeeklyMin: number;
  heatmapData: DayHeatmapItem[];
  topicMasteryData: TopicMasteryMetric[];
  timeSpentWeeklyData: TimeSpentBreakdown[];
  quizAccuracyTrendData: QuizAccuracyTrend[];
  weakAreas: {
    topicId: string;
    topicName: string;
    accuracyPct: number;
    recommendedAction: string;
  }[];
  achievementRarityDistribution: {
    rarity: "common" | "rare" | "epic" | "legendary";
    count: number;
    unlockedCount: number;
  }[];
  recommendations: {
    title: string;
    description: string;
    type: "next_step" | "time_to_mastery" | "friends_catch" | "retry_weak";
    actionLabel: string;
  }[];
}

// Mock Data Generator for rich visualization preview
export function generateMockAnalyticsSummary(userId: string = "usr_guest"): AnalyticsSummary {
  // 365 Days Heatmap
  const heatmapData: DayHeatmapItem[] = [];
  const today = new Date();
  for (let i = 180; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Seed realistic activity
    const isWeekend = d.getDay() === 5 || d.getDay() === 6;
    const minutes = Math.floor(Math.random() * (isWeekend ? 60 : 35));
    const quizzes = minutes > 20 ? Math.floor(Math.random() * 3) + 1 : 0;
    const count = minutes > 0 ? Math.floor(minutes / 10) + 1 : 0;

    let intensity: DayHeatmapItem["intensity"] = 0;
    if (minutes > 45) intensity = 4;
    else if (minutes > 30) intensity = 3;
    else if (minutes > 15) intensity = 2;
    else if (minutes > 0) intensity = 1;

    heatmapData.push({
      date: dateStr,
      count,
      minutes,
      quizzes,
      intensity,
    });
  }

  return {
    userId,
    totalLearningHours: 48.5,
    totalVersesRead: 1420,
    totalQuizzesCompleted: 38,
    topicsMasteredPct: 74,
    currentLevel: 12,
    xpInLevel: 450,
    xpNeededForNext: 550,
    currentStreakDays: 14,
    longestStreakDays: 28,
    percentileRank: 95, // Top 5% globally
    peersAvgWeeklyMin: 45,
    userWeeklyMin: 180,
    heatmapData,
    topicMasteryData: [
      {
        topicId: "qm",
        topicName: "Quranic Mastery",
        topicNameAr: "إتقان القرآن",
        userMasteryPct: 88,
        globalAvgPct: 62,
        quizzesTaken: 12,
        timeSpentHours: 18.5,
        status: "mastered",
      },
      {
        topicId: "hs",
        topicName: "Hadith Sciences",
        topicNameAr: "علوم الحديث",
        userMasteryPct: 76,
        globalAvgPct: 55,
        quizzesTaken: 8,
        timeSpentHours: 10.2,
        status: "proficient",
      },
      {
        topicId: "il",
        topicName: "Islamic Law & Fiqh",
        topicNameAr: "الفقه الإسلامي",
        userMasteryPct: 52,
        globalAvgPct: 50,
        quizzesTaken: 6,
        timeSpentHours: 6.8,
        status: "weak",
      },
      {
        topicId: "ps",
        topicName: "Prophet Stories",
        topicNameAr: "قصص الأنبياء",
        userMasteryPct: 82,
        globalAvgPct: 68,
        quizzesTaken: 5,
        timeSpentHours: 5.5,
        status: "mastered",
      },
      {
        topicId: "el",
        topicName: "Ethical Living",
        topicNameAr: "الأخلاق والسلوك",
        userMasteryPct: 90,
        globalAvgPct: 70,
        quizzesTaken: 4,
        timeSpentHours: 4.2,
        status: "mastered",
      },
      {
        topicId: "sg",
        topicName: "Sacred Geography",
        topicNameAr: "الجغرافيا المقدسة",
        userMasteryPct: 58,
        globalAvgPct: 48,
        quizzesTaken: 3,
        timeSpentHours: 3.3,
        status: "weak",
      },
    ],
    timeSpentWeeklyData: [
      {
        weekLabel: "Wk 1",
        readingHours: 3.5,
        quizHours: 1.2,
        tafsirHours: 2.0,
        socialHours: 0.5,
        totalHours: 7.2,
      },
      {
        weekLabel: "Wk 2",
        readingHours: 4.0,
        quizHours: 1.8,
        tafsirHours: 2.5,
        socialHours: 0.8,
        totalHours: 9.1,
      },
      {
        weekLabel: "Wk 3",
        readingHours: 4.8,
        quizHours: 2.2,
        tafsirHours: 3.0,
        socialHours: 1.0,
        totalHours: 11.0,
      },
      {
        weekLabel: "Wk 4",
        readingHours: 5.2,
        quizHours: 2.5,
        tafsirHours: 3.8,
        socialHours: 1.2,
        totalHours: 12.7,
      },
      {
        weekLabel: "Wk 5",
        readingHours: 3.8,
        quizHours: 1.5,
        tafsirHours: 2.2,
        socialHours: 0.6,
        totalHours: 8.1,
      },
    ],
    quizAccuracyTrendData: [
      { date: "Day 1", accuracyPct: 65, avgTimePerQuestionSec: 45, difficultyScale: 3 },
      { date: "Day 5", accuracyPct: 70, avgTimePerQuestionSec: 40, difficultyScale: 4 },
      { date: "Day 10", accuracyPct: 78, avgTimePerQuestionSec: 32, difficultyScale: 6 },
      { date: "Day 15", accuracyPct: 84, avgTimePerQuestionSec: 28, difficultyScale: 8 },
      { date: "Day 20", accuracyPct: 89, avgTimePerQuestionSec: 22, difficultyScale: 9 },
    ],
    weakAreas: [
      {
        topicId: "il",
        topicName: "Islamic Law & Fiqh",
        accuracyPct: 52,
        recommendedAction: "Complete Fiqh of Purification & Prayer Quiz Module",
      },
      {
        topicId: "sg",
        topicName: "Sacred Geography",
        accuracyPct: 58,
        recommendedAction: "Review 3D Sanctuary Map & Historical Timeline",
      },
    ],
    achievementRarityDistribution: [
      { rarity: "common", count: 120, unlockedCount: 45 },
      { rarity: "rare", count: 90, unlockedCount: 22 },
      { rarity: "epic", count: 60, unlockedCount: 12 },
      { rarity: "legendary", count: 30, unlockedCount: 3 },
    ],
    recommendations: [
      {
        title: "Target Fiqh Mastery",
        description:
          "Your Fiqh accuracy is currently 52%. Spent 15 mins daily on Taharah principles to reach 80% proficency.",
        type: "retry_weak",
        actionLabel: "Review Fiqh Module",
      },
      {
        title: "Estimated Time to Level 13",
        description:
          "At your current pace of 180 min/week, you will reach Level 13 in approximately 3 days.",
        type: "time_to_mastery",
        actionLabel: "Continue Learning",
      },
      {
        title: "Catch Up With Peers",
        description: "Tariq Ibn Ziyad is only +350 XP ahead of you in Quranic Mastery leaderboard.",
        type: "friends_catch",
        actionLabel: "View Leaderboard",
      },
    ],
  };
}

/**
 * Export CSV Utility
 */
export function exportAnalyticsCsv(summary: AnalyticsSummary): void {
  const headers = ["Metric", "Value"];
  const rows = [
    ["Total Learning Hours", summary.totalLearningHours.toString()],
    ["Total Verses Read", summary.totalVersesRead.toString()],
    ["Total Quizzes Completed", summary.totalQuizzesCompleted.toString()],
    ["Topics Mastered %", `${summary.topicsMasteredPct}%`],
    ["Current Level", summary.currentLevel.toString()],
    ["Current Streak Days", summary.currentStreakDays.toString()],
    ["Percentile Rank", `Top ${100 - summary.percentileRank}%`],
  ];

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `bayan_learning_analytics_${summary.userId}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
