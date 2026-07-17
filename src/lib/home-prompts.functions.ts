import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const HomePromptEventSchema = z.object({
  event: z.enum(["home_prompt_navigate", "prefill_applied"]),
  destination: z.enum(["/search", "/ask"]),
  source: z.enum(["hero_input", "popular_questions", "unknown"]),
  q: z.string().min(1).max(240),
  qState: z.enum(["missing", "empty", "invalid", "ok"]).optional(),
});

export const trackHomePromptEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => HomePromptEventSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bucketDate = new Date().toISOString().slice(0, 10);
    const key = `home_prompt_telemetry_${bucketDate}`;

    const { data: current } = await supabaseAdmin
      .from("admin_runtime_settings")
      .select("value_json")
      .eq("key", key)
      .maybeSingle();

    const value = (current?.value_json ?? {
      home_prompt_navigate: 0,
      prefill_applied: 0,
      destinations: {},
      sources: {},
      q_states: {},
    }) as {
      home_prompt_navigate?: number;
      prefill_applied?: number;
      destinations?: Record<string, number>;
      sources?: Record<string, number>;
      q_states?: Record<string, number>;
    };

    value.destinations = value.destinations ?? {};
    value.sources = value.sources ?? {};
    value.q_states = value.q_states ?? {};

    if (data.event === "home_prompt_navigate") {
      value.home_prompt_navigate = (value.home_prompt_navigate ?? 0) + 1;
    }
    if (data.event === "prefill_applied") {
      value.prefill_applied = (value.prefill_applied ?? 0) + 1;
    }

    value.destinations[data.destination] = (value.destinations[data.destination] ?? 0) + 1;
    value.sources[data.source] = (value.sources[data.source] ?? 0) + 1;

    if (data.qState) {
      value.q_states[data.qState] = (value.q_states[data.qState] ?? 0) + 1;
    }

    await supabaseAdmin.from("admin_runtime_settings").upsert(
      {
        key,
        value_json: value as never,
      },
      { onConflict: "key" },
    );

    return { ok: true as const };
  });
