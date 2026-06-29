export type Category =
  | "Chinese"
  | "Korean"
  | "Japanese"
  | "Thai"
  | "Western"
  | "Indonesian"
  | "Other";

export const CATEGORIES: Category[] = [
  "Chinese",
  "Korean",
  "Japanese",
  "Thai",
  "Western",
  "Indonesian",
  "Other",
];

export const CATEGORY_COLOR: Record<Category, string> = {
  Chinese: "var(--tomato)",
  Korean: "var(--plum)",
  Japanese: "var(--denim)",
  Thai: "var(--forest)",
  Western: "var(--mustard)",
  Indonesian: "var(--clay)",
  Other: "var(--sage)",
};

export interface Recipe {
  id: string;
  catalogNumber: number;
  title: string;
  category: Category;
  type: "photo" | "youtube" | "link";
  ingredients: string;
  instructions: string;
  notes: string;
  photoUrl: string | null;
  sourceUrl: string | null;
  sourceImage: string | null;
  tried: boolean;
  favorite: boolean;
  createdAt: number;
}
