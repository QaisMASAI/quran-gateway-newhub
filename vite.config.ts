// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

function suppressDevErrorCollector500(): Plugin {
  const endpoint = "/__lovable/error-collector";
  const debugEndpoint = "/__lovable/dev-error-status";

  type DevCollectorState = {
    interceptedCount: number;
    lastInterceptedAt: string | null;
    lastPayloadSnippet: string | null;
    lastViteError: string | null;
  };

  const state: DevCollectorState = {
    interceptedCount: 0,
    lastInterceptedAt: null,
    lastPayloadSnippet: null,
    lastViteError: null,
  };

  const updateLastViteError = (message: string) => {
    const normalized = message.trim();
    if (!normalized) return;
    const lowered = normalized.toLowerCase();
    if (
      lowered.includes("error") ||
      lowered.includes("failed") ||
      lowered.includes("transform") ||
      lowered.includes("ts2339") ||
      lowered.includes("ts2493")
    ) {
      state.lastViteError = normalized.slice(0, 2000);
    }
  };

  return {
    name: "suppress-dev-error-collector-500",
    apply: "serve",
    configureServer(server) {
      const logger = server.config.logger;
      const originalLoggerError = logger.error.bind(logger);
      logger.error = (msg, options) => {
        updateLastViteError(typeof msg === "string" ? msg : String(msg));
        return originalLoggerError(msg, options);
      };

      const middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.method === "GET" && req.url?.startsWith(debugEndpoint)) {
          if (!res.writableEnded) {
            res.statusCode = 200;
            res.setHeader("content-type", "application/json; charset=utf-8");
            res.end(JSON.stringify(state));
          }
          return;
        }

        if (req.method !== "POST" || !req.url?.startsWith(endpoint)) {
          return next();
        }

        state.interceptedCount += 1;
        state.lastInterceptedAt = new Date().toISOString();

        let payload = "";
        let finalized = false;
        const finalize = () => {
          if (finalized) return;
          finalized = true;
          state.lastPayloadSnippet = payload.slice(0, 2000);
          if (!res.writableEnded) {
            res.statusCode = 204;
            res.setHeader("x-lovable-error-collector", "intercepted");
            res.end();
          }
        };

        req.on("data", (chunk: Buffer | string) => {
          if (payload.length >= 2000) return;
          payload += typeof chunk === "string" ? chunk : chunk.toString("utf8");
        });
        req.on("end", finalize);
        req.on("error", finalize);
        req.on("aborted", finalize);
        req.on("close", finalize);
      };

      // Ensure this runs before Lovable's internal error collector middleware.
      (
        server.middlewares as unknown as {
          stack?: Array<{ route: string; handle: typeof middleware }>;
        }
      ).stack?.unshift({ route: "", handle: middleware });
    },
  };
}

export default defineConfig({
  plugins: [
    suppressDevErrorCollector500(),
    VitePWA({
      strategies: "generateSW",
      filename: "sw.js",
      injectRegister: null,
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "app-html-navigation",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 2 },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              /\.(?:js|mjs|css|woff2?|png|jpg|jpeg|webp|svg|ico)$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "app-built-assets",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
        ],
      },
      manifest: false,
    }),
  ],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
