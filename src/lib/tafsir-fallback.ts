import type { Locale } from "@/lib/i18n";

export function getTafsirFallbackOrder(lang: Locale): Locale[] {
  if (lang === "he") return ["he", "ar", "en"];
  if (lang === "en") return ["en", "ar", "he"];
  return ["ar", "en", "he"];
}
