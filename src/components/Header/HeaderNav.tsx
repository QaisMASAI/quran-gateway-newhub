import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Search,
  Compass,
  BookMarked,
  Sparkles,
  Folder,
  Gamepad2,
  ScrollText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getUiVisibilitySettings } from "@/lib/ui-visibility.functions";

import { MegaMenu } from "./MegaMenu";

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
      activeProps={{
        className: "bg-primary/10 text-primary font-semibold shadow-xs ring-1 ring-primary/20",
        "aria-current": "page",
      }}
      inactiveProps={{
        className: "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
      }}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200"
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
  const visibilityFn = useServerFn(getUiVisibilitySettings);
  const { data: visibility } = useQuery({
    queryKey: ["ui-visibility"],
    queryFn: () => visibilityFn(),
    staleTime: 60_000,
  });

  const hidden = new Set(visibility?.hiddenNav ?? []);

  return (
    <nav className="hidden items-center gap-1 sm:flex" aria-label={t("nav.surahs")}>
      <MegaMenu />
      {!hidden.has("surahs") && (
        <NavLink to="/surahs" label={t("nav.surahs")} icon={<BookOpen className="h-4 w-4" />} />
      )}
      {!hidden.has("stories") && (
        <NavLink to="/stories" label={t("nav.stories")} icon={<ScrollText className="h-4 w-4" />} />
      )}
      {!hidden.has("learn") && (
        <NavLink to="/learn" label={t("nav.learn")} icon={<BookMarked className="h-4 w-4" />} />
      )}
      {!hidden.has("tafsir") && (
        <NavLink to="/tafsir" label={t("nav.tafsir")} icon={<BookOpen className="h-4 w-4" />} />
      )}
      {!hidden.has("search") && (
        <NavLink to="/search" label={t("nav.search")} icon={<Search className="h-4 w-4" />} />
      )}
      {!hidden.has("kids") && (
        <NavLink to="/kids" label="Kids" icon={<Gamepad2 className="h-4 w-4" />} />
      )}
      {isAuthenticated && !hidden.has("admin_kids") && (
        <NavLink to="/admin/kids" label="Kids Q&A" icon={<Gamepad2 className="h-4 w-4" />} />
      )}
      {isAuthenticated && !hidden.has("collections") && (
        <NavLink
          to="/collections"
          label={t("nav.collections")}
          icon={<Folder className="h-4 w-4" />}
        />
      )}
      {isAuthenticated && !hidden.has("admin_setup") && (
        <NavLink to="/admin/setup" label="Admin setup" icon={<Compass className="h-4 w-4" />} />
      )}
      {isAuthenticated && !hidden.has("admin_backfill") && (
        <NavLink to="/admin/backfill" label="Admin" icon={<Sparkles className="h-4 w-4" />} />
      )}
      {isAuthenticated && !hidden.has("admin_kids") && (
        <NavLink to="/admin/kids" label="Kids Admin" icon={<BookMarked className="h-4 w-4" />} />
      )}
    </nav>
  );
}
