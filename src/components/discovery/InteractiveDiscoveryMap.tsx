import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Compass, BookOpen, ExternalLink, ShieldCheck, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSacredPlacesMap, type SacredPlaceMap } from "@/lib/discovery-engine";
import type { LocaleCode } from "@/lib/knowledge";

interface InteractiveDiscoveryMapProps {
  locale: LocaleCode;
}

export const InteractiveDiscoveryMap: React.FC<InteractiveDiscoveryMapProps> = ({ locale }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const places = getSacredPlacesMap(locale);
  const [activePlace, setActivePlace] = useState<SacredPlaceMap>(places[0]);

  return (
    <section id="interactive-map" className="space-y-6 scroll-mt-24">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <MapPin className="w-5 h-5 animate-bounce" />
          </span>
          <div>
            <h3 className="text-2xl font-extrabold text-white dir-auto">
              {isAr ? "الخرائط التفاعلية والأماكن المقدسة" : isHe ? "מפות אינטראקטיביות ומקומות קדושים" : "Interactive Maps & Sacred Geography"}
            </h3>
            <p className="text-xs text-zinc-400 dir-auto">
              {isAr
                ? "استكشف معالم الأرض المقدسة المذكورة في القرآن بالسياق الجغرافي والإيماني"
                : isHe
                  ? "חקור את הגיאוגרפיה המקודשת המוזכרת בקוראן בהקשר היסטורי ורוחני"
                  : "Discover sacred geographical sites cited across the Quran and Prophetic history"}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="border-rose-500/30 text-rose-400 bg-rose-500/10 font-bold text-xs">
          {places.length} {isAr ? "أماكن رئيسية" : isHe ? "מקומות" : "Key Locations"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Places List Column */}
        <div className="lg:col-span-5 space-y-3">
          {places.map((place) => {
            const isSelected = activePlace.id === place.id;
            return (
              <button
                key={place.id}
                onClick={() => setActivePlace(place)}
                className={`w-full p-4 rounded-2xl text-left transition-all border flex items-center justify-between group ${
                  isSelected
                    ? "bg-rose-950/40 border-rose-500 text-white shadow-xl shadow-rose-500/10 scale-[1.01]"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isSelected ? "bg-rose-500 text-zinc-950 font-bold" : "bg-zinc-800 text-zinc-400"}`}>
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm dir-auto">
                      {isAr ? place.nameAr : isHe ? place.nameHe : place.nameEn}
                    </h4>
                    <span className="text-[11px] text-zinc-400 block dir-auto">
                      {isAr ? place.locationAr : isHe ? place.locationHe : place.locationEn}
                    </span>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                  {place.lat.toFixed(2)}, {place.lng.toFixed(2)}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Selected Map Card View Column */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-6 relative overflow-hidden h-full flex flex-col justify-between">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] font-black uppercase">
                    {isAr ? placeName(activePlace, "ar") : isHe ? placeName(activePlace, "he") : placeName(activePlace, "en")}
                  </Badge>
                  <h3 className="text-2xl font-extrabold text-white mt-1 dir-auto">
                    {isAr ? activePlace.nameAr : isHe ? activePlace.nameHe : activePlace.nameEn}
                  </h3>
                </div>

                <a
                  href={`https://maps.google.com/?q=${activePlace.lat},${activePlace.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isAr ? "خرائط جوجل" : isHe ? "מפות גוגל" : "Google Maps"}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              </div>

              {/* Quranic Verse Link Badge */}
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{isAr ? "الشاهد القرآني:" : isHe ? "ציטוט בקוראן:" : "Quranic Reference:"} {activePlace.quranicRef}</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  GPS: {activePlace.lat}, {activePlace.lng}
                </span>
              </div>

              {/* Map Preview Graphic Representation */}
              <div className="h-48 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-rose-950/30 border border-zinc-800 flex flex-col items-center justify-center p-6 text-center space-y-2 relative">
                <div className="p-4 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 shadow-xl shadow-rose-500/20 animate-pulse">
                  <MapPin className="w-8 h-8" />
                </div>
                <div className="text-xs font-bold text-zinc-300 dir-auto">
                  {isAr ? activePlace.locationAr : isHe ? activePlace.locationHe : activePlace.locationEn}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  LAT: {activePlace.lat} | LNG: {activePlace.lng}
                </div>
              </div>

              {/* Historical Significance */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/30 space-y-1">
                <span className="text-[11px] font-extrabold text-rose-400 uppercase tracking-wider block dir-auto">
                  {isAr ? "الأهمية التاريخية والإيمانية:" : isHe ? "חשיבות היסטורית ורוחנית:" : "Historical & Spiritual Significance:"}
                </span>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed dir-auto">
                  {isAr ? activePlace.significanceAr : isHe ? activePlace.significanceHe : activePlace.significanceEn}
                </p>
              </div>
            </div>

            <Link
              to="/places/$slug"
              params={{ slug: activePlace.slug }}
              className="pt-2"
            >
              <Button className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg">
                <span>{isAr ? "اقرأ التوثيق الجغرافي الكامل" : isHe ? "צפה בתיעוד הגיאוגרפי המלא" : "Explore Complete Geographic Documentation"}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

function placeName(p: SacredPlaceMap, lang: "ar" | "he" | "en") {
  return lang === "ar" ? p.nameAr : lang === "he" ? p.nameHe : p.nameEn;
}
