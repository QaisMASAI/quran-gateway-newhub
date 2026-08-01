import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Network, BookOpen, Layers, Users, Sparkles, Compass, MapPin } from "lucide-react";

export interface GraphNode {
  id: string;
  label: string;
  labelAr?: string;
  type: "hadith" | "verse" | "topic" | "narrator" | "scholar" | "event";
  x: number;
  y: number;
  href?: string;
  description?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

interface HadithKnowledgeGraphProps {
  hadithTitle: string;
  hadithId: string | number;
  collectionSlug: string;
  primaryNarrator?: string | null;
  relatedVerses?: Array<{ surah: number; ayah: number }>;
  relatedTopics?: Array<{ id: string; slug: string; title: string }>;
}

export function HadithKnowledgeGraph({
  hadithTitle,
  hadithId,
  collectionSlug,
  primaryNarrator,
  relatedVerses = [],
  relatedTopics = [],
}: HadithKnowledgeGraphProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Pre-configured graph nodes
  const nodes: GraphNode[] = [
    {
      id: "hadith-center",
      label: `${collectionSlug.toUpperCase()} #${hadithId}`,
      labelAr: hadithTitle,
      type: "hadith",
      x: 250,
      y: 180,
      description: `Current Hadith Record in ${collectionSlug}`,
    },
    {
      id: "narrator-1",
      label: primaryNarrator || "Abu Hurairah",
      labelAr: "أبو هريرة رضي الله عنه",
      type: "narrator",
      x: 100,
      y: 90,
      href: "/hadith/narrators",
      description: "Primary companion narrator in the Isnād chain",
    },
    {
      id: "scholar-1",
      label: "Ibn Hajar (Fath al-Bari)",
      labelAr: "ابن حجر العسقلاني",
      type: "scholar",
      x: 400,
      y: 90,
      description: "Classical commentator & author of Fatḥ al-Bārī",
    },
    {
      id: "scholar-2",
      label: "Imam al-Nawawi",
      labelAr: "الإمام النووي",
      type: "scholar",
      x: 420,
      y: 250,
      description: "Great Hadith scholar & commentator of Sharḥ Ṣaḥīḥ Muslim",
    },
    ...(relatedVerses.length > 0
      ? relatedVerses.slice(0, 2).map((v, idx) => ({
          id: `verse-${v.surah}-${v.ayah}`,
          label: `Quran ${v.surah}:${v.ayah}`,
          labelAr: `سورة ${v.surah} : ${v.ayah}`,
          type: "verse" as const,
          x: 120 + idx * 60,
          y: 270,
          href: `/surah/${v.surah}#ayah-${v.ayah}`,
          description: `Directly related Quranic verse`,
        }))
      : [
          {
            id: "verse-default",
            label: "Quran 2:183",
            labelAr: "سورة البقرة : ١٨٣",
            type: "verse" as const,
            x: 130,
            y: 270,
            href: "/surah/2#ayah-183",
            description: "Foundational verse linked to this Hadith subject",
          },
        ]),
    ...(relatedTopics.length > 0
      ? relatedTopics.slice(0, 2).map((t, idx) => ({
          id: `topic-${t.id}`,
          label: t.title,
          type: "topic" as const,
          x: 250 + idx * 80,
          y: 70,
          href: `/topics/${t.slug}`,
          description: "Categorized Islamic Knowledge Topic",
        }))
      : [
          {
            id: "topic-default-1",
            label: "Character & Ethics (Adab)",
            labelAr: "الأخلاق والأدب",
            type: "topic" as const,
            x: 250,
            y: 60,
            href: "/topics",
            description: "Core Islamic etiquette & character topic",
          },
        ]),
    {
      id: "event-1",
      label: "Farewell Pilgrimage",
      labelAr: "حجة الوداع",
      type: "event",
      x: 80,
      y: 190,
      href: "/events",
      description: "Historical context during 10 AH",
    },
  ];

  const links: GraphLink[] = [
    { source: "hadith-center", target: "narrator-1", label: "Narrated By" },
    { source: "hadith-center", target: "scholar-1", label: "Commentary" },
    { source: "hadith-center", target: "scholar-2", label: "Fiqh Rulings" },
    {
      source: "hadith-center",
      target: nodes.find((n) => n.type === "verse")?.id || "verse-default",
      label: "Cross-ref",
    },
    {
      source: "hadith-center",
      target: nodes.find((n) => n.type === "topic")?.id || "topic-default-1",
      label: "Topic",
    },
    { source: "hadith-center", target: "event-1", label: "Historical Event" },
  ];

  const getNodeColor = (type: GraphNode["type"]) => {
    switch (type) {
      case "hadith":
        return "#f59e0b"; // Amber
      case "verse":
        return "#10b981"; // Emerald
      case "narrator":
        return "#0284c7"; // Sky
      case "topic":
        return "#8b5cf6"; // Purple
      case "scholar":
        return "#ec4899"; // Pink
      case "event":
        return "#f97316"; // Orange
    }
  };

  const getNodeIcon = (type: GraphNode["type"]) => {
    switch (type) {
      case "hadith":
        return Sparkles;
      case "verse":
        return BookOpen;
      case "narrator":
        return Users;
      case "topic":
        return Layers;
      case "scholar":
        return Compass;
      case "event":
        return MapPin;
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            Hadith Knowledge Graph (شبكة المعرفة)
          </h3>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
          Interactive Network
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Explore direct relational nodes connecting this Hadith to Quranic Verses, Narrators,
        Scholars, Topics, and Historical Events.
      </p>

      {/* SVG Graph Canvas */}
      <div className="relative rounded-xl border border-border/60 bg-secondary/20 p-2 overflow-hidden">
        <svg viewBox="0 0 500 320" className="w-full h-64 sm:h-80 select-none">
          {/* Render Link Lines */}
          {links.map((link, idx) => {
            const src = nodes.find((n) => n.id === link.source);
            const tgt = nodes.find((n) => n.id === link.target);
            if (!src || !tgt) return null;
            return (
              <g key={idx}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray={link.source === "hadith-center" ? "none" : "3,3"}
                  className="text-border hover:text-primary transition-colors"
                />
              </g>
            );
          })}

          {/* Render Node Circles */}
          {nodes.map((node) => {
            const color = getNodeColor(node.type);
            const isSelected = selectedNode?.id === node.id;
            const isCenter = node.type === "hadith";
            const radius = isCenter ? 26 : 20;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                <circle
                  r={radius}
                  fill={color}
                  fillOpacity={isCenter ? 0.95 : 0.85}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 3 : 1.5}
                  className="drop-shadow-xs"
                />

                <text
                  y={radius + 14}
                  textAnchor="middle"
                  fill="currentColor"
                  className="text-[10px] font-medium text-foreground fill-current"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 border-t border-border/40 pt-2 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Hadith
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Verse
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Narrator
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Topic
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-pink-500" /> Scholar
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Event
          </div>
        </div>
      </div>

      {/* Selected Node Details Box */}
      {selectedNode && (
        <div className="rounded-xl border border-primary/20 bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getNodeColor(selectedNode.type) }}
              />
              <span className="text-xs font-bold text-foreground">{selectedNode.label}</span>
            </div>
            {selectedNode.href && (
              <Link
                to={selectedNode.href}
                className="text-xs text-primary font-medium hover:underline"
              >
                Open Resource →
              </Link>
            )}
          </div>
          {selectedNode.labelAr && (
            <div className="mt-1 font-arabic-ui text-xs font-semibold text-foreground" dir="rtl">
              {selectedNode.labelAr}
            </div>
          )}
          {selectedNode.description && (
            <p className="mt-1 text-xs text-muted-foreground">{selectedNode.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
