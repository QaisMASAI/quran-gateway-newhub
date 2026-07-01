import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { surahDisplayName } from "@/lib/surah-names-he";
import { loadSurahNamesFromDb } from "@/lib/surah-names-he";
import { fetchSurahBilingualFromDb } from "@/services/api";
import { normalizeLocale } from "@/lib/i18n";
import type { LocaleCode } from "@/lib/translations-db";
import { DailyVerseContent } from "./DailyVerse/DailyVerseContent";

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
  const lang = (normalizeLocale(i18n.language) ?? "he") as LocaleCode;
  const pick = pickToday();

  const q = useQuery({
    queryKey: ["daily-verse-db", pick.surah, pick.ayah, lang],
    queryFn: () => fetchSurahBilingualFromDb(pick.surah, lang),
    staleTime: 12 * 60 * 60 * 1000,
  });

  useQuery({
    queryKey: ["surah-names-db"],
    queryFn: () => loadSurahNamesFromDb(fetch),
    staleTime: Infinity,
  });

  const name = surahDisplayName(
    pick.surah,
    lang === "ar" || lang === "en" ? lang : "he"
  );

  const verse = q.data?.find((v) => v.ayah === pick.ayah);

  return (
    <section className="mx-auto mt-10 max-w-3xl px-4 sm:px-6">
      <div className="surface-card relative overflow-hidden p-5 sm:p-7">
        <span
          className="arabesque-corner"
          style={{ top: 0, left: 0 }}
          aria-hidden
        />
        <span
          className="arabesque-corner"
          style={{ bottom: 0, right: 0, transform: "rotate(180deg)" }}
          aria-hidden
        />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> {t("dailyVerse.badge")}
          </div>

          <DailyVerseContent
            isLoading={q.isLoading}
            error={!!q.error}
            surah={pick.surah}
            ayah={pick.ayah}
            name={name}
            arabic={verse?.arabic ?? ""}
            translation={verse?.translation ?? ""}
            lang={lang}
          />
        </div>
      </div>
    </section>
  );
}
