import React, { useRef } from "react";
import { Award, ShieldCheck, Download, Printer, Sparkles, CheckCircle2 } from "lucide-react";
import { type CompletionCertificate } from "@/lib/habit-engine";
import { Button } from "@/components/ui/button";

interface CertificateViewerModalProps {
  certificate: CompletionCertificate;
  locale: string;
  onClose: () => void;
}

export const CertificateViewerModal: React.FC<CertificateViewerModalProps> = ({
  certificate,
  locale,
  onClose,
}) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const title = isAr
    ? certificate.journeyTitleAr
    : isHe
      ? certificate.journeyTitleHe
      : certificate.journeyTitleEn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-zinc-950 border border-gold/50 shadow-2xl overflow-hidden p-6 sm:p-10 space-y-6 text-center">
        {/* CERTIFICATE CANVAS FRAME */}
        <div
          ref={certRef}
          className="relative p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950/40 border-4 double border-gold/60 shadow-inner space-y-6 text-center overflow-hidden"
        >
          {/* ORNATE CORNER MOTIFS */}
          <div className="absolute top-3 left-3 text-gold/40 text-xl font-serif">✦</div>
          <div className="absolute top-3 right-3 text-gold/40 text-xl font-serif">✦</div>
          <div className="absolute bottom-3 left-3 text-gold/40 text-xl font-serif">✦</div>
          <div className="absolute bottom-3 right-3 text-gold/40 text-xl font-serif">✦</div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-black uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? "شهادة إتمام معتمدة" : isHe ? "תעודת סיום רשמית" : "Verified Certificate of Completion"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-black text-amber-200 tracking-tight pt-2">
              {isAr ? "شهادة إنجاز علمي" : isHe ? "תעודת הצטיינות בלמידה" : "Certificate of Islamic Educational Mastery"}
            </h1>

            <p className="text-xs text-zinc-400 italic">
              {isAr
                ? "تشهد منصة نور القرآن التعليمية بأن الدارس:"
                : isHe
                  ? "פלטפורמת נור אל-קוראן מאשרת כי הלה:"
                  : "Noor Al Quran Platform hereby certifies that:"}
            </p>
          </div>

          <div className="py-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white underline decoration-gold/50 decoration-2 underline-offset-8">
              {certificate.userName}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            {isAr
              ? `قد أتم بنجاح واقتدار جميع المتطلبات والاختبارات المنهجية للمسار المعرفي:`
              : isHe
                ? `השלים בהצלחה את כל הדרישות והמבחנים של מסלול הלימוד:`
                : `has successfully completed all coursework, reflections and assessments for:`}
          </p>

          <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 max-w-lg mx-auto">
            <h3 className="text-lg font-black text-amber-300">{title}</h3>
            {certificate.grade && (
              <span className="text-[11px] font-bold text-amber-400 block mt-1">
                {isAr ? "بدرجة: " : isHe ? "בציון: " : "Grade: "} {certificate.grade}
              </span>
            )}
          </div>

          {/* SEAL AND SIGNATURE FOOTER */}
          <div className="pt-6 border-t border-gold/20 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="text-left space-y-1">
              <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">{isAr ? "رمز التحقق:" : isHe ? "קוד אימות:" : "Verification Code:"}</span>
              <span className="font-mono font-bold text-zinc-300">{certificate.verificationCode}</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-gold border-2 border-white shadow-lg flex items-center justify-center text-zinc-950 font-black text-xs shadow-gold/20">
                <Award className="w-8 h-8 fill-zinc-950" />
              </div>
              <span className="text-[9px] text-gold font-bold uppercase mt-1 tracking-widest">OFFICIAL SEAL</span>
            </div>

            <div className="text-right space-y-1">
              <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">{isAr ? "تاريخ الإصدار:" : isHe ? "תאריך הנפקה:" : "Date Issued:"}</span>
              <span className="font-bold text-zinc-300">{certificate.completedAt}</span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button onClick={onClose} variant="outline" className="rounded-xl text-xs border-zinc-700 text-zinc-300">
            {isAr ? "إغلاق" : isHe ? "סגור" : "Close"}
          </Button>

          <Button onClick={handlePrint} className="bg-gold hover:bg-gold/90 text-zinc-950 font-extrabold rounded-xl text-xs gap-2">
            <Printer className="w-4 h-4" />
            <span>{isAr ? "طباعة الشهادة" : isHe ? "הדפס תעודה" : "Print Certificate"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
