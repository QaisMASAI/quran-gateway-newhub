import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, Search, Sparkles, Star } from "lucide-react";

export function BottomNav() {
  const { t } = useTranslation("pages");
  const items: Array<{
    to: string;
    hash?: string;
    labelKey: string;
    icon: React.ReactNode;
    exact?: boolean;
  }> = [
    {
      to: "/",
      labelKey: "surahs",
      icon: <BookOpen className="h-5 w-5" aria-hidden="true" />,
      exact: true,
    },
    { to: "/search", labelKey: "search", icon: <Search className="h-5 w-5" aria-hidden="true" /> },
    { to: "/ask", labelKey: "ask", icon: <Sparkles className="h-5 w-5" aria-hidden="true" /> },
    {
      to: "/learn",
      labelKey: "discover",
      icon: <BookOpen className="h-5 w-5" aria-hidden="true" />,
    },
    {
      to: "/favorites",
      labelKey: "favorites",
      icon: <Star className="h-5 w-5" aria-hidden="true" />,
    },
  ];

  return (
    <nav
      aria-label={t("bottomNav.label")}
      className="fixed bottom-0 end-0 start-0 z-40 border-t border-border bg-background/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((it) => (
          <li key={`${it.to}-${it.labelKey}`} className="flex-1">
            <Link
              to={it.to}
              hash={it.hash}
              activeOptions={{ exact: !!it.exact }}
              activeProps={{ className: "text-primary", "aria-current": "page" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex min-h-11 flex-col items-center justify-center gap-0.5 px-2 py-2.5 text-[10.5px] font-medium transition-colors"
            >
              {it.icon}
              <span>{t(`bottomNav.${it.labelKey}`)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
