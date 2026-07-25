import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, Plus, RefreshCw, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
  question_kind: "mcq" | "interactive";
  expected_answer: string | null;
  hint: string | null;
  related_ref: string | null;
  language_code: string;
  published: boolean;
};

const empty: Row = {
  category: "custom", age_group: "kids", difficulty: 1,
  question: "", options: ["", "", "", ""], answer_index: 0,
  question_kind: "mcq", expected_answer: "",
  hint: "", related_ref: "", language_code: "en", published: true,
};

function csvEscape(value: string | number | boolean | null | undefined) {
  const raw = String(value ?? "");
  if (/[,"\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      out.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  out.push(current.trim());
  return out;
}

function AdminKids() {
  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState<Row>(empty);
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterAge, setFilterAge] = useState<"all" | "kids" | "young">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<"all" | "1" | "2" | "3">("all");
  const [msg, setMsg] = useState("");
  const [importing, setImporting] = useState(false);
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
    const isInteractive = draft.question_kind === "interactive";
    if (!draft.question.trim()) {
      setMsg("Fill the question text.");
      return;
    }
    if (!isInteractive && draft.options.some((o) => !o.trim())) {
      setMsg("Fill all answer options for MCQ questions.");
      return;
    }
    if (isInteractive && !(draft.expected_answer ?? "").trim()) {
      setMsg("Interactive exercises need an expected answer.");
      return;
    }

    const { error } = await supabase.from("kids_questions").insert({
      category: draft.category, age_group: draft.age_group, difficulty: draft.difficulty,
      question: draft.question, options: draft.options, answer_index: draft.answer_index,
      question_kind: draft.question_kind,
      expected_answer: draft.question_kind === "interactive" ? draft.expected_answer || null : null,
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
      question_kind: r.question_kind,
      expected_answer: r.question_kind === "interactive" ? r.expected_answer : null,
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

  const categories = Array.from(new Set(rows.map((row) => row.category))).sort((a, b) =>
    a.localeCompare(b),
  );

  const filteredRows = rows.filter((row) => {
    if (filterCategory !== "all" && row.category !== filterCategory) return false;
    if (filterAge !== "all" && row.age_group !== filterAge) return false;
    if (filterDifficulty !== "all" && String(row.difficulty) !== filterDifficulty) return false;

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;
    return (
      row.question.toLowerCase().includes(normalizedQuery) ||
      row.category.toLowerCase().includes(normalizedQuery) ||
      (row.related_ref ?? "").toLowerCase().includes(normalizedQuery)
    );
  });

  const exportCsv = () => {
    const headers = [
      "id",
      "category",
      "age_group",
      "difficulty",
      "question",
      "option_1",
      "option_2",
      "option_3",
      "option_4",
      "answer_index",
      "question_kind",
      "expected_answer",
      "hint",
      "related_ref",
      "language_code",
      "published",
    ];

    const lines = [
      headers.join(","),
      ...filteredRows.map((row) =>
        [
          row.id,
          row.category,
          row.age_group,
          row.difficulty,
          row.question,
          row.options[0] ?? "",
          row.options[1] ?? "",
          row.options[2] ?? "",
          row.options[3] ?? "",
          row.answer_index,
          row.question_kind,
          row.expected_answer,
          row.hint,
          row.related_ref,
          row.language_code,
          row.published,
        ]
          .map(csvEscape)
          .join(","),
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kids-questions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = async (file: File) => {
    setImporting(true);
    setMsg("");

    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        setMsg("CSV is empty.");
        return;
      }

      const header = parseCsvLine(lines[0]).map((item) => item.toLowerCase());
      const indexOf = (name: string) => header.indexOf(name);

      const payload = lines
        .slice(1)
        .map((line) => parseCsvLine(line))
        .map((cells) => {
          const pick = (name: string) => {
            const idx = indexOf(name);
            return idx >= 0 ? cells[idx] ?? "" : "";
          };

          const parsedKind = pick("question_kind") === "interactive" ? "interactive" : "mcq";
          const ageRaw = pick("age_group") === "young" ? "young" : "kids";
          const difficultyRaw = Number(pick("difficulty"));
          const answerRaw = Number(pick("answer_index"));

          const options = [pick("option_1"), pick("option_2"), pick("option_3"), pick("option_4")];

          return {
            category: pick("category") || "custom",
            age_group: ageRaw,
            difficulty: Number.isFinite(difficultyRaw)
              ? Math.max(1, Math.min(3, difficultyRaw))
              : 1,
            question: pick("question"),
            options,
            answer_index: Number.isFinite(answerRaw)
              ? Math.max(0, Math.min(3, answerRaw))
              : 0,
            question_kind: parsedKind,
            expected_answer: parsedKind === "interactive" ? pick("expected_answer") || null : null,
            hint: pick("hint") || null,
            related_ref: pick("related_ref") || null,
            language_code: pick("language_code") || "en",
            published: pick("published").toLowerCase() !== "false",
          };
        })
        .filter((row) => row.question.trim().length > 0)
        .filter((row) => row.question_kind === "interactive" || row.options.every((option) => option.trim().length > 0));

      if (payload.length === 0) {
        setMsg("No valid rows found in CSV.");
        return;
      }

      const { error } = await supabase.from("kids_questions").insert(payload);
      if (error) {
        setMsg(error.message);
      } else {
        setMsg(`Imported ${payload.length} question(s).`);
        await load();
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Kids Quiz — Question Bank</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage quiz questions shown in the Kids Zone.</p>
      {msg && <p className="mt-3 rounded-lg border border-border bg-card px-3 py-2 text-sm">{msg}</p>}

      <section className="mt-6 rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by question, category, or reference"
            className="max-w-sm"
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAge} onValueChange={(value) => setFilterAge(value as "all" | "kids" | "young")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ages</SelectItem>
              <SelectItem value="kids">Kids</SelectItem>
              <SelectItem value="young">Young</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterDifficulty}
            onValueChange={(value) => setFilterDifficulty(value as "all" | "1" | "2" | "3")}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="1">Level 1</SelectItem>
              <SelectItem value="2">Level 2</SelectItem>
              <SelectItem value="3">Level 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-1 h-4 w-4" /> Export CSV
          </Button>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importCsv(file);
                event.currentTarget.value = "";
              }}
            />
            <Button type="button" variant="outline" size="sm" disabled={importing} asChild>
              <span>
                <Upload className="mr-1 h-4 w-4" /> {importing ? "Importing..." : "Import CSV"}
              </span>
            </Button>
          </label>
          <span className="text-xs text-muted-foreground">Showing {filteredRows.length} of {rows.length} questions</span>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Plus className="h-5 w-5 text-primary" /> New question</h2>
        <QuestionForm value={draft} onChange={setDraft} />
        <Button onClick={save} className="mt-4" size="sm">
          <Save className="h-4 w-4" /> Save
        </Button>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Existing questions ({filteredRows.length})</h2>
          <Button onClick={load} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4" /> Reload
          </Button>
        </div>
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="space-y-4">
            {filteredRows.map(r => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <QuestionForm value={r} onChange={patch => setRows(rs => rs.map(x => x.id === r.id ? { ...x, ...patch } : x))} />
                <div className="mt-3 flex justify-end gap-2">
                  <Button onClick={() => remove(r.id)} variant="outline" size="sm">
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                  <Button onClick={() => update(r)} size="sm">
                    <Save className="h-3 w-3" /> Update
                  </Button>
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
        <Input value={value.category} onChange={e => set("category", e.target.value)} className="mt-1" />
      </label>
      <label className="text-sm">Age group
        <select value={value.age_group} onChange={e => set("age_group", e.target.value as "kids" | "young")}
          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
          <option value="kids">Kids</option>
          <option value="young">Young learners</option>
        </select>
      </label>
      <label className="text-sm">Difficulty (1–3)
        <Input type="number" min={1} max={3} value={value.difficulty} onChange={e => set("difficulty", Math.max(1, Math.min(3, Number(e.target.value))))}
          className="mt-1" />
      </label>
      <label className="text-sm">Language
        <Input value={value.language_code} onChange={e => set("language_code", e.target.value)} className="mt-1" />
      </label>

      <label className="text-sm">Exercise type
        <select
          value={value.question_kind}
          onChange={e => set("question_kind", e.target.value as "mcq" | "interactive")}
          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="mcq">Multiple choice</option>
          <option value="interactive">Interactive exercise</option>
        </select>
      </label>

      <label className="text-sm">
        Correct option index
        <Input
          type="number"
          min={0}
          max={3}
          value={value.answer_index}
          onChange={e => set("answer_index", Math.max(0, Math.min(3, Number(e.target.value))))}
          className="mt-1"
        />
      </label>

      <label className="sm:col-span-2 text-sm">Question
        <Textarea value={value.question} onChange={e => set("question", e.target.value)} rows={2}
          className="mt-1" />
      </label>

      {value.options.map((opt, i) => (
        <label key={i} className="text-sm">Option {i + 1} {value.answer_index === i && <span className="text-emerald-600">(correct)</span>}
          <div className="mt-1 flex gap-2">
            <Input value={opt} onChange={e => set("options", value.options.map((o, j) => j === i ? e.target.value : o))}
              className="flex-1" />
            <Button type="button" onClick={() => set("answer_index", i)} variant="outline" size="sm"
              className={value.answer_index === i ? "border-emerald-500 bg-emerald-500/10" : ""}>
              Correct
            </Button>
          </div>
        </label>
      ))}

      {value.question_kind === "interactive" ? (
        <label className="text-sm sm:col-span-2">Expected answer
          <Input value={value.expected_answer ?? ""} onChange={e => set("expected_answer", e.target.value)}
            className="mt-1" />
        </label>
      ) : null}

      <label className="text-sm sm:col-span-2">Hint (optional)
        <Input value={value.hint ?? ""} onChange={e => set("hint", e.target.value)}
          className="mt-1" />
      </label>
      <label className="text-sm sm:col-span-2">Related reference (surah:ayah or topic slug)
        <Input value={value.related_ref ?? ""} onChange={e => set("related_ref", e.target.value)}
          className="mt-1" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={value.published} onChange={e => set("published", e.target.checked)} />
        Published (visible to kids)
      </label>
    </div>
  );
}
