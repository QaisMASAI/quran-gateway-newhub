import moment from "moment-hijri";

export interface HijriDateInfo {
  day: number;
  month: number;
  year: number;
  monthNameEn: string;
  monthNameAr: string;
  formattedEn: string;
  formattedAr: string;
}

const HIJRI_MONTHS_AR = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الثاني",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

const HIJRI_MONTHS_EN = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
];

/**
 * Computes the Islamic (Hijri) date from a given Gregorian date using moment-hijri.
 */
export function getHijriDate(date: Date = new Date()): HijriDateInfo {
  const m = moment(date);
  const iYear = m.iYear();
  const iMonth = m.iMonth(); // 0-indexed
  const iDate = m.iDate();

  const monthNameAr = HIJRI_MONTHS_AR[iMonth] || "";
  const monthNameEn = HIJRI_MONTHS_EN[iMonth] || "";

  return {
    day: iDate,
    month: iMonth + 1,
    year: iYear,
    monthNameEn,
    monthNameAr,
    formattedEn: `${iDate} ${monthNameEn} ${iYear} AH`,
    formattedAr: `${iDate} ${monthNameAr} ${iYear} هـ`,
  };
}
