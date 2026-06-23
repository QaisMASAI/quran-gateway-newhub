import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LOCALE_DIR, normalizeLocale, DEFAULT_LOCALE } from "@/lib/i18n";

/**
 * Keeps <html lang> and <html dir> in sync with the active i18next language,
 * and exposes a skip-to-content link for keyboard / screen-reader users.
 */
export function DirectionProvider({ children }: { children: ReactNode }) {
  const { i18n, t } = useTranslation("common");
  const lang = normalizeLocale(i18n.resolvedLanguage) ?? DEFAULT_LOCALE;
  const dir = LOCALE_DIR[lang];

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.body.dir = dir;
  }, [lang, dir]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        {t("a11y.skipToContent")}
      </a>
      {children}
    </>
  );
}
