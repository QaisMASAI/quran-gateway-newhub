import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  BookOpen,
  Heart,
  Flame,
  Award,
  ArrowRight,
  Share2,
  CheckCircle2,
  BookMarked,
} from "lucide-react";
import { getGamificationStats, calculateLevel, awardXP } from "@/lib/gamification";
import { ShareCardModal } from "@/components/ShareCardModal";
import { toast } from "sonner";

export function DailyAssistantWidget({ locale = "en" }: { locale?: "he" | "ar" | "en" }) {
  const [stats, setStats] = useState(getGamificationStats());
  const [shareItem, setShareItem] = useState<{
    open: boolean;
    title: string;
    arabic?: string;
    translation?: string;
    ref?: string;
  }>({ open: false, title: "" });

  useEffect(() => {
    setStats(getGamificationStats());
  }, []);

  const levelInfo = calculateLevel(stats.xp);

  const todayVerse = {
    surah: 2,
    ayah: 286,
    surahName:
      locale === "ar" ? "سورة البقرة" : locale === "he" ? "סורת אל-בקרה" : "Surah Al-Baqarah",
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation:
      locale === "ar"
        ? "لا يكلف الله نفساً إلا ما تطيقه وتحتمله من التكاليف والعبادات."
        : locale === "he"
          ? "אין אלוקים מטיל על נפש אלא כפי יכולתה."
          : "Allah does not burden a soul beyond that it can bear.",
    ref: "Al-Baqarah 2:286",
  };

  const todayTafsir = {
    arabic: "التيسير ورفع الحرج في الشريعة الإسلامية",
    translation:
      locale === "ar"
        ? "تأكيد على رحمة الله بعباده وعدم تكليفهم بما لا يطيقون."
        : locale === "he"
          ? "הדגשה על רחמי ה' שאינו מעמיס עול מעבר ליכולת."
          : "Emphasis on Allah's mercy and wisdom, ensuring religious obligations remain within human capacity.",
    ref: "Tafsir Ibn Kathir",
  };

  const todayDua = {
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma",
    translation:
      locale === "ar"
        ? "رب زدني علماً ونافعاً وفهماً متقبلاً."
        : locale === "he"
          ? "ריבונו של עולם, הוסף לי ידע וחכמה."
          : "O my Sustainer! Increase me in knowledge.",
    ref: "Surah Taha 20:114",
  };

  const handleClaimDailyBonus = () => {
    const updated = awardXP(15);
    setStats(updated);
    toast.success("Daily Dhikr Completed! +15 XP Awarded", {
      icon: "🌟",
    });
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card/95 via-card/90 to-primary/5 p-6 shadow-2xl backdrop-blur-2xl space-y-6">
      {/* Top Header & Streak Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-gold/40 bg-gold/10 p-2.5 text-gold shadow-md">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">
                {locale === "ar"
                  ? "المساعد الإسلامي اليومي"
                  : locale === "he"
                    ? "המסייע היומי האישי"
                    : "Daily Islamic Companion"}
              </h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                Today's Wisdom
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Personalized verse, Tafsir reflection, dua & reading streak tracker
            </p>
          </div>
        </div>

        {/* Gamification Level & Streak Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Flame className="h-4 w-4 text-amber-500 fill-amber-500 animate-bounce" />
            <span>
              {stats.streak}{" "}
              {locale === "ar" ? "أيام متتالية" : locale === "he" ? "ימים ברצף" : "Day Streak"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Award className="h-4 w-4 text-emerald-500" />
            <span>
              {stats.xp} XP • {levelInfo.titleEn}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Content Cards: Verse, Tafsir, Dua */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Today's Verse Card */}
        <div className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-background/80 p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <BookOpen className="h-4 w-4" /> Today's Verse
              </span>
              <button
                type="button"
                onClick={() =>
                  setShareItem({
                    open: true,
                    title: "Share Today's Verse",
                    arabic: todayVerse.arabic,
                    translation: todayVerse.translation,
                    ref: todayVerse.ref,
                  })
                }
                className="text-muted-foreground hover:text-primary transition-colors p-1"
                title="Share Verse"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <p
              className="text-lg leading-loose font-arabic text-right text-emerald-950 dark:text-emerald-200"
              dir="rtl"
            >
              {todayVerse.arabic}
            </p>

            <p className="text-xs text-muted-foreground leading-relaxed italic">
              "{todayVerse.translation}"
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-foreground">{todayVerse.ref}</span>
            <Link
              to="/surah/$id"
              params={{ id: "2" }}
              hash="286"
              className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
            >
              Read Surah <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Today's Tafsir Card */}
        <div className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-background/80 p-5 shadow-sm transition-all hover:border-gold/40 hover:shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gold">
                <BookMarked className="h-4 w-4" /> Tafsir Insight
              </span>
              <button
                type="button"
                onClick={() =>
                  setShareItem({
                    open: true,
                    title: "Share Tafsir Insight",
                    arabic: todayTafsir.arabic,
                    translation: todayTafsir.translation,
                    ref: todayTafsir.ref,
                  })
                }
                className="text-muted-foreground hover:text-gold transition-colors p-1"
                title="Share Insight"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <p
              className="text-base leading-relaxed font-arabic text-right text-amber-950 dark:text-amber-200"
              dir="rtl"
            >
              {todayTafsir.arabic}
            </p>

            <p className="text-xs text-muted-foreground leading-relaxed italic">
              "{todayTafsir.translation}"
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-foreground">{todayTafsir.ref}</span>
            <Link
              to="/tafsir"
              className="inline-flex items-center gap-1 text-gold hover:underline font-semibold"
            >
              Tafsir Studio <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Today's Dua & Action Card */}
        <div className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-background/80 p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                <Heart className="h-4 w-4" /> Daily Dua
              </span>
              <button
                type="button"
                onClick={handleClaimDailyBonus}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 transition-all"
              >
                <CheckCircle2 className="h-3 w-3" /> Dhikr Done (+15 XP)
              </button>
            </div>

            <p
              className="text-xl leading-loose font-arabic text-right text-purple-950 dark:text-purple-200"
              dir="rtl"
            >
              {todayDua.arabic}
            </p>

            <div className="space-y-1">
              <p className="text-[11px] font-mono text-primary font-medium">
                {todayDua.transliteration}
              </p>
              <p className="text-xs text-muted-foreground italic">"{todayDua.translation}"</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-foreground">{todayDua.ref}</span>
            <Link
              to="/ask"
              className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
            >
              Ask AI Research <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      <ShareCardModal
        isOpen={shareItem.open}
        onClose={() => setShareItem((prev) => ({ ...prev, open: false }))}
        title={shareItem.title}
        arabicText={shareItem.arabic}
        translationText={shareItem.translation}
        reference={shareItem.ref}
        type="verse"
      />
    </section>
  );
}
