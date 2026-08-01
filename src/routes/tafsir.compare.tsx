import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import i18n, { normalizeLocale } from "@/lib/i18n";
import { Columns, BookOpen, Sliders, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { fetchTafsirMultiSourceFn } from "@/lib/tafsir-api.functions";
import { TafsirCompareView } from "@/components/tafsir/TafsirCompareView";
import { TafsirScholarBioModal } from "@/components/tafsir/TafsirScholarBioModal";
import { useTafsirUserStore } from "@/lib/tafsir-user-store";
import { SURAH_NAMES_AR, SURAH_NAMES_EN } from "@/lib/surah-names-he";
import { fetchSurahBilingual } from "@/lib/translations-db";
import type { TafsirSourceMeta } from "@/lib/tafsir-sources";

export const Route = createFileRoute("/tafsir/compare")({
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    const title =
      locale === "ar"
        ? "مقارنة التفاسير جنباً إلى جنب | ورشة التحليل المقارن"
        : "Side-by-Side Tafsir Comparative Studio | Noor Quran";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: "Compare multiple classical Tafsir books side-by-side for any Quranic verse.",
        },
      ],
    };
  },
  component: TafsirComparePage,
});

function TafsirComparePage() {
  const locale = normalizeLocale(i18n.language) ?? "he";
  const isRtl = locale !== "en";
  const navigate = useNavigate();

  const [surah, setSurah] = useState<number>(2);
  const [ayah, setAyah] = useState<number>(255);
  const [selectedScholarBio, setSelectedScholarBio] = useState<TafsirSourceMeta | null>(null);

  const { compareSources, setCompareSources } = useTafsirUserStore();
  const fetchMultiFn = useServerFn(fetchTafsirMultiSourceFn);

  const { data: verseRows } = useQuery({
    queryKey: ["quran-verse-compare", surah, locale],
    queryFn: () => fetchSurahBilingual(surah, locale),
    staleTime: 5 * 60_000,
  });

  const verseRow = verseRows?.find((r) => r.ayah === ayah);
  const arabicText = verseRow?.arabic || "";
  const translationText = verseRow?.translation || "";
  const surahName = SURAH_NAMES_AR[surah] || `Surah ${surah}`;

  const { data: multiTafsirData, isLoading } = useQuery({
    queryKey: ["tafsir-multi-workspace", surah, ayah, compareSources, locale],
    queryFn: () =>
      fetchMultiFn({
        data: { surah, ayah, sourceKeys: compareSources, lang: locale },
      }),
    staleTime: 10 * 60_000,
  });

  return (
    <div className="min-h-screen bg-background pb-16" dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* Header Title Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-3xl border border-primary/20 bg-gradient-to-r from-card to-secondary/30 p-6 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Columns className="h-4 w-4" />
              <span>
                {locale === "ar"
                  ? "ورشة المقارنة العلمية المباشرة"
                  : "Side-by-Side Comparative Workspace"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground">
              {locale === "ar" ? "مقارنة التفاسير جنباً إلى جنب" : "Side-by-Side Tafsir Studio"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {locale === "ar"
                ? "اختر السورة والآية، وقارن بين ابن كثير والجلالين والسعدي والقرطبي في شاشة واحدة متزامنة."
                : "Select any verse and compare interpretations side-by-side across multiple classical collections."}
            </p>
          </div>

          {/* Verse Picker */}
          <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-xs">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-0.5">
                Surah
              </label>
              <select
                value={surah}
                onChange={(e) => setSurah(Number(e.target.value))}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground"
              >
                {Array.from({ length: 114 }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>
                    {s}. {SURAH_NAMES_AR[s]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-0.5">
                Ayah
              </label>
              <input
                type="number"
                min={1}
                max={286}
                value={ayah}
                onChange={(e) => setAyah(Number(e.target.value))}
                className="w-20 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground"
              />
            </div>

            <Link
              to="/tafsir/$surah/$ayah"
              params={{ surah: String(surah), ayah: String(ayah) }}
              className="mt-4 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all"
            >
              {locale === "ar" ? "افتح بالتفصيل" : "Full View"}
            </Link>
          </div>
        </div>

        {/* Selected Verse Display */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-2">
          <p className="text-xl md:text-2xl font-serif text-right text-foreground leading-loose">
            {arabicText || "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ"}
          </p>
          <p className="text-xs text-muted-foreground italic">{translationText}</p>
        </div>

        {/* Main Comparison Component */}
        <TafsirCompareView
          surah={surah}
          ayah={ayah}
          surahName={surahName}
          arabicText={arabicText}
          translationText={translationText}
          compareItems={multiTafsirData || []}
          selectedSources={compareSources}
          onUpdateSources={(s) => setCompareSources(s)}
          onOpenScholarBio={(m) => setSelectedScholarBio(m)}
          locale={locale}
        />

        <TafsirScholarBioModal
          isOpen={!!selectedScholarBio}
          onClose={() => setSelectedScholarBio(null)}
          meta={selectedScholarBio}
          locale={locale}
        />
      </main>
    </div>
  );
}
