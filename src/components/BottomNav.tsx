import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, Compass, Search, Sparkles, Star } from "lucide-react";

export function BottomNav() {
  const { t } = useTranslation("pages");
  const items: Array<{
    to: string;
    hash?: string;
    labelKey: string;
    icon: React.ReactNode;
    exact?: boolean;
    isCenter?: boolean;
  }> = [
    {
      to: "/surahs",
      labelKey: "surahs",
      icon: <BookOpen className="h-5 w-5" aria-hidden="true" />,
      exact: true,
    },
    { to: "/search", labelKey: "search", icon: <Search className="h-5 w-5" aria-hidden="true" /> },
    {
      to: "/ask",
      labelKey: "ask",
      icon: <Sparkles className="h-5 w-5 text-gold" aria-hidden="true" />,
      isCenter: true,
    },
    {
      to: "/learn",
      labelKey: "discover",
      icon: <Compass className="h-5 w-5" aria-hidden="true" />,
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
      className="fixed bottom-3 inset-x-3 z-50 sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto max-w-md rounded-2xl border border-border/80 bg-background/90 p-1.5 backdrop-blur-xl shadow-xl shadow-primary/5">
        <ul className="flex items-center justify-around">
          {items.map((it) => (
            <li key={`${it.to}-${it.labelKey}`} className="flex-1">
              <Link
                to={it.to}
                hash={it.hash}
                activeOptions={{ exact: !!it.exact }}
                activeProps={{
                  className: "text-primary font-bold bg-primary/10 rounded-xl",
                  "aria-current": "page",
                }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-all ${
                  it.isCenter ? "relative -top-1" : ""
                }`}
              >
                {it.isCenter ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-olive text-primary-foreground shadow-md shadow-primary/20">
                    <Sparkles className="h-5 w-5 text-gold animate-pulse" />
                  </div>
                ) : (
                  it.icon
                )}
                <span className={it.isCenter ? "mt-0.5 text-foreground font-bold" : ""}>
                  {t(`bottomNav.${it.labelKey}`)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
