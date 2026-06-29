"use client";

import { CATEGORIES, CATEGORY_COLOR, Category } from "@/lib/types";

export function CategoryFilter({
  active,
  onChange,
}: {
  active: Category | "All";
  onChange: (c: Category | "All") => void;
}) {
  const items: (Category | "All")[] = ["All", ...CATEGORIES];

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {items.map((item) => {
        const isActive = active === item;
        const color = item === "All" ? "var(--ink)" : CATEGORY_COLOR[item];
        return (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-ink bg-ink text-card"
                : "border-line bg-card text-ink-soft hover:border-ink/40"
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: isActive ? "currentColor" : color }}
            />
            {item}
          </button>
        );
      })}
    </div>
  );
}
