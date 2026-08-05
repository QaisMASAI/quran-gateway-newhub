import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Heart,
  ShieldCheck,
  Sparkles,
  UserCheck,
  MapPin,
  Clock,
  BookOpen,
  ChevronRight,
  ArrowUpRight,
  Compass,
  Layers,
  Scale,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EMOTIONS } from "@/lib/emotions";
import { TOPICS } from "@/lib/topics";
import { getVirtuesList, getTafsirSchools } from "@/lib/discovery-engine";
import type { LocaleCode } from "@/lib/knowledge";

interface ExploreMatrixProps {
  locale: LocaleCode;
}

export const ExploreMatrix: React.FC<ExploreMatrixProps> = ({ locale }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const [activeTab, setActiveTab] = useState<
    "emotion" | "virtue" | "theme" | "prophet" | "place" | "period" | "tafsir"
  >("emotion");

  const virtues = getVirtuesList(locale);
  const tafsirSchools = getTafsirSchools(locale);

  const prophetsList = [
    {
      slug: "adam",
      nameEn: "Adam (AS)",
      nameAr: "آدم عليه السلام",
      nameHe: "אדם עליו השלום",
      role: "First Prophet & Father of Humanity",
    },
    {
      slug: "nuh",
      nameEn: "Noah (Nuh AS)",
      nameAr: "نوح عليه السلام",
      nameHe: "נח עליו השלום",
      role: "Prophet of the Great Ark",
    },
    {
      slug: "ibrahim",
      nameEn: "Abraham (Ibrahim AS)",
      nameAr: "إبراهيم خليل الله",
      nameHe: "אברהם אבינו",
      role: "Patriarch of Pure Monotheism",
    },
    {
      slug: "musa",
      nameEn: "Moses (Musa AS)",
      nameAr: "موسى كليم الله",
      nameHe: "משה רבנו",
      role: "Lawgiver & Deliverer from Pharaoh",
    },
    {
      slug: "isa",
      nameEn: "Jesus (Isa AS)",
      nameAr: "عيسى روح الله",
      nameHe: "ישוע בן מרים",
      role: "Messiah & Spirit from God",
    },
    {
      slug: "muhammad",
      nameEn: "Muhammad ﷺ",
      nameAr: "محمد خاتم الأنبياء ﷺ",
      nameHe: "מוחמד חתם הנביאים ﷺ",
      role: "Seal of the Prophets & Universal Mercy",
    },
  ];

  const placesList = [
    {
      slug: "makkah",
      nameEn: "Makkah al-Mukarramah",
      nameAr: "مكة المكرمة",
      nameHe: "מאכה אל-מוכרמה",
      desc: "The Sacred Sanctuary & Kaaba",
    },
    {
      slug: "madinah",
      nameEn: "Madinah al-Munawwarah",
      nameAr: "المدينة المنورة",
      nameHe: "מדינה אל-מונוורה",
      desc: "City of the Prophet & First State",
    },
    {
      slug: "jerusalem-al-aqsa",
      nameEn: "Jerusalem (Al-Aqsa)",
      nameAr: "القدس الشريف والمسجد الأقصى",
      nameHe: "ירושלים (אל-אקצא)",
      desc: "First Qibla & Site of Night Journey",
    },
    {
      slug: "mount-sinai",
      nameEn: "Mount Sinai (Jabal al-Tur)",
      nameAr: "جبل الطور ببيناء",
      nameHe: "הר סיני",
      desc: "Blessed Valley of Tuwa",
    },
  ];

  return (
    <section id="explore-matrix" className="space-y-6 scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </span>
          <div>
            <h3 className="text-2xl font-extrabold text-white dir-auto">
              {isAr
                ? "مصفوفة الاستكشاف والتقسيمات المعرفية"
                : isHe
                  ? "מטריצת החקירה והנושאים"
                  : "Multidimensional Exploration Matrix"}
            </h3>
            <p className="text-xs text-zinc-400 dir-auto">
              {isAr
                ? "تصفح العلوم القرآنية عبر المشاعر، الأخلاق، الأنبياء، الأماكن، العصور والتفاسير"
                : isHe
                  ? "חקר לפי רגשות, מידות, נושאים, נביאים, מקומות, תקופות התגלות ותפסיר"
                  : "Browse by Emotions, Virtues, Themes, Prophets, Sacred Places, Revelation Periods & Tafsir"}
            </p>
          </div>
        </div>

        {/* Tabs selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
          {[
            { id: "emotion", labelAr: "المشاعر", labelHe: "רגשות", labelEn: "Emotions" },
            { id: "virtue", labelAr: "الأخلاق", labelHe: "מידות", labelEn: "Virtues" },
            { id: "theme", labelAr: "المواضيع", labelHe: "נושאים", labelEn: "Themes" },
            { id: "prophet", labelAr: "الأنبياء", labelHe: "נביאים", labelEn: "Prophets" },
            { id: "place", labelAr: "الأماكن", labelHe: "מקומות", labelEn: "Places" },
            { id: "period", labelAr: "النزول", labelHe: "תקופות", labelEn: "Periods" },
            { id: "tafsir", labelAr: "التفاسير", labelHe: "תפסיר", labelEn: "Tafsir" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as never)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {isAr ? tab.labelAr : isHe ? tab.labelHe : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* 1. EXPLORE BY EMOTION */}
      {activeTab === "emotion" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EMOTIONS.map((emo) => (
            <div
              key={emo.slug}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10 font-bold text-[10px]"
                  >
                    {emo.refs.length} {isAr ? "آيات قرآنية" : isHe ? "פסוקים" : "Verses"}
                  </Badge>
                  <Heart className="w-4 h-4 text-zinc-500 group-hover:text-rose-400 transition-colors" />
                </div>
                <h4 className="text-lg font-extrabold text-white dir-auto">{emo.title}</h4>
                {emo.subtitle && (
                  <p className="text-xs text-cyan-300 font-medium dir-auto">{emo.subtitle}</p>
                )}
                <p className="text-xs text-zinc-300 leading-relaxed dir-auto line-clamp-2">
                  {emo.description}
                </p>
              </div>

              <Link
                to="/emotions/$slug"
                params={{ slug: emo.slug }}
                className="pt-2 border-t border-zinc-800"
              >
                <Button className="w-full bg-zinc-800 hover:bg-cyan-600 text-zinc-200 hover:text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-between">
                  <span>
                    {isAr
                      ? "تصفح الآيات والتفاسير"
                      : isHe
                        ? "חקור פסוקים"
                        : "Explore Verses & Tafsir"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 2. EXPLORE BY VIRTUE */}
      {activeTab === "virtue" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {virtues.map((v) => (
            <div
              key={v.id}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-bold text-[10px]"
                  >
                    {isAr ? "خُلق إسلامي" : isHe ? "מידה טובה" : "Islamic Virtue"}
                  </Badge>
                  <Sparkles className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h4 className="text-lg font-extrabold text-white dir-auto">
                  {isAr ? v.titleAr : isHe ? v.titleHe : v.titleEn}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed dir-auto">
                  {isAr ? v.descAr : isHe ? v.descHe : v.descEn}
                </p>
                <div className="p-2.5 rounded-xl bg-zinc-950/80 text-[11px] font-mono text-emerald-400 border border-zinc-800">
                  📖 {v.quranicVerse}
                </div>
              </div>

              <Link
                to="/topics/$slug"
                params={{ slug: v.slug }}
                className="pt-2 border-t border-zinc-800"
              >
                <Button className="w-full bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-between">
                  <span>
                    {isAr ? "استعرض الشواهد الكاملة" : isHe ? "צפה במקורות" : "View Full Evidence"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 3. EXPLORE BY THEME */}
      {activeTab === "theme" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map((top) => (
            <div
              key={top.slug}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 text-amber-400 bg-amber-500/10 font-bold text-[10px]"
                  >
                    {top.refs.length} {isAr ? "مواقع قرأنية" : isHe ? "מקורות" : "Passages"}
                  </Badge>
                  <Layers className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <h4 className="text-lg font-extrabold text-white dir-auto">{top.title}</h4>
                {top.subtitle && (
                  <p className="text-xs text-amber-300 font-medium dir-auto">{top.subtitle}</p>
                )}
                <p className="text-xs text-zinc-300 leading-relaxed dir-auto line-clamp-2">
                  {top.description}
                </p>
              </div>

              <Link
                to="/topics/$slug"
                params={{ slug: top.slug }}
                className="pt-2 border-t border-zinc-800"
              >
                <Button className="w-full bg-zinc-800 hover:bg-amber-600 text-zinc-200 hover:text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-between">
                  <span>{isAr ? "استكشف الموضوع" : isHe ? "חקור נושא" : "Explore Theme"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 4. EXPLORE BY PROPHET */}
      {activeTab === "prophet" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prophetsList.map((p) => (
            <div
              key={p.slug}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase">
                    {isAr ? "نبي ورسول" : isHe ? "נביא ושליח" : "Prophet & Messenger"}
                  </Badge>
                  <UserCheck className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h4 className="text-lg font-extrabold text-white dir-auto">
                  {isAr ? p.nameAr : isHe ? p.nameHe : p.nameEn}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed dir-auto">{p.role}</p>
              </div>

              <Link
                to="/prophets/$slug"
                params={{ slug: p.slug }}
                className="pt-2 border-t border-zinc-800"
              >
                <Button className="w-full bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-between">
                  <span>
                    {isAr
                      ? "اقرأ السيرة المباركة"
                      : isHe
                        ? "קרא את הסיפור"
                        : "Read Prophetic Seerah"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 5. EXPLORE BY PLACE */}
      {activeTab === "place" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {placesList.map((p) => (
            <div
              key={p.slug}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] font-bold uppercase">
                    {isAr ? "معلم مقدس" : isHe ? "מקום קדוש" : "Sacred Location"}
                  </Badge>
                  <MapPin className="w-4 h-4 text-zinc-500 group-hover:text-rose-400 transition-colors" />
                </div>
                <h4 className="text-lg font-extrabold text-white dir-auto">
                  {isAr ? p.nameAr : isHe ? p.nameHe : p.nameEn}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed dir-auto">{p.desc}</p>
              </div>

              <Link
                to="/places/$slug"
                params={{ slug: p.slug }}
                className="pt-2 border-t border-zinc-800"
              >
                <Button className="w-full bg-zinc-800 hover:bg-rose-600 text-zinc-200 hover:text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-between">
                  <span>
                    {isAr
                      ? "استكشف الخريطة والمعلومات"
                      : isHe
                        ? "חקור במפה"
                        : "Explore Sacred Geography"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 6. EXPLORE BY REVELATION PERIOD */}
      {activeTab === "period" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs font-black uppercase">
                {isAr ? "76 سورة مكية" : isHe ? "76 סורות מאכיות" : "76 Makkan Surahs"}
              </Badge>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-xl font-extrabold text-white dir-auto">
              {isAr
                ? "العهد المكي والبعثة الأولى (13 سنة)"
                : isHe
                  ? "התקופה המאכית (13 שנים)"
                  : "Makkan Era (13 Years in Makkah)"}
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed dir-auto">
              {isAr
                ? "تركز السور المكية على إرساء قواعد العقيدة، التوحيد، التفكر في الكون، الصبر على الابتلاء، والترغيب والترهيب بآيات قصيرة بليغة."
                : isHe
                  ? "הסורות המאכיות מתמקדות בביסוס האמונה, אלוהות אחת, התבוננות בבריאה וסבלנות במצוקה."
                  : "Makkan Surahs emphasize foundational Monotheism (Tawhid), cosmic creation signs, patience under persecution, and concise powerful verse cadences."}
            </p>
            <Link to="/surahs">
              <Button className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 rounded-xl mt-2">
                <span>
                  {isAr
                    ? "استعرض السور المكية"
                    : isHe
                      ? "צפה בסורות המאכיות"
                      : "Browse Makkan Surahs"}
                </span>
              </Button>
            </Link>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-black uppercase">
                {isAr ? "38 سورة مدنية" : isHe ? "38 סורות מדיניות" : "38 Madinan Surahs"}
              </Badge>
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-xl font-extrabold text-white dir-auto">
              {isAr
                ? "العهد المدني وتأسيس الدولة (10 سنوات)"
                : isHe
                  ? "התקופה המדינית (10 שנים)"
                  : "Madinan Era (10 Years in Madinah)"}
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed dir-auto">
              {isAr
                ? "تناول السور المدنية التشريعات العملية، العبادات المعاملات، الأحوال الشخصية، الزكاة والجهاد وتكافل المجتمع."
                : isHe
                  ? "הסורות המדיניות עוסקות בחוקי הקהילה, משפט, חובות דתיות ויחסים בינלאומיים."
                  : "Madinan Surahs detail practical jurisprudence, civil governance, commercial ethics, family law, and community solidarity."}
            </p>
            <Link to="/surahs">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl mt-2">
                <span>
                  {isAr
                    ? "استعرض السور المدنية"
                    : isHe
                      ? "צפה בסורות המדיניות"
                      : "Browse Madinan Surahs"}
                </span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 7. EXPLORE BY TAFSIR */}
      {activeTab === "tafsir" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tafsirSchools.map((school) => (
            <div
              key={school.id}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] font-bold uppercase">
                    {school.era}
                  </Badge>
                  <BookOpen className="w-4 h-4 text-purple-400" />
                </div>
                <h4 className="text-lg font-extrabold text-white dir-auto">
                  {isAr ? school.nameAr : isHe ? school.nameHe : school.nameEn}
                </h4>
                <p className="text-xs font-mono text-purple-300 dir-auto">
                  {isAr ? school.authorAr : isHe ? school.authorHe : school.authorEn}
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed dir-auto">
                  {isAr ? school.methodologyAr : isHe ? school.methodologyHe : school.methodologyEn}
                </p>
              </div>

              <Link
                to="/tafsir/$surah/$ayah"
                params={{ surah: String(school.sampleSurah), ayah: String(school.sampleAyah) }}
                className="pt-2 border-t border-zinc-800"
              >
                <Button className="w-full bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-between">
                  <span>
                    {isAr
                      ? "تصفح نموذج التفسير"
                      : isHe
                        ? "צפה בדוגמת תפסיר"
                        : "Explore Tafsir Sample"}
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
