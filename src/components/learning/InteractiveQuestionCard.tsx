import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Image as ImageIcon,
  ArrowUpDown,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuestionItem, MatchingPair, ChronologyItem } from "@/lib/gamification-questions";
import { toggleBookmark, getGamificationStats } from "@/lib/gamification";

interface InteractiveQuestionCardProps {
  question: QuestionItem;
  locale: "en" | "ar" | "he";
  onAnswerSubmit: (isCorrect: boolean, xpEarned: number) => void;
  onOpenAiExplanation: () => void;
}

export const InteractiveQuestionCard: React.FC<InteractiveQuestionCardProps> = ({
  question,
  locale,
  onAnswerSubmit,
  onOpenAiExplanation,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedBoolean, setSelectedBoolean] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // Chronology state
  const [chronologyOrder, setChronologyOrder] = useState<ChronologyItem[]>([]);
  // Matching state
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedPairsMap, setMatchedPairsMap] = useState<Record<string, string>>({}); // leftId -> rightId

  useEffect(() => {
    // Reset state on question change
    setSelectedIndex(null);
    setSelectedBoolean(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setSelectedLeftId(null);
    setMatchedPairsMap({});

    if (question.chronologyItems) {
      // Shuffle initial chronology order
      const shuffled = [...question.chronologyItems].sort(() => Math.random() - 0.5);
      setChronologyOrder(shuffled);
    }

    const stats = getGamificationStats();
    const hasBm = stats.bookmarks.some((b) => b.questionId === question.id);
    setIsBookmarked(hasBm);
  }, [question]);

  const handleBookmarkToggle = () => {
    const res = toggleBookmark(question);
    setIsBookmarked(res.bookmarked);
  };

  const options =
    locale === "ar"
      ? question.optionsAr
      : locale === "he"
        ? question.optionsHe
        : question.optionsEn;

  const title =
    locale === "ar" ? question.titleAr : locale === "he" ? question.titleHe : question.titleEn;

  const prompt =
    locale === "ar" ? question.promptAr : locale === "he" ? question.promptHe : question.promptEn;

  // Handle MCQ Submission
  const handleSelectMCQ = (index: number) => {
    if (isSubmitted) return;
    setSelectedIndex(index);
  };

  const handleSelectTrueFalse = (val: boolean) => {
    if (isSubmitted) return;
    setSelectedBoolean(val);
  };

  // Chronology shift
  const moveChronologyItem = (fromIdx: number, toIdx: number) => {
    if (isSubmitted || toIdx < 0 || toIdx >= chronologyOrder.length) return;
    const updated = [...chronologyOrder];
    const item = updated.splice(fromIdx, 1)[0];
    updated.splice(toIdx, 0, item);
    setChronologyOrder(updated);
  };

  // Matching shift
  const handleLeftSelect = (leftId: string) => {
    if (isSubmitted) return;
    setSelectedLeftId(leftId);
  };

  const handleRightSelect = (rightId: string) => {
    if (isSubmitted || !selectedLeftId) return;
    setMatchedPairsMap((prev) => ({
      ...prev,
      [selectedLeftId]: rightId,
    }));
    setSelectedLeftId(null);
  };

  const handleCheckAnswer = () => {
    if (isSubmitted) return;

    let correct = false;
    let xp = 20;

    if (question.mode === "true_false") {
      if (selectedBoolean === null) return;
      correct = selectedBoolean === question.correctBoolean;
    } else if (question.mode === "chronology") {
      // Check if order matches 1..N
      correct = chronologyOrder.every((item, idx) => item.order === idx + 1);
      xp = 35;
    } else if (question.mode === "relationship_matching" || question.mode === "topic_matching") {
      if (!question.matchingPairs) return;
      correct = question.matchingPairs.every((pair) => matchedPairsMap[pair.id] === pair.id);
      xp = 35;
    } else {
      if (selectedIndex === null) return;
      correct = selectedIndex === question.correctIndex;
    }

    setIsSubmitted(true);
    setIsCorrect(correct);
    onAnswerSubmit(correct, correct ? xp : 0);
  };

  return (
    <div
      id={`question-card-${question.id}`}
      className="w-full rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col transition-all"
    >
      {/* Question Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            {question.mode.replace("_", " ")}
          </span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            • {question.difficulty.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="toggle-bookmark-btn"
            onClick={handleBookmarkToggle}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={isBookmarked ? "Bookmarked" : "Save to Bookmarks"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-amber-500 fill-amber-500" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 space-y-6">
        {/* Title & Prompt */}
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 dir-auto mb-1">
            {title}
          </h2>
          <p className="text-base text-zinc-700 dark:text-zinc-300 dir-auto leading-relaxed">
            {prompt}
          </p>
        </div>

        {/* Optional Image for Image Recognition */}
        {question.image && (
          <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-md max-h-64 flex justify-center bg-black">
            <img
              src={question.image}
              alt={
                title
                  ? `${locale === "ar" ? "صورة توضيحية لـ" : locale === "he" ? "תמונת תצוגה עבור" : "Illustrative image for"} ${title}`
                  : locale === "ar"
                    ? "معلم إسلامي تاريخي أو أثر شريف"
                    : locale === "he"
                      ? "אתר היסטורי איסלאמי או מוצג מוזיאוני"
                      : "Historical Islamic landmark or sacred artifact"
              }
              className="object-cover w-full max-h-64 hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}

        {/* MODE 1: CHRONOLOGY ORDERING */}
        {question.mode === "chronology" && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {locale === "ar"
                ? "استخدم الأسهم لترتيب الأحداث بالترتيب الزمني الصحيح:"
                : locale === "he"
                  ? "השתמש בחצים כדי לסדר את האירועים לפי סדר כרונולוגי:"
                  : "Use arrows to position events in correct chronological order:"}
            </p>
            <div className="space-y-2">
              {chronologyOrder.map((item, idx) => {
                const text =
                  locale === "ar" ? item.textAr : locale === "he" ? item.textHe : item.textEn;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-medium dir-auto text-sm">{text}</span>
                    </div>
                    {!isSubmitted && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveChronologyItem(idx, idx - 1)}
                          disabled={idx === 0}
                          className="p-1 rounded bg-zinc-200 dark:bg-zinc-700 disabled:opacity-30 hover:bg-emerald-500 hover:text-white transition-colors text-xs font-bold"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveChronologyItem(idx, idx + 1)}
                          disabled={idx === chronologyOrder.length - 1}
                          className="p-1 rounded bg-zinc-200 dark:bg-zinc-700 disabled:opacity-30 hover:bg-emerald-500 hover:text-white transition-colors text-xs font-bold"
                        >
                          ▼
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE 2: RELATIONSHIP & TOPIC MATCHING */}
        {(question.mode === "relationship_matching" || question.mode === "topic_matching") &&
          question.matchingPairs && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  {locale === "ar"
                    ? "المفهوم / النبي"
                    : locale === "he"
                      ? "מושג / נביא"
                      : "Left Category"}
                </span>
                {question.matchingPairs.map((pair) => {
                  const leftText =
                    locale === "ar" ? pair.leftAr : locale === "he" ? pair.leftHe : pair.leftEn;
                  const isSelected = selectedLeftId === pair.id;
                  const matchedRightId = matchedPairsMap[pair.id];
                  return (
                    <button
                      key={pair.id}
                      onClick={() => handleLeftSelect(pair.id)}
                      className={`w-full text-left p-3.5 rounded-xl border font-medium text-sm transition-all dir-auto ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30"
                          : matchedRightId
                            ? "border-teal-500/50 bg-teal-500/5 dark:bg-teal-950/20 text-zinc-800 dark:text-zinc-200"
                            : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {leftText}
                    </button>
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  {locale === "ar"
                    ? "الكتاب / الآية"
                    : locale === "he"
                      ? "ספר / פסוק"
                      : "Right Match"}
                </span>
                {question.matchingPairs.map((pair) => {
                  const rightText =
                    locale === "ar" ? pair.rightAr : locale === "he" ? pair.rightHe : pair.rightEn;
                  return (
                    <button
                      key={`r_${pair.id}`}
                      onClick={() => handleRightSelect(pair.id)}
                      className="w-full text-left p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium text-sm transition-all dir-auto"
                    >
                      {rightText}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* MODE 3: TRUE / FALSE */}
        {question.mode === "true_false" && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSelectTrueFalse(true)}
              className={`p-6 rounded-2xl border-2 font-bold text-lg flex flex-col items-center gap-2 transition-all ${
                selectedBoolean === true
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-500/20"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span>{locale === "ar" ? "صحيح" : locale === "he" ? "נכון" : "TRUE"}</span>
            </button>
            <button
              onClick={() => handleSelectTrueFalse(false)}
              className={`p-6 rounded-2xl border-2 font-bold text-lg flex flex-col items-center gap-2 transition-all ${
                selectedBoolean === false
                  ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-4 ring-rose-500/20"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-rose-500/50 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <XCircle className="w-8 h-8 text-rose-500" />
              <span>{locale === "ar" ? "خاطئ" : locale === "he" ? "לא נכון" : "FALSE"}</span>
            </button>
          </div>
        )}

        {/* STANDARD MCQ & OTHER MODES */}
        {options &&
          question.mode !== "chronology" &&
          question.mode !== "relationship_matching" &&
          question.mode !== "topic_matching" &&
          question.mode !== "true_false" && (
            <div className="space-y-3">
              {options.map((optionText, idx) => {
                const isSelected = selectedIndex === idx;
                const isCorrectOption = question.correctIndex === idx;

                let cardStyle =
                  "border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/60 bg-white dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200";

                if (isSelected && !isSubmitted) {
                  cardStyle =
                    "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-semibold";
                }

                if (isSubmitted) {
                  if (isCorrectOption) {
                    cardStyle =
                      "border-emerald-500 bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold";
                  } else if (isSelected && !isCorrectOption) {
                    cardStyle =
                      "border-rose-500 bg-rose-500/20 text-rose-800 dark:text-rose-300 font-medium";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectMCQ(idx)}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all dir-auto ${cardStyle}`}
                  >
                    <span className="text-sm md:text-base font-medium leading-normal">
                      {optionText}
                    </span>
                    <span className="w-6 h-6 rounded-full border border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

        {/* SUBMISSION & BOTTOM ACTION SHEET */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <Button
            id="open-ai-explanation-btn"
            variant="outline"
            onClick={onOpenAiExplanation}
            className="flex items-center gap-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            <span>
              {locale === "ar"
                ? "شرح وتفسير الذكاء الاصطناعي"
                : locale === "he"
                  ? "הסבר AI מפורט"
                  : "AI Explanation"}
            </span>
          </Button>

          {!isSubmitted ? (
            <Button
              id="submit-answer-btn"
              onClick={handleCheckAnswer}
              disabled={
                question.mode === "true_false"
                  ? selectedBoolean === null
                  : question.mode === "chronology" ||
                      question.mode === "relationship_matching" ||
                      question.mode === "topic_matching"
                    ? false
                    : selectedIndex === null
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md"
            >
              <span>
                {locale === "ar"
                  ? "تحقق من الإجابة"
                  : locale === "he"
                    ? "בדוק תשובה"
                    : "CHECK ANSWER"}
              </span>
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {locale === "ar"
                      ? "إجابة صحيحة! +20 XP"
                      : locale === "he"
                        ? "תשובה נכונה! +20 XP"
                        : "Correct! +20 XP"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                  <XCircle className="w-5 h-5" />
                  <span>
                    {locale === "ar"
                      ? "إجابة خاطئة! فقدت قلبًا ❤️"
                      : locale === "he"
                        ? "תשובה שגויה! איבדת לב ❤️"
                        : "Incorrect! Lost 1 Heart ❤️"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
