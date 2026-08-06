/**
 * Quran Gateway — Advanced Bidi, Pluralization, and Regional Localization
 * Supports Arabic (6-category plurals), Hebrew (gender/number agreement), and English,
 * plus future expansion for Urdu (ur), Farsi (fa), and Turkish (tr).
 */

import type { Locale } from "@/lib/i18n";

/**
 * Arabic Plural Categories according to CLDR rules:
 * - zero (0)
 * - one (1)
 * - two (2)
 * - few (3-10)
 * - many (11-99)
 * - other (100+)
 */
export type ArabicPluralCategory = "zero" | "one" | "two" | "few" | "many" | "other";

export function getArabicPluralCategory(count: number): ArabicPluralCategory {
  const abs = Math.abs(count);
  if (abs === 0) return "zero";
  if (abs === 1) return "one";
  if (abs === 2) return "two";
  const mod100 = abs % 100;
  if (mod100 >= 3 && mod100 <= 10) return "few";
  if (mod100 >= 11 && mod100 <= 99) return "many";
  return "other";
}

/**
 * Format Ayah count with correct pluralization across languages
 */
export function formatPluralVerses(count: number, locale: Locale): string {
  if (locale === "ar") {
    const category = getArabicPluralCategory(count);
    switch (category) {
      case "zero":
        return "لا يوجد آيات";
      case "one":
        return "آية واحدة";
      case "two":
        return "آيتان";
      case "few":
        return `${count} آيات`;
      case "many":
        return `${count} آيةً`;
      case "other":
        return `${count} آية`;
    }
  }

  if (locale === "he") {
    if (count === 0) return "אין פסוקים";
    if (count === 1) return "פסוק אחד";
    if (count === 2) return "שני פסוקים";
    return `${count} פסוקים`;
  }

  // Default English / LTR
  if (count === 0) return "0 verses";
  if (count === 1) return "1 verse";
  return `${count} verses`;
}

/**
 * Bidirectional (Bidi) Isolation Wrappers
 * Prevents text direction corruption when embedding LTR text inside RTL paragraphs or vice versa.
 */
export const BIDI_CHARS = {
  LRM: "\u200E", // Left-to-Right Mark
  RLM: "\u200F", // Right-to-Left Mark
  LRE: "\u202A", // Left-to-Right Embedding
  RLE: "\u202B", // Right-to-Left Embedding
  PDF: "\u202C", // Pop Directional Format
  LRI: "\u2066", // Left-to-Right Isolate
  RLI: "\u2067", // Right-to-Left Isolate
  FSI: "\u2068", // First Strong Isolate
  PXI: "\u2069", // Pop Directional Isolate
};

export function wrapBidiIsolate(text: string, textDir?: "ltr" | "rtl"): string {
  if (!text) return "";
  if (textDir === "ltr") {
    return `${BIDI_CHARS.LRI}${text}${BIDI_CHARS.PXI}`;
  }
  if (textDir === "rtl") {
    return `${BIDI_CHARS.RLI}${text}${BIDI_CHARS.PXI}`;
  }
  return `${BIDI_CHARS.FSI}${text}${BIDI_CHARS.PXI}`;
}

/**
 * Locale-aware Number Formatter (Arabic-Indic digits vs Eastern Arabic vs Western Arabic)
 */
export function formatLocalizedNumber(num: number, locale: Locale, useNativeDigits = true): string {
  if (!useNativeDigits || locale === "en") {
    return num.toLocaleString("en-US");
  }

  if (locale === "ar") {
    return num.toLocaleString("ar-EG");
  }

  if (locale === "he") {
    return num.toLocaleString("he-IL");
  }

  return num.toString();
}

/**
 * Locale-aware Hijri Date Formatter
 */
export function formatHijriDate(date: Date = new Date(), locale: Locale = "ar"): string {
  try {
    const localeMap: Record<Locale, string> = {
      ar: "ar-SA-u-ca-islamic-umalqura",
      he: "he-IL-u-ca-islamic",
      en: "en-US-u-ca-islamic-umalqura",
    };

    return new Intl.DateTimeFormat(localeMap[locale] || "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}
