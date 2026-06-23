import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles, BookOpen, Compass, Heart, Users, Scale,
  HandHelping, Star, Sun, Building2, HeartHandshake, Baby,
  Check, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";
import {
  INTEREST_TAGS, type InterestTag,
  saveOnboarding, skipOnboarding, readLocal,
} from "@/lib/onboarding";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — Noor Al Quran" },
      { name: "description", content: "A short, friendly introduction to the Quran for first-time visitors." },
    ],
  }),
  component: OnboardingPage,
});

const INTEREST_ICONS: Record<InterestTag, typeof Heart> = {
  prophets: Users,
  family: HeartHandshake,
  ethics: Scale,
  prayer: Sun,
  mercy: Heart,
  justice: Scale,
  women: Star,
  children: Baby,
  spirituality: Sparkles,
  history: Building2,
  interfaith: HandHelping,
  stories: BookOpen,
};

function OnboardingPage() {
  const { t, i18n } = useTranslation("pages");
  const navigate = useNavigate();
  const initial = useMemo(() => readLocal(), []);
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<InterestTag[]>(initial.interests ?? []);
  const [saving, setSaving] = useState(false);

  const dir = i18n.dir();
  const total = 4;

  const toggle = (tag: InterestTag) => {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));
  };

  const finish = async () => {
    setSaving(true);
    try {
      await saveOnboarding(interests);
    } finally {
      setSaving(false);
      navigate({ to: "/" });
    }
  };

  const skip = async () => {
    await skipOnboarding();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12 sm:px-6">
        {/* Progress dots */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-8 bg-gold" : i < step ? "w-4 bg-primary/40" : "w-4 bg-border"
              }`}
            />
          ))}
        </div>

        <article className="rounded-3xl border border-primary/10 bg-card p-6 shadow-xl sm:p-10 animate-fade-in">
          {step === 0 && <StepWelcome t={t} />}
          {step === 1 && <StepExplore t={t} />}
          {step === 2 && (
            <StepInterests
              t={t}
              interests={interests}
              toggle={toggle}
            />
          )}
          {step === 3 && <StepPath t={t} interests={interests} />}
        </article>

        {/* Nav controls */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={skip}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t("onboarding.skip")}
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1 rounded-full border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                {dir === "rtl" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                {t("onboarding.back")}
              </button>
            )}
            {step < total - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 2 && interests.length === 0}
                className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {t("onboarding.next")}
                {dir === "rtl" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <button
                onClick={finish}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-primary shadow-lg hover:opacity-90 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("onboarding.finish")}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StepWelcome({ t }: { t: (k: string) => string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
        <Logo className="h-12 w-12 text-gold" />
      </div>
      <p className="font-arabic text-2xl text-gold sm:text-3xl" dir="rtl">
        بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
      </p>
      <h1 className="mt-4 font-display text-3xl font-bold text-primary sm:text-4xl">
        {t("onboarding.welcomeTitle")}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        {t("onboarding.welcomeBody")}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 text-start sm:grid-cols-3">
        <InfoCard icon={<BookOpen className="h-5 w-5" />} title={t("onboarding.whatTitle")} body={t("onboarding.whatBody")} />
        <InfoCard icon={<Users className="h-5 w-5" />} title={t("onboarding.whoTitle")} body={t("onboarding.whoBody")} />
        <InfoCard icon={<Sparkles className="h-5 w-5" />} title={t("onboarding.whyTitle")} body={t("onboarding.whyBody")} />
      </div>
    </div>
  );
}

function StepExplore({ t }: { t: (k: string) => string }) {
  const items = [
    { icon: Compass, key: "topics" },
    { icon: Users, key: "prophets" },
    { icon: BookOpen, key: "stories" },
    { icon: Sparkles, key: "search" },
    { icon: HeartHandshake, key: "ask" },
  ] as const;
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl">
        {t("onboarding.exploreTitle")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("onboarding.exploreBody")}</p>
      <ul className="mt-6 space-y-3">
        {items.map(({ icon: Icon, key }) => (
          <li key={key} className="flex items-start gap-4 rounded-2xl border border-border bg-secondary/40 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground">{t(`onboarding.explore.${key}.title`)}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{t(`onboarding.explore.${key}.body`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepInterests({
  t, interests, toggle,
}: { t: (k: string, o?: Record<string, unknown>) => string; interests: InterestTag[]; toggle: (tag: InterestTag) => void }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl">
        {t("onboarding.interestsTitle")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("onboarding.interestsBody")}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {INTEREST_TAGS.map((tag) => {
          const Icon = INTEREST_ICONS[tag];
          const active = interests.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              aria-pressed={active}
              className={`group relative flex items-center gap-3 rounded-2xl border p-4 text-start transition-all ${
                active
                  ? "border-gold bg-gold/10 shadow-md"
                  : "border-border bg-secondary/40 hover:border-primary/30"
              }`}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-gold text-primary" : "bg-primary/10 text-primary"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {t(`onboarding.interest.${tag}`)}
              </span>
              {active && (
                <Check className="absolute end-2 top-2 h-4 w-4 text-gold" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {interests.length === 0
          ? t("onboarding.interestsHintEmpty")
          : t("onboarding.interestsHint", { count: interests.length })}
      </p>
    </div>
  );
}

function StepPath({ t, interests }: { t: (k: string, o?: Record<string, unknown>) => string; interests: InterestTag[] }) {
  // Recommended starting points keyed off chosen interests. Each item links to
  // an existing area of the app.
  const recs = useMemo(() => {
    const set = new Set(interests);
    const items: Array<{ key: string; to: string; params?: Record<string, string> }> = [];
    if (set.has("prophets")) items.push({ key: "prophets", to: "/prophets" });
    if (set.has("stories") || set.has("history")) items.push({ key: "stories", to: "/learn" });
    if (set.has("prayer") || set.has("spirituality")) items.push({ key: "prayer", to: "/topics" });
    if (set.has("family") || set.has("children") || set.has("women")) items.push({ key: "family", to: "/topics" });
    if (set.has("ethics") || set.has("justice") || set.has("mercy")) items.push({ key: "ethics", to: "/topics" });
    if (set.has("interfaith")) items.push({ key: "interfaith", to: "/ask" });
    // Always include Ask and Surahs as fallback entry points.
    items.push({ key: "ask", to: "/ask" });
    items.push({ key: "surahs", to: "/" });
    return items.slice(0, 5);
  }, [interests]);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl">
        {t("onboarding.pathTitle")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("onboarding.pathBody")}</p>

      <ul className="mt-6 space-y-3">
        {recs.map((r, idx) => (
          <li key={`${r.key}-${idx}`}>
            <Link
              to={r.to}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-primary/10 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold font-bold">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t(`onboarding.rec.${r.key}.title`)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t(`onboarding.rec.${r.key}.body`)}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-gold ltr:rotate-0 rtl:rotate-180" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold">{icon}</div>
      <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
