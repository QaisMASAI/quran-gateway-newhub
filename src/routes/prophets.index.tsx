import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { PROPHETS } from "@/lib/prophets";
import { useProphetT } from "@/lib/content-i18n";
import { Users, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/prophets/")({
  component: ProphetsIndex,
});

function ProphetCard({ slug, nameAr, refsCount }: { slug: string; nameAr: string; refsCount: number }) {
  const { t } = useTranslation("pages");
  const p = useProphetT(slug);
  return (
    <Link
      to="/prophets/$slug"
      params={{ slug }}
      className="group flex items-center gap-4 rounded-2xl border border-primary/5 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-xl"
    >
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
        <div className="absolute inset-0 rotate-45 rounded-lg bg-primary/5 transition-colors group-hover:bg-gold/20" aria-hidden="true" />
        <span className="relative font-arabic text-base text-primary transition-colors group-hover:text-gold" dir="rtl">
          {nameAr.slice(0, 2)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-bold text-primary">
          {p.name}
          {p.alt ? <span className="ms-2 text-xs font-normal text-muted-foreground">({p.alt})</span> : null}
        </h2>
        <p className="mt-0.5 font-arabic text-sm text-muted-foreground" dir="rtl">{nameAr}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{refsCount} {t("prophets.refsLabel")}</p>
      </div>
      <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-gold ltr:rotate-180" aria-hidden="true" />
    </Link>
  );
}

function ProphetsIndex() {
  const { t } = useTranslation("pages");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <header className="mb-10 space-y-3 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="font-display text-4xl font-bold text-primary sm:text-5xl">{t("prophets.title")}</h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{t("prophets.intro")}</p>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROPHETS.map((p) => (
            <ProphetCard key={p.slug} slug={p.slug} nameAr={p.nameAr} refsCount={p.refs.length} />
          ))}
        </div>
      </main>
    </div>
  );
}
