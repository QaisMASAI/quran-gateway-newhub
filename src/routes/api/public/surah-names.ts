import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/public/surah-names")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const supabaseUrl = process.env["SUPABASE_URL"];
          const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];

          if (!supabaseUrl || !publishableKey) {
            return Response.json({ items: [] });
          }

          const supabasePublic = createClient<Database>(supabaseUrl, publishableKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          });

          const { data, error } = await supabasePublic
            .from("quran_chapters")
            .select("chapter_number,name_he,name_simple_en,name_ar")
            .order("chapter_number", { ascending: true });

          if (error) {
            console.error("Failed to load surah names", error);
            return Response.json({ items: [] });
          }

          return Response.json({ items: data ?? [] });
        } catch (error) {
          console.error("Unexpected surah names error", error);
          return Response.json({ items: [] });
        }
      },
    },
  },
});
