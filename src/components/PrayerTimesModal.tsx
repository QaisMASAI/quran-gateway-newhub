import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Compass,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  X,
  Volume2,
} from "lucide-react";
import {
  calculatePrayerTimes,
  calculateQiblaDirection,
  MAJOR_CITIES,
  type CityPreset,
  type PrayerTimesResult,
} from "@/lib/prayer-times";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { normalizeLocale } from "@/lib/i18n";

interface PrayerTimesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrayerTimesModal({ open, onOpenChange }: PrayerTimesModalProps) {
  const { i18n } = useTranslation("common");
  const locale = (normalizeLocale(i18n.language) ?? "he") as "he" | "ar" | "en";
  const isRtl = i18n.dir() === "rtl";

  const [selectedCity, setSelectedCity] = useState<CityPreset>(MAJOR_CITIES[0]); // Makkah default
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const activeLat = userCoords?.lat ?? selectedCity.lat;
  const activeLng = userCoords?.lng ?? selectedCity.lng;

  const prayerResult: PrayerTimesResult = calculatePrayerTimes(now, activeLat, activeLng);

  const requestGeolocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLocationName(
          locale === "ar"
            ? "موقعك الحالي"
            : locale === "he"
              ? "המיקום הנוכחי שלך"
              : "Your Current Location",
        );
        setLoadingLocation(false);
      },
      () => {
        setLoadingLocation(false);
      },
      { timeout: 10000 },
    );
  };

  const currentCityName =
    userCoords && locationName
      ? locationName
      : locale === "ar"
        ? selectedCity.nameAr
        : locale === "he"
          ? selectedCity.nameHe
          : selectedCity.nameEn;

  const prayers = [
    {
      key: "fajr" as const,
      label: locale === "ar" ? "الفجر" : locale === "he" ? "פג'ר" : "Fajr",
      time: prayerResult.fajr,
      icon: Sunrise,
    },
    {
      key: "sunrise" as const,
      label: locale === "ar" ? "الشروق" : locale === "he" ? "זריחה" : "Sunrise",
      time: prayerResult.sunrise,
      icon: Sun,
    },
    {
      key: "dhuhr" as const,
      label: locale === "ar" ? "الظهر" : locale === "he" ? "צהריים (דהור)" : "Dhuhr",
      time: prayerResult.dhuhr,
      icon: Sun,
    },
    {
      key: "asr" as const,
      label: locale === "ar" ? "العصر" : locale === "he" ? "עצר" : "Asr",
      time: prayerResult.asr,
      icon: Sun,
    },
    {
      key: "maghrib" as const,
      label: locale === "ar" ? "المغرب" : locale === "he" ? "מגרב" : "Maghrib",
      time: prayerResult.maghrib,
      icon: Sunset,
    },
    {
      key: "isha" as const,
      label: locale === "ar" ? "العشاء" : locale === "he" ? "עשא" : "Isha",
      time: prayerResult.isha,
      icon: Moon,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl p-0 overflow-hidden border-border/80 bg-card/95 backdrop-blur-2xl"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div
          className="arabesque-bg relative p-6 text-white"
          style={{ background: "var(--gradient-hero)" }}
        >
          <DialogHeader className="text-start">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                  <Clock className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    {locale === "ar"
                      ? "أوقات الصلاة والقبلة"
                      : locale === "he"
                        ? "זמני תפילה וקיבלה"
                        : "Prayer Times & Qibla"}
                  </DialogTitle>
                  <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-gold" />
                    {currentCityName}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={requestGeolocation}
                disabled={loadingLocation}
                className="h-9 w-9 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20"
                title="Detect My Location"
              >
                <RefreshCw className={`h-4 w-4 ${loadingLocation ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </DialogHeader>

          {/* Next Prayer Banner */}
          <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gold font-bold">
                {locale === "ar"
                  ? "الصلاة القادمة"
                  : locale === "he"
                    ? "התפילה הבאה"
                    : "Next Prayer"}
              </p>
              <p className="text-2xl font-extrabold text-white mt-0.5 capitalize">
                {prayers.find((p) => p.key === prayerResult.nextPrayerKey)?.label}
              </p>
            </div>

            <div className="text-end">
              <p className="text-2xl font-mono font-bold text-gold">
                {prayerResult.nextPrayerTimeFormatted}
              </p>
              <p className="text-xs text-white/80 mt-0.5">
                {locale === "ar"
                  ? `باقي ${prayerResult.timeRemainingMinutes} دقيقة`
                  : locale === "he"
                    ? `נותרו ${prayerResult.timeRemainingMinutes} דקות`
                    : `In ${prayerResult.timeRemainingMinutes} min`}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* City Preset Picker */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              {locale === "ar"
                ? "اختر المدينة"
                : locale === "he"
                  ? "בחירת עיר"
                  : "Select City Preset"}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MAJOR_CITIES.map((city) => {
                const isSelected = !userCoords && selectedCity.nameEn === city.nameEn;
                return (
                  <button
                    key={city.nameEn}
                    type="button"
                    onClick={() => {
                      setUserCoords(null);
                      setSelectedCity(city);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-2xs"
                        : "border-border/80 bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {locale === "ar" ? city.nameAr : locale === "he" ? city.nameHe : city.nameEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prayer Times Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {prayers.map((item) => {
              const Icon = item.icon;
              const isNext = item.key === prayerResult.nextPrayerKey;
              return (
                <div
                  key={item.key}
                  className={`rounded-2xl border p-3.5 transition-all flex items-center justify-between ${
                    isNext
                      ? "border-gold/60 bg-gold/10 text-foreground ring-1 ring-gold/40 shadow-sm"
                      : "border-border/70 bg-card text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isNext
                          ? "bg-gold text-primary-foreground font-bold"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{item.label}</p>
                      {isNext && (
                        <span className="text-[10px] font-semibold text-gold uppercase tracking-wider">
                          {locale === "ar" ? "قريباً" : locale === "he" ? "בקרוב" : "Next"}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-primary">{item.time}</span>
                </div>
              );
            })}
          </div>

          {/* Qibla Direction Compass Section */}
          <div className="rounded-2xl border border-primary/20 bg-primary-soft/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {locale === "ar"
                    ? "اتجاه القبلة نحو مكة"
                    : locale === "he"
                      ? "כיוון הקיבלה למכה"
                      : "Qibla Direction (to Makkah)"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {locale === "ar"
                    ? `زاوية القبلة: ${prayerResult.qiblaDegrees}° من الشمال`
                    : locale === "he"
                      ? `זווית הקיבלה: ${prayerResult.qiblaDegrees}° מהצפון`
                      : `Bearing: ${prayerResult.qiblaDegrees}° from True North`}
                </p>
              </div>
            </div>

            {/* Visual Compass Dial */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-primary/40 bg-card shadow-inner">
              <span className="absolute top-1 text-[9px] font-bold text-muted-foreground">N</span>
              <span className="absolute bottom-1 text-[9px] font-bold text-muted-foreground">
                S
              </span>
              <span className="absolute left-1 text-[9px] font-bold text-muted-foreground">W</span>
              <span className="absolute right-1 text-[9px] font-bold text-muted-foreground">E</span>

              {/* Arrow pointing to Qibla degree */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-700"
                style={{ transform: `rotate(${prayerResult.qiblaDegrees}deg)` }}
              >
                <div className="h-10 w-1 bg-gradient-to-t from-transparent via-gold to-primary rounded-full relative">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-6 border-b-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
