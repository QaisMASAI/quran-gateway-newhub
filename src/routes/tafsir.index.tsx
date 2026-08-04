import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import i18n, { normalizeLocale } from "@/lib/i18n";
import {
  BookOpen,
  Search,
  Columns,
  Sparkles,
  Bookmark,
  ScrollText,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  FileText,
  Layers,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TAFSIR_SOURCES_META, tafsirSourceName, type TafsirSourceMeta } from "@/lib/tafsir-sources";
import { TafsirScholarBioModal } from "@/components/tafsir/TafsirScholarBioModal";
import { TafsirNotesBookmarksModal } from "@/components/tafsir/TafsirNotesBookmarksModal";
import { SURAH_NAMES_AR, SURAH_NAMES_EN, SURAH_NAMES_HE } from "@/lib/surah-names-he";

export const Route = createFileRoute("/tafsir/")({
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    const title =
      locale === "ar"
        ? "أعظم منصة تفسير في العالم | نور القرآن والحديث"
        : locale === "he"
          ? "פלטפורמת תפסיר המתקדמת בעולם | נור קוראן וחדית׳"
          : "World's Most Advanced Tafsir Platform | Noor Quran & Hadith";
    const description =
      locale === "ar"
        ? "قارن بين أمهات تفاسير القرآن الكريمة: ابن كثير والجلالين والسعدي والقرطبي والطبري والبغوي مع تحليلات لغوية وإعراب ومقارنة العلماء بالذكاء الاصطناعي."
        : "Compare authentic classical Tafsir collections side-by-side with AI scholar analysis, grammar parsing, and verified source citations.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: TafsirHubPage,
});

function TafsirHubPage() {
  const locale = normalizeLocale(i18n.language) ?? "he";
  const isRtl = locale !== "en";
  const navigate = useNavigate();

  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedAyah, setSelectedAyah] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeScholarBio, setActiveScholarBio] = useState<TafsirSourceMeta | null>(null);
  const [notesBookmarksOpen, setNotesBookmarksOpen] = useState(false);

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  const handleJumpToVerse = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/tafsir/$surah/$ayah",
      params: { surah: String(selectedSurah), ayah: String(selectedAyah) },
    });
  };

  const featuredVerses = [
    { surah: 1, ayah: 1, name: locale === "ar" ? "الفاتحة" : "Al-Fatihah", verse: "1:1" },
    { surah: 2, ayah: 255, name: locale === "ar" ? "آية الكرسي" : "Ayat Al-Kursi", verse: "2:255" },
    { surah: 24, ayah: 35, name: locale === "ar" ? "آية النور" : "Ayat Al-Nur", verse: "24:35" },
    { surah: 36, ayah: 1, name: locale === "ar" ? "يس" : "Surah Ya-Sin", verse: "36:1" },
    { surah: 67, ayah: 1, name: locale === "ar" ? "الملك" : "Surah Al-Mulk", verse: "67:1" },
    { surah: 112, ayah: 1, name: locale === "ar" ? "الإخلاص" : "Surah Al-Ikhlas", verse: "112:1" },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <main id="main" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-secondary/30 p-6 md:p-10 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                <span>
                  {locale === "ar"
                    ? "المنصة العلمية الأحدث لتفسير القرآن الكريم"
                    : locale === "he"
                      ? "פלטפורמת הלימוד והתפסיר של הקוראן"
                      : "The Ultimate Tafsir Platform"}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                {locale === "ar"
                  ? "أعظم تجربة تفسير قرآنية على الإطلاق"
                  : locale === "he"
                    ? "חוויית לימוד תפסיר המתקדמת ביותר"
                    : "The World's Most Advanced Tafsir Platform"}
              </h1>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {locale === "ar"
                  ? "تصفح أمهات كتب التفسير بالمأثور والفقه واللغة، قارن بين التفاسير جنباً إلى جنب، واستفد من التحليل العلمي بالذكاء الاصطناعي مع التوثيق الكامل للمصادر."
                  : locale === "he"
                    ? "חקור את ספרי התפסיר המוסמכים בעולם: אבן כת׳יר, ג׳לאלין, אס-סعדי, קורטובי וטברי לצד ניתוח אקדמי וביאור שפה."
                    : "Explore authentic classical commentaries (Ibn Kathir, Al-Jalalayn, Al-Sa'di, Al-Qurtubi, Al-Tabari), compare Tafsirs side-by-side, and analyze difficult Arabic with verified source citations."}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/tafsir/$surah/$ayah"
                  params={{ surah: "2", ayah: "255" }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {locale === "ar"
                      ? "افتح تفسير آية الكرسي (2:255)"
                      : locale === "he"
                        ? "פתחי תפסיר פסוק הכסא (2:255)"
                        : "Explore Ayat al-Kursi (2:255)"}
                  </span>
                </Link>

                <Link
                  to="/tafsir/compare"
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary transition-all"
                >
                  <Columns className="h-4 w-4 text-primary" />
                  <span>
                    {locale === "ar"
                      ? "ورشة مقارنة التفاسير"
                      : locale === "he"
                        ? "סדנת השוואת תפסיקים"
                        : "Side-by-Side Comparison Workspace"}
                  </span>
                </Link>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNotesBookmarksOpen(true)}
                  className="rounded-2xl gap-2 text-sm font-semibold border-border"
                >
                  <Bookmark className="h-4 w-4 text-amber-500" />
                  <span>{locale === "ar" ? "المحفوظات والملاحظات" : "My Bookmarks & Notes"}</span>
                </Button>
              </div>
            </div>

            {/* Quick Verse Launcher Card */}
            <form
              onSubmit={handleJumpToVerse}
              className="w-full md:w-80 rounded-2xl border border-border/80 bg-card p-5 shadow-lg space-y-4"
            >
              <div className="flex items-center gap-2 font-bold text-sm text-foreground border-b border-border/60 pb-3">
                <Sliders className="h-4 w-4 text-primary" />
                <span>
                  {locale === "ar"
                    ? "الانتقال السريع لآية"
                    : locale === "he"
                      ? "מעבר מהיר לפסוק"
                      : "Jump to Any Verse"}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label htmlFor="tafsir-surah-select" className="block text-muted-foreground font-medium mb-1">
                    {locale === "ar" ? "اختر السورة" : "Select Surah"}
                  </label>
                  <select
                    id="tafsir-surah-select"
                    value={selectedSurah}
                    onChange={(e) => setSelectedSurah(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Array.from({ length: 114 }, (_, i) => i + 1).map((s) => (
                      <option key={s} value={s}>
                        {s}. {SURAH_NAMES_AR[s]} ({SURAH_NAMES_EN[s]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tafsir-ayah-input" className="block text-muted-foreground font-medium mb-1">
                    {locale === "ar" ? "رقم الآية" : "Ayah Number"}
                  </label>
                  <input
                    id="tafsir-ayah-input"
                    type="number"
                    min={1}
                    max={286}
                    value={selectedAyah}
                    onChange={(e) => setSelectedAyah(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button type="submit" className="w-full rounded-xl font-bold gap-2">
                  <span>{locale === "ar" ? "افتح التفسير" : "Open Tafsir"}</span>
                  <ArrowIcon className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Major Tafsir Collections Grid */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span>
                  {locale === "ar"
                    ? "مكتبة أمهات التفاسير المعتمدة"
                    : locale === "he"
                      ? "ספריית התפסיקים המוסמכים"
                      : "Major Classical & Contemporary Tafsirs"}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "ar"
                  ? "8 تفاسير علمية شاملة مغطية لكافة المناهج التفسيرية (المأثور، الفقه، اللغوي، والمعاصر)"
                  : "8 complete scholarly commentaries covering Bil-Ma'thur, Fiqh rulings, linguistic analysis, and modern practical guidance."}
              </p>
            </div>

            <Link
              to="/tafsir/compare"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>{locale === "ar" ? "افتح مقارنة الكل" : "Compare All Collections"}</span>
              <ArrowIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TAFSIR_SOURCES_META.map((meta) => {
              const title = tafsirSourceName(meta, locale);
              const author =
                locale === "ar"
                  ? meta.author_ar
                  : locale === "en"
                    ? meta.author_en
                    : meta.author_he;
              const description =
                locale === "ar"
                  ? meta.description_ar
                  : locale === "en"
                    ? meta.description_en
                    : meta.description_he;

              return (
                <div
                  key={meta.key}
                  className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.badgeColor}`}
                      >
                        {locale === "ar"
                          ? meta.methodologyLabel_ar
                          : locale === "he"
                            ? meta.methodologyLabel_he
                            : meta.methodologyLabel_en}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {meta.era.split("/")[0]}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{author}</p>
                    </div>

                    <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                      {description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-border/50 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveScholarBio(meta)}
                      className="text-muted-foreground hover:text-primary font-medium transition-colors"
                    >
                      {locale === "ar" ? "ترجمة المفسر" : "Scholar Bio"}
                    </button>

                    <Link
                      to="/tafsir/$surah/$ayah"
                      params={{ surah: "2", ayah: "255" }}
                      className="inline-flex items-center gap-1 font-bold text-primary group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>{locale === "ar" ? "تصفح" : "Explore"}</span>
                      <ArrowIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Key Quranic Passages */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-primary" />
              <span>
                {locale === "ar" ? "تفاسير مختارة لآيات عظيمة" : "Featured Key Verses Commentary"}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {featuredVerses.map((v) => (
              <Link
                key={v.verse}
                to="/tafsir/$surah/$ayah"
                params={{ surah: String(v.surah), ayah: String(v.ayah) }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border/60 bg-secondary/30 hover:bg-primary/10 hover:border-primary/40 transition-all text-center group"
              >
                <span className="font-mono text-xs font-bold text-primary mb-1">
                  Verse {v.verse}
                </span>
                <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  {v.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Scholar Bio Modal & Bookmarks Modal */}
        <TafsirScholarBioModal
          isOpen={!!activeScholarBio}
          onClose={() => setActiveScholarBio(null)}
          meta={activeScholarBio}
          locale={locale}
        />

        <TafsirNotesBookmarksModal
          isOpen={notesBookmarksOpen}
          onClose={() => setNotesBookmarksOpen(false)}
          locale={locale}
        />
      </main>
    </div>
  );
}
