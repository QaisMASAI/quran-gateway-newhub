import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/Logo";
import { Loader2, Mail, Lock, AlertCircle, ChevronLeft } from "lucide-react";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Noor Al Quran| Sign in" },
      {
        name: "description",
        content: "Sign in or create an account to save verses, personal notes, and track your reading progress.",
      },
      { property: "og:title", content: "Noor Al Quran| Sign in" },
      {
        property: "og:description",
        content: "Sign in or create an account to save verses, notes, and reading progress.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const { t } = useTranslation("common");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: (redirect as string) || "/", replace: true });
      }
    });
  }, [navigate, redirect]);

  const translateAuthError = (msg: string): string => {
    if (/invalid login credentials/i.test(msg)) return t("ui.auth.invalidCreds");
    if (/already registered/i.test(msg) || /already exists/i.test(msg)) return t("ui.auth.alreadyRegistered");
    if (/email.*confirm/i.test(msg)) return t("ui.auth.emailNotConfirmed");
    if (/password/i.test(msg) && /6/.test(msg)) return t("ui.auth.weakPassword");
    return msg;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name || undefined },
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (err) throw err;
        const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
        if (!signErr) {
          navigate({ to: redirect || "/", replace: true });
          return;
        }
        setError(t("ui.auth.confirmEmail"));
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        navigate({ to: redirect || "/", replace: true });
      }
    } catch (e) {
      setError(e instanceof Error ? translateAuthError(e.message) : t("ui.auth.genericError"));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: typeof window !== "undefined" ? window.location.origin : undefined,
    });
    if (result.error) {
      setError(t("ui.auth.googleFailed"));
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: redirect || "/", replace: true });
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-10"
      style={{ background: "var(--gradient-hero)" }}
    >
      <Link
        to="/"
        className="absolute top-4 end-4 inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/20"
      >
        <ChevronLeft className="h-3 w-3" />
        {t("common.home")}
      </Link>

      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur-sm">
            <Logo className="h-10 w-10" />
          </div>
          <h1 className="mt-3 text-2xl font-bold">
            {mode === "signin" ? t("ui.auth.welcomeBack") : t("ui.auth.createAccount")}
          </h1>
          <p className="mt-1 text-sm text-white/80">
            {mode === "signin" ? t("ui.auth.signinSubtitle") : t("ui.auth.signupSubtitle")}
          </p>
        </div>

        <div className="surface-card px-5 py-6 sm:px-7">
          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
          >
            <GoogleIcon />
            Google
          </button>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {t("ui.auth.email")}
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <Field label={t("ui.auth.displayName")}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-base"
                  placeholder={t("ui.auth.displayNamePlaceholder")}
                />
              </Field>
            )}
            <Field label={t("ui.auth.email")} icon={<Mail className="h-3.5 w-3.5" />}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                placeholder="you@example.com"
                dir="ltr"
              />
            </Field>
            <Field label={t("ui.auth.password")} icon={<Lock className="h-3.5 w-3.5" />}>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
                placeholder={t("ui.auth.passwordPlaceholder")}
                dir="ltr"
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? t("ui.auth.submitSignin") : t("ui.auth.submitSignup")}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-muted-foreground">
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signin" ? t("ui.auth.createAccount") : t("ui.auth.submitSignin")}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .input-base {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input-base:focus { border-color: hsl(var(--primary)); box-shadow: 0 0 0 3px hsl(var(--primary) / .15); }
      `}</style>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5 17.6 35.5 12.5 30.4 12.5 24S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 6.4 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 6.4 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5.1 0 9.8-1.9 13.3-5.1l-6.2-5c-2 1.4-4.5 2.1-7.1 2.1-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.7 39 16.3 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.2 5C40.9 36.6 43.5 30.8 43.5 24c0-1.2-.1-2.3-.3-3.5z"
      />
    </svg>
  );
}
