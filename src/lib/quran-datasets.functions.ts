import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  DatasetBundleSchema,
  WordAnnotationsSchema,
  AudioBundleSchema,
} from "@/lib/quran-ingest.server";

async function requireAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (data !== true) throw new Error("Forbidden: admin access required");
}

export const upsertQuranDatasetBundle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DatasetBundleSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { ingestDatasetBundle } = await import("@/lib/quran-ingest.server");
    return ingestDatasetBundle(data, context.userId);
  });

export const upsertQuranWordAnnotations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => WordAnnotationsSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { ingestWordAnnotations } = await import("@/lib/quran-ingest.server");
    return ingestWordAnnotations(data);
  });

export const upsertQuranAudioBundle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AudioBundleSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { ingestAudioBundle } = await import("@/lib/quran-ingest.server");
    return ingestAudioBundle(data);
  });