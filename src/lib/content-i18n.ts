import { useTranslation } from "react-i18next";

/**
 * Helpers that resolve localized content for slug-keyed data (emotions,
 * topics, prophets, plans). They fall back to Hebrew if a translation key
 * is missing, so the site never shows raw slug values.
 */

export function useEmotionT(slug: string) {
  const { t } = useTranslation("content");
  const pick = (key: string, fallback: string) => {
    const current = t(key, { defaultValue: "" });
    if (current) return current;
    const hebrewFallback = t(key, { lng: "he", defaultValue: "" });
    return hebrewFallback || fallback;
  };
  return {
    title: pick(`emotions.${slug}.title`, slug),
    subtitle: pick(`emotions.${slug}.subtitle`, ""),
    description: pick(`emotions.${slug}.description`, ""),
  };
}

export function useTopicT(slug: string) {
  const { t } = useTranslation("content");
  const pick = (key: string, fallback: string) => {
    const current = t(key, { defaultValue: "" });
    if (current) return current;
    const hebrewFallback = t(key, { lng: "he", defaultValue: "" });
    return hebrewFallback || fallback;
  };
  return {
    title: pick(`topics.${slug}.title`, slug),
    subtitle: pick(`topics.${slug}.subtitle`, ""),
    description: pick(`topics.${slug}.description`, ""),
  };
}

export function useProphetT(slug: string) {
  const { t } = useTranslation("content");
  const pick = (key: string, fallback: string) => {
    const current = t(key, { defaultValue: "" });
    if (current) return current;
    const hebrewFallback = t(key, { lng: "he", defaultValue: "" });
    return hebrewFallback || fallback;
  };
  return {
    name: pick(`prophets.${slug}.name`, slug),
    alt: pick(`prophets.${slug}.alt`, ""),
  };
}

export function usePlanDayT(slug: string, day: number, fallback: string) {
  const { t } = useTranslation("content");
  return t(`plans.${slug}.days.${day}`, { defaultValue: fallback });
}

export function usePlanT(slug: string) {
  const { t } = useTranslation("content");
  const pick = (key: string, fallback: string) => {
    const current = t(key, { defaultValue: "" });
    if (current) return current;
    const hebrewFallback = t(key, { lng: "he", defaultValue: "" });
    return hebrewFallback || fallback;
  };
  return {
    title: pick(`plans.${slug}.title`, slug),
    subtitle: pick(`plans.${slug}.subtitle`, ""),
    description: pick(`plans.${slug}.description`, ""),
  };
}

export function useLevelT() {
  const { t } = useTranslation("content");
  return (level: string) => {
    // Original data uses Hebrew enum values — map to canonical key.
    const map: Record<string, string> = {
      מתחילים: "beginner",
      בינוני: "intermediate",
      מתקדם: "advanced",
      beginner: "beginner",
      intermediate: "intermediate",
      advanced: "advanced",
    };
    const key = map[level] ?? "beginner";
    return t(`level.${key}`, { defaultValue: level });
  };
}
