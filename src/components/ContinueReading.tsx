import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, ChevronLeft } from "lucide-react";
import { useReadingProgress } from "@/lib/reading-progress";
import { surahDisplayName } from "@/lib/surah-names-he";
import type { Locale } from "@/lib/i18n";

export function ContinueReading() {
  const { t, i18n } = useTranslation("pages");
  const lang = ((i18n.language?.split("-")[0] as Locale) || "he");
  const { progress } = useReadingProgress();
  if (!progress) return null;
  return (
    <section className="mx-auto mt-8 max-w-5xl px-4 sm:px-6">
      <Link
        to="/surah/$id"
        params={{ id: String(progress.surah) }}
        className="surface-card flex items-center justify-between gap-3 px-5 py-4 hover:border-primary/40"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("continueReading.label")}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-foreground">
              {t("continueReading.surahN", { n: progress.surah })} · {surahDisplayName(progress.surah, lang)}
            </div>
          </div>
        </div>
        <ChevronLeft className="h-4 w-4 text-muted-foreground ltr:rotate-180" />
      </Link>
    </section>
  );
}
