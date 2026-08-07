import { createLazyFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/Logo";
import { Loader2, Mail, Lock, AlertCircle, ChevronLeft, ShieldCheck, KeyRound, QrCode } from "lucide-react";
import { generateTotpSecret, verifyTotpToken, provisionUser2FA } from "@/lib/security/totp";
import { validatePiiHandling, encryptSensitiveData, maskEmail } from "@/lib/security/rbac-pii";
import { checkRateLimit, recordFailedAttempt, resetFailedAttempts } from "@/lib/security/rate-limiting";

export const Route = createLazyFileRoute("/auth")({
  component: AuthPage,
});

export function TwoFactorAuthPrompt({
  userId,
  secret,
  onSuccess,
  onCancel,
}: {
  userId: string;
  secret: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = () => {
    setError(null);
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }
    setVerifying(true);
    try {
      const isValid = verifyTotpToken(code, secret);
      if (isValid) {
        onSuccess();
      } else {
        setError("Invalid 2FA verification code. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid 2FA token format.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-card p-6 shadow-lg">
      <div className="flex items-center gap-3 border-b border-border/50 pb-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Two-Factor Authentication</h2>
          <p className="text-xs text-muted-foreground">
            Verify your account with your authenticator app
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Enter the 6-digit numeric code from your authenticator app (e.g. Google Authenticator, Authy).
      </p>

      <div className="space-y-2">
        <input
          type="text"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-center text-xl font-mono tracking-[0.5em] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          dir="ltr"
          autoFocus
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || code.length !== 6}
          className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {verifying ? "Verifying…" : "Verify Code"}
        </button>
      </div>
    </div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const safeRedirect = useMemo(
    () => (redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/"),
    [redirect],
  );
  const { t } = useTranslation("common");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA state
  const [pending2FA, setPending2FA] = useState<{ userId: string; secret: string } | null>(null);

  // 2FA setup mode state
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [setupConfirmCode, setSetupConfirmCode] = useState("");
  const [setupStatus, setSetupStatus] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session && !pending2FA) {
        navigate({ to: safeRedirect, replace: true });
      }
    });
    return () => {
      mounted = false;
    };
  }, [navigate, safeRedirect, pending2FA]);

  const translateAuthError = (msg: string): string => {
    if (/invalid login credentials/i.test(msg)) return t("ui.auth.invalidCreds");
    if (/already registered/i.test(msg) || /already exists/i.test(msg))
      return t("ui.auth.alreadyRegistered");
    if (/email.*confirm/i.test(msg)) return t("ui.auth.emailNotConfirmed");
    if (/password/i.test(msg) && /6/.test(msg)) return t("ui.auth.weakPassword");
    return msg;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || password.length < 6) {
      setError(t("ui.auth.genericError"));
      return;
    }
    setError(null);
    setBusy(true);

    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { full_name: name.trim() || undefined },
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (err) throw err;

        const { error: signErr } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (!signErr) {
          navigate({ to: safeRedirect, replace: true });
          return;
        }
        setError(t("ui.auth.confirmEmail"));
      } else {
        // Rate Limiting Check (5 attempts per 60 mins)
        const isRateLimited = await checkRateLimit("login_attempt", trimmedEmail, {
          maxAttempts: 5,
          windowMinutes: 60,
        });

        if (isRateLimited) {
          throw new Error("Too many failed login attempts. Please try again in 1 hour.");
        }

        const { data: authRes, error: err } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (err) {
          await recordFailedAttempt("login_attempt", trimmedEmail, 60);
          console.log("Failed login attempt for user:", maskEmail(trimmedEmail));
          throw err;
        }

        await resetFailedAttempts("login_attempt", trimmedEmail);
        console.log("User authentication successful:", maskEmail(trimmedEmail));

        // Check if 2FA is enabled for this user
        if (authRes.user?.id) {
          const { data: totpSettings } = await supabase
            .from("user_2fa_settings")
            .select("enabled, secret")
            .eq("user_id", authRes.user.id)
            .maybeSingle();

          if (totpSettings?.enabled && totpSettings?.secret) {
            setPending2FA({
              userId: authRes.user.id,
              secret: totpSettings.secret,
            });
            setBusy(false);
            return;
          }
        }

        navigate({ to: safeRedirect, replace: true });
      }
    } catch (e: any) {
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
    navigate({ to: safeRedirect, replace: true });
  };

  const handleStart2FASetup = () => {
    const provisioning = provisionUser2FA(email || "user@quran.app");
    setSetupData({
      secret: provisioning.secret,
      qrCodeUrl: provisioning.qrCodeUrl,
      backupCodes: provisioning.backupCodes,
    });
    setShow2FASetup(true);
  };

  const handleConfirm2FASetup = async () => {
    if (!setupData || setupConfirmCode.length !== 6) return;
    try {
      const isValid = verifyTotpToken(setupConfirmCode, setupData.secret);
      if (!isValid) {
        setSetupStatus("Invalid token. Please check code on your authenticator app.");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        const encryptedSecret = encryptSensitiveData(setupData.secret);
        await supabase.from("user_2fa_settings").upsert({
          user_id: userData.user.id,
          enabled: true,
          secret: encryptedSecret,
          backup_codes: setupData.backupCodes,
          updated_at: new Date().toISOString(),
        });
      }

      setSetupStatus("2FA has been successfully configured and activated!");
      setTimeout(() => {
        setShow2FASetup(false);
        setSetupData(null);
        setSetupConfirmCode("");
        setSetupStatus(null);
      }, 2000);
    } catch (err: any) {
      setSetupStatus(err.message || "2FA verification failed.");
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-10"
      style={{ background: "var(--gradient-hero)" }}
    >
      <Link
        to="/"
        className="absolute end-4 top-4 inline-flex min-h-11 items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/20"
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

        {/* 2FA Verification Step */}
        {pending2FA ? (
          <TwoFactorAuthPrompt
            userId={pending2FA.userId}
            secret={pending2FA.secret}
            onSuccess={() => {
              setPending2FA(null);
              navigate({ to: safeRedirect, replace: true });
            }}
            onCancel={() => setPending2FA(null)}
          />
        ) : (
          <div className="surface-card px-5 py-6 sm:px-7 space-y-4">
            <button
              type="button"
              onClick={google}
              disabled={busy}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
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
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signin" ? t("ui.auth.submitSignin") : t("ui.auth.submitSignup")}
              </button>
            </form>

            <div className="mt-4 flex flex-col items-center gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-medium text-primary hover:underline"
              >
                {mode === "signin" ? t("ui.auth.createAccount") : t("ui.auth.submitSignin")}
              </button>

              <button
                type="button"
                onClick={handleStart2FASetup}
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground/80 hover:text-foreground"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Configure Two-Factor Auth (2FA)</span>
              </button>
            </div>

            {/* 2FA Setup Flow Card */}
            {show2FASetup && setupData && (
              <div className="mt-4 space-y-3 rounded-xl border border-gold/40 bg-gold/5 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">Set Up Authenticator App</h3>
                  <button
                    type="button"
                    onClick={() => setShow2FASetup(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-muted-foreground">
                  Scan this QR code with Google Authenticator or Authy to configure 2FA:
                </p>

                <div className="flex justify-center p-2 bg-white rounded-lg inline-block mx-auto border">
                  <img src={setupData.qrCodeUrl} alt="2FA QR Code" className="h-36 w-36" />
                </div>

                <div className="rounded border border-border bg-background p-2 font-mono text-[10px] break-all text-center">
                  Secret: {setupData.secret}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-foreground">
                    Confirm Code:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={setupConfirmCode}
                      onChange={(e) => setSetupConfirmCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="input-base tracking-widest text-center font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleConfirm2FASetup}
                      className="rounded bg-primary px-3 py-1 font-bold text-primary-foreground"
                    >
                      Enable
                    </button>
                  </div>
                </div>

                {setupStatus && (
                  <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    {setupStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
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
