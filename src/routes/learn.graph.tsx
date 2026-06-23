import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useMemo, useRef, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ChevronLeft, Loader2, Network } from "lucide-react";
import { listAllEntities, listRelations, pickLocale, type KnowledgeEntity, type EntityKind } from "@/lib/knowledge";
import type { Locale } from "@/lib/i18n";

export const Route = createFileRoute("/learn/graph")({
  head: () => ({
    meta: [
      { title: "Noor Al Quran| Knowledge Graph" },
      {
        name: "description",
        content:
          "Visual map of the Quran's interconnected topics, prophets and stories — explore how knowledge connects.",
      },
    ],
  }),
  component: GraphPage,
});

interface Node {
  e: KnowledgeEntity;
  x: number;
  y: number;
  r: number;
}

const KIND_COLOR: Record<EntityKind, string> = {
  prophet: "#0ea5e9",
  story: "#a855f7",
  topic: "#16a34a",
  event: "#f59e0b",
  place: "#ef4444",
  nation: "#dc2626",
  concept: "#0891b2",
  theme: "#64748b",
};

function GraphPage() {
  const { t, i18n } = useTranslation("pages");
  const locale = (i18n.language?.slice(0, 2) as Locale) || "he";
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [filter, setFilter] = useState<EntityKind | "all">("all");

  const entitiesQ = useQuery({
    queryKey: ["all-entities"],
    queryFn: listAllEntities,
    staleTime: 5 * 60_000,
  });
  const relationsQ = useQuery({
    queryKey: ["all-relations"],
    queryFn: listRelations,
    staleTime: 5 * 60_000,
  });

  const W = 900;
  const H = 700;

  const { nodes, edges, byId } = useMemo(() => {
    const ents = entitiesQ.data ?? [];
    const rels = relationsQ.data ?? [];
    const visible = filter === "all" ? ents : ents.filter((e) => e.kind === filter);
    const ids = new Set(visible.map((e) => e.id));

    // Degree count for sizing
    const degree = new Map<string, number>();
    for (const r of rels) {
      if (ids.has(r.from_id)) degree.set(r.from_id, (degree.get(r.from_id) ?? 0) + 1);
      if (ids.has(r.to_id)) degree.set(r.to_id, (degree.get(r.to_id) ?? 0) + 1);
    }

    // Layout: group by kind, circular per kind
    const byKind = new Map<EntityKind, KnowledgeEntity[]>();
    for (const e of visible) {
      const arr = byKind.get(e.kind) ?? [];
      arr.push(e);
      byKind.set(e.kind, arr);
    }
    const kinds = Array.from(byKind.keys());
    const cx = W / 2;
    const cy = H / 2;
    const ringR = Math.min(W, H) * 0.36;
    const nodes: Node[] = [];
    const byId: Record<string, Node> = {};
    kinds.forEach((k, ki) => {
      const list = byKind.get(k)!;
      const kindAngle = (ki / kinds.length) * Math.PI * 2;
      const kx = cx + Math.cos(kindAngle) * ringR;
      const ky = cy + Math.sin(kindAngle) * ringR;
      const innerR = Math.max(60, list.length * 14);
      list.forEach((e, i) => {
        const a = (i / list.length) * Math.PI * 2;
        const x = kx + Math.cos(a) * innerR;
        const y = ky + Math.sin(a) * innerR;
        const deg = degree.get(e.id) ?? 0;
        const r = 6 + Math.min(8, deg);
        const n: Node = { e, x, y, r };
        nodes.push(n);
        byId[e.id] = n;
      });
    });

    const edges = rels
      .filter((r) => byId[r.from_id] && byId[r.to_id] && r.from_id < r.to_id)
      .map((r) => ({
        from: byId[r.from_id],
        to: byId[r.to_id],
        rel: r.relation,
        w: r.weight,
      }));

    return { nodes, edges, byId };
  }, [entitiesQ.data, relationsQ.data, filter]);

  const loading = entitiesQ.isLoading || relationsQ.isLoading;

  const kindOptions: Array<EntityKind | "all"> = ["all", "prophet", "story", "topic"];

  const hoverNode = hover ? byId[hover] : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Link
          to="/learn"
          className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-3 w-3" />
          {t("learn.backToDiscovery")}
        </Link>
        <header className="mb-4">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <Network className="h-7 w-7 text-primary" />
            {t("graph.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("graph.subtitle")}</p>
        </header>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {kindOptions.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                filter === k
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              {k === "all" ? t("graph.allKinds") : t(`search.kind${k.charAt(0).toUpperCase()}${k.slice(1)}` as const)}
            </button>
          ))}
          <span className="ms-auto text-xs text-muted-foreground">
            {t("graph.nodeCount", { n: nodes.length })} · {t("graph.edgeCount", { n: edges.length })}
          </span>
        </div>

        {loading ? (
          <div className="flex h-[500px] items-center justify-center rounded-2xl border border-border bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary-soft/20 to-card">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="block h-auto w-full"
              role="img"
              aria-label={t("graph.title")}
            >
              <g opacity={0.35}>
                {edges.map((e, i) => {
                  const active = hover && (e.from.e.id === hover || e.to.e.id === hover);
                  return (
                    <line
                      key={i}
                      x1={e.from.x}
                      y1={e.from.y}
                      x2={e.to.x}
                      y2={e.to.y}
                      stroke={active ? "hsl(var(--primary))" : "hsl(var(--border))"}
                      strokeWidth={active ? 1.6 : 0.6}
                      opacity={active ? 1 : 0.6}
                    />
                  );
                })}
              </g>
              {nodes.map((n) => {
                const isHover = hover === n.e.id;
                const color = KIND_COLOR[n.e.kind] ?? "#888";
                return (
                  <g
                    key={n.e.id}
                    transform={`translate(${n.x},${n.y})`}
                    onMouseEnter={() => setHover(n.e.id)}
                    onMouseLeave={() => setHover((h) => (h === n.e.id ? null : h))}
                    className="cursor-pointer"
                  >
                    <Link to="/learn/$kind/$slug" params={{ kind: n.e.kind as EntityKind, slug: n.e.slug }}>
                      <circle
                        r={isHover ? n.r + 3 : n.r}
                        fill={color}
                        fillOpacity={isHover ? 1 : 0.75}
                        stroke={isHover ? "white" : "rgba(255,255,255,0.5)"}
                        strokeWidth={1.5}
                      />
                    </Link>
                  </g>
                );
              })}
              {hoverNode && (
                <g
                  transform={`translate(${Math.min(hoverNode.x + 12, W - 200)},${Math.max(hoverNode.y - 28, 10)})`}
                  pointerEvents="none"
                >
                  <rect
                    x={0}
                    y={0}
                    width={200}
                    height={42}
                    rx={6}
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--border))"
                  />
                  <text x={10} y={16} fontSize={11} fill="hsl(var(--primary))" fontWeight={600}>
                    {t(`search.kind${hoverNode.e.kind.charAt(0).toUpperCase()}${hoverNode.e.kind.slice(1)}` as const)}
                  </text>
                  <text x={10} y={32} fontSize={13} fill="hsl(var(--foreground))" fontWeight={700}>
                    {pickLocale(hoverNode.e.title_i18n, locale).slice(0, 28)}
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {(Object.keys(KIND_COLOR) as EntityKind[]).map((k) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: KIND_COLOR[k] }} aria-hidden />
              <span className="text-muted-foreground">
                {t(`search.kind${k.charAt(0).toUpperCase()}${k.slice(1)}` as const)}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
