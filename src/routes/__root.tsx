import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { AudioPlayerProvider } from "@/lib/audio-player-context";
import { GlobalAudioPlayer } from "@/components/GlobalAudioPlayer";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BottomNav } from "@/components/BottomNav";
import { DirectionProvider } from "@/components/DirectionProvider";
import i18n, { LOCALE_DIR, DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n";
import { registerAppServiceWorker } from "@/lib/register-app-sw";
import "@/lib/i18n";

const ROOT_META = {
  title: "Noor Al-Huda AI | Quran & Sunnah Knowledge Hub",
  description:
    "Explore Quran and Sahih Hadith with grounded citations, Jalalayn-only tafsir, knowledge graph discovery, and multilingual AI research.",
  socialDescription: "Grounded Quran + Hadith learning with Jalalayn-only tafsir and citation-first AI research.",
};

function NotFoundComponent() {
  const { t, i18n } = useTranslation("common");
  const isRtl = i18n.dir() === "rtl";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <p className="mt-3 font-arabic text-2xl text-gold" dir="rtl" lang="ar">
          الصَّفْحَةُ غَيْرُ مَوْجُودَة
        </p>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("errors.notFoundTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("errors.notFoundBody")}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("common.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const isRtl = i18n.dir() === "rtl";

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-md text-center">
        <p className="font-arabic text-2xl text-gold" dir="rtl" lang="ar">
          إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
        </p>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">{t("errors.genericTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("errors.genericBody")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("common.retry")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            {t("common.home")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "19JbW8SaOz8mtUuWndZJsrjirHpwjkaGf1RLNeCJPMk" },
      { title: ROOT_META.title },
      {
        name: "description",
        content: ROOT_META.description,
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Noor Quran & Hadith" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: ROOT_META.title },
      { name: "twitter:title", content: ROOT_META.title },
      {
        property: "og:description",
        content: ROOT_META.socialDescription,
      },
      {
        name: "twitter:description",
        content: ROOT_META.socialDescription,
      },
      { name: "theme-color", content: "#0f1115" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Noor Quran & Hadith" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      { rel: "alternate", hrefLang: "en", href: "/" },
      { rel: "alternate", hrefLang: "ar", href: "/" },
      { rel: "alternate", hrefLang: "he", href: "/" },
      { rel: "alternate", hrefLang: "x-default", href: "/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://everyayah.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://api.quran.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Noor Quran & Hadith",
          description: "Multilingual Quran and Hadith learning platform with Jalalayn-only tafsir.",
          url: "/",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Noor Quran & Hadith",
          url: "/",
          description:
            "Explore Quran and Sahih Hadith with Jalalayn-only tafsir, grounded citations, and AI-powered multilingual research.",
          potentialAction: {
            "@type": "SearchAction",
            target: "/search?q={query}",
            "query-input": "required name=query",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // Keep SSR/CSR markup stable; DirectionProvider syncs locale + dir after hydration.
  const locale = normalizeLocale(i18n.resolvedLanguage) ?? DEFAULT_LOCALE;
  const dir = LOCALE_DIR[locale];

  return (
    <html lang={locale} dir={dir}>
      <head>
        {/* Pre-paint theme bootstrap — prevents dark-mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('qc:theme');var d=t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <HeadContent />
      </head>
      <body className="pb-16 sm:pb-0" dir={dir}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2.5 focus:text-xs focus:font-bold focus:text-primary-foreground focus:shadow-xl focus:ring-2 focus:ring-gold"
        >
          Skip to main content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [devErrorStatus, setDevErrorStatus] = useState<{
    interceptedCount: number;
    lastViteError: string | null;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = router.state.location.pathname;
    // Don't bounce while users are mid-flow on auth, onboarding, or sitemap.
    if (path === "/onboarding" || path === "/auth") return;
    try {
      const raw = window.localStorage.getItem("noor:onboarding:v1");
      if (raw) return; // user has seen or skipped onboarding
      // Only redirect on the root landing to avoid disrupting deep links.
      if (path === "/") router.navigate({ to: "/onboarding" });
    } catch {
      /* ignore */
    }
  }, [router]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch("/__lovable/dev-error-status", {
          method: "GET",
          headers: { accept: "application/json" },
        });
        if (!res.ok) return;
        const json = (await res.json()) as {
          interceptedCount?: number;
          lastViteError?: string | null;
        };
        if (cancelled) return;
        setDevErrorStatus({
          interceptedCount: json.interceptedCount ?? 0,
          lastViteError: json.lastViteError ?? null,
        });
      } catch {
        // noop in local/dev only banner
      }
    };

    void poll();
    const id = window.setInterval(() => {
      void poll();
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    void registerAppServiceWorker();
  }, []);

  const showDevBanner =
    import.meta.env.DEV && !!devErrorStatus && (devErrorStatus.interceptedCount > 0 || !!devErrorStatus.lastViteError);

  return (
    <QueryClientProvider client={queryClient}>
      <AudioPlayerProvider>
        <DirectionProvider>
          {showDevBanner ? (
            <div className="sticky top-0 z-50 border-b border-warning/40 bg-warning-soft px-4 py-2 text-xs text-warning-foreground">
              <strong>Dev middleware active:</strong> intercepted /__lovable/error-collector{" "}
              {devErrorStatus?.interceptedCount ?? 0} time(s).
              {devErrorStatus?.lastViteError ? (
                <span className="ml-2">Latest Vite error: {devErrorStatus.lastViteError}</span>
              ) : (
                <span className="ml-2">No underlying Vite transform/build error captured yet.</span>
              )}
            </div>
          ) : null}
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <main id="main-content" tabIndex={-1} className="outline-none">
            <Outlet />
          </main>
          <GlobalAudioPlayer />
          <BottomNav />
        </DirectionProvider>
      </AudioPlayerProvider>
    </QueryClientProvider>
  );
}
