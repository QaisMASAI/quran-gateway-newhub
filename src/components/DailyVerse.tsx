import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Sparkles, ChevronLeft } from "lucide-react";
import { surahDisplayName } from "@/lib/surah-names-he";
import { fetchVerseBilingual, type LocaleCode } from "@/lib/translations-db";
import { ShareButtons } from "./ShareButtons";

const ROTATION: { surah: number; ayah: number }[] = [
  { surah: 1, ayah: 1 },
  { surah: 2, ayah: 255 },
  { surah: 2, ayah: 286 },
  { surah: 3, ayah: 8 },
  { surah: 13, ayah: 28 },
  { surah: 17, ayah: 23 },
  { surah: 17, ayah: 80 },
  { surah: 24, ayah: 35 },
  { surah: 25, ayah: 63 },
  { surah: 39, ayah: 53 },
  { surah: 49, ayah: 13 },
  { surah: 55, ayah: 13 },
  { surah: 65, ayah: 3 },
  { surah: 94, ayah: 5 },
  { surah: 94, ayah: 6 },
  { surah: 103, ayah: 1 },
  { surah: 112, ayah: 1 },
  { surah: 113, ayah: 1 },
  { surah: 114, ayah: 1 },
];

function pickToday(): { surah: number; ayah: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  return ROTATION[day % ROTATION.length];
}

export function DailyVerse() {
  const { t, i18n } = useTranslation("pages");
  const lang = ((i18n.language?.split("-")[0] as LocaleCode) || "he");
  const pick = pickToday();
  const q = useQuery({
    queryKey: ["daily-verse-db", pick.surah, pick.ayah, lang],
    queryFn: () => fetchVerseBilingual(pick.surah, pick.ayah, lang),
    staleTime: 12 * 60 * 60 * 1000,
  });

  const name = surahDisplayName(pick.surah, lang === "ar" || lang === "en" ? lang : "he");

  return (
    <section className="mx-auto mt-10 max-w-3xl px-4 sm:px-6">
      <div className="surface-card relative overflow-hidden p-5 sm:p-7">
        <span className="arabesque-corner" style={{ top: 0, left: 0 }} aria-hidden />
        <span className="arabesque-corner" style={{ bottom: 0, right: 0, transform: "rotate(180deg)" }} aria-hidden />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> {t("dailyVerse.badge")}
          </div>

          {q.isLoading && (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("dailyVerse.loading")}</p>
          )}

          {(q.error || (q.data && !q.data.arabic)) && !q.isLoading && (
            <p className="py-6 text-center text-sm text-destructive">{t("dailyVerse.error")}</p>
          )}

          {q.data && q.data.arabic && (
            <>
              <p
                className="font-arabic text-right text-2xl leading-loose text-foreground sm:text-3xl"
                dir="rtl"
              >
                {q.data.arabic}
              </p>
              {lang !== "ar" && q.data.translation && (
                <p
                  className="mt-4 text-[15px] text-foreground/85"
                  dir={lang === "he" ? "rtl" : "ltr"}
                >
                  {q.data.translation}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <div className="text-xs">
                  <span className="font-semibold text-primary">{name}</span>
                  <span className="text-muted-foreground"> · {pick.surah}:{pick.ayah}</span>
                </div>
                <Link
                  to="/surah/$id"
                  params={{ id: String(pick.surah) }}
                  hash={`v-${pick.ayah}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {t("dailyVerse.openInSurah")} <ChevronLeft className="h-3 w-3" />
                </Link>
              </div>

              <div className="mt-3">
                <ShareButtons
                  surah={pick.surah}
                  ayah={pick.ayah}
                  surahName={name}
                  arabic={q.data.arabic}
                  hebrew={q.data.translation}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
