import { PremiumVerseCard } from "@/components/quran/PremiumVerseCard";

interface Props {
  surah: number;
  surahName: string;
  ayah: number;
  arabic: string;
  hebrew: string;
  highlight?: string;
  maxAyahInSurah?: number;
}

export function AyahCard(props: Props) {
  return <PremiumVerseCard {...props} />;
}
