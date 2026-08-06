/**
 * Quran Gateway — Advanced Audio Player Controls Component
 * Provides Reciter Selection (12+ Qaris), Playback Speed (0.75x - 2.0x), Looping, and Segment Controls.
 */

import { useState } from "react";
import {
  Play,
  Pause,
  Repeat,
  Gauge,
  UserCheck,
  Disc,
} from "lucide-react";
import { RECITERS, reciterName } from "@/lib/quran-api";
import { useAudioPlayer } from "@/lib/audio-player-context";

export type PlaybackSpeed = 0.75 | 1.0 | 1.25 | 1.5 | 2.0;
export type LoopMode = "off" | "repeat-1" | "repeat-3" | "infinite" | "surah";

interface AudioPlayerControlsProps {
  surah: number;
  surahName: string;
  ayah: number;
  maxAyahInSurah?: number;
  arabicText: string;
  translationText: string;
  locale?: "he" | "ar" | "en";
}

export function AudioPlayerControls({
  surah,
  surahName,
  ayah,
  maxAyahInSurah,
  arabicText,
  translationText,
  locale = "he",
}: AudioPlayerControlsProps) {
  const {
    activeTrack,
    isPlaying,
    playTrack,
    togglePlay,
    reciter,
    setReciter,
  } = useAudioPlayer();

  const [speed, setSpeed] = useState<PlaybackSpeed>(1.0);
  const [loopMode, setLoopMode] = useState<LoopMode>("off");
  const [showReciterDropdown, setShowReciterDropdown] = useState(false);

  const isThisVerseActive = activeTrack?.surah === surah && activeTrack?.ayah === ayah;
  const isThisVersePlaying = isThisVerseActive && isPlaying;

  const handlePlayToggle = () => {
    if (isThisVerseActive) {
      togglePlay();
    } else {
      playTrack({
        surah,
        surahName,
        ayah,
        maxAyahInSurah,
        arabicText,
        translationText,
      });
    }
  };

  const handleSpeedChange = () => {
    const speeds: PlaybackSpeed[] = [0.75, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setSpeed(newSpeed);

    // Apply speed to global audio element if available
    const audioEl = document.querySelector("audio");
    if (audioEl) {
      audioEl.playbackRate = newSpeed;
    }
  };

  const handleLoopToggle = () => {
    const modes: LoopMode[] = ["off", "repeat-1", "repeat-3", "infinite", "surah"];
    const nextIdx = (modes.indexOf(loopMode) + 1) % modes.length;
    setLoopMode(modes[nextIdx]);
  };

  return (
    <div className="rounded-xl border border-border bg-card/90 p-3.5 space-y-3 shadow-2xs backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handlePlayToggle}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-xs ${
            isThisVersePlaying
              ? "bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-amber-400/40"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isThisVersePlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
          <span>
            {isThisVersePlaying
              ? locale === "ar"
                ? "إيقاف مؤقت"
                : locale === "he"
                  ? "השהה השמעה"
                  : "Pause Recitation"
              : locale === "ar"
                ? "استماع للآية"
                : locale === "he"
                  ? "נגן פסוק"
                  : "Play Recitation"}
          </span>
        </button>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Reciter Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowReciterDropdown((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
            >
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">
                {(() => {
                  const r = RECITERS.find((x) => x.key === reciter);
                  return r ? reciterName(r, locale) : "Qari";
                })()}
              </span>
            </button>

            {/* Reciter Dropdown Modal */}
            {showReciterDropdown && (
              <div className="absolute top-full end-0 mt-2 z-50 w-64 rounded-xl border border-border bg-popover p-2 shadow-xl space-y-1 animate-in fade-in">
                <div className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase border-b border-border/60">
                  {locale === "ar"
                    ? "اختر القارئ"
                    : locale === "he"
                      ? "בחר קורא מקצועי (קארי)"
                      : "Select Reciter (Qari)"}
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {RECITERS.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => {
                        setReciter(r.key);
                        setShowReciterDropdown(false);
                      }}
                      className={`w-full text-start px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        reciter === r.key
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-popover-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{reciterName(r, locale)}</span>
                      {reciter === r.key && <Disc className="h-3 w-3 text-primary animate-spin" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Speed Controller */}
          <button
            type="button"
            onClick={handleSpeedChange}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
            title="Playback Speed"
          >
            <Gauge className="h-3.5 w-3.5 text-gold" />
            <span className="font-mono font-bold text-[11px]">{speed}x</span>
          </button>

          {/* Looping Controller */}
          <button
            type="button"
            onClick={handleLoopToggle}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              loopMode !== "off"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border bg-background text-muted-foreground hover:border-primary/30"
            }`}
          >
            <Repeat className="h-3.5 w-3.5" />
            <span className="text-[11px] capitalize">
              {loopMode === "off"
                ? "Loop: Off"
                : loopMode === "repeat-1"
                  ? "Repeat 1x"
                  : loopMode === "repeat-3"
                    ? "Repeat 3x"
                    : loopMode === "infinite"
                      ? "Infinite"
                      : "Surah Loop"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
