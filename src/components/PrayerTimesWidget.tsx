import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Clock,
  MapPin,
  Compass,
  Sparkles,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { MAJOR_CITIES, type CityPreset, calculatePrayerTimes } from "@/lib/prayer-times";
import { fetchAladhanPrayerTimes, type AladhanTimings } from "@/lib/aladhan-api";
import { getHijriDate } from "@/lib/hijri-date";
import { normalizeLocale } from "@/lib/i18n";

export function PrayerTimesWidget({ locale }: { locale?: "he" | "ar" | "en" }) {
  const { i18n } = useTranslation("common");
  const activeLocale = locale || (normalizeLocale(i18n.language) ?? "he");
  const isAr = activeLocale === "ar";
  const isHe = activeLocale === "he";

  const [selectedCity, setSelectedCity] = useState<CityPreset>(MAJOR_CITIES[0]); // Makkah default
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);
  const [aladhanTimings, setAladhanTimings] = useState<AladhanTimings | null>(null);
  const [hijriDateText, setHijriDateText] = useState<string>("");

  const now = useMemo(() => new Date(), []);
  const localHijri = useMemo(() => getHijriDate(now), [now]);

  // Fetch Aladhan API whenever location or city changes
  useEffect(() => {
    let isMounted = true;
    async function loadApiTimings() {
      setLoadingApi(true);
      const params = userCoords
        ? { latitude: userCoords.lat, longitude: userCoords.lng }
        : { city: selectedCity.nameEn, country: "" };

      const data = await fetchAladhanPrayerTimes(params);
      if (isMounted && data) {
        setAladhanTimings(data.timings);
        if (data.date?.hijri) {
          const h = data.date.hijri;
          const text = isAr
            ? `${h.day} ${h.month.ar} ${h.year} هـ`
            : isHe
              ? `${h.day} ${h.month.en} ${h.year} AH`
              : `${h.day} ${h.month.en} ${h.year} AH`;
          setHijriDateText(text);
        }
      }
      if (isMounted) setLoadingApi(false);
    }

    loadApiTimings();
    return () => {
      isMounted = false;
    };
  }, [selectedCity, userCoords, isAr, isHe]);

  // Current calculated fallback if API is loading or unavailable
  const fallbackCalc = calculatePrayerTimes(
    now,
    userCoords?.lat ?? selectedCity.lat,
    userCoords?.lng ?? selectedCity.lng,
  );

  // Format timings from API or Fallback
  const times = {
    fajr: aladhanTimings?.Fajr || fallbackCalc.fajr,
    sunrise: aladhanTimings?.Sunrise || fallbackCalc.sunrise,
    dhuhr: aladhanTimings?.Dhuhr || fallbackCalc.dhuhr,
    asr: aladhanTimings?.Asr || fallbackCalc.asr,
    maghrib: aladhanTimings?.Maghrib || fallbackCalc.maghrib,
    isha: aladhanTimings?.Isha || fallbackCalc.isha,
  };

  const displayHijri = hijriDateText || (isAr ? localHijri.formattedAr : localHijri.formattedEn);

  const requestGeolocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLocationName(
          isAr ? "موقعك الحالي" : isHe ? "המיקום הנוכחי שלך" : "Current GPS Location",
        );
        setLoadingLocation(false);
      },
      () => {
        setLoadingLocation(false);
      },
      { timeout: 10000 },
    );
  };

  const cityName =
    userCoords && locationName
      ? locationName
      : isAr
        ? selectedCity.nameAr
        : isHe
          ? selectedCity.nameHe
          : selectedCity.nameEn;

  const prayerItems = [
    {
      key: "fajr",
      label: isAr ? "الفجر" : isHe ? "פג'ר" : "Fajr",
      time: times.fajr,
      icon: Sunrise,
    },
    {
      key: "sunrise",
      label: isAr ? "الشروق" : isHe ? "זريחה" : "Sunrise",
      time: times.sunrise,
      icon: Sun,
    },
    {
      key: "dhuhr",
      label: isAr ? "الظهر" : isHe ? "צהריים (דהור)" : "Dhuhr",
      time: times.dhuhr,
      icon: Sun,
    },
    {
      key: "asr",
      label: isAr ? "العصر" : isHe ? "מנחה (עסר)" : "Asr",
      time: times.asr,
      icon: Sun,
    },
    {
      key: "maghrib",
      label: isAr ? "المغرب" : isHe ? "ערבית (מגרב)" : "Maghrib",
      time: times.maghrib,
      icon: Sunset,
    },
    {
      key: "isha",
      label: isAr ? "العشاء" : isHe ? "עشاء" : "Isha",
      time: times.isha,
      icon: Moon,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-xl space-y-5">
      {/* Header Bar with Location & Hijri Date */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-2.5 text-primary">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">
                {isAr ? "مواقيت الصلاة اليومية" : isHe ? "זמני תפילה יומיים" : "Daily Prayer Times"}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="h-3 w-3" />
                Aladhan API
              </span>
            </div>
            {/* Islamic Hijri Date Display */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Calendar className="h-3.5 w-3.5 text-gold shrink-0" />
              <span className="font-semibold text-foreground">{displayHijri}</span>
              <span>•</span>
              <span>{cityName}</span>
            </div>
          </div>
        </div>

        {/* Location selector & GPS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={requestGeolocation}
            disabled={loadingLocation}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition-all disabled:opacity-50"
            title={isAr ? "استخدام الموقع الحالي" : isHe ? "שתף מיקום" : "Use current location"}
          >
            <MapPin
              className={`h-3.5 w-3.5 text-primary ${loadingLocation ? "animate-bounce" : ""}`}
            />
            <span className="hidden sm:inline">
              {loadingLocation
                ? isAr
                  ? "جاري تحديد الموقع..."
                  : "Locating..."
                : isAr
                  ? "موقعي"
                  : isHe
                    ? "מיקום נוכחי"
                    : "GPS"}
            </span>
          </button>

          <select
            value={userCoords ? "custom" : selectedCity.nameEn}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "custom") return;
              setUserCoords(null);
              const found = MAJOR_CITIES.find((c) => c.nameEn === val);
              if (found) setSelectedCity(found);
            }}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {userCoords && <option value="custom">{locationName}</option>}
            {MAJOR_CITIES.map((c) => (
              <option key={c.nameEn} value={c.nameEn}>
                {isAr ? c.nameAr : isHe ? c.nameHe : c.nameEn}
              </option>
            ))}
          </select>

          {loadingApi && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Grid of 6 Prayer Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {prayerItems.map((item) => {
          const IconComponent = item.icon;
          const isNext = fallbackCalc.nextPrayerKey === item.key;

          return (
            <div
              key={item.key}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all ${
                isNext
                  ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
                  : "border-border/70 bg-card hover:border-primary/40"
              }`}
            >
              <div
                className={`p-2 rounded-xl mb-1.5 ${
                  isNext ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
                }`}
              >
                <IconComponent className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
              <span className="text-sm font-extrabold text-foreground mt-0.5">{item.time}</span>
              {isNext && (
                <span className="mt-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                  {isAr ? "الصلاة القادمة" : isHe ? "התפילה הבאה" : "Next Prayer"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Qibla Direction & Status Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3 gap-2">
        <div className="flex items-center gap-1.5">
          <Compass className="h-4 w-4 text-primary" />
          <span>
            {isAr ? "اتجاه القبلة:" : isHe ? "כיוון הקבלה:" : "Qibla Direction:"}{" "}
            <strong className="text-foreground">{fallbackCalc.qiblaDegrees}°</strong>{" "}
            {isAr ? "من الشمال" : "from North"}
          </span>
        </div>
        <div>
          {isAr
            ? "يتم تحديث المواعيد تلقائياً حسب الموقع الهجري والجغرافي"
            : isHe
              ? "הזמנים מתעדכנים אוטומטית לפי היג'רי ומיקום"
              : "Prayer times dynamically sync via Aladhan API & Hijri calendar"}
        </div>
      </div>
    </section>
  );
}
