"use client";

import Link from "next/link";
import { RecipeForm } from "@/components/RecipeForm";
import { useTranslation } from "@/lib/i18n";

export default function AddRecipePage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-16 pt-8 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-ink-soft hover:text-ink"
      >
        {t("add.back")}
      </Link>
      <h1 className="mb-6 font-display text-4xl italic text-ink">
        {t("add.heading")}
      </h1>
      <RecipeForm />
    </main>
  );
}
