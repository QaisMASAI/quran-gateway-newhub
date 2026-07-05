// Curated thematic index of the Holy Quran.
// Each topic lists representative verse references only — the platform does
// not paraphrase or interpret. Readers follow the links to read the actual
// Quranic text and authenticated tafsir.
import seed from "@/lib/seeds/knowledge-seed.json";

export type AyahRef = {
  surah: number;
  ayah: number;
  to?: number;
};

export type Topic = {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  icon:
    | "heart"
    | "scale"
    | "book"
    | "sun"
    | "moon"
    | "shield"
    | "users"
    | "sparkles"
    | "hand"
    | "star";
  refs: AyahRef[];
};

export const TOPICS: Topic[] = [
  {
    slug: "tawhid",
    title: "ייחוד האל (תַוְחִיד)",
    subtitle: "אמונה באל אחד",
    description: "פסוקים העוסקים באחדות האל, באלוהותו ובתאריו.",
    icon: "sparkles",
    refs: [
      { surah: 112, ayah: 1, to: 4 },
      { surah: 2, ayah: 255 },
      { surah: 59, ayah: 22, to: 24 },
      { surah: 3, ayah: 18 },
      { surah: 16, ayah: 22 },
    ],
  },
  {
    slug: "prayer",
    title: "תפילה (צַלָאה)",
    subtitle: "עמוד הדת",
    description: "פסוקים על חובת התפילה, זמניה ומעלתה.",
    icon: "hand",
    refs: [
      { surah: 2, ayah: 238, to: 239 },
      { surah: 4, ayah: 103 },
      { surah: 11, ayah: 114 },
      { surah: 20, ayah: 14 },
      { surah: 29, ayah: 45 },
    ],
  },
  {
    slug: "charity",
    title: "צדקה (זַכָּאת וצַדַקה)",
    subtitle: "נתינה לזולת",
    description: "פסוקים על זכאת, צדקה והוצאת ממון בדרך האל.",
    icon: "heart",
    refs: [
      { surah: 2, ayah: 261, to: 274 },
      { surah: 9, ayah: 60 },
      { surah: 63, ayah: 10 },
      { surah: 57, ayah: 18 },
    ],
  },
  {
    slug: "fasting",
    title: "צום (צִיָאם)",
    subtitle: "חודש רמדאן",
    description: "פסוקים על חובת הצום ומעלתו.",
    icon: "moon",
    refs: [
      { surah: 2, ayah: 183, to: 187 },
      { surah: 97, ayah: 1, to: 5 },
    ],
  },
  {
    slug: "patience",
    title: "סבלנות (צַבְּר)",
    subtitle: "עמידה בקשיים",
    description: "פסוקים המעודדים סבלנות, סובלנות בעת מצוקה ואמון באל.",
    icon: "shield",
    refs: [
      { surah: 2, ayah: 153 },
      { surah: 2, ayah: 155, to: 157 },
      { surah: 3, ayah: 200 },
      { surah: 39, ayah: 10 },
      { surah: 94, ayah: 5, to: 6 },
    ],
  },
  {
    slug: "mercy",
    title: "רחמי האל",
    subtitle: "אר-רחמן אר-רחים",
    description: "פסוקים העוסקים ברחמיו הרבים של האל ובסליחתו.",
    icon: "heart",
    refs: [
      { surah: 1, ayah: 1, to: 3 },
      { surah: 7, ayah: 156 },
      { surah: 39, ayah: 53 },
      { surah: 55, ayah: 1, to: 13 },
    ],
  },
  {
    slug: "justice",
    title: "צדק (עַדְל)",
    subtitle: "הוגנות בין בני אדם",
    description: "פסוקים על מצוות הצדק, יושר במשפט וביחסים בין-אישיים.",
    icon: "scale",
    refs: [
      { surah: 4, ayah: 58 },
      { surah: 4, ayah: 135 },
      { surah: 5, ayah: 8 },
      { surah: 16, ayah: 90 },
      { surah: 49, ayah: 9 },
    ],
  },
  {
    slug: "knowledge",
    title: "ידע ולמידה",
    subtitle: "אִקְרַא — קְרָא",
    description: "פסוקים המעודדים חיפוש אחר ידע ולימוד.",
    icon: "book",
    refs: [
      { surah: 96, ayah: 1, to: 5 },
      { surah: 39, ayah: 9 },
      { surah: 58, ayah: 11 },
      { surah: 20, ayah: 114 },
    ],
  },
  {
    slug: "parents",
    title: "כיבוד הורים",
    subtitle: "אַחְסָאן אל-וָאלִדַיְן",
    description: "פסוקים על מצוות היחס הטוב להורים.",
    icon: "users",
    refs: [
      { surah: 17, ayah: 23, to: 24 },
      { surah: 31, ayah: 14, to: 15 },
      { surah: 46, ayah: 15 },
    ],
  },
  {
    slug: "creation",
    title: "בריאת היקום",
    subtitle: "אותות בטבע",
    description: "פסוקים על בריאת השמים והארץ והאותות הטמונים בה.",
    icon: "sun",
    refs: [
      { surah: 2, ayah: 164 },
      { surah: 21, ayah: 30 },
      { surah: 41, ayah: 9, to: 12 },
      { surah: 50, ayah: 6, to: 11 },
      { surah: 67, ayah: 1, to: 5 },
    ],
  },
  {
    slug: "afterlife",
    title: "העולם הבא",
    subtitle: "יום הדין",
    description: "פסוקים על תחיית המתים, חשבון הנפש, גן עדן וגיהינום.",
    icon: "star",
    refs: [
      { surah: 56, ayah: 1, to: 56 },
      { surah: 75, ayah: 1, to: 15 },
      { surah: 99, ayah: 1, to: 8 },
      { surah: 101, ayah: 1, to: 11 },
    ],
  },
  {
    slug: "repentance",
    title: "תשובה (תַוְבָּה)",
    subtitle: "חזרה אל האל",
    description: "פסוקים על פתיחת שערי החזרה בתשובה וקבלת האל את השבים.",
    icon: "sparkles",
    refs: [
      { surah: 2, ayah: 222 },
      { surah: 4, ayah: 110 },
      { surah: 39, ayah: 53, to: 54 },
      { surah: 66, ayah: 8 },
    ],
  },
];

type SeedTopic = {
  kind: string;
  slug: string;
  title: { he?: string; ar?: string; en?: string };
  summary: { he?: string; ar?: string; en?: string };
};

const seedTopicLinks = new Map(
  (
    (seed.verses as Array<{ slug: string; links: [number, number, number][] }> | undefined) ?? []
  ).map((v) => [v.slug, v.links]),
);

const seedTopics: Topic[] = ((seed.entities as SeedTopic[] | undefined) ?? [])
  .filter((e) => e.kind === "topic")
  .map((e) => ({
    slug: e.slug,
    title: e.title.he ?? e.title.en ?? e.slug,
    subtitle: e.title.ar,
    description: e.summary.he ?? e.summary.en ?? e.summary.ar ?? "",
    icon: "book" as const,
    refs: (seedTopicLinks.get(e.slug) ?? []).map(([surah, ayah, to]) => ({
      surah,
      ayah,
      to,
    })),
  }))
  .filter((t) => t.refs.length > 0);

const mergedTopics = [...TOPICS];
const seenTopicSlugs = new Set(TOPICS.map((t) => t.slug));
for (const t of seedTopics) {
  if (!seenTopicSlugs.has(t.slug)) mergedTopics.push(t);
}

export function getTopic(slug: string): Topic | undefined {
  return mergedTopics.find((t) => t.slug === slug);
}

export const ALL_TOPICS: Topic[] = mergedTopics;
