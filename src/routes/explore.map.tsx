import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

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

function MapPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["map-places"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_entities")
        .select("id,slug,title_i18n,summary_i18n,latitude,longitude,country_code")
        .eq("published", true)
        .eq("kind", "place")
        .not("latitude", "is", null);
      if (error) throw error;
      return (data ?? []) as Place[];
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
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quran World Map</h1>
            <p className="text-sm text-muted-foreground">
              Places mentioned in the Quran, plotted geographically.
            </p>
          </div>
        </div>

        <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
          <svg viewBox="0 0 1000 500" className="w-full h-auto bg-muted/30">
            <rect width="1000" height="500" fill="hsl(var(--muted))" opacity="0.3" />
            {(data ?? []).map((p) => {
              const { x, y } = project(p.latitude, p.longitude);
              const title = p.title_i18n?.he ?? p.title_i18n?.en ?? p.slug;
              return (
                <g key={p.id} className="cursor-pointer">
                  <circle cx={x} cy={y} r="8" fill="hsl(var(--primary))" opacity="0.85" />
                  <circle cx={x} cy={y} r="14" fill="hsl(var(--primary))" opacity="0.25" />
                  <text
                    x={x + 12}
                    y={y + 4}
                    fontSize="11"
                    fill="hsl(var(--foreground))"
                    className="pointer-events-none"
                  >
                    {title}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {isLoading && (
          <div className="text-sm text-muted-foreground mt-4">Loading places…</div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((p) => {
            const title = p.title_i18n?.he ?? p.title_i18n?.en ?? p.slug;
            const summary = p.summary_i18n?.he ?? p.summary_i18n?.en ?? "";
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
              No mapped places yet. As Places are enriched with coordinates they will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
