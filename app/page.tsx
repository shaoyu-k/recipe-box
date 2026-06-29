"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAllRecipes, exportAllRecipes } from "@/lib/api-client";
import { Recipe, Category } from "@/lib/types";
import { RecipeCard } from "@/components/RecipeCard";
import { CategoryFilter } from "@/components/CategoryFilter";

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      aria-hidden
    >
      <path
        d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [status, setStatus] = useState<"All" | "Tried" | "Wishlist">("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getAllRecipes().then(setRecipes).catch(() => setRecipes([]));
  }, []);

  async function handleLock() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await exportAllRecipes();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recipe-box-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const filtered = useMemo(() => {
    if (!recipes) return [];
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      const matchesCategory = category === "All" || r.category === category;
      const matchesStatus =
        status === "All" || (status === "Tried" ? r.tried : !r.tried);
      const matchesFavorite = !favoritesOnly || r.favorite;
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.ingredients.toLowerCase().includes(q);
      return matchesCategory && matchesStatus && matchesFavorite && matchesQuery;
    });
  }, [recipes, query, category, status, favoritesOnly]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-28 pt-8 sm:px-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            Shared with everyone who has the code
          </p>
          <h1 className="-mt-1 font-display text-5xl italic text-ink sm:text-6xl">
            The Recipe Box
          </h1>
        </div>
        <div className="mt-1 flex shrink-0 flex-col items-end gap-1.5">
          {recipes !== null && recipes.length > 0 && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="font-mono text-[11px] uppercase tracking-wide text-ink-soft underline hover:text-ink disabled:opacity-50"
            >
              {exporting ? "Exporting…" : "Export backup"}
            </button>
          )}
          <button
            onClick={handleLock}
            className="font-mono text-[11px] uppercase tracking-wide text-ink-soft underline hover:text-ink"
          >
            Lock the box
          </button>
        </div>
      </header>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your recipes…"
          className="w-full rounded-full border border-line bg-card px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 sm:max-w-xs"
        />
        <CategoryFilter active={category} onChange={setCategory} />
      </div>

      <div className="mb-6 flex items-center gap-2">
        <div className="flex gap-2 rounded-full border border-line bg-card p-1">
          {(["All", "Tried", "Wishlist"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                status === s ? "bg-ink text-card" : "text-ink-soft hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => setFavoritesOnly((f) => !f)}
          aria-pressed={favoritesOnly}
          aria-label="Show favorites only"
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            favoritesOnly
              ? "border-mustard bg-mustard text-card"
              : "border-line bg-card text-ink-soft hover:border-ink/40"
          }`}
        >
          <StarIcon filled={favoritesOnly} className="h-3.5 w-3.5" />
          Favorites
        </button>
      </div>

      {recipes === null && (
        <p className="py-16 text-center font-mono text-sm text-ink-soft">
          Opening the box…
        </p>
      )}

      {recipes !== null && recipes.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-sm border border-dashed border-line py-20 text-center">
          <p className="font-display text-2xl italic text-ink">
            Your box is empty.
          </p>
          <p className="max-w-xs text-sm text-ink-soft">
            Add a photo of a dish with the recipe, or pin one from YouTube to
            get started.
          </p>
          <Link
            href="/add"
            className="rounded-full bg-tomato px-5 py-2.5 text-sm font-medium text-card hover:bg-tomato-dark"
          >
            Add your first recipe
          </Link>
        </div>
      )}

      {recipes !== null && recipes.length > 0 && filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-ink-soft">
          Nothing matches that search.
        </p>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((recipe, i) => (
            <RecipeCard key={recipe.id} recipe={recipe} index={i} />
          ))}
        </div>
      )}

      <Link
        href="/add"
        aria-label="Add a recipe"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-tomato text-2xl text-card shadow-lg shadow-tomato/30 transition-transform hover:scale-105 active:scale-95"
      >
        +
      </Link>
    </main>
  );
}
