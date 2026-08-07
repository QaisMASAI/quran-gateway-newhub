import { createFileRoute } from "@tanstack/react-router";
import { createGatewayHandler } from "@/lib/api-gateway/middleware";
import { getLeaderboardData, loadUserGamification } from "@/lib/gamification-engine-v2";

export const Route = createFileRoute("/api/v1/gamification/leaderboard")({
  server: {
    handlers: {
      GET: createGatewayHandler<unknown>({
        path: "/api/v1/gamification/leaderboard",
        method: "GET",
        version: "v1",
        summary: "Get Leaderboards (Global Top 1,000, Weekly, Topics)",
        description: "Returns leaderboard entries sorted by total or weekly XP.",
        tags: ["Gamification Engine 2.0"],
        requireAuth: false,
        handler: async (req) => {
          const type = (req.query?.type as "global" | "weekly" | "topic") || "global";
          const profile = loadUserGamification();
          const leaderboard = getLeaderboardData(type, profile.userId);

          return {
            status: "success",
            type,
            data: leaderboard,
          };
        },
      }),
    },
  },
});
