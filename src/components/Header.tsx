import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { HeaderNav } from "./Header/HeaderNav";
import { HeaderUser } from "./Header/HeaderUser";

export function Header() {
  const { isAuthenticated, user, signOut } = useAuth();
  const { t } = useTranslation("common");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          aria-label={t("site.name")}
        >
          <Logo className="h-10 w-10 drop-shadow-sm transition-transform group-hover:rotate-[8deg]" />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-foreground">
              {t("site.name")}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {t("site.tagline")}
            </div>
          </div>
        </Link>

        <HeaderNav isAuthenticated={isAuthenticated} />

        <div className="flex items-center gap-1.5">
          <LocaleSwitcher />
          <ThemeToggle />
          <HeaderUser
            isAuthenticated={isAuthenticated}
            user={user}
            onSignOut={signOut}
          />
        </div>
      </div>
    </header>
  );
}
