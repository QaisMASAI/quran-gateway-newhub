import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ShareButtons } from "@/components/ShareButtons";

interface DailyVerseContentProps {
  isLoading: boolean;
  error: boolean;
  surah: number;
  ayah: number;
  name: string;
  arabic: string;
  translation: string;
  lang: "he" | "ar" | "en";
}

export function DailyVerseContent({
  isLoading,
  error,
  surah,
  ayah,
  name,
  arabic,
  translation,
  lang,
}: DailyVerseContentProps) {
  const { t } = useTranslation("pages");

  if (isLoading) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">{t("dailyVerse.loading")}</p>
    );
  }

  if (error || !arabic) {
    return <p className="py-6 text-center text-sm text-destructive">{t("dailyVerse.error")}</p>;
  }

  return (
    <>
      <p
        className="font-quran text-right text-2xl leading-loose text-foreground sm:text-3xl"
        dir="rtl"
      >
        {arabic}
      </p>
      {lang !== "ar" && translation && translation !== arabic && (
        <p className="mt-4 text-[15px] text-foreground/85" dir={lang === "he" ? "rtl" : "ltr"}>
          {translation}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="text-xs">
          <span className="font-semibold text-primary">{name}</span>
          <span className="text-muted-foreground">
            {" "}
            · {surah}:{ayah}
          </span>
        </div>
        <Link
          to="/surah/$id"
          params={{ id: String(surah) }}
          search={{ q: undefined }}
          hash={`v-${ayah}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          {t("dailyVerse.openInSurah")} <ChevronLeft className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3">
        <ShareButtons
          surah={surah}
          ayah={ayah}
          surahName={name}
          arabic={arabic}
          hebrew={lang === "ar" ? arabic : translation}
        />
      </div>
    </>
  );
}
