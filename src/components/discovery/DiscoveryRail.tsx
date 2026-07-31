import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { EntityKind } from "@/lib/knowledge";
import type { RecentView } from "@/lib/recently-viewed";

type EntityLink = { kind: EntityKind; slug: string; label: string; subtitle?: string };
type VerseLink = { surah: number; ayah: number; label: string; subtitle?: string };
type HadithLink = { collection: string; num: number; label: string; subtitle?: string };
type JourneyLink = { slug: string; label: string; subtitle?: string };

type Props = {
  locale: "he" | "ar" | "en";
  relatedEntities?: EntityLink[];
  relatedVerses?: VerseLink[];
  relatedHadith?: HadithLink[];
  recentViews?: RecentView[];
  journeys?: JourneyLink[];
  suggestedQuestions?: string[];
  onSuggestedQuestion?: (q: string) => void;
};

const COPY = {
  en: {
    continueExploring: "Continue exploring",
    peopleAlso: "People also explored",
    relatedConcepts: "Related concepts",
    journeys: "Recommended journeys",
    suggestedAI: "Suggested AI questions",
    random: "Random discovery",
    recentlyViewed: "Recently viewed",
  },
  he: {
    continueExploring: "המשך לחקור",
    peopleAlso: "אנשים גם חקרו",
    relatedConcepts: "מושגים קשורים",
    journeys: "מסלולים מומלצים",
    suggestedAI: "שאלות AI מוצעות",
    random: "גילוי אקראי",
    recentlyViewed: "נצפה לאחרונה",
  },
  ar: {
    continueExploring: "تابع الاستكشاف",
    peopleAlso: "استكشف الآخرون أيضًا",
    relatedConcepts: "مفاهيم مرتبطة",
    journeys: "رحلات موصى بها",
    suggestedAI: "أسئلة ذكاء اصطناعي مقترحة",
    random: "اكتشاف عشوائي",
    recentlyViewed: "شوهد مؤخرًا",
  },
} as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">{title}</h3>
      {children}
    </section>
  );
}

export function DiscoveryRail({
  locale,
  relatedEntities = [],
  relatedVerses = [],
  relatedHadith = [],
  recentViews = [],
  journeys = [],
  suggestedQuestions = [],
  onSuggestedQuestion,
}: Props) {
  const copy = COPY[locale];

  return (
    <div className="mt-10 space-y-4">
      <Section title={copy.continueExploring}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {relatedEntities.slice(0, 6).map((entity) => (
            <Link
              key={`${entity.kind}-${entity.slug}`}
              to="/learn/$kind/$slug"
              params={{ kind: entity.kind, slug: entity.slug }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary/40"
            >
              <div className="font-medium text-foreground">{entity.label}</div>
              {entity.subtitle && (
                <div className="text-xs text-muted-foreground">{entity.subtitle}</div>
              )}
            </Link>
          ))}
          {relatedVerses.slice(0, 4).map((verse) => (
            <Link
              key={`${verse.surah}:${verse.ayah}`}
              to="/surah/$id"
              params={{ id: String(verse.surah) }}
              hash={`v-${verse.ayah}`}
              search={{ q: undefined }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary/40"
            >
              <div className="font-medium text-foreground">{verse.label}</div>
              {verse.subtitle && (
                <div className="text-xs text-muted-foreground">{verse.subtitle}</div>
              )}
            </Link>
          ))}
        </div>
      </Section>

      {(relatedHadith.length > 0 || journeys.length > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {relatedHadith.length > 0 && (
            <Section title={copy.peopleAlso}>
              <div className="space-y-2">
                {relatedHadith.slice(0, 4).map((hadith) => (
                  <Link
                    key={`${hadith.collection}-${hadith.num}`}
                    to="/hadith/$collection/entry/$num"
                    params={{ collection: hadith.collection, num: String(hadith.num) }}
                    className="block rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary/40"
                  >
                    <div className="font-medium text-foreground">{hadith.label}</div>
                    {hadith.subtitle && (
                      <div className="text-xs text-muted-foreground">{hadith.subtitle}</div>
                    )}
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {journeys.length > 0 && (
            <Section title={copy.journeys}>
              <div className="space-y-2">
                {journeys.slice(0, 4).map((journey) => (
                  <Link
                    key={journey.slug}
                    to="/learn/journeys/$slug"
                    params={{ slug: journey.slug }}
                    className="block rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary/40"
                  >
                    <div className="font-medium text-foreground">{journey.label}</div>
                    {journey.subtitle && (
                      <div className="text-xs text-muted-foreground">{journey.subtitle}</div>
                    )}
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {recentViews.length > 0 && (
        <Section title={copy.recentlyViewed}>
          <div className="flex flex-wrap gap-2">
            {recentViews.slice(0, 8).map((view, index) => {
              const key = `${view.kind}-${index}-${view.at}`;
              if (view.kind === "surah") {
                return (
                  <Link
                    key={key}
                    to="/surah/$id"
                    params={{ id: String(view.surah) }}
                    hash={view.ayah ? `v-${view.ayah}` : undefined}
                    search={{ q: undefined }}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:border-primary/40"
                  >
                    {view.label}
                  </Link>
                );
              }
              if (view.kind === "entity") {
                return (
                  <Link
                    key={key}
                    to="/learn/$kind/$slug"
                    params={{ kind: view.entityKind, slug: view.slug }}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:border-primary/40"
                  >
                    {view.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={key}
                  to="/hadith/$collection/entry/$num"
                  params={{ collection: view.collection, num: String(view.num) }}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:border-primary/40"
                >
                  {view.label}
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {suggestedQuestions.length > 0 && onSuggestedQuestion && (
        <Section title={copy.suggestedAI}>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 6).map((question) => (
              <Button
                key={question}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto whitespace-normal text-start"
                onClick={() => onSuggestedQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </Section>
      )}

      {relatedEntities.length > 0 && (
        <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{copy.random}:</span>{" "}
          {relatedEntities[Math.floor(Math.random() * relatedEntities.length)]?.label}
        </div>
      )}
    </div>
  );
}
