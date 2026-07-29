"use client";

import { getCategoriesForOwner, Category } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

export function CategoryFilter({
  active,
  onChange,
  owner = null,
}: {
  active: Category | "All";
  onChange: (c: Category | "All") => void;
  owner?: string | null;
}) {
  const { t } = useTranslation();
  const categories = getCategoriesForOwner(owner);
  const items: (Category | "All")[] = ["All", ...categories];

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {items.map((item) => {
        const isActive = active === item;
        return (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-ink bg-ink text-card"
                : "border-line bg-card text-ink-soft hover:border-ink/40"
            }`}
          >
            {item === "All" ? t("filter.all") : t(`cat.${item}`)}
          </button>
        );
      })}
    </div>
  );
}
