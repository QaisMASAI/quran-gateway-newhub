import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Library,
  Compass,
  Sparkles,
  ChevronDown,
  BookMarked,
  ScrollText,
  GraduationCap,
  MapPin,
  Clock,
  Heart,
  UserCheck,
  Gamepad2,
  FolderHeart,
  HelpCircle,
} from "lucide-react";

export function MegaMenu() {
  const { t, i18n } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAr = i18n.language === "ar";
  const isHe = i18n.language === "he";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const sections = [
    {
      title: isAr ? "القرآن الكريم والتفسير" : isHe ? "קוראן ותפסיר" : "Holy Quran & Tafsir",
      icon: <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
      items: [
        {
          label: isAr ? "جميع السور (114)" : isHe ? "כל הסורות (114)" : "All Surahs (114)",
          desc: isAr
            ? "قراءة واستماع بالتجويد"
            : isHe
              ? "קריאה והאזנה"
              : "Read & Listen with Tajweed",
          to: "/surahs",
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          label: isAr
            ? "منصة التفاسير المتقدمة"
            : isHe
              ? "פלטפורמת התפסיר המתקדמת"
              : "Tafsir Platform",
          desc: isAr
            ? "8 تفاسير علمية ومقارنة بالذكاء الاصطناعي"
            : isHe
              ? "8 תפסיקים מוסמכים וניתוח חכם"
              : "8 Collections & AI Side-by-Side Studio",
          to: "/tafsir",
          icon: <BookMarked className="h-4 w-4" />,
        },
        {
          label: isAr
            ? "خريطة المعرفة القرآنية"
            : isHe
              ? "מפת ידע קוראנית"
              : "Quran Knowledge Graph",
          desc: isAr
            ? "استكشف المفاهيم المترابطة"
            : isHe
              ? "רשת המושגים"
              : "Explore Connected Concepts",
          to: "/learn/graph",
          icon: <Compass className="h-4 w-4" />,
        },
        {
          label: isAr ? "ختمات القرآن والخطط" : isHe ? "תכניות קריאה" : "Reading Plans & Khatm",
          desc: isAr ? "متابعة التقدم اليومي" : isHe ? "מעקב יומי" : "Track Daily Progress",
          to: "/plans",
          icon: <GraduationCap className="h-4 w-4" />,
        },
      ],
    },
    {
      title: isAr ? "الحديث النبوي الشريف" : isHe ? "חדית' שריף" : "Authentic Hadith",
      icon: <Library className="h-4 w-4 text-gold" />,
      items: [
        {
          label: isAr ? "مكتبة الأحاديث" : isHe ? "ספריית החדית'" : "Hadith Collections",
          desc: isAr
            ? "البخاري، مسلم وباقي الكتب"
            : isHe
              ? "בוחארי ומוסלים"
              : "Sahih Bukhari, Muslim & more",
          to: "/hadith",
          icon: <Library className="h-4 w-4" />,
        },
        {
          label: isAr ? "أحاديث المواضيع" : isHe ? "חדית' לפי נושאים" : "Hadith by Topic",
          desc: isAr
            ? "مصنفة حسب الأحكام والأخلاق"
            : isHe
              ? "נושאי הלכה ומודעות"
              : "Categorized by Islamic Topics",
          to: "/hadith/topics",
          icon: <ScrollText className="h-4 w-4" />,
        },
        {
          label: isAr ? "رواة الحديث والتراجم" : isHe ? "ראשי המוסרים" : "Narrators Index",
          desc: isAr
            ? "سلاسل الأسانيد والصحابة"
            : isHe
              ? "שרשרות המוסרים"
              : "Sahabah & Chain of Narrators",
          to: "/hadith/narrators",
          icon: <UserCheck className="h-4 w-4" />,
        },
      ],
    },
    {
      title: isAr ? "المعرفة والقصص" : isHe ? "ידע וסיפורים" : "Knowledge & History",
      icon: <Compass className="h-4 w-4 text-amber-500" />,
      items: [
        {
          label: isAr ? "مواضيع القرآن" : isHe ? "נושאי הקוראן" : "Quran Topics",
          desc: isAr
            ? "فهرس موضوعي شامل لآيات القرآن"
            : isHe
              ? "אינדקס נושאים מקיף"
              : "Comprehensive Thematic Index",
          to: "/topics",
          icon: <Sparkles className="h-4 w-4" />,
        },
        {
          label: isAr ? "قصص الأنبياء" : isHe ? "סיפורי נביאים" : "Prophets & Messengers",
          desc: isAr
            ? "قصص الأنبياء والدروس المستفادة"
            : isHe
              ? "סיפורי הנביאים בקוראן"
              : "Quranic Stories of Prophets",
          to: "/prophets",
          icon: <UserCheck className="h-4 w-4" />,
        },
        {
          label: isAr ? "قصص القرآن" : isHe ? "סיפורי הקוראן" : "Quranic Stories",
          desc: isAr
            ? "أصحاب الكهف، الفيل، ذو القرنين وغيرها"
            : isHe
              ? "סיפורי הקוראן והלקחים"
              : "Stories & Lessons from Quran",
          to: "/stories",
          icon: <ScrollText className="h-4 w-4" />,
        },
        {
          label: isAr ? "الأحداث التاريخية" : isHe ? "אירועים היסטוריים" : "Historic Events",
          desc: isAr
            ? "الهجرة، بدر، أحد وحنين"
            : isHe
              ? "ההג'רה, בדר ואירועים"
              : "Prophetic Timeline & Milestones",
          to: "/events",
          icon: <Clock className="h-4 w-4" />,
        },
        {
          label: isAr ? "الأماكن المقدسة" : isHe ? "מקומות קדושים" : "Sacred Places",
          desc: isAr
            ? "مكة، المدينة، الأقصى وسيناء"
            : isHe
              ? "מכה, מדינה ואל-אקצא"
              : "Geography of Makkah, Madinah & Sinai",
          to: "/places",
          icon: <MapPin className="h-4 w-4" />,
        },
        {
          label: isAr ? "المفاهيم والأمم" : isHe ? "מושגים ועמים" : "Concepts & Themes",
          desc: isAr
            ? "المفاهيم العقائدية وأمم القوم"
            : isHe
              ? "מושגי אמונה ועמים"
              : "Theological Concepts & Ancient Nations",
          to: "/concepts",
          icon: <GraduationCap className="h-4 w-4" />,
        },
      ],
    },
    {
      title: isAr
        ? "الأدوات والذكاء الاصطناعي"
        : isHe
          ? "כלים ובינה מלאכותית"
          : "AI Tools & Learning",
      icon: <Sparkles className="h-4 w-4 text-primary" />,
      items: [
        {
          label: isAr
            ? "الباحث الإسلامي الذكي"
            : isHe
              ? "חוקר בינה מלאכותית"
              : "AI Research Engine",
          desc: isAr
            ? "بحث بالدليل والتوثيق"
            : isHe
              ? "מחקר מעמיק ומאומת"
              : "Deep Cited Research Assistant",
          to: "/research",
          icon: <Sparkles className="h-4 w-4" />,
        },
        {
          label: isAr ? "اسأل نور الهداية" : isHe ? "שאל את נור AI" : "Ask Noor AI",
          desc: isAr ? "إجابات فورية موثقة" : isHe ? "תשובות מיידיות" : "Instant Grounded Answers",
          to: "/ask",
          icon: <HelpCircle className="h-4 w-4" />,
        },
        {
          label: isAr ? "ركن الأطفال" : isHe ? "פינת הילדים" : "Kids Islamic Hub",
          desc: isAr ? "تعلّم تفاعلي ممتع" : isHe ? "למידה חווייתית" : "Interactive Fun Learning",
          to: "/kids",
          icon: <Gamepad2 className="h-4 w-4" />,
        },
        {
          label: isAr ? "المفضلة والآيات المحفوظة" : isHe ? "מועדפים ושמורים" : "Saved & Bookmarks",
          desc: isAr ? "مراجعة آياتك وملاحظاتك" : isHe ? "שמורים והערות" : "Saved Verses & Notes",
          to: "/favorites",
          icon: <FolderHeart className="h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <Compass className="h-3.5 w-3.5 text-primary" />
        <span>{isAr ? "استكشف المنصة" : isHe ? "גלה את הפלטפורמה" : "Explore Platform"}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-2 w-[85vw] max-w-4xl -left-20 sm:left-1/2 sm:-translate-x-1/2 rounded-2xl border border-border/80 bg-card/95 p-4 md:p-6 backdrop-blur-2xl shadow-2xl shadow-primary/10 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {sections.map((sec, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase border-b border-border/50 pb-2">
                  {sec.icon}
                  <span>{sec.title}</span>
                </div>
                <ul className="space-y-1">
                  {sec.items.map((item, iIdx) => (
                    <li key={iIdx}>
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="group flex items-start gap-2.5 rounded-xl p-2 transition-all hover:bg-secondary/80 hover:scale-[1.01]"
                      >
                        <div className="mt-0.5 rounded-lg border border-border/60 bg-background p-1.5 text-muted-foreground group-hover:border-primary/30 group-hover:text-primary transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.label}
                          </div>
                          <div className="text-[10.5px] text-muted-foreground line-clamp-1">
                            {item.desc}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-arabic font-semibold text-gold" dir="rtl">
              وَقُل رَّبِّ زِدْنِي عِلْمًا
            </span>
            <span className="text-[11px]">Noor Al-Huda Global Ecosystem</span>
          </div>
        </div>
      )}
    </div>
  );
}
