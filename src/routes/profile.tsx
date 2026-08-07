import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { buildUserGamificationFromDb } from "@/lib/gamification-engine-v2";
import { generateAnalyticsSummary } from "@/lib/learning-analytics";

export const Route = createFileRoute("/profile")({
  beforeLoad: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        return {
          userId: null,
          gamificationData: null,
          achievements: [],
          learningEvents: [],
          dailyChallenges: [],
          learningWorlds: [],
          quizSubmissions: [],
          userTopicProgress: [],
          userGamificationState: null,
          analyticsData: generateAnalyticsSummary({ userId: "usr_guest" }),
        };
      }

      // FETCH real data from Supabase tables (90-day window for learning events)
      const [
        { data: gamificationData },
        { data: achievements },
        { data: learningEvents },
        { data: dailyChallenges },
        { data: learningWorlds },
        { data: quizSubmissions },
        { data: userTopicProgress },
      ] = await Promise.all([
        supabase.from("user_gamification").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("user_achievements").select("*").eq("user_id", userId),
        supabase
          .from("learning_events")
          .select("*")
          .eq("user_id", userId)
          .gte("timestamp", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("daily_challenges").select("*").eq("user_id", userId),
        supabase.from("learning_worlds").select("*").eq("user_id", userId),
        supabase.from("quiz_submissions").select("*").eq("user_id", userId),
        supabase.from("user_topic_progress").select("*").eq("user_id", userId),
      ]);

      const userGamificationState = buildUserGamificationFromDb(
        userId,
        gamificationData,
        achievements || [],
        learningEvents || [],
        dailyChallenges || [],
        learningWorlds || []
      );

      const analyticsData = generateAnalyticsSummary({
        userId,
        learningEvents: learningEvents || [],
        quizHistory: quizSubmissions || [],
        topicProgress: userTopicProgress || [],
        userLevel: gamificationData?.level,
        userXp: gamificationData?.total_xp,
        streakDays: gamificationData?.current_streak_days,
      });

      return {
        userId,
        gamificationData,
        achievements: achievements || [],
        learningEvents: learningEvents || [],
        dailyChallenges: dailyChallenges || [],
        learningWorlds: learningWorlds || [],
        quizSubmissions: quizSubmissions || [],
        userTopicProgress: userTopicProgress || [],
        userGamificationState,
        analyticsData,
      };
    } catch (err) {
      console.error("Failed to load gamification and analytics data from Supabase:", err);
      return {
        userId: null,
        gamificationData: null,
        achievements: [],
        learningEvents: [],
        dailyChallenges: [],
        learningWorlds: [],
        quizSubmissions: [],
        userTopicProgress: [],
        userGamificationState: null,
        analyticsData: generateAnalyticsSummary({ userId: "usr_guest" }),
      };
    }
  },
  loader: async ({ context }) => {
    return context;
  },
  head: () => ({
    meta: [
      { title: "Noor Al Quran | My Profile" },
      {
        name: "description",
        content: "Your learning journey, bookmarks, notes and recommended topics.",
      },
      { property: "og:title", content: "Noor Al Quran | My Profile" },
      {
        property: "og:description",
        content: "Your learning journey, bookmarks, notes and recommended topics.",
      },
      { property: "og:url", content: "/profile" },
      { name: "twitter:title", content: "Noor Al Quran | My Profile" },
      {
        name: "twitter:description",
        content: "Your learning journey, bookmarks, notes and recommended topics.",
      },
    ],
    links: [{ rel: "canonical", href: "/profile" }],
  }),
  pendingComponent: () => (
    <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">Loading…</div>
  ),
});
