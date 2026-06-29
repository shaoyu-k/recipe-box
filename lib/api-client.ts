import { upload } from "@vercel/blob/client";
import { Recipe, Category } from "./types";

export interface RecipeInput {
  title: string;
  category: Category;
  type: Recipe["type"];
  ingredients: string;
  instructions: string;
  notes: string;
  photoUrl: string | null;
  sourceUrl: string | null;
  sourceImage: string | null;
  tried: boolean;
  favorite: boolean;
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const res = await fetch("/api/recipes", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load recipes.");
  return res.json();
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const res = await fetch(`/api/recipes/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Could not load recipe.");
  return res.json();
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  const res = await fetch("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Could not save recipe.");
  return res.json();
}

export async function updateRecipe(
  id: string,
  input: RecipeInput
): Promise<Recipe> {
  const res = await fetch(`/api/recipes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Could not save changes.");
  return res.json();
}

export async function deleteRecipe(id: string): Promise<void> {
  const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Could not delete recipe.");
}

// Uploads directly from the browser to Vercel Blob storage, bypassing the
// serverless function body-size limit so larger phone photos still work.
export async function uploadPhoto(file: File): Promise<string> {
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/blob-upload",
  });
  return blob.url;
}

export async function exportAllRecipes(): Promise<Blob> {
  const recipes = await getAllRecipes();
  const json = JSON.stringify(recipes, null, 2);
  return new Blob([json], { type: "application/json" });
}
