import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n, { normalizeLocale, type Locale } from "@/lib/i18n";
import { Header } from "@/components/Header";
import {
  Search,
  Compass,
  Network,
  Clock,
  MapPin,
  ChevronLeft,
  Sparkles,
  UserCheck,
  ScrollText,
  Map,
  BookMarked,
  GraduationCap,
  Layers,
  ArrowRight,
  Loader2,
  Heart,
  Landmark,
} from "lucide-react";
import { listAllEntities, pickLocale, type KnowledgeEntity } from "@/lib/knowledge";
import { PremiumDiscoveryHub } from "@/components/discovery/PremiumDiscoveryHub";

export const Route = createFileRoute("/learn/")({
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    const title =
      locale === "ar"
        ? "بوابة المعرفة القرآنية والإسلامية | نور"
        : locale === "en"
          ? "Quranic Knowledge & Learning Hub | Noor"
          : "מרכז הידע והלמידה הקוראני | נור";
    const description =
      locale === "ar"
        ? "بوابة معرفية شاملة تعرّض مواضيع القرآن، قصص الأنبياء، الأحداث التاريخية، الأماكن المقدسة والمفاهيم العقائدية."
        : locale === "en"
          ? "Comprehensive Islamic knowledge directory: Quranic topics, prophets, historical stories, events, places, and theological concepts."
          : "פורטל ידע מקיף: נושאי קוראן, סיפורי נביאים, אירועים היסטוריים, מקומות קדושים ומושגי אמונה.";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "/learn" },
      ],
      links: [{ rel: "canonical", href: "/learn" }],
    };
  },
  component: LearnIndexPage,
});

export function LearnIndexPage() {
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const [searchQuery, setSearchQuery] = useState("");

  const q = useQuery({
    queryKey: ["all-entities"],
    queryFn: listAllEntities,
    staleTime: 5 * 60_000,
  });

  const categories = useMemo(() => {
    return [
      {
        id: "topics",
        to: "/topics",
        title:
          locale === "ar" ? "مواضيع القرآن" : locale === "he" ? "נושאי הקورאן" : "Quranic Topics",
        subtitle:
          locale === "ar"
            ? "فهرس موضوعي شامل"
            : locale === "he"
              ? "אינדקס נושאים מקיף"
              : "Thematic Quranic Index",
        description:
          locale === "ar"
            ? "التوحيد، الصلاة، الصبر، الرحمة، الأخلاق، العدل والإنفاق."
            : locale === "he"
              ? "ייחוד האל, תפילה, סבלנות, רחמים, מוסר וצדקה."
              : "Monotheism, prayer, patience, mercy, morality, and justice.",
        icon: Sparkles,
        color:
          "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/30",
        badge: locale === "ar" ? "الفهرس" : locale === "he" ? "אינדקס" : "Index",
      },
      {
        id: "prophets",
        to: "/prophets",
        title:
          locale === "ar"
            ? "الأنبياء والرسل"
            : locale === "he"
              ? "נביאי האל ושליחיו"
              : "Prophets & Messengers",
        subtitle:
          locale === "ar"
            ? "سير وأسماء الأنبياء"
            : locale === "he"
              ? "סיפורי נביאי הקוראן"
              : "Lives of 25+ Prophets",
        description:
          locale === "ar"
            ? "قصص آدم، نوح، إبراهيم، موسى، عيسى ومحمد صلوات الله عليهم."
            : locale === "he"
              ? "סיפורי אדם, נח, אברהם, משה, ישוע ומוחמד עליהם השלום."
              : "Stories of Adam, Noah, Abraham, Moses, Jesus & Muhammad ﷺ.",
        icon: UserCheck,
        color:
          "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        badge: locale === "ar" ? "25+ نبي" : locale === "he" ? "25+ נביאים" : "25+ Prophets",
      },
      {
        id: "stories",
        to: "/stories",
        title:
          locale === "ar" ? "قصص القرآن" : locale === "he" ? "סיפורי הקוראן" : "Quranic Stories",
        subtitle:
          locale === "ar"
            ? "العبر والدروس القرآنية"
            : locale === "he"
              ? "לקחים ומוסר השכל"
              : "Narratives & Moral Lessons",
        description:
          locale === "ar"
            ? "أصحاب الكهف، ذو القرنين، لقمان الحكيم، أصحاب الفيل وقارون."
            : locale === "he"
              ? "אנשי המערה, דול-קרניין, לוקמאן החכם, אנשי הפיל וקרון."
              : "People of the Cave, Dhul-Qarnayn, Luqman, and Qarun.",
        icon: ScrollText,
        color: "from-teal-500/15 to-teal-500/5 text-teal-600 dark:text-teal-400 border-teal-500/30",
        badge: locale === "ar" ? "قصص وعبر" : locale === "he" ? "סיפורים" : "Stories",
      },
      {
        id: "events",
        to: "/events",
        title:
          locale === "ar"
            ? "الأحداث التاريخية"
            : locale === "he"
              ? "אירועים היסטוריים"
              : "Historical Events",
        subtitle:
          locale === "ar"
            ? "محطات السيرة النبوية"
            : locale === "he"
              ? "אבני דרך בסירה"
              : "Prophetic Timeline & Wars",
        description:
          locale === "ar"
            ? "الهجرة النبوية، غزوة بدر، أحد، الخندق، فتح مكة والإسراء."
            : locale === "he"
              ? "ההג'רה, קרב בדר, אוחוד, כיבוש מכה ומסע הלילה."
              : "The Hijrah, Battle of Badr, Uhud, Conquest of Mecca, and Isra.",
        icon: Clock,
        color: "from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/30",
        badge: locale === "ar" ? "التأريخ" : locale === "he" ? "היסטוריה" : "History",
      },
      {
        id: "scholars",
        to: "/scholars",
        title:
          locale === "ar"
            ? "علماء الأمة والمفسرون"
            : locale === "he"
              ? "חכמי האומה ומפרשיה"
              : "Scholars & Mufassirun",
        subtitle:
          locale === "ar"
            ? "أئمة التفسير والحديث"
            : locale === "he"
              ? "אימאמים וחוקרי תפסיר"
              : "Imams & Exegetes",
        description:
          locale === "ar"
            ? "الإمام الطبري، ابن كثير، القرطبي، البخاري، مسلم والنووي."
            : locale === "he"
              ? "אבן כתי'ר, אימאם אל-טברי, אל-בוח'ארי, מוסלים וא-נוואווי."
              : "Imam Al-Tabari, Ibn Kathir, Al-Qurtubi, Al-Bukhari, and An-Nawawi.",
        icon: GraduationCap,
        color:
          "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/30",
        badge: locale === "ar" ? "علماء" : locale === "he" ? "חוקרים" : "Scholars",
      },
      {
        id: "companions",
        to: "/companions",
        title:
          locale === "ar"
            ? "الصحابة الكرام"
            : locale === "he"
              ? "הסחאבה (החברים)"
              : "Companions (Sahabah)",
        subtitle:
          locale === "ar"
            ? "جيل التنزيل الرائد"
            : locale === "he"
              ? "דור ההתגלות"
              : "Generations of Revelation",
        description:
          locale === "ar"
            ? "أبو بكر، عمر، عثمان، علي، عائشة أم المؤمنين، وابن عباس."
            : locale === "he"
              ? "אבו בכר, עומר, עות'מאן, עלי, עאישה ועבדאללה בן עבאס."
              : "Abu Bakr, Umar, Uthman, Ali, Aisha, and Ibn Abbas.",
        icon: UserCheck,
        color:
          "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        badge: locale === "ar" ? "صحابة" : locale === "he" ? "סחאبة" : "Sahabah",
      },
      {
        id: "books",
        to: "/books",
        title:
          locale === "ar"
            ? "أمهات الكتب والمصنفات"
            : locale === "he"
              ? "ספרי היסוד"
              : "Classical Books & Texts",
        subtitle:
          locale === "ar"
            ? "كتب الحديث والتفسير"
            : locale === "he"
              ? "ספרי חדית' ותפסיר"
              : "Primary Sources",
        description:
          locale === "ar"
            ? "صحيح البخاري، صحيح مسلم، تفسير ابن كثير، والموطأ."
            : locale === "he"
              ? "צחיח אל-בוח'ארי, צחיח מוסלים, תפסיר אבן כתי'ר ואל-מוואטא."
              : "Sahih al-Bukhari, Sahih Muslim, Tafsir Ibn Kathir, and Al-Muwatta.",
        icon: BookMarked,
        color: "from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/30",
        badge: locale === "ar" ? "كتب" : locale === "he" ? "ספרים" : "Books",
      },
      {
        id: "duas",
        to: "/duas",
        title:
          locale === "ar"
            ? "الأدعية والأذكار"
            : locale === "he"
              ? "תפילות ודועאא"
              : "Du'as & Supplications",
        subtitle:
          locale === "ar"
            ? "دعاء القرآن والسنة"
            : locale === "he"
              ? "תپילות הקוראן והסונה"
              : "Quranic & Prophetic Prayers",
        description:
          locale === "ar"
            ? "دعاء يونس، القنوت، سيد الاستغفار، وأدعية القرآن الكبرى."
            : locale === "he"
              ? "תפילת יונה, דועאא אל-קנוט, סייד אל-אסתע'פאר ותפילות הקוראן."
              : "Dua of Jonah, Al-Qunoot, Sayyid al-Istighfar, and Rabbana duas.",
        icon: Heart,
        color: "from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/30",
        badge: locale === "ar" ? "أدعية" : locale === "he" ? "תפילות" : "Du'as",
      },
      {
        id: "mosques",
        to: "/mosques",
        title:
          locale === "ar"
            ? "المساجد والجوامع الكبرى"
            : locale === "he"
              ? "המסגדים הקדושים"
              : "Holiest Mosques",
        subtitle:
          locale === "ar"
            ? "المساجد الثلاثة والمشاهد"
            : locale === "he"
              ? "שלושת המסגדים הקדושים"
              : "Sacred Sanctuaries",
        description:
          locale === "ar"
            ? "المسجد الحرام بمكة، المسجد النبوي بالمدينة، والمسجد الأقصى."
            : locale === "he"
              ? "המסגד החראם במכה, מסגד הנביא במדינה ומסגד אל-אקצא בירושלים."
              : "Al-Masjid Al-Haram, Al-Masjid An-Nabawi, and Al-Masjid Al-Aqsa.",
        icon: Landmark,
        color:
          "from-purple-500/15 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/30",
        badge: locale === "ar" ? "مساجد" : locale === "he" ? "מסגדים" : "Mosques",
      },
      {
        id: "concepts",
        to: "/concepts",
        title:
          locale === "ar"
            ? "المفاهيم والأمم"
            : locale === "he"
              ? "מושגים ועמים"
              : "Concepts & Nations",
        subtitle:
          locale === "ar"
            ? "العقيدة والأمم السابقة"
            : locale === "he"
              ? "מושגי אמונה ועמים עתיקים"
              : "Theology & Ancient Nations",
        description:
          locale === "ar"
            ? "المفاهيم العقائدية الكبرى وقصص قوم عاد وثمود وقوم فرعون."
            : locale === "he"
              ? "מושגי יסוד באמונה וסיפורי עאד, ת'מוד ועם פרעה."
              : "Core theological concepts, afterlife, angels, and ancient nations.",
        icon: GraduationCap,
        color:
          "from-purple-500/15 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/30",
        badge: locale === "ar" ? "عقيدة" : locale === "he" ? "אמונה" : "Theology",
      },
    ];
  }, [locale]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !q.data) return [];
    const sq = searchQuery.toLowerCase().trim();
    return q.data
      .map((e) => ({
        ...e,
        title: pickLocale(e.title_i18n, locale),
        summary: pickLocale(e.summary_i18n, locale),
      }))
      .filter(
        (e) =>
          e.title.toLowerCase().includes(sq) ||
          e.summary.toLowerCase().includes(sq) ||
          e.slug.toLowerCase().includes(sq),
      )
      .slice(0, 8);
  }, [q.data, searchQuery, locale]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Header Portal Hero */}
      <div className="border-b border-border bg-gradient-to-b from-primary-soft/40 via-background to-background">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-6 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            <Compass className="h-4 w-4 text-gold" />
            <span>
              {locale === "ar"
                ? "بوابة المعرفة"
                : locale === "he"
                  ? "מרכז הידע"
                  : "Knowledge Portal"}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("learn.title", "Quranic Knowledge Hub")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            {t(
              "learn.subtitle",
              "Discover curated Quranic topics, stories of prophets, historic events, sacred places, and theological concepts.",
            )}
          </p>

          {/* Quick Search Bar */}
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === "ar"
                  ? "بحث شامل في المعرفة القرآنية (التوحيد، موسى، بدر...)"
                  : locale === "he"
                    ? "חיפוש מקיף בידע הקוראני (ייחוד האל, משה, בדר...)"
                    : "Search all Quran knowledge (Tawhid, Moses, Badr...)"
              }
              className="w-full rounded-2xl border border-border bg-card/80 py-3 start-10 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 end-3 my-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
        {/* PREMIUM DISCOVERY HUB */}
        <PremiumDiscoveryHub locale={locale} />
        {/* Search Results Drawer if user is typing */}
        {searchQuery.trim().length > 0 && (
          <section className="rounded-2xl border border-primary/30 bg-card p-6 shadow-md">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <span>
                {locale === "ar"
                  ? `نتائج البحث عن "${searchQuery}"`
                  : locale === "he"
                    ? `תוצאות חיפוש עבור "${searchQuery}"`
                    : `Search Results for "${searchQuery}"`}
              </span>
            </h2>

            {searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                {locale === "ar"
                  ? "لم يتم العثور على نتائج تطابق بحثك."
                  : locale === "he"
                    ? "לא נמצאו תוצאות התואמות את החיפוש שלך."
                    : "No matching results found."}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    to="/learn/$kind/$slug"
                    params={{ kind: item.kind, slug: item.slug }}
                    className="flex flex-col justify-between rounded-xl border border-border bg-background p-4 hover:border-primary/50 hover:shadow-sm transition"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {item.kind}
                      </span>
                      <h3 className="font-semibold text-foreground text-sm mt-0.5" dir="auto">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1" dir="auto">
                        {item.summary}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Specialized Tools Quick Bar */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/learn/journeys"
            className="group flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary-soft/30 to-card p-4 transition hover:border-primary/50 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
              <Compass className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground group-hover:text-primary">
                {t("learn.openJourneys", "Reading Journeys")}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {locale === "ar"
                  ? "مسارات موضوعية"
                  : locale === "he"
                    ? "מסלולי למידה"
                    : "Structured Paths"}
              </p>
            </div>
          </Link>

          <Link
            to="/learn/graph"
            className="group flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary-soft/30 to-card p-4 transition hover:border-primary/50 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
              <Network className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground group-hover:text-primary">
                {t("learn.openGraph", "Knowledge Graph")}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {locale === "ar"
                  ? "شبكة المفاهيم"
                  : locale === "he"
                    ? "רשת המושגים"
                    : "Concept Network"}
              </p>
            </div>
          </Link>

          <Link
            to="/explore/timeline"
            className="group flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary-soft/30 to-card p-4 transition hover:border-primary/50 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground group-hover:text-primary">
                {t("learn.openTimeline", "Islamic Timeline")}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {locale === "ar"
                  ? "التأريض النبوي"
                  : locale === "he"
                    ? "ציר היסטורי"
                    : "Prophetic Chronology"}
              </p>
            </div>
          </Link>

          <Link
            to="/explore/map"
            className="group flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary-soft/30 to-card p-4 transition hover:border-primary/50 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground group-hover:text-primary">
                {t("learn.openMap", "Sacred Map")}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {locale === "ar"
                  ? "خريطة المعالم"
                  : locale === "he"
                    ? "מפת המקומות"
                    : "Sacred Geography"}
              </p>
            </div>
          </Link>
        </div>

        {/* Main Separated Category Cards Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {locale === "ar"
                  ? "اقسام المعرفة القرآنية"
                  : locale === "he"
                    ? "קטגוריות ידע קוראניות"
                    : "Quran Knowledge Categories"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === "ar"
                  ? "اختر القسم المطلوب للاستكشاف والتعمق"
                  : locale === "he"
                    ? "בחר קטגוריה לחקירה מעמיקה"
                    : "Select a category to explore in detail"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={cat.to}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card/90 via-card to-secondary/30 p-6 shadow-xs transition-all duration-300 hover:border-primary/60 hover:shadow-md hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br ${cat.color} shadow-2xs`}
                        >
                          <IconComp className="h-6 w-6" />
                        </div>
                        <span className="rounded-full border border-primary/20 bg-primary-soft/50 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                          {cat.badge}
                        </span>
                      </div>
                      <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-1 group-hover:text-primary ltr:rotate-180" />
                    </div>

                    <div className="mt-5">
                      <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {cat.title}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold text-gold">{cat.subtitle}</p>
                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-3.5 text-xs font-semibold text-primary group-hover:underline">
                    <span>
                      {locale === "ar"
                        ? `استكشف ${cat.title} ←`
                        : locale === "he"
                          ? `חפש ${cat.title} ←`
                          : `Explore ${cat.title} →`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
