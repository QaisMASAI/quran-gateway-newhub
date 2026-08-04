import React from "react";
import {
  Tag,
  Sparkles,
  FolderTree,
  BookOpen,
  Layers,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { EntityRichMetadata } from "@/types/entity-metadata";

interface EntityMetadataBadgesProps {
  metadata?: EntityRichMetadata | Record<string, unknown>;
  compact?: boolean;
}

export const EntityMetadataBadges: React.FC<EntityMetadataBadgesProps> = ({
  metadata,
  compact = false,
}) => {
  if (!metadata) return null;

  const meta = metadata as Partial<EntityRichMetadata>;

  const primary = meta.primaryKeywords ?? [];
  const roots = meta.rootWords ?? [];
  const parentTopics = meta.topicHierarchies?.parentTopics ?? [];
  const virtues = meta.virtues ?? [];
  const sins = meta.sins ?? [];
  const theological = meta.theologicalCategories ?? [];
  const ethics = meta.ethicsCategories ?? [];
  const places = meta.places ?? [];
  const people = meta.people ?? [];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5 mt-2 text-xs">
        {roots.slice(0, 2).map((r, i) => (
          <span
            key={`root-${i}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-mono border border-emerald-200/50 dark:border-emerald-800/50"
          >
            <Tag className="w-3 h-3" />
            Root: {r}
          </span>
        ))}
        {parentTopics.slice(0, 1).map((pt, i) => (
          <span
            key={`pt-${i}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50"
          >
            <FolderTree className="w-3 h-3" />
            {pt}
          </span>
        ))}
        {virtues.slice(0, 1).map((v, i) => (
          <span
            key={`v-${i}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50"
          >
            <ShieldCheck className="w-3 h-3" />
            {v}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/40 text-xs">
      {/* Root words & Keywords */}
      {(roots.length > 0 || primary.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground font-medium flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3" /> Keywords & Roots:
          </span>
          {roots.map((r, i) => (
            <span
              key={`r-${i}`}
              className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 font-mono font-bold"
            >
              {r}
            </span>
          ))}
          {primary.slice(0, 4).map((pk, i) => (
            <span
              key={`pk-${i}`}
              className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {pk}
            </span>
          ))}
        </div>
      )}

      {/* Topic Hierarchies */}
      {parentTopics.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground font-medium flex items-center gap-1 mr-1">
            <FolderTree className="w-3 h-3" /> Hierarchy:
          </span>
          {parentTopics.map((pt, i) => (
            <span
              key={`pt-full-${i}`}
              className="px-2 py-0.5 rounded bg-amber-100/80 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
            >
              {pt}
            </span>
          ))}
        </div>
      )}

      {/* Theological & Ethics Categories */}
      {(theological.length > 0 || ethics.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground font-medium flex items-center gap-1 mr-1">
            <BookOpen className="w-3 h-3" /> Category:
          </span>
          {theological.map((t, i) => (
            <span
              key={`th-${i}`}
              className="px-2 py-0.5 rounded bg-purple-100/80 text-purple-900 dark:bg-purple-900/40 dark:text-purple-200"
            >
              {t}
            </span>
          ))}
          {ethics.map((e, i) => (
            <span
              key={`eth-${i}`}
              className="px-2 py-0.5 rounded bg-indigo-100/80 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-200"
            >
              {e}
            </span>
          ))}
        </div>
      )}

      {/* Virtues & Warnings */}
      {(virtues.length > 0 || sins.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {virtues.map((v, i) => (
            <span
              key={`v-full-${i}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Virtue: {v}
            </span>
          ))}
          {sins.map((s, i) => (
            <span
              key={`s-full-${i}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60"
            >
              <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              Warns Against: {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
