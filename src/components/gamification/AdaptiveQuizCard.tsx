import React, { useState } from "react";
import { Zap, HelpCircle, CheckCircle2, XCircle, Sparkles, AlertCircle } from "lucide-react";
import {
  calculateAdaptiveDifficulty,
  awardXpEngine,
  type UserGameification,
} from "@/lib/gamification-engine-v2";

interface AdaptiveQuizCardProps {
  data: UserGameification;
  onUpdate: (updated: UserGameification) => void;
  locale?: "en" | "ar" | "he";
}

interface SampleQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

const SAMPLE_QUESTIONS: SampleQuestion[] = [
  {
    id: "q1",
    question:
      "What is the primary spiritual focus of Surah Al-Fatihah's verse 'Iyyaka na'budu wa iyyaka nasta'in'?",
    options: [
      "Pure Monotheism & Exclusivity of Worship",
      "Historical sanctuary geography",
      "Rules of financial transactions",
      "Inauguration of pilgrimage dates",
    ],
    correctIndex: 0,
    hint: "It highlights directing all prayer and seeking aid exclusively to Allah.",
  },
  {
    id: "q2",
    question:
      "Which classical Hadith compilation is universally recognized alongside Sahih Al-Bukhari?",
    options: ["Sahih Muslim", "Sunan Ibn Majah", "Musnad Ahmad", "Muwatta Malik"],
    correctIndex: 0,
    hint: "Authored by Imam Muslim ibn al-Hajjaj.",
  },
];

export const AdaptiveQuizCard: React.FC<AdaptiveQuizCardProps> = ({
  data,
  onUpdate,
  locale = "en",
}) => {
  const isAr = locale === "ar";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(data.engagementStats.correctAnswersCount || 8);
  const [totalCount, setTotalCount] = useState(data.engagementStats.totalQuizzesTaken || 10);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = SAMPLE_QUESTIONS[currentIndex % SAMPLE_QUESTIONS.length];
  const adaptiveState = calculateAdaptiveDifficulty(correctCount, totalCount);

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setSubmitted(true);

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    const newTotal = totalCount + 1;

    setCorrectCount(newCorrect);
    setTotalCount(newTotal);

    data.engagementStats.correctAnswersCount = newCorrect;
    data.engagementStats.totalQuizzesTaken = newTotal;

    if (isCorrect) {
      // Mastery XP awarded based on adaptive difficulty scale (50-200 XP)
      const xpAmount = Math.min(200, 50 + adaptiveState.difficultyScale * 15);
      const updated = awardXpEngine(data, xpAmount, "mastery");
      onUpdate({ ...updated });
    } else {
      onUpdate({ ...data });
    }
  };

  const handleNext = () => {
    setSubmitted(false);
    setSelectedOption(null);
    setShowHint(false);
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
      {/* Header & Adaptive Status Gauge */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            {isAr ? "الاختبار المعرفي التكيفي" : "Adaptive Difficulty Engine"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
            {adaptiveState.recommendation}
          </p>
        </div>

        {/* Difficulty Scale Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 font-extrabold text-xs">
          <span>Difficulty Scale: Level {adaptiveState.difficultyScale} / 10</span>
          <span className="text-[10px] uppercase font-bold text-zinc-400">
            ({adaptiveState.tier})
          </span>
        </div>
      </div>

      {/* Accuracy <60% Hint Banner */}
      {adaptiveState.tier === "easy" && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2 dir-auto">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Accuracy is below 60%: Guided hints enabled to reinforce core principles.</span>
        </div>
      )}

      {/* Accuracy >80% Bonus Banner */}
      {adaptiveState.tier === "hard" && (
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-800 dark:text-purple-200 flex items-center gap-2 dir-auto">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            Accuracy is above 80%: Hard challenge mode unlocked with 2x Mastery XP rewards!
          </span>
        </div>
      )}

      {/* Question Card */}
      <div className="space-y-4">
        <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 dir-auto leading-relaxed">
          {currentQuestion.question}
        </h4>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let btnStyle =
              "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100";
            if (submitted) {
              if (isCorrect)
                btnStyle =
                  "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold";
              else if (isSelected)
                btnStyle =
                  "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold";
            } else if (isSelected) {
              btnStyle =
                "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold ring-2 ring-amber-500/20";
            }

            return (
              <button
                key={opt}
                disabled={submitted}
                onClick={() => setSelectedOption(idx)}
                className={`w-full p-4 rounded-2xl border text-left text-xs transition-all flex items-center justify-between dir-auto ${btnStyle}`}
              >
                <span>{opt}</span>
                {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {submitted && isSelected && !isCorrect && (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hint & Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
        >
          <HelpCircle className="w-4 h-4" />
          <span>{showHint ? "Hide Hint" : "Show Guided Hint"}</span>
        </button>

        {!submitted ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
            className="px-6 py-2.5 rounded-2xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-md disabled:opacity-50"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Next Question
          </button>
        )}
      </div>

      {showHint && (
        <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 text-xs text-zinc-600 dark:text-zinc-300 dir-auto italic">
          Guided Hint: {currentQuestion.hint}
        </div>
      )}
    </div>
  );
};
