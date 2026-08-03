import { useState, useEffect } from "react";

export interface HadithUserCollection {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  items: Array<{
    collection_slug: string;
    num: number;
    title: string;
    addedAt: number;
  }>;
}

export interface HadithHighlight {
  color: "amber" | "emerald" | "sky" | "purple" | "rose";
  text?: string;
  updatedAt: number;
}

export interface HadithHistoryItem {
  collection_slug: string;
  num: number;
  title: string;
  timestamp: number;
}

export interface HadithReadingSettings {
  arabicFont: "amiri" | "uthmani" | "scheherazade" | "naskh";
  arabicFontSize: number;
  translationFontSize: number;
  lineSpacing: "normal" | "relaxed" | "loose";
  layoutMode: "stacked" | "side-by-side";
}

const DEFAULT_SETTINGS: HadithReadingSettings = {
  arabicFont: "amiri",
  arabicFontSize: 24,
  translationFontSize: 16,
  lineSpacing: "relaxed",
  layoutMode: "stacked",
};

const STORAGE_KEY_BOOKMARKS = "hadith_bookmarks_v1";
const STORAGE_KEY_NOTES = "hadith_notes_v1";
const STORAGE_KEY_HIGHLIGHTS = "hadith_highlights_v1";
const STORAGE_KEY_COLLECTIONS = "hadith_collections_v1";
const STORAGE_KEY_HISTORY = "hadith_history_v1";
const STORAGE_KEY_SETTINGS = "hadith_settings_v1";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

export function useHadithUserStore() {
  const [bookmarks, setBookmarks] = useState<Record<string, number>>(() => loadFromStorage(STORAGE_KEY_BOOKMARKS, {}));
  const [notes, setNotes] = useState<Record<string, string>>(() => loadFromStorage(STORAGE_KEY_NOTES, {}));
  const [highlights, setHighlights] = useState<Record<string, HadithHighlight>>(() =>
    loadFromStorage(STORAGE_KEY_HIGHLIGHTS, {}),
  );
  const [collections, setCollections] = useState<HadithUserCollection[]>(() =>
    loadFromStorage(STORAGE_KEY_COLLECTIONS, [
      {
        id: "default-1",
        name: "Daily Adhkar & Supplications",
        description: "Hadiths containing daily remembrance and prayers",
        createdAt: Date.now(),
        items: [],
      },
      {
        id: "default-2",
        name: "Core Character & Ethics (Adab)",
        description: "Essential traditions regarding good character and morals",
        createdAt: Date.now(),
        items: [],
      },
    ]),
  );
  const [history, setHistory] = useState<HadithHistoryItem[]>(() => loadFromStorage(STORAGE_KEY_HISTORY, []));
  const [settings, setSettings] = useState<HadithReadingSettings>(() =>
    loadFromStorage(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS),
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEY_BOOKMARKS, bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_NOTES, notes);
  }, [notes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_HIGHLIGHTS, highlights);
  }, [highlights]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_COLLECTIONS, collections);
  }, [collections]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_HISTORY, history);
  }, [history]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_SETTINGS, settings);
  }, [settings]);

  const makeKey = (collection_slug: string, num: number) => `${collection_slug}:${num}`;

  const isBookmarked = (collection_slug: string, num: number) => {
    return !!bookmarks[makeKey(collection_slug, num)];
  };

  const toggleBookmark = (collection_slug: string, num: number) => {
    const key = makeKey(collection_slug, num);
    setBookmarks((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = Date.now();
      }
      return next;
    });
  };

  const getNote = (collection_slug: string, num: number) => {
    return notes[makeKey(collection_slug, num)] || "";
  };

  const setNote = (collection_slug: string, num: number, noteText: string) => {
    const key = makeKey(collection_slug, num);
    setNotes((prev) => {
      const next = { ...prev };
      if (!noteText.trim()) {
        delete next[key];
      } else {
        next[key] = noteText;
      }
      return next;
    });
  };

  const getHighlight = (collection_slug: string, num: number) => {
    return highlights[makeKey(collection_slug, num)];
  };

  const setHighlight = (
    collection_slug: string,
    num: number,
    color: HadithHighlight["color"] | null,
    text?: string,
  ) => {
    const key = makeKey(collection_slug, num);
    setHighlights((prev) => {
      const next = { ...prev };
      if (!color) {
        delete next[key];
      } else {
        next[key] = { color, text, updatedAt: Date.now() };
      }
      return next;
    });
  };

  const createCollection = (name: string, description?: string) => {
    const newColl: HadithUserCollection = {
      id: "coll-" + Date.now(),
      name,
      description,
      createdAt: Date.now(),
      items: [],
    };
    setCollections((prev) => [newColl, ...prev]);
  };

  const toggleInCollection = (collectionId: string, collection_slug: string, num: number, title: string) => {
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== collectionId) return c;
        const exists = c.items.some((i) => i.collection_slug === collection_slug && i.num === num);
        const newItems = exists
          ? c.items.filter((i) => !(i.collection_slug === collection_slug && i.num === num))
          : [{ collection_slug, num, title, addedAt: Date.now() }, ...c.items];
        return { ...c, items: newItems };
      }),
    );
  };

  const recordHistory = (collection_slug: string, num: number, title: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((i) => !(i.collection_slug === collection_slug && i.num === num));
      return [{ collection_slug, num, title, timestamp: Date.now() }, ...filtered].slice(0, 50);
    });
  };

  const updateSettings = (partial: Partial<HadithReadingSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    notes,
    getNote,
    setNote,
    highlights,
    getHighlight,
    setHighlight,
    collections,
    createCollection,
    toggleInCollection,
    history,
    recordHistory,
    settings,
    updateSettings,
  };
}
