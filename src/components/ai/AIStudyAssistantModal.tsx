import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Brain,
  Bot,
  HelpCircle,
  Check,
  BookOpen,
  RotateCcw,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { awardXP } from "@/lib/gamification";
import { logResearchQuery } from "@/lib/habit-engine";

interface AIStudyAssistantModalProps {
  locale: string;
  onClose: () => void;
}

export const AIStudyAssistantModal: React.FC<AIStudyAssistantModalProps> = ({
  locale,
  onClose,
}) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string; citation?: string }[]
  >([
    {
      role: "assistant",
      text: isAr
        ? "أهلاً بك! أنا مساعد المدارسة الذكي نور AI. كيف يمكنني مساعدتك في تدبر القرآن، فهم التفاسير، أو مراجعة مساراتك المعرفية اليوم؟"
        : isHe
          ? "שלום! אני עוזר הלימוד החכם נור AI. כיצד אוכל לעזור לך בהבנת הקוראן, חקר התפסיר או חזרה על נושאי הלימוד היום?"
          : "Welcome! I am Noor AI Study Assistant. How can I assist your Quranic reflection, Tafsir research, or study plan today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const predefinedPrompts = [
    {
      labelEn: "Generate Daily Reflection Prompt",
      labelAr: "سؤال تدبر يومي",
      labelHe: "שאלה להרהור יומי",
      promptEn:
        "Give me a deep reflection question based on Surah Al-Baqarah 2:255 (Ayat al-Kursi).",
      promptAr: "قدم لي سؤال تدبر عميق حول آية الكرسي (سورة البقرة 2:255)",
      promptHe: "תן לי שאלת הרהור עמוקה על פסוק הכסא (2:255)",
    },
    {
      labelEn: "Quick Quiz Check",
      labelAr: "اختبار مراجعة سريع",
      labelHe: "בוחן פתע קצר",
      promptEn: "Ask me a 1-question pop quiz about An-Nawawi's 40 Hadiths to test my memory.",
      promptAr: "اطرح علي سؤالاً اختبارياً سريعاً حول الأربعين النووية لاختبار حفظي",
      promptHe: "שאל אותי שאלת בוחן קצרה על 40 החדית'ים של א-נוואווי",
    },
    {
      labelEn: "Personalized Weekly Schedule",
      labelAr: "جدول دراسي أسبوعي",
      labelHe: "לוח זמנים שבועי",
      promptEn: "Suggest a balanced 7-day Quran and Tafsir reading schedule for a busy learner.",
      promptAr: "اقترح جدول قراءة وتفسير لمدة 7 أيام يناسب الطالب الملتزم",
      promptHe: "הצע לוח זמנים שבועי מאוזן לקריאת קוראן ותפסיר",
    },
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: "user" as const, text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery("");
    setLoading(true);

    // Log research query to habit engine
    logResearchQuery();
    awardXP(15, "ai");

    // Simulate intelligent educational response
    setTimeout(() => {
      let replyText = "";
      let citation = "";

      if (
        textToSend.toLowerCase().includes("quiz") ||
        textToSend.includes("اختبار") ||
        textToSend.includes("בוחן")
      ) {
        replyText = isAr
          ? "اختبار المراجعة السريع:\nما هو الحديث الأول في الأربعين النووية، وما هي القاعدة الإيمانية الكبرى التي يؤسس لها؟\n\n💡 تلميح: يتعلق بأصل كل الأعمال القلبيّة والظاهرة."
          : isHe
            ? "בוחן פתע קצר:\nמהו החדית' הראשון ב-40 החדית'ים של א-נוואווי, ומהו היסוד האמוני המרכזי שהוא קובע?\n\n💡 רמז: מדובר ביסוד כל המעשים."
            : "Quick Recall Quiz:\nWhat is the 1st Hadith in An-Nawawi's 40 collection, and what fundamental principle does it establish?\n\n💡 Hint: It governs the inner intention behind all deeds.";
        citation = "Sahih al-Bukhari 1 / Sahih Muslim 1907";
      } else if (
        textToSend.toLowerCase().includes("reflection") ||
        textToSend.includes("تدبر") ||
        textToSend.includes("הרהור")
      ) {
        replyText = isAr
          ? "تأمل في قوله تعالى: ﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ﴾ [البقرة: 255].\nكيف يؤثر إيمانك بأن الله هو 'القيوم' على طمأنينة قلبك في مواجهة تحديات الحياة اليومية؟"
          : isHe
            ? "הרהר בפסוק הכסא (2:255): כיצד האמונה כי אללה הוא 'אל-קיום' (הקיים והמחזיק את הכל) מעניקה לך שלווה אל מול קשיי היומיום?"
            : "Contemplate 2:255: How does recognizing Allah as 'Al-Qayyum' (The Self-Sustaining Sustainer of all) transform your inner peace during life's daily trials?";
        citation = "Tafsir Ibn Kathir / Tafsir Al-Qurtubi (2:255)";
      } else {
        replyText = isAr
          ? "إليك إرشادات المدارسة الموثقة:\n\n1. الالتزام بالورد اليومي القليل المستمر أفضل وأحب الأعمال.\n2. الجمع بين قراءة النص وتدبر أسباب النزول والتفسير المعتمد يورث الفهم المكتمل.\n3. تدوين الملاحظات الشخصية يعزز تثبيت العلم في الفؤاد."
          : isHe
            ? "להלן הנחיות הלימוד המאומתות:\n1. התמדה יומית מתונה עדיפה על לימוד מזדמן.\n2. שילוב קריאה עם תפסיר ואסבאב א-נזול מעמיק את ההבנה.\n3. כתיבת הערות אישיות מסייעת בשימור הידע."
            : "Here is your verified study guidance:\n1. Consistent daily reading is most beloved and habit-forming.\n2. Pairing Quranic recitation with authentic Tafsir commentary yields comprehensive understanding.\n3. Recording personal reflections in your notes locks in knowledge.";
        citation = "Sahih al-Bukhari 6465";
      }

      setMessages((prev) => [...prev, { role: "assistant", text: replyText, citation }]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl h-[600px] rounded-3xl bg-zinc-950 border border-purple-500/40 shadow-2xl overflow-hidden flex flex-col justify-between">
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-purple-950/30 via-zinc-950 to-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                {isAr
                  ? "مساعد المدارسة والبحث الذكي - نور AI"
                  : isHe
                    ? "עוזר הלימוד והמחקר נור AI"
                    : "Noor AI Study & Research Companion"}
              </h3>
              <span className="text-[10px] text-purple-400 font-mono">
                {isAr
                  ? "موثق بالمصادر والأسانيد"
                  : isHe
                    ? "מאומת עם מקורות"
                    : "CITED & AUTHENTIC SOURCES"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* PREDEFINED PROMPT CHIPS */}
        <div className="px-4 py-2 border-b border-zinc-800/60 bg-zinc-900/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {predefinedPrompts.map((p, idx) => {
            const label = isAr ? p.labelAr : isHe ? p.labelHe : p.labelEn;
            const prompt = isAr ? p.promptAr : isHe ? p.promptHe : p.promptEn;
            return (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-200 text-[11px] font-bold whitespace-nowrap transition-all"
              >
                + {label}
              </button>
            );
          })}
        </div>

        {/* MESSAGES CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[80%] whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-purple-600 text-white font-medium"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200"
                }`}
                dir="auto"
              >
                {m.text}

                {m.citation && (
                  <div className="mt-2 pt-2 border-t border-purple-500/20 text-[10px] text-purple-300 font-mono font-bold flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{m.citation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 italic">
                {isAr
                  ? "جاري البحث في مصادر التفسير والدراسات القرآنية..."
                  : isHe
                    ? "מחפש במקורות התפסיר והקוראן..."
                    : "Analyzing authentic references & generating response..."}
              </div>
            </div>
          )}
        </div>

        {/* INPUT FORM */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2">
          <input
            type="text"
            placeholder={
              isAr
                ? "طرح سؤال دراسي أو البحث في التفسير..."
                : isHe
                  ? "שאל שאלת מחקר או תפסיר..."
                  : "Ask a study question, request a quiz or request Tafsir..."
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-purple-500"
          />
          <Button
            onClick={() => handleSend()}
            disabled={loading || !inputQuery.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-4 py-2.5 text-xs font-bold"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
