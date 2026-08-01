import { useTranslation } from "react-i18next";
import { Type, Sliders, LayoutList, Columns, Maximize2, Minimize2 } from "lucide-react";
import type { HadithReadingSettings } from "@/lib/hadith-user-store";

interface HadithTypographySettingsProps {
  settings: HadithReadingSettings;
  onUpdate: (partial: Partial<HadithReadingSettings>) => void;
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export function HadithTypographySettings({
  settings,
  onUpdate,
  focusMode,
  onToggleFocusMode,
}: HadithTypographySettingsProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const locale = i18n.language?.slice(0, 2) ?? "en";

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-card p-3 shadow-xs"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Font Picker */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Type className="h-4 w-4 text-primary" />
          <span>{locale === "he" ? "גופן" : locale === "ar" ? "الخط" : "Font"}:</span>
          <select
            value={settings.arabicFont}
            onChange={(e) =>
              onUpdate({ arabicFont: e.target.value as HadithReadingSettings["arabicFont"] })
            }
            aria-label="Arabic Font"
            className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="amiri">Amiri (أميري)</option>
            <option value="uthmani">Uthmani (عثماني)</option>
            <option value="scheherazade">Scheherazade</option>
            <option value="naskh">Traditional Naskh</option>
          </select>
        </div>

        {/* Font Size Adjusters */}
        <div className="flex items-center gap-2 border-l border-border/50 ps-3 text-xs text-muted-foreground">
          <Sliders className="h-4 w-4 text-primary" />
          <span>{locale === "he" ? "גודל" : locale === "ar" ? "الحجم" : "Size"}:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                onUpdate({ arabicFontSize: Math.max(16, settings.arabicFontSize - 2) })
              }
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background hover:bg-muted text-xs font-bold"
              title="Decrease size"
            >
              A-
            </button>
            <span className="w-6 text-center text-xs font-semibold text-foreground">
              {settings.arabicFontSize}
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdate({ arabicFontSize: Math.min(42, settings.arabicFontSize + 2) })
              }
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background hover:bg-muted text-xs font-bold"
              title="Increase size"
            >
              A+
            </button>
          </div>
        </div>

        {/* Layout Toggle */}
        <div className="flex items-center gap-1 border-l border-border/50 ps-3 text-xs">
          <button
            type="button"
            onClick={() => onUpdate({ layoutMode: "stacked" })}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors ${
              settings.layoutMode === "stacked"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <LayoutList className="h-3.5 w-3.5" />
            <span>{locale === "he" ? "טור" : locale === "ar" ? "عمودي" : "Stacked"}</span>
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ layoutMode: "side-by-side" })}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors ${
              settings.layoutMode === "side-by-side"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>{locale === "he" ? "צד לצד" : locale === "ar" ? "مزدوج" : "Side-by-Side"}</span>
          </button>
        </div>
      </div>

      {/* Focus Mode Button */}
      {onToggleFocusMode && (
        <button
          type="button"
          onClick={onToggleFocusMode}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-medium transition-colors ${
            focusMode
              ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "border-border bg-background text-muted-foreground hover:text-foreground"
          }`}
        >
          {focusMode ? (
            <>
              <Minimize2 className="h-3.5 w-3.5" />
              <span>
                {locale === "he"
                  ? "צא ממצב מיקוד"
                  : locale === "ar"
                    ? "إنهاء التركيز"
                    : "Exit Focus"}
              </span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5" />
              <span>
                {locale === "he" ? "מצב מיקוד" : locale === "ar" ? "وضع التركيز" : "Focus Mode"}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
