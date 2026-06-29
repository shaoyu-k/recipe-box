"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getRecipe } from "@/lib/api-client";
import { Recipe } from "@/lib/types";
import { RecipeForm } from "@/components/RecipeForm";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);

  useEffect(() => {
    getRecipe(id).then(setRecipe).catch(() => setRecipe(null));
  }, [id]);

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

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-16 pt-8 sm:px-6">
      <Link
        href={`/recipe/${id}`}
        className="mb-4 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-ink-soft hover:text-ink"
      >
        ← Back to the card
      </Link>
      <h1 className="mb-6 font-display text-4xl italic text-ink">
        Edit recipe
      </h1>
      <RecipeForm existing={recipe} />
    </main>
  );
}
