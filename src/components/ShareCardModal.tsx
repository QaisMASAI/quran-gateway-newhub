import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Sparkles, Check, Copy } from "lucide-react";
import { toast } from "sonner";

export interface ShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  arabicText?: string;
  translationText?: string;
  reference?: string;
  type?: "verse" | "dua" | "topic";
}

type CardTheme = "emerald" | "parchment" | "midnight" | "ivory";

export function ShareCardModal({
  isOpen,
  onClose,
  title = "Share Wisdom",
  arabicText,
  translationText,
  reference,
  type = "verse",
}: ShareCardProps) {
  const [theme, setTheme] = useState<CardTheme>("emerald");
  const [showArabic, setShowArabic] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const themeStyles: Record<
    CardTheme,
    { bg: string; text: string; arabic: string; border: string; accent: string; refBadge: string }
  > = {
    emerald: {
      bg: "bg-gradient-to-br from-[#064e3b] via-[#043427] to-[#022219]",
      text: "text-emerald-100",
      arabic: "text-amber-200 font-quran",
      border: "border-amber-400/30",
      accent: "text-amber-300",
      refBadge: "bg-amber-400/20 text-amber-200 border border-amber-400/40",
    },
    parchment: {
      bg: "bg-gradient-to-br from-[#faf6ee] via-[#f3ebe0] to-[#e8dccb]",
      text: "text-emerald-950",
      arabic: "text-emerald-900 font-quran",
      border: "border-emerald-800/20",
      accent: "text-emerald-800",
      refBadge: "bg-emerald-900/10 text-emerald-900 border border-emerald-900/20",
    },
    midnight: {
      bg: "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#090d16]",
      text: "text-slate-100",
      arabic: "text-sky-300 font-quran",
      border: "border-sky-400/30",
      accent: "text-sky-300",
      refBadge: "bg-sky-400/20 text-sky-200 border border-sky-400/30",
    },
    ivory: {
      bg: "bg-gradient-to-br from-[#ffffff] to-[#f8fafc]",
      text: "text-slate-900",
      arabic: "text-emerald-800 font-quran",
      border: "border-slate-200",
      accent: "text-emerald-600",
      refBadge: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    },
  };

  const currentTheme = themeStyles[theme];

  const handleCopyText = async () => {
    const textToCopy = `${arabicText ? arabicText + "\n\n" : ""}${translationText ? translationText + "\n\n" : ""}${reference ? "— " + reference : ""}\n\nVia Noor Al-Huda AI`;
    await navigator.clipboard.writeText(textToCopy);
    toast.success("Text copied to clipboard!");
  };

  const handleShareNative = async () => {
    const textToShare = `${arabicText ? arabicText + "\n\n" : ""}${translationText ? translationText + "\n\n" : ""}${reference ? "— " + reference : ""}\n\nVia Noor Al-Huda AI`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: reference || "Islamic Knowledge",
          text: textToShare,
          url: window.location.href,
        });
      } catch {
        // user cancelled or failed
      }
    } else {
      await handleCopyText();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 sm:max-w-lg rounded-3xl border-border/80 bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Sparkles className="h-5 w-5 text-gold" />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Theme Selector */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Select Card Theme
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme("emerald")}
                className={`h-6 w-6 rounded-full bg-[#064e3b] ring-offset-2 transition-all ${theme === "emerald" ? "ring-2 ring-gold scale-110" : ""}`}
                title="Emerald Gold"
              />
              <button
                type="button"
                onClick={() => setTheme("parchment")}
                className={`h-6 w-6 rounded-full bg-[#e8dccb] ring-offset-2 transition-all ${theme === "parchment" ? "ring-2 ring-gold scale-110" : ""}`}
                title="Sunrise Sand"
              />
              <button
                type="button"
                onClick={() => setTheme("midnight")}
                className={`h-6 w-6 rounded-full bg-[#0f172a] ring-offset-2 transition-all ${theme === "midnight" ? "ring-2 ring-gold scale-110" : ""}`}
                title="Midnight Sky"
              />
              <button
                type="button"
                onClick={() => setTheme("ivory")}
                className={`h-6 w-6 rounded-full bg-slate-200 ring-offset-2 transition-all ${theme === "ivory" ? "ring-2 ring-gold scale-110" : ""}`}
                title="Minimalist Ivory"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showArabic}
                onChange={(e) => setShowArabic(e.target.checked)}
                className="rounded text-primary focus:ring-gold"
              />
              <span>Arabic Text</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showTranslation}
                onChange={(e) => setShowTranslation(e.target.checked)}
                className="rounded text-primary focus:ring-gold"
              />
              <span>Translation</span>
            </label>
          </div>

          {/* Preview Card */}
          <div
            ref={cardRef}
            className={`relative p-6 sm:p-8 rounded-3xl border ${currentTheme.border} ${currentTheme.bg} shadow-2xl space-y-5 text-center overflow-hidden transition-all duration-300`}
          >
            {/* Geometric Accent Corners */}
            <div
              className={`absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 ${currentTheme.border} opacity-60`}
            />
            <div
              className={`absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 ${currentTheme.border} opacity-60`}
            />
            <div
              className={`absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 ${currentTheme.border} opacity-60`}
            />
            <div
              className={`absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 ${currentTheme.border} opacity-60`}
            />

            {/* Type Icon Badge */}
            <div className="flex justify-center">
              <span
                className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${currentTheme.refBadge}`}
              >
                {reference || type}
              </span>
            </div>

            {/* Arabic Text */}
            {showArabic && arabicText && (
              <p
                className={`text-xl sm:text-2xl leading-loose font-arabic ${currentTheme.arabic}`}
                dir="rtl"
              >
                {arabicText}
              </p>
            )}

            {/* Divider */}
            {showArabic && showTranslation && translationText && (
              <div className="flex items-center justify-center gap-2 opacity-40">
                <div className="h-px w-12 bg-current" />
                <span className="text-xs">❖</span>
                <div className="h-px w-12 bg-current" />
              </div>
            )}

            {/* Translation */}
            {showTranslation && translationText && (
              <p className={`text-xs sm:text-sm leading-relaxed ${currentTheme.text} font-serif`}>
                "{translationText}"
              </p>
            )}

            {/* Watermark Footer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] opacity-70">
              <span className="font-semibold tracking-wider uppercase">Noor Al-Huda AI</span>
              <span>ai.studio/build</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyText}
              className="rounded-2xl gap-2 text-xs border-border/80 hover:bg-secondary"
            >
              <Copy className="h-4 w-4 text-primary" />
              Copy Text
            </Button>
            <Button
              type="button"
              onClick={handleShareNative}
              className="rounded-2xl gap-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Share2 className="h-4 w-4" />
              Share Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
