import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Volume2,
  X,
  ChevronUp,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { useAudioPlayer } from "@/lib/audio-player-context";
import { RECITERS, reciterName } from "@/lib/quran-api";
import { Button } from "@/components/ui/button";
import { normalizeLocale } from "@/lib/i18n";

export function GlobalAudioPlayer() {
  const {
    activeTrack,
    isPlaying,
    reciter,
    playbackSpeed,
    isLooping,
    duration,
    currentTime,
    togglePlay,
    setReciter,
    setSpeed,
    toggleLoop,
    seekTo,
    playNextAyah,
    playPrevAyah,
    pauseTrack,
    closeTrack,
  } = useAudioPlayer();

  const { i18n } = useTranslation("common");
  const locale = (normalizeLocale(i18n.language) ?? "he") as "he" | "ar" | "en";
  const isRtl = i18n.dir() === "rtl";

  const [expanded, setExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!activeTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className="fixed bottom-16 sm:bottom-4 inset-x-3 sm:inset-x-auto sm:end-6 z-50 transition-all duration-300 max-w-xl w-full mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="surface-card relative overflow-hidden rounded-2xl border border-primary/30 bg-card/95 p-3 sm:p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-primary/20">
        {/* Progress bar line at top edge */}
        <div className="absolute top-0 inset-x-0 h-1 bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-150"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Surah & Ayah Info */}
          <Link
            to="/surah/$id"
            params={{ id: String(activeTrack.surah) }}
            hash={`v-${activeTrack.ayah}`}
            className="flex items-center gap-2.5 min-w-0 group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary font-bold shadow-2xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {activeTrack.ayah}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {activeTrack.surahName} ({activeTrack.surah}:{activeTrack.ayah})
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {reciterName(RECITERS.find((r) => r.key === reciter) ?? RECITERS[0], locale)}
              </p>
            </div>
          </Link>

          {/* Quick Play Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={playPrevAyah}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Previous Ayah"
            >
              <SkipBack className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
            </Button>

            <Button
              type="button"
              onClick={togglePlay}
              className="h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-transform hover:scale-105"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ms-0.5" />}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={playNextAyah}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Next Ayah"
            >
              <SkipForward className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings((v) => !v)}
              className={`h-8 w-8 rounded-lg ${showSettings ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
              aria-label="Audio options"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={closeTrack}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              aria-label="Close audio player"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Audio Scrubber & Expand Settings */}
        {showSettings && (
          <div className="mt-3 pt-3 border-t border-border/60 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Scrubber */}
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-secondary rounded-lg cursor-pointer"
              />
              <span>{formatTime(duration)}</span>
            </div>

            {/* Reciter & Speed Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {locale === "ar" ? "القارئ:" : locale === "he" ? "מקריא:" : "Reciter:"}
                </span>
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {locale === "ar" ? "ياسر الدوسري" : locale === "he" ? "יאסר א-דוסרי" : "Yasser Al-Dosari"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Loop Verse Toggle */}
                <button
                  type="button"
                  onClick={toggleLoop}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    isLooping ? "border-gold/40 bg-gold/15 text-gold" : "border-border text-muted-foreground"
                  }`}
                >
                  <Repeat className="h-3 w-3" />
                  <span>{locale === "ar" ? "تكرار" : locale === "he" ? "חזרה" : "Repeat"}</span>
                </button>

                {/* Speed buttons */}
                <div className="flex items-center rounded-lg border border-border/80 bg-background p-0.5">
                  {[0.75, 1, 1.25, 1.5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeed(s)}
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        playbackSpeed === s
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
