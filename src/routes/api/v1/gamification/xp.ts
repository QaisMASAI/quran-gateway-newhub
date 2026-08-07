import { createFileRoute } from "@tanstack/react-router";
import { createGatewayHandler } from "@/lib/api-gateway/middleware";
import {
  awardXpEngine,
  loadUserGamification,
  type WorldId,
  type XpSourceCategory,
} from "@/lib/gamification-engine-v2";

export const Route = createFileRoute("/api/v1/gamification/xp")({
  server: {
    handlers: {
      POST: createGatewayHandler<{
        amount: number;
        category: XpSourceCategory;
        worldId?: WorldId;
      }>({
        path: "/api/v1/gamification/xp",
        method: "POST",
        version: "v1",
        summary: "Award XP to User with Category & World Specialization",
        description:
          "Awards Knowledge (10-50), Mastery (50-200), Consistency (5-10), Challenge (100-500), or Social (25-75) XP with Prestige multiplier support.",
        tags: ["Gamification Engine 2.0"],
        requireAuth: false,
        handler: async (req) => {
          const body = req.body || { amount: 25, category: "knowledge" };
          const data = loadUserGamification();
          const updated = awardXpEngine(data, body.amount, body.category, body.worldId);

          return {
            status: "success",
            message: `Awarded ${body.amount} ${body.category} XP successfully!`,
            data: updated,
          };
        },
      }),
    },
  },
});
