import React from "react";
import { Download, FileText, Share2, Printer, X, CheckCircle2 } from "lucide-react";
import { exportAnalyticsCsv, AnalyticsSummary } from "@/lib/learning-analytics";

interface AnalyticsExportModalProps {
  summary: AnalyticsSummary;
  onClose: () => void;
  locale?: "en" | "ar" | "he";
}

export const AnalyticsExportModal: React.FC<AnalyticsExportModalProps> = ({
  summary,
  onClose,
  locale = "en",
}) => {
  const isAr = locale === "ar";

  const handlePrintPdf = () => {
    window.print();
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Snapshot link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 dir-auto">
              {isAr ? "تصدير تقرير التحليلات والتقدم" : "Export Analytics & Learning Reports"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
          {isAr
            ? "اختر صيغة التصدير المناسبة للحفظ الشخصي أو المشاركة."
            : "Download your monthly learning summary report in PDF, CSV raw data, or copy a progress snapshot link."}
        </p>

        <div className="space-y-3">
          {/* Option 1: PDF Monthly Summary */}
          <button
            onClick={handlePrintPdf}
            className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                  {isAr ? "طباعة / تصدير PDF للتقرير الشهري" : "Print / PDF Monthly Summary Report"}
                </div>
                <div className="text-[10px] text-zinc-400">
                  Formatted visual report for printing or saving to PDF
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400" />
          </button>

          {/* Option 2: CSV Data Export */}
          <button
            onClick={() => exportAnalyticsCsv(summary)}
            className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                  {isAr ? "تصدير البيانات الخام (CSV)" : "Export Raw Data (CSV Format)"}
                </div>
                <div className="text-[10px] text-zinc-400">
                  Download all metrics, timestamps, and quiz records
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400" />
          </button>

          {/* Option 3: Shareable Snapshot Link */}
          <button
            onClick={handleShareLink}
            className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                  {isAr ? "نسخ رابط لقطة الإنجازات" : "Copy Progress Snapshot Share Link"}
                </div>
                <div className="text-[10px] text-zinc-400">
                  Share your achievements with friends and study circles
                </div>
              </div>
            </div>
            <Share2 className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
};
