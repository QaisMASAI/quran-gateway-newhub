import { useState, useEffect } from "react";
import type { TafsirSourceKey } from "@/lib/tafsir-sources";

export interface TafsirBookmark {
  id: string; // e.g. "2:255:ibn_kathir"
  surah: number;
  ayah: number;
  sourceKey: TafsirSourceKey;
  surahName: string;
  createdAt: number;
  notes?: string;
}

export interface TafsirNote {
  id: string; // e.g. "2:255"
  surah: number;
  ayah: number;
  text: string;
  updatedAt: number;
}

export interface TafsirReadingHistoryItem {
  surah: number;
  ayah: number;
  timestamp: number;
}

const BOOKMARKS_KEY = "tafsir:bookmarks";
const NOTES_KEY = "tafsir:notes";
const COMPARE_KEY = "tafsir:compare_sources";
const HISTORY_KEY = "tafsir:history";
const EVENT_NAME = "tafsir:user-store-change";

export function getStoredBookmarks(): TafsirBookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(bookmark: Omit<TafsirBookmark, "id" | "createdAt">): boolean {
  if (typeof window === "undefined") return false;
  const current = getStoredBookmarks();
  const id = `${bookmark.surah}:${bookmark.ayah}:${bookmark.sourceKey}`;
  const exists = current.some((b) => b.id === id);

  let updated: TafsirBookmark[];
  if (exists) {
    updated = current.filter((b) => b.id !== id);
  } else {
    updated = [{ ...bookmark, id, createdAt: Date.now() }, ...current];
  }

  window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
  return !exists;
}

export function isBookmarked(surah: number, ayah: number, sourceKey: TafsirSourceKey): boolean {
  const current = getStoredBookmarks();
  const id = `${surah}:${ayah}:${sourceKey}`;
  return current.some((b) => b.id === id);
}

export function getStoredNotes(): Record<string, TafsirNote> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveNote(surah: number, ayah: number, text: string): void {
  if (typeof window === "undefined") return;
  const current = getStoredNotes();
  const key = `${surah}:${ayah}`;

  if (!text.trim()) {
    delete current[key];
  } else {
    current[key] = {
      id: key,
      surah,
      ayah,
      text: text.trim(),
      updatedAt: Date.now(),
    };
  }

  window.localStorage.setItem(NOTES_KEY, JSON.stringify(current));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getStoredCompareSources(): TafsirSourceKey[] {
  if (typeof window === "undefined") return ["ibn_kathir", "jalalayn"];
  try {
    const raw = window.localStorage.getItem(COMPARE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["ibn_kathir", "jalalayn"];
  } catch {
    return ["ibn_kathir", "jalalayn"];
  }
}

export function setCompareSources(sources: TafsirSourceKey[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPARE_KEY, JSON.stringify(sources));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function addReadingHistory(surah: number, ayah: number): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const history: TafsirReadingHistoryItem[] = raw ? JSON.parse(raw) : [];
    const filtered = history.filter((h) => !(h.surah === surah && h.ayah === ayah));
    const updated = [{ surah, ayah, timestamp: Date.now() }, ...filtered].slice(0, 30);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // ignore
  }
}

export function getReadingHistory(): TafsirReadingHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useTafsirUserStore() {
  const [bookmarks, setBookmarks] = useState<TafsirBookmark[]>(getStoredBookmarks);
  const [notes, setNotes] = useState<Record<string, TafsirNote>>(getStoredNotes);
  const [compareSources, setCompareSourcesState] =
    useState<TafsirSourceKey[]>(getStoredCompareSources);
  const [history, setHistory] = useState<TafsirReadingHistoryItem[]>(getReadingHistory);

  useEffect(() => {
    const handleStoreChange = () => {
      setBookmarks(getStoredBookmarks());
      setNotes(getStoredNotes());
      setCompareSourcesState(getStoredCompareSources());
      setHistory(getReadingHistory());
    };

    window.addEventListener(EVENT_NAME, handleStoreChange);
    return () => window.removeEventListener(EVENT_NAME, handleStoreChange);
  }, []);

  return {
    bookmarks,
    notes,
    compareSources,
    history,
    saveBookmark: (b: Omit<TafsirBookmark, "id" | "createdAt">) => saveBookmark(b),
    isBookmarked: (surah: number, ayah: number, key: TafsirSourceKey) =>
      isBookmarked(surah, ayah, key),
    saveNote: (surah: number, ayah: number, text: string) => saveNote(surah, ayah, text),
    setCompareSources: (sources: TafsirSourceKey[]) => setCompareSources(sources),
    addReadingHistory: (surah: number, ayah: number) => addReadingHistory(surah, ayah),
  };
}
