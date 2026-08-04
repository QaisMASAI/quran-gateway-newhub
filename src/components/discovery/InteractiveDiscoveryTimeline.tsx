import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { History, Calendar, Search, BookOpen, ChevronRight, Sparkles, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LocaleCode } from "@/lib/knowledge";

interface TimelineEventNode {
  id: string;
  era: "makkan" | "madinan" | "seerah" | "classical";
  yearAH: string;
  yearCE: string;
  titleEn: string;
  titleAr: string;
  titleHe: string;
  descEn: string;
  descAr: string;
  descHe: string;
  surahLink?: string;
  hadithLink?: string;
  impactEn: string;
  impactAr: string;
  impactHe: string;
}

interface InteractiveDiscoveryTimelineProps {
  locale: LocaleCode;
}

export const InteractiveDiscoveryTimeline: React.FC<InteractiveDiscoveryTimelineProps> = ({ locale }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const [selectedEra, setSelectedEra] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const events: TimelineEventNode[] = [
    {
      id: "evt-1",
      era: "makkan",
      yearAH: "13 BH",
      yearCE: "610 CE",
      titleEn: "First Divine Revelation in Cave Hira",
      titleAr: "بداية نزول الوحي في غار حراء (اقرأ باسم ربك)",
      titleHe: "התגלות ראשונה במערת חיראא",
      descEn: "Archangel Gabriel (Jibril) delivered the first five verses of Surah Al-Alaq, initiating the final Prophetic call.",
      descAr: "نزل جبريل عليه السلام بآيات سورة العلق الأولى على النبي ﷺ لتنطلق رسالة الإسلام والتنزيل العزيز.",
      descHe: "המלאך גבריאל מסר את חמשת הפסוקים הראשונים של סורת אל-עלק, ותחילת שליחות הנבואה.",
      surahLink: "/surah/96#v-1",
      impactEn: "Foundation of Monotheism & Knowledge",
      impactAr: "تأسيس معالم التوحيد والقراءة والعلم",
      impactHe: "ייחוד האל וראשית ימי הדעת",
    },
    {
      id: "evt-2",
      era: "makkan",
      yearAH: "3 BH",
      yearCE: "619 CE",
      titleEn: "The Night Journey & Ascension (Isra and Mi'raj)",
      titleAr: "رحلة الإسراء والمعراج وفرض الصلوات الخمس",
      titleHe: "מסע הלילה והעלייה לשמיים (אל-איסראא ואל-מעראג')",
      descEn: "Miraculous journey from Makkah to Al-Aqsa Mosque in Jerusalem, followed by ascension to the heavens and ordination of 5 daily prayers.",
      descAr: "الإسراء بالنبي ﷺ من المسجد الحرام إلى المسجد الأقصى والعروج إلى السماوات العلى وفرض الصلاة الإلهية.",
      descHe: "מסע פלאי ממאכה למסגד אל-אקצא בירושלים, עלייה לשמיים ופסיקת חמש התפילות היומיות.",
      surahLink: "/surah/17#v-1",
      impactEn: "Sanctity of Jerusalem & Pillar of Prayer",
      impactAr: "قدسية بيت المقدس وركنية الصلاة",
      impactHe: "קדושת ירושלים ועמוד התפילה",
    },
    {
      id: "evt-3",
      era: "madinan",
      yearAH: "1 AH",
      yearCE: "622 CE",
      titleEn: "The Prophetic Hijrah & Constitution of Madinah",
      titleAr: "الهجرة النبوية المباركة وميثاق صحيفة المدينة",
      titleHe: "ההגירה (היג'רה) ומيثاق מדינה",
      descEn: "Migration to Yathrib (Madinah), building the Prophet's Mosque, establishing brotherhood (Mu'akhah), and signing the Constitution.",
      descAr: "تأسيس المجتمع الإسلامي الأول بالمدينة، المؤاخاة بين المهاجرين والأنصار، ووضع أول وثيقة حقوقية تاريخية.",
      descHe: "הקמת הקהילה הראשונה במדינה, אחוות המהגרים והתושבים וחתימת החוקה.",
      surahLink: "/surah/9#v-40",
      impactEn: "Pluralistic Statehood & Social Solidarity",
      impactAr: "الدولة المدنية والتكافل الإنساني",
      impactHe: "כינון קהילה מלוכדת וצדק חברתי",
    },
    {
      id: "evt-4",
      era: "seerah",
      yearAH: "6 AH",
      yearCE: "628 CE",
      titleEn: "Treaty of Hudaybiyyah & Manifest Victory",
      titleAr: "صلح الحديبية والفتح المبين",
      titleHe: "הסכם חודייביה והניצחון הגלוי",
      descEn: "Diplomatic peace treaty that allowed peaceful propagation of Islam across Arabia and foreign empires.",
      descAr: "معاهدة السلام التاريخية التي فتحت آفاق انتشار الإسلام بالشرق والغرب وحقنت الدماء.",
      descHe: "הסכם שלום דיפלומטי שאפשר את הפיזור השקט של האמונה.",
      surahLink: "/surah/48#v-1",
      impactEn: "Victory of Diplomacy & Peaceful Outreach",
      impactAr: "انتصار السلام والدبلوماسية الحكيمة",
      impactHe: "ניצחון הדיפלומטיה והשלום",
    },
    {
      id: "evt-5",
      era: "classical",
      yearAH: "11-13 AH",
      yearCE: "632-634 CE",
      titleEn: "Compilation of the Holy Quran under Abu Bakr (RA)",
      titleAr: "جمع القرآن الكريم في المصحف الإمام الأول",
      titleHe: "איסוף הקוראן בימי אבו בכר (רע\"א)",
      descEn: "Under Caliph Abu Bakr and Zayd ibn Thabit, scattered manuscripts were meticulously compiled into a single master volume.",
      descAr: "جمع الآيات والصحف الشريفة في مصحف موحد بحفظ الصحابة المتقنين وإشراف زيد بن ثابت رضي الله عنه.",
      descHe: "איסוף הכתבים לכרך אחד מאוחד תחת הדרכת אבו בכר וזייד בן ת'אבת.",
      impactEn: "Preservation of Textual Integrity",
      impactAr: "حفظ نص القرآن الشريف بحرفيته",
      impactHe: "שימור טקסטואלי מלא של הקוראן",
    },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchEra = selectedEra === "all" || e.era === selectedEra;
      const matchSearch =
        !searchQuery ||
        e.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.titleAr.includes(searchQuery) ||
        e.titleHe.includes(searchQuery) ||
        e.yearAH.toLowerCase().includes(searchQuery.toLowerCase());
      return matchEra && matchSearch;
    });
  }, [events, selectedEra, searchQuery]);

  return (
    <section id="interactive-timeline" className="space-y-6 scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <History className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="text-2xl font-extrabold text-white dir-auto">
              {isAr ? "التسلسل الزمني التاريخي والمحطات" : isHe ? "ציר זמן היסטורי אינטראקטיבי" : "Interactive Historical Timeline"}
            </h3>
            <p className="text-xs text-zinc-400 dir-auto">
              {isAr
                ? "استكشف المحطات الفاصلة في البعثة، السيرة النبوية والعصر الذهبي الموثق"
                : isHe
                  ? "חקר את ציוני הדרך המרכזיים בהתגלות, בסירה ובאיסוף המקורות"
                  : "Explore pivotal milestones across Makkan, Madinan, Prophetic & Classical eras"}
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "تصفية بالأحداث..." : isHe ? "סינון אירועים..." : "Filter events..."}
              className="pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {[
              { id: "all", labelAr: "الكل", labelHe: "הכל", labelEn: "All" },
              { id: "makkan", labelAr: "مكي", labelHe: "מאכי", labelEn: "Makkan" },
              { id: "madinan", labelAr: "مدني", labelHe: "מדיני", labelEn: "Madinan" },
              { id: "seerah", labelAr: "السيرة", labelHe: "סירה", labelEn: "Seerah" },
              { id: "classical", labelAr: "عصر التدوين", labelHe: "קלאסי", labelEn: "Classical" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedEra(tab.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  selectedEra === tab.id
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {isAr ? tab.labelAr : isHe ? tab.labelHe : tab.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-10 border-l-2 border-purple-500/30 space-y-8 my-6">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline Circle Node */}
            <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-zinc-950 border-2 border-purple-500 flex items-center justify-center group-hover:scale-125 group-hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            </div>

            {/* Event Box */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 shadow-xl transition-all space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 font-bold text-xs">
                    {evt.yearAH} ({evt.yearCE})
                  </Badge>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">
                    {evt.era}
                  </span>
                </div>

                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  {isAr ? evt.impactAr : isHe ? evt.impactHe : evt.impactEn}
                </Badge>
              </div>

              <h4 className="text-lg font-extrabold text-white dir-auto">
                {isAr ? evt.titleAr : isHe ? evt.titleHe : evt.titleEn}
              </h4>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed dir-auto">
                {isAr ? evt.descAr : isHe ? evt.descHe : evt.descEn}
              </p>

              {evt.surahLink && (
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <Link
                    to={evt.surahLink as any}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isAr ? "اقرأ النص القرآني المرتبط" : isHe ? "קרא את המקור בקוראן" : "Read Connected Quranic Passage"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
