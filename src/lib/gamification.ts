// Rebuilt Islamic Learning Platform Engine & Gamification System
// Supports XP, Levels, Hearts/Energy, Streaks, Spaced Repetition (SM-2), Adaptive Difficulty,
// Achievements, Leaderboards, Bookmarks, and AI Explanations.

import { QUESTION_DATABASE, type QuestionItem, type QuestionDifficulty } from "./gamification-questions";

export interface Badge {
  id: string;
  nameEn: string;
  nameAr: string;
  nameHe: string;
  descEn: string;
  descAr: string;
  descHe: string;
  icon: string;
  unlocked: boolean;
  category: "streak" | "mastery" | "modes" | "knowledge";
}

export const ALL_BADGES: Omit<Badge, "unlocked">[] = [
  {
    id: "first_recitation",
    nameEn: "First Recitation",
    nameAr: "أول تلاوة",
    nameHe: "קריאה ראשונה",
    descEn: "Read or listened to your first Quranic verse",
    descAr: "قراءة أو الاستماع لأول آية قرآنية",
    descHe: "קראת או האזנת לפסוק קוראן ראשון",
    icon: "📖",
    category: "knowledge",
  },
  {
    id: "streak_3",
    nameEn: "3-Day Devotion",
    nameAr: "ثبات 3 أيام",
    nameHe: "3 ימי התמדה",
    descEn: "Maintained a 3-day continuous learning streak",
    descAr: "المحافظة على 3 أيام متتالية من التعلم",
    descHe: "שמרת על רצף למידה של 3 ימים",
    icon: "🔥",
    category: "streak",
  },
  {
    id: "streak_7",
    nameEn: "7-Day Luminary",
    nameAr: "نور 7 أيام",
    nameHe: "מנורת 7 ימים",
    descEn: "Maintained a full 7-day learning streak",
    descAr: "المحافظة على أسبوع كامل من الذكر والتعلم",
    descHe: "שמרת על רצף למידה של 7 ימים מלאים",
    icon: "🌟",
    category: "streak",
  },
  {
    id: "hadith_explorer",
    nameEn: "Hadith Scholar",
    nameAr: "باحث الحديث",
    nameHe: "חוקר החדית'",
    descEn: "Explored authentic Prophetic Hadith collections",
    descAr: "استكشاف جوامع الحديث النبوي الشريف",
    descHe: "חקרת את אוספי החדית' המאומתים",
    icon: "📜",
    category: "mastery",
  },
  {
    id: "ai_researcher",
    nameEn: "Knowledge Seeker",
    nameAr: "طالب العلم الذكي",
    nameHe: "מבקש דעת AI",
    descEn: "Asked cited research questions to Noor AI",
    descAr: "طرح أسئلة موثقة على الباحث الذكي",
    descHe: "שאלת שאלות מחקר מאומתות את נור AI",
    icon: "Sparkles",
    category: "knowledge",
  },
  {
    id: "tafsir_student",
    nameEn: "Tafsir Student",
    nameAr: "دارس التفسير",
    nameHe: "תלמיד תפסיר",
    descEn: "Studied authentic commentary & reasons for revelation",
    descAr: "دراسة التفسير المعتمد وأسباب النزول",
    descHe: "למדת תפסיר מאומت ואסבאב א-נזול",
    icon: "BookMarked",
    category: "mastery",
  },
  {
    id: "all_modes_master",
    nameEn: "Polymath Seeker",
    nameAr: "جامع الفنون الإسلامية",
    nameHe: "בקיא בכל מצבי המשחק",
    descEn: "Completed questions across all 13 interactive game modes",
    descAr: "إكمال التحديات في جميع أنماط اللعب الـ 13",
    descHe: "השלמת שאלות בכל 13 מצבי המשחק",
    icon: "Trophy",
    category: "modes",
  },
  {
    id: "spaced_repetition_pro",
    nameEn: "Master of Revision",
    nameAr: "حافظ المراجعة",
    nameHe: "מאסטר החזרה הקצובה",
    descEn: "Reviewed 10 items using the Spaced Repetition engine",
    descAr: "مراجعة 10 أسئلة عبر محرك التكرار المتباعد",
    descHe: "חזרת על 10 פריטים במנוע החזרה במרווחים",
    icon: "RotateCcw",
    category: "mastery",
  },
];

export interface SpacedRepetitionItem {
  questionId: string;
  intervalDays: number; // SM-2 interval
  easeFactor: number; // Default 2.5
  repetitions: number;
  nextReviewDate: string; // YYYY-MM-DD
  lastScore: number; // 0 to 5
}

export interface StudyHistoryEntry {
  id: string;
  timestamp: string;
  mode: string;
  questionId: string;
  questionTitle: string;
  correct: boolean;
  xpEarned: number;
}

export interface BookmarkItem {
  id: string;
  questionId: string;
  title: string;
  citation: string;
  savedAt: string;
}

export interface UserStats {
  xp: number;
  streak: number;
  hearts: number; // Maximum 5 (Duolingo style)
  lastActiveDate: string | null;
  versesReadCount: number;
  hadithsExploredCount: number;
  aiQueriesCount: number;
  badges: string[];
  // Platform additions
  adaptiveDifficulty: QuestionDifficulty;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  dailyChallengeCompleted: boolean;
  weeklyChallengeProgress: number; // 0 to 5 tasks
  spacedRepetitionQueue: SpacedRepetitionItem[];
  studyHistory: StudyHistoryEntry[];
  bookmarks: BookmarkItem[];
  topicAccuracy: Record<string, { total: number; correct: number }>;
}

const STORAGE_KEY = "noor_user_gamification_stats";

export function getGamificationStats(): UserStats {
  if (typeof window === "undefined") {
    return createInitialStats();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialStats();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as UserStats;

    // Check streak reset & heart refill on new day
    const today = new Date().toISOString().split("T")[0];
    if (parsed.lastActiveDate && parsed.lastActiveDate !== today) {
      const lastDate = new Date(parsed.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        parsed.streak += 1;
        parsed.lastActiveDate = today;
        parsed.hearts = 5; // Refill hearts on consecutive day
        parsed.dailyChallengeCompleted = false;
        if (parsed.streak >= 3 && !parsed.badges.includes("streak_3")) {
          parsed.badges.push("streak_3");
        }
        if (parsed.streak >= 7 && !parsed.badges.includes("streak_7")) {
          parsed.badges.push("streak_7");
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } else if (diffDays > 1) {
        parsed.streak = 1;
        parsed.hearts = 5;
        parsed.lastActiveDate = today;
        parsed.dailyChallengeCompleted = false;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    }
    return parsed;
  } catch {
    return createInitialStats();
  }
}

function createInitialStats(): UserStats {
  return {
    xp: 50, // Welcome Bonus
    streak: 1,
    hearts: 5,
    lastActiveDate: typeof window !== "undefined" ? new Date().toISOString().split("T")[0] : null,
    versesReadCount: 0,
    hadithsExploredCount: 0,
    aiQueriesCount: 0,
    badges: ["first_recitation"],
    adaptiveDifficulty: "easy",
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    dailyChallengeCompleted: false,
    weeklyChallengeProgress: 1,
    spacedRepetitionQueue: [],
    studyHistory: [],
    bookmarks: [],
    topicAccuracy: {
      quran: { total: 0, correct: 0 },
      hadith: { total: 0, correct: 0 },
      prophets: { total: 0, correct: 0 },
      companions: { total: 0, correct: 0 },
      history: { total: 0, correct: 0 },
      tafsir: { total: 0, correct: 0 },
      ethics: { total: 0, correct: 0 },
    },
  };
}

export function saveStats(stats: UserStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save gamification stats", e);
  }
}

export function awardXP(amount: number, reason?: "verse" | "hadith" | "ai" | "tafsir" | "quiz"): UserStats {
  const current = getGamificationStats();
  current.xp += amount;

  if (reason === "verse") {
    current.versesReadCount += 1;
    if (!current.badges.includes("first_recitation")) {
      current.badges.push("first_recitation");
    }
  } else if (reason === "hadith") {
    current.hadithsExploredCount += 1;
    if (current.hadithsExploredCount >= 3 && !current.badges.includes("hadith_explorer")) {
      current.badges.push("hadith_explorer");
    }
  } else if (reason === "ai") {
    current.aiQueriesCount += 1;
    if (!current.badges.includes("ai_researcher")) {
      current.badges.push("ai_researcher");
    }
  } else if (reason === "tafsir") {
    if (!current.badges.includes("tafsir_student")) {
      current.badges.push("tafsir_student");
    }
  }

  saveStats(current);
  return current;
}

export function calculateLevel(xp: number): {
  level: number;
  titleAr: string;
  titleEn: string;
  titleHe: string;
  nextLevelXP: number;
  progressPercent: number;
} {
  if (xp < 150) {
    return {
      level: 1,
      titleAr: "طالب العلم (المبتدئ)",
      titleEn: "Knowledge Seeker (Novice)",
      titleHe: "מבקש דעת (מתחיל)",
      nextLevelXP: 150,
      progressPercent: Math.min(100, Math.floor((xp / 150) * 100)),
    };
  }
  if (xp < 400) {
    return {
      level: 2,
      titleAr: "الدارس الواعي",
      titleEn: "Attentive Student",
      titleHe: "תלמיד קשוב",
      nextLevelXP: 400,
      progressPercent: Math.min(100, Math.floor(((xp - 150) / 250) * 100)),
    };
  }
  if (xp < 800) {
    return {
      level: 3,
      titleAr: "الباحث في الأثر",
      titleEn: "Textual Scholar",
      titleHe: "חוקר הטקסטים",
      nextLevelXP: 800,
      progressPercent: Math.min(100, Math.floor(((xp - 400) / 400) * 100)),
    };
  }
  if (xp < 1600) {
    return {
      level: 4,
      titleAr: "حافظ العلوم",
      titleEn: "Scholar of Heritage",
      titleHe: "שומר המורשת",
      nextLevelXP: 1600,
      progressPercent: Math.min(100, Math.floor(((xp - 800) / 800) * 100)),
    };
  }
  return {
    level: 5,
    titleAr: "نور الهداية الساطع",
    titleEn: "Noor Luminary Mufti",
    titleHe: "מנורת הדרכה עליונה",
    nextLevelXP: 3200,
    progressPercent: 100,
  };
}

// SM-2 SPACED REPETITION ENGINE
export function updateSpacedRepetition(questionId: string, performanceScore: number): UserStats {
  const stats = getGamificationStats();
  const queue = [...stats.spacedRepetitionQueue];
  const idx = queue.findIndex((q) => q.questionId === questionId);

  // Score ranges 0 to 5 (0 = blackout, 5 = perfect recall)
  const qScore = Math.max(0, Math.min(5, performanceScore));

  let item: SpacedRepetitionItem;
  if (idx >= 0) {
    item = queue[idx];
  } else {
    item = {
      questionId,
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: new Date().toISOString().split("T")[0],
      lastScore: qScore,
    };
  }

  if (qScore >= 3) {
    if (item.repetitions === 0) {
      item.intervalDays = 1;
    } else if (item.repetitions === 1) {
      item.intervalDays = 6;
    } else {
      item.intervalDays = Math.round(item.intervalDays * item.easeFactor);
    }
    item.repetitions += 1;
  } else {
    item.repetitions = 0;
    item.intervalDays = 1;
  }

  // SM-2 Ease Factor formula
  item.easeFactor = Math.max(1.3, item.easeFactor + (0.1 - (5 - qScore) * (0.08 + (5 - qScore) * 0.02)));
  item.lastScore = qScore;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + item.intervalDays);
  item.nextReviewDate = nextDate.toISOString().split("T")[0];

  if (idx >= 0) {
    queue[idx] = item;
  } else {
    queue.push(item);
  }

  stats.spacedRepetitionQueue = queue;
  if (queue.length >= 10 && !stats.badges.includes("spaced_repetition_pro")) {
    stats.badges.push("spaced_repetition_pro");
  }

  saveStats(stats);
  return stats;
}

// ADAPTIVE DIFFICULTY ENGINE
export function updateAdaptiveDifficulty(
  questionCategory: string,
  isCorrect: boolean,
  xpAwarded: number,
  questionId: string,
  questionTitle: string,
  mode: string,
): UserStats {
  const stats = getGamificationStats();

  stats.totalQuestionsAnswered += 1;
  if (isCorrect) {
    stats.totalCorrect += 1;
    stats.xp += xpAwarded;
  } else {
    // Duolingo style heart loss
    stats.hearts = Math.max(0, stats.hearts - 1);
  }

  // Update topic accuracy
  if (!stats.topicAccuracy[questionCategory]) {
    stats.topicAccuracy[questionCategory] = { total: 0, correct: 0 };
  }
  stats.topicAccuracy[questionCategory].total += 1;
  if (isCorrect) stats.topicAccuracy[questionCategory].correct += 1;

  // Calculate recent accuracy rate for adaptive shift
  const overallAccuracy = stats.totalCorrect / Math.max(1, stats.totalQuestionsAnswered);
  if (stats.totalQuestionsAnswered >= 5) {
    if (overallAccuracy > 0.85) stats.adaptiveDifficulty = "scholar";
    else if (overallAccuracy > 0.7) stats.adaptiveDifficulty = "hard";
    else if (overallAccuracy > 0.5) stats.adaptiveDifficulty = "medium";
    else stats.adaptiveDifficulty = "easy";
  }

  // Add to study history
  const historyEntry: StudyHistoryEntry = {
    id: `hist_${Date.now()}`,
    timestamp: new Date().toISOString(),
    mode,
    questionId,
    questionTitle,
    correct: isCorrect,
    xpEarned: isCorrect ? xpAwarded : 0,
  };
  stats.studyHistory = [historyEntry, ...stats.studyHistory.slice(0, 49)]; // keep 50

  // Update SM-2 queue
  updateSpacedRepetition(questionId, isCorrect ? 5 : 1);

  saveStats(stats);
  return stats;
}

export function refillHearts(): UserStats {
  const stats = getGamificationStats();
  stats.hearts = 5;
  saveStats(stats);
  return stats;
}

export function toggleBookmark(question: QuestionItem): { stats: UserStats; bookmarked: boolean } {
  const stats = getGamificationStats();
  const existingIdx = stats.bookmarks.findIndex((b) => b.questionId === question.id);
  let bookmarked = false;

  if (existingIdx >= 0) {
    stats.bookmarks.splice(existingIdx, 1);
    bookmarked = false;
  } else {
    stats.bookmarks.push({
      id: `bm_${question.id}`,
      questionId: question.id,
      title: question.titleEn,
      citation: question.citation,
      savedAt: new Date().toISOString(),
    });
    bookmarked = true;
  }

  saveStats(stats);
  return { stats, bookmarked };
}

export function getLearningRecommendations(stats: UserStats): {
  recommendedTopic: string;
  reasonAr: string;
  reasonEn: string;
  reasonHe: string;
} {
  // Identify lowest accuracy topic
  let lowestCategory = "quran";
  let minAccuracy = 1.0;

  Object.entries(stats.topicAccuracy).forEach(([cat, data]) => {
    if (data.total >= 2) {
      const acc = data.correct / data.total;
      if (acc < minAccuracy) {
        minAccuracy = acc;
        lowestCategory = cat;
      }
    }
  });

  const categoryNames: Record<string, { ar: string; en: string; he: string }> = {
    quran: { ar: "علوم القرآن وسوره", en: "Quranic Sciences & Surahs", he: "מדעי הקוראן והסורות" },
    hadith: {
      ar: "الحديث النبوي الشريف",
      en: "Authentic Prophetic Hadiths",
      he: "חדית'ים מאומתים",
    },
    prophets: {
      ar: "قصص الأنبياء والمرسلين",
      en: "Lives of the Prophets",
      he: "סיפורי נביאי הקוראן",
    },
    companions: { ar: "سير الصحابة الكرام", en: "Generations of the Sahabah", he: "סיפורי הסחאבה" },
    history: {
      ar: "التأريخ والتاريخ الإسلامي",
      en: "Islamic Historical Chronology",
      he: "כרונולוגיה אסלאמית",
    },
    tafsir: {
      ar: "التفسير وأسباب النزول",
      en: "Tafsir & Occasions of Revelation",
      he: "תפסיר ואסבאב א-נזול",
    },
    ethics: {
      ar: "الأخلاق والمفاهيم الإسلامية",
      en: "Islamic Ethics & Virtues",
      he: "מוסר ומושגי יסוד",
    },
  };

  const name = categoryNames[lowestCategory] || categoryNames.quran;

  return {
    recommendedTopic: lowestCategory,
    reasonAr: `بناءً على نسبة إجاباتك، يوصي المحرك الذكي بالتركيز على ${name.ar} لرفع مستوى الإتقان.`,
    reasonEn: `Based on your recent accuracy, Noor AI recommends revising ${name.en} to boost your mastery.`,
    reasonHe: `בהתבסס על אחוז הדיוק שלך, מומלץ לחזור על ${name.he} כדי להעלות את הדירוג שלך.`,
  };
}
