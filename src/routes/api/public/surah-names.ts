import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/surah-names")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("quran_chapters")
          .select("chapter_number,name_he,name_simple_en,name_ar")
          .order("chapter_number", { ascending: true });

        if (error) {
          return Response.json({ items: [] }, { status: 500 });
        }

        return Response.json({ items: data ?? [] });
      },
    },
  },
});
