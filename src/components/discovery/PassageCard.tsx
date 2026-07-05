import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BookOpen } from "lucide-react";
import { fetchPassage } from "@/lib/translations-db";
import type { LocaleCode } from "@/lib/translations-db";

interface PassageCardProps {
  surah: number;
  ayahStart: number;
  ayahEnd: number;
  locale: LocaleCode;
  title?: string;
}

export function PassageCard({ surah, ayahStart, ayahEnd, locale, title }: PassageCardProps) {
  const range = ayahStart === ayahEnd ? `${ayahStart}` : `${ayahStart}–${ayahEnd}`;
  const q = useQuery({
    queryKey: ["passage", surah, ayahStart, ayahEnd, locale],
    queryFn: () => fetchPassage(surah, ayahStart, ayahEnd, locale),
    staleTime: 5 * 60_000,
  });

  return (
    <div className="surface-card overflow-hidden">
      <Link
        to="/surah/$id"
        params={{ id: String(surah) }}
        hash={`v-${ayahStart}`}
        className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 text-xs hover:bg-secondary/40"
      >
        <span className="font-medium text-primary">{title ?? `${surah}:${range}`}</span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          {surah}:{range}
        </span>
      </Link>
      <div className="space-y-3 px-4 py-3">
        {q.isLoading && (
          <p className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
          </p>
        )}
        {q.data?.map((v) => (
          <div key={v.ayah} className="space-y-1.5">
            <p className="font-quran text-right text-lg leading-loose text-foreground" dir="rtl">
              <span className="me-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-[10px] font-bold text-primary">
                {v.ayah}
              </span>
              {v.arabic}
            </p>
            {v.translation && v.translation !== v.arabic && (
              <p
                className={`text-sm text-muted-foreground ${locale === "ar" ? "font-reading-ar" : locale === "en" ? "font-reading-en" : "font-reading-he"}`}
                dir={locale === "en" ? "ltr" : "rtl"}
              >
                {v.translation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
