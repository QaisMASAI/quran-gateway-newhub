import { useState } from "react";
import { MessageSquare, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const isHe = i18n.language === "he";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/public/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, message }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          type: "success",
          text:
            data.message ||
            (isAr
              ? "شكرًا لك! تم استلام رسالتك بنجاح."
              : isHe
                ? "תודה רבה! הודעתך התקבלה בהצלחה."
                : "Thank you! Your feedback has been received."),
        });
        setMessage("");
      } else {
        setStatus({
          type: "error",
          text:
            data.error ||
            (isAr
              ? "فشل في إرسال الملاحظات. يرجى المحاولة لاحقًا."
              : isHe
                ? "שליחת המשוב נכשלה. אנא נסה שוב."
                : "Failed to send feedback. Please try again."),
        });
      }
    } catch (err) {
      console.error("Feedback error", err);
      setStatus({
        type: "error",
        text: isAr
          ? "حدث خطأ في الاتصال بالسيرفر."
          : isHe
            ? "אירעה שגיאה בתקשורת עם השרת."
            : "Network error occurred while sending feedback.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>{isAr ? "الدعم والملاحظات" : isHe ? "תמיכה وמשוב" : "Contact & Feedback"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isAr
              ? "يرجى كتابة ملاحظاتك أو اقتراحاتك أو الإبلاغ عن مشكلة."
              : isHe
                ? "אנא שתף איתנו את הצעותיך, תגובותיך או דיווח על תקלה."
                : "Share your feedback, report an issue, or ask a question."}
          </DialogDescription>
        </DialogHeader>

        {status && (
          <div
            className={`flex items-start gap-2.5 rounded-xl p-3 text-xs ${
              status.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <div>{status.text}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? "الاسم (اختياري)" : isHe ? "שם (רשות)" : "Name (optional)"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAr ? "اسمك" : isHe ? "שמך" : "Your name"}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? "البريد الإلكتروني (اختياري)" : isHe ? "אימייל (רשות)" : "Email (optional)"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? "النوع" : isHe ? "סוג הפנייה" : "Category"}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="general">
                {isAr ? "عام / استفسار" : isHe ? "כללי / שאלה" : "General / Inquiry"}
              </option>
              <option value="bug">
                {isAr ? "الإبلاغ عن خطأ" : isHe ? "דיווח על תקלה" : "Report a Bug"}
              </option>
              <option value="feature">
                {isAr ? "اقتراح ميزة" : isHe ? "הצעת תכונה" : "Feature Request"}
              </option>
              <option value="correction">
                {isAr ? "تصحيح نصي" : isHe ? "תיקון טקסט" : "Text Correction"}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? "الرسالة" : isHe ? "הודעה" : "Message"} *
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isAr
                  ? "اكتب رسالتك هنا..."
                  : isHe
                    ? "כתוב את הודעתך כאן..."
                    : "Type your message here..."
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary"
            >
              {isAr ? "إلغاء" : isHe ? "ביטול" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>{isAr ? "إرسال" : isHe ? "שליחה" : "Send Feedback"}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
