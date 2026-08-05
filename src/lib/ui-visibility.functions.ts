import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const NavKeySchema = z.enum([
  "surahs",
  "stories",
  "research",
  "learn",
  "tafsir",
  "search",
  "kids",
  "collections",
  "admin_kids",
  "admin_setup",
  "admin_backfill",
]);

const UiVisibilitySchema = z.object({
  hiddenNav: z.array(NavKeySchema).default([]),
  enabledLocales: z.array(z.enum(["he", "ar", "en"])).default(["he", "ar", "en"]),
});

export type UiVisibilitySettings = z.infer<typeof UiVisibilitySchema>;

const DEFAULT_SETTINGS: UiVisibilitySettings = {
  hiddenNav: [],
  enabledLocales: ["he", "ar", "en"],
};

function normalize(raw: unknown): UiVisibilitySettings {
  const parsed = UiVisibilitySchema.safeParse(raw ?? {});
  if (!parsed.success) return DEFAULT_SETTINGS;

  const dedupLocales = Array.from(new Set(parsed.data.enabledLocales));
  return {
    hiddenNav: Array.from(new Set(parsed.data.hiddenNav)),
    enabledLocales: dedupLocales.length > 0 ? dedupLocales : ["he", "ar", "en"],
  };
}

export const getUiVisibilitySettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("admin_runtime_settings")
    .select("value_json")
    .eq("key", "ui_visibility")
    .maybeSingle();

  return normalize(data?.value_json);
});

export const updateUiVisibilitySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UiVisibilitySchema.parse(input ?? {}))
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const next = normalize(data);
    const { error } = await context.supabase.from("admin_runtime_settings").upsert(
      {
        key: "ui_visibility",
        value_json: next as never,
        updated_by: context.userId,
      },
      { onConflict: "key" },
    );

    if (error) throw new Error(error.message);
    return { ok: true as const, settings: next };
  });
