import { Share2, Copy, Check, ImageDown, Loader2, ChevronDown } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { renderVerseImage, type VerseImageFormat } from "@/lib/verse-image";

interface Props {
  surah: number;
  ayah: number;
  surahName: string;
  arabic: string;
  hebrew: string;
}

const FORMATS: VerseImageFormat[] = ["square", "story", "landscape", "portrait"];

function buildText(p: Props): string {
  return [p.arabic, "", p.hebrew, "", `— ${p.surahName} (${p.surah}:${p.ayah})`].join("\n");
}

function buildUrl(p: Props): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/surah/${p.surah}#v-${p.ayah}`;
}

async function buildImageFile(props: Props, format: VerseImageFormat): Promise<File> {
  const blob = await renderVerseImage({
    ...props,
    url: buildUrl(props),
    format,
  });
  return new File([blob], `quran-${props.surah}-${props.ayah}-${format}.png`, {
    type: "image/png",
  });
}

function downloadBlob(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ShareButtons(props: Props) {
  const [copied, setCopied] = useState<"link" | "text" | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [format, setFormat] = useState<VerseImageFormat>("square");
  const [open, setOpen] = useState(false);
  const { t } = useTranslation("common");

  const { url, text, shareMsg } = useMemo(
    () => ({
      url: buildUrl(props),
      text: buildText(props),
      shareMsg: `${buildText(props)}\n\n${buildUrl(props)}`,
    }),
    [props],
  );

  const formatLabel = useCallback(
    (f: VerseImageFormat) =>
      t(`ui.share.formats.${f}` as const, {
        defaultValue:
          f === "square"
            ? "Square · Instagram / General"
            : f === "story"
              ? "Story · 9:16"
              : f === "landscape"
                ? "Landscape · Facebook / X"
                : "Portrait · Instagram 4:5",
      }),
    [t],
  );

  const copy = useCallback(
    async (what: "link" | "text") => {
      try {
        await navigator.clipboard.writeText(what === "link" ? url : shareMsg);
        setCopied(what);
        setTimeout(() => setCopied(null), 1800);
      } catch {
        // Clipboard unavailable — silently no-op.
      }
    },
    [url, shareMsg],
  );

  const [showShareModal, setShowShareModal] = useState(false);

  const shareNativeOrModal = useCallback(async () => {
    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (nav?.share) {
      try {
        await nav.share({
          title: `${props.surahName} (${props.surah}:${props.ayah})`,
          text: shareMsg,
          url: url,
        });
        return;
      } catch (e) {
        // User cancelled or unsupported share payload — fall back to modal
        if ((e as Error).name === "AbortError") return;
      }
    }
    setShowShareModal(true);
  }, [props, shareMsg, url]);

  const downloadImage = useCallback(async () => {
    setBusy("download");
    try {
      const file = await buildImageFile(props, format);
      downloadBlob(file);
    } finally {
      setBusy(null);
    }
  }, [props, format]);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Share2 className="h-3 w-3" /> {t("a11y.share")}
      </span>

      {/* Format selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/80 hover:border-primary/40 hover:text-primary"
        >
          {formatLabel(format)}
          <ChevronDown className="h-3 w-3" />
        </button>
        {open && (
          <div
            className="absolute z-20 mt-1 min-w-[200px] rounded-md border border-border bg-popover p-1 text-start shadow-md"
            onMouseLeave={() => setOpen(false)}
          >
            {FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFormat(f);
                  setOpen(false);
                }}
                className={`block w-full rounded px-2 py-1.5 text-[12px] hover:bg-accent ${
                  f === format ? "text-primary font-semibold" : "text-foreground/80"
                }`}
              >
                {formatLabel(f)}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={shareNativeOrModal}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
      >
        <Share2 className="h-3 w-3" />
        {t("a11y.share")}
      </button>

      <button
        type="button"
        onClick={downloadImage}
        disabled={busy !== null}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/80 hover:border-primary/40 hover:text-primary disabled:opacity-50"
      >
        {busy === "download" ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageDown className="h-3 w-3" />}
        {t("common.save")}
      </button>

      <button
        type="button"
        onClick={() => copy("link")}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/80 hover:border-primary/40 hover:text-primary"
      >
        {copied === "link" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied === "link" ? t("ui.share.copied") : t("ui.share.copyLink")}
      </button>

      <button
        type="button"
        onClick={() => copy("text")}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/80 hover:border-primary/40 hover:text-primary"
      >
        {copied === "text" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied === "text" ? t("ui.share.copied") : t("ui.share.copyText")}
      </button>

      {/* Share Options Dialog Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                {t("a11y.share")} — {props.surahName} ({props.surah}:{props.ayah})
              </h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold px-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground dir-auto line-clamp-3 bg-muted/30 p-2.5 rounded-lg border border-border/50">
              "{props.arabic}"
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/20 transition"
              >
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold hover:bg-sky-500/20 transition"
              >
                Telegram
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-foreground/20 bg-foreground/5 text-foreground font-semibold hover:bg-foreground/10 transition"
              >
                X / Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-500/20 transition"
              >
                Facebook
              </a>
            </div>

            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  copy("link");
                  setShowShareModal(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-border bg-background text-xs font-medium hover:bg-accent"
              >
                <Copy className="h-3.5 w-3.5" /> {t("ui.share.copyLink")}
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadImage();
                  setShowShareModal(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20"
              >
                <ImageDown className="h-3.5 w-3.5" /> {t("common.save")} ({formatLabel(format)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
