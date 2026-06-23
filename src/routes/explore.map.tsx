import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ChevronLeft, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { listEntitiesByKind, pickLocale } from "@/lib/knowledge";
import { normalizeLocale, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/explore/map")({
  head: () => ({
    meta: [
      { title: "Quran World Map — Discover Quran" },
      {
        name: "description",
        content:
          "Explore the places mentioned in the Quran on an interactive world map: Mecca, Medina, Jerusalem, Mount Sinai, and more.",
      },
      { property: "og:title", content: "Quran World Map" },
      {
        property: "og:description",
        content: "Geographic places mentioned in the Quran, mapped.",
      },
    ],
  }),
  component: MapPage,
});

type Place = {
  id: string;
  slug: string;
  title_i18n: Record<string, string>;
  summary_i18n: Record<string, string>;
  latitude: number;
  longitude: number;
  country_code: string | null;
};

type PlaceEntityRow = {
  id: string;
  slug: string;
  title_i18n: Record<string, string>;
  summary_i18n: Record<string, string>;
  latitude?: number | null;
  longitude?: number | null;
  country_code?: string | null;
};

const PLACE_COORDS: Record<string, { latitude: number; longitude: number; country_code?: string }> = {
  mecca: { latitude: 21.4225, longitude: 39.8262, country_code: "SA" },
  medina: { latitude: 24.4672, longitude: 39.6111, country_code: "SA" },
  jerusalem: { latitude: 31.7683, longitude: 35.2137, country_code: "PS" },
  sinai: { latitude: 28.5394, longitude: 33.975, country_code: "EG" },
  kaaba: { latitude: 21.4225, longitude: 39.8262, country_code: "SA" },
  "cave-of-thawr": { latitude: 21.39, longitude: 39.857, country_code: "SA" },
  egypt: { latitude: 26.8206, longitude: 30.8025, country_code: "EG" },
  madyan: { latitude: 28.0, longitude: 35.0, country_code: "SA" },
};

function MapPage() {
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const isRtl = i18n.dir() === "rtl";

  const { data, isLoading } = useQuery({
    queryKey: ["map-places"],
    queryFn: async (): Promise<Place[]> => {
      const rows = (await listEntitiesByKind("place")) as unknown as PlaceEntityRow[];
      return rows
        .map((r) => {
          const fallback = PLACE_COORDS[r.slug];
          const latitude = r.latitude ?? fallback?.latitude ?? null;
          const longitude = r.longitude ?? fallback?.longitude ?? null;
          if (latitude == null || longitude == null) return null;
          return {
            id: r.id,
            slug: r.slug,
            title_i18n: r.title_i18n as Record<string, string>,
            summary_i18n: r.summary_i18n as Record<string, string>,
            latitude,
            longitude,
            country_code: r.country_code ?? fallback?.country_code ?? null,
          } satisfies Place;
        })
        .filter((p): p is Place => !!p);
    },
  });

  // Simple equirectangular projection on an SVG viewBox.
  const project = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Link
          to="/learn"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 ltr:rotate-180" /> {t("research.back")}
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("learn.openMap")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("learn.openMapHint")}
            </p>
          </div>
        </div>

        <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
          <svg viewBox="0 0 1000 500" className="w-full h-auto bg-muted/30">
            <rect width="1000" height="500" fill="hsl(var(--muted))" opacity="0.3" />
            {(data ?? []).map((p) => {
              const { x, y } = project(p.latitude, p.longitude);
              const title = pickLocale(p.title_i18n, locale as "he" | "ar" | "en") || p.slug;
              return (
                <g key={p.id} className="cursor-pointer">
                  <circle cx={x} cy={y} r="8" fill="hsl(var(--primary))" opacity="0.85" />
                  <circle cx={x} cy={y} r="14" fill="hsl(var(--primary))" opacity="0.25" />
                  <text
                    x={x + (isRtl ? -12 : 12)}
                    y={y + 4}
                    fontSize="11"
                    fill="hsl(var(--foreground))"
                    className="pointer-events-none"
                    textAnchor={isRtl ? "end" : "start"}
                    direction={isRtl ? "rtl" : "ltr"}
                  >
                    {title}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {isLoading && (
          <div className="mt-4 text-sm text-muted-foreground">{t("dailyVerse.loading")}</div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((p) => {
            const title = pickLocale(p.title_i18n, locale as "he" | "ar" | "en") || p.slug;
            const summary = pickLocale(p.summary_i18n, locale as "he" | "ar" | "en");
            return (
              <Link
                key={p.id}
                to="/learn/$kind/$slug"
                params={{ kind: "place", slug: p.slug }}
                className="block rounded-xl border border-border bg-card p-4 hover:border-primary transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{title}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.latitude.toFixed(2)}°, {p.longitude.toFixed(2)}°
                  {p.country_code ? ` · ${p.country_code}` : ""}
                </p>
                {summary && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{summary}</p>
                )}
              </Link>
            );
          })}
          {!isLoading && (data ?? []).length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {t("learn.noAuthSource")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
