import { Link } from "@tanstack/react-router";
import { BookOpen, Search, LogIn, LogOut, Users, Compass, BookMarked, Sparkles, Folder } from "lucide-react";

import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/use-auth";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export function Header() {
  const { isAuthenticated, user, signOut } = useAuth();
  const { t, i18n } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const isRtl = i18n.dir() === "rtl";

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial =
    (user?.user_metadata?.full_name as string | undefined)?.[0] ??
    user?.email?.[0]?.toUpperCase() ??
    "?";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label={t("site.name")}>
          <Logo className="h-10 w-10 drop-shadow-sm transition-transform group-hover:rotate-[8deg]" />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-foreground">{t("site.name")}</div>
            <div className="text-[11px] text-muted-foreground">{t("site.tagline")}</div>
          </div>
        </Link>

        {/* Desktop nav — hidden on mobile (BottomNav takes over there) */}
        <nav className="hidden items-center gap-1 sm:flex" aria-label={t("nav.surahs")}>
          <NavLink to="/" label={t("nav.surahs")} icon={<BookOpen className="h-4 w-4" />} />
          <NavLink to="/research" label={t("nav.research")} icon={<Sparkles className="h-4 w-4" />} />
          <NavLink to="/learn" label={t("nav.learn")} icon={<BookMarked className="h-4 w-4" />} />
          <NavLink to="/prophets" label={t("nav.prophets")} icon={<Users className="h-4 w-4" />} />
          <NavLink to="/topics" label={t("nav.topics")} icon={<Compass className="h-4 w-4" />} />
          <NavLink to="/search" label={t("nav.search")} icon={<Search className="h-4 w-4" />} />
          {isAuthenticated && (
            <NavLink to="/collections" label={t("nav.collections")} icon={<Folder className="h-4 w-4" />} />
          )}

        </nav>

        <div className="flex items-center gap-1.5">
          <LocaleSwitcher />
          <ThemeToggle />

          {isAuthenticated ? (
            <div ref={ref} className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20 hover:bg-primary/15"
                aria-label={t("nav.account")}
                aria-haspopup="menu"
                aria-expanded={open}
              >
                {initial}
              </button>
              {open && (
                <div role="menu" className={`absolute ${isRtl ? 'start-0' : 'end-0'} mt-2 w-56 rounded-xl border border-border bg-background p-2 shadow-soft`}>
                  <div className="border-b border-border px-3 py-2">
                    <div className="truncate text-sm font-medium text-foreground">
                      {(user?.user_metadata?.full_name as string | undefined) ?? user?.email}
                    </div>
                    {user?.email && (
                      <div className="truncate text-[11px] text-muted-foreground" dir="ltr">
                        {user.email}
                      </div>
                    )}
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
                    role="menuitem"
                  >
                    <BookMarked className="h-4 w-4" aria-hidden="true" />
                    {t("nav.profile")}
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setOpen(false);
                      await signOut();
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    {t("nav.signOut")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t("nav.signIn")}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      activeProps={{ className: "bg-secondary text-foreground", "aria-current": "page" }}
      inactiveProps={{ className: "text-muted-foreground hover:bg-secondary/60 hover:text-foreground" }}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
