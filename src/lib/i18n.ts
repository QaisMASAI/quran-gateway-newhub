import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import heCommon from "@/locales/he/common.json";
import arCommon from "@/locales/ar/common.json";
import enCommon from "@/locales/en/common.json";
import heContent from "@/locales/he/content.json";
import arContent from "@/locales/ar/content.json";
import enContent from "@/locales/en/content.json";
import hePages from "@/locales/he/pages.json";
import arPages from "@/locales/ar/pages.json";
import enPages from "@/locales/en/pages.json";

export type Locale = "he" | "ar" | "en";

export const SUPPORTED_LOCALES: Locale[] = ["he", "ar", "en"];
export const DEFAULT_LOCALE: Locale = "he";

export const LOCALE_DIR: Record<Locale, "rtl" | "ltr"> = {
  he: "rtl",
  ar: "rtl",
  en: "ltr",
};

export const LOCALE_LABEL: Record<Locale, string> = {
  he: "עברית",
  ar: "العربية",
  en: "English",
};

const STORAGE_KEY = "qc:locale";

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        he: { common: heCommon, content: heContent, pages: hePages },
        ar: { common: arCommon, content: arContent, pages: arPages },
        en: { common: enCommon, content: enContent, pages: enPages },
      },
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: SUPPORTED_LOCALES,
      defaultNS: "common",
      ns: ["common", "content", "pages"],
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        lookupLocalStorage: STORAGE_KEY,
        caches: ["localStorage"],
      },
      react: { useSuspense: false },
    });
}

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (SUPPORTED_LOCALES as string[]).includes(value);
}

export function normalizeLocale(value: string | undefined | null): Locale | null {
  if (!value) return null;
  const base = value.toLowerCase().split("-")[0];
  return isLocale(base) ? base : null;
}

/**
 * Apply direction to all necessary DOM elements
 */
function applyDirectionGlobally(dir: "rtl" | "ltr", lang: Locale) {
  if (typeof document === "undefined") return;
  
  // Update html element
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  
  // Update body element
  document.body.dir = dir;
  
  // Update root/app container if it exists
  const root = document.getElementById("root");
  if (root) {
    root.dir = dir;
    root.lang = lang;
  }
  
  // Store for React components to subscribe to
  window.__i18nDir = dir;
  window.__i18nLang = lang;
}

export function setLocale(locale: Locale) {
  void i18n.changeLanguage(locale);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    const dir = LOCALE_DIR[locale];
    applyDirectionGlobally(dir, locale);
    
    // Dispatch custom event so components can react to language changes
    window.dispatchEvent(
      new CustomEvent("i18n:change", {
        detail: { locale, dir },
      })
    );
  }
}

export default i18n;

// Initialize direction on app startup
if (typeof window !== "undefined") {
  const storedLocale = localStorage.getItem(STORAGE_KEY);
  const locale = normalizeLocale(storedLocale) ?? DEFAULT_LOCALE;
  const dir = LOCALE_DIR[locale];
  applyDirectionGlobally(dir, locale);
}

// Type augmentation for global variables
declare global {
  interface Window {
    __i18nDir?: "rtl" | "ltr";
    __i18nLang?: Locale;
  }
}
