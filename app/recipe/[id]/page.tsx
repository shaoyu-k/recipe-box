"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getRecipe, deleteRecipe, updateRecipe } from "@/lib/api-client";
import { Recipe, CATEGORY_COLOR } from "@/lib/types";

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

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    getRecipe(id).then(setRecipe).catch(() => setRecipe(null));
  }, [id]);

  async function handleDelete() {
    await deleteRecipe(id);
    router.push("/");
  }

  async function toggleField(field: "tried" | "favorite") {
    if (!recipe) return;
    const updated = await updateRecipe(recipe.id, {
      title: recipe.title,
      category: recipe.category,
      type: recipe.type,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      notes: recipe.notes,
      photoUrl: recipe.photoUrl,
      sourceUrl: recipe.sourceUrl,
      sourceImage: recipe.sourceImage,
      tried: field === "tried" ? !recipe.tried : recipe.tried,
      favorite: field === "favorite" ? !recipe.favorite : recipe.favorite,
    });
    setRecipe(updated);
  }

  if (recipe === undefined) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center font-mono text-sm text-ink-soft">
        Opening the card…
      </main>
    );
  }

  if (recipe === null) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="mb-4 text-ink-soft">That recipe isn&apos;t in the box.</p>
        <Link href="/" className="text-tomato underline">
          Back to the box
        </Link>
      </main>
    );
  }

  const image = recipe.type === "photo" ? recipe.photoUrl : recipe.sourceImage;
  const ingredientLines = recipe.ingredients.split("\n").filter((l) => l.trim());
  const instructionLines = recipe.instructions.split("\n").filter((l) => l.trim());

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-20 pt-8 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-ink-soft hover:text-ink"
      >
        ← Back to the box
      </Link>

      <div className="overflow-hidden rounded-sm border border-line bg-card">
        <div className="relative aspect-[4/3] w-full bg-paper-dark">
          {image ? (
            recipe.type !== "photo" ? (
              <a
                href={recipe.sourceUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-full w-full object-cover" />
                {recipe.type === "youtube" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/70">
                      <svg viewBox="0 0 24 24" fill="white" className="ml-0.5 h-6 w-6">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-5xl text-ink-soft/40">
              {recipe.title.slice(0, 1).toUpperCase() || "?"}
            </div>
          )}

          {recipe.type !== "photo" && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-sm bg-tomato px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-card">
              {recipe.type === "youtube" ? "Pinned from YouTube" : "Pinned from the web"}
            </div>
          )}
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs tracking-wider text-ink-soft">
              No. {String(recipe.catalogNumber).padStart(3, "0")}
            </p>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-card"
              style={{ background: CATEGORY_COLOR[recipe.category] }}
            >
              {recipe.category}
            </span>
            <button
              onClick={() => toggleField("tried")}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide transition-colors ${
                recipe.tried
                  ? "border-forest bg-forest text-card"
                  : "border-line bg-paper-dark text-ink-soft hover:border-ink/40"
              }`}
            >
              {recipe.tried ? "Tried it" : "Wishlist"}
            </button>
            <button
              onClick={() => toggleField("favorite")}
              aria-pressed={recipe.favorite}
              aria-label={recipe.favorite ? "Remove from favorites" : "Mark as favorite"}
              className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                recipe.favorite
                  ? "border-mustard bg-mustard text-card"
                  : "border-line bg-paper-dark text-ink-soft hover:border-ink/40"
              }`}
            >
              <StarIcon filled={recipe.favorite} className="h-3.5 w-3.5" />
            </button>
          </div>

          <h1 className="mt-1 font-display text-4xl italic text-ink sm:text-5xl">
            {recipe.title}
          </h1>

          {recipe.type !== "photo" && recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-denim underline"
            >
              {recipe.type === "youtube" ? "Watch on YouTube" : "View original recipe"}
            </a>
          )}

          {ingredientLines.length > 0 && (
            <section className="mt-6">
              <h2 className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                Ingredients
              </h2>
              <ul className="mt-2 space-y-1.5 font-mono text-sm leading-relaxed text-ink">
                {ingredientLines.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-tomato">—</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {instructionLines.length > 0 && (
            <section className="mt-6">
              <h2 className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                Instructions
              </h2>
              <ol className="mt-2 space-y-3 text-sm leading-relaxed text-ink">
                {instructionLines.map((line, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-display text-lg italic text-ink-soft">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{line}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {recipe.notes.trim() && (
            <section className="mt-6 rounded-sm bg-paper-dark/60 p-3">
              <h2 className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                Notes
              </h2>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">
                {recipe.notes}
              </p>
            </section>
          )}

          <div className="mt-8 flex gap-3 border-t border-line pt-5">
            <Link
              href={`/recipe/${recipe.id}/edit`}
              className="rounded-full border border-line px-5 py-2 text-sm font-medium text-ink hover:border-ink/40"
            >
              Edit
            </Link>
            {!confirmingDelete ? (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="rounded-full border border-line px-5 py-2 text-sm font-medium text-tomato hover:border-tomato"
              >
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-soft">Remove this card?</span>
                <button
                  onClick={handleDelete}
                  className="rounded-full bg-tomato px-4 py-1.5 text-sm font-medium text-card"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="text-sm text-ink-soft underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
