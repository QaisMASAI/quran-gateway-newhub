import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, LOCALE_LABEL, setLocale, type Locale, isLocale, DEFAULT_LOCALE } from "@/lib/i18n";

export function LocaleSwitcher() {
  const { t, i18n } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const current: Locale = isLocale(i18n.resolvedLanguage) ? i18n.resolvedLanguage : DEFAULT_LOCALE;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("a11y.changeLanguage")}
        className="inline-flex h-9 min-w-11 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{LOCALE_LABEL[current]}</span>
        <span className="sm:hidden uppercase">{current}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t("common.language")}
          className="absolute end-0 mt-2 w-44 rounded-xl border border-border bg-background p-1 shadow-soft z-50"
        >
          {SUPPORTED_LOCALES.map((loc) => {
            const active = loc === current;
            return (
              <li key={loc}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLocale(loc);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
                >
                  <span>{LOCALE_LABEL[loc]}</span>
                  {active && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
