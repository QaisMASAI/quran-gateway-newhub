import { useEffect, useState } from "react";
import { FileText, Save, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useHadithUserStore } from "@/lib/hadith-user-store";

interface HadithNotesModalProps {
  collectionSlug: string;
  hadithNum: number;
  hadithTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function HadithNotesModal({
  collectionSlug,
  hadithNum,
  hadithTitle,
  isOpen,
  onClose,
}: HadithNotesModalProps) {
  const store = useHadithUserStore();
  const currentNote = store.getNote(collectionSlug, hadithNum);
  const [draft, setDraft] = useState(currentNote);

  useEffect(() => {
    if (isOpen) {
      setDraft(currentNote);
    }
  }, [isOpen, currentNote]);

  const hasChanges = draft.trim() !== currentNote.trim();

  const handleSave = () => {
    store.setNote(collectionSlug, hadithNum, draft);
    onClose();
  };

  const handleClear = () => {
    setDraft("");
    store.setNote(collectionSlug, hadithNum, "");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Personal Hadith Notes
          </DialogTitle>
          <DialogDescription>
            Save your study reflections for {hadithTitle}. Notes are stored on this device.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write your reflection, key lessons, or follow-up questions..."
          className="min-h-40"
        />

        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between sm:space-x-0">
          <Button type="button" variant="outline" onClick={handleClear} disabled={!currentNote.trim()}>
            <Trash2 className="h-4 w-4" />
            Clear note
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4" />
              Save note
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}