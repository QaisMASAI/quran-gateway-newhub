// Astronomical Prayer Time & Qibla Calculation Library

export interface CityPreset {
  nameAr: string;
  nameEn: string;
  nameHe: string;
  lat: number;
  lng: number;
  timezoneOffsetHours: number;
}

export const MAJOR_CITIES: CityPreset[] = [
  {
    nameAr: "مكة المكرمة",
    nameEn: "Makkah",
    nameHe: "מכה",
    lat: 21.4225,
    lng: 39.8262,
    timezoneOffsetHours: 3,
  },
  {
    nameAr: "المدينة المنورة",
    nameEn: "Madinah",
    nameHe: "אל-מדינה",
    lat: 24.4672,
    lng: 39.6112,
    timezoneOffsetHours: 3,
  },
  {
    nameAr: "القدس الشريف",
    nameEn: "Jerusalem",
    nameHe: "ירושלים",
    lat: 31.7683,
    lng: 35.2137,
    timezoneOffsetHours: 3,
  },
  {
    nameAr: "القاهرة",
    nameEn: "Cairo",
    nameHe: "קהיר",
    lat: 30.0444,
    lng: 31.2357,
    timezoneOffsetHours: 3,
  },
  {
    nameAr: "إسطنبول",
    nameEn: "Istanbul",
    nameHe: "איסטנבול",
    lat: 41.0082,
    lng: 28.9784,
    timezoneOffsetHours: 3,
  },
  {
    nameAr: "لندن",
    nameEn: "London",
    nameHe: "לונדון",
    lat: 51.5074,
    lng: -0.1278,
    timezoneOffsetHours: 1,
  },
  {
    nameAr: "نيويورك",
    nameEn: "New York",
    nameHe: "ניו יורק",
    lat: 40.7128,
    lng: -74.006,
    timezoneOffsetHours: -4,
  },
  {
    nameAr: "كوالالمبور",
    nameEn: "Kuala Lumpur",
    nameHe: "קואלה לומפור",
    lat: 3.139,
    lng: 101.6869,
    timezoneOffsetHours: 8,
  },
  {
    nameAr: "جاكرتا",
    nameEn: "Jakarta",
    nameHe: "ג'קרטה",
    lat: -6.2088,
    lng: 106.8456,
    timezoneOffsetHours: 7,
  },
  {
    nameAr: "الرياض",
    nameEn: "Riyadh",
    nameHe: "ריאד",
    lat: 24.7136,
    lng: 46.6753,
    timezoneOffsetHours: 3,
  },
  {
    nameAr: "دبي",
    nameEn: "Dubai",
    nameHe: "דובאי",
    lat: 25.2048,
    lng: 55.2708,
    timezoneOffsetHours: 4,
  },
  {
    nameAr: "برلين",
    nameEn: "Berlin",
    nameHe: "ברלין",
    lat: 52.52,
    lng: 13.405,
    timezoneOffsetHours: 2,
  },
  {
    nameAr: "باريس",
    nameEn: "Paris",
    nameHe: "פריז",
    lat: 48.8566,
    lng: 2.3522,
    timezoneOffsetHours: 2,
  },
  {
    nameAr: "טורונטו",
    nameEn: "Toronto",
    nameHe: "טורונטו",
    lat: 43.6532,
    lng: -79.3832,
    timezoneOffsetHours: -4,
  },
];

export interface PrayerTimesResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  nextPrayerKey: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
  nextPrayerTimeFormatted: string;
  timeRemainingMinutes: number;
  qiblaDegrees: number;
}

// Kaaba Coordinates in Makkah
const MAKKAH_LAT = 21.422487;
const MAKKAH_LNG = 39.826206;

export function calculateQiblaDirection(lat: number, lng: number): number {
  const phi1 = (lat * Math.PI) / 180;
  const lambda1 = (lng * Math.PI) / 180;
  const phi2 = (MAKKAH_LAT * Math.PI) / 180;
  const lambda2 = (MAKKAH_LNG * Math.PI) / 180;

  const dLambda = lambda2 - lambda1;
  const y = Math.sin(dLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLambda);

  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  qibla = (qibla + 360) % 360;
  return Math.round(qibla);
}

// Standard Astronomical calculation helper for daily prayer times
export function calculatePrayerTimes(date: Date, lat: number, lng: number): PrayerTimesResult {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Day of year calculation
  const N =
    Math.floor(275 * (month / 9)) -
    Math.floor((month + 9) / 12) * (1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3)) +
    day -
    30;

  // Approximate solar declination & Equation of Time
  const B = (2 * Math.PI * (N - 81)) / 365;
  const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // minutes
  const declination = 23.45 * Math.sin((2 * Math.PI * (284 + N)) / 365); // degrees

  const timezoneOffsetMinutes = -date.getTimezoneOffset(); // in minutes from UTC

  // Solar noon in local time
  const solarNoonLocalMinutes = 720 - 4 * lng - EoT + timezoneOffsetMinutes;

  const rad = (deg: number) => (deg * Math.PI) / 180;
  const deg = (radVal: number) => (radVal * 180) / Math.PI;

  const hourAngle = (angle: number) => {
    const cosHA =
      (Math.sin(rad(angle)) - Math.sin(rad(lat)) * Math.sin(rad(declination))) /
      (Math.cos(rad(lat)) * Math.cos(rad(declination)));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return 180;
    return deg(Math.acos(cosHA));
  };

  // Standard angle conventions: Fajr = -18°, Sunrise = -0.833°, Isha = -17°
  const haFajr = hourAngle(-18);
  const haSunrise = hourAngle(-0.833);
  const haIsha = hourAngle(-17);

  // Asr calculation (Shafi/Standard: shadow factor = 1)
  const shadowFactor = 1;
  const asrAngle = deg(Math.atan(1 / (shadowFactor + Math.tan(Math.abs(rad(lat - declination))))));
  const haAsr = hourAngle(asrAngle);

  const fajrMinutes = solarNoonLocalMinutes - haFajr * 4;
  const sunriseMinutes = solarNoonLocalMinutes - haSunrise * 4;
  const dhuhrMinutes = solarNoonLocalMinutes + 2; // +2 min safety margin
  const asrMinutes = solarNoonLocalMinutes + haAsr * 4;
  const maghribMinutes = solarNoonLocalMinutes + haSunrise * 4;
  const ishaMinutes = solarNoonLocalMinutes + haIsha * 4;

  const formatMin = (mins: number) => {
    const normalized = (mins + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = Math.floor(normalized % 60);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}`;
  };

  const nowMinutes = date.getHours() * 60 + date.getMinutes();

  const timesList = [
    { key: "fajr" as const, min: fajrMinutes, formatted: formatMin(fajrMinutes) },
    { key: "sunrise" as const, min: sunriseMinutes, formatted: formatMin(sunriseMinutes) },
    { key: "dhuhr" as const, min: dhuhrMinutes, formatted: formatMin(dhuhrMinutes) },
    { key: "asr" as const, min: asrMinutes, formatted: formatMin(asrMinutes) },
    { key: "maghrib" as const, min: maghribMinutes, formatted: formatMin(maghribMinutes) },
    { key: "isha" as const, min: ishaMinutes, formatted: formatMin(ishaMinutes) },
  ];

  let next = timesList.find((t) => t.min > nowMinutes);
  let timeRemaining = 0;

  if (!next) {
    // Tomorrow's Fajr
    next = timesList[0];
    timeRemaining = 24 * 60 - nowMinutes + next.min;
  } else {
    timeRemaining = Math.round(next.min - nowMinutes);
  }

  const qiblaDegrees = calculateQiblaDirection(lat, lng);

  return {
    fajr: formatMin(fajrMinutes),
    sunrise: formatMin(sunriseMinutes),
    dhuhr: formatMin(dhuhrMinutes),
    asr: formatMin(asrMinutes),
    maghrib: formatMin(maghribMinutes),
    isha: formatMin(ishaMinutes),
    nextPrayerKey: next.key,
    nextPrayerTimeFormatted: next.formatted,
    timeRemainingMinutes: Math.max(0, timeRemaining),
    qiblaDegrees,
  };
}
