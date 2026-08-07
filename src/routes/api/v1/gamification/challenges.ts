import { createFileRoute } from "@tanstack/react-router";
import { createGatewayHandler } from "@/lib/api-gateway/middleware";
import {
  awardXpEngine,
  loadUserGamification,
  saveUserGamification,
} from "@/lib/gamification-engine-v2";

export const Route = createFileRoute("/api/v1/gamification/challenges")({
  server: {
    handlers: {
      GET: createGatewayHandler<unknown>({
        path: "/api/v1/gamification/challenges",
        method: "GET",
        version: "v1",
        summary: "Get Active Daily Challenges",
        description:
          "Returns rotating Easy (50 XP), Medium (100 XP), and Hard (200 XP) challenges.",
        tags: ["Gamification Engine 2.0"],
        requireAuth: false,
        handler: async () => {
          const profile = loadUserGamification();
          return {
            status: "success",
            data: profile.dailyChallenges,
          };
        },
      }),
      POST: createGatewayHandler<{ challengeId: string }>({
        path: "/api/v1/gamification/challenges",
        method: "POST",
        version: "v1",
        summary: "Claim Challenge XP Reward",
        description: "Claims Easy, Medium, or Hard challenge XP reward before 30 days expiration.",
        tags: ["Gamification Engine 2.0"],
        requireAuth: false,
        handler: async (req) => {
          const { challengeId } = req.body || {};
          const profile = loadUserGamification();
          const challenge = profile.dailyChallenges.find((c) => c.id === challengeId);

          if (!challenge) {
            return { status: "error", message: "Challenge not found." };
          }
          if (challenge.claimed) {
            return { status: "error", message: "Reward already claimed." };
          }

          challenge.completed = true;
          challenge.claimed = true;
          challenge.claimedAt = new Date().toISOString();

          // Award Challenge XP
          const updated = awardXpEngine(profile, challenge.xpReward, "challenge");
          saveUserGamification(updated);

          return {
            status: "success",
            message: `Claimed +${challenge.xpReward} Challenge XP!`,
            data: updated,
          };
        },
      }),
    },
  },
});
