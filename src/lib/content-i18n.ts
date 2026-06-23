import { useTranslation } from "react-i18next";

/**
 * Helpers that resolve localized content for slug-keyed data (emotions,
 * topics, prophets, plans). They fall back to Hebrew if a translation key
 * is missing, so the site never shows raw slug values.
 */

export function useEmotionT(slug: string) {
  const { t } = useTranslation("content");
  return {
    title: t(`emotions.${slug}.title`, { defaultValue: slug }),
    subtitle: t(`emotions.${slug}.subtitle`, { defaultValue: "" }),
    description: t(`emotions.${slug}.description`, { defaultValue: "" }),
  };
}

export function useTopicT(slug: string) {
  const { t } = useTranslation("content");
  return {
    title: t(`topics.${slug}.title`, { defaultValue: slug }),
    subtitle: t(`topics.${slug}.subtitle`, { defaultValue: "" }),
    description: t(`topics.${slug}.description`, { defaultValue: "" }),
  };
}

export function useProphetT(slug: string) {
  const { t } = useTranslation("content");
  return {
    name: t(`prophets.${slug}.name`, { defaultValue: slug }),
    alt: t(`prophets.${slug}.alt`, { defaultValue: "" }),
  };
}

export function usePlanDayT(slug: string, day: number, fallback: string) {
  const { t } = useTranslation("content");
  return t(`plans.${slug}.days.${day}`, { defaultValue: fallback });
}

export function usePlanT(slug: string) {
  const { t } = useTranslation("content");
  return {
    title: t(`plans.${slug}.title`, { defaultValue: slug }),
    subtitle: t(`plans.${slug}.subtitle`, { defaultValue: "" }),
    description: t(`plans.${slug}.description`, { defaultValue: "" }),
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
