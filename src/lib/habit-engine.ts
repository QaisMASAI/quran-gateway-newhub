// Habit-Forming Educational Engine & Goal System for Noor Al Quran
// Manages Streaks, Reading Goals, Research Goals, Reminders, Knowledge Milestones, Certificates, and Learning Stats.

export interface DailyGoal {
  type: "reading" | "research";
  targetCount: number; // e.g. 10 ayahs or 3 research queries
  currentCount: number;
  completed: boolean;
}

export interface HabitGoals {
  dailyAyahTarget: number; // default 10
  dailyAyahsRead: number;
  dailyResearchTarget: number; // default 3
  dailyResearchDone: number;
  weeklyGoalDays: number; // e.g. 5 days / week
  lastUpdatedDate: string; // YYYY-MM-DD
}

export interface ReadingReminder {
  id: string;
  titleEn: string;
  titleAr: string;
  titleHe: string;
  time: string; // e.g. "07:00"
  enabled: boolean;
  days: ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[];
  type: "quran" | "tafsir" | "hadith" | "kahf";
}

export interface KnowledgeMilestone {
  id: string;
  titleEn: string;
  titleAr: string;
  titleHe: string;
  descEn: string;
  descAr: string;
  descHe: string;
  category: "quran" | "hadith" | "tafsir" | "streak" | "journey";
  targetCount: number;
  currentCount: number;
  completed: boolean;
  xpReward: number;
  claimed: boolean;
}

export interface CompletionCertificate {
  id: string;
  journeyId: string;
  journeyTitleEn: string;
  journeyTitleAr: string;
  journeyTitleHe: string;
  userName: string;
  completedAt: string;
  verificationCode: string;
  grade?: string;
}

export interface HabitUserData {
  streak: number;
  streakFreezeCount: number;
  lastActiveDate: string | null;
  activeDates: string[]; // YYYY-MM-DD list for calendar view
  goals: HabitGoals;
  reminders: ReadingReminder[];
  milestones: KnowledgeMilestone[];
  certificates: CompletionCertificate[];
  totalMinutesLearned: number;
  weeklyActivity: Record<string, number>; // YYYY-MM-DD -> ayahs/queries count
}

const STORAGE_KEY = "noor_habit_engine_data_v2";

const DEFAULT_REMAINDERS: ReadingReminder[] = [
  {
    id: "rem_morning_quran",
    titleEn: "Morning Quran Recitation",
    titleAr: "ورد القرآن الصباحي",
    titleHe: "קריאת קוראן בבוקר",
    time: "06:30",
    enabled: true,
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    type: "quran",
  },
  {
    id: "rem_evening_tafsir",
    titleEn: "Evening Tafsir & Reflection",
    titleAr: "تأملات التفسير المسائي",
    titleHe: "תפסיר והרהור ערב",
    time: "20:00",
    enabled: true,
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    type: "tafsir",
  },
  {
    id: "rem_friday_kahf",
    titleEn: "Friday Surah Al-Kahf",
    titleAr: "سورة الكهف يوم الجمعة",
    titleHe: "סורת אל-כהף ביום שישי",
    time: "09:00",
    enabled: true,
    days: ["Fri"],
    type: "kahf",
  },
];

const DEFAULT_MILESTONES: KnowledgeMilestone[] = [
  {
    id: "ms_first_10_ayahs",
    titleEn: "First 10 Ayahs Completed",
    titleAr: "إكمال أول 10 آيات",
    titleHe: "10 פסוקים ראשונים",
    descEn: "Read and contemplated 10 Quranic verses",
    descAr: "قراءة وتدبر 10 آيات قرآنية كريمات",
    descHe: "קראת והרהרת ב-10 פסוקים",
    category: "quran",
    targetCount: 10,
    currentCount: 0,
    completed: false,
    xpReward: 50,
    claimed: false,
  },
  {
    id: "ms_50_ayahs",
    titleEn: "Quran Explorer (50 Ayahs)",
    titleAr: "مستكشف القرآن (50 آية)",
    titleHe: "חוקר הקוראן (50 פסוקים)",
    descEn: "Read 50 Quranic verses across surahs",
    descAr: "قراءة 50 آية قرآنية عبر مختلف السور",
    descHe: "קראת 50 פסוקי קוראן",
    category: "quran",
    targetCount: 50,
    currentCount: 0,
    completed: false,
    xpReward: 150,
    claimed: false,
  },
  {
    id: "ms_5_hadiths",
    titleEn: "Hadith Scholar Apprentice",
    titleAr: "طالب علم الحديث (5 أحاديث)",
    titleHe: "מתחיל חקר החדית' (5 חדית'ים)",
    descEn: "Studied 5 authentic Prophetic traditions",
    descAr: "دراسة وتدبر 5 أحاديث نبوية شريفة",
    descHe: "למדת 5 חדית'ים מאומתים",
    category: "hadith",
    targetCount: 5,
    currentCount: 0,
    completed: false,
    xpReward: 100,
    claimed: false,
  },
  {
    id: "ms_7day_streak",
    titleEn: "7-Day Devotion Milestone",
    titleAr: "إنجاز 7 أيام متواصلة",
    titleHe: "7 ימי התמדה ברציפות",
    descEn: "Maintained an unbroken 7-day learning streak",
    descAr: "المحافظة على سلسلة تعلم لمدة 7 أيام متتالية",
    descHe: "שמרת על רצף למידה של 7 ימים",
    category: "streak",
    targetCount: 7,
    currentCount: 0,
    completed: false,
    xpReward: 200,
    claimed: false,
  },
  {
    id: "ms_research_10",
    titleEn: "Academic Researcher (10 Queries)",
    titleAr: "باحث أكاديمي (10 أبحاث)",
    titleHe: "חוקר אקדמי (10 שאילתות)",
    descEn: "Executed 10 verified research queries with Noor AI",
    descAr: "إجراء 10 استعلامات بحثية موثقة",
    descHe: "ביצעת 10 שאילתות מחקר מאומתות",
    category: "tafsir",
    targetCount: 10,
    currentCount: 0,
    completed: false,
    xpReward: 150,
    claimed: false,
  },
  {
    id: "ms_journey_1",
    titleEn: "First Learning Journey Graduate",
    titleAr: "خريج أول مسار تعليمي",
    titleHe: "בוגר מסלול למידה ראשון",
    descEn: "Fully completed a guided Islamic knowledge journey",
    descAr: "إكمال مسار معرفي إسلامي موجه بالكامل",
    descHe: "השלמת מסלול למידה שלם",
    category: "journey",
    targetCount: 1,
    currentCount: 0,
    completed: false,
    xpReward: 300,
    claimed: false,
  },
];

export function getHabitData(): HabitUserData {
  if (typeof window === "undefined") return createInitialHabitData();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialHabitData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const data = JSON.parse(raw) as HabitUserData;

    // Reset daily goal counts if new day
    const today = new Date().toISOString().split("T")[0];
    if (data.goals.lastUpdatedDate !== today) {
      data.goals.dailyAyahsRead = 0;
      data.goals.dailyResearchDone = 0;
      data.goals.lastUpdatedDate = today;
      saveHabitData(data);
    }

    return data;
  } catch {
    return createInitialHabitData();
  }
}

function createInitialHabitData(): HabitUserData {
  const today = typeof window !== "undefined" ? new Date().toISOString().split("T")[0] : "";
  return {
    streak: 1,
    streakFreezeCount: 1,
    lastActiveDate: today,
    activeDates: today ? [today] : [],
    goals: {
      dailyAyahTarget: 10,
      dailyAyahsRead: 0,
      dailyResearchTarget: 3,
      dailyResearchDone: 0,
      weeklyGoalDays: 5,
      lastUpdatedDate: today,
    },
    reminders: DEFAULT_REMAINDERS,
    milestones: DEFAULT_MILESTONES,
    certificates: [],
    totalMinutesLearned: 45,
    weeklyActivity: {},
  };
}

export function saveHabitData(data: HabitUserData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save habit data", e);
  }
}

export function logAyahReadProgress(count: number = 1): HabitUserData {
  const data = getHabitData();
  const today = new Date().toISOString().split("T")[0];

  data.goals.dailyAyahsRead += count;
  data.totalMinutesLearned += Math.max(1, Math.round(count * 1.5));

  if (!data.activeDates.includes(today)) {
    data.activeDates.push(today);
  }

  // Update weekly activity
  data.weeklyActivity[today] = (data.weeklyActivity[today] || 0) + count;

  // Check Quran milestones
  data.milestones.forEach((m) => {
    if (m.category === "quran") {
      m.currentCount += count;
      if (m.currentCount >= m.targetCount) {
        m.completed = true;
      }
    }
  });

  saveHabitData(data);
  return data;
}

export function logResearchQuery(): HabitUserData {
  const data = getHabitData();
  const today = new Date().toISOString().split("T")[0];

  data.goals.dailyResearchDone += 1;
  data.totalMinutesLearned += 3;

  if (!data.activeDates.includes(today)) {
    data.activeDates.push(today);
  }

  // Check research milestones
  data.milestones.forEach((m) => {
    if (m.id === "ms_research_10") {
      m.currentCount += 1;
      if (m.currentCount >= m.targetCount) {
        m.completed = true;
      }
    }
  });

  saveHabitData(data);
  return data;
}

export function updateGoals(dailyAyahTarget: number, dailyResearchTarget: number): HabitUserData {
  const data = getHabitData();
  data.goals.dailyAyahTarget = Math.max(1, dailyAyahTarget);
  data.goals.dailyResearchTarget = Math.max(1, dailyResearchTarget);
  saveHabitData(data);
  return data;
}

export function toggleReminder(reminderId: string): HabitUserData {
  const data = getHabitData();
  data.reminders = data.reminders.map((r) =>
    r.id === reminderId ? { ...r, enabled: !r.enabled } : r,
  );
  saveHabitData(data);
  return data;
}

export function claimMilestoneReward(milestoneId: string): { data: HabitUserData; xpAwarded: number } {
  const data = getHabitData();
  let xpAwarded = 0;

  data.milestones = data.milestones.map((m) => {
    if (m.id === milestoneId && m.completed && !m.claimed) {
      xpAwarded = m.xpReward;
      return { ...m, claimed: true };
    }
    return m;
  });

  saveHabitData(data);
  return { data, xpAwarded };
}

export function generateCertificate(
  journeyId: string,
  journeyTitleEn: string,
  journeyTitleAr: string,
  journeyTitleHe: string,
  userName: string = "Learner of Knowledge",
): CompletionCertificate {
  const data = getHabitData();
  const existing = data.certificates.find((c) => c.journeyId === journeyId);
  if (existing) return existing;

  const newCert: CompletionCertificate = {
    id: `cert_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    journeyId,
    journeyTitleEn,
    journeyTitleAr,
    journeyTitleHe,
    userName,
    completedAt: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    verificationCode: `NOOR-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
    grade: "Distinction (Mumtaz)",
  };

  data.certificates.push(newCert);

  // Update journey milestone
  data.milestones.forEach((m) => {
    if (m.category === "journey") {
      m.currentCount += 1;
      if (m.currentCount >= m.targetCount) {
        m.completed = true;
      }
    }
  });

  saveHabitData(data);
  return newCert;
}
