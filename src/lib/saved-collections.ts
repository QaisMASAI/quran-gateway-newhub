// Saved Collections Manager for Noor Al Quran
// Enables custom curated collections of Verses, Hadiths, Topics, and Duas.

export interface CollectionItem {
  id: string;
  type: "verse" | "hadith" | "topic" | "dua";
  reference: string; // e.g. "2:255" or "Bukhari 1" or "patience"
  title: string;
  snippet: string;
  addedAt: string;
}

export interface UserCollection {
  id: string;
  title: string;
  description: string;
  category: "study" | "dhikr" | "reflection" | "personal";
  iconName: string; // e.g. "BookMarked", "Heart", "Sparkles", "Shield"
  createdAt: string;
  items: CollectionItem[];
}

const COLLECTIONS_KEY = "noor_user_saved_collections_v1";

const DEFAULT_COLLECTIONS: UserCollection[] = [
  {
    id: "col_morning_adhkar",
    title: "Morning & Evening Safeguards",
    description: "Verses and authentic supplications for daily spiritual protection.",
    category: "dhikr",
    iconName: "ShieldCheck",
    createdAt: new Date().toISOString(),
    items: [
      {
        id: "item_ayat_kursi",
        type: "verse",
        reference: "2:255",
        title: "Ayat Al-Kursi (The Throne Verse)",
        snippet: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence...",
        addedAt: new Date().toISOString(),
      },
      {
        id: "item_ikhlas",
        type: "verse",
        reference: "112:1-4",
        title: "Surah Al-Ikhlas",
        snippet: "Say, He is Allah, [who is] One, Allah, the Eternal Refuge...",
        addedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "col_patience",
    title: "Patience in Adversity (Sabr)",
    description: "Quranic reflections and Prophetic traditions on resilience and faith.",
    category: "study",
    iconName: "Heart",
    createdAt: new Date().toISOString(),
    items: [
      {
        id: "item_sabr_2_153",
        type: "verse",
        reference: "2:153",
        title: "Seek Help Through Patience & Prayer",
        snippet: "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.",
        addedAt: new Date().toISOString(),
      },
      {
        id: "item_bukhari_sabr",
        type: "hadith",
        reference: "Sahih al-Bukhari 5641",
        title: "Patience at the First Shock",
        snippet: "True patience is at the first stroke of a calamity.",
        addedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "col_prophetic_wisdom",
    title: "Prophetic Ethics & Conduct",
    description: "Noble characteristics and moral guidance of the Prophet Muhammad (ﷺ).",
    category: "reflection",
    iconName: "Sparkles",
    createdAt: new Date().toISOString(),
    items: [
      {
        id: "item_ethics_68_4",
        type: "verse",
        reference: "68:4",
        title: "Exalted Character",
        snippet: "And indeed, you are of a great moral character.",
        addedAt: new Date().toISOString(),
      },
    ],
  },
];

export function getSavedCollections(): UserCollection[] {
  if (typeof window === "undefined") return DEFAULT_COLLECTIONS;

  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    if (!raw) {
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(DEFAULT_COLLECTIONS));
      return DEFAULT_COLLECTIONS;
    }
    return JSON.parse(raw) as UserCollection[];
  } catch {
    return DEFAULT_COLLECTIONS;
  }
}

export function saveCollections(collections: UserCollection[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  } catch (e) {
    console.error("Failed to save collections", e);
  }
}

export function createCollection(
  title: string,
  description: string,
  category: UserCollection["category"] = "personal",
  iconName: string = "BookMarked",
): UserCollection[] {
  const collections = getSavedCollections();
  const newCol: UserCollection = {
    id: `col_${Date.now()}`,
    title,
    description,
    category,
    iconName,
    createdAt: new Date().toISOString(),
    items: [],
  };
  const updated = [newCol, ...collections];
  saveCollections(updated);
  return updated;
}

export function addItemToCollection(
  collectionId: string,
  item: Omit<CollectionItem, "id" | "addedAt">,
): UserCollection[] {
  const collections = getSavedCollections();
  const updated = collections.map((col) => {
    if (col.id === collectionId) {
      const exists = col.items.some((i) => i.reference === item.reference);
      if (!exists) {
        return {
          ...col,
          items: [
            ...col.items,
            {
              ...item,
              id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              addedAt: new Date().toISOString(),
            },
          ],
        };
      }
    }
    return col;
  });
  saveCollections(updated);
  return updated;
}

export function removeItemFromCollection(
  collectionId: string,
  itemId: string,
): UserCollection[] {
  const collections = getSavedCollections();
  const updated = collections.map((col) => {
    if (col.id === collectionId) {
      return {
        ...col,
        items: col.items.filter((i) => i.id !== itemId),
      };
    }
    return col;
  });
  saveCollections(updated);
  return updated;
}

export function deleteCollection(collectionId: string): UserCollection[] {
  const collections = getSavedCollections();
  const updated = collections.filter((c) => c.id !== collectionId);
  saveCollections(updated);
  return updated;
}
