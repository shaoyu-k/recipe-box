"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAllRecipes, exportAllRecipes } from "@/lib/api-client";
import { Recipe, Category } from "@/lib/types";
import { RecipeCard } from "@/components/RecipeCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useTranslation } from "@/lib/i18n";

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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

type SortMode = "latest" | "oldest" | "az";

export default function Home() {
  const { t, locale, setLocale } = useTranslation();
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [status, setStatus] = useState<"All" | "Tried" | "Wishlist">("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sort, setSort] = useState<SortMode>("latest");
  const [view, setView] = useState<"grid" | "list">("grid");

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
    const list = recipes.filter((r) => {
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
    const sorted = [...list];
    if (sort === "latest") sorted.sort((a, b) => b.catalogNumber - a.catalogNumber);
    else if (sort === "oldest") sorted.sort((a, b) => a.catalogNumber - b.catalogNumber);
    else sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [recipes, query, category, status, favoritesOnly, sort]);

  return (
    <main className="min-h-screen pb-28">
      <div className="border-b border-line/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <span className="font-display text-lg text-ink">{t("home.title")}</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
            <button onClick={() => setLocale(locale === "en" ? "id" : "en")} className="hover:text-ink">
              {t("lang.label")}
            </button>
            {recipes !== null && recipes.length > 0 && (
              <button onClick={handleExport} disabled={exporting} className="hover:text-ink disabled:opacity-50">
                {exporting ? t("home.exporting") : t("home.export")}
              </button>
            )}
            <button onClick={handleLock} className="hover:text-ink">
              {t("home.lock")}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
              {t("home.sharedTagline")}
            </p>
            <h1 className="mt-1 font-display text-5xl text-ink sm:text-6xl">
              {t("home.title")}
            </h1>
            <p className="mt-2 font-display text-xl italic text-ink-soft">
              {t("home.subtitle")}
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            <div className="flex items-center gap-2 rounded-full border border-line bg-card px-4 py-3">
              <SearchIcon className="h-4 w-4 shrink-0 text-ink-soft" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("home.searchPlaceholder")}
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none"
              />
            </div>
            <div className="mt-3">
              <CategoryFilter active={category} onChange={setCategory} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-3">
          <div className="flex items-center gap-5 text-sm font-medium">
            {(["All", "Tried", "Wishlist"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`border-b-2 pb-1 transition-colors ${
                  status === s ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {t(`filter.${s.toLowerCase()}`)}
              </button>
            ))}
            <button
              onClick={() => setFavoritesOnly((f) => !f)}
              aria-pressed={favoritesOnly}
              aria-label="Show favorites only"
              className={`flex items-center gap-1.5 border-b-2 pb-1 transition-colors ${
                favoritesOnly ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              <StarIcon filled={favoritesOnly} className="h-3.5 w-3.5" />
              {t("filter.favorites")}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="rounded-full border border-line bg-card px-3 py-1.5 text-sm text-ink-soft focus:outline-none"
            >
              <option value="latest">{t("home.sortLatest")}</option>
              <option value="oldest">{t("home.sortOldest")}</option>
              <option value="az">{t("home.sortAZ")}</option>
            </select>
            <div className="flex items-center gap-1 rounded-full border border-line bg-card p-1">
              <button
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                aria-label="Grid view"
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  view === "grid" ? "bg-paper-dark text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                <GridIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                aria-label="List view"
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  view === "list" ? "bg-paper-dark text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                <ListIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {recipes === null && (
          <p className="py-16 text-center font-mono text-sm text-ink-soft">
            {t("home.loading")}
          </p>
        )}

        {recipes !== null && recipes.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-sm border border-dashed border-line py-20 text-center">
            <p className="font-display text-2xl italic text-ink">
              {t("home.emptyTitle")}
            </p>
            <p className="max-w-xs text-sm text-ink-soft">
              {t("home.emptyDesc")}
            </p>
            <Link
              href="/add"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-card hover:bg-ink/90"
            >
              {t("home.emptyCta")}
            </Link>
          </div>
        )}

        {recipes !== null && recipes.length > 0 && filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-ink-soft">
            {t("home.noMatch")}
          </p>
        )}

        {filtered.length > 0 && view === "grid" && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((recipe, i) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={i} layout="grid" />
            ))}
          </div>
        )}

        {filtered.length > 0 && view === "list" && (
          <div className="mt-6 flex flex-col gap-3">
            {filtered.map((recipe, i) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={i} layout="list" />
            ))}
          </div>
        )}
      </div>

      <Link
        href="/add"
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-medium text-card shadow-lg shadow-ink/20 transition-transform hover:scale-105 active:scale-95"
      >
        <span className="text-base leading-none">+</span>
        {t("home.newRecipe")}
      </Link>
    </main>
  );
}
