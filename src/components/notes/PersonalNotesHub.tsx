import React, { useState } from "react";
import {
  NotebookPen,
  Plus,
  Trash2,
  Search,
  Tag,
  BookOpen,
  ScrollText,
  FileText,
  Edit2,
  Check,
  Download,
} from "lucide-react";
import {
  getUnifiedNotes,
  createUnifiedNote,
  updateUnifiedNote,
  deleteUnifiedNote,
  type UnifiedNote,
} from "@/lib/personal-notes-manager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PersonalNotesHubProps {
  locale: string;
}

export const PersonalNotesHub: React.FC<PersonalNotesHubProps> = ({ locale }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const [notes, setNotes] = useState<UnifiedNote[]>(getUnifiedNotes());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState("");
  const [body, setBody] = useState("");
  const [sourceType, setSourceType] = useState<UnifiedNote["sourceType"]>("general");

  const handleCreateNote = () => {
    if (!title.trim() || !body.trim()) return;
    const updated = createUnifiedNote(title, reference || "General Note", body, sourceType, ["Personal"]);
    setNotes(updated);
    setTitle("");
    setReference("");
    setBody("");
    setIsCreating(false);
  };

  const handleDeleteNote = (id: string) => {
    const updated = deleteUnifiedNote(id);
    setNotes(updated);
  };

  const handleExportNotes = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `noor_study_notes_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || n.sourceType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <NotebookPen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {isAr ? "دفتر الملاحظات والتأملات الشخصية" : isHe ? "מחברת הערות והרהורים אישיים" : "Personal Notes & Reflections Vault"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAr
                ? "سجل تدويناتك وتأملاتك حول الآيات والأحاديث والمسارات المعرفية"
                : isHe
                  ? "רשום את הרהוריך והערותיך על הפסוקים, החדית'ים והנושאים"
                  : "Keep track of your study notes, reflections & insights across all texts"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportNotes}
            variant="outline"
            size="sm"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? "تصدير الملاحظات" : isHe ? "יצוא הערות" : "Export Notes"}</span>
          </Button>

          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl text-xs gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "ملاحظة جديدة" : isHe ? "הערה חדשה" : "New Note"}</span>
          </Button>
        </div>
      </div>

      {isCreating && (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-3 animate-fadeIn">
          <h4 className="text-xs font-bold text-emerald-400">
            {isAr ? "إضافة ملاحظة جديدة" : isHe ? "הוסף הערה חדשה" : "Create New Note"}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={isAr ? "عنوان الملاحظة" : isHe ? "כותרת" : "Note Title"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder={isAr ? "المرجع (مثال: سورة البقرة 2:255)" : isHe ? "סימוכין" : "Reference (e.g. Surah 2:255)"}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <textarea
            rows={3}
            placeholder={isAr ? "اكتب تأملاتك وملاحظاتك العلمية..." : isHe ? "כתוב את הערותיך..." : "Write your study notes & reflections..."}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500"
          />

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsCreating(false)} variant="outline" size="sm" className="text-xs rounded-xl">
              {isAr ? "إلغاء" : isHe ? "ביטול" : "Cancel"}
            </Button>
            <Button onClick={handleCreateNote} size="sm" className="bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs">
              {isAr ? "حفظ الملاحظة" : isHe ? "שמור הערה" : "Save Note"}
            </Button>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isAr ? "البحث في جميع الملاحظات..." : isHe ? "חפש בכל ההערות..." : "Search all notes..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1">
          {["all", "surah", "hadith", "topic"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterType === type
                  ? "bg-emerald-500 text-zinc-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* NOTES GRID */}
      {filteredNotes.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-zinc-950 border border-dashed border-zinc-800 text-zinc-500 text-xs">
          {isAr ? "لم يتم العثور على ملاحظات مطابقة" : isHe ? "לא נמצאו הערות תואמות" : "No matching notes found."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredNotes.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 hover:border-emerald-500/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px] font-mono">
                    {n.reference}
                  </Badge>

                  <button
                    onClick={() => handleDeleteNote(n.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-sm font-extrabold text-white">{n.title}</h4>
                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap" dir="auto">
                  {n.body}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500">
                <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                <span className="capitalize">{n.sourceType}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
