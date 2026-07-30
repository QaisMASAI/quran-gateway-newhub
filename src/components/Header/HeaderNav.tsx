import { Link } from "@tanstack/react-router";
import { BookOpen, Search, Compass, BookMarked, Sparkles, Folder, Gamepad2, Library } from "lucide-react";
import { useTranslation } from "react-i18next";

interface NavLinkProps {
  to: string;
  hash?: string;
  label: string;
  icon: React.ReactNode;
}

function NavLink({ to, hash, label, icon }: NavLinkProps) {
  return (
    <Link
      to={to}
      hash={hash}
      activeOptions={{ exact: to === "/" }}
      activeProps={{ className: "bg-secondary text-foreground", "aria-current": "page" }}
      inactiveProps={{
        className: "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
      }}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

interface HeaderNavProps {
  isAuthenticated: boolean;
}

export function HeaderNav({ isAuthenticated }: HeaderNavProps) {
  const { t } = useTranslation("common");

  return (
    <nav className="hidden items-center gap-1 sm:flex" aria-label={t("nav.surahs")}>
      <NavLink to="/surahs" label={t("nav.surahs")} icon={<BookOpen className="h-4 w-4" />} />
      <NavLink to="/library" label="Library" icon={<Library className="h-4 w-4" />} />
      <NavLink to="/research" label={t("nav.research")} icon={<Sparkles className="h-4 w-4" />} />
      <NavLink to="/learn" label={t("nav.learn")} icon={<BookMarked className="h-4 w-4" />} />
      <NavLink to="/hadith" label={t("nav.hadith")} icon={<BookMarked className="h-4 w-4" />} />
      <NavLink to="/search" label={t("nav.search")} icon={<Search className="h-4 w-4" />} />
      <NavLink to="/kids" label="Kids" icon={<Gamepad2 className="h-4 w-4" />} />
      {isAuthenticated && (
        <NavLink to="/admin/kids" label="Kids Q&A" icon={<Gamepad2 className="h-4 w-4" />} />
      )}
      {isAuthenticated && (
        <NavLink
          to="/collections"
          label={t("nav.collections")}
          icon={<Folder className="h-4 w-4" />}
        />
      )}
      {isAuthenticated && (
        <NavLink to="/admin/setup" label="Admin setup" icon={<Compass className="h-4 w-4" />} />
      )}
      {isAuthenticated && (
        <NavLink to="/admin/backfill" label="Admin" icon={<Sparkles className="h-4 w-4" />} />
      )}
      {isAuthenticated && (
        <NavLink to="/admin/hadith-api" label="Hadith API" icon={<BookMarked className="h-4 w-4" />} />
      )}
      {isAuthenticated && (
        <NavLink to="/admin/hadith-ingest" label="Hadith Import" icon={<Compass className="h-4 w-4" />} />
      )}
    </nav>
  );
}
