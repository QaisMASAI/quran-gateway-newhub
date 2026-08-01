import { useState } from "react";
import { X, Check, FolderPlus, Palette, FileText, Bookmark } from "lucide-react";
import { useHadithUserStore } from "@/lib/hadith-user-store";

interface HadithNotesModalProps {
  collectionSlug: string;
  hadithNum: number;
  hadithTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const HIGHLIGHT_COLORS: Array<{
  id: "amber" | "emerald" | "sky" | "purple" | "rose";
  label: string;
  bgClass: string;
  borderClass: string;
}> = [
  {
    id: "amber",
    label: "Amber (Fiqh/Rulings)",
    bgClass: "bg-amber-500/20",
    borderClass: "border-amber-500",
  },
  {
    id: "emerald",
    label: "Emerald (Duas & Adhkar)",
    bgClass: "bg-emerald-500/20",
    borderClass: "border-emerald-500",
  },
  {
    id: "sky",
    label: "Sky Blue (Narrator Notes)",
    bgClass: "bg-sky-500/20",
    borderClass: "border-sky-500",
  },
  {
    id: "purple",
    label: "Purple (Spiritual Lessons)",
    bgClass: "bg-purple-500/20",
    borderClass: "border-purple-500",
  },
  {
    id: "rose",
    label: "Rose (Historical Context)",
    bgClass: "bg-rose-500/20",
    borderClass: "border-rose-500",
  },
];

export function HadithNotesModal({
  collectionSlug,
  hadithNum,
  hadithTitle,
  isOpen,
  onClose,
}: HadithNotesModalProps) {
  const store = useHadithUserStore();
  const currentNote = store.getNote(collectionSlug, hadithNum);
  const currentHighlight = store.getHighlight(collectionSlug, hadithNum);

  const [noteText, setNoteText] = useState(currentNote);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveNote = () => {
    store.setNote(collectionSlug, hadithNum, noteText);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    store.createCollection(newCollectionName.trim());
    setNewCollectionName("");
    setShowNewCollectionInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">
              Study Notes & Personal Organization
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* Highlight Color Picker */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Palette className="h-4 w-4 text-primary" />
              Highlight Category Color:
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => store.setHighlight(collectionSlug, hadithNum, null)}
                className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                  !currentHighlight
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                None
              </button>
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => store.setHighlight(collectionSlug, hadithNum, c.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                    c.bgClass
                  } ${c.borderClass} ${
                    currentHighlight?.color === c.id ? "ring-2 ring-primary ring-offset-1" : ""
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${c.borderClass} bg-current`} />
                  {c.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Note Area */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Personal Study Note:
            </label>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your reflection, benefit (Fā'idah), or memorization note here..."
              className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Saved locally on your device
              </span>
              <button
                type="button"
                onClick={handleSaveNote}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-4 w-4" /> Saved!
                  </>
                ) : (
                  "Save Note"
                )}
              </button>
            </div>
          </div>

          {/* Add to Custom Collections */}
          <div className="border-t border-border/60 pt-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Bookmark className="h-4 w-4 text-primary" />
                Add to Collections:
              </label>
              <button
                type="button"
                onClick={() => setShowNewCollectionInput(!showNewCollectionInput)}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <FolderPlus className="h-3.5 w-3.5" /> + New Folder
              </button>
            </div>

            {showNewCollectionInput && (
              <form onSubmit={handleCreateCollection} className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Collection Name (e.g. Fiqh of Salah)"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  Create
                </button>
              </form>
            )}

            <div className="mt-3 max-h-36 space-y-1.5 overflow-y-auto">
              {store.collections.map((coll) => {
                const inColl = coll.items.some(
                  (i) => i.collection_slug === collectionSlug && i.num === hadithNum,
                );
                return (
                  <button
                    key={coll.id}
                    type="button"
                    onClick={() =>
                      store.toggleInCollection(coll.id, collectionSlug, hadithNum, hadithTitle)
                    }
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      inColl
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{coll.name}</div>
                      {coll.description && (
                        <div className="text-[10px] text-muted-foreground">{coll.description}</div>
                      )}
                    </div>
                    {inColl && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-border/60 pt-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
