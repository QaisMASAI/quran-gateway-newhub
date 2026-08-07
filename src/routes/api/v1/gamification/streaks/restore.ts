import { createFileRoute } from "@tanstack/react-router";
import { createGatewayHandler } from "@/lib/api-gateway/middleware";
import { loadUserGamification, restoreStreak } from "@/lib/gamification-engine-v2";

export const Route = createFileRoute("/api/v1/gamification/streaks/restore")({
  server: {
    handlers: {
      POST: createGatewayHandler<unknown>({
        path: "/api/v1/gamification/streaks/restore",
        method: "POST",
        version: "v1",
        summary: "Restore Broken Streak",
        description: "Restores broken daily streak by deducting 100 gems.",
        tags: ["Gamification Engine 2.0"],
        requireAuth: false,
        handler: async () => {
          const profile = loadUserGamification();
          const result = restoreStreak(profile);

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
