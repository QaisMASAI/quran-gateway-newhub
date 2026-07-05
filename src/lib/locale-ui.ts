import type { Locale } from "@/lib/i18n";

export function uiFontClass(locale: Locale): "font-ui-ar" | "font-ui-en" | "font-ui-he" {
  if (locale === "ar") return "font-ui-ar";
  if (locale === "en") return "font-ui-en";
  return "font-ui-he";
}

export function tafsirFontClass(
  locale: Locale,
): "font-tafsir-hadith-ar" | "font-tafsir-hadith-en" | "font-tafsir-hadith-he" {
  if (locale === "ar") return "font-tafsir-hadith-ar";
  if (locale === "en") return "font-tafsir-hadith-en";
  return "font-tafsir-hadith-he";
}

export function readingFontClass(locale: Locale): "font-reading-ar" | "font-reading-en" | "font-reading-he" {
  if (locale === "ar") return "font-reading-ar";
  if (locale === "en") return "font-reading-en";
  return "font-reading-he";
}

export function localeTextDir(locale: Locale): "ltr" | "rtl" {
  return locale === "en" ? "ltr" : "rtl";
}