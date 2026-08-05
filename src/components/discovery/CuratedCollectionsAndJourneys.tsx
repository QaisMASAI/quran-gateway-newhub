import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import topicsWebp from "@/assets/discovery-topics.webp";
import surahsWebp from "@/assets/discovery-surahs.webp";
import {
  TrendingUp,
  Shuffle,
  Sparkles,
  Award,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Flame,
  Zap,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getTrendingIslamicTopics,
  getCuratedCollections,
  getDailyLearningJourney,
  type TrendingTopic,
  type CuratedCollection,
  type LearningStep,
} from "@/lib/discovery-engine";
import type { LocaleCode } from "@/lib/knowledge";

interface CuratedCollectionsAndJourneysProps {
  locale: LocaleCode;
}

export const CuratedCollectionsAndJourneys: React.FC<CuratedCollectionsAndJourneysProps> = ({
  locale,
}) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const trendingTopics = getTrendingIslamicTopics(locale);
  const collections = getCuratedCollections(locale);
  const journeySteps = getDailyLearningJourney(locale);

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [randomItem, setRandomItem] = useState<{
    title: string;
    type: string;
    desc: string;
    link: string;
  } | null>(null);

  const toggleStep = (stepNum: number) => {
    if (completedSteps.includes(stepNum)) {
      setCompletedSteps(completedSteps.filter((s) => s !== stepNum));
    } else {
      setCompletedSteps([...completedSteps, stepNum]);
    }
  };

  const handleRollRandom = () => {
    const surprises = [
      {
        title: isAr
          ? "سورة الكهف (آية 10)"
          : isHe
            ? "סורת אל-כהף (פסוק 10)"
            : "Surah Al-Kahf (Verse 10)",
        type: isAr ? "دعاء قرآني" : isHe ? "תפילה בקוראן" : "Quranic Supplication",
        desc: isAr
          ? "(رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا)"
          : isHe
            ? '"אדוננו, הענק לנו רחמים מאתך והכן לנו מישרין"'
            : "'Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.'",
        link: "/surah/18#v-10",
      },
      {
        title: isAr
          ? "قصة ذي القرنين ورحلته الشرقية والغربية"
          : isHe
            ? "סיפור דול-קרניין והמסע"
            : "Story of Dhul-Qarnayn & the Two Barriers",
        type: isAr ? "قصة قرآنية" : isHe ? "סיפור קוראני" : "Quranic Narrative",
        desc: isAr
          ? "سفر الحاكم العادل مجهزاً بأسباب التمكين والإيمان لبناء السد الحصين."
          : isHe
            ? "מסע המנהיג הכל יכול לבניית הסכר המגן מפני עריצות."
            : "The journey of the righteous king empowered with wisdom and engineering faith.",
        link: "/stories/dhul-qarnayn",
      },
      {
        title: isAr
          ? "رياض الصالحين - باب الصدق"
          : isHe
            ? "ריאד א-צאליחין - אמת"
            : "Riyad as-Salihin - Chapter on Truthfulness",
        type: isAr ? "حديث نبوي" : isHe ? "חדיت' מוסמך" : "Hadith Collection",
        desc: isAr
          ? "(عليكم بالصدق فإن الصدق يهدي إلى البر وإن البر يهدي إلى الجنة)"
          : isHe
            ? '"הקפידו על האמת כי האמת מוליכה אל הנדיבות וגן עדן"'
            : "'Adhere to truthfulness, for truthfulness leads to righteousness.'",
        link: "/hadith/nawawi40/entry/1",
      },
      {
        title: isAr
          ? "الوادي المقدس طوى في سيناء"
          : isHe
            ? "העמק הקדוש טוונה בסיני"
            : "Sacred Valley of Tuwa in Sinai",
        type: isAr ? "معلم مقدس" : isHe ? "מקום קדוש" : "Sacred Geography",
        desc: isAr
          ? "الموقع الذي خاطب الله فيه نبي الله موسى تكليماً."
          : isHe
            ? "המקום שבו דיבר הבורא עם משה רבנו."
            : "The valley where God spoke directly to Prophet Moses.",
        link: "/places/mount-sinai",
      },
    ];

    const idx = Math.floor(Math.random() * surprises.length);
    setRandomItem(surprises[idx]);
  };

  return (
    <div className="space-y-8">
      {/* 1. TRENDING ISLAMIC TOPICS & RANDOM DISCOVERY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trending Topics */}
        <section id="trending-topics" className="lg:col-span-8 scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Flame className="w-4 h-4 animate-bounce" />
              </span>
              <div>
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-[10px] font-black uppercase">
                  {isAr
                    ? "الأكثر استكشافاً اليوم"
                    : isHe
                      ? "הפופולרי ביותר"
                      : "Trending Topics Today"}
                </Badge>
                <h4 className="text-base font-extrabold text-white mt-0.5 dir-auto">
                  {isAr
                    ? "مواضيع إسلامية متصدرة الاهتمام"
                    : isHe
                      ? "נושאי אמונה לוהטים"
                      : "Trending Islamic Search Topics"}
                </h4>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trendingTopics.map((item) => (
              <Link
                key={item.id}
                to="/topics/$slug"
                params={{ slug: item.slug }}
                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/40 transition-all flex items-center justify-between group shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-orange-500/30 text-orange-400 text-[10px] font-bold"
                    >
                      {isAr ? item.categoryAr : isHe ? item.categoryHe : item.categoryEn}
                    </Badge>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      {item.growth}
                    </span>
                  </div>
                  <h5 className="text-sm font-extrabold text-white group-hover:text-orange-400 transition-colors dir-auto">
                    {isAr ? item.titleAr : isHe ? item.titleHe : item.titleEn}
                  </h5>
                  <span className="text-[11px] text-zinc-400 block dir-auto">
                    {item.views.toLocaleString()}{" "}
                    {isAr ? "قراءة واستكشاف" : isHe ? "קריאות" : "reads"}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* Random Discovery Widget */}
        <section id="random-discovery" className="lg:col-span-4 scroll-mt-24 space-y-4">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-zinc-950 border border-indigo-500/30 shadow-xl space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Shuffle className="w-4 h-4 animate-spin-slow" />
                </span>
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] font-black uppercase">
                  {isAr ? "اكتشاف عشوائي مفاجئ" : isHe ? "גילוי אקראי" : "Random Discovery"}
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-white dir-auto">
                  {isAr
                    ? "افتح باباً جديداً للمعرفة الإيمانية"
                    : isHe
                      ? "גלה פנינה אמונית אקראית"
                      : "Unlock a Random Pearl of Knowledge"}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed dir-auto">
                  {isAr
                    ? "اضغط لتوليد خيار معرفي عشوائي من بين الآيات، الأحاديث، القصص والأماكن"
                    : isHe
                      ? "לחץ לקבלת פסוק, חדית' או סיפור אקראי ממאגר הידע"
                      : "Spin to reveal a surprised verse, hadith, sacred place or prophet story from our index."}
                </p>
              </div>

              {randomItem && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-indigo-500/40 space-y-2 animate-fadeIn">
                  <Badge className="bg-indigo-500/20 text-indigo-300 text-[10px]">
                    {randomItem.type}
                  </Badge>
                  <h5 className="text-sm font-extrabold text-white dir-auto">{randomItem.title}</h5>
                  <p className="text-xs text-zinc-300 italic dir-auto">{randomItem.desc}</p>
                  <Link to={randomItem.link as never} className="inline-block pt-1">
                    <span className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1">
                      <span>
                        {isAr ? "افتح العنصر بالكامل" : isHe ? "פתח דף מלא" : "Open Full Content"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>
              )}
            </div>

            <Button
              onClick={handleRollRandom}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg gap-2"
            >
              <Shuffle className="w-4 h-4" />
              <span>
                {isAr
                  ? "توليد عنصر عشوائي جديد"
                  : isHe
                    ? "חולל גילוי אקראי"
                    : "Roll Random Discovery"}
              </span>
            </Button>
          </div>
        </section>
      </div>

      {/* 2. AI CURATED COLLECTIONS */}
      <section id="ai-curated-collections" className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-[10px] font-black uppercase">
                {isAr
                  ? "مجموعات معرفية منتقاة"
                  : isHe
                    ? "אוספים מומלצים"
                    : "AI Curated Collections"}
              </Badge>
              <h3 className="text-2xl font-extrabold text-white mt-0.5 dir-auto">
                {isAr
                  ? "المجموعات الموضوعية المنسقة"
                  : isHe
                    ? "אוספי ידע מנוהלים"
                    : "Curated Quranic Knowledge Collections"}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col, idx) => {
            const imgAsset = idx % 2 === 0 ? topicsWebp : surahsWebp;
            const imgAlt = isAr
              ? idx === 0
                ? "خريطة المفاهيم القرآنية العقدية والأخلاقية بطباعة شبكية حديثة"
                : idx === 1
                  ? "صورة توضيحية لترتيب وفهرس سور القرآن الكريم الهيكلي"
                  : "رسم بياني لسلسلة أسانيد الحديث النبوي الشريف والتصنيف المعرفي"
              : isHe
                ? idx === 0
                  ? "מפת מושגי יסוד קוראניים ואתיקה איסלאמית"
                  : idx === 1
                    ? "תמונת תצוגה מובנית של סורות הקוראן והתגלויותיהן"
                    : "גרף מפה של ספרות החדית' ושלשלות המסירה"
                : idx === 0
                  ? "WebP diagram of Quranic concept networks and thematic connections"
                  : idx === 1
                    ? "WebP visual summary of Surah structure and revelation sequence"
                    : "WebP diagram showing authentic Prophetic Hadith chains and collections";

            return (
              <div
                key={col.id}
                className={`p-6 rounded-3xl bg-gradient-to-br ${col.colorGrad} border border-white/10 shadow-xl space-y-4 text-white flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden border border-white/20 shadow-md">
                    <img
                      src={imgAsset}
                      alt={imgAlt}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className="bg-black/30 backdrop-blur-md text-white border-white/20 text-[10px] font-bold">
                      {isAr ? col.badgeAr : isHe ? col.badgeHe : col.badgeEn}
                    </Badge>
                    <span className="text-xs font-mono font-extrabold bg-black/40 px-2.5 py-1 rounded-full">
                      {col.itemsCount} {isAr ? "عناصر" : isHe ? "פריטים" : "Items"}
                    </span>
                  </div>

                  <h4 className="text-xl font-extrabold dir-auto">
                    {isAr ? col.titleAr : isHe ? col.titleHe : col.titleEn}
                  </h4>

                  <p className="text-xs text-zinc-100 leading-relaxed dir-auto opacity-90">
                    {isAr ? col.descAr : isHe ? col.descHe : col.descEn}
                  </p>
                </div>

                <Link to="/topics">
                  <Button className="w-full bg-white text-zinc-950 hover:bg-zinc-100 font-extrabold text-xs py-2 rounded-xl flex items-center justify-between shadow-lg">
                    <span>
                      {isAr
                        ? "استعرض المجموعة بالكامل"
                        : isHe
                          ? "צפה באוסף המלא"
                          : "Explore Collection"}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. DAILY LEARNING JOURNEY */}
      <section id="daily-learning-journey" className="scroll-mt-24 space-y-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Award className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-black uppercase">
                  {isAr
                    ? "مسار التعلم اليومي التفاعلي"
                    : isHe
                      ? "מסלול למידה יומי"
                      : "Daily Guided Learning Journey"}
                </Badge>
                <h3 className="text-xl font-extrabold text-white mt-0.5 dir-auto">
                  {isAr
                    ? "رحلة الهداية والتعلم اليومية (5 محطات)"
                    : isHe
                      ? "מסע למידה יומי מודרך"
                      : "5-Step Daily Guided Learning Path"}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                XP:{" "}
                {completedSteps.reduce((acc, stepNum) => {
                  const st = journeySteps.find((s) => s.step === stepNum);
                  return acc + (st ? st.xp : 0);
                }, 0)}{" "}
                / 170
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {journeySteps.map((step) => {
              const isDone = completedSteps.includes(step.step);
              return (
                <div
                  key={step.step}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDone
                      ? "bg-amber-950/20 border-amber-500/40 opacity-90"
                      : "bg-zinc-950/80 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStep(step.step)}
                      className={`p-2 rounded-xl shrink-0 mt-0.5 transition-colors ${
                        isDone
                          ? "bg-amber-500 text-zinc-950 font-bold"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold text-amber-400 uppercase">
                          {isAr ? step.titleAr : isHe ? step.titleHe : step.titleEn}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] border-zinc-700 text-zinc-400"
                        >
                          +{step.xp} XP
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed dir-auto">
                        {isAr ? step.contentAr : isHe ? step.contentHe : step.contentEn}
                      </p>
                    </div>
                  </div>

                  <Link to={step.targetLink as never} className="shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-zinc-800 hover:bg-amber-600 text-zinc-200 hover:text-white border-zinc-700 text-xs font-bold rounded-xl gap-1"
                    >
                      <span>{isAr ? "انتقل للمحطة" : isHe ? "עבור לשלב" : "Go to Step"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
