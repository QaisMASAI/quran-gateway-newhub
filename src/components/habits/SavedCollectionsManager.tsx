import React, { useState } from "react";
import {
  Bookmark,
  FolderPlus,
  Trash2,
  Plus,
  ShieldCheck,
  Heart,
  Sparkles,
  ExternalLink,
  BookMarked,
  Search,
} from "lucide-react";
import {
  getSavedCollections,
  createCollection,
  deleteCollection,
  removeItemFromCollection,
  type UserCollection,
} from "@/lib/saved-collections";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";

interface SavedCollectionsManagerProps {
  locale: string;
}

export const SavedCollectionsManager: React.FC<SavedCollectionsManagerProps> = ({ locale }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const [collections, setCollections] = useState<UserCollection[]>(getSavedCollections());
  const [activeCollectionId, setActiveCollectionId] = useState<string>(collections[0]?.id || "");
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const activeCol = collections.find((c) => c.id === activeCollectionId) || collections[0];

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const updated = createCollection(newTitle, newDesc);
    setCollections(updated);
    if (updated[0]) setActiveCollectionId(updated[0].id);
    setNewTitle("");
    setNewDesc("");
    setIsCreating(false);
  };

  const handleDeleteCollection = (id: string) => {
    const updated = deleteCollection(id);
    setCollections(updated);
    if (updated[0]) setActiveCollectionId(updated[0].id);
  };

  const handleRemoveItem = (colId: string, itemId: string) => {
    const updated = removeItemFromCollection(colId, itemId);
    setCollections(updated);
  };

  const filteredItems = (activeCol?.items || []).filter(
    (i) =>
      i.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      i.reference.toLowerCase().includes(searchFilter.toLowerCase()) ||
      i.snippet.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {isAr ? "المجموعات والحافظات المحفوظة" : isHe ? "אוספים ושמירות אישיות" : "Saved Collections & Vaults"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAr
                ? "تنظيم الآيات والأحاديث والتأملات في مجموعات موضوعية خاصة"
                : isHe
                  ? "ארגן פסוקים, חדית'ים והרהורים באוספים נושאיים"
                  : "Organize verses, Hadiths & reflections into custom curated collections"}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs gap-1.5"
        >
          <FolderPlus className="w-4 h-4" />
          <span>{isAr ? "إنشاء مجموعة جديدة" : isHe ? "צור אוסף חדש" : "New Collection"}</span>
        </Button>
      </div>

      {isCreating && (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-3 animate-fadeIn">
          <h4 className="text-xs font-bold text-amber-400">
            {isAr ? "بيانات المجموعة الجديدة" : isHe ? "פרטי האוסף החדש" : "New Collection Details"}
          </h4>
          <input
            type="text"
            placeholder={isAr ? "عنوان المجموعة (مثال: أذكار الصباح)" : isHe ? "שם האוסף" : "Collection Title (e.g., Morning Adhkar)"}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
          />
          <textarea
            rows={2}
            placeholder={
              isAr
                ? "وصف قصير للمجموعة..."
                : isHe
                  ? "תיאור קצר..."
                  : "Short description..."
            }
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
          />
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setIsCreating(false)}
              variant="outline"
              size="sm"
              className="text-xs rounded-xl"
            >
              {isAr ? "إلغاء" : isHe ? "ביטול" : "Cancel"}
            </Button>
            <Button
              onClick={handleCreate}
              size="sm"
              className="bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs"
            >
              {isAr ? "حفظ المجموعة" : isHe ? "שמור אוסף" : "Save Collection"}
            </Button>
          </div>
        </div>
      )}

      {/* COLLECTIONS TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-800">
        {collections.map((col) => {
          const isActive = col.id === activeCollectionId;
          return (
            <button
              key={col.id}
              onClick={() => setActiveCollectionId(col.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                  : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>{col.title}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-zinc-900/60 text-[10px] font-mono">
                {col.items.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE COLLECTION CONTENT */}
      {activeCol ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div>
              <h4 className="text-sm font-black text-white">{activeCol.title}</h4>
              <p className="text-xs text-zinc-400">{activeCol.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder={isAr ? "تصفية العناصر..." : isHe ? "סינון..." : "Filter items..."}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500 w-44"
                />
              </div>

              <button
                onClick={() => handleDeleteCollection(activeCol.id)}
                className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete Collection"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-zinc-950 border border-dashed border-zinc-800 text-zinc-500 text-xs">
              {isAr ? "لا توجد عناصر محفوظة في هذه المجموعة حتى الآن" : isHe ? "אין פריטים שמורים באוסף זה" : "No saved items in this collection yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 hover:border-amber-500/40 transition-all space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-[10px] font-mono">
                        {item.reference}
                      </Badge>

                      <button
                        onClick={() => handleRemoveItem(activeCol.id, item.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h5 className="text-xs font-bold text-white pt-1">{item.title}</h5>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed" dir="auto">
                      "{item.snippet}"
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    {item.type === "verse" && (
                      <Link
                        to={`/surah/${item.reference.split(":")[0]}`}
                        hash={`v-${item.reference.split(":")[1]}`}
                        className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>{isAr ? "فتح السورة" : isHe ? "פתח סורה" : "Open Surah"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
