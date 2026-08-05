export interface AladhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export interface AladhanResponseData {
  timings: AladhanTimings;
  date: {
    readable: string;
    timestamp: string;
    hijri: {
      date: string;
      day: string;
      weekday: { en: string; ar: string };
      month: { number: number; en: string; ar: string };
      year: string;
      designation: { abbreviation: string; expanded: string };
    };
    gregorian: {
      date: string;
      day: string;
      weekday: { en: string };
      month: { number: number; en: string };
      year: string;
    };
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
      id: number;
      name: string;
    };
  };
}

/**
 * Fetches the 5 daily prayer times from Aladhan API for a given city & country or latitude & longitude.
 */
export async function fetchAladhanPrayerTimes({
  city = "Makkah",
  country = "Saudi Arabia",
  latitude,
  longitude,
}: {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}): Promise<AladhanResponseData | null> {
  try {
    let url = "";
    if (latitude !== undefined && longitude !== undefined) {
      url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=4`;
    } else {
      url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
        city,
      )}&country=${encodeURIComponent(country)}&method=4`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Aladhan API response status: ${response.status}`);
    }
    const data = await response.json();
    if (data.code === 200 && data.data) {
      return data.data as AladhanResponseData;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch Aladhan prayer times:", error);
    return null;
  }
}
