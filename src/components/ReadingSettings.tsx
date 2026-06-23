import { useEffect, useRef, useState } from "react";
import { Settings2, Type, Sparkles, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useReadingSettings } from "@/lib/reading-settings";

export function ReadingSettings() {
  const [open, setOpen] = useState(false);
  const [settings, update] = useReadingSettings();
  const ref = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation("common");

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const pct = Math.round(settings.arabicScale * 100);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        aria-label={t("ui.reading.settings")}
      >
        <Settings2 className="h-3.5 w-3.5" />
        <span>{t("ui.reading.settings")}</span>
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-2 w-72 rounded-xl border border-border bg-background p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("ui.reading.settings")}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={t("ui.reading.close")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px] text-foreground/80">
              <span className="inline-flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-primary" />
                {t("ui.reading.arabicSize")}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{pct}%</span>
            </div>
            <input
              type="range"
              min={75}
              max={180}
              step={5}
              value={pct}
              onChange={(e) => update({ arabicScale: Number(e.target.value) / 100 })}
              className="w-full accent-primary"
              aria-label={t("ui.reading.arabicSize")}
            />
            <div className="flex gap-1.5">
              {[0.85, 1, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => update({ arabicScale: s })}
                  className={`flex-1 rounded-md border px-2 py-1 text-[11px] transition-colors ${
                    Math.abs(settings.arabicScale - s) < 0.01
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {Math.round(s * 100)}%
                </button>
              ))}
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {t("ui.reading.stripTashkil")}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.stripTashkil}
              onChange={(e) => update({ stripTashkil: e.target.checked })}
              className="mt-1 h-4 w-4 accent-primary"
            />
          </label>
        </div>
      )}
    </div>
  );
}

