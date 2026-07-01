import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import {
  SUPPORTED_LOCALES,
  normalizeLocale,
  DEFAULT_LOCALE,
  setLocale,
  type Locale,
  LOCALE_DIR,
} from "@/lib/i18n";

/**
 * Custom hook for locale/language management.
 * Provides current locale and methods to change it.
 */
export function useLocale() {
  const { i18n } = useTranslation();
  const current: Locale = normalizeLocale(i18n.resolvedLanguage) ?? DEFAULT_LOCALE;
  const dir = LOCALE_DIR[current];
  const isRtl = dir === "rtl";

  const changeLocale = useCallback(
    (locale: Locale) => {
      setLocale(locale);
    },
    []
  );

  return {
    current,
    dir,
    isRtl,
    changeLocale,
    supportedLocales: SUPPORTED_LOCALES,
  };
}
