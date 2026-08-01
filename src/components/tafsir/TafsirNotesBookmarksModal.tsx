import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bookmark, FileText, Trash2, ExternalLink, Calendar } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTafsirUserStore } from "@/lib/tafsir-user-store";
import { tafsirSourceName, getTafsirMetaByKey } from "@/lib/tafsir-sources";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TafsirNotesBookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: "he" | "ar" | "en";
}

export function TafsirNotesBookmarksModal({
  isOpen,
  onClose,
  locale,
}: TafsirNotesBookmarksModalProps) {
  const { bookmarks, notes, saveBookmark, saveNote } = useTafsirUserStore();
  const [activeTab, setActiveTab] = useState<"bookmarks" | "notes">("bookmarks");

  const isRtl = locale !== "en";
  const notesList = Object.values(notes);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-3xl p-6" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
          <DialogTitle className="text-xl font-bold text-foreground">
            {locale === "ar"
              ? "المحفوظات والملاحظات الشخصية"
              : locale === "he"
                ? "סימניות והערות אישיות"
                : "Tafsir Bookmarks & Personal Notes"}
          </DialogTitle>

          {/* Toggle Tabs */}
          <div className="flex items-center gap-1 rounded-2xl border border-border/80 bg-secondary/50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("bookmarks")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "bookmarks"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>
                {locale === "ar" ? "المحفوظات" : locale === "he" ? "סימניות" : "Bookmarks"} (
                {bookmarks.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "notes"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>
                {locale === "ar" ? "الملاحظات" : locale === "he" ? "הערות" : "Notes"} (
                {notesList.length})
              </span>
            </button>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 pt-2 pr-1">
          {activeTab === "bookmarks" ? (
            bookmarks.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="text-sm font-medium">
                  {locale === "ar"
                    ? "لا توجد تفاسير محفوظة حتى الآن"
                    : locale === "he"
                      ? "אין תפסיקים שמורים בסימניות"
                      : "No bookmarked Tafsir passages yet"}
                </p>
                <p className="text-xs">
                  {locale === "ar"
                    ? "انقر على أيقونة الإشارة المرجعية بجانب أي تفسير لحفظه هنا"
                    : "Click the bookmark icon next to any Tafsir to save it here."}
                </p>
              </div>
            ) : (
              bookmarks.map((bm) => {
                const meta = getTafsirMetaByKey(bm.sourceKey);
                const sourceName = meta ? tafsirSourceName(meta, locale) : bm.sourceKey;
                return (
                  <div
                    key={bm.id}
                    className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 hover:border-primary/40 transition-all shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-foreground">
                          {bm.surahName} ({bm.surah}:{bm.ayah})
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {sourceName}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(bm.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to="/tafsir/$surah/$ayah"
                        params={{ surah: String(bm.surah), ayah: String(bm.ayah) }}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <span>{locale === "ar" ? "افتح التفسير" : "Open"}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          saveBookmark(bm);
                          toast.success(
                            locale === "ar"
                              ? "تم حذف التفسير من المحفوظات"
                              : "Removed from bookmarks",
                          );
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )
          ) : notesList.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm font-medium">
                {locale === "ar"
                  ? "لا توجد ملاحظات شخصية مدونة"
                  : locale === "he"
                    ? "אין הערות אישיות שמורות"
                    : "No personal study notes written yet"}
              </p>
            </div>
          ) : (
            notesList.map((n) => (
              <div
                key={n.id}
                className="rounded-2xl border border-border/70 bg-card p-4 space-y-2 hover:border-primary/40 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-bold text-sm text-foreground">
                    Verse {n.surah}:{n.ayah}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/tafsir/$surah/$ayah"
                      params={{ surah: String(n.surah), ayah: String(n.ayah) }}
                      onClick={onClose}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>{locale === "ar" ? "عرض الآية" : "View Verse"}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        saveNote(n.surah, n.ayah, "");
                        toast.success(locale === "ar" ? "تم حذف الملاحظة" : "Note deleted");
                      }}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed font-serif bg-secondary/30 p-3 rounded-xl">
                  {n.text}
                </p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
