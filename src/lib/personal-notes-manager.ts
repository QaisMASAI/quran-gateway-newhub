// Personal Notes Manager for Noor Al Quran
// Provides local offline fallback, search, tagging, and export for notes across Surahs, Hadiths, and Topics.

export interface UnifiedNote {
  id: string;
  sourceType: "surah" | "hadith" | "topic" | "general";
  title: string;
  reference: string; // e.g. "2:255" or "Hadith 10" or "Tafsir Ibn Kathir"
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const NOTES_KEY = "noor_unified_personal_notes_v1";

const INITIAL_NOTES: UnifiedNote[] = [
  {
    id: "note_1",
    sourceType: "surah",
    title: "Reflections on Surah Al-Fatiha (1:1-7)",
    reference: "1:1",
    body: "Al-Fatiha encompasses the essence of the Quran: praising Allah, affirming His Lordship & Mercy, recognizing the Day of Judgment, and seeking guidance on the Straight Path.",
    tags: ["Core Principles", "Reflection", "Fatiha"],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "note_2",
    sourceType: "hadith",
    title: "Notes on Intention (Niyyah)",
    reference: "Bukhari 1",
    body: "Every action is judged by its underlying intention. Sincerity (Ikhlas) purifies every daily deed into an act of worship.",
    tags: ["Hadith", "Sincerity", "Ethics"],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function getUnifiedNotes(): UnifiedNote[] {
  if (typeof window === "undefined") return INITIAL_NOTES;

  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) {
      localStorage.setItem(NOTES_KEY, JSON.stringify(INITIAL_NOTES));
      return INITIAL_NOTES;
    }
    return JSON.parse(raw) as UnifiedNote[];
  } catch {
    return INITIAL_NOTES;
  }
}

export function saveUnifiedNotes(notes: UnifiedNote[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error("Failed to save unified notes", e);
  }
}

export function createUnifiedNote(
  title: string,
  reference: string,
  body: string,
  sourceType: UnifiedNote["sourceType"] = "general",
  tags: string[] = ["General"],
): UnifiedNote[] {
  const notes = getUnifiedNotes();
  const newNote: UnifiedNote = {
    id: `note_${Date.now()}`,
    sourceType,
    title,
    reference,
    body,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = [newNote, ...notes];
  saveUnifiedNotes(updated);
  return updated;
}

export function updateUnifiedNote(
  noteId: string,
  updates: Partial<Omit<UnifiedNote, "id" | "createdAt">>,
): UnifiedNote[] {
  const notes = getUnifiedNotes();
  const updated = notes.map((n) =>
    n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n,
  );
  saveUnifiedNotes(updated);
  return updated;
}

export function deleteUnifiedNote(noteId: string): UnifiedNote[] {
  const notes = getUnifiedNotes();
  const updated = notes.filter((n) => n.id !== noteId);
  saveUnifiedNotes(updated);
  return updated;
}
