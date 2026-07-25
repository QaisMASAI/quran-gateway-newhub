import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  Gamepad2,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  RotateCcw,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Sticker,
  Trophy,
  Unlock,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/kids")({
  head: () => ({
    meta: [
      { title: "Kids Zone — Quran Quizzes, Games & Rewards | Noor" },
      { name: "description", content: "Fun Quran quizzes and games for kids with accessibility tools, a rewards store, parent mode, and cross-device sync." },
      { property: "og:title", content: "Kids Zone — Quran Quizzes, Games & Rewards" },
      { property: "og:description", content: "Play, learn, earn stars, unlock stickers and surah cards. Parent-approved. Accessible." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KidsPage,
});

type Difficulty = 1 | 2 | 3;
type QuestionKind = "mcq" | "interactive";
type Question = {
  id?: string;
  q: string;
  options: string[];
  answer: number;
  hint?: string;
  difficulty?: Difficulty;
  kind?: QuestionKind;
  expectedAnswer?: string;
};
type Quiz = {
  id: string; title: string; emoji: string; age: "kids" | "young";
  color: string; description: string; questions: Question[];
};
type QuizProgress = { best: number; total: number; stars: number; attempts: number };
type Rewards = { stars: number; unlocked: string[]; spent: number };
type Settings = {
  fontScale: number;
  tts: boolean;
  parentPinHash: string | null;
  parentPinRecoveryHash: string | null;
  maxDifficulty: Difficulty;
  allowedCategories: string[];
};
type Activity = { at: number; quizId: string; correct: number; total: number };
type StateBag = {
  progress: Record<string, QuizProgress>;
  rewards: Rewards;
  settings: Settings;
  activity: Activity[];
};
type ChildProfile = {
  id: string;
  name: string;
  avatarEmoji: string;
  ageGroup: "kids" | "young";
  difficultyLimit: Difficulty;
  isActive: boolean;
};

type PendingOperation =
  | {
      type: "upsert_progress";
      profileId: string;
      bag: StateBag;
      queuedAt: number;
    }
  | {
      type: "pin_audit";
      profileId: string;
      attemptType: "unlock" | "recover";
      success: boolean;
      failureReason?: string | null;
      queuedAt: number;
    };

type LocalCache = {
  profiles: ChildProfile[];
  selectedProfileId: string | null;
  profileBags: Record<string, StateBag>;
  pending: PendingOperation[];
};

const BUILTIN: Quiz[] = [
  {
    id: "prophets", title: "Prophets of the Qur'an", emoji: "🕌", age: "kids",
    color: "from-emerald-400 to-teal-500", description: "Meet the prophets mentioned in the Holy Qur'an.",
    questions: [
      { q: "Which prophet built the Ka'bah with his son Ismail?", options: ["Musa", "Ibrahim", "Isa", "Nuh"], answer: 1, hint: "He is called Khalilullah.", difficulty: 1 },
      { q: "Which prophet built a large ark for the flood?", options: ["Nuh", "Yusuf", "Dawud", "Sulayman"], answer: 0, difficulty: 1 },
      { q: "To which prophet was the Qur'an revealed?", options: ["Isa", "Musa", "Muhammad ﷺ", "Ibrahim"], answer: 2, difficulty: 1 },
      { q: "Which prophet understood the language of birds?", options: ["Yunus", "Sulayman", "Yaqub", "Adam"], answer: 1, difficulty: 2 },
      { q: "Which prophet was swallowed by a big fish?", options: ["Yunus", "Musa", "Idris", "Harun"], answer: 0, difficulty: 1 },
    ],
  },
  {
    id: "surahs", title: "Short Surahs", emoji: "📖", age: "kids",
    color: "from-amber-400 to-orange-500", description: "Learn about the short surahs you recite in prayer.",
    questions: [
      { q: "How many verses in Surah Al-Fatiha?", options: ["5", "6", "7", "10"], answer: 2, difficulty: 1 },
      { q: "Which surah is called 'the heart of the Qur'an'?", options: ["Al-Ikhlas", "Ya-Sin", "Al-Kahf", "Al-Mulk"], answer: 1, difficulty: 2 },
      { q: "Surah Al-Ikhlas talks about…", options: ["Story of Musa", "The Oneness of Allah", "The Day of Judgement", "Paradise"], answer: 1, difficulty: 1 },
      { q: "How many surahs are in the Qur'an?", options: ["99", "114", "120", "100"], answer: 1, difficulty: 1 },
      { q: "Which surah begins 'Qul a'udhu bi rabbin-nas'?", options: ["Al-Falaq", "Al-Nas", "Al-Kawthar", "Al-Asr"], answer: 1, difficulty: 2 },
    ],
  },
  {
    id: "values", title: "Good Manners & Values", emoji: "💛", age: "kids",
    color: "from-pink-400 to-rose-500", description: "The beautiful manners the Qur'an teaches us.",
    questions: [
      { q: "Speak to parents with…", options: ["Loud voice", "Kind gentle words", "Silence", "Anger"], answer: 1, difficulty: 1 },
      { q: "What do you say before eating?", options: ["Alhamdulillah", "Bismillah", "SubhanAllah", "Ameen"], answer: 1, difficulty: 1 },
      { q: "Someone gives you a gift — say…", options: ["JazakAllah khayr / Thank you", "Nothing", "Give it back", "Sorry"], answer: 0, difficulty: 1 },
      { q: "Being patient is called…", options: ["Shukr", "Sabr", "Tawbah", "Iman"], answer: 1, difficulty: 2 },
    ],
  },
  {
    id: "young", title: "Qur'an for Young Learners", emoji: "🌟", age: "young",
    color: "from-indigo-400 to-purple-500", description: "A slightly deeper challenge for teens and young learners.",
    questions: [
      { q: "The word 'Tafsir' means…", options: ["Recitation", "Translation", "Explanation of the Qur'an", "Memorization"], answer: 2, difficulty: 2 },
      { q: "Asbab al-Nuzul refers to…", options: ["Occasions of revelation of verses", "Names of reciters", "Hadith chapters", "Pillars of prayer"], answer: 0, difficulty: 3 },
      { q: "Longest surah in the Qur'an?", options: ["Al-Kahf", "Al-Baqarah", "Al-Imran", "An-Nisa"], answer: 1, difficulty: 2 },
      { q: "Sahih al-Bukhari is a collection of…", options: ["Poems", "Tafsir", "Authentic Hadith", "Prophet biographies"], answer: 2, difficulty: 2 },
      { q: "The Night Journey of the Prophet ﷺ is called…", options: ["Hijrah", "Isra & Mi'raj", "Ghazwah", "Umrah"], answer: 1, difficulty: 3 },
      { q: "The Qur'an was revealed over…", options: ["10 years", "23 years", "40 years", "5 years"], answer: 1, difficulty: 2 },
    ],
  },
];

type RewardItem = {
  id: string; name: string; cost: number; emoji: string; kind: "sticker" | "card";
  description: string;
};
const REWARDS: RewardItem[] = [
  { id: "sticker-star", name: "Golden Star Sticker", cost: 2, emoji: "⭐", kind: "sticker", description: "A shiny star for your collection." },
  { id: "sticker-moon", name: "Crescent Moon Sticker", cost: 3, emoji: "🌙", kind: "sticker", description: "Beautiful crescent moon." },
  { id: "sticker-mosque", name: "Mosque Sticker", cost: 4, emoji: "🕌", kind: "sticker", description: "A little mosque for your board." },
  { id: "card-fatiha", name: "Surah Al-Fatiha Card", cost: 5, emoji: "📜", kind: "card", description: "The Opening — 7 verses with meaning." },
  { id: "card-ikhlas", name: "Surah Al-Ikhlas Card", cost: 5, emoji: "📜", kind: "card", description: "Sincerity — the Oneness of Allah." },
  { id: "card-falaq", name: "Surah Al-Falaq Card", cost: 6, emoji: "📜", kind: "card", description: "Seeking refuge in the Lord of daybreak." },
  { id: "card-nas", name: "Surah An-Nas Card", cost: 6, emoji: "📜", kind: "card", description: "Seeking refuge in the Lord of mankind." },
  { id: "sticker-champion", name: "Champion Badge", cost: 10, emoji: "🏆", kind: "sticker", description: "For true champions of knowledge!" },
];

const CARD_CONTENT: Record<string, { title: string; arabic: string; english: string }> = {
  "card-fatiha": {
    title: "Al-Fatiha — The Opening",
    arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ • ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ • ٱلرَّحْمَٰنِ ٱلرَّحِيمِ • مَٰلِكِ يَوْمِ ٱلدِّينِ • إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ • ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ • صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
    english: "In the name of Allah, the Most Gracious, the Most Merciful. All praise is for Allah — Lord of all worlds…",
  },
  "card-ikhlas": {
    title: "Al-Ikhlas — Sincerity",
    arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ • ٱللَّهُ ٱلصَّمَدُ • لَمْ يَلِدْ وَلَمْ يُولَدْ • وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
    english: "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.",
  },
  "card-falaq": {
    title: "Al-Falaq — The Daybreak",
    arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ • مِن شَرِّ مَا خَلَقَ …",
    english: "Say: I seek refuge in the Lord of daybreak, from the evil of that which He created…",
  },
  "card-nas": {
    title: "An-Nas — Mankind",
    arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ • مَلِكِ ٱلنَّاسِ • إِلَٰهِ ٱلنَّاسِ …",
    english: "Say: I seek refuge in the Lord of mankind, the King of mankind, the God of mankind…",
  },
};

const STORAGE_KEY = "noor:kids:state:v3";
const GUEST_PROFILE_ID = "guest-profile";

const defaultState: StateBag = {
  progress: {}, rewards: { stars: 0, unlocked: [], spent: 0 },
  settings: {
    fontScale: 1,
    tts: false,
    parentPinHash: null,
    parentPinRecoveryHash: null,
    maxDifficulty: 3,
    allowedCategories: [],
  },
  activity: [],
};

const guestProfile: ChildProfile = {
  id: GUEST_PROFILE_ID,
  name: "Guest Child",
  avatarEmoji: "🧒",
  ageGroup: "kids",
  difficultyLimit: 3,
  isActive: true,
};

function mergeStateBag(source?: Partial<StateBag>): StateBag {
  return {
    progress: source?.progress ?? {},
    rewards: {
      stars: source?.rewards?.stars ?? 0,
      unlocked: source?.rewards?.unlocked ?? [],
      spent: source?.rewards?.spent ?? 0,
    },
    settings: {
      fontScale: source?.settings?.fontScale ?? 1,
      tts: source?.settings?.tts ?? false,
      parentPinHash: source?.settings?.parentPinHash ?? null,
      parentPinRecoveryHash: source?.settings?.parentPinRecoveryHash ?? null,
      maxDifficulty: source?.settings?.maxDifficulty ?? 3,
      allowedCategories: source?.settings?.allowedCategories ?? [],
    },
    activity: source?.activity ?? [],
  };
}

function loadLocalCache(): LocalCache {
  if (typeof window === "undefined") {
    return {
      profiles: [guestProfile],
      selectedProfileId: GUEST_PROFILE_ID,
      profileBags: { [GUEST_PROFILE_ID]: defaultState },
      pending: [],
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        profiles: [guestProfile],
        selectedProfileId: GUEST_PROFILE_ID,
        profileBags: { [GUEST_PROFILE_ID]: defaultState },
        pending: [],
      };
    }
    const parsed = JSON.parse(raw) as Partial<LocalCache>;
    const profiles = parsed.profiles?.length ? parsed.profiles : [guestProfile];
    const selectedProfileId = parsed.selectedProfileId ?? profiles[0]?.id ?? GUEST_PROFILE_ID;
    const profileBags = Object.fromEntries(
      profiles.map((profile) => [profile.id, mergeStateBag(parsed.profileBags?.[profile.id])]),
    );
    return { profiles, selectedProfileId, profileBags, pending: parsed.pending ?? [] };
  } catch {
    return {
      profiles: [guestProfile],
      selectedProfileId: GUEST_PROFILE_ID,
      profileBags: { [GUEST_PROFILE_ID]: defaultState },
      pending: [],
    };
  }
}

function saveLocalCache(cache: LocalCache) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // noop
  }
}

async function hashPin(pin: string): Promise<string> {
  const enc = new TextEncoder().encode(`noor-kids:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function speak(text: string, enabled: boolean) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  } catch { /* noop */ }
}

function useKidsPlatform(userId: string | null) {
  const [loaded, setLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  const [profiles, setProfiles] = useState<ChildProfile[]>([guestProfile]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(GUEST_PROFILE_ID);
  const [profileBags, setProfileBags] = useState<Record<string, StateBag>>({
    [GUEST_PROFILE_ID]: defaultState,
  });
  const [pending, setPending] = useState<PendingOperation[]>([]);
  const [customQuizzes, setCustomQuizzes] = useState<Quiz[]>([]);
  const initialized = useRef(false);

  const saveCache = useCallback(
    (
      nextProfiles: ChildProfile[],
      nextSelectedProfileId: string,
      nextBags: Record<string, StateBag>,
      nextPending: PendingOperation[],
    ) => {
      saveLocalCache({
        profiles: nextProfiles,
        selectedProfileId: nextSelectedProfileId,
        profileBags: nextBags,
        pending: nextPending,
      });
    },
    [],
  );

  const queueProgressSync = useCallback(
    (profileId: string, bag: StateBag) => {
      setPending((previous) => {
        const filtered = previous.filter(
          (item) => !(item.type === "upsert_progress" && item.profileId === profileId),
        );
        const nextPending: PendingOperation[] = [
          ...filtered,
          {
            type: "upsert_progress",
            profileId,
            bag,
            queuedAt: Date.now(),
          },
        ];
        saveCache(profiles, selectedProfileId, profileBags, nextPending);
        return nextPending;
      });
    },
    [profileBags, profiles, saveCache, selectedProfileId],
  );

  const queuePinAudit = useCallback(
    (
      profileId: string,
      attemptType: "unlock" | "recover",
      success: boolean,
      failureReason?: string | null,
    ) => {
      setPending((previous) => {
        const nextPending: PendingOperation[] = [
          ...previous,
          { type: "pin_audit", profileId, attemptType, success, failureReason: failureReason ?? null, queuedAt: Date.now() },
        ];
        saveCache(profiles, selectedProfileId, profileBags, nextPending);
        return nextPending;
      });
    },
    [profileBags, profiles, saveCache, selectedProfileId],
  );

  const flushPending = useCallback(async () => {
    if (!userId || !isOnline || pending.length === 0) return;
    const remaining: PendingOperation[] = [];

    for (const operation of pending) {
      if (operation.type === "upsert_progress") {
        const result = await supabase.from("kids_profile_progress").upsert(
          {
            user_id: userId,
            profile_id: operation.profileId,
            progress: operation.bag.progress,
            rewards: operation.bag.rewards,
            settings: {
              fontScale: operation.bag.settings.fontScale,
              tts: operation.bag.settings.tts,
              maxDifficulty: operation.bag.settings.maxDifficulty,
              allowedCategories: operation.bag.settings.allowedCategories,
            },
            activity_log: operation.bag.activity.slice(-200),
            parent_pin_hash: operation.bag.settings.parentPinHash,
            parent_pin_recovery_hash: operation.bag.settings.parentPinRecoveryHash,
          },
          { onConflict: "profile_id" },
        );
        if (result.error) remaining.push(operation);
      } else {
        const result = await supabase.from("kids_pin_audit_logs").insert({
          user_id: userId,
          profile_id: operation.profileId,
          attempt_type: operation.attemptType,
          success: operation.success,
          failure_reason: operation.failureReason ?? null,
          user_agent: typeof navigator === "undefined" ? null : navigator.userAgent,
        });
        if (result.error) remaining.push(operation);
      }
    }

    setPending(remaining);
    saveCache(profiles, selectedProfileId, profileBags, remaining);
  }, [isOnline, pending, profileBags, profiles, saveCache, selectedProfileId, userId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const local = loadLocalCache();
      if (cancelled) return;

      setProfiles(local.profiles);
      setSelectedProfileId(local.selectedProfileId ?? local.profiles[0]?.id ?? GUEST_PROFILE_ID);
      setProfileBags(local.profileBags);
      setPending(local.pending);

      if (userId && isOnline) {
        const [{ data: profileRows }, { data: progressRows }] = await Promise.all([
          supabase
            .from("kids_profiles")
            .select("id, name, avatar_emoji, age_group, difficulty_limit, is_active")
            .order("created_at", { ascending: true }),
          supabase
            .from("kids_profile_progress")
            .select(
              "profile_id, progress, rewards, settings, activity_log, parent_pin_hash, parent_pin_recovery_hash",
            ),
        ]);

        if (cancelled) return;

        let normalizedProfiles: ChildProfile[] =
          profileRows?.map((profile) => ({
            id: profile.id,
            name: profile.name,
            avatarEmoji: profile.avatar_emoji,
            ageGroup: profile.age_group as "kids" | "young",
            difficultyLimit: Math.max(1, Math.min(3, profile.difficulty_limit)) as Difficulty,
            isActive: profile.is_active,
          })) ?? [];

        if (normalizedProfiles.length === 0) {
          const { data: createdProfile } = await supabase
            .from("kids_profiles")
            .insert({
              user_id: userId,
              name: "Child 1",
              avatar_emoji: "🧒",
              age_group: "kids",
              difficulty_limit: 2,
              is_active: true,
            })
            .select("id, name, avatar_emoji, age_group, difficulty_limit, is_active")
            .single();

          if (createdProfile) {
            normalizedProfiles = [
              {
                id: createdProfile.id,
                name: createdProfile.name,
                avatarEmoji: createdProfile.avatar_emoji,
                ageGroup: createdProfile.age_group as "kids" | "young",
                difficultyLimit: Math.max(1, Math.min(3, createdProfile.difficulty_limit)) as Difficulty,
                isActive: createdProfile.is_active,
              },
            ];
          }
        }

        const nextBags: Record<string, StateBag> = {};
        for (const profile of normalizedProfiles) {
          const row = progressRows?.find((item) => item.profile_id === profile.id);
          const localBag = local.profileBags[profile.id];
          nextBags[profile.id] = mergeStateBag({
            progress: (row?.progress as StateBag["progress"] | undefined) ?? localBag?.progress,
            rewards: (row?.rewards as Rewards | undefined) ?? localBag?.rewards,
            settings: {
              ...(localBag?.settings ?? defaultState.settings),
              ...((row?.settings as Partial<Settings> | undefined) ?? {}),
              maxDifficulty: profile.difficultyLimit,
              parentPinHash:
                (row?.parent_pin_hash as string | null | undefined) ??
                localBag?.settings.parentPinHash ??
                null,
              parentPinRecoveryHash:
                (row?.parent_pin_recovery_hash as string | null | undefined) ??
                localBag?.settings.parentPinRecoveryHash ??
                null,
            },
            activity: (row?.activity_log as Activity[] | undefined) ?? localBag?.activity,
          });
        }

        const nextSelected =
          normalizedProfiles.find((p) => p.id === local.selectedProfileId)?.id ??
          normalizedProfiles[0]?.id ??
          GUEST_PROFILE_ID;

        setProfiles(normalizedProfiles);
        setSelectedProfileId(nextSelected);
        setProfileBags(nextBags);
        saveCache(normalizedProfiles, nextSelected, nextBags, local.pending);
      } else {
        const guestBags = local.profileBags[GUEST_PROFILE_ID] ?? defaultState;
        setProfiles([guestProfile]);
        setSelectedProfileId(GUEST_PROFILE_ID);
        setProfileBags({ [GUEST_PROFILE_ID]: guestBags });
        saveCache([guestProfile], GUEST_PROFILE_ID, { [GUEST_PROFILE_ID]: guestBags }, local.pending);
      }

      setLoaded(true);
      initialized.current = true;
    })();

    supabase
      .from("kids_questions")
      .select("*")
      .eq("published", true)
      .then(({ data }) => {
      if (cancelled || !data?.length) return;
      const grouped = new Map<string, Question[]>();
      for (const row of data as Array<{
        category: string;
        age_group: string;
        difficulty: number;
        question: string;
        options: unknown;
        answer_index: number;
        hint: string | null;
        id: string;
        question_kind: string;
        expected_answer: string | null;
      }>) {
        const key = `${row.category}::${row.age_group}`;
        const arr = grouped.get(key) ?? [];
        arr.push({
          id: row.id, q: row.question,
          options: Array.isArray(row.options) ? row.options as string[] : [],
          answer: row.answer_index, hint: row.hint ?? undefined,
          difficulty: (Math.max(1, Math.min(3, row.difficulty)) as Difficulty),
          kind: row.question_kind === "interactive" ? "interactive" : "mcq",
          expectedAnswer: row.expected_answer ?? undefined,
        });
        grouped.set(key, arr);
      }
      const extras: Quiz[] = [];
      for (const [key, questions] of grouped.entries()) {
        const [category, age] = key.split("::");
        if (BUILTIN.some(b => b.id === category)) continue;
        extras.push({
          id: category, age: (age as "kids" | "young"), title: category, emoji: "🧩",
          color: "from-cyan-400 to-blue-500", description: "Admin-added quiz.", questions,
        });
      }
      setCustomQuizzes(extras);
    });

    return () => { cancelled = true; };
  }, [isOnline, saveCache, userId]);

  useEffect(() => {
    if (!loaded || !initialized.current) return;
    saveCache(profiles, selectedProfileId, profileBags, pending);
  }, [loaded, pending, profileBags, profiles, saveCache, selectedProfileId]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    void flushPending();
  }, [flushPending]);

  const updateProfileBag = useCallback(
    (profileId: string, updater: (prev: StateBag) => StateBag) => {
      setProfileBags((previous) => {
        const current = previous[profileId] ?? defaultState;
        const nextBag = updater(current);
        const nextMap = { ...previous, [profileId]: nextBag };
        if (userId) queueProgressSync(profileId, nextBag);
        return nextMap;
      });
    },
    [queueProgressSync, userId],
  );

  const createProfile = useCallback(
    async (name: string, ageGroup: "kids" | "young", avatarEmoji: string) => {
      if (!userId || !isOnline) return;
      const { data } = await supabase
        .from("kids_profiles")
        .insert({
          user_id: userId,
          name,
          age_group: ageGroup,
          avatar_emoji: avatarEmoji,
          difficulty_limit: ageGroup === "kids" ? 2 : 3,
          is_active: true,
        })
        .select("id, name, avatar_emoji, age_group, difficulty_limit, is_active")
        .single();

      if (!data) return;
      const profile: ChildProfile = {
        id: data.id,
        name: data.name,
        avatarEmoji: data.avatar_emoji,
        ageGroup: data.age_group as "kids" | "young",
        difficultyLimit: Math.max(1, Math.min(3, data.difficulty_limit)) as Difficulty,
        isActive: data.is_active,
      };

      setProfiles((previous) => [...previous, profile]);
      setSelectedProfileId(profile.id);
      setProfileBags((previous) => ({ ...previous, [profile.id]: mergeStateBag() }));
      queueProgressSync(profile.id, mergeStateBag());
    },
    [isOnline, queueProgressSync, userId],
  );

  const updateProfile = useCallback(
    async (profile: ChildProfile) => {
      if (!userId || !isOnline) {
        setProfiles((previous) => previous.map((item) => (item.id === profile.id ? profile : item)));
        return;
      }
      await supabase
        .from("kids_profiles")
        .update({
          name: profile.name,
          avatar_emoji: profile.avatarEmoji,
          age_group: profile.ageGroup,
          difficulty_limit: profile.difficultyLimit,
          is_active: profile.isActive,
        })
        .eq("id", profile.id);
      setProfiles((previous) => previous.map((item) => (item.id === profile.id ? profile : item)));
    },
    [isOnline, userId],
  );

  const deleteProfile = useCallback(
    async (profileId: string) => {
      if (profiles.length <= 1) return;
      if (userId && isOnline) {
        await supabase.from("kids_profiles").delete().eq("id", profileId);
      }
      const nextProfiles = profiles.filter((item) => item.id !== profileId);
      const nextSelected =
        selectedProfileId === profileId ? nextProfiles[0]?.id ?? GUEST_PROFILE_ID : selectedProfileId;
      const nextBags = Object.fromEntries(
        Object.entries(profileBags).filter(([profileKey]) => profileKey !== profileId),
      );
      setProfiles(nextProfiles);
      setSelectedProfileId(nextSelected);
      setProfileBags(nextBags);
      setPending((previous) => previous.filter((item) => item.profileId !== profileId));
    },
    [isOnline, profileBags, profiles, selectedProfileId, userId],
  );

  return {
    loaded,
    isOnline,
    profiles,
    selectedProfileId,
    setSelectedProfileId,
    profileBags,
    updateProfileBag,
    createProfile,
    updateProfile,
    deleteProfile,
    customQuizzes,
    pendingCount: pending.length,
    logPinAttempt: queuePinAudit,
  };
}

function KidsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const {
    loaded,
    isOnline,
    profiles,
    selectedProfileId,
    setSelectedProfileId,
    profileBags,
    updateProfileBag,
    createProfile,
    updateProfile,
    deleteProfile,
    customQuizzes,
    pendingCount,
    logPinAttempt,
  } = useKidsPlatform(userId);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<"home" | "store" | "parent" | "summary">("home");
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState<"kids" | "young">("kids");
  const [newChildAvatar, setNewChildAvatar] = useState("🧒");

  const selectedProfile =
    profiles.find((profile) => profile.id === selectedProfileId) ?? profiles[0] ?? guestProfile;
  const state = profileBags[selectedProfile.id] ?? defaultState;
  const setState = (updater: (prev: StateBag) => StateBag) => updateProfileBag(selectedProfile.id, updater);

  const allQuizzes = useMemo(() => [...BUILTIN, ...customQuizzes], [customQuizzes]);
  const visibleQuizzes = useMemo(() => {
    return allQuizzes.filter(q =>
      state.settings.allowedCategories.length === 0 || state.settings.allowedCategories.includes(q.id)
    );
  }, [allQuizzes, state.settings.allowedCategories]);

  const active = visibleQuizzes.find(q => q.id === activeId) ?? null;

  const applyResult = useCallback((quizId: string, correct: number, total: number) => {
    const stars = correct === total ? 3 : correct >= Math.ceil(total * 0.7) ? 2 : correct > 0 ? 1 : 0;
    setState(prev => {
      const prior = prev.progress[quizId];
      const bestStars = Math.max(prior?.stars ?? 0, stars);
      const gained = Math.max(0, stars - (prior?.stars ?? 0));
      return {
        ...prev,
        progress: { ...prev.progress, [quizId]: {
          best: Math.max(prior?.best ?? 0, correct), total, stars: bestStars,
          attempts: (prior?.attempts ?? 0) + 1,
        } },
        rewards: { ...prev.rewards, stars: prev.rewards.stars + gained },
        activity: [...prev.activity, { at: Date.now(), quizId, correct, total }].slice(-100),
      };
    });
  }, [setState]);

  const buyReward = useCallback((item: RewardItem) => {
    setState(prev => {
      if (prev.rewards.stars < item.cost) return prev;
      if (prev.rewards.unlocked.includes(item.id)) return prev;
      return {
        ...prev,
        rewards: {
          stars: prev.rewards.stars - item.cost,
          spent: prev.rewards.spent + item.cost,
          unlocked: [...prev.rewards.unlocked, item.id],
        },
      };
    });
  }, [setState]);

  const scale = state.settings.fontScale;

  if (!loaded) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30" style={{ fontSize: `${scale}rem` }}>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            {isOnline ? <Wifi className="h-4 w-4 text-emerald-600" /> : <WifiOff className="h-4 w-4 text-amber-600" />}
            {isOnline ? "Online" : "Offline"}
          </span>
          <span>
            {isOnline
              ? pendingCount > 0
                ? `Syncing ${pendingCount} pending update(s)…`
                : "All progress synced"
              : `Offline mode active — ${pendingCount} update(s) queued`}
          </span>
        </div>

        <TopBar
          state={state} setState={setState}
          view={view} setView={setView}
          hasActive={!!active} onExit={() => setActiveId(null)}
          user={!!userId}
          profiles={profiles}
          selectedProfileId={selectedProfile.id}
          onSelectProfile={(id) => {
            setSelectedProfileId(id);
            setActiveId(null);
          }}
          onToggleCreateProfile={() => setShowCreateProfile((prev) => !prev)}
        />

        {showCreateProfile && userId ? (
          <section className="mb-6 rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Add child profile</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                value={newChildName}
                onChange={(event) => setNewChildName(event.target.value)}
                placeholder="Child name"
              />
              <Input
                value={newChildAvatar}
                onChange={(event) => setNewChildAvatar(event.target.value.slice(0, 2))}
                placeholder="Avatar emoji"
              />
              <select
                value={newChildAge}
                onChange={(event) => setNewChildAge(event.target.value as "kids" | "young")}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="kids">Kids</option>
                <option value="young">Young</option>
              </select>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                onClick={async () => {
                  const normalizedName = newChildName.trim();
                  if (!normalizedName) return;
                  await createProfile(normalizedName, newChildAge, newChildAvatar.trim() || "🧒");
                  setNewChildName("");
                  setNewChildAvatar("🧒");
                  setNewChildAge("kids");
                  setShowCreateProfile(false);
                }}
                size="sm"
              >
                Save profile
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateProfile(false)}>
                Cancel
              </Button>
            </div>
          </section>
        ) : null}

        {view === "parent" ? (
          <ParentZone
            state={state}
            setState={setState}
            quizzes={allQuizzes}
            profileId={selectedProfile.id}
            onPinAudit={logPinAttempt}
            onExit={() => setView("home")}
          />
        ) : view === "store" ? (
          <RewardStore state={state} buy={buyReward} onExit={() => setView("home")} />
        ) : view === "summary" ? (
          <SummaryScreen state={state} quizzes={allQuizzes} onExit={() => setView("home")} />
        ) : !active ? (
          <QuizPicker state={state} quizzes={visibleQuizzes} onPick={setActiveId} onOpenStore={() => setView("store")} onOpenSummary={() => setView("summary")} />
        ) : (
          <QuizPlayer
              key={`${selectedProfile.id}:${active.id}:${state.settings.maxDifficulty}`}
            quiz={active}
            maxDifficulty={state.settings.maxDifficulty}
            tts={state.settings.tts}
            onExit={() => setActiveId(null)}
            onComplete={(c, t) => applyResult(active.id, c, t)}
          />
        )}

        {view === "summary" && userId ? (
          <section className="mt-6 rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Parent dashboard by child</h3>
              <span className="text-xs text-muted-foreground">Stars, progress, and unlocked content per child</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {profiles.map((profile) => {
                const bag = profileBags[profile.id] ?? defaultState;
                const earned = bag.rewards.stars + bag.rewards.spent;
                const done = Object.values(bag.progress).filter((item) => item.stars > 0).length;
                return (
                  <div key={profile.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-semibold">{profile.avatarEmoji} {profile.name}</p>
                      {profiles.length > 1 ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void deleteProfile(profile.id)}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-md bg-secondary px-2 py-1">Stars: {earned}</div>
                      <div className="rounded-md bg-secondary px-2 py-1">Quizzes: {done}</div>
                      <div className="rounded-md bg-secondary px-2 py-1">Rewards: {bag.rewards.unlocked.length}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function TopBar({
  state,
  setState,
  view,
  setView,
  hasActive,
  onExit,
  user,
  profiles,
  selectedProfileId,
  onSelectProfile,
  onToggleCreateProfile,
}: {
  state: StateBag;
  setState: (updater: (prev: StateBag) => StateBag) => void;
  view: string; setView: (v: "home" | "store" | "parent" | "summary") => void;
  hasActive: boolean; onExit: () => void; user: boolean;
  profiles: ChildProfile[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  onToggleCreateProfile: () => void;
}) {
  const bumpFont = (delta: number) =>
    setState(p => ({ ...p, settings: { ...p.settings, fontScale: Math.max(0.9, Math.min(1.6, +(p.settings.fontScale + delta).toFixed(2))) } }));
  const toggleTts = () => setState(p => ({ ...p, settings: { ...p.settings, tts: !p.settings.tts } }));

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Link to="/" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground" aria-label="Back to home">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Kids Zone</p>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Learn, Play, Earn Stars</h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Accessibility and navigation">
        <div className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-3 text-xs">
          <span>Child:</span>
          <select
            value={selectedProfileId}
            onChange={(event) => onSelectProfile(event.target.value)}
            className="bg-transparent text-sm"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.avatarEmoji} {profile.name}
              </option>
            ))}
          </select>
        </div>

        {user ? (
          <Button type="button" variant="outline" size="sm" onClick={onToggleCreateProfile}>
            <Plus className="h-4 w-4" /> Add child
          </Button>
        ) : null}

        <button type="button" onClick={() => bumpFont(-0.1)} aria-label="Decrease text size"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background hover:bg-accent">
          <ZoomOut className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => bumpFont(0.1)} aria-label="Increase text size"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background hover:bg-accent">
          <ZoomIn className="h-4 w-4" />
        </button>
        <button type="button" onClick={toggleTts} aria-pressed={state.settings.tts}
          aria-label={state.settings.tts ? "Turn off read-aloud" : "Turn on read-aloud"}
          className={`inline-flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium ${state.settings.tts ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-accent"}`}>
          {state.settings.tts ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span className="hidden sm:inline">Read aloud</span>
        </button>
        <button type="button" onClick={() => { onExit(); setView("store"); }}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-amber-400/40 bg-amber-100/60 px-3 text-sm font-semibold text-amber-900 hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-100">
          <ShoppingBag className="h-4 w-4" />
          <span>{state.rewards.stars} ⭐ Store</span>
        </button>
        {user && (
          <button type="button" onClick={() => { onExit(); setView("summary"); }}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-3 text-sm font-medium hover:bg-accent" aria-label="Summary">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">My progress</span>
          </button>
        )}
        <button type="button" onClick={() => { onExit(); setView("parent"); }}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-3 text-sm font-medium hover:bg-accent" aria-label="Parent mode">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Parents</span>
        </button>
        {hasActive && view === "home" && (
          <button type="button" onClick={onExit} className="inline-flex h-10 items-center gap-1 rounded-full border border-border bg-background px-3 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}
      </div>
    </header>
  );
}

function QuizPicker({
  state, quizzes, onPick, onOpenStore, onOpenSummary,
}: {
  state: StateBag; quizzes: Quiz[];
  onPick: (id: string) => void;
  onOpenStore: () => void; onOpenSummary: () => void;
}) {
  const kids = quizzes.filter(q => q.age === "kids");
  const young = quizzes.filter(q => q.age === "young");
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-emerald-500/10 via-amber-400/10 to-rose-400/10 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 text-4xl shadow-sm dark:bg-white/10">🌙</div>
          <div className="max-w-xl">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Play, learn, and earn stars!</h2>
            <p className="mt-1 text-sm text-muted-foreground">Answer questions to earn ⭐ then swap them in the store for stickers and surah cards.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={onOpenStore} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                <ShoppingBag className="h-4 w-4" /> Open rewards store
              </button>
              <button onClick={onOpenSummary} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-accent">
                <Trophy className="h-4 w-4" /> See my progress
              </button>
            </div>
          </div>
        </div>
        <BadgeRow state={state} />
      </section>
      <Section title="For Kids" icon={<Gamepad2 className="h-5 w-5" />}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kids.map(q => <QuizCard key={q.id} quiz={q} progress={state.progress[q.id]} onPick={() => onPick(q.id)} />)}
        </div>
      </Section>
      <Section title="For Young Learners" icon={<Sparkles className="h-5 w-5" />}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {young.map(q => <QuizCard key={q.id} quiz={q} progress={state.progress[q.id]} onPick={() => onPick(q.id)} />)}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
        <span className="text-primary">{icon}</span>{title}
      </h3>
      {children}
    </section>
  );
}

function QuizCard({ quiz, progress, onPick }: { quiz: Quiz; progress?: QuizProgress; onPick: () => void }) {
  return (
    <button type="button" onClick={onPick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 text-start transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${quiz.color} text-3xl shadow-md`}>
        <span>{quiz.emoji}</span>
      </div>
      <h4 className="text-base font-bold text-foreground">{quiz.title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{quiz.description}</p>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">{quiz.questions.length} questions</span>
        <StarRow count={progress?.stars ?? 0} />
      </div>
    </button>
  );
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} of 3 stars`}>
      {[0, 1, 2].map(i => (
        <Star key={i} className={`h-4 w-4 ${i < count ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

function BadgeRow({ state }: { state: StateBag }) {
  const totalStars = state.rewards.stars + state.rewards.spent;
  const completed = Object.values(state.progress).filter(p => (p?.stars ?? 0) > 0).length;
  const badges = [
    { id: "starter", label: "First Star", achieved: totalStars >= 1, emoji: "⭐" },
    { id: "explorer", label: "Explorer", achieved: completed >= 2, emoji: "🧭" },
    { id: "scholar", label: "Little Scholar", achieved: totalStars >= 6, emoji: "🎓" },
    { id: "champion", label: "Champion", achieved: totalStars >= 10, emoji: "🏆" },
    { id: "shopper", label: "First Reward", achieved: state.rewards.unlocked.length >= 1, emoji: "🎁" },
  ];
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {badges.map(b => (
        <div key={b.id} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
          b.achieved ? "border-amber-400/60 bg-amber-100/70 text-amber-900 dark:bg-amber-400/15 dark:text-amber-100"
                     : "border-border bg-muted/40 text-muted-foreground opacity-60"
        }`}>
          <span aria-hidden>{b.emoji}</span><span>{b.label}</span>
          {b.achieved && <Award className="h-3 w-3" />}
        </div>
      ))}
    </div>
  );
}

function QuizPlayer({
  quiz, maxDifficulty, tts, onExit, onComplete,
}: {
  quiz: Quiz; maxDifficulty: Difficulty; tts: boolean;
  onExit: () => void; onComplete: (correct: number, total: number) => void;
}) {
  const questions = useMemo(
    () => quiz.questions.filter(q => (q.difficulty ?? 1) <= maxDifficulty),
    [quiz, maxDifficulty]
  );
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const firstOptionRef = useRef<HTMLButtonElement | null>(null);

  const total = questions.length;
  const current = questions[idx];

  useEffect(() => {
    if (current) speak(current.q, tts);
    firstOptionRef.current?.focus();
  }, [current, tts]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current || finished) return;
      if (!locked && /^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (i < current.options.length) pick(i);
      } else if (locked && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault(); next();
      } else if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, locked, finished]);

  const pick = (i: number) => {
    if (locked || !current) return;
    setSelected(i); setLocked(true);
    const isRight = i === current.answer;
    if (isRight) setCorrect(c => c + 1);
    speak(isRight ? "Correct!" : `The correct answer is ${current.options[current.answer]}`, tts);
  };

  const submitInteractive = () => {
    if (locked || !current) return;
    const expected = (current.expectedAnswer ?? "").trim().toLowerCase();
    const actual = typedAnswer.trim().toLowerCase();
    const isRight = expected.length > 0 && actual === expected;
    setSelected(isRight ? 1 : 0);
    setLocked(true);
    if (isRight) setCorrect((count) => count + 1);
    speak(isRight ? "Correct!" : "Good try. Check the guidance and continue.", tts);
  };

  const next = () => {
    if (idx + 1 >= total) {
      setFinished(true);
      onComplete(correct, total);
      return;
    }
    setIdx(n => n + 1); setSelected(null); setLocked(false); setTypedAnswer("");
  };
  const restart = () => {
    setIdx(0);
    setSelected(null);
    setLocked(false);
    setCorrect(0);
    setFinished(false);
    setTypedAnswer("");
  };

  if (total === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <p className="text-lg font-semibold">No questions match the current difficulty.</p>
        <p className="mt-1 text-sm text-muted-foreground">Ask a parent to raise the difficulty in Parent Mode.</p>
        <button onClick={onExit} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Back</button>
      </div>
    );
  }

  if (finished || !current) {
    const stars = correct === total ? 3 : correct >= Math.ceil(total * 0.7) ? 2 : correct > 0 ? 1 : 0;
    const message = stars === 3 ? "Amazing! A perfect score! 🎉" : stars === 2 ? "Great job! Keep learning! 🌟" : stars === 1 ? "Good try — practice makes perfect." : "Keep going — every step counts.";
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-4xl shadow-lg">🏆</div>
        <h2 className="text-2xl font-bold">{quiz.title}</h2>
        <p className="mt-2 text-muted-foreground">{message}</p>
        <p className="mt-4 text-3xl font-bold text-primary">{correct} / {total}</p>
        <div className="mt-3 flex justify-center"><StarRow count={stars} /></div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={restart} autoFocus
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
          <button type="button" onClick={onExit}
            className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold hover:bg-accent">
            Choose another quiz
          </button>
        </div>
      </div>
    );
  }

  const pct = Math.round(((idx + (locked ? 1 : 0)) / total) * 100);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <button type="button" onClick={onExit} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Exit
        </button>
        <div className="text-sm font-semibold text-muted-foreground">Question {idx + 1} of {total}</div>
      </div>
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full bg-gradient-to-r ${quiz.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
        <span>{quiz.emoji}</span> {quiz.title}
      </div>
      <h2 className="text-xl font-bold sm:text-2xl">{current.q}</h2>
      <p className="mt-1 text-xs text-muted-foreground">Tip: press keys 1–{current.options.length} to answer, Enter for next, Esc to exit.</p>
      {current.kind === "interactive" ? (
        <div className="mt-6 rounded-xl border border-border bg-background p-4">
          <label className="text-sm font-medium" htmlFor="interactive-answer">
            Type your answer
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <Input
              id="interactive-answer"
              value={typedAnswer}
              onChange={(event) => setTypedAnswer(event.target.value)}
              placeholder="Write your answer"
              disabled={locked}
            />
            {!locked ? (
              <Button type="button" onClick={submitInteractive} disabled={!typedAnswer.trim()}>
                Check answer
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Answer options">
          {current.options.map((opt, i) => {
            const isCorrect = i === current.answer;
            const isPicked = i === selected;
            let cls = "flex items-center justify-between gap-3 rounded-2xl border-2 p-4 text-start text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
            if (!locked) cls += " border-border bg-background hover:border-primary/60 hover:bg-primary/5 cursor-pointer";
            else if (isCorrect) cls += " border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100";
            else if (isPicked) cls += " border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-100";
            else cls += " border-border bg-background/50 text-muted-foreground";
            return (
              <button key={i} ref={i === 0 ? firstOptionRef : undefined} type="button" role="radio"
                aria-checked={isPicked} onClick={() => pick(i)} disabled={locked} className={cls}>
                <span><kbd className="me-2 rounded bg-muted px-1.5 py-0.5 text-[10px]">{i + 1}</kbd>{opt}</span>
                {locked && isCorrect && <Check className="h-5 w-5 text-emerald-600" />}
                {locked && isPicked && !isCorrect && <X className="h-5 w-5 text-rose-600" />}
              </button>
            );
          })}
        </div>
      )}
      {locked && current.hint && selected !== current.answer && (
        <p className="mt-4 rounded-xl border border-amber-300/40 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">💡 {current.hint}</p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        {locked && selected !== current.answer && (
          <button type="button" onClick={restart}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent" aria-label="Retry quiz">
            <RotateCcw className="h-4 w-4" /> Retry
          </button>
        )}
        {locked && (
          <button type="button" onClick={next} autoFocus
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            {idx + 1 >= total ? "See results" : "Next question"}
          </button>
        )}
      </div>
    </div>
  );
}

function RewardStore({ state, buy, onExit }: { state: StateBag; buy: (item: RewardItem) => void; onExit: () => void }) {
  const [openCard, setOpenCard] = useState<string | null>(null);
  const opened = openCard ? CARD_CONTENT[openCard] : null;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to quizzes
        </button>
        <div className="rounded-full border border-amber-400/40 bg-amber-100/60 px-4 py-2 text-sm font-bold text-amber-900 dark:bg-amber-500/15 dark:text-amber-100">
          {state.rewards.stars} ⭐ available
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-gradient-to-br from-amber-100/40 to-rose-100/40 p-6 dark:from-amber-500/10 dark:to-rose-500/10">
        <h2 className="text-xl font-bold sm:text-2xl">🎁 Rewards Store</h2>
        <p className="mt-1 text-sm text-muted-foreground">Spend your stars to unlock stickers and short-surah cards. Rewards stay in your collection forever.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REWARDS.map(r => {
          const owned = state.rewards.unlocked.includes(r.id);
          const canBuy = !owned && state.rewards.stars >= r.cost;
          return (
            <div key={r.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-4xl" aria-hidden>{r.emoji}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${owned ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-800 dark:text-amber-200"}`}>
                  {owned ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {r.cost} ⭐
                </span>
              </div>
              <h4 className="text-base font-bold">{r.name}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
              <div className="mt-4 flex gap-2">
                {owned ? (
                  r.kind === "card" ? (
                    <button onClick={() => setOpenCard(r.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                      <BookOpen className="h-3 w-3" /> Open card
                    </button>
                  ) : (
                    <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      <Sticker className="h-3 w-3" /> In collection
                    </span>
                  )
                ) : (
                  <button onClick={() => buy(r)} disabled={!canBuy}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">
                    {canBuy ? "Redeem" : "Need more ⭐"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {state.rewards.unlocked.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-bold">My Collection</h3>
          <div className="flex flex-wrap gap-2">
            {state.rewards.unlocked.map(id => {
              const item = REWARDS.find(r => r.id === id);
              if (!item) return null;
              return (
                <span key={id} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
                  <span aria-hidden>{item.emoji}</span>{item.name}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {opened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" onClick={() => setOpenCard(null)}>
          <div className="max-w-lg rounded-3xl bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">{opened.title}</h3>
              <button onClick={() => setOpenCard(null)} className="rounded-full p-1 hover:bg-accent" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <p dir="rtl" lang="ar" className="text-xl leading-loose text-foreground" style={{ fontFamily: '"Noto Naskh Arabic", serif' }}>{opened.arabic}</p>
            <p className="mt-4 text-sm text-muted-foreground">{opened.english}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ParentZone({
  state,
  setState,
  quizzes,
  profileId,
  onPinAudit,
  onExit,
}: {
  state: StateBag;
  setState: (updater: (prev: StateBag) => StateBag) => void;
  quizzes: Quiz[];
  profileId: string;
  onPinAudit: (
    profileId: string,
    attemptType: "unlock" | "recover",
    success: boolean,
    failureReason?: string | null,
  ) => void;
  onExit: () => void;
}) {
  const [unlocked, setUnlocked] = useState(!state.settings.parentPinHash);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newRecovery, setNewRecovery] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryNewPin, setRecoveryNewPin] = useState("");

  const tryUnlock = async () => {
    if (!state.settings.parentPinHash) { setUnlocked(true); return; }
    const h = await hashPin(pinInput);
    if (h === state.settings.parentPinHash) {
      setUnlocked(true);
      setPinError("");
      onPinAudit(profileId, "unlock", true, null);
    } else {
      setPinError("Incorrect PIN.");
      onPinAudit(profileId, "unlock", false, "incorrect_pin");
    }
  };

  const setPin = async () => {
    if (newPin.length < 4) { setPinError("Use at least 4 digits."); return; }
    const [pinHash, recoveryHash] = await Promise.all([
      hashPin(newPin),
      newRecovery.trim() ? hashPin(newRecovery.trim()) : Promise.resolve<string | null>(null),
    ]);
    setState(p => ({
      ...p,
      settings: {
        ...p.settings,
        parentPinHash: pinHash,
        parentPinRecoveryHash: recoveryHash ?? p.settings.parentPinRecoveryHash,
      },
    }));
    setNewPin(""); setPinError("PIN saved.");
  };

  const clearPin = () => setState(p => ({ ...p, settings: { ...p.settings, parentPinHash: null, parentPinRecoveryHash: null } }));

  const recoverPin = async () => {
    if (!state.settings.parentPinRecoveryHash) {
      setPinError("No recovery code set yet.");
      onPinAudit(profileId, "recover", false, "no_recovery_code_set");
      return;
    }
    const [providedRecovery, providedPin] = await Promise.all([
      hashPin(recoveryCode.trim()),
      hashPin(recoveryNewPin.trim()),
    ]);
    if (providedRecovery !== state.settings.parentPinRecoveryHash) {
      setPinError("Recovery code is not correct.");
      onPinAudit(profileId, "recover", false, "invalid_recovery_code");
      return;
    }
    if (recoveryNewPin.trim().length < 4) {
      setPinError("New PIN must be at least 4 digits.");
      onPinAudit(profileId, "recover", false, "new_pin_too_short");
      return;
    }
    setState((previous) => ({
      ...previous,
      settings: {
        ...previous.settings,
        parentPinHash: providedPin,
      },
    }));
    setRecoveryCode("");
    setRecoveryNewPin("");
    setPinError("PIN recovered successfully.");
    onPinAudit(profileId, "recover", true, null);
  };

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-6 text-center">
        <Shield className="mx-auto mb-3 h-10 w-10 text-primary" />
        <h2 className="text-xl font-bold">Parent Mode</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enter the parent PIN to continue.</p>
        <input inputMode="numeric" type="password" value={pinInput} onChange={e => setPinInput(e.target.value)}
          className="mt-4 w-full rounded-xl border border-input bg-background px-4 py-2 text-center text-lg tracking-widest" aria-label="Parent PIN" />
        {pinError && <p className="mt-2 text-sm text-rose-600">{pinError}</p>}
        <div className="mt-4 flex justify-center gap-2">
          <Button type="button" variant="outline" onClick={onExit}>Cancel</Button>
          <Button type="button" onClick={tryUnlock}>Unlock</Button>
        </div>
      </div>
    );
  }

  const setMaxDiff = (d: Difficulty) => setState(p => ({ ...p, settings: { ...p.settings, maxDifficulty: d } }));
  const toggleCategory = (id: string) => setState(p => {
    const list = p.settings.allowedCategories;
    const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id];
    return { ...p, settings: { ...p.settings, allowedCategories: next } };
  });
  const resetProgress = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset all progress, stars, and rewards? This can't be undone.")) return;
    setState(p => ({ ...p, progress: {}, rewards: { stars: 0, spent: 0, unlocked: [] }, activity: [] }));
  };

  const recent = [...state.activity].reverse().slice(0, 10);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to quizzes
        </button>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <Shield className="h-3 w-3" /> Parent Mode
        </span>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><Settings className="h-5 w-5 text-primary" /> Difficulty & Content</h3>
        <div>
          <label className="text-sm font-semibold">Maximum difficulty</label>
          <div className="mt-2 flex gap-2">
            {([1, 2, 3] as Difficulty[]).map(d => (
              <button key={d} onClick={() => setMaxDiff(d)}
                className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-semibold ${state.settings.maxDifficulty === d ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`}>
                {d === 1 ? "Easy" : d === 2 ? "Medium" : "Advanced"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <label className="text-sm font-semibold">Allowed quiz categories</label>
          <p className="text-xs text-muted-foreground">Leave all unchecked to allow every category.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {quizzes.map(q => {
              const active = state.settings.allowedCategories.includes(q.id);
              return (
                <button key={q.id} onClick={() => toggleCategory(q.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`}>
                  <span aria-hidden>{q.emoji}</span>{q.title}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><KeyRound className="h-5 w-5 text-primary" /> Parent PIN</h3>
        <p className="text-sm text-muted-foreground">Set or update the PIN required to open parent mode, with safe recovery code support.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input inputMode="numeric" type="password" placeholder="New PIN (4+ digits)" value={newPin} onChange={e => setNewPin(e.target.value)} />
          <Input placeholder="Recovery code" value={newRecovery} onChange={e => setNewRecovery(e.target.value)} />
          <Button type="button" onClick={setPin}>Save PIN</Button>
          {state.settings.parentPinHash && (
            <Button type="button" variant="outline" onClick={clearPin}>Remove PIN</Button>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">PIN recovery</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Input placeholder="Recovery code" value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value)} />
            <Input
              inputMode="numeric"
              type="password"
              placeholder="New PIN"
              value={recoveryNewPin}
              onChange={(event) => setRecoveryNewPin(event.target.value)}
            />
          </div>
          <Button type="button" variant="secondary" className="mt-2" onClick={recoverPin}>
            Recover and reset PIN
          </Button>
        </div>

        {pinError && <p className="mt-2 text-sm text-muted-foreground">{pinError}</p>}
      </section>

      <section className="rounded-3xl border border-border bg-card p-6">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><Activity className="h-5 w-5 text-primary" /> Recent activity</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {recent.map((a, i) => {
              const q = quizzes.find(x => x.id === a.quizId);
              return (
                <li key={i} className="flex items-center justify-between py-2">
                  <span>{q?.emoji ?? "🧩"} {q?.title ?? a.quizId}</span>
                  <span className="text-muted-foreground">{a.correct}/{a.total} · {new Date(a.at).toLocaleString()}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-rose-300/40 bg-rose-50/40 p-6 dark:bg-rose-500/10">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-rose-700 dark:text-rose-300"><RefreshCw className="h-5 w-5" /> Reset progress</h3>
        <p className="text-sm text-muted-foreground">Clear all quiz results, stars, unlocked rewards, and activity.</p>
        <Button type="button" variant="destructive" className="mt-3" onClick={resetProgress}>Reset everything</Button>
      </section>
    </div>
  );
}

function SummaryScreen({ state, quizzes, onExit }: { state: StateBag; quizzes: Quiz[]; onExit: () => void }) {
  const totalStars = state.rewards.stars + state.rewards.spent;
  const completedQuizzes = Object.entries(state.progress).filter(([, p]) => (p?.stars ?? 0) > 0);
  return (
    <div className="space-y-6">
      <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-amber-400/10 to-rose-400/10 p-8 text-center">
        <Trophy className="mx-auto h-12 w-12 text-amber-500" />
        <h2 className="mt-3 text-2xl font-bold">Your Journey So Far</h2>
        <p className="mt-1 text-sm text-muted-foreground">Synced across all your devices.</p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Stars earned" value={totalStars} />
          <Stat label="Available" value={state.rewards.stars} />
          <Stat label="Quizzes done" value={completedQuizzes.length} />
          <Stat label="Rewards" value={state.rewards.unlocked.length} />
        </div>
      </div>
      <BadgeRow state={state} />
      <section className="rounded-3xl border border-border bg-card p-6">
        <h3 className="mb-3 text-lg font-bold">Quiz results</h3>
        {completedQuizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Play a quiz to see results here.</p>
        ) : (
          <ul className="divide-y divide-border">
            {completedQuizzes.map(([id, p]) => {
              const q = quizzes.find(x => x.id === id);
              return (
                <li key={id} className="flex items-center justify-between py-3">
                  <span className="font-semibold">{q?.emoji ?? "🧩"} {q?.title ?? id}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{p.best}/{p.total} · {p.attempts} tries</span>
                    <StarRow count={p.stars} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section className="rounded-3xl border border-border bg-card p-6">
        <h3 className="mb-3 text-lg font-bold">My rewards</h3>
        {state.rewards.unlocked.length === 0 ? (
          <p className="text-sm text-muted-foreground">Visit the store to redeem stars for stickers and cards.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {state.rewards.unlocked.map(id => {
              const item = REWARDS.find(r => r.id === id);
              if (!item) return null;
              return (
                <span key={id} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm">
                  <span aria-hidden>{item.emoji}</span>{item.name}
                </span>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-background/70 p-4 dark:bg-white/5">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
