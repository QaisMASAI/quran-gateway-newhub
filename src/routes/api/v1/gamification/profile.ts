import { createFileRoute } from "@tanstack/react-router";
import { createGatewayHandler } from "@/lib/api-gateway/middleware";
import { loadUserGamification } from "@/lib/gamification-engine-v2";

export const Route = createFileRoute("/api/v1/gamification/profile")({
  server: {
    handlers: {
      GET: createGatewayHandler<unknown>({
        path: "/api/v1/gamification/profile",
        method: "GET",
        version: "v1",
        summary: "Retrieve Gamification 2.0 User Profile",
        description:
          "Returns Level 1-100, Prestige, XP breakdown, 6 Learning Worlds progress, Daily Challenges, and Streaks.",
        tags: ["Gamification Engine 2.0"],
        requireAuth: false,
        handler: async (req) => {
          const profile = loadUserGamification();
          if (req.user?.id) {
            profile.userId = req.user.id;
          }
          return {
            status: "success",
            data: profile,
          };
        },
      }),
    },
  },
});
