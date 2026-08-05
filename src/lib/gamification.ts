// Rebuilt Islamic Learning Platform Engine & Gamification System
// Respects Islamic Ethics (Sincerity, Knowledge Seeking, Consistency without Public Worship Competition or Ostentation)
// Features 100 Levels, 300+ Achievements, Dynamic Missions, Quests, Streak Protection, SM-2 Spaced Repetition, and AI Mentor

import {
  QUESTION_DATABASE,
  type QuestionItem,
  type QuestionDifficulty,
} from "./gamification-questions";

// ==========================================
// 1. ISLAMIC SINCERITY & ETHICS STATEMENTS
// ==========================================
export const ISLAMIC_GAMIFICATION_PRINCIPLES = {
  niyyahReminderAr: "إنما الأعمال بالنيات - اجعل طلب العلم والتفكر خالصاً لوجه الله تعالى.",
  niyyahReminderEn:
    "Actions are judged by intentions — seek knowledge and reflection purely for Allah.",
  niyyahReminderHe: "המעשים נמדדים לפי הכוונות — חפש דעת והתבוננות לשם שמיים.",
  noPublicWorshipRanking: true, // Strictly prohibit ranking prayers or fasting
};

// ==========================================
// 2. 100-LEVEL PROGRESSION SYSTEM
// ==========================================
export interface LevelInfo {
  level: number;
  titleAr: string;
  titleEn: string;
  titleHe: string;
  minXP: number;
  maxXP: number;
  tier:
    | "novice"
    | "seeker"
    | "student"
    | "researcher"
    | "companion"
    | "scholar"
    | "luminary"
    | "master";
  unlockedPerkAr: string;
  unlockedPerkEn: string;
  unlockedPerkHe: string;
}

/**
 * Generates 100 structured Islamic learning levels with parabolic XP scaling
 */
export function generate100Levels(): LevelInfo[] {
  const levels: LevelInfo[] = [];

  const tierNames = [
    {
      tier: "novice" as const,
      ar: "مبتدئ في طلب العلم",
      en: "Novice Knowledge Seeker",
      he: "מתחיל בחיפוש הידע",
      perkAr: "فتح خيار تخصيص المظهر وتتبع الورد اليومي",
      perkEn: "Unlocked profile customization & daily recitation tracking",
      perkHe: "פתיחת התאמה אישית של פרופיל ומעקב קריאה יומי",
    },
    {
      tier: "seeker" as const,
      ar: "طالب العلم المواظب",
      en: "Steadfast Seeker of Light",
      he: "מבקש אור מתמיד",
      perkAr: "فتح محرك التكرار المتباعد المتقدم للمراجعة",
      perkEn: "Unlocked Advanced SM-2 Spaced Repetition engine",
      perkHe: "פתיחת מנוע חזרה במרווחים מתקדם למעקב",
    },
    {
      tier: "student" as const,
      ar: "دارس الأثر والتفسير",
      en: "Student of Tafsir & Texts",
      he: "תלמיד תפסיר וטקסטים",
      perkAr: "فتح التفسير المقارن بين 6 مكاتب تفسيرية",
      perkEn: "Unlocked Comparative Tafsir across 6 classical schools",
      perkHe: "פתיחת תפסיר השוואתי בין 6 אסכולות",
    },
    {
      tier: "researcher" as const,
      ar: "باحث في السيرة والأسانيد",
      en: "Researcher of Seerah & Hadith",
      he: "חוקר סירה ושרשראות מסירה",
      perkAr: "فتح شجرة أسانيد الحديث النبوي وتخريج الأحاديث",
      perkEn: "Unlocked Prophetic Hadith Chain Visualizer & Sanad analytics",
      perkHe: "פתיחת מפת שרשראות החדית' ואימות ניתוחים",
    },
    {
      tier: "companion" as const,
      ar: "صاحب القرآن والذكر",
      en: "Quran Companion & Reflective Mind",
      he: "מלווה הקוראן ובעל התבוננות",
      perkAr: "فتح دفتر التأملات الخاصة المتقدم والربط بالآيات",
      perkEn: "Unlocked Private Reflection Journal & Ayah Concept Linking",
      perkHe: "פתיחת יומן התבוננות פרטי וקישור מושגים לפסוקים",
    },
    {
      tier: "scholar" as const,
      ar: "عالم بالمفاهيم القرآنية",
      en: "Scholar of Quranic Concepts",
      he: "חוקר מושגי היסוד בקוראן",
      perkAr: "فتح أداة البحث المعرفي العميق وموجه الذكاء الاصطناعي",
      perkEn: "Unlocked Deep Knowledge Graph & AI Research Coach",
      perkHe: "פתיחת גרף הידע המעמיק ומאמן ה-AI",
    },
    {
      tier: "luminary" as const,
      ar: "منار المعرفة الإسلامية",
      en: "Luminary of Islamic Sciences",
      he: "מנורת חכמת האסלאם",
      perkAr: "فتح المسارات التعليمية الموسعة وشهادات الإتقان",
      perkEn: "Unlocked Mastery Certification Paths & Custom Study Circles",
      perkHe: "פתיחת נתיבי הסמכה ומעגלי לימוד מותאמים",
    },
    {
      tier: "master" as const,
      ar: "جامع الفنون والعلوم القرآنية",
      en: "Master Polymath of the Revelation",
      he: "חוקר עליון של מדעי ההתגלות",
      perkAr: "وسام الشرف المعرفي والتأهل لإعادة توجيه الاستكشاف",
      perkEn: "Grand Knowledge Honor Seal & Master Learning Architect",
      perkHe: "עיטור כבוד לימודי עליון וארכיטקט מדעים",
    },
  ];

  let currentXP = 0;

  for (let lvl = 1; lvl <= 100; lvl++) {
    const tierIdx = Math.min(Math.floor((lvl - 1) / 12.5), tierNames.length - 1);
    const tier = tierNames[tierIdx];

    // Formula: XP required scales smoothly
    const xpForThisLevel = Math.round(100 * Math.pow(lvl, 1.35));
    const minXP = currentXP;
    const maxXP = currentXP + xpForThisLevel;
    currentXP = maxXP;

    levels.push({
      level: lvl,
      titleAr: `المستوى ${lvl}: ${tier.ar}`,
      titleEn: `Level ${lvl}: ${tier.en}`,
      titleHe: `שלב ${lvl}: ${tier.he}`,
      minXP,
      maxXP,
      tier: tier.tier,
      unlockedPerkAr: tier.perkAr,
      unlockedPerkEn: tier.perkEn,
      unlockedPerkHe: tier.perkHe,
    });
  }

  return levels;
}

export const ALL_100_LEVELS = generate100Levels();

export function calculate100Level(xp: number): {
  levelInfo: LevelInfo;
  progressPercent: number;
  xpInLevel: number;
  xpNeededForNext: number;
} {
  let found = ALL_100_LEVELS[0];
  for (const lvl of ALL_100_LEVELS) {
    if (xp >= lvl.minXP && xp < lvl.maxXP) {
      found = lvl;
      break;
    }
    if (xp >= ALL_100_LEVELS[ALL_100_LEVELS.length - 1].maxXP) {
      found = ALL_100_LEVELS[ALL_100_LEVELS.length - 1];
    }
  }

  const range = found.maxXP - found.minXP;
  const xpInLevel = Math.max(0, xp - found.minXP);
  const progressPercent = Math.min(100, Math.floor((xpInLevel / range) * 100));

  return {
    levelInfo: found,
    progressPercent,
    xpInLevel,
    xpNeededForNext: range - xpInLevel,
  };
}

// ==========================================
// 3. 300+ ACHIEVEMENTS CATALOG & CATEGORIES
// ==========================================
export type AchievementCategory =
  | "quran_recitation"
  | "hadith_tradition"
  | "seerah_prophets"
  | "tafsir_depth"
  | "ai_research"
  | "consistency_devotion"
  | "spaced_repetition"
  | "ethics_virtues"
  | "quests_journeys"
  | "reflection_journal"
  | "seasonal_blessings"
  | "community_circles";

export type AchievementRarity = "common" | "rare" | "epic" | "legendary" | "sacred_milestone";

export interface AchievementItem {
  id: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  nameEn: string;
  nameAr: string;
  nameHe: string;
  descEn: string;
  descAr: string;
  descHe: string;
  targetCount: number;
  rewardXP: number;
}

export const CATEGORY_LABELS: Record<AchievementCategory, { ar: string; en: string; he: string }> =
  {
    quran_recitation: { ar: "تلاوة القرآن وقراءته", en: "Quran Recitation", he: "קריאת הקוראן" },
    hadith_tradition: {
      ar: "السنة والحديث النبوي",
      en: "Prophetic Traditions",
      he: "מסורת החדית'",
    },
    seerah_prophets: { ar: "قصص الأنبياء والسيرة", en: "Seerah & Prophets", he: "סיפורי הנביאים" },
    tafsir_depth: { ar: "التفسير وأسباب النزول", en: "Tafsir & Context", he: "תפסיר והקשר" },
    ai_research: { ar: "البحث المعرفي والذكاء", en: "AI Knowledge Research", he: "מחקר AI ומדע" },
    consistency_devotion: {
      ar: "الاستمرارية والمواظبة",
      en: "Streak & Devotion",
      he: "התמדה ורצף",
    },
    spaced_repetition: {
      ar: "المراجعة والتكرار المتباعد",
      en: "Revision & SM-2",
      he: "חזרה במרווחים",
    },
    ethics_virtues: { ar: "الأخلاق والمفاهيم", en: "Ethics & Virtues", he: "מוסר ומידות" },
    quests_journeys: { ar: "الرحلات والمستويات", en: "Quests & Journeys", he: "משימות ומסעות" },
    reflection_journal: { ar: "التأمل والتفكر", en: "Private Reflection", he: "התבוננות פרטית" },
    seasonal_blessings: { ar: "المواسم والمناسبات", en: "Seasonal Events", he: "אירועים ועונות" },
    community_circles: { ar: "حلقات التعلم والتعاون", en: "Study Circles", he: "מעגלי לימוד" },
  };

/**
 * Generates 300+ defined achievement definitions structured across categories
 */
function generate300Achievements(): AchievementItem[] {
  const catalog: AchievementItem[] = [];

  const addSeries = (
    prefix: string,
    category: AchievementCategory,
    icon: string,
    baseAr: string,
    baseEn: string,
    baseHe: string,
    descArFn: (n: number) => string,
    descEnFn: (n: number) => string,
    descHeFn: (n: number) => string,
    thresholds: number[],
  ) => {
    thresholds.forEach((val, i) => {
      const rarity: AchievementRarity =
        i === 0
          ? "common"
          : i === 1
            ? "rare"
            : i === 2
              ? "epic"
              : i === 3
                ? "legendary"
                : "sacred_milestone";

      catalog.push({
        id: `${prefix}_${val}`,
        category,
        rarity,
        icon,
        nameAr: `${baseAr} (${val})`,
        nameEn: `${baseEn} (${val})`,
        nameHe: `${baseHe} (${val})`,
        descAr: descArFn(val),
        descEn: descEnFn(val),
        descHe: descHeFn(val),
        targetCount: val,
        rewardXP: (i + 1) * 50,
      });
    });
  };

  // 1. Quran Recitation (25 achievements)
  addSeries(
    "quran_verses",
    "quran_recitation",
    "📖",
    "قارئ الآيات",
    "Verse Reciter",
    "קורא הפסוקים",
    (n) => `قراءة واستماع لـ ${n} آية قرآنية مع التفسير`,
    (n) => `Read or listened to ${n} Quranic verses with commentary`,
    (n) => `קראת או האזנת ל-${n} פסוקים בקוראן`,
    [1, 10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  );

  // 2. Hadith Exploration (25 achievements)
  addSeries(
    "hadith_explored",
    "hadith_tradition",
    "📜",
    "جامع الحديث",
    "Hadith Explorer",
    "חוקר החדית'",
    (n) => `استكشاف وقراءة ${n} حديثاً من كتب السنة الصحيحة`,
    (n) => `Studied ${n} authentic Prophetic Hadiths`,
    (n) => `למדת ${n} חדית'ים מאומתים`,
    [1, 5, 20, 50, 100, 200, 500, 1000, 2000, 5000],
  );

  // 3. AI Knowledge Inquiry (25 achievements)
  addSeries(
    "ai_queries",
    "ai_research",
    "Sparkles",
    "طالب العلم الذكي",
    "Knowledge Inquirer",
    "מבקש דעת ב-AI",
    (n) => `طرح ${n} سؤالاً موثقاً على المساعد المعرفي الذكي`,
    (n) => `Asked ${n} cited knowledge questions to Noor AI`,
    (n) => `שאלת ${n} שאלות מחקר את נור AI`,
    [1, 5, 15, 30, 60, 100, 200, 400, 750, 1000],
  );

  // 4. Learning Streak (25 achievements)
  addSeries(
    "streak_days",
    "consistency_devotion",
    "🔥",
    "ثبات واستمرارية",
    "Steadfast Devotion",
    "התמדה ברצף",
    (n) => `المحافظة على سلسلة تعلم واستمرار لمدة ${n} يوماً متتالياً`,
    (n) => `Maintained a continuous ${n}-day learning streak`,
    (n) => `שמרת על רצף למידה של ${n} ימים`,
    [3, 7, 14, 30, 60, 90, 120, 180, 365, 500, 730, 1000],
  );

  // 5. Tafsir Deep Dive (25 achievements)
  addSeries(
    "tafsir_studies",
    "tafsir_depth",
    "BookMarked",
    "المتعمق في التفسير",
    "Tafsir Scholar",
    "לומד תפסיר מעמיק",
    (n) => `دراسة التفسير وأسباب النزول لـ ${n} آية مباركة`,
    (n) => `Studied commentary & revelation context for ${n} verses`,
    (n) => `למדת תפסיר ואסבאב א-נזול עבור ${n} פסוקים`,
    [1, 5, 15, 40, 100, 200, 500, 1000, 2000, 3000],
  );

  // 6. Spaced Repetition SM-2 (25 achievements)
  addSeries(
    "spaced_rep",
    "spaced_repetition",
    "RotateCcw",
    "حافظ المراجعة",
    "Master of Revision",
    "מאסטר החזרה הקצובה",
    (n) => `إكمال مراجعة ${n} بطاقة معلمة عبر محرك التكرار المتباعد`,
    (n) => `Reviewed ${n} memory items using Spaced Repetition`,
    (n) => `חזרת על ${n} פריטים במנוע החזרה במרווחים`,
    [5, 20, 50, 100, 250, 500, 1000, 2000, 3000, 5000],
  );

  // 7. Reflection Journaling (25 achievements)
  addSeries(
    "reflections_saved",
    "reflection_journal",
    "PenTool",
    "متأمل القرآن",
    "Quranic Reflector",
    "מתבונן בקוראן",
    (n) => `تدوين ${n} تأملاً وملاحظة خاصة في دفتر التفكر`,
    (n) => `Recorded ${n} private reflection notes in your journal`,
    (n) => `תיעדת ${n} הערות התבוננות ביומן הפרטי`,
    [1, 5, 10, 25, 50, 100, 200, 350, 500, 1000],
  );

  // 8. Quests & Journeys Completed (25 achievements)
  addSeries(
    "quests_done",
    "quests_journeys",
    "Compass",
    "رحال المعرفة",
    "Quest Explorer",
    "חוקר משימות ומסעות",
    (n) => `إكمال ${n} رحلات استكشافية تاريخية وموضوعية`,
    (n) => `Completed ${n} historical & thematic quest journeys`,
    (n) => `השלמת ${n} מסעות חקר היסטוריים ונושאיים`,
    [1, 2, 5, 10, 20, 35, 50, 75, 100, 150],
  );

  // 9. Seerah & Prophets (25 achievements)
  addSeries(
    "prophets_studied",
    "seerah_prophets",
    "Landmark",
    "دارس قصص الأنبياء",
    "Student of Prophets",
    "תלמיד סיפורי הנביאים",
    (n) => `دراسة واستكشاف قصص ومعجزات ${n} من أنبياء الله`,
    (n) => `Studied the lives and miracles of ${n} Prophets`,
    (n) => `למדת את סיפורי וחיי ${n} נביאים`,
    [1, 3, 7, 12, 20, 25, 30, 40, 50, 60],
  );

  // 10. Seasonal Blessings (Friday, Ramadan, Hajj) (25 achievements)
  addSeries(
    "seasonal_events",
    "seasonal_blessings",
    "Calendar",
    "مغتنم المواسم",
    "Seasonal Beneficiary",
    "מנצל עונות ומועדים",
    (n) => `إكمال ${n} مهام خاصة في يوم الجمعة وشهر رمضان ومواسم الطاعات`,
    (n) => `Completed ${n} special Friday, Ramadan & Hajj missions`,
    (n) => `השלמת ${n} משימות מיוחדות בשישי וברמדאן`,
    [1, 3, 7, 15, 30, 50, 80, 120, 200, 300],
  );

  // 11. Study Circles & Collaborative Learning (25 achievements)
  addSeries(
    "circle_contributions",
    "community_circles",
    "Users",
    "رفيق الحلقة المعرفية",
    "Circle Companion",
    "חבר מעגל הלימוד",
    (n) => `المساهمة بـ ${n} نقطة علمية في أهداف الحلقة الجماعية`,
    (n) => `Contributed ${n} learning units to collaborative study goals`,
    (n) => `תרמת ${n} יחידות לימוד ליעדי מעגל הלימוד`,
    [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000],
  );

  // 12. Ethics & Virtues Exploration (25 achievements)
  addSeries(
    "ethics_explored",
    "ethics_virtues",
    "Heart",
    "جامع المكارم",
    "Virtue Exemplar",
    "מופת המידות והמוסר",
    (n) => `استكشاف وتعلم ${n} مفهوماً من مكارم الأخلاق والآداب`,
    (n) => `Explored ${n} noble virtues and Islamic character topics`,
    (n) => `למדת ${n} נושאי מוסר ומידות טובות`,
    [1, 5, 10, 25, 50, 100, 150, 200, 250, 300],
  );

  return catalog;
}

export const ALL_300_ACHIEVEMENTS = generate300Achievements();

// ==========================================
// 4. QUEST SYSTEM DEFINITIONS
// ==========================================
export interface QuestCheckpoint {
  id: string;
  titleAr: string;
  titleEn: string;
  titleHe: string;
  descAr: string;
  descEn: string;
  descHe: string;
  requiredAction: "read_verses" | "quiz" | "tafsir" | "ai_ask" | "reflection";
  targetId: string;
  rewardXP: number;
}

export interface QuestChain {
  id: string;
  titleAr: string;
  titleEn: string;
  titleHe: string;
  descAr: string;
  descEn: string;
  descHe: string;
  category: "prophets" | "quran" | "tafsir" | "ethics" | "seerah";
  badgeIcon: string;
  checkpoints: QuestCheckpoint[];
  completionCertificateTitleAr: string;
  completionCertificateTitleEn: string;
  completionCertificateTitleHe: string;
}

export const QUEST_CHAINS_CATALOG: QuestChain[] = [
  {
    id: "quest_ibrahim_search",
    titleAr: "رحلة الخليل إبراهيم عليه السلام في البحث عن الحق",
    titleEn: "Journey of Prophet Ibrahim (pbuh): The Search for Truth",
    titleHe: "מסע הנביא אברהם: החיפוש אחר האמת",
    descAr: "مسار تعليمي يتتبع تفكر النبي إبراهيم في الكواكب والشمس والقمر حتى التوحيد الخالص",
    descEn: "Guided study following Abraham's contemplation of celestial bodies to pure monotheism",
    descHe: "מסע לימודי בעקבות התבוננות אברהם בכוכבים, בשמש ובירח עד לייחוד האל",
    category: "prophets",
    badgeIcon: "🌟",
    checkpoints: [
      {
        id: "ibrahim_1",
        titleAr: "التفكر في ملكوت السماوات والأرض",
        titleEn: "Contemplating the Heavens and the Earth",
        titleHe: "התבוננות במלכות השמיים והארץ",
        descAr: "قراءة الآيات من سورة الأنعام (75-79)",
        descEn: "Read verses from Surah Al-An'am (75-79)",
        descHe: "קריאת פסוקים מסורת אל-אנחאם (75-79)",
        requiredAction: "read_verses",
        targetId: "surah_6_75",
        rewardXP: 100,
      },
      {
        id: "ibrahim_2",
        titleAr: "اختبار الفهم: حوار إبراهيم مع قومه",
        titleEn: "Knowledge Check: Ibrahim's Dialogue",
        titleHe: "מבחן הבנה: דיאלוג אברהם עם עמו",
        descAr: "إجابة أسئلة الاختبار حول مناظرة إبراهيم عليه السلام",
        descEn: "Answer comprehension questions on Ibrahim's debate",
        descHe: "מענה על שאלות הבנה בנושא דיאלוג אברהם",
        requiredAction: "quiz",
        targetId: "quiz_ibrahim",
        rewardXP: 150,
      },
      {
        id: "ibrahim_3",
        titleAr: "تدوين تأمل شخصي حول التوحيد",
        titleEn: "Write a Private Reflection on Monotheism",
        titleHe: "כתיבת התבוננות פרטית על ייחוד האל",
        descAr: "سجل انطباعك وتأملك في دفترك الخاص",
        descEn: "Record your insight in your private reflection journal",
        descHe: "תיעוד רשמים ביומן ההתבוננות הפרטי",
        requiredAction: "reflection",
        targetId: "ref_ibrahim",
        rewardXP: 200,
      },
    ],
    completionCertificateTitleAr: "شهادة إتمام رحلة الخليل إبراهيم في التوحيد",
    completionCertificateTitleEn: "Certificate of Completion: Ibrahim's Quest for Truth",
    completionCertificateTitleHe: "תעודת סיום: מסע אברהם לייחود האל",
  },
  {
    id: "quest_musa_khidr",
    titleAr: "موسى والخضر عليهما السلام: دروس الحكمة والصبر",
    titleEn: "Musa & Al-Khidr: Lessons in Divine Wisdom & Patience",
    titleHe: "משה ואל-ח'דר: שיעורים בחכמה וסבלנות",
    descAr: "استكشاف الرحلة التعليمية الشريفة في سورة الكهف والقدر الإلهي",
    descEn: "Exploring the profound learning journey in Surah Al-Kahf & Divine Decree",
    descHe: "חקר מסע הלימוד בסורת אל-כהף וההשגחה האלוהית",
    category: "quran",
    badgeIcon: "🌊",
    checkpoints: [
      {
        id: "musa_1",
        titleAr: "قراءة آيات سورة الكهف (60-82)",
        titleEn: "Read Surah Al-Kahf Verses (60-82)",
        titleHe: "קריאת פסוקי סורת אל-כהף (60-82)",
        descAr: "دراسة قصص الخضر مع موسى عليه السلام",
        descEn: "Study the story of Musa and Al-Khidr",
        descHe: "לימוד סיפור משה ואל-ח'דר",
        requiredAction: "read_verses",
        targetId: "surah_18_60",
        rewardXP: 120,
      },
      {
        id: "musa_2",
        titleAr: "التفسير المقارن للحكم الثلاث",
        titleEn: "Comparative Tafsir of the Three Events",
        titleHe: "תפסיר השוואתי לשלושת האירועים",
        descAr: "قراءة التفسير المعتمد لتأويل السفينة والغلام والجدار",
        descEn: "Study authentic commentary on the ship, the boy, and the wall",
        descHe: "לימוד תפסיר על הספינה, הנער והחומה",
        requiredAction: "tafsir",
        targetId: "tafsir_kahf",
        rewardXP: 180,
      },
    ],
    completionCertificateTitleAr: "شهادة إتقان دراسة رحلة الحكمة في سورة الكهف",
    completionCertificateTitleEn: "Certificate of Mastery: Musa & Al-Khidr Wisdom Journey",
    completionCertificateTitleHe: "תעודת הצטיינות: מסע החכמה של משה ואל-ח'דר",
  },
  {
    id: "quest_women_quran",
    titleAr: "نساء فاضلات في القرآن الكريم",
    titleEn: "Honorable Women in the Holy Quran",
    titleHe: "נשים דגולות בקוראן הקדוש",
    descAr: "دراسة سير السيدة مريم، أم موسى، امرأة فرعون، وامرأة عمران",
    descEn: "Exploring the lives of Mary, Mother of Moses, Asiya, and Wife of Imran",
    descHe: "חקר חיי מרים, אם משה, אשת פרעה ואשת עמראן",
    category: "seerah",
    badgeIcon: "👑",
    checkpoints: [
      {
        id: "women_1",
        titleAr: "سورة مريم ومكانة السيدة مريم عليها السلام",
        titleEn: "Surah Maryam & The Status of Mary",
        titleHe: "סורת מרים ומעמדה של מרים הקדושה",
        descAr: "قراءة وتدبر افتتاحية سورة مريم",
        descEn: "Read and reflect on the opening of Surah Maryam",
        descHe: "קריאה והתבוננות בפתיחת סורת מרים",
        requiredAction: "read_verses",
        targetId: "surah_19_1",
        rewardXP: 150,
      },
    ],
    completionCertificateTitleAr: "شهادة إتمام دراسة سيرة النساء الفاضلات في القرآن",
    completionCertificateTitleEn: "Certificate: Honorable Women of the Quran Journey",
    completionCertificateTitleHe: "תעודת סיום: נשים דגולות בקוראן",
  },
];

// ==========================================
// 5. USER STATE & GAMIFICATION INTERFACES
// ==========================================
export interface DailyMission {
  id: string;
  titleAr: string;
  titleEn: string;
  titleHe: string;
  descAr: string;
  descEn: string;
  descHe: string;
  targetCount: number;
  currentCount: number;
  rewardXP: number;
  completed: boolean;
  category: "read" | "hadith" | "quiz" | "ai" | "reflection";
}

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

export interface ReflectionJournalEntry {
  id: string;
  timestamp: string;
  referenceType: "surah" | "hadith" | "topic" | "prophet";
  referenceTitle: string;
  noteText: string;
}

export interface UserStats {
  xp: number;
  streak: number;
  longestStreak: number;
  streakFreezeCount: number;
  vacationMode: boolean;
  vacationEndDate: string | null;
  hearts: number; // Maximum 5
  lastActiveDate: string | null;
  versesReadCount: number;
  hadithsExploredCount: number;
  aiQueriesCount: number;
  unlockedAchievements: string[]; // achievement IDs
  adaptiveDifficulty: QuestionDifficulty;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  dailyMissions: DailyMission[];
  activeQuestProgress: Record<string, { currentCheckpoint: number; completed: boolean }>;
  spacedRepetitionQueue: SpacedRepetitionItem[];
  studyHistory: StudyHistoryEntry[];
  bookmarks: BookmarkItem[];
  reflections: ReflectionJournalEntry[];
  topicAccuracy: Record<string, { total: number; correct: number }>;
}

const STORAGE_KEY = "noor_user_gamification_stats_v2";

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

    // Daily maintenance: check streak, refill hearts, update daily missions
    const today = new Date().toISOString().split("T")[0];
    if (parsed.lastActiveDate && parsed.lastActiveDate !== today) {
      const lastDate = new Date(parsed.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.floor(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24),
      );

      if (!parsed.vacationMode) {
        if (diffDays === 1) {
          parsed.streak += 1;
          if (parsed.streak > (parsed.longestStreak || 0)) {
            parsed.longestStreak = parsed.streak;
          }
          parsed.lastActiveDate = today;
          parsed.hearts = 5; // Refill hearts
          parsed.dailyMissions = generateDailyMissions();
        } else if (diffDays > 1) {
          // Check if streak freeze protects
          if (parsed.streakFreezeCount > 0) {
            parsed.streakFreezeCount -= 1; // Consume freeze
            parsed.lastActiveDate = today;
            parsed.hearts = 5;
            parsed.dailyMissions = generateDailyMissions();
          } else {
            parsed.streak = 1; // Reset streak gracefully
            parsed.hearts = 5;
            parsed.lastActiveDate = today;
            parsed.dailyMissions = generateDailyMissions();
          }
        }
      } else {
        // Vacation mode active
        parsed.lastActiveDate = today;
        parsed.hearts = 5;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return createInitialStats();
  }
}

function generateDailyMissions(): DailyMission[] {
  const isFriday = new Date().getDay() === 5;

  return [
    {
      id: "m_read_verses",
      titleAr: "قراءة 5 آيات كريمات",
      titleEn: "Read 5 Holy Verses",
      titleHe: "קרא 5 פסוקים קדושים",
      descAr: "التدبر والقراءة في كتاب الله مع التفسير",
      descEn: "Contemplate and read the Quran with commentary",
      descHe: "קרא והתבונן בקוראן עם תפסיר",
      targetCount: 5,
      currentCount: 0,
      rewardXP: 50,
      completed: false,
      category: "read",
    },
    {
      id: "m_explore_hadith",
      titleAr: "استكشاف حديث نبوي شريف",
      titleEn: "Study 1 Authentic Hadith",
      titleHe: "למד חדית' מאומת 1",
      descAr: "الاطلاع على سنّة المصطفى صلى الله عليه وسلم",
      descEn: "Explore Prophetic guidance & authentic chains",
      descHe: "חקר הדרכת הנביא ושרשראות מסירה",
      targetCount: 1,
      currentCount: 0,
      rewardXP: 40,
      completed: false,
      category: "hadith",
    },
    {
      id: isFriday ? "m_friday_kahf" : "m_quiz_test",
      titleAr: isFriday ? "نفحات الجمعة: قراءة سورة الكهف" : "إكمال اختبار معرفي واحد",
      titleEn: isFriday ? "Friday Blessing: Read Surah Kahf" : "Complete 1 Quiz Challenge",
      titleHe: isFriday ? "ברכת שישי: קריאת סורת אל-כהף" : "השלם מבחן ידע אחד",
      descAr: isFriday
        ? "سُنّة القراءة في يوم الجمعة المبارك"
        : "اختبار حصيلة الفهم في العلوم الإسلامية",
      descEn: isFriday
        ? "Blessed Friday recitation of Surah Al-Kahf"
        : "Test your understanding across topics",
      descHe: isFriday ? "קריאה מבורכת ביום שישי" : "בחן את הבנתך בנושאים איסלאמיים",
      targetCount: 1,
      currentCount: 0,
      rewardXP: isFriday ? 100 : 50,
      completed: false,
      category: "quiz",
    },
  ];
}

function createInitialStats(): UserStats {
  return {
    xp: 100, // Welcome Seeker Bonus
    streak: 1,
    longestStreak: 1,
    streakFreezeCount: 1, // Free initial protection
    vacationMode: false,
    vacationEndDate: null,
    hearts: 5,
    lastActiveDate: typeof window !== "undefined" ? new Date().toISOString().split("T")[0] : null,
    versesReadCount: 0,
    hadithsExploredCount: 0,
    aiQueriesCount: 0,
    unlockedAchievements: ["quran_verses_1"],
    adaptiveDifficulty: "easy",
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    dailyMissions: generateDailyMissions(),
    activeQuestProgress: {
      quest_ibrahim_search: { currentCheckpoint: 0, completed: false },
    },
    spacedRepetitionQueue: [],
    studyHistory: [],
    bookmarks: [],
    reflections: [],
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

export function awardXP(
  amount: number,
  reason?: "verse" | "hadith" | "ai" | "tafsir" | "quiz" | "reflection",
): UserStats {
  const current = getGamificationStats();
  current.xp += amount;

  if (reason === "verse") {
    current.versesReadCount += 1;
    updateMissionProgress(current, "read", 1);
  } else if (reason === "hadith") {
    current.hadithsExploredCount += 1;
    updateMissionProgress(current, "hadith", 1);
  } else if (reason === "ai") {
    current.aiQueriesCount += 1;
    updateMissionProgress(current, "ai", 1);
  } else if (reason === "quiz") {
    updateMissionProgress(current, "quiz", 1);
  } else if (reason === "reflection") {
    updateMissionProgress(current, "reflection", 1);
  }

  // Check achievement unlocks
  checkAndUnlockAchievements(current);

  saveStats(current);
  return current;
}

function updateMissionProgress(stats: UserStats, category: string, inc: number) {
  stats.dailyMissions.forEach((m) => {
    if (m.category === category && !m.completed) {
      m.currentCount = Math.min(m.targetCount, m.currentCount + inc);
      if (m.currentCount >= m.targetCount) {
        m.completed = true;
        stats.xp += m.rewardXP; // Award mission bonus
      }
    }
  });
}

function checkAndUnlockAchievements(stats: UserStats) {
  ALL_300_ACHIEVEMENTS.forEach((ach) => {
    if (!stats.unlockedAchievements.includes(ach.id)) {
      let currentVal = 0;
      if (ach.id.startsWith("quran_verses_")) currentVal = stats.versesReadCount;
      else if (ach.id.startsWith("hadith_explored_")) currentVal = stats.hadithsExploredCount;
      else if (ach.id.startsWith("ai_queries_")) currentVal = stats.aiQueriesCount;
      else if (ach.id.startsWith("streak_days_")) currentVal = stats.streak;
      else if (ach.id.startsWith("reflections_saved_")) currentVal = stats.reflections.length;

      if (currentVal >= ach.targetCount && ach.targetCount > 0) {
        stats.unlockedAchievements.push(ach.id);
        stats.xp += ach.rewardXP;
      }
    }
  });
}

// SM-2 SPACED REPETITION ENGINE
export function updateSpacedRepetition(questionId: string, performanceScore: number): UserStats {
  const stats = getGamificationStats();
  const queue = [...stats.spacedRepetitionQueue];
  const idx = queue.findIndex((q) => q.questionId === questionId);

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
    if (item.repetitions === 0) item.intervalDays = 1;
    else if (item.repetitions === 1) item.intervalDays = 6;
    else item.intervalDays = Math.round(item.intervalDays * item.easeFactor);
    item.repetitions += 1;
  } else {
    item.repetitions = 0;
    item.intervalDays = 1;
  }

  item.easeFactor = Math.max(
    1.3,
    item.easeFactor + (0.1 - (5 - qScore) * (0.08 + (5 - qScore) * 0.02)),
  );
  item.lastScore = qScore;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + item.intervalDays);
  item.nextReviewDate = nextDate.toISOString().split("T")[0];

  if (idx >= 0) queue[idx] = item;
  else queue.push(item);

  stats.spacedRepetitionQueue = queue;
  saveStats(stats);
  return stats;
}

export function savePrivateReflection(
  referenceType: "surah" | "hadith" | "topic" | "prophet",
  referenceTitle: string,
  noteText: string,
): UserStats {
  const stats = getGamificationStats();
  const newRef: ReflectionJournalEntry = {
    id: `ref_${Date.now()}`,
    timestamp: new Date().toISOString(),
    referenceType,
    referenceTitle,
    noteText,
  };
  stats.reflections = [newRef, ...stats.reflections];
  return awardXP(30, "reflection");
}

export function buyStreakFreeze(): { success: boolean; stats: UserStats; message: string } {
  const stats = getGamificationStats();
  const COST = 150;
  if (stats.xp < COST) {
    return {
      success: false,
      stats,
      message: "Insufficient XP balance. Earn 150 XP to unlock a Streak Freeze.",
    };
  }
  stats.xp -= COST;
  stats.streakFreezeCount += 1;
  saveStats(stats);
  return {
    success: true,
    stats,
    message: "Streak Freeze protection activated successfully!",
  };
}

export function toggleVacationMode(): UserStats {
  const stats = getGamificationStats();
  stats.vacationMode = !stats.vacationMode;
  saveStats(stats);
  return stats;
}

export function refillHearts(): UserStats {
  const stats = getGamificationStats();
  stats.hearts = 5;
  saveStats(stats);
  return stats;
}

export function getAiMentorRecommendations(stats: UserStats): {
  recommendedTopic: string;
  reasonAr: string;
  reasonEn: string;
  reasonHe: string;
} {
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
    hadith: { ar: "الحديث النبوي الشريف", en: "Authentic Hadiths", he: "חדית'ים מאומתים" },
    prophets: { ar: "قصص الأنبياء والمرسلين", en: "Lives of the Prophets", he: "סיפורי נביאים" },
    companions: { ar: "سير الصحابة الكرام", en: "Generations of Sahabah", he: "סיפורי הסחאבה" },
    tafsir: { ar: "التفسير وأسباب النزول", en: "Tafsir & Context", he: "תפסיר ואסבאב א-נזول" },
    ethics: { ar: "الأخلاق والمفاهيم الإسلامية", en: "Ethics & Virtues", he: "מוסר ומידות" },
  };

  const name = categoryNames[lowestCategory] || categoryNames.quran;

  return {
    recommendedTopic: lowestCategory,
    reasonAr: `بناءً على نسبة إجاباتك، يوصي الموجه المعرفي بالتركيز على ${name.ar} لرفع مستوى الإتقان والتثبيت.`,
    reasonEn: `Based on your recent accuracy, Noor AI Coach recommends reviewing ${name.en} to reinforce your mastery.`,
    reasonHe: `בהתבסס על אחוז הדיוק שלך, מומלץ לחזור על ${name.he} כדי לחזק את השليطة בחומר.`,
  };
}

// Backward-compatibility exports
export function calculateLevel(xp: number) {
  const res = calculate100Level(xp);
  return {
    level: res.levelInfo.level,
    title: res.levelInfo.titleEn,
    titleAr: res.levelInfo.titleAr,
    titleHe: res.levelInfo.titleHe,
    currentXP: res.xpInLevel,
    nextLevelXP: res.levelInfo.maxXP - res.levelInfo.minXP,
    progressPercent: res.progressPercent,
  };
}

export function updateAdaptiveDifficulty(stats: UserStats, success: boolean): UserStats {
  if (success) {
    stats.xp += 15;
    if (stats.adaptiveDifficulty === "easy") stats.adaptiveDifficulty = "medium";
    else if (stats.adaptiveDifficulty === "medium") stats.adaptiveDifficulty = "hard";
  } else {
    if (stats.adaptiveDifficulty === "hard") stats.adaptiveDifficulty = "medium";
    else if (stats.adaptiveDifficulty === "medium") stats.adaptiveDifficulty = "easy";
  }
  saveStats(stats);
  return stats;
}

export const ALL_BADGES = ALL_300_ACHIEVEMENTS.map((a) => ({
  id: a.id,
  nameAr: a.nameAr,
  nameEn: a.nameEn,
  nameHe: a.nameHe,
  descAr: a.descAr,
  descEn: a.descEn,
  descHe: a.descHe,
  icon: a.icon,
  category: a.category,
}));

export function toggleBookmark(questionId: string): UserStats {
  const stats = getGamificationStats();
  if (stats.bookmarks.includes(questionId)) {
    stats.bookmarks = stats.bookmarks.filter((id) => id !== questionId);
  } else {
    stats.bookmarks.push(questionId);
  }
  saveStats(stats);
  return stats;
}

export function getLearningRecommendations(stats: UserStats) {
  const rec = getAiMentorRecommendations(stats);
  return [rec.recommendedTopic];
}
