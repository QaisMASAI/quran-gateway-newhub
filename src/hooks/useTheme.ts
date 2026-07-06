import { useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

/**
 * Custom hook for theme management.
 * Handles theme persistence and DOM updates.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored =
      typeof document !== "undefined"
        ? document.documentElement.classList.contains("dark")
          ? "dark"
          : "light"
        : "light";
    setTheme(stored);
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      const root = document.documentElement;
      if (next === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
      try {
        localStorage.setItem("qc:theme", next);
      } catch {
        // localStorage unavailable (e.g. private mode) — ignore.
      }
      return next;
    });
  }, []);

  const isDark = mounted && theme === "dark";

  return { theme, isDark, toggle, mounted };
}
