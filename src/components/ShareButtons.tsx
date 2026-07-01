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
  return [p.arabic, "", p.hebrew, "", `— ${p.surahName} (${p.surah}:${p.ayah})`].join(
    "\n"
  );
}

function buildUrl(p: Props): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/surah/${p.surah}#v-${p.ayah}`;
}

async function buildImageFile(
  props: Props,
  format: VerseImageFormat
): Promise<File> {
  const blob = await renderVerseImage({
    ...props,
    url: buildUrl(props),
    format,
  });
  return new File(
    [blob],
    `quran-${props.surah}-${props.ayah}-${format}.png`,
    {
      type: "image/png",
    }
  );
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
    [props]
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
    [t]
  );

  const copy = useCallback(async (what: "link" | "text") => {
    try {
      await navigator.clipboard.writeText(what === "link" ? url : shareMsg);
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {}
  }, [url, shareMsg]);

  const shareImage = useCallback(async () => {
    setBusy("share");
    try {
      const file = await buildImageFile(props, format);
      const nav: any = typeof navigator !== "undefined" ? navigator : null;
      const data = {
        files: [file],
        title: `${props.surahName} ${props.surah}:${props.ayah}`,
        text: shareMsg,
      };
      if (nav?.canShare?.({
 files: [file],
      }) && nav.share) {
        await nav.share(data);
      } else {
        downloadBlob(file);
      }
    } catch {
    } finally {
      setBusy(null);
    }
  }, [props, format, shareMsg]);

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
        onClick={shareImage}
        disabled={busy !== null}
        className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {busy === "share" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ImageDown className="h-3 w-3" />
        )}
        {t("a11y.share")}
      </button>
      <button
        type="button"
        onClick={downloadImage}
        disabled={busy !== null}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/80 hover:border-primary/40 hover:text-primary disabled:opacity-50"
      >
        {busy === "download" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ImageDown className="h-3 w-3" />
        )}
        {t("common.save")}
      </button>

      <button
        type="button"
        onClick={() => copy("link")}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/80 hover:border-primary/40 hover:text-primary"
      >
        {copied === "link" ? (
          <Check className="h-3 w-3" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
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
    </div>
  );
}
