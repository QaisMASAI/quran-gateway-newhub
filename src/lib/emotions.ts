// Emotional Quran Explorer — curated map of human emotions to authenticated
// Quranic references. The platform does NOT interpret or summarize; readers
// follow the links to the verses themselves and to authenticated tafsir
// rendered on the verse pages. No AI-generated commentary lives here.

import type { AyahRef } from "./topics";

export type Emotion = {
  slug: string;
  title: string; // Hebrew
  subtitle?: string; // short emotional context
  description: string; // factual framing, no interpretation
  icon: "heart" | "shield" | "sun" | "moon" | "sparkles" | "hand" | "scale" | "star" | "book" | "users";
  // gentle accent shown on cards — semantic-token classes only
  accent: "calm" | "warm" | "deep" | "soft";
  refs: AyahRef[];
};

export const EMOTIONS: Emotion[] = [
  {
    slug: "anxiety",
    title: "חרדה ודאגה",
    subtitle: "שקט הלב",
    description: "פסוקים על מנוחת הלב באל ועל הסרת הדאגה דרך זיכרון האל.",
    icon: "shield",
    accent: "calm",
    refs: [
      { surah: 13, ayah: 28 },
      { surah: 2, ayah: 286 },
      { surah: 94, ayah: 5, to: 6 },
      { surah: 65, ayah: 2, to: 3 },
      { surah: 39, ayah: 36 },
    ],
  },
  {
    slug: "sadness",
    title: "עצב וכאב",
    subtitle: "נחמה ואור",
    description: "פסוקים המזכירים כי אחרי הקושי בא ההקלה ושהאל קרוב לשבורי לב.",
    icon: "moon",
    accent: "deep",
    refs: [
      { surah: 94, ayah: 1, to: 8 },
      { surah: 9, ayah: 40 },
      { surah: 12, ayah: 86, to: 87 },
      { surah: 28, ayah: 7 },
    ],
  },
  {
    slug: "fear",
    title: "פחד וחוסר ביטחון",
    subtitle: "ביטחון באל",
    description: "פסוקים על הסרת הפחד דרך אמונה ועל הגנת האל על המאמינים.",
    icon: "shield",
    accent: "deep",
    refs: [
      { surah: 3, ayah: 173 },
      { surah: 8, ayah: 2 },
      { surah: 41, ayah: 30 },
      { surah: 2, ayah: 38 },
      { surah: 20, ayah: 46 },
    ],
  },
  {
    slug: "loneliness",
    title: "בדידות",
    subtitle: "הקירבה לאל",
    description: "פסוקים המזכירים כי האל קרוב לאדם יותר מעורק צווארו.",
    icon: "heart",
    accent: "soft",
    refs: [
      { surah: 50, ayah: 16 },
      { surah: 2, ayah: 186 },
      { surah: 57, ayah: 4 },
      { surah: 11, ayah: 61 },
    ],
  },
  {
    slug: "gratitude",
    title: "הכרת טובה",
    subtitle: "שֻׁכְּר",
    description: "פסוקים המעודדים להודות לאל ולהכיר בחסדיו.",
    icon: "sun",
    accent: "warm",
    refs: [
      { surah: 14, ayah: 7 },
      { surah: 31, ayah: 12 },
      { surah: 16, ayah: 18 },
      { surah: 2, ayah: 152 },
    ],
  },
  {
    slug: "hope",
    title: "תקווה",
    subtitle: "אל ייאוש מרחמי האל",
    description: "פסוקים על תקווה ברחמי האל גם לאחר חטא וקושי.",
    icon: "sparkles",
    accent: "warm",
    refs: [
      { surah: 39, ayah: 53 },
      { surah: 12, ayah: 87 },
      { surah: 15, ayah: 56 },
      { surah: 2, ayah: 218 },
    ],
  },
  {
    slug: "anger",
    title: "כעס",
    subtitle: "ריסון ומחילה",
    description: "פסוקים על כיבוש הכעס ועל מעלת המוחלים לזולת.",
    icon: "scale",
    accent: "deep",
    refs: [
      { surah: 3, ayah: 133, to: 134 },
      { surah: 42, ayah: 37 },
      { surah: 41, ayah: 34, to: 35 },
      { surah: 7, ayah: 199 },
    ],
  },
  {
    slug: "guilt",
    title: "אשמה וחרטה",
    subtitle: "תשובה ומחילה",
    description: "פסוקים על פתיחת שערי התשובה ועל קבלת השבים אל האל.",
    icon: "hand",
    accent: "soft",
    refs: [
      { surah: 39, ayah: 53, to: 54 },
      { surah: 4, ayah: 110 },
      { surah: 66, ayah: 8 },
      { surah: 25, ayah: 70 },
    ],
  },
  {
    slug: "peace",
    title: "שלוות נפש",
    subtitle: "סַכִּינַה",
    description: "פסוקים על שלוות הנפש שיורדת על המאמינים.",
    icon: "moon",
    accent: "calm",
    refs: [
      { surah: 48, ayah: 4 },
      { surah: 13, ayah: 28 },
      { surah: 89, ayah: 27, to: 30 },
      { surah: 9, ayah: 26 },
    ],
  },
  {
    slug: "hardship",
    title: "קושי ומבחנים",
    subtitle: "סבלנות באתגרים",
    description: "פסוקים על מבחני החיים, סבלנות, ועל הגמול לסבלנים.",
    icon: "shield",
    accent: "deep",
    refs: [
      { surah: 2, ayah: 155, to: 157 },
      { surah: 29, ayah: 2, to: 3 },
      { surah: 39, ayah: 10 },
      { surah: 64, ayah: 11 },
    ],
  },
  {
    slug: "love",
    title: "אהבה וחיבה",
    subtitle: "מַוַדַּה ורַחְמַה",
    description: "פסוקים על אהבה, חמלה וקשרים אנושיים שהאל הטמין בין הברואים.",
    icon: "heart",
    accent: "warm",
    refs: [
      { surah: 30, ayah: 21 },
      { surah: 19, ayah: 96 },
      { surah: 49, ayah: 10 },
      { surah: 3, ayah: 159 },
    ],
  },
  {
    slug: "confusion",
    title: "בלבול וחיפוש משמעות",
    subtitle: "הדרכה ישרה",
    description: "פסוקים על בקשת הדרכה מהאל וההבטחה למחפשים את האמת.",
    icon: "star",
    accent: "soft",
    refs: [
      { surah: 1, ayah: 6, to: 7 },
      { surah: 29, ayah: 69 },
      { surah: 47, ayah: 17 },
      { surah: 2, ayah: 186 },
    ],
  },
  {
    slug: "marriage",
    title: "נישואין וזוגיות",
    subtitle: "אהבה וחמלה",
    description: "פסוקים על הקמת בית מבורך, מַוַדַּה ורַחְמַה בין בני הזוג.",
    icon: "heart",
    accent: "warm",
    refs: [
      { surah: 30, ayah: 21 },
      { surah: 25, ayah: 74 },
      { surah: 4, ayah: 1 },
      { surah: 2, ayah: 187 },
    ],
  },
  {
    slug: "family",
    title: "משפחה וכיבוד הורים",
    subtitle: "קשרי משפחה",
    description: "פסוקים על חסד ורחמים להורים, קשרי משפחה וחינוך ילדים.",
    icon: "users",
    accent: "soft",
    refs: [
      { surah: 17, ayah: 23, to: 24 },
      { surah: 31, ayah: 14 },
      { surah: 46, ayah: 15 },
      { surah: 66, ayah: 6 },
    ],
  },
  {
    slug: "death",
    title: "מוות והעולם הבא",
    subtitle: "זיכרון הנצח",
    description: "פסוקים על טבעם הארעי של החיים, הנצחיות של העולם הבא והשיבה אל האל.",
    icon: "star",
    accent: "deep",
    refs: [
      { surah: 3, ayah: 185 },
      { surah: 21, ayah: 35 },
      { surah: 2, ayah: 156 },
      { surah: 50, ayah: 19 },
    ],
  },
  {
    slug: "success",
    title: "הצלחה וברכה",
    subtitle: "הפלאח האמיתי",
    description: "פסוקים על הגדרת ההצלחה האמיתית בחיים אלו ובעולם הבא.",
    icon: "sparkles",
    accent: "warm",
    refs: [
      { surah: 23, ayah: 1, to: 11 },
      { surah: 91, ayah: 9 },
      { surah: 87, ayah: 14, to: 15 },
      { surah: 28, ayah: 77 },
    ],
  },
  {
    slug: "knowledge",
    title: "בקשת דעת וחכמה",
    subtitle: "עִלְם וחיפוש אמת",
    description: "פסוקים על מעלת לומדי התורה והמדע והתפילה לתוספת ידע.",
    icon: "book",
    accent: "calm",
    refs: [
      { surah: 20, ayah: 114 },
      { surah: 58, ayah: 11 },
      { surah: 39, ayah: 9 },
      { surah: 96, ayah: 1, to: 5 },
    ],
  },
  {
    slug: "patience",
    title: "סבלנות ועמידה איתנה",
    subtitle: "צַבְּר",
    description: "פסוקים על כוח הסבלנות בשעות מבחן והבטחת האל לסבלנים.",
    icon: "shield",
    accent: "deep",
    refs: [
      { surah: 2, ayah: 153 },
      { surah: 3, ayah: 200 },
      { surah: 11, ayah: 115 },
      { surah: 39, ayah: 10 },
    ],
  },
];

export function getEmotion(slug: string): Emotion | undefined {
  return EMOTIONS.find((e) => e.slug === slug);
}
