import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bookmark, FileText, Trash2, ExternalLink, Calendar } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useHadithUserStore } from "@/lib/hadith-user-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface HadithNotesBookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: "he" | "ar" | "en";
}

export function HadithNotesBookmarksModal({
  isOpen,
  onClose,
  locale,
}: HadithNotesBookmarksModalProps) {
  const store = useHadithUserStore();
  const [activeTab, setActiveTab] = useState<"bookmarks" | "notes">("bookmarks");

  const isRtl = locale !== "en";
  const bookmarksList = store.bookmarks;
  const notesEntries = Object.entries(store.notes);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-3xl p-6" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
          <DialogTitle className="text-xl font-bold text-foreground">
            {locale === "ar"
              ? "أحاديثي المحفوظة والملاحظات"
              : locale === "he"
                ? "חדית'ים שמורים והערות אישיות"
                : "Saved Hadiths & Personal Notes"}
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
                {bookmarksList.length})
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
                {notesEntries.length})
              </span>
            </button>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 pt-2 pr-1">
          {activeTab === "bookmarks" ? (
            bookmarksList.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="text-sm font-medium">
                  {locale === "ar"
                    ? "لا توجد أحاديث محفوظة حتى الآن"
                    : locale === "he"
                      ? "אין חדית'ים שמורים בסימניות"
                      : "No bookmarked Hadiths yet"}
                </p>
                <p className="text-xs">
                  {locale === "ar"
                    ? "انقر على أيقونة المرجعية بجانب أي حديث لحفظه هنا"
                    : "Click the bookmark icon next to any Hadith to save it here."}
                </p>
              </div>
            ) : (
              bookmarksList.map((bm, i) => (
                <div
                  key={bm.id || `${bm.collectionSlug}-${bm.idInBook}-${i}`}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 hover:border-primary/40 transition-all shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-foreground capitalize">
                        {bm.collectionSlug} #{bm.idInBook}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/hadith/$collection/entry/$num"
                      params={{ collection: bm.collectionSlug, num: String(bm.idInBook) }}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-secondary text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <span>{locale === "ar" ? "عرض الحديث" : "Open"}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        store.toggleBookmark(bm.collectionSlug, bm.idInBook);
                        toast.success(
                          locale === "ar"
                            ? "تم حذف الحديث من المحفوظات"
                            : "Removed from bookmarks"
                        );
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )
          ) : notesEntries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm font-medium">
                {locale === "ar"
                  ? "لا توجد ملاحظات دراسية مدونة"
                  : locale === "he"
                    ? "אין הערות לימודיות"
                    : "No personal Hadith study notes yet"}
              </p>
            </div>
          ) : (
            notesEntries.map(([key, text]) => {
              const [coll, numStr] = key.split(":");
              return (
                <div
                  key={key}
                  className="space-y-2 rounded-2xl border border-border/70 bg-card p-4 hover:border-primary/40 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-primary capitalize">
                      {coll} Hadith #{numStr}
                    </span>
                    <Link
                      to="/hadith/$collection/entry/$num"
                      params={{ collection: coll, num: numStr }}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary font-semibold"
                    >
                      <span>{locale === "ar" ? "انتقل للحديث" : "Go to Hadith"}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <p className="text-xs text-foreground/90 bg-muted/50 p-2.5 rounded-xl font-reading-ar">
                    {text}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
