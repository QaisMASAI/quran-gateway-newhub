import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Search, Sparkles, Clock, MessageSquare, Calendar } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { PrayerTimesModal } from "@/components/PrayerTimesModal";
import { FeedbackModal } from "@/components/FeedbackModal";
import { getHijriDate } from "@/lib/hijri-date";
import { HeaderNav } from "./HeaderNav";
import { HeaderUser } from "./HeaderUser";

export function Header() {
  const { isAuthenticated, user, signOut } = useAuth();
  const { t, i18n } = useTranslation("common");
  const [prayerModalOpen, setPrayerModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const isAr = i18n.language === "ar";
  const isHe = i18n.language === "he";

  const hijri = useMemo(() => getHijriDate(new Date()), []);
  const hijriText = isAr ? hijri.formattedAr : hijri.formattedEn;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
          <Link to="/" className="flex items-center gap-3 group" aria-label={t("site.name")}>
            <div className="relative">
              <Logo className="h-11 w-11 drop-shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-gold shadow-sm ring-2 ring-background" />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-bold tracking-tight text-foreground flex items-center gap-1.5">
                <span>{t("site.name")}</span>
              </div>
              <div className="text-[10.5px] font-medium text-muted-foreground/90 flex items-center gap-1">
                <span>{t("site.tagline")}</span>
                <span className="hidden xl:inline text-border">•</span>
                <span className="hidden xl:inline font-semibold text-gold">{hijriText}</span>
              </div>
            </div>
          </Link>

          <HeaderNav isAuthenticated={isAuthenticated} />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPrayerModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
              aria-label={
                isAr ? "أوقات الصلاة والقبلة" : isHe ? "זמני תפילה וקיבלה" : "Prayer Times & Qibla"
              }
              title={`${isAr ? "أوقات الصلاة والقبلة" : isHe ? "זמני תפילה וקיבלה" : "Prayer Times & Qibla"} (${hijriText})`}
            >
              <Clock className="h-3.5 w-3.5 text-gold" />
              <span className="hidden md:inline font-semibold text-amber-600 dark:text-amber-400">
                {hijriText}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFeedbackModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/50 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:bg-secondary hover:text-foreground"
              aria-label={isAr ? "الدعم والملاحظات" : isHe ? "תמיכה ומשוב" : "Support & Feedback"}
              title={isAr ? "الدعم والملاحظات" : isHe ? "תמיכה ומשוב" : "Support & Feedback"}
            >
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
            </button>

            <Link
              to="/search"
              search={{ q: "", qState: "missing", src: "unknown" }}
              className="hidden items-center gap-2 rounded-full border border-border/70 bg-secondary/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-secondary hover:text-foreground md:flex"
              aria-label={t("nav.search")}
            >
              <Search className="h-3.5 w-3.5 text-primary" />
              <span>{t("nav.search")}</span>
              <kbd className="inline-flex h-4 items-center rounded border border-border bg-background px-1 text-[9.5px] font-mono text-muted-foreground">
                /
              </kbd>
            </Link>

            <Link
              to="/ask"
              search={{ q: "", qState: "missing", src: "unknown" }}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-soft to-accent px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:scale-105 hover:shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="hidden sm:inline">{t("nav.ask") ?? "Ask AI"}</span>
            </Link>

            <LocaleSwitcher />
            <ThemeToggle />
            <HeaderUser isAuthenticated={isAuthenticated} user={user} onSignOut={signOut} />
          </div>
        </div>
      </header>

      <PrayerTimesModal open={prayerModalOpen} onOpenChange={setPrayerModalOpen} />
      <FeedbackModal open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen} />
    </>
  );
}
