import { LogOut, BookMarked, LogIn } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

interface HeaderUserProps {
  isAuthenticated: boolean;
  user: User | null;
  onSignOut: () => Promise<void>;
}

export function HeaderUser({
  isAuthenticated,
  user,
  onSignOut,
}: HeaderUserProps) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

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

  if (!isAuthenticated) {
    return (
      <Link
        to="/auth"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
      >
        <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">{t("nav.signIn")}</span>
      </Link>
    );
  }

  return (
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
        <div
          role="menu"
          className="absolute end-0 mt-2 w-56 rounded-xl border border-border bg-background p-2 shadow-soft"
        >
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
              await onSignOut();
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
  );
}
