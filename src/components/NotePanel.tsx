import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Save, Trash2, NotebookPen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAyahNote } from "@/lib/notes";

interface Props {
  surah: number;
  ayah: number;
  onClose: () => void;
}

export function NotePanel({ surah, ayah, onClose }: Props) {
  const { note, loading, save, isAuthenticated } = useAyahNote(surah, ayah);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const { t, i18n } = useTranslation("common");

  useEffect(() => {
    setDraft(note?.body ?? "");
  }, [note?.id, note?.body]);

  if (!isAuthenticated) {
    return (
      <div className="mt-4 rounded-xl border border-border bg-secondary/40 px-4 py-3.5 text-sm">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
          <NotebookPen className="h-3 w-3" />
          {t("ui.ayah.note")}
        </div>
        <p className="text-muted-foreground">
          <Link to="/auth" className="font-medium text-primary hover:underline">
            {t("nav.signIn")}
          </Link>
        </p>
      </div>
    );
  }

  const persist = async () => {
    setSaving(true);
    await save(draft);
    setSaving(false);
    if (!draft.trim()) onClose();
  };

  const localeCode = i18n.language === "he" ? "he-IL" : i18n.language === "ar" ? "ar" : "en";

  return (
    <div className="mt-4 rounded-xl border border-border bg-secondary/40 px-4 py-3.5">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-primary">
        <span className="flex items-center gap-1.5">
          <NotebookPen className="h-3 w-3" />
          {t("ui.ayah.note")}
        </span>
        {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        placeholder={t("ui.note.placeholder")}
        className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {note
            ? t("ui.note.lastUpdated", { when: new Date(note.updatedAt).toLocaleString(localeCode) })
            : t("ui.note.notSaved")}
        </span>
        <div className="flex items-center gap-1.5">
          {note && (
            <button
              onClick={async () => {
                setDraft("");
                setSaving(true);
                await save("");
                setSaving(false);
                onClose();
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3" />
              {t("common.cancel")}
            </button>
          )}
          <button
            onClick={persist}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

