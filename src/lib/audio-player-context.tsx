import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  ayahAudioUrls,
  RECITERS,
  reciterName,
  getStoredReciter,
  setStoredReciter,
  type ReciterKey,
  getStoredAudioQuality,
} from "@/lib/quran-api";

export interface ActiveTrack {
  surah: number;
  surahName: string;
  ayah: number;
  maxAyahInSurah?: number;
  arabicText?: string;
  translationText?: string;
}

interface AudioContextType {
  activeTrack: ActiveTrack | null;
  isPlaying: boolean;
  reciter: ReciterKey;
  playbackSpeed: number;
  isLooping: boolean;
  duration: number;
  currentTime: number;
  playTrack: (track: ActiveTrack) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlay: () => void;
  closeTrack: () => void;
  setReciter: (r: ReciterKey) => void;
  setSpeed: (speed: number) => void;
  toggleLoop: () => void;
  seekTo: (seconds: number) => void;
  playNextAyah: () => void;
  playPrevAyah: () => void;
}

const AudioPlayerContext = createContext<AudioContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [activeTrack, setActiveTrack] = useState<ActiveTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciter, setReciterState] = useState<ReciterKey>("yasser-ad-dussary");
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackVersionRef = useRef(0);
  const mirrorIndexRef = useRef(0);

  const buildAyahMirrors = (track: ActiveTrack) => {
    return ayahAudioUrls(track.surah, track.ayah, "yasser-ad-dussary", getStoredAudioQuality());
  };

  const playMirrors = (audio: HTMLAudioElement, mirrors: string[], startIndex = 0): Promise<void> => {
    if (mirrors.length === 0) return Promise.reject(new Error("no_audio_mirrors"));
    let i = startIndex;
    const tryNext = (): Promise<void> => {
      if (i >= mirrors.length) return Promise.reject(new Error("all_audio_mirrors_failed"));
      audio.src = mirrors[i];
      mirrorIndexRef.current = i;
      i += 1;
      return audio.play().then(
        () => Promise.resolve(),
        () => tryNext(),
      );
    };
    return tryNext();
  };

  const playTrackInternal = async (track: ActiveTrack, version: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const mirrors = buildAyahMirrors(track);
    try {
      await playMirrors(audio, mirrors, 0);
      if (trackVersionRef.current !== version) return;
      setIsPlaying(true);
    } catch (err) {
      if (trackVersionRef.current !== version) return;
      console.warn("Play track failed:", err);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onError = (e: Event) => {
      console.warn("Audio playback error:", e);
      const current = activeTrackRef.current;
      if (!current) {
        setIsPlaying(false);
        return;
      }
      const mirrors = buildAyahMirrors(current);
      const nextMirrorIndex = mirrorIndexRef.current + 1;
      if (nextMirrorIndex >= mirrors.length) {
        setIsPlaying(false);
        return;
      }
      playMirrors(audio, mirrors, nextMirrorIndex)
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    };
    const onEnded = () => {
      setIsPlaying(false);
      // Auto-play next verse if available
      setActiveTrack((current) => {
        if (!current) return null;
        if (isLooping) {
          audio.currentTime = 0;
          audio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
          return current;
        }
        if (current.maxAyahInSurah && current.ayah < current.maxAyahInSurah) {
          const nextAyah = current.ayah + 1;
          const nextTrack = { ...current, ayah: nextAyah };
          const version = trackVersionRef.current + 1;
          trackVersionRef.current = version;
          void playTrackInternal(nextTrack, version);
          return nextTrack;
        }
        return current;
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
    };
  }, [isLooping]);

  const activeTrackRef = useRef<ActiveTrack | null>(null);
  useEffect(() => {
    activeTrackRef.current = activeTrack;
  }, [activeTrack]);

  const playTrack = (track: ActiveTrack) => {
    setActiveTrack(track);
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackSpeed;
    const version = trackVersionRef.current + 1;
    trackVersionRef.current = version;
    void playTrackInternal(track, version);
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const resumeTrack = () => {
    if (audioRef.current && activeTrack) {
      if (!audioRef.current.src) {
        const version = trackVersionRef.current + 1;
        trackVersionRef.current = version;
        void playTrackInternal(activeTrack, version);
        return;
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Resume track failed:", err);
          setIsPlaying(false);
        });
    }
  };

  const togglePlay = () => {
    if (isPlaying) pauseTrack();
    else resumeTrack();
  };

  const closeTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
    }
    setIsPlaying(false);
    setActiveTrack(null);
    setCurrentTime(0);
    setDuration(0);
  };

  const setReciter = (r: ReciterKey) => {
    // Lock to Yasser Al-Dosari
    setReciterState("yasser-ad-dussary");
    setStoredReciter("yasser-ad-dussary");
  };

  const setSpeed = (speed: number) => {
    setPlaybackSpeedState(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const toggleLoop = () => setIsLooping((prev) => !prev);

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const playNextAyah = () => {
    if (!activeTrack) return;
    const max = activeTrack.maxAyahInSurah ?? 286;
    if (activeTrack.ayah < max) {
      playTrack({ ...activeTrack, ayah: activeTrack.ayah + 1 });
    }
  };

  const playPrevAyah = () => {
    if (!activeTrack) return;
    if (activeTrack.ayah > 1) {
      playTrack({ ...activeTrack, ayah: activeTrack.ayah - 1 });
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        activeTrack,
        isPlaying,
        reciter,
        playbackSpeed,
        isLooping,
        duration,
        currentTime,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlay,
        closeTrack,
        setReciter,
        setSpeed,
        toggleLoop,
        seekTo,
        playNextAyah,
        playPrevAyah,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}
