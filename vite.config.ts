// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

function suppressDevErrorCollector500(): Plugin {
  const endpoint = "/__lovable/error-collector";
  return {
    name: "suppress-dev-error-collector-500",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "POST" || !req.url?.startsWith(endpoint)) {
          return next();
        }

        req.on("data", () => {
          // drain request body
        });
        req.on("end", () => {
          if (!res.writableEnded) {
            res.statusCode = 204;
            res.end();
          }
        });
        req.on("error", () => {
          if (!res.writableEnded) {
            res.statusCode = 204;
            res.end();
          }
        });
      });
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [suppressDevErrorCollector500()],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
