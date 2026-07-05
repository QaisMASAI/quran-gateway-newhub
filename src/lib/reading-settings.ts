// Reading preferences for the Quran reader: Arabic font size + tashkil toggle.
// Persists to localStorage and broadcasts changes via a custom event so all
// AyahCards on the page react in unison.

import { useEffect, useState } from "react";

export interface ReadingSettings {
  /** Multiplier applied to the base Arabic font size (1 = default). */
  arabicScale: number;
  /** When true, strip Arabic diacritics (tashkil) from the displayed text. */
  stripTashkil: boolean;
}

const KEY = "qc:reading-settings";
const EVT = "qc:reading-settings-change";

export const DEFAULT_SETTINGS: ReadingSettings = {
  arabicScale: 1,
  stripTashkil: false,
};

export function getStoredSettings(): ReadingSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ReadingSettings>;
    return {
      arabicScale: clamp(parsed.arabicScale ?? 1, 0.75, 1.8),
      stripTashkil: !!parsed.stripTashkil,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function setStoredSettings(next: ReadingSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent<ReadingSettings>(EVT, { detail: next }));
}

export function useReadingSettings(): [ReadingSettings, (patch: Partial<ReadingSettings>) => void] {
  const [settings, setSettings] = useState<ReadingSettings>(() => getStoredSettings());

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ReadingSettings>).detail;
      if (detail) setSettings(detail);
    };
    window.addEventListener(EVT, onChange as EventListener);
    return () => window.removeEventListener(EVT, onChange as EventListener);
  }, []);

  const update = (patch: Partial<ReadingSettings>) => {
    const next = { ...settings, ...patch };
    setStoredSettings(next);
    setSettings(next);
  };

  return [settings, update];
}

/** Remove Arabic diacritics (tashkil) — keeps base letters intact. */
export function stripArabicDiacritics(text: string): string {
  return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
