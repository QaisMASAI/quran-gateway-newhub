import React, { useState, useMemo } from "react";
import {
  Calendar,
  History,
  Clock,
  Sparkles,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SearchResearchBrief } from "@/lib/search-brief.functions";

interface PerplexityTimelineProps {
  brief: SearchResearchBrief;
}

interface TimelineEvent {
  id: string;
  era: "makkan" | "madinan" | "prophetic" | "classical";
  yearAH?: string;
  titleEn: string;
  titleAr: string;
  titleHe: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionHe: string;
  citation?: string;
}

export const PerplexityTimeline: React.FC<PerplexityTimelineProps> = ({ brief }) => {
  const [selectedEra, setSelectedEra] = useState<string>("all");
  const isAr = brief.locale === "ar";
  const isHe = brief.locale === "he";

  // Synthesize dynamic historical milestones tailored to query
  const timelineEvents = useMemo<TimelineEvent[]>(() => {
    const q = brief.query;

    const baseEvents: TimelineEvent[] = [
      {
        id: "evt-revelation-begin",
        era: "makkan",
        yearAH: "13 BH (610 CE)",
        titleAr: "بداية النزول والبعثة النبوية في مكة",
        titleHe: "תחילת ההתגלות במאכה",
        titleEn: "Initial Revelation & Call to Monotheism in Makkah",
        descriptionAr: `تنزيل أولى الآيات المكية وتأسيس معالم التوحيد والصبر المرتبطة بموضوع "${q}".`,
        descriptionHe: `התגלות הפסוקים המאכיים הראשונים וביסוס עקרונות האמונה.`,
        descriptionEn: `Revelation of foundational Makkan verses establishing core faith principles regarding "${q}".`,
        citation: "Surah Al-Alaq 96:1-5",
      },
      {
        id: "evt-hijrah-event",
        era: "madinan",
        yearAH: "1 AH (622 CE)",
        titleAr: "الهجرة النبوية إلى المدينة وتأسيس المجتمع",
        titleHe: "ההגירה (היג'רה) למדינה",
        titleEn: "The Prophetic Hijrah & Establishment of Community State",
        descriptionAr: `انتقال الدعوة إلى المدينة المنورة وتطبيق الأحكام والمؤاخاة والتكافل والتشريعات العادلة.`,
        descriptionHe: `מעבר הדעה למדינה והחלת חוקי הקהילה והאחווה.`,
        descriptionEn: `Transition to Madinah, establishing social solidarity, pacts of brotherhood, and community laws.`,
        citation: "Surah Al-Anfal 8:72",
      },
      {
        id: "evt-hudaybiyyah-treaty",
        era: "prophetic",
        yearAH: "6 AH (628 CE)",
        titleAr: "صلح الحديبية والفتح المبين",
        titleHe: "הסכם חודייביה",
        titleEn: "Treaty of Hudaybiyyah & Diplomatic Triumph",
        descriptionAr: `تجلي الحكمة الصابرة في معاهدة الصلح والتي أعقبها فتح مكة ودخول الناس في دين الله أفواجا.`,
        descriptionHe: `הסכם השלום ההיסטורי והתרחבות ההשפעה הרוחנית.`,
        descriptionEn: `Strategic peace agreement demonstrating patience, wisdom, and leading to the Conquest of Makkah.`,
        citation: "Surah Al-Fath 48:1-3",
      },
      {
        id: "evt-classical-compilation",
        era: "classical",
        yearAH: "2nd-8th Century AH",
        titleAr: "تدوين السنة والتفاسير المعتمدة (البخاري وابن كثير)",
        titleHe: "תיעוד החדית' והתפסיר הקלאסי",
        titleEn: "Compilation of Sahih Hadith & Classical Exegesis",
        descriptionAr: `توثيق أحاديث النبي ﷺ والكتب الجامعة بواسطة الإمام البخاري والتفاسير كابن كثير والطبري.`,
        descriptionHe: `איסוף החדית' המוסמך והפרשנויות התורניות המרכזיות.`,
        descriptionEn: `Systematic documentation of Sahih Hadith collections and authoritative exegesis by classical scholars.`,
        citation: "Sahih al-Bukhari & Tafsir Ibn Kathir",
      },
    ];

    // Append related events from brief if present
    if (brief.relatedEvents && brief.relatedEvents.length > 0) {
      brief.relatedEvents.forEach((e, idx) => {
        baseEvents.push({
          id: `brief-evt-${idx}`,
          era: idx % 2 === 0 ? "madinan" : "classical",
          yearAH: "Era of Seerah",
          titleAr: e.name,
          titleHe: e.name,
          titleEn: e.name,
          descriptionAr: e.description || `حدث تاريخي بارز مرتبط بـ "${q}".`,
          descriptionHe: e.description || `אירוע היסטורי מרכזי הקשור ל-"${q}".`,
          descriptionEn: e.description || `Key historical milestone connected to "${q}".`,
        });
      });
    }

    return baseEvents;
  }, [brief]);

  const filteredEvents = useMemo(() => {
    if (selectedEra === "all") return timelineEvents;
    return timelineEvents.filter((e) => e.era === selectedEra);
  }, [timelineEvents, selectedEra]);

  return (
    <section id="timeline" className="space-y-6 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <History className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold text-white dir-auto">
              {isAr ? "التسلسل الزمني التاريخي والمحطات" : isHe ? "ציר זמן היסטורי" : "Interactive Historical Timeline"}
            </h3>
            <p className="text-xs text-zinc-400 dir-auto">
              {isAr
                ? "تتبع المراحل التاريخية وأسباب النزول والمحطات الإيمانية عبر العصور"
                : isHe
                  ? "מעקב אחר שלבי ההתגלות והאירועים ההיסטוריים לאורך הדורות"
                  : "Chronological progression across Makkan, Madinan, Prophetic & Classical Eras"}
            </p>
          </div>
        </div>

        {/* Era Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", labelEn: "All Eras", labelAr: "جميع العصور", labelHe: "כל התקופות" },
            { id: "makkan", labelEn: "Makkan Era", labelAr: "العهد المكي", labelHe: "התקופה המאכית" },
            { id: "madinan", labelEn: "Madinan Era", labelAr: "العهد المدني", labelHe: "התקופה המדינית" },
            { id: "prophetic", labelEn: "Prophetic Sunnah", labelAr: "السيرة والفتوحات", labelHe: "הסירה" },
            { id: "classical", labelEn: "Classical Era", labelAr: "عصر التدوين", labelHe: "העידן הקלאסי" },
          ].map((era) => (
            <button
              key={era.id}
              onClick={() => setSelectedEra(era.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedEra === era.id
                  ? "bg-purple-500 text-zinc-950 font-black shadow-md shadow-purple-500/20"
                  : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {isAr ? era.labelAr : isHe ? era.labelHe : era.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Timeline Path */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-purple-500/30 space-y-6 my-4">
        {filteredEvents.map((evt, idx) => (
          <div key={evt.id} className="relative group">
            {/* Timeline Node Circle */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full bg-zinc-950 border-2 border-purple-500 flex items-center justify-center group-hover:scale-125 group-hover:bg-purple-500 transition-all">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
            </div>

            {/* Event Card */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 shadow-xl transition-all space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-extrabold text-[10px] uppercase">
                  {evt.yearAH || "Historical Era"}
                </span>
                {evt.citation && (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{evt.citation}</span>
                  </span>
                )}
              </div>

              <h4 className="text-base font-extrabold text-white dir-auto">
                {isAr ? evt.titleAr : isHe ? evt.titleHe : evt.titleEn}
              </h4>

              <p className="text-xs text-zinc-300 leading-relaxed dir-auto">
                {isAr ? evt.descriptionAr : isHe ? evt.descriptionHe : evt.descriptionEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
