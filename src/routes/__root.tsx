import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BottomNav } from "@/components/BottomNav";
import { DirectionProvider } from "@/components/DirectionProvider";
import { LOCALE_DIR, isLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import "@/lib/i18n";

const ROOT_META = {
  title: "Noor Al Quran | Discover the Quran",
  description:
    "Discover the Quran through clear explanations, guided learning paths, topics, prophets, historical context, and AI-powered exploration.",
  socialDescription:
    "Explore, learn, and understand the Quran through an accessible multilingual learning experience.",
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
      { title: ROOT_META.title },
      {
        name: "description",
        content: ROOT_META.description,
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Noor" },
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
      { name: "apple-mobile-web-app-title", content: "Noor" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/87bafc24-36c0-4a04-9932-644fb84a2d25/id-preview-ec15e1b6--9bec4b72-99d0-482a-9a96-e54882215014.lovable.app-1782073376472.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/87bafc24-36c0-4a04-9932-644fb84a2d25/id-preview-ec15e1b6--9bec4b72-99d0-482a-9a96-e54882215014.lovable.app-1782073376472.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://everyayah.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://api.quran.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Fira+Sans:wght@300;400;500;600;700&family=Heebo:wght@400;500;600;700&family=Amiri+Quran&family=Amiri:wght@400;700&display=swap",
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
          name: "Noor",
          description: "Multilingual Quran learning platform.",
          url: "/",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Noor",
          url: "/",
          description:
            "Discover the Quran through clear explanations, guided learning paths, topics, prophets, and AI-powered exploration.",
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
  // Get initial locale from storage or detect
  const storedLocale = typeof window !== "undefined" 
    ? localStorage.getItem("qc:locale") 
    : null;
  const locale = storedLocale && isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;
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
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

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

  return (
    <QueryClientProvider client={queryClient}>
      <DirectionProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <BottomNav />
      </DirectionProvider>
    </QueryClientProvider>
  );
}
