import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Compass, MapPin, RefreshCw, Clock, Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { normalizeLocale } from "@/lib/i18n";
import { MAJOR_CITIES, calculatePrayerTimes, type CityPreset } from "@/lib/prayer-times";

export const Route = createFileRoute("/prayer-times")({
  head: () => ({
    meta: [
      { title: "Prayer Times & Qibla | Bayan AI" },
      {
        name: "description",
        content:
          "Check daily prayer times and Qibla direction with city presets and multilingual support for Muslim worship routines.",
      },
      { property: "og:title", content: "Prayer Times & Qibla | Bayan AI" },
      {
        property: "og:description",
        content:
          "View Fajr, Dhuhr, Asr, Maghrib, and Isha schedules with Qibla bearing for major cities in one dedicated page.",
      },
      { property: "og:url", content: "/prayer-times" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/prayer-times" }],
  }),
  component: PrayerTimesPage,
});

function PrayerTimesPage() {
  const { i18n, t } = useTranslation("common");
  const locale = (normalizeLocale(i18n.language) ?? "he") as "he" | "ar" | "en";
  const isRtl = i18n.dir() === "rtl";

  const [selectedCity, setSelectedCity] = useState<CityPreset>(MAJOR_CITIES[0]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const now = new Date();
  const activeLat = userCoords?.lat ?? selectedCity.lat;
  const activeLng = userCoords?.lng ?? selectedCity.lng;
  const result = useMemo(
    () => calculatePrayerTimes(now, activeLat, activeLng),
    [now, activeLat, activeLng],
  );

  const prayers = [
    {
      key: "fajr" as const,
      label: t("prayerTimes.fajr"),
      time: result.fajr,
      icon: Sunrise,
    },
    {
      key: "sunrise" as const,
      label: t("prayerTimes.sunrise"),
      time: result.sunrise,
      icon: Sun,
    },
    {
      key: "dhuhr" as const,
      label: t("prayerTimes.dhuhr"),
      time: result.dhuhr,
      icon: Sun,
    },
    {
      key: "asr" as const,
      label: t("prayerTimes.asr"),
      time: result.asr,
      icon: Sun,
    },
    {
      key: "maghrib" as const,
      label: t("prayerTimes.maghrib"),
      time: result.maghrib,
      icon: Sunset,
    },
    {
      key: "isha" as const,
      label: t("prayerTimes.isha"),
      time: result.isha,
      icon: Moon,
    },
  ];

  const locationLabel =
    userCoords && locationName
      ? locationName
      : locale === "ar"
        ? selectedCity.nameAr
        : locale === "he"
          ? selectedCity.nameHe
          : selectedCity.nameEn;

  const requestGeolocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserCoords({ lat: coords.latitude, lng: coords.longitude });
        setLocationName(
          locale === "ar"
            ? "موقعك الحالي"
            : locale === "he"
              ? "המיקום הנוכחי שלך"
              : "Your Current Location",
        );
        setLoadingLocation(false);
      },
      () => setLoadingLocation(false),
      { timeout: 10000 },
    );
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-extrabold text-foreground">{t("prayerTimes.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("prayerTimes.subtitle")}</p>
        </section>

        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{locationLabel}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={requestGeolocation}
              disabled={loadingLocation}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loadingLocation ? "animate-spin" : ""}`} />
              {t("prayerTimes.refreshLocation")}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {MAJOR_CITIES.map((city) => {
              const isActive = !userCoords && city.nameEn === selectedCity.nameEn;
              return (
                <Button
                  key={city.nameEn}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setUserCoords(null);
                    setSelectedCity(city);
                  }}
                >
                  {locale === "ar" ? city.nameAr : locale === "he" ? city.nameHe : city.nameEn}
                </Button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground inline-flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {t("prayerTimes.todaySchedule")}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prayers.map((prayer) => {
              const Icon = prayer.icon;
              const isNext = prayer.key === result.nextPrayerKey;
              return (
                <div
                  key={prayer.key}
                  className={`rounded-2xl border p-4 ${
                    isNext ? "border-gold/50 bg-gold/10" : "border-border/70 bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{prayer.label}</span>
                    </div>
                    <span className="font-mono text-base font-bold text-foreground">
                      {prayer.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("prayerTimes.nextPrayer", {
              prayer: prayers.find((p) => p.key === result.nextPrayerKey)?.label,
              time: result.nextPrayerTimeFormatted,
              minutes: result.timeRemainingMinutes,
            })}
          </p>
        </section>

        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground inline-flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            {t("prayerTimes.qiblaTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("prayerTimes.qiblaBearing", { degrees: result.qiblaDegrees })}
          </p>
        </section>
      </main>
    </div>
  );
}
