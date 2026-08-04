import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Search,
  Filter,
  Layers,
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
  Compass,
  Share2,
} from "lucide-react";
import {
  DIMENSION_CONFIG,
  type GraphDimension,
  type GraphNode,
  type GraphEdge,
  type DynamicGraphData,
} from "@/lib/knowledge-graph-engine";
import { pickLocale } from "@/lib/knowledge";
import { Button } from "@/components/ui/button";

interface KnowledgeGraphVisualizerProps {
  graphData: DynamicGraphData;
  locale: "en" | "ar" | "he";
  focusNodeId?: string;
  onNodeClick?: (node: GraphNode) => void;
  height?: number | string;
}

export const KnowledgeGraphVisualizer: React.FC<KnowledgeGraphVisualizerProps> = ({
  graphData,
  locale,
  focusNodeId,
  onNodeClick,
  height = 650,
}) => {
  const [selectedDimension, setSelectedDimension] = useState<GraphDimension | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Canvas Viewport Transformation
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);

  const W = 1000;
  const H = 700;

  // Filter nodes based on selected dimension and search
  const filteredNodes = useMemo(() => {
    return graphData.nodes.filter((n) => {
      const matchDim = selectedDimension === "all" || n.dimension === selectedDimension;
      const title = pickLocale(n.title, locale).toLowerCase();
      const summary = pickLocale(n.summary, locale).toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        title.includes(searchQuery.toLowerCase()) ||
        summary.includes(searchQuery.toLowerCase()) ||
        n.slug.includes(searchQuery.toLowerCase());

      return matchDim && matchQuery;
    });
  }, [graphData.nodes, selectedDimension, searchQuery, locale]);

  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  // Filter edges to only include visible nodes
  const visibleEdges = useMemo(() => {
    return graphData.edges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );
  }, [graphData.edges, visibleNodeIds]);

  // Layout Node Positions in a multi-dimensional orbit ring layout
  const layoutNodes = useMemo(() => {
    const dimensions: GraphDimension[] = [
      "quran",
      "hadith",
      "tafsir",
      "prophet",
      "scholar",
      "topic",
      "story",
      "place",
      "event",
      "vocabulary",
    ];

    const cx = W / 2;
    const cy = H / 2;
    const ringRadius = Math.min(W, H) * 0.35;

    const byDimension = new Map<GraphDimension, GraphNode[]>();
    filteredNodes.forEach((n) => {
      const arr = byDimension.get(n.dimension) || [];
      arr.push(n);
      byDimension.set(n.dimension, arr);
    });

    const nodePositions: Array<{ node: GraphNode; x: number; y: number; r: number }> = [];

    dimensions.forEach((dim, dimIdx) => {
      const list = byDimension.get(dim) || [];
      if (list.length === 0) return;

      const dimAngle = (dimIdx / dimensions.length) * Math.PI * 2 - Math.PI / 2;
      const dimX = cx + Math.cos(dimAngle) * ringRadius;
      const dimY = cy + Math.sin(dimAngle) * ringRadius;

      const clusterRadius = Math.max(50, list.length * 12);

      list.forEach((node, nodeIdx) => {
        const itemAngle = (nodeIdx / list.length) * Math.PI * 2;
        const x = dimX + Math.cos(itemAngle) * clusterRadius;
        const y = dimY + Math.sin(itemAngle) * clusterRadius;
        const r = 12 + Math.min(10, node.weight);

        nodePositions.push({ node, x, y, r });
      });
    });

    return nodePositions;
  }, [filteredNodes]);

  const nodePosMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number; r: number }>();
    layoutNodes.forEach((item) => map.set(item.node.id, { x: item.x, y: item.y, r: item.r }));
    return map;
  }, [layoutNodes]);

  // Auto select default or focus node
  useEffect(() => {
    if (focusNodeId) {
      const found = graphData.nodes.find((n) => n.id === focusNodeId || n.slug === focusNodeId);
      if (found) setSelectedNode(found);
    } else if (graphData.nodes.length > 0 && !selectedNode) {
      setSelectedNode(graphData.nodes[0]);
    }
  }, [focusNodeId, graphData.nodes]);

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="w-full rounded-3xl bg-zinc-950 border border-zinc-800 text-white shadow-2xl overflow-hidden flex flex-col relative select-none">
      {/* Top Controls & Dimension Filters */}
      <div className="p-4 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 z-20">
        {/* Title & Stats */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-zinc-100 dir-auto">
              {locale === "ar"
                ? "مكشاف شبكة المعرفة الإسلامية"
                : locale === "he"
                ? "מפה אינטראקטיבית של רשת הידע"
                : "Interactive Knowledge Graph Map"}
            </h3>
            <p className="text-xs text-zinc-400 dir-auto">
              {filteredNodes.length} {locale === "ar" ? "عنصر متصل" : locale === "he" ? "רכיבים מקושרים" : "Connected Nodes"} • 10 Dimensions
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px] flex-1 max-w-xs">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              locale === "ar"
                ? "ابحث عن آية، حديث، نبي، عالم..."
                : locale === "he"
                ? "חפש פסוק, חדית', נביא, חכם..."
                : "Search verse, Hadith, prophet, scholar..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Zoom & Viewport Controls */}
        <div className="flex items-center gap-1.5 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/80">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
            className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
            className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 10-Dimension Filter Chips */}
      <div className="px-4 py-2.5 bg-zinc-900/50 border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none z-20">
        <button
          onClick={() => setSelectedDimension("all")}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedDimension === "all"
              ? "bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/20"
              : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          {locale === "ar" ? "جميع الأبعاد (10)" : locale === "he" ? "כל 10 הממדים" : "All Dimensions"}
        </button>

        {(
          [
            "quran",
            "hadith",
            "tafsir",
            "prophet",
            "scholar",
            "topic",
            "story",
            "place",
            "event",
            "vocabulary",
          ] as GraphDimension[]
        ).map((dim) => {
          const cfg = DIMENSION_CONFIG[dim];
          const isActive = selectedDimension === dim;
          const label =
            locale === "ar"
              ? cfg.labelAr
              : locale === "he"
              ? cfg.labelHe
              : cfg.labelEn;

          return (
            <button
              key={dim}
              onClick={() => setSelectedDimension(dim)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? "bg-zinc-800 border-emerald-500 text-white shadow-sm"
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
              }`}
            >
              <span>{cfg.icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Graph SVG Stage */}
      <div
        className="w-full flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden min-h-[500px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ height }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full"
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Background Radial Glow */}
            <circle cx={W / 2} cy={H / 2} r={320} fill="#022c22" opacity={0.15} />

            {/* Render Edges */}
            {visibleEdges.map((edge) => {
              const srcPos = nodePosMap.get(edge.source);
              const tgtPos = nodePosMap.get(edge.target);
              if (!srcPos || !tgtPos) return null;

              const isHighlighted =
                hoveredNodeId === edge.source ||
                hoveredNodeId === edge.target ||
                selectedNode?.id === edge.source ||
                selectedNode?.id === edge.target;

              const relText = pickLocale(edge.relation, locale);

              return (
                <g key={edge.id}>
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke={isHighlighted ? "#10b981" : "#27272a"}
                    strokeWidth={isHighlighted ? 2.5 : 1}
                    strokeDasharray={isHighlighted ? "none" : "3 3"}
                    opacity={isHighlighted ? 0.9 : 0.4}
                  />
                  {isHighlighted && relText && (
                    <text
                      x={(srcPos.x + tgtPos.x) / 2}
                      y={(srcPos.y + tgtPos.y) / 2 - 4}
                      fill="#34d399"
                      fontSize={9}
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {relText}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {layoutNodes.map(({ node, x, y, r }) => {
              const cfg = DIMENSION_CONFIG[node.dimension];
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNodeId === node.id;
              const title = pickLocale(node.title, locale);

              return (
                <g
                  key={node.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => {
                    setSelectedNode(node);
                    if (onNodeClick) onNodeClick(node);
                  }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Outer Pulsing Aura on Selection */}
                  {(isSelected || isHovered) && (
                    <circle
                      r={r + 8}
                      fill={cfg.color}
                      opacity={0.25}
                      className="animate-ping"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    r={r}
                    fill={cfg.color}
                    stroke={isSelected ? "#ffffff" : "#18181b"}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="drop-shadow-lg"
                  />

                  {/* Icon or Symbol */}
                  <text
                    fontSize={r * 1.1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none select-none"
                  >
                    {cfg.icon}
                  </text>

                  {/* Label under Node */}
                  <text
                    y={r + 14}
                    fill={isSelected ? "#ffffff" : "#a1a1aa"}
                    fontSize={11}
                    fontWeight={isSelected ? "bold" : "medium"}
                    textAnchor="middle"
                    className="pointer-events-none select-none filter drop-shadow-md"
                  >
                    {title.length > 18 ? `${title.slice(0, 18)}…` : title}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected Node Details Slide-Over Drawer */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-5 rounded-2xl shadow-2xl z-30 space-y-3 animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-zinc-800 text-lg">
                  {DIMENSION_CONFIG[selectedNode.dimension].icon}
                </span>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                    {
                      DIMENSION_CONFIG[selectedNode.dimension][
                        locale === "ar"
                          ? "labelAr"
                          : locale === "he"
                          ? "labelHe"
                          : "labelEn"
                      ]
                    }
                  </span>
                  <h4 className="font-extrabold text-base text-white dir-auto">
                    {pickLocale(selectedNode.title, locale)}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="text-zinc-500 hover:text-white font-bold text-xs p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed dir-auto line-clamp-3">
              {pickLocale(selectedNode.summary, locale)}
            </p>

            {/* Quick Metadata */}
            {selectedNode.metadata && (
              <div className="flex flex-wrap gap-2 text-[10px] font-bold text-emerald-300">
                {selectedNode.metadata.surah && (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    Surah {selectedNode.metadata.surah}:
                    {selectedNode.metadata.ayahStart}
                  </span>
                )}
                {selectedNode.metadata.hadithRef && (
                  <span className="px-2 py-0.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300">
                    {selectedNode.metadata.hadithRef}
                  </span>
                )}
                {selectedNode.metadata.arabicRoot && (
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                    Root: {selectedNode.metadata.arabicRoot}
                  </span>
                )}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
              <Link
                to={`/learn/$kind/$slug`}
                params={{ kind: selectedNode.dimension, slug: selectedNode.slug }}
                className="w-full"
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl py-2 flex items-center justify-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>
                    {locale === "ar"
                      ? "افتح مركز المعرفة الكامل"
                      : locale === "he"
                      ? "פתח את מרכז הידע"
                      : "Open Knowledge Hub"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
