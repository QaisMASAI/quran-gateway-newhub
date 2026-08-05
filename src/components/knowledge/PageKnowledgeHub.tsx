import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Layers,
  BookOpen,
  ScrollText,
  Search,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  Brain,
  Bookmark,
} from "lucide-react";
import {
  buildDynamicKnowledgeGraph,
  DIMENSION_CONFIG,
  type Entity10DHubData,
  type GraphDimension,
  type GraphNode,
} from "@/lib/knowledge-graph-engine";
import { KnowledgeGraphVisualizer } from "./KnowledgeGraphVisualizer";
import { pickLocale } from "@/lib/knowledge";
import { Button } from "@/components/ui/button";

interface PageKnowledgeHubProps {
  slug?: string;
  locale?: "en" | "ar" | "he";
  title?: string;
  subtitle?: string;
  className?: string;
}

export const PageKnowledgeHub: React.FC<PageKnowledgeHubProps> = ({
  slug,
  locale = "en",
  title,
  subtitle,
  className = "",
}) => {
  const [hubData, setHubData] = useState<Entity10DHubData | null>(null);
  const [activeTab, setActiveTab] = useState<GraphDimension | "graph">("graph");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const data = await buildDynamicKnowledgeGraph(slug);
      if (isMounted) {
        setHubData(data);
        setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading || !hubData) {
    return (
      <div className="w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
        <Sparkles className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-bold dir-auto">
          {locale === "ar"
            ? "جاري بناء شبكة المعرفة المتقاطعة ذات 10 أبعاد..."
            : locale === "he"
              ? "בונה את רשת הידע ה-10 ממדית..."
              : "Generating 10-Dimensional Dynamic Knowledge Graph..."}
        </p>
      </div>
    );
  }

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

  const currentTabNodes: GraphNode[] = activeTab === "graph" ? hubData.graph.nodes : hubData[activeTab] || [];

  return (
    <div
      className={`w-full max-w-6xl mx-auto space-y-6 my-8 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white ${className}`}
    >
      {/* Knowledge Hub Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Layers className="w-5 h-5" />
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-wider">
              {locale === "ar"
                ? "مركز المعرفة المتقاطعة (10 أبعاد)"
                : locale === "he"
                  ? "מרכז ידע מולטי-ממדי"
                  : "Dynamic 10-Dimensional Knowledge Hub"}
            </span>
          </div>
          <h2 className="text-xl font-extrabold dir-auto">
            {title ||
              (locale === "ar"
                ? "الربط التلقائي بالمصادر والأبعاد الإيمانية"
                : locale === "he"
                  ? "חיבור אוטומטי לכל מקורות הידע"
                  : "Automatic Multi-Source Knowledge Integration")}
          </h2>
          <p className="text-xs text-zinc-400 dir-auto">
            {subtitle ||
              (locale === "ar"
                ? "يربط هذا العنصر تلقائياً بالقرآن، التفسير، الأنبياء، العلماء، الموضوعات، القصص، الأماكن، الأحداث والمفردات."
                : locale === "he"
                  ? "חיבור אוטומטי לקוראן, תפסיר, נביאים, חכמים, נושאים, סיפורים, מקומות, אירועים ואוצר מילים."
                  : "Automatically interconnected across Quran, Tafsir, Prophets, Scholars, Topics, Stories, Places, Events & Vocabulary.")}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-800/80 px-4 py-2 rounded-2xl border border-zinc-700/80 shrink-0">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <div className="text-left">
            <span className="text-sm font-black text-amber-300 block">
              {hubData.totalConnections}{" "}
              {locale === "ar" ? "ارتباط معتمد" : locale === "he" ? "קישורים מוסמכים" : "Verified Links"}
            </span>
            <span className="text-[10px] text-zinc-400 block dir-auto">
              {locale === "ar"
                ? "محدث تلقائياً من قواعد البيانات"
                : locale === "he"
                  ? "מתעדכן אוטומטית"
                  : "Auto-Generated Graph"}
            </span>
          </div>
        </div>
      </div>

      {/* 10-Dimension Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-800/80">
        <button
          onClick={() => setActiveTab("graph")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === "graph"
              ? "bg-emerald-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/20"
              : "bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>
            {locale === "ar"
              ? "الرسم البياني التفاعلي"
              : locale === "he"
                ? "תרשים אינטראקטיבי"
                : "Interactive Graph Map"}
          </span>
        </button>

        {dimensions.map((dim) => {
          const cfg = DIMENSION_CONFIG[dim];
          const count = hubData.graph.dimensionCounts[dim] || 0;
          const isActive = activeTab === dim;
          const label = locale === "ar" ? cfg.labelAr : locale === "he" ? cfg.labelHe : cfg.labelEn;

          return (
            <button
              key={dim}
              onClick={() => setActiveTab(dim)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-zinc-800 border-emerald-500 text-white shadow-md"
                  : "bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
              }`}
            >
              <span>{cfg.icon}</span>
              <span>{label}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-300">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Display */}
      {activeTab === "graph" ? (
        <KnowledgeGraphVisualizer graphData={hubData.graph} locale={locale} focusNodeId={slug} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2 dir-auto">
              <span>{DIMENSION_CONFIG[activeTab].icon}</span>
              <span>
                {DIMENSION_CONFIG[activeTab][locale === "ar" ? "labelAr" : locale === "he" ? "labelHe" : "labelEn"]}
              </span>
            </h3>
            <span className="text-xs text-zinc-400 font-medium dir-auto">
              {currentTabNodes.length} {locale === "ar" ? "ارتباطات متصلة" : locale === "he" ? "פריטים" : "Nodes"}
            </span>
          </div>

          {currentTabNodes.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500 dir-auto">
              {locale === "ar"
                ? "لا توجد عناصر متصلة في هذا البعد حالياً."
                : locale === "he"
                  ? "אין רכיבים מקושרים בממד זה כעת."
                  : "No linked items in this dimension for the current entity."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTabNodes.map((node) => {
                const titleText = pickLocale(node.title, locale);
                const summaryText = pickLocale(node.summary, locale);

                return (
                  <div
                    key={node.id}
                    className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 hover:border-emerald-500/60 shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <span>{DIMENSION_CONFIG[node.dimension].icon}</span>
                          <span className="uppercase">{node.dimension}</span>
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                      </div>
                      <h4 className="font-extrabold text-sm text-white dir-auto">{titleText}</h4>
                      <p className="text-xs text-zinc-400 dir-auto line-clamp-3 leading-relaxed">{summaryText}</p>
                    </div>

                    <Link
                      to={`/learn/$kind/$slug`}
                      params={{ kind: node.dimension, slug: node.slug }}
                      className="w-full"
                    >
                      <Button
                        size="sm"
                        className="w-full bg-zinc-700/80 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs py-1.5"
                      >
                        {locale === "ar" ? "استكشف العقدة" : locale === "he" ? "חקור רכיב" : "Explore Node"}
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
