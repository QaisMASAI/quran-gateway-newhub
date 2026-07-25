import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Star, Trophy, Award, Check, X, RotateCcw, ArrowLeft, Gamepad2 } from "lucide-react";

export const Route = createFileRoute("/kids")({
  head: () => ({
    meta: [
      { title: "Kids Zone — Quran Quizzes & Games for Young Learners | Noor" },
      {
        name: "description",
        content:
          "Fun Quran quizzes, prophet games, and Islamic learning activities for kids and young learners. Earn stars, unlock badges, and grow in knowledge.",
      },
      { property: "og:title", content: "Kids Zone — Quran Quizzes & Games" },
      {
        property: "og:description",
        content:
          "Playful Quran learning: quizzes about prophets, surahs, and values. Designed for kids and young visitors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KidsPage,
});

type Question = {
  q: string;
  options: string[];
  answer: number;
  hint?: string;
};

type Quiz = {
  id: string;
  title: string;
  emoji: string;
  age: "kids" | "young";
  color: string;
  description: string;
  questions: Question[];
};

const QUIZZES: Quiz[] = [
  {
    id: "prophets",
    title: "Prophets of the Qur'an",
    emoji: "🕌",
    age: "kids",
    color: "from-emerald-400 to-teal-500",
    description: "Meet the prophets mentioned in the Holy Qur'an.",
    questions: [
      {
        q: "Which prophet built the Ka'bah with his son Ismail?",
        options: ["Musa (Moses)", "Ibrahim (Abraham)", "Isa (Jesus)", "Nuh (Noah)"],
        answer: 1,
        hint: "He is called the friend of Allah — Khalilullah.",
      },
      {
        q: "Which prophet built a large ark to save the believers from the flood?",
        options: ["Nuh (Noah)", "Yusuf (Joseph)", "Dawud (David)", "Sulayman (Solomon)"],
        answer: 0,
      },
      {
        q: "To which prophet was the Qur'an revealed?",
        options: ["Isa", "Musa", "Muhammad ﷺ", "Ibrahim"],
        answer: 2,
      },
      {
        q: "Which prophet could understand the language of animals and birds?",
        options: ["Yunus", "Sulayman (Solomon)", "Yaqub", "Adam"],
        answer: 1,
      },
      {
        q: "Which prophet was swallowed by a big fish?",
        options: ["Yunus (Jonah)", "Musa", "Idris", "Harun"],
        answer: 0,
      },
    ],
  },
  {
    id: "surahs",
    title: "Short Surahs",
    emoji: "📖",
    age: "kids",
    color: "from-amber-400 to-orange-500",
    description: "Learn about the short surahs you recite in prayer.",
    questions: [
      {
        q: "How many verses are in Surah Al-Fatiha?",
        options: ["5", "6", "7", "10"],
        answer: 2,
      },
      {
        q: "Which surah is called 'the heart of the Qur'an' by many scholars?",
        options: ["Al-Ikhlas", "Ya-Sin", "Al-Kahf", "Al-Mulk"],
        answer: 1,
      },
      {
        q: "Surah Al-Ikhlas talks about…",
        options: [
          "The story of Musa",
          "The Oneness of Allah",
          "The Day of Judgement",
          "Paradise",
        ],
        answer: 1,
      },
      {
        q: "How many surahs are in the Qur'an?",
        options: ["99", "114", "120", "100"],
        answer: 1,
      },
      {
        q: "Which surah starts with 'Qul a'udhu bi rabbin-nas'?",
        options: ["Al-Falaq", "Al-Nas", "Al-Kawthar", "Al-Asr"],
        answer: 1,
      },
    ],
  },
  {
    id: "values",
    title: "Good Manners & Values",
    emoji: "💛",
    age: "kids",
    color: "from-pink-400 to-rose-500",
    description: "The beautiful manners the Qur'an teaches us.",
    questions: [
      {
        q: "The Qur'an tells us to speak to our parents with…",
        options: ["Loud voice", "Kind and gentle words", "Silence", "Anger"],
        answer: 1,
      },
      {
        q: "What should you say before starting to eat?",
        options: ["Alhamdulillah", "Bismillah", "SubhanAllah", "Ameen"],
        answer: 1,
      },
      {
        q: "What should you say when someone gives you a gift?",
        options: ["JazakAllah khayr / Thank you", "Nothing", "Give it back", "Sorry"],
        answer: 0,
      },
      {
        q: "Being patient is called…",
        options: ["Shukr", "Sabr", "Tawbah", "Iman"],
        answer: 1,
      },
    ],
  },
  {
    id: "young",
    title: "Qur'an for Young Learners",
    emoji: "🌟",
    age: "young",
    color: "from-indigo-400 to-purple-500",
    description: "A slightly deeper challenge for teens and young learners.",
    questions: [
      {
        q: "The word 'Tafsir' means…",
        options: ["Recitation", "Translation", "Explanation of the Qur'an", "Memorization"],
        answer: 2,
      },
      {
        q: "Asbab al-Nuzul refers to…",
        options: [
          "The reasons/occasions of revelation of verses",
          "The names of the reciters",
          "The chapters of Hadith",
          "The pillars of prayer",
        ],
        answer: 0,
      },
      {
        q: "Which is the longest surah in the Qur'an?",
        options: ["Al-Kahf", "Al-Baqarah", "Al-Imran", "An-Nisa"],
        answer: 1,
      },
      {
        q: "Sahih al-Bukhari is a collection of…",
        options: ["Poems", "Tafsir", "Authentic Hadith", "Prophet biographies"],
        answer: 2,
      },
      {
        q: "The Night Journey of the Prophet ﷺ is called…",
        options: ["Hijrah", "Isra & Mi'raj", "Ghazwah", "Umrah"],
        answer: 1,
      },
      {
        q: "How many years was the Qur'an revealed over?",
        options: ["10 years", "23 years", "40 years", "5 years"],
        answer: 1,
      },
    ],
  },
];

const STORAGE_KEY = "noor:kids:progress:v1";

type Progress = Record<string, { best: number; total: number; stars: number }>;

function loadProgress(): Progress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    return {};
  }
}

function saveProgress(p: Progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function KidsPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const totalStars = useMemo(
    () => Object.values(progress).reduce((s, p) => s + (p?.stars ?? 0), 0),
    [progress],
  );

  const active = QUIZZES.find((q) => q.id === activeId) ?? null;

  const handleComplete = (quizId: string, correct: number, total: number) => {
    const stars = correct === total ? 3 : correct >= Math.ceil(total * 0.7) ? 2 : correct > 0 ? 1 : 0;
    setProgress((prev) => {
      const prior = prev[quizId];
      const best = Math.max(prior?.best ?? 0, correct);
      const bestStars = Math.max(prior?.stars ?? 0, stars);
      const next = { ...prev, [quizId]: { best, total, stars: bestStars } };
      saveProgress(next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Kids Zone
              </p>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Learn the Qur'an with Games & Quizzes
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-100/40 px-4 py-2 text-sm font-semibold text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <Trophy className="h-4 w-4" />
            {totalStars} stars earned
          </div>
        </header>

        {!active ? (
          <QuizPicker
            progress={progress}
            onPick={(id) => setActiveId(id)}
          />
        ) : (
          <QuizPlayer
            key={active.id}
            quiz={active}
            onExit={() => setActiveId(null)}
            onComplete={(correct, total) => handleComplete(active.id, correct, total)}
          />
        )}
      </div>
    </div>
  );
}

function QuizPicker({
  progress,
  onPick,
}: {
  progress: Progress;
  onPick: (id: string) => void;
}) {
  const kids = QUIZZES.filter((q) => q.age === "kids");
  const young = QUIZZES.filter((q) => q.age === "young");

  return (
    <div className="space-y-10">
      <section
        aria-labelledby="hero"
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-emerald-500/10 via-amber-400/10 to-rose-400/10 p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 text-4xl shadow-sm dark:bg-white/10">
            🌙
          </div>
          <div className="max-w-xl">
            <h2 id="hero" className="text-xl font-bold text-foreground sm:text-2xl">
              Play, learn, and grow in knowledge!
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a quiz below. Answer questions, earn stars, and unlock badges as you learn
              about prophets, surahs, and good manners.
            </p>
          </div>
        </div>
        <BadgeRow progress={progress} />
      </section>

      <Section title="For Kids" icon={<Gamepad2 className="h-5 w-5" />}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kids.map((q) => (
            <QuizCard key={q.id} quiz={q} progress={progress[q.id]} onPick={() => onPick(q.id)} />
          ))}
        </div>
      </Section>

      <Section title="For Young Learners" icon={<Sparkles className="h-5 w-5" />}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {young.map((q) => (
            <QuizCard key={q.id} quiz={q} progress={progress[q.id]} onPick={() => onPick(q.id)} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function QuizCard({
  quiz,
  progress,
  onPick,
}: {
  quiz: Quiz;
  progress?: { best: number; total: number; stars: number };
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 text-start transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
    >
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${quiz.color} text-3xl shadow-md`}
      >
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
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < count ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function BadgeRow({ progress }: { progress: Progress }) {
  const totalStars = Object.values(progress).reduce((s, p) => s + (p?.stars ?? 0), 0);
  const completed = Object.values(progress).filter((p) => (p?.stars ?? 0) > 0).length;
  const badges = [
    { id: "starter", label: "First Star", achieved: totalStars >= 1, emoji: "⭐" },
    { id: "explorer", label: "Explorer", achieved: completed >= 2, emoji: "🧭" },
    { id: "scholar", label: "Little Scholar", achieved: totalStars >= 6, emoji: "🎓" },
    { id: "champion", label: "Champion", achieved: totalStars >= 10, emoji: "🏆" },
  ];
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {badges.map((b) => (
        <div
          key={b.id}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
            b.achieved
              ? "border-amber-400/60 bg-amber-100/70 text-amber-900 dark:bg-amber-400/15 dark:text-amber-100"
              : "border-border bg-muted/40 text-muted-foreground opacity-60"
          }`}
          title={b.achieved ? `Unlocked: ${b.label}` : `Locked: ${b.label}`}
        >
          <span aria-hidden>{b.emoji}</span>
          <span>{b.label}</span>
          {b.achieved && <Award className="h-3 w-3" />}
        </div>
      ))}
    </div>
  );
}

function QuizPlayer({
  quiz,
  onExit,
  onComplete,
}: {
  quiz: Quiz;
  onExit: () => void;
  onComplete: (correct: number, total: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = quiz.questions.length;
  const current = quiz.questions[idx];

  const pick = (i: number) => {
    if (locked || !current) return;
    setSelected(i);
    setLocked(true);
    if (i === current.answer) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (idx + 1 >= total) {
      setFinished(true);
      onComplete(selected === current?.answer ? correct : correct, total);
      return;
    }
    setIdx((n) => n + 1);
    setSelected(null);
    setLocked(false);
  };

  const restart = () => {
    setIdx(0);
    setSelected(null);
    setLocked(false);
    setCorrect(0);
    setFinished(false);
  };

  if (finished || !current) {
    const stars =
      correct === total ? 3 : correct >= Math.ceil(total * 0.7) ? 2 : correct > 0 ? 1 : 0;
    const message =
      stars === 3
        ? "Amazing! A perfect score! 🎉"
        : stars === 2
          ? "Great job! Keep learning! 🌟"
          : stars === 1
            ? "Good try — practice makes perfect."
            : "Keep going — every step counts.";
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-4xl shadow-lg">
          🏆
        </div>
        <h2 className="text-2xl font-bold text-foreground">{quiz.title}</h2>
        <p className="mt-2 text-muted-foreground">{message}</p>
        <p className="mt-4 text-3xl font-bold text-primary">
          {correct} / {total}
        </p>
        <div className="mt-3 flex justify-center">
          <StarRow count={stars} />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" /> Play again
          </button>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
          >
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
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Exit
        </button>
        <div className="text-sm font-semibold text-muted-foreground">
          Question {idx + 1} of {total}
        </div>
      </div>

      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${quiz.color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
        <span>{quiz.emoji}</span> {quiz.title}
      </div>
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">{current.q}</h2>

      <div className="mt-6 grid gap-3">
        {current.options.map((opt, i) => {
          const isCorrect = i === current.answer;
          const isPicked = i === selected;
          let cls =
            "flex items-center justify-between gap-3 rounded-2xl border-2 p-4 text-start text-sm font-semibold transition-all";
          if (!locked) {
            cls +=
              " border-border bg-background hover:border-primary/60 hover:bg-primary/5 cursor-pointer";
          } else if (isCorrect) {
            cls += " border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100";
          } else if (isPicked) {
            cls += " border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-100";
          } else {
            cls += " border-border bg-background/50 text-muted-foreground";
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={locked}
              className={cls}
            >
              <span>{opt}</span>
              {locked && isCorrect && <Check className="h-5 w-5 text-emerald-600" />}
              {locked && isPicked && !isCorrect && <X className="h-5 w-5 text-rose-600" />}
            </button>
          );
        })}
      </div>

      {locked && current.hint && selected !== current.answer && (
        <p className="mt-4 rounded-xl border border-amber-300/40 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          💡 {current.hint}
        </p>
      )}

      {locked && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {idx + 1 >= total ? "See results" : "Next question"}
          </button>
        </div>
      )}
    </div>
  );
}

