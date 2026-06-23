// Prophets mentioned by name in the Holy Quran.
// Data is structural only: names + verse references (surah:ayah).
// We deliberately do NOT include narratives — those must be read from the
// Quran itself or from authenticated Tafsir, never invented by the platform.

export type AyahRef = {
  surah: number;
  ayah: number;
  // Optional inclusive range end (for a passage).
  to?: number;
};

export type Prophet = {
  slug: string;
  nameHe: string;
  nameAr: string;
  // Common alternate Hebrew name (biblical equivalent), if any.
  nameHeAlt?: string;
  // Selected representative references where this prophet is named.
  // Not exhaustive — meant as a starting point for the reader.
  refs: AyahRef[];
};

export const PROPHETS: Prophet[] = [
  {
    slug: "adam",
    nameHe: "אדם",
    nameHeAlt: "אדם הראשון",
    nameAr: "آدَم",
    refs: [
      { surah: 2, ayah: 31, to: 37 },
      { surah: 3, ayah: 33 },
      { surah: 7, ayah: 11, to: 27 },
      { surah: 20, ayah: 115, to: 123 },
    ],
  },
  {
    slug: "idris",
    nameHe: "אִדְרִיס",
    nameHeAlt: "חנוך",
    nameAr: "إِدْرِيس",
    refs: [
      { surah: 19, ayah: 56, to: 57 },
      { surah: 21, ayah: 85, to: 86 },
    ],
  },
  {
    slug: "nuh",
    nameHe: "נוּח",
    nameHeAlt: "נח",
    nameAr: "نُوح",
    refs: [
      { surah: 71, ayah: 1, to: 28 },
      { surah: 11, ayah: 25, to: 49 },
      { surah: 7, ayah: 59, to: 64 },
    ],
  },
  {
    slug: "hud",
    nameHe: "הוּד",
    nameAr: "هُود",
    refs: [
      { surah: 11, ayah: 50, to: 60 },
      { surah: 7, ayah: 65, to: 72 },
    ],
  },
  {
    slug: "salih",
    nameHe: "צָאלִח",
    nameAr: "صَالِح",
    refs: [
      { surah: 7, ayah: 73, to: 79 },
      { surah: 11, ayah: 61, to: 68 },
      { surah: 27, ayah: 45, to: 53 },
    ],
  },
  {
    slug: "ibrahim",
    nameHe: "אִבְּרָאהִים",
    nameHeAlt: "אברהם",
    nameAr: "إِبْرَاهِيم",
    refs: [
      { surah: 2, ayah: 124, to: 132 },
      { surah: 14, ayah: 35, to: 41 },
      { surah: 19, ayah: 41, to: 50 },
      { surah: 21, ayah: 51, to: 73 },
      { surah: 37, ayah: 83, to: 113 },
    ],
  },
  {
    slug: "lut",
    nameHe: "לוּט",
    nameHeAlt: "לוט",
    nameAr: "لُوط",
    refs: [
      { surah: 7, ayah: 80, to: 84 },
      { surah: 11, ayah: 77, to: 83 },
      { surah: 26, ayah: 160, to: 175 },
    ],
  },
  {
    slug: "ismail",
    nameHe: "אִסְמָאעִיל",
    nameHeAlt: "ישמעאל",
    nameAr: "إِسْمَاعِيل",
    refs: [
      { surah: 2, ayah: 125, to: 129 },
      { surah: 19, ayah: 54, to: 55 },
      { surah: 37, ayah: 100, to: 111 },
    ],
  },
  {
    slug: "ishaq",
    nameHe: "אִסְחַאק",
    nameHeAlt: "יצחק",
    nameAr: "إِسْحَاق",
    refs: [
      { surah: 19, ayah: 49 },
      { surah: 21, ayah: 72 },
      { surah: 37, ayah: 112, to: 113 },
    ],
  },
  {
    slug: "yaqub",
    nameHe: "יַעְקוּב",
    nameHeAlt: "יעקב",
    nameAr: "يَعْقُوب",
    refs: [
      { surah: 2, ayah: 132, to: 133 },
      { surah: 12, ayah: 4, to: 6 },
      { surah: 19, ayah: 49 },
    ],
  },
  {
    slug: "yusuf",
    nameHe: "יוּסֻף",
    nameHeAlt: "יוסף",
    nameAr: "يُوسُف",
    refs: [{ surah: 12, ayah: 1, to: 111 }],
  },
  {
    slug: "ayyub",
    nameHe: "אַיּוּבּ",
    nameHeAlt: "איוב",
    nameAr: "أَيُّوب",
    refs: [
      { surah: 21, ayah: 83, to: 84 },
      { surah: 38, ayah: 41, to: 44 },
    ],
  },
  {
    slug: "shuayb",
    nameHe: "שֻׁעַיְבּ",
    nameAr: "شُعَيْب",
    refs: [
      { surah: 7, ayah: 85, to: 93 },
      { surah: 11, ayah: 84, to: 95 },
      { surah: 26, ayah: 176, to: 191 },
    ],
  },
  {
    slug: "musa",
    nameHe: "מוּסָא",
    nameHeAlt: "משה",
    nameAr: "مُوسَى",
    refs: [
      { surah: 20, ayah: 9, to: 98 },
      { surah: 28, ayah: 3, to: 46 },
      { surah: 7, ayah: 103, to: 156 },
    ],
  },
  {
    slug: "harun",
    nameHe: "הָארוּן",
    nameHeAlt: "אהרן",
    nameAr: "هَارُون",
    refs: [
      { surah: 20, ayah: 29, to: 36 },
      { surah: 19, ayah: 53 },
      { surah: 28, ayah: 34 },
    ],
  },
  {
    slug: "dhul-kifl",
    nameHe: "דֻ'ל-כִּפְל",
    nameAr: "ذُو الكِفْل",
    refs: [
      { surah: 21, ayah: 85, to: 86 },
      { surah: 38, ayah: 48 },
    ],
  },
  {
    slug: "dawud",
    nameHe: "דָאוּד",
    nameHeAlt: "דוד",
    nameAr: "دَاوُد",
    refs: [
      { surah: 2, ayah: 251 },
      { surah: 21, ayah: 78, to: 80 },
      { surah: 38, ayah: 17, to: 26 },
    ],
  },
  {
    slug: "sulayman",
    nameHe: "סֻלַיְמָאן",
    nameHeAlt: "שלמה",
    nameAr: "سُلَيْمَان",
    refs: [
      { surah: 21, ayah: 78, to: 82 },
      { surah: 27, ayah: 15, to: 44 },
      { surah: 38, ayah: 30, to: 40 },
    ],
  },
  {
    slug: "ilyas",
    nameHe: "אִלְיָאס",
    nameHeAlt: "אליהו",
    nameAr: "إِلْيَاس",
    refs: [
      { surah: 6, ayah: 85 },
      { surah: 37, ayah: 123, to: 132 },
    ],
  },
  {
    slug: "alyasa",
    nameHe: "אֶלְיַסַע",
    nameHeAlt: "אלישע",
    nameAr: "اليَسَع",
    refs: [
      { surah: 6, ayah: 86 },
      { surah: 38, ayah: 48 },
    ],
  },
  {
    slug: "yunus",
    nameHe: "יוּנֻס",
    nameHeAlt: "יונה",
    nameAr: "يُونُس",
    refs: [
      { surah: 10, ayah: 98 },
      { surah: 21, ayah: 87, to: 88 },
      { surah: 37, ayah: 139, to: 148 },
    ],
  },
  {
    slug: "zakariyya",
    nameHe: "זַכַּרִיָּא",
    nameHeAlt: "זכריה",
    nameAr: "زَكَرِيَّا",
    refs: [
      { surah: 3, ayah: 37, to: 41 },
      { surah: 19, ayah: 2, to: 11 },
      { surah: 21, ayah: 89, to: 90 },
    ],
  },
  {
    slug: "yahya",
    nameHe: "יַחְיָא",
    nameHeAlt: "יוחנן",
    nameAr: "يَحْيَى",
    refs: [
      { surah: 3, ayah: 39 },
      { surah: 19, ayah: 12, to: 15 },
      { surah: 21, ayah: 90 },
    ],
  },
  {
    slug: "isa",
    nameHe: "עִיסָא",
    nameHeAlt: "ישוע",
    nameAr: "عِيسَى",
    refs: [
      { surah: 3, ayah: 45, to: 59 },
      { surah: 19, ayah: 16, to: 36 },
      { surah: 5, ayah: 110, to: 118 },
    ],
  },
  {
    slug: "muhammad",
    nameHe: "מֻחַמַּד",
    nameAr: "مُحَمَّد",
    refs: [
      { surah: 3, ayah: 144 },
      { surah: 33, ayah: 40 },
      { surah: 47, ayah: 2 },
      { surah: 48, ayah: 29 },
    ],
  },
];

export function getProphet(slug: string): Prophet | undefined {
  return PROPHETS.find((p) => p.slug === slug);
}
