import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/kids")({
  component: AdminKids,
});

type Row = {
  id?: string;
  category: string;
  age_group: "kids" | "young";
  difficulty: number;
  question: string;
  options: string[];
  answer_index: number;
  hint: string | null;
  related_ref: string | null;
  language_code: string;
  published: boolean;
};

const empty: Row = {
  category: "custom", age_group: "kids", difficulty: 1,
  question: "", options: ["", "", "", ""], answer_index: 0,
  hint: "", related_ref: "", language_code: "en", published: true,
};

function AdminKids() {
  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState<Row>(empty);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("kids_questions").select("*").order("created_at", { ascending: false });
    if (error) setMsg(error.message);
    else setRows((data as Row[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!draft.question.trim() || draft.options.some(o => !o.trim())) { setMsg("Fill question and all options."); return; }
    const { error } = await supabase.from("kids_questions").insert({
      category: draft.category, age_group: draft.age_group, difficulty: draft.difficulty,
      question: draft.question, options: draft.options, answer_index: draft.answer_index,
      hint: draft.hint || null, related_ref: draft.related_ref || null,
      language_code: draft.language_code, published: draft.published,
    });
    if (error) setMsg(error.message);
    else { setMsg("Saved."); setDraft(empty); void load(); }
  };
  const update = async (r: Row) => {
    if (!r.id) return;
    const { error } = await supabase.from("kids_questions").update({
      category: r.category, age_group: r.age_group, difficulty: r.difficulty,
      question: r.question, options: r.options, answer_index: r.answer_index,
      hint: r.hint, related_ref: r.related_ref, language_code: r.language_code, published: r.published,
    }).eq("id", r.id);
    if (error) setMsg(error.message); else setMsg("Updated.");
  };
  const remove = async (id?: string) => {
    if (!id) return;
    if (typeof window !== "undefined" && !window.confirm("Delete this question?")) return;
    const { error } = await supabase.from("kids_questions").delete().eq("id", id);
    if (error) setMsg(error.message); else void load();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Kids Quiz — Question Bank</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage quiz questions shown in the Kids Zone.</p>
      {msg && <p className="mt-3 rounded-lg border border-border bg-card px-3 py-2 text-sm">{msg}</p>}

      <section className="mt-6 rounded-3xl border border-border bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Plus className="h-5 w-5 text-primary" /> New question</h2>
        <QuestionForm value={draft} onChange={setDraft} />
        <button onClick={save} className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Save className="h-4 w-4" /> Save
        </button>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Existing questions ({rows.length})</h2>
          <button onClick={load} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4" /> Reload
          </button>
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="space-y-4">
            {rows.map(r => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <QuestionForm value={r} onChange={patch => setRows(rs => rs.map(x => x.id === r.id ? { ...x, ...patch } : x))} />
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => remove(r.id)} className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/10">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                  <button onClick={() => update(r)} className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                    <Save className="h-3 w-3" /> Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function QuestionForm({ value, onChange }: { value: Row; onChange: (v: Row) => void }) {
  const set = <K extends keyof Row>(k: K, v: Row[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Category
        <input value={value.category} onChange={e => set("category", e.target.value)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      </label>
      <label className="text-sm">Age group
        <select value={value.age_group} onChange={e => set("age_group", e.target.value as "kids" | "young")}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option value="kids">Kids</option>
          <option value="young">Young learners</option>
        </select>
      </label>
      <label className="text-sm">Difficulty (1–3)
        <input type="number" min={1} max={3} value={value.difficulty} onChange={e => set("difficulty", Math.max(1, Math.min(3, Number(e.target.value))))}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      </label>
      <label className="text-sm">Language
        <input value={value.language_code} onChange={e => set("language_code", e.target.value)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      </label>
      <label className="sm:col-span-2 text-sm">Question
        <textarea value={value.question} onChange={e => set("question", e.target.value)} rows={2}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      </label>
      {value.options.map((opt, i) => (
        <label key={i} className="text-sm">Option {i + 1} {value.answer_index === i && <span className="text-emerald-600">(correct)</span>}
          <div className="mt-1 flex gap-2">
            <input value={opt} onChange={e => set("options", value.options.map((o, j) => j === i ? e.target.value : o))}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <button type="button" onClick={() => set("answer_index", i)}
              className={`rounded-lg border px-3 text-xs ${value.answer_index === i ? "border-emerald-500 bg-emerald-500/10" : "border-border"}`}>
              Correct
            </button>
          </div>
        </label>
      ))}
      <label className="text-sm sm:col-span-2">Hint (optional)
        <input value={value.hint ?? ""} onChange={e => set("hint", e.target.value)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      </label>
      <label className="text-sm sm:col-span-2">Related reference (surah:ayah or topic slug)
        <input value={value.related_ref ?? ""} onChange={e => set("related_ref", e.target.value)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={value.published} onChange={e => set("published", e.target.checked)} />
        Published (visible to kids)
      </label>
    </div>
  );
}
