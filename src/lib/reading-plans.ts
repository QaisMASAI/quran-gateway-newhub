// Curated reading plans for the Holy Quran.
// Each plan splits the Quran (or a subset) into manageable daily portions.
// Progress is tracked locally per device.

export type DailyReading = {
  day: number;
  title: string;
  // List of surahs to read in full, or specific ayah ranges.
  segments: Array<
    | { surah: number; fromAyah?: undefined; toAyah?: undefined }
    | { surah: number; fromAyah: number; toAyah: number }
  >;
};

export type ReadingPlan = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  durationDays: number;
  level: "מתחילים" | "בינוני" | "מתקדם";
  days: DailyReading[];
};

// ---- Plan 1: 30 short surahs in 30 days ----
const SHORT_SURAHS_PLAN: ReadingPlan = {
  slug: "short-surahs-30",
  title: "30 סורות קצרות ב-30 ימים",
  subtitle: "סורות קצרות לתחילתו של לימוד",
  description:
    "סורה אחת קצרה ביום מתוך החלק האחרון של הקוראן. מצוין למתחילים שרוצים להכיר את הסורות הנפוצות בתפילה.",
  durationDays: 30,
  level: "מתחילים",
  days: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    title: `יום ${i + 1}`,
    segments: [{ surah: 114 - i }], // 114 down to 85
  })),
};

// ---- Plan 2: 7-day overview of the most-cited surahs ----
const ESSENTIALS_PLAN: ReadingPlan = {
  slug: "essentials-7",
  title: "7 ימים — סורות מרכזיות",
  subtitle: "מבט-על על הסורות המוכרות ביותר",
  description:
    "סיור של שבוע בין הסורות המוכרות והנפוצות ביותר בקוראן — מאל-פאתחה ועד אל-איח'לאץ.",
  durationDays: 7,
  level: "מתחילים",
  days: [
    { day: 1, title: "פתיחה ותחילה", segments: [{ surah: 1 }, { surah: 2, fromAyah: 1, toAyah: 5 }] },
    { day: 2, title: "כס המלכות", segments: [{ surah: 2, fromAyah: 255, toAyah: 257 }] },
    { day: 3, title: "סורת יאסין", segments: [{ surah: 36 }] },
    { day: 4, title: "סורת אר-רחמן", segments: [{ surah: 55 }] },
    { day: 5, title: "סורת אל-מולכ", segments: [{ surah: 67 }] },
    { day: 6, title: "סורת אל-כהף — תחילה", segments: [{ surah: 18, fromAyah: 1, toAyah: 10 }] },
    { day: 7, title: "ארבע סורות החתימה", segments: [{ surah: 109 }, { surah: 112 }, { surah: 113 }, { surah: 114 }] },
  ],
};

export const READING_PLANS: ReadingPlan[] = [
  ESSENTIALS_PLAN,
  SHORT_SURAHS_PLAN,
];

export function getPlan(slug: string): ReadingPlan | undefined {
  return READING_PLANS.find((p) => p.slug === slug);
}

