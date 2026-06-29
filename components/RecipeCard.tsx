"use client";

import Link from "next/link";
import { Recipe, CATEGORY_COLOR } from "@/lib/types";

// A small deterministic "randomness" so each card gets a slight, consistent
// tilt — like it was dropped into the box by hand — without re-rolling on
// every render.
function tiltFor(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return (h % 5) - 2; // -2deg .. 2deg
}

export function RecipeCard({ recipe, index }: { recipe: Recipe; index: number }) {
  const rot = tiltFor(recipe.id);
  const image = recipe.type === "photo" ? recipe.photoUrl : recipe.sourceImage;

  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className="card-settle group block"
      style={
        {
          "--card-rot": `${rot}deg`,
          animationDelay: `${Math.min(index, 10) * 45}ms`,
        } as React.CSSProperties
      }
    >
      <div
        className="relative rounded-sm bg-card shadow-[0_1px_2px_rgba(43,42,36,0.15)] transition-all duration-200 group-hover:-translate-y-1 group-hover:rotate-0 group-hover:shadow-[0_10px_20px_rgba(43,42,36,0.18)]"
        style={{ transform: `rotate(${rot}deg)` }}
      >
        {/* category tab */}
        <div
          className="absolute -top-2 left-4 h-4 w-10 rounded-t-sm"
          style={{ background: CATEGORY_COLOR[recipe.category] }}
        />

        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-sm bg-paper-dark">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-3xl text-ink-soft/40">
              {recipe.title.slice(0, 1).toUpperCase() || "?"}
            </div>
          )}

          {recipe.favorite && (
            <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-mustard text-card">
              <StarIcon className="h-3.5 w-3.5" />
            </div>
          )}

          {recipe.type !== "photo" && (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-sm bg-tomato px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-card">
              <PinIcon className="h-3 w-3" />
              Pinned
            </div>
          )}
        </div>

        <div className="border-t border-line/70 px-3 py-2.5">
          <p className="font-mono text-[10px] tracking-wider text-ink-soft">
            No. {String(recipe.catalogNumber).padStart(3, "0")}
          </p>
          <h3 className="mt-0.5 truncate font-display text-xl leading-tight text-ink">
            {recipe.title || "Untitled recipe"}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5">
            <p className="text-[11px] uppercase tracking-wide text-ink-soft">
              {recipe.category}
            </p>
            {!recipe.tried && (
              <span className="rounded-full bg-paper-dark px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-soft">
                Wishlist
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5z" />
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
