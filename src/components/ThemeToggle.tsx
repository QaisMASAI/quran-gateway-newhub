import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { isDark, toggle, mounted } = useTheme();
  const { t } = useTranslation("common");

  const label = isDark ? t("ui.theme.light") : t("ui.theme.dark");

  if (!mounted) {
    return (
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
