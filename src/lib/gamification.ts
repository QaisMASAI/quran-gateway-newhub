// Gamification Engine for Noor Al-Huda AI
// Tracks XP, Levels, Daily Streaks, Badges, and Milestones locally with Supabase sync readiness.

export interface UserStats {
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  versesReadCount: number;
  hadithsExploredCount: number;
  aiQueriesCount: number;
  badges: string[];
}

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
  },
  {
    id: "streak_3",
    nameEn: "3-Day Devotion",
    nameAr: "ثبات 3 أيام",
    nameHe: "3 ימי התמדה",
    descEn: "Maintained a 3-day continuous active streak",
    descAr: "المحافظة على 3 أيام متتالية من القراءة والتعلم",
    descHe: "שמרת על רצף פעיל של 3 ימים",
    icon: "🔥",
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
  },
  {
    id: "tafsir_student",
    nameEn: "Tafsir Student",
    nameAr: "دارس التفسير",
    nameHe: "תלמיד תפסיר",
    descEn: "Studied authentic commentary & reasons for revelation",
    descAr: "دراسة التفسير المعتمد وأسباب النزول",
    descHe: "למדת תפסיר מאומת ואסבאב א-נזול",
    icon: "BookMarked",
  },
];

const STORAGE_KEY = "noor_user_gamification_stats";

export function getGamificationStats(): UserStats {
  if (typeof window === "undefined") {
    return {
      xp: 0,
      streak: 1,
      lastActiveDate: null,
      versesReadCount: 0,
      hadithsExploredCount: 0,
      aiQueriesCount: 0,
      badges: [],
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: UserStats = {
        xp: 25, // Welcome bonus
        streak: 1,
        lastActiveDate: new Date().toISOString().split("T")[0],
        versesReadCount: 0,
        hadithsExploredCount: 0,
        aiQueriesCount: 0,
        badges: ["first_recitation"],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as UserStats;
    // Check streak reset
    const today = new Date().toISOString().split("T")[0];
    if (parsed.lastActiveDate && parsed.lastActiveDate !== today) {
      const lastDate = new Date(parsed.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        parsed.streak += 1;
        parsed.lastActiveDate = today;
        if (parsed.streak >= 3 && !parsed.badges.includes("streak_3")) {
          parsed.badges.push("streak_3");
        }
        if (parsed.streak >= 7 && !parsed.badges.includes("streak_7")) {
          parsed.badges.push("streak_7");
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } else if (diffDays > 1) {
        parsed.streak = 1;
        parsed.lastActiveDate = today;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    }
    return parsed;
  } catch {
    return {
      xp: 0,
      streak: 1,
      lastActiveDate: null,
      versesReadCount: 0,
      hadithsExploredCount: 0,
      aiQueriesCount: 0,
      badges: [],
    };
  }
}

export function awardXP(amount: number, reason?: "verse" | "hadith" | "ai" | "tafsir"): UserStats {
  if (typeof window === "undefined") return getGamificationStats();

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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
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
  if (xp < 100) {
    return {
      level: 1,
      titleAr: "طالب العلم",
      titleEn: "Knowledge Seeker",
      titleHe: "מבקש דעת",
      nextLevelXP: 100,
      progressPercent: Math.min(100, Math.floor((xp / 100) * 100)),
    };
  }
  if (xp < 300) {
    return {
      level: 2,
      titleAr: "القارئ المواظب",
      titleEn: "Consistent Reciter",
      titleHe: "קורא מתמיד",
      nextLevelXP: 300,
      progressPercent: Math.min(100, Math.floor(((xp - 100) / 200) * 100)),
    };
  }
  if (xp < 700) {
    return {
      level: 3,
      titleAr: "السالك في الأثر",
      titleEn: "Passage Explorer",
      titleHe: "הולך בנתיבי הכתוב",
      nextLevelXP: 700,
      progressPercent: Math.min(100, Math.floor(((xp - 300) / 400) * 100)),
    };
  }
  if (xp < 1500) {
    return {
      level: 4,
      titleAr: "حافظ المتون",
      titleEn: "Texts Scholar",
      titleHe: "בקיא במקורות",
      nextLevelXP: 1500,
      progressPercent: Math.min(100, Math.floor(((xp - 700) / 800) * 100)),
    };
  }
  return {
    level: 5,
    titleAr: "نور الهداية",
    titleEn: "Noor Luminary",
    titleHe: "מנורת הדרכה",
    nextLevelXP: 3000,
    progressPercent: 100,
  };
}
