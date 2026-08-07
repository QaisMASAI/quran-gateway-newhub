import { createFileRoute } from "@tanstack/react-router";
import { createGatewayHandler } from "@/lib/api-gateway/middleware";
import { executePrestigeReset, loadUserGamification } from "@/lib/gamification-engine-v2";

export const Route = createFileRoute("/api/v1/gamification/prestige")({
  server: {
    handlers: {
      POST: createGatewayHandler<unknown>({
        path: "/api/v1/gamification/prestige",
        method: "POST",
        version: "v1",
        summary: "Execute Prestige Reset at Level 100",
        description:
          "Resets level to 1, increases prestige rank by +1, and grants 1.1x XP boost multiplier.",
        tags: ["Gamification Engine 2.0"],
        requireAuth: false,
        handler: async () => {
          const profile = loadUserGamification();
          const result = executePrestigeReset(profile);

          return {
            status: result.success ? "success" : "error",
            message: result.message,
            data: profile,
          };
        },
      }),
    },
  },
});
