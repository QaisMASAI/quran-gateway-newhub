/**
 * Gamification Engine 2.0 Core Architecture
 * World-Class Islamic Gamified Learning Platform (Duolingo/Brilliant Style)
 */

export type XpSourceCategory =
  | "knowledge" // 10-50 XP (reading, learning)
  | "mastery" // 50-200 XP (quiz completion)
  | "consistency" // 5-10 XP/day (daily streak activity)
  | "challenge" // 100-500 XP (difficult boss challenges & daily challenges)
  | "social"; // 25-75 XP (helping peers, praise, group circle)

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export type AchievementType = "skill" | "habit" | "challenge" | "social" | "discovery";

export type LearningStyle = "visual" | "kinesthetic" | "reading";

export type WorldId =
  | "quranic_mastery"
  | "hadith_sciences"
  | "islamic_law"
  | "prophet_stories"
  | "ethical_living"
  | "sacred_geography";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badge: string; // URL to SVG or SVG markup
  rarity: AchievementRarity;
  type: AchievementType;
  unlockedAt?: Date | string;
  progress: number; // 0 - 100
  prerequisite?: string; // Achievement ID required first
  storyContext?: string; // Narrative context
  rewardXp: number;
}

export interface LearningPathNode {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  unlocked: boolean;
  completed: boolean;
  scorePercent?: number;
  isBossChallenge?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  xpReward: number;
  completed: boolean;
  unlockedAt?: string;
}

export interface LearningWorld {
  id: WorldId;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  paths: {
    id: string;
    title: string;
    estimatedHours: number;
    nodes: LearningPathNode[];
  }[];
  milestones: Milestone[];
  skillTreeFeatures: {
    id: string;
    featureName: string;
    requiredMilestone: number;
    unlocked: boolean;
  }[];
  bossChallenge: {
    id: string;
    title: string;
    description: string;
    minPassingScore: number;
    xpReward: number;
  };
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  durationMinutes: number;
  xpReward: number; // 50 (easy), 100 (medium), 200 (hard)
  completed: boolean;
  claimed: boolean;
  claimedAt?: string;
  expiresAt: string; // ISO String (30 days limit for unclaimed)
  progress: number; // 0-100
}

export interface StreakMilestone {
  days: number;
  bonusXp: number;
  unlocked: boolean;
  badge: string;
}

export interface UserGameification {
  userId: string;
  totalXp: number;
  xpBreakdown: {
    knowledge: number;
    mastery: number;
    consistency: number;
    challenge: number;
    social: number;
  };
  level: number; // 1 to 100
  prestige: number; // Rank 0, 1, 2...
  topicLevels: Record<WorldId, number>; // Level 1-50 per topic
  achievements: Achievement[];
  streaks: {
    current: number;
    longest: number;
    lastCompletedDate: Date | string | null;
    streakFreezeCount: number; // Max 2 per month
    milestones: StreakMilestone[];
  };
  gems: number; // Used for streak restoration (100 gems)
  worldProgress: Record<WorldId, number>; // % complete per world (0-100)
  topicsCompleted: string[];
  leaderboardRank: number;
  earnedBadges: string[];
  dailyChallenges: DailyChallenge[];
  personalization: {
    detectedStyle: LearningStyle;
    difficultyPreference: number; // 1-10
    preferredTimeMinutes: number;
    recommendedNextPathId: string;
  };
  engagementStats: {
    totalQuizzesTaken: number;
    correctAnswersCount: number;
    totalActiveDays: number;
    praiseSentCount: number;
    praiseReceivedCount: number;
  };
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  prestige: number;
  totalXp: number;
  weeklyXp: number;
  rank: number;
  praiseCount: number;
  topTopic: string;
}

// ==========================================
// 1. CONSTANTS & WORLD DEFINITIONS
// ==========================================

export const XP_RANGES: Record<XpSourceCategory, { min: number; max: number }> = {
  knowledge: { min: 10, max: 50 },
  mastery: { min: 50, max: 200 },
  consistency: { min: 5, max: 10 },
  challenge: { min: 100, max: 500 },
  social: { min: 25, max: 75 },
};

export const LEARNING_WORLDS_CATALOG: LearningWorld[] = [
  {
    id: "quranic_mastery",
    name: "Quranic Mastery",
    nameAr: "إتقان العلوم القرآنية",
    icon: "📖",
    description: "Surah journey, tajweed rules, thematic tafsir, and textual precision.",
    paths: [
      {
        id: "qm_path_1",
        title: "Al-Fatihah & Short Surahs Foundations",
        estimatedHours: 25,
        nodes: [
          {
            id: "qm_n1",
            title: "Surah Al-Fatihah Linguistic Nuances",
            description: "In-depth study of verse structures",
            estimatedHours: 5,
            unlocked: true,
            completed: true,
            scorePercent: 95,
          },
          {
            id: "qm_n2",
            title: "Juz Amma Structural Analysis",
            description: "Short surahs context and meanings",
            estimatedHours: 8,
            unlocked: true,
            completed: false,
          },
          {
            id: "qm_n3",
            title: "Tajweed Foundations Final Quiz",
            description: "Pronunciation rules exam",
            estimatedHours: 12,
            unlocked: false,
            completed: false,
            isBossChallenge: true,
          },
        ],
      },
      {
        id: "qm_path_2",
        title: "Thematic Tafsir & Ayah Connections",
        estimatedHours: 35,
        nodes: [
          {
            id: "qm_n4",
            title: "Surah Al-Baqarah Core Decrees",
            description: "Laws, stories, and monotheism",
            estimatedHours: 15,
            unlocked: false,
            completed: false,
          },
          {
            id: "qm_n5",
            title: "Comparative Tafsir Workshop",
            description: "Analysis across 6 classical schools",
            estimatedHours: 20,
            unlocked: false,
            completed: false,
          },
        ],
      },
    ],
    milestones: [
      { id: "qm_m1", title: "Complete 10 Surahs", xpReward: 200, completed: true },
      { id: "qm_m2", title: "Master Noon Sakinah Rules", xpReward: 300, completed: false },
      { id: "qm_m3", title: "Complete Juz Amma", xpReward: 500, completed: false },
    ],
    skillTreeFeatures: [
      {
        id: "qm_sk1",
        featureName: "Word Morphology Analyzer",
        requiredMilestone: 1,
        unlocked: true,
      },
      {
        id: "qm_sk2",
        featureName: "Comparative Tafsir Mode",
        requiredMilestone: 2,
        unlocked: false,
      },
    ],
    bossChallenge: {
      id: "qm_boss",
      title: "Grand Quranic Comprehension Exam",
      description: "Test covering tajweed, contextual revelation, and cross-surah connections.",
      minPassingScore: 85,
      xpReward: 500,
    },
  },
  {
    id: "hadith_sciences",
    name: "Hadith Sciences",
    nameAr: "علوم الحديث والأسانيد",
    icon: "📜",
    description:
      "Authentic collections (Sahihayn), Sanad chain validation, and Sunnah application.",
    paths: [
      {
        id: "hs_path_1",
        title: "An-Nawawi 40 Hadith Mastery",
        estimatedHours: 20,
        nodes: [
          {
            id: "hs_n1",
            title: "Intentions & Sincerity Hadith",
            description: "Foundation of all actions in Islam",
            estimatedHours: 5,
            unlocked: true,
            completed: true,
            scorePercent: 100,
          },
          {
            id: "hs_n2",
            title: "Pillars of Islam & Ihsan",
            description: "The Hadith of Jibreel analysis",
            estimatedHours: 7,
            unlocked: true,
            completed: false,
          },
          {
            id: "hs_n3",
            title: "40 Hadith Synthesis Exam",
            description: "Full comprehension evaluation",
            estimatedHours: 8,
            unlocked: false,
            completed: false,
            isBossChallenge: true,
          },
        ],
      },
    ],
    milestones: [
      { id: "hs_m1", title: "Study 40 Hadiths", xpReward: 250, completed: false },
      { id: "hs_m2", title: "Verify 10 Isnād Chains", xpReward: 350, completed: false },
    ],
    skillTreeFeatures: [
      {
        id: "hs_sk1",
        featureName: "Sanad Interactive Graph",
        requiredMilestone: 1,
        unlocked: false,
      },
    ],
    bossChallenge: {
      id: "hs_boss",
      title: "Hadith Terminology & Isnād Certification Exam",
      description: "Evaluate narrators, authenticity grading, and matn coherence.",
      minPassingScore: 80,
      xpReward: 450,
    },
  },
  {
    id: "islamic_law",
    name: "Islamic Law & Fiqh",
    nameAr: "الفقه وأصول الأحكام",
    icon: "⚖️",
    description: "Fiqh progression, worship jurisprudence, transaction ethics, and legal maxims.",
    paths: [
      {
        id: "il_path_1",
        title: "Fiqh of Purification & Prayer",
        estimatedHours: 20,
        nodes: [
          {
            id: "il_n1",
            title: "Taharah & Ablution Essentials",
            description: "Rules of physical and ritual purity",
            estimatedHours: 6,
            unlocked: true,
            completed: true,
          },
          {
            id: "il_n2",
            title: "Salah Conditions & Arkan",
            description: "Core elements of obligatory prayers",
            estimatedHours: 8,
            unlocked: true,
            completed: false,
          },
        ],
      },
    ],
    milestones: [
      { id: "il_m1", title: "Master Prayer Jurisprudence", xpReward: 200, completed: false },
    ],
    skillTreeFeatures: [
      {
        id: "il_sk1",
        featureName: "Fiqh Legal Maxim Finder",
        requiredMilestone: 1,
        unlocked: false,
      },
    ],
    bossChallenge: {
      id: "il_boss",
      title: "Fiqh Maxims & Worship Synthesis Exam",
      description: "Apply jurisprudence rules to practical contemporary scenarios.",
      minPassingScore: 80,
      xpReward: 400,
    },
  },
  {
    id: "prophet_stories",
    name: "Prophet Stories & Seerah",
    nameAr: "قصص الأنبياء والسيرة النبوية",
    icon: "🌟",
    description: "Chronological narrative path through lives of the Prophets & Seerah.",
    paths: [
      {
        id: "ps_path_1",
        title: "Early Prophets & Monotheism",
        estimatedHours: 25,
        nodes: [
          {
            id: "ps_n1",
            title: "Adam (pbuh) & Creation Lessons",
            description: "Humility, repentence, and stewardship",
            estimatedHours: 5,
            unlocked: true,
            completed: true,
          },
          {
            id: "ps_n2",
            title: "Ibrahim (pbuh) Search for Truth",
            description: "Monotheism & trials",
            estimatedHours: 10,
            unlocked: true,
            completed: false,
          },
        ],
      },
    ],
    milestones: [
      { id: "ps_m1", title: "Explore 10 Prophet Stories", xpReward: 250, completed: false },
    ],
    skillTreeFeatures: [
      {
        id: "ps_sk1",
        featureName: "Prophetic Timeline Visualizer",
        requiredMilestone: 1,
        unlocked: true,
      },
    ],
    bossChallenge: {
      id: "ps_boss",
      title: "Chronological Prophetic History Exam",
      description: "Deep dive into prophet timelines, miracles, and covenant lessons.",
      minPassingScore: 85,
      xpReward: 450,
    },
  },
  {
    id: "ethical_living",
    name: "Ethical Living & Virtues",
    nameAr: "الأخلاق والسلوك الإيجابي",
    icon: "💚",
    description:
      "Values-based path: sincerity, patience, gratitude, family ethics, and social etiquette.",
    paths: [
      {
        id: "el_path_1",
        title: "Inward Virtues & Character Purification",
        estimatedHours: 20,
        nodes: [
          {
            id: "el_n1",
            title: "Niyyah (Intention) & Sincerity",
            description: "Purifying spiritual intent",
            estimatedHours: 5,
            unlocked: true,
            completed: true,
          },
          {
            id: "el_n2",
            title: "Sabr & Shukr Dynamics",
            description: "Patience in hardship & gratitude in ease",
            estimatedHours: 7,
            unlocked: true,
            completed: false,
          },
        ],
      },
    ],
    milestones: [
      { id: "el_m1", title: "Complete 5 Character Modules", xpReward: 200, completed: false },
    ],
    skillTreeFeatures: [
      {
        id: "el_sk1",
        featureName: "Daily Reflection Journal",
        requiredMilestone: 1,
        unlocked: true,
      },
    ],
    bossChallenge: {
      id: "el_boss",
      title: "Applied Character & Virtue Case Study",
      description: "Resolve real-life moral dilemmas using Quranic and Prophetic principles.",
      minPassingScore: 80,
      xpReward: 350,
    },
  },
  {
    id: "sacred_geography",
    name: "Sacred Geography & History",
    nameAr: "الجغرافيا والمقاديس الإسلامية",
    icon: "🕋",
    description:
      "Historical journey through Makkah, Madinah, Al-Quds, and major Islamic milestones.",
    paths: [
      {
        id: "sg_path_1",
        title: "Sanctuaries & Early Islamic Centers",
        estimatedHours: 20,
        nodes: [
          {
            id: "sg_n1",
            title: "The Sanctuary of Makkah",
            description: "Kaaba history and pilgrimage milestones",
            estimatedHours: 6,
            unlocked: true,
            completed: true,
          },
          {
            id: "sg_n2",
            title: "Madinah Munawwarah Architecture",
            description: "Masjid an-Nabawi & Treaty of Hudaybiyyah",
            estimatedHours: 8,
            unlocked: true,
            completed: false,
          },
        ],
      },
    ],
    milestones: [
      { id: "sg_m1", title: "Discover 3 Sacred Sanctuaries", xpReward: 200, completed: false },
    ],
    skillTreeFeatures: [
      {
        id: "sg_sk1",
        featureName: "3D Sanctuary Interactive Map",
        requiredMilestone: 1,
        unlocked: true,
      },
    ],
    bossChallenge: {
      id: "sg_boss",
      title: "Sacred Cartography & Historical Landmarks Exam",
      description: "Identify key historical geography and sanctuary traditions.",
      minPassingScore: 80,
      xpReward: 400,
    },
  },
];

// ==========================================
// 2. CORE ENGINE FUNCTIONS
// ==========================================

export const INITIAL_USER_GAMEIFICATION: UserGameification = {
  userId: "user_guest",
  totalXp: 1250,
  xpBreakdown: {
    knowledge: 400,
    mastery: 500,
    consistency: 150,
    challenge: 100,
    social: 100,
  },
  level: 2, // 1 level = 1,000 XP
  prestige: 0,
  topicLevels: {
    quranic_mastery: 5,
    hadith_sciences: 3,
    islamic_law: 2,
    prophet_stories: 4,
    ethical_living: 3,
    sacred_geography: 2,
  },
  achievements: [
    {
      id: "ach_first_steps",
      name: "First Steps of Knowledge",
      description: "Read 10 Quranic verses with commentary.",
      badge: "📖",
      rarity: "common",
      type: "discovery",
      unlockedAt: new Date().toISOString(),
      progress: 100,
      rewardXp: 50,
      storyContext: "Beginning your noble pursuit of divine light.",
    },
    {
      id: "ach_quiz_master_1",
      name: "Mastery Apprentice",
      description: "Achieve >80% accuracy on 5 quizzes.",
      badge: "🎯",
      rarity: "rare",
      type: "skill",
      unlockedAt: new Date().toISOString(),
      progress: 100,
      rewardXp: 150,
      prerequisite: "ach_first_steps",
      storyContext: "Refining knowledge through rigorous testing.",
    },
    {
      id: "ach_streak_7",
      name: "Steadfast Week",
      description: "Maintain a 7-day learning streak.",
      badge: "🔥",
      rarity: "epic",
      type: "habit",
      progress: 71,
      prerequisite: "ach_first_steps",
      storyContext: "Building a consistent daily habit of reflection.",
      rewardXp: 250,
    },
  ],
  streaks: {
    current: 5,
    longest: 14,
    lastCompletedDate: new Date().toISOString().split("T")[0],
    streakFreezeCount: 1,
    milestones: [
      { days: 7, bonusXp: 100, unlocked: false, badge: "🌱" },
      { days: 30, bonusXp: 250, unlocked: false, badge: "🌿" },
      { days: 100, bonusXp: 500, unlocked: false, badge: "🌳" },
      { days: 365, bonusXp: 1000, unlocked: false, badge: "👑" },
    ],
  },
  gems: 150,
  worldProgress: {
    quranic_mastery: 25,
    hadith_sciences: 15,
    islamic_law: 10,
    prophet_stories: 20,
    ethical_living: 18,
    sacred_geography: 12,
  },
  topicsCompleted: ["surah_1", "hadith_intentions"],
  leaderboardRank: 42,
  earnedBadges: ["📖", "🎯"],
  dailyChallenges: [
    {
      id: "dc_easy_1",
      title: "Daily Verse Contemplation",
      description: "Read 5 verses with tafsir commentary (5-10 min)",
      difficulty: "easy",
      durationMinutes: 5,
      xpReward: 50,
      completed: true,
      claimed: true,
      claimedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      progress: 100,
    },
    {
      id: "dc_medium_1",
      title: "Hadith Sanad & Matn Study",
      description: "Analyze 1 authentic Hadith and its chain (15-20 min)",
      difficulty: "medium",
      durationMinutes: 15,
      xpReward: 100,
      completed: false,
      claimed: false,
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      progress: 50,
    },
    {
      id: "dc_hard_1",
      title: "Comparative Tafsir Synthesis",
      description: "Complete a 10-question adaptive quiz on Surah Al-Kahf (30+ min)",
      difficulty: "hard",
      durationMinutes: 30,
      xpReward: 200,
      completed: false,
      claimed: false,
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      progress: 0,
    },
  ],
  personalization: {
    detectedStyle: "reading",
    difficultyPreference: 6,
    preferredTimeMinutes: 15,
    recommendedNextPathId: "qm_path_1",
  },
  engagementStats: {
    totalQuizzesTaken: 12,
    correctAnswersCount: 10,
    totalActiveDays: 18,
    praiseSentCount: 5,
    praiseReceivedCount: 8,
  },
};

const ENGINE_STORAGE_KEY = "bayan_gamification_v2_data";

export function loadUserGamification(): UserGameification {
  if (typeof window === "undefined") return INITIAL_USER_GAMEIFICATION;
  try {
    const raw = localStorage.getItem(ENGINE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ENGINE_STORAGE_KEY, JSON.stringify(INITIAL_USER_GAMEIFICATION));
      return INITIAL_USER_GAMEIFICATION;
    }
    const data = JSON.parse(raw) as UserGameification;
    checkStreakDecayAndMaintenance(data);
    return data;
  } catch {
    return INITIAL_USER_GAMEIFICATION;
  }
}

export function saveUserGamification(data: UserGameification): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ENGINE_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save gamification v2 data", err);
  }
}

/**
 * Maintenance logic: Streak decay rules, expired challenge cleanup
 */
export function checkStreakDecayAndMaintenance(data: UserGameification): void {
  const today = new Date().toISOString().split("T")[0];
  const lastDate = data.streaks.lastCompletedDate
    ? typeof data.streaks.lastCompletedDate === "string"
      ? data.streaks.lastCompletedDate.split("T")[0]
      : new Date(data.streaks.lastCompletedDate).toISOString().split("T")[0]
    : null;

  if (lastDate && lastDate !== today) {
    const diffDays = Math.floor(
      (new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000,
    );

    if (diffDays > 1) {
      // Missed 1 or more days
      if (data.streaks.streakFreezeCount > 0) {
        data.streaks.streakFreezeCount -= 1; // Used streak freeze protection
      } else {
        // Reset streak to 0 if not protected
        data.streaks.current = 0;
      }
    }
  }

  // Clean up expired unclaimed challenges (>30 days)
  const now = new Date().getTime();
  data.dailyChallenges.forEach((ch) => {
    if (!ch.claimed && ch.expiresAt) {
      const exp = new Date(ch.expiresAt).getTime();
      if (now > exp) {
        ch.completed = false;
        ch.progress = 0;
      }
    }
  });
}

/**
 * Calculate Level (1-100) and Prestige
 * Rule: Every 1,000 XP = 1 Level
 */
export function calculateLevelFromXp(totalXp: number): {
  level: number;
  xpInLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
  canPrestige: boolean;
} {
  const level = Math.min(100, Math.max(1, Math.floor(totalXp / 1000) + 1));
  const xpInLevel = totalXp % 1000;
  const xpNeededForNext = 1000 - xpInLevel;
  const progressPercent = Math.min(100, Math.floor((xpInLevel / 1000) * 100));

  return {
    level,
    xpInLevel,
    xpNeededForNext,
    progressPercent,
    canPrestige: level >= 100,
  };
}

/**
 * Award XP with source tracking & level calculation
 */
export function awardXpEngine(
  data: UserGameification,
  amount: number,
  category: XpSourceCategory,
  worldId?: WorldId,
): UserGameification {
  // Apply prestige multiplier (1.1x per prestige level)
  const prestigeMultiplier = 1 + data.prestige * 0.1;
  const finalXp = Math.round(amount * prestigeMultiplier);

  data.totalXp += finalXp;
  data.xpBreakdown[category] = (data.xpBreakdown[category] || 0) + finalXp;

  // Recalculate Level (1-100)
  const levelCalc = calculateLevelFromXp(data.totalXp);
  data.level = levelCalc.level;

  // Topic Level Specialization (1-50)
  if (worldId && data.topicLevels[worldId] !== undefined) {
    data.topicLevels[worldId] = Math.min(50, data.topicLevels[worldId] + 1);
  }

  // Check achievements unlock
  checkAchievementUnlocks(data);

  saveUserGamification(data);
  return data;
}

/**
 * Adaptive Difficulty Formula:
 * Performance factor = correct / total
 * Difficulty = Min(10, 1 + performance_factor * 8)
 */
export function calculateAdaptiveDifficulty(
  correctCount: number,
  totalCount: number,
): {
  performanceFactor: number;
  difficultyScale: number; // 1 to 10
  tier: "easy" | "medium" | "hard";
  recommendation: string;
} {
  const performanceFactor =
    totalCount > 0 ? Math.min(1, Math.max(0, correctCount / totalCount)) : 0.5;
  const difficultyScale = Math.min(10, Math.max(1, Math.round(1 + performanceFactor * 8)));

  let tier: "easy" | "medium" | "hard" = "medium";
  let recommendation = "Standard difficulty; maintaining consistent knowledge practice.";

  if (performanceFactor < 0.6) {
    tier = "easy";
    recommendation =
      "Accuracy < 60%: Adjusting questions with guided hints and detailed tafsir references.";
  } else if (performanceFactor > 0.8) {
    tier = "hard";
    recommendation =
      "Accuracy > 80%: Unlocking advanced challenge questions, Sanad analysis, and speed bonuses.";
  }

  return {
    performanceFactor,
    difficultyScale,
    tier,
    recommendation,
  };
}

/**
 * Personalization Engine: Detect style & recommend next path
 */
export function updatePersonalizationEngine(
  data: UserGameification,
  activityType: "text_reading" | "map_visual" | "interactive_quiz",
  timeSpentMinutes: number,
): void {
  if (activityType === "map_visual") data.personalization.detectedStyle = "visual";
  else if (activityType === "interactive_quiz") data.personalization.detectedStyle = "kinesthetic";
  else data.personalization.detectedStyle = "reading";

  data.personalization.preferredTimeMinutes = Math.round(
    (data.personalization.preferredTimeMinutes + timeSpentMinutes) / 2,
  );

  // Recommend next based on lowest world progress
  let lowestWorld: WorldId = "quranic_mastery";
  let minProgress = 100;

  (Object.keys(data.worldProgress) as WorldId[]).forEach((wId) => {
    if (data.worldProgress[wId] < minProgress) {
      minProgress = data.worldProgress[wId];
      lowestWorld = wId;
    }
  });

  const worldDef = LEARNING_WORLDS_CATALOG.find((w) => w.id === lowestWorld);
  if (worldDef && worldDef.paths.length > 0) {
    data.personalization.recommendedNextPathId = worldDef.paths[0].id;
  }
}

/**
 * Streak Restoration (pay 100 gems / XP)
 */
export function restoreStreak(data: UserGameification): {
  success: boolean;
  message: string;
} {
  if (data.gems < 100) {
    return {
      success: false,
      message: "Insufficient gems (100 required). Earn gems through daily challenge completion.",
    };
  }

  data.gems -= 100;
  data.streaks.current = Math.max(1, data.streaks.longest);
  data.streaks.lastCompletedDate = new Date().toISOString().split("T")[0];

  saveUserGamification(data);
  return {
    success: true,
    message: `Streak restored to ${data.streaks.current} days successfully!`,
  };
}

/**
 * Prestige Reset at Level 100
 */
export function executePrestigeReset(data: UserGameification): {
  success: boolean;
  message: string;
} {
  if (data.level < 100) {
    return {
      success: false,
      message: "Prestige requires reaching Level 100 (100,000 Total XP).",
    };
  }

  data.prestige += 1;
  data.level = 1;
  data.totalXp = 0; // Reset XP for prestige run
  data.earnedBadges.push(`👑 Prestige Rank ${data.prestige}`);

  saveUserGamification(data);
  return {
    success: true,
    message: `Prestige Level ${data.prestige} unlocked! You have received a permanent 1.1x XP boost multiplier.`,
  };
}

/**
 * Check prerequisite & achievement unlocks
 */
function checkAchievementUnlocks(data: UserGameification): void {
  data.achievements.forEach((ach) => {
    if (ach.progress < 100) {
      // Check prerequisite if present
      if (ach.prerequisite) {
        const prereq = data.achievements.find((a) => a.id === ach.prerequisite);
        if (!prereq || prereq.progress < 100) return; // Cannot unlock yet
      }

      // Check unlock criteria
      if (ach.id.includes("streak") && data.streaks.current >= 7) {
        ach.progress = 100;
        ach.unlockedAt = new Date().toISOString();
        if (!data.earnedBadges.includes(ach.badge)) data.earnedBadges.push(ach.badge);
      }
    }
  });
}

/**
 * Generate Mock Leaderboard Data (Global top 1,000, Weekly, Topics)
 */
export function getLeaderboardData(
  type: "global" | "weekly" | "topic",
  currentUserId: string,
): LeaderboardEntry[] {
  const mockUsers: LeaderboardEntry[] = [
    {
      userId: "usr_1",
      displayName: "Tariq Ibn Ziyad",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Tariq",
      level: 88,
      prestige: 2,
      totalXp: 88400,
      weeklyXp: 3450,
      rank: 1,
      praiseCount: 142,
      topTopic: "Quranic Mastery",
    },
    {
      userId: "usr_2",
      displayName: "Aisha Al-Fihri",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Aisha",
      level: 82,
      prestige: 1,
      totalXp: 82100,
      weeklyXp: 3100,
      rank: 2,
      praiseCount: 118,
      topTopic: "Hadith Sciences",
    },
    {
      userId: "usr_3",
      displayName: "Al-Khwarizmi",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Khwarizmi",
      level: 76,
      prestige: 1,
      totalXp: 76300,
      weeklyXp: 2890,
      rank: 3,
      praiseCount: 95,
      topTopic: "Sacred Geography",
    },
    {
      userId: "usr_4",
      displayName: "Ibn Battuta",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Battuta",
      level: 69,
      prestige: 0,
      totalXp: 69200,
      weeklyXp: 2400,
      rank: 4,
      praiseCount: 78,
      topTopic: "Prophet Stories",
    },
    {
      userId: "usr_5",
      displayName: "Fatima Al-Majriti",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Fatima",
      level: 64,
      prestige: 0,
      totalXp: 64100,
      weeklyXp: 2150,
      rank: 5,
      praiseCount: 64,
      topTopic: "Ethical Living",
    },
    {
      userId: currentUserId,
      displayName: "You (Knowledge Seeker)",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=You",
      level: 2,
      prestige: 0,
      totalXp: 1250,
      weeklyXp: 450,
      rank: 42,
      praiseCount: 12,
      topTopic: "Quranic Mastery",
    },
  ];

  if (type === "weekly") {
    return mockUsers.sort((a, b) => b.weeklyXp - a.weeklyXp);
  }

  return mockUsers.sort((a, b) => b.totalXp - a.totalXp);
}
