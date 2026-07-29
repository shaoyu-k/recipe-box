"use client";

import Link from "next/link";
import { Recipe } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

function categoryLabel(t: (key: string) => string, category: string): string {
  const translated = t(`cat.${category}`);
  const label = translated === `cat.${category}` ? category : translated;
  return label.toUpperCase();
}

export function RecipeCard({
  recipe,
  index,
  layout = "grid",
  showOwner = false,
  filteredTotal = 0,
}: {
  recipe: Recipe;
  index: number;
  layout?: "grid" | "list";
  showOwner?: boolean;
  filteredTotal?: number;
}) {
  const { t } = useTranslation();
  const image = recipe.photoUrl || recipe.sourceImage;

  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className={`card-settle group block overflow-hidden rounded-2xl border border-line/70 bg-card shadow-[0_1px_2px_rgba(43,42,36,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(43,42,36,0.14)] ${
        layout === "list" ? "flex items-center gap-4" : ""
      }`}
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` } as React.CSSProperties}
    >
      <div
        className={`relative overflow-hidden bg-paper-dark ${
          layout === "list" ? "aspect-square w-24 shrink-0 rounded-xl" : "aspect-square w-full"
        }`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-3xl text-ink-soft/40">
            {recipe.title.slice(0, 1).toUpperCase() || "?"}
          </div>
        )}

        <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card/90 text-ink shadow-sm backdrop-blur-sm">
          <StarIcon filled={recipe.favorite} className="h-3.5 w-3.5" />
        </div>

        {recipe.type !== "photo" && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink shadow-sm backdrop-blur-sm">
            <PinIcon className="h-3 w-3" />
            {t("filter.pinned")}
          </div>
        )}
      </div>

      <div className={layout === "list" ? "min-w-0 flex-1 py-2 pr-4" : "px-4 py-3.5"}>
        <h3 className="truncate font-display text-xl leading-tight text-ink">
          {recipe.title || "Untitled recipe"}
        </h3>
        <div className="mt-1 flex items-center gap-1.5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            {categoryLabel(t, recipe.category)}
          </p>
          {showOwner && recipe.catalogNumber > 0 && (
            <span className="font-mono text-[10px] tracking-wider text-ink-soft/70">
              #{String(recipe.catalogNumber).padStart(3, "0")}
            </span>
          )}
          {!showOwner && filteredTotal > 0 && (
            <span className="font-mono text-[10px] tracking-wider text-ink-soft/70">
              #{String(filteredTotal - index).padStart(2, "0")}
            </span>
          )}
          {!recipe.tried && (
            <span className="rounded-full bg-paper-dark px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-soft">
              {t("filter.wishlist")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

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

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14.5 3.5l6 6-3 3-1.5-1.5-3.5 3.5.5 4-1.5 1.5-4-4-4.5 4.5-1-1L7 14.5l-4-4 1.5-1.5 4 .5 3.5-3.5L10.5 5l3-3 1 1.5z"
        fill="currentColor"
      />
    </svg>
  );
}
