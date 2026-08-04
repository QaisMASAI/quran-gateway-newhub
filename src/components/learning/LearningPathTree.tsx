import React from "react";
import { Star, Lock, Check, Sparkles, Trophy, BookOpen, Flame } from "lucide-react";

export interface PathNode {
  id: string;
  stageId: number;
  titleAr: string;
  titleEn: string;
  titleHe: string;
  category: string;
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0..3
  icon: string;
}

export const PATH_STAGES = [
  {
    stageId: 1,
    nameAr: "المرحلة الأولى: أصول العقيدة وفاتحة الكتاب",
    nameEn: "Stage 1: Foundations of Belief & Al-Fatihah",
    nameHe: "שלב 1: יסודות האמונה וסורת אל-פאתיחה",
    descriptionAr: "أساسيات معرفة الله عز وجل وفهم سور القرآن الكريم الأساسية",
    descriptionEn: "Essential understanding of Allah, the Quran, and basic worship",
    descriptionHe: "הבנת אללה, הקוראן והפולחן היסודי",
  },
  {
    stageId: 2,
    nameAr: "المرحلة الثانية: قصص الأنبياء والمرسلين",
    nameEn: "Stage 2: Lives & Miracles of the Prophets",
    nameHe: "שלב 2: חיי הנביאים ומופתיהם",
    descriptionAr: "التعرف على سيرة آدم، نوح، إبراهيم، وموسى عليهم السلام",
    descriptionEn: "Stories of Prophet Adam, Noah, Abraham, Moses, and Jesus (pbut)",
    descriptionHe: "סיפורי הנביאים אדם, נח, אברהם, משה וישוע",
  },
  {
    stageId: 3,
    nameAr: "المرحلة الثالثة: رياض الصالحين وأحكام الحديث",
    nameEn: "Stage 3: Gardens of Hadith & Prophetic Sunnah",
    nameHe: "שלב 3: חדית'ים מאומתים וסונה",
    descriptionAr: "دراسة جوامع الأحاديث الصحيحة والأخلاق النبوية الشريفة",
    descriptionEn: "Exploring authentic Hadith collections and noble character",
    descriptionHe: "חקר חדית'ים מאומתים ומידות מוסריות",
  },
];

interface LearningPathTreeProps {
  nodes: PathNode[];
  locale: "en" | "ar" | "he";
  onSelectNode: (node: PathNode) => void;
}

export const LearningPathTree: React.FC<LearningPathTreeProps> = ({
  nodes,
  locale,
  onSelectNode,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 py-6">
      {PATH_STAGES.map((stage) => {
        const stageNodes = nodes.filter((n) => n.stageId === stage.stageId);
        const stageName =
          locale === "ar" ? stage.nameAr : locale === "he" ? stage.nameHe : stage.nameEn;
        const stageDesc =
          locale === "ar"
            ? stage.descriptionAr
            : locale === "he"
              ? stage.descriptionHe
              : stage.descriptionEn;

        return (
          <div key={stage.stageId} className="space-y-6">
            {/* Stage Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12" />
              <div className="relative z-10">
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-2 inline-block">
                  {locale === "ar"
                    ? `المستوى ${stage.stageId}`
                    : locale === "he"
                      ? `שלב ${stage.stageId}`
                      : `STAGE ${stage.stageId}`}
                </span>
                <h3 className="text-xl font-extrabold dir-auto">{stageName}</h3>
                <p className="text-xs text-emerald-100 dir-auto mt-1 opacity-90">{stageDesc}</p>
              </div>
            </div>

            {/* Path Nodes in S-Curve Layout */}
            <div className="flex flex-col items-center gap-8 relative py-4">
              {/* Connecting Line */}
              <div className="absolute top-4 bottom-4 w-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full z-0" />

              {stageNodes.map((node, index) => {
                const nodeTitle =
                  locale === "ar" ? node.titleAr : locale === "he" ? node.titleHe : node.titleEn;

                // Alternate horizontal offset for Duolingo curve feel
                const offsetClass =
                  index % 3 === 0
                    ? "translate-x-0"
                    : index % 3 === 1
                      ? "-translate-x-12"
                      : "translate-x-12";

                return (
                  <div
                    key={node.id}
                    className={`relative z-10 flex flex-col items-center group transition-transform ${offsetClass}`}
                  >
                    {/* Node Button */}
                    <button
                      onClick={() => node.unlocked && onSelectNode(node)}
                      disabled={!node.unlocked}
                      className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-xl transition-all duration-300 relative border-4 ${
                        node.completed
                          ? "bg-gradient-to-b from-amber-400 to-amber-500 border-amber-300 text-white scale-105 hover:scale-110 ring-4 ring-amber-400/30"
                          : node.unlocked
                            ? "bg-gradient-to-b from-emerald-500 to-teal-600 border-emerald-300 text-white hover:scale-110 ring-4 ring-emerald-500/30 animate-pulse"
                            : "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-400 cursor-not-allowed"
                      }`}
                    >
                      {node.completed ? (
                        <Check className="w-10 h-10 stroke-[3]" />
                      ) : node.unlocked ? (
                        <span>{node.icon || "📖"}</span>
                      ) : (
                        <Lock className="w-8 h-8 opacity-70" />
                      )}

                      {/* Floating Stars */}
                      {node.completed && (
                        <div className="absolute -top-3 flex items-center justify-center gap-0.5 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-amber-400 shadow-md">
                          {[1, 2, 3].map((starIdx) => (
                            <Star
                              key={starIdx}
                              className={`w-3.5 h-3.5 ${
                                starIdx <= node.stars
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-zinc-300 dark:text-zinc-700"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>

                    {/* Title Banner Below */}
                    <div className="mt-2.5 px-3 py-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center max-w-[160px]">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 dir-auto block truncate">
                        {nodeTitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
