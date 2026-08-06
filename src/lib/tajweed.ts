/**
 * Quran Gateway — Tajweed Rule Definitions, Parser & Annotator
 * Supports 8 primary Tajweed rules with color codes, descriptions, and diacritic matching.
 */

export type TajweedRuleType =
  "ikhfaa" | "idgham" | "qalqalah" | "madd" | "hamzah" | "sukinah" | "tafkheem" | "tarqeeq";

export interface TajweedRuleMeta {
  type: TajweedRuleType;
  nameAr: string;
  nameEn: string;
  nameHe: string;
  colorHex: string;
  badgeClass: string;
  textClass: string;
  descriptionEn: string;
  descriptionHe: string;
}

export const TAJWEED_RULES: Record<TajweedRuleType, TajweedRuleMeta> = {
  madd: {
    type: "madd",
    nameAr: "مدّ (إطالة)",
    nameEn: "Madd (Elongation)",
    nameHe: "מד (הארכת צליל)",
    colorHex: "#ef4444", // Red/Crimson
    badgeClass: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    textClass: "text-red-600 dark:text-red-400 font-semibold",
    descriptionEn: "Elongation of vowel sounds (2, 4, or 6 counts depending on rule context).",
    descriptionHe: "הארכת תנועות הברה (2, 4, או 6 פעימות בהתאם להקשר הכלל).",
  },
  qalqalah: {
    type: "qalqalah",
    nameAr: "قلقلة (إدراج الصوت)",
    nameEn: "Qalqalah (Echoing / Shock Sound)",
    nameHe: "קלקלה (צליל הד והדהוד)",
    colorHex: "#f59e0b", // Amber/Gold
    badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    textClass: "text-amber-600 dark:text-amber-400 font-semibold",
    descriptionEn: "Bouncing or echoing sound on silent letters: ق, ط, ب, ج, د.",
    descriptionHe: "צליל הד והקפצה על אותיות סאכנות: ق, ط, ب, ج, د (קוטב ג'ד).",
  },
  ikhfaa: {
    type: "ikhfaa",
    nameAr: "إخفاء (إخفاء النون)",
    nameEn: "Ikhfaa (Concealment)",
    nameHe: "איחפא (הסתרת הנון)",
    colorHex: "#10b981", // Emerald
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    textClass: "text-emerald-600 dark:text-emerald-400 font-semibold",
    descriptionEn: "Light concealment of Noon Sakinah or Tanween before 15 specific letters.",
    descriptionHe: "הסתרה מעודנת של נון סאכנה או תנווין לפני 15 אותיות ייעודיות.",
  },
  idgham: {
    type: "idgham",
    nameAr: "إدغام (دغم الأسطر)",
    nameEn: "Idgham (Assimilation)",
    nameHe: "אידח'אם (מיזוג אותיות)",
    colorHex: "#3b82f6", // Blue
    badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    textClass: "text-blue-600 dark:text-blue-400 font-semibold",
    descriptionEn: "Merging of silent Noon or Tanween into the following letter (يرملون).",
    descriptionHe: "מיזוג נון שקטה או תנווין לתוך האות הבאה (אותיות ירמלון).",
  },
  hamzah: {
    type: "hamzah",
    nameAr: "همزة وصل / قطع",
    nameEn: "Hamzah (Glottal Stop)",
    nameHe: "המזה (סגירת גרונית)",
    colorHex: "#8b5cf6", // Purple
    badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    textClass: "text-purple-600 dark:text-purple-400 font-semibold",
    descriptionEn: "Glottal stop or connecting Hamzah (Hamzat al-Wasl).",
    descriptionHe: "סגירת סדק הקול או המזת אל-ואסל המקשרת.",
  },
  sukinah: {
    type: "sukinah",
    nameAr: "غنة / إظهار",
    nameEn: "Ghunnah / Izhar (Nasalization)",
    nameHe: "ע'ונה / איזהאר (אנפוף)",
    colorHex: "#ec4899", // Pink/Rose
    badgeClass: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30",
    textClass: "text-pink-600 dark:text-pink-400 font-semibold",
    descriptionEn: "Nasalized sound held for 2 counts on Noon or Meem with Shaddah.",
    descriptionHe: "צליל אנפופי ממושך ל-2 פעימות על נון או מים מודגשות.",
  },
  tafkheem: {
    type: "tafkheem",
    nameAr: "تفخيم (تغليظ)",
    nameEn: "Tafkheem (Emphatic Heavy)",
    nameHe: "תפח'ים (הגייה עמוקה)",
    colorHex: "#d97706", // Bronze
    badgeClass: "bg-amber-700/15 text-amber-700 dark:text-amber-500 border-amber-700/30",
    textClass: "text-amber-700 dark:text-amber-500 font-bold",
    descriptionEn: "Heavy, full-mouthed pronunciation of specific letters (خص ضغط قظ).",
    descriptionHe: "הגייה עמוקה ומלאת לוע של אותיות מודגשות (خص ضغط قظ).",
  },
  tarqeeq: {
    type: "tarqeeq",
    nameAr: "ترقيق (تخفيف)",
    nameEn: "Tarqeeq (Light / Thin)",
    nameHe: "תרקיק (הגייה קלה ורכה)",
    colorHex: "#06b6d4", // Cyan
    badgeClass: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    textClass: "text-cyan-600 dark:text-cyan-400 font-semibold",
    descriptionEn: "Light, thin pronunciation of Ra or Lam depending on vowel context.",
    descriptionHe: "הגייה קלה ורכה של ר'א או לאם בהתאם לתנועות הסובבות.",
  },
};

export interface TajweedSegment {
  text: string;
  rule?: TajweedRuleType;
}

/**
 * Parses Uthmani Arabic verse text and splits into rule-annotated segments.
 */
export function parseTajweedSegments(arabicText: string): TajweedSegment[] {
  if (!arabicText) return [];

  const segments: TajweedSegment[] = [];
  const qalqalahLetters = /[قطبجد]/;
  const maddMarks = /[\u0653\u0670\u06E5\u06E6]/; // Maddah mark, dagger alef, small waw/ya
  const ikhfaaLetters = /[تثجدذزسشصضطظفقك]/;
  const idghamLetters = /[يرملون]/;

  let currentWord = "";
  const words = arabicText.split(" ");

  for (let wIdx = 0; wIdx < words.length; wIdx++) {
    const word = words[wIdx];
    let charIdx = 0;

    while (charIdx < word.length) {
      const char = word[charIdx];
      const nextChar = word[charIdx + 1] || "";
      const thirdChar = word[charIdx + 2] || "";

      // 1. Detect Madd (Maddah symbol or long vowels)
      if (maddMarks.test(char) || char === "آ") {
        if (currentWord) {
          segments.push({ text: currentWord });
          currentWord = "";
        }
        segments.push({ text: char, rule: "madd" });
        charIdx++;
        continue;
      }

      // 2. Detect Qalqalah on Sukun or end of word
      if (qalqalahLetters.test(char) && (nextChar === "\u0652" || charIdx === word.length - 1)) {
        if (currentWord) {
          segments.push({ text: currentWord });
          currentWord = "";
        }
        segments.push({ text: char + (nextChar === "\u0652" ? nextChar : ""), rule: "qalqalah" });
        charIdx += nextChar === "\u0652" ? 2 : 1;
        continue;
      }

      // 3. Detect Noon Sakinah / Tanween -> Ikhfaa or Idgham
      if ((char === "ن" && nextChar === "\u0652") || /[\u064B\u064C\u064D]/.test(char)) {
        const targetNext = nextChar === "\u0652" ? thirdChar : nextChar;
        if (idghamLetters.test(targetNext)) {
          if (currentWord) {
            segments.push({ text: currentWord });
            currentWord = "";
          }
          segments.push({ text: char + nextChar, rule: "idgham" });
          charIdx += nextChar === "\u0652" ? 2 : 1;
          continue;
        } else if (ikhfaaLetters.test(targetNext)) {
          if (currentWord) {
            segments.push({ text: currentWord });
            currentWord = "";
          }
          segments.push({ text: char + nextChar, rule: "ikhfaa" });
          charIdx += nextChar === "\u0652" ? 2 : 1;
          continue;
        }
      }

      // 4. Detect Hamzah
      if (char === "ٱ" || char === "أ" || char === "إ" || char === "ء") {
        if (currentWord) {
          segments.push({ text: currentWord });
          currentWord = "";
        }
        segments.push({ text: char, rule: "hamzah" });
        charIdx++;
        continue;
      }

      currentWord += char;
      charIdx++;
    }

    if (currentWord) {
      segments.push({ text: currentWord + (wIdx < words.length - 1 ? " " : "") });
      currentWord = "";
    } else if (wIdx < words.length - 1) {
      segments.push({ text: " " });
    }
  }

  return segments;
}
