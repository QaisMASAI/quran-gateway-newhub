import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, Plus, Folder, Trash2, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/collections/")({
  head: () => ({
    meta: [
      { title: "My Collections — Discover Quran" },
      { name: "description", content: "Curate and organize your favorite verses, topics and prophets into personal collections." },
    ],
  }),
  component: CollectionsPage,
});

type Collection = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  cover_color: string | null;
  created_at: string;
};

function CollectionsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["collections", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Collection[];
    },
    enabled: !!user,
  });

  const createCol = useMutation({
    mutationFn: async (n: string) => {
      const { error } = await supabase.from("collections").insert({
        user_id: user!.id,
        name: n,
        is_public: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setName("");
      setCreating(false);
      qc.invalidateQueries({ queryKey: ["collections", user?.id] });
    },
  });

  const deleteCol = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections", user?.id] }),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Folder className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Collections</h1>
              <p className="text-sm text-muted-foreground">
                Curate verses, topics, and prophets into your own library.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCreating((v) => !v)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>

        {creating && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) createCol.mutate(name.trim());
            }}
            className="mb-6 flex gap-2"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Collection name…"
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-card"
            />
            <button
              type="submit"
              disabled={createCol.isPending || !name.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              {createCol.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </button>
          </form>
        )}

        {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}

        {!isLoading && data && data.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No collections yet. Click <strong>New</strong> to create your first.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {(data ?? []).map((c) => (
            <div
              key={c.id}
              className="group rounded-xl border border-border bg-card p-4 hover:border-primary transition flex items-start justify-between"
            >
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                {c.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {c.is_public ? "Public" : "Private"}
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete "${c.name}"?`)) deleteCol.mutate(c.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
