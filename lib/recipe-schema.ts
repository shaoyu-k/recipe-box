// Many recipe blogs (WordPress Recipe Maker, Tasty Recipes, etc.) embed a
// schema.org/Recipe object as JSON-LD for SEO/Google rich results. When
// it's present, we can pull the real title, photo, ingredients, and steps
// instead of just a title and thumbnail.

interface JsonLdNode {
  "@type"?: string | string[];
  name?: unknown;
  image?: unknown;
  recipeIngredient?: unknown;
  recipeInstructions?: unknown;
  "@graph"?: unknown;
  [key: string]: unknown;
}

export function flattenJsonLd(json: unknown): JsonLdNode[] {
  const out: JsonLdNode[] = [];
  function visit(node: unknown) {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (node && typeof node === "object") {
      const obj = node as JsonLdNode;
      out.push(obj);
      if (obj["@graph"]) visit(obj["@graph"]);
    }
  }
  visit(json);
  return out;
}

export function isRecipeNode(node: JsonLdNode): boolean {
  const type = node["@type"];
  if (typeof type === "string") return type === "Recipe";
  if (Array.isArray(type)) return type.includes("Recipe");
  return false;
}

export function extractImage(image: unknown): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) {
    for (const item of image) {
      const found = extractImage(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof image === "object" && "url" in (image as Record<string, unknown>)) {
    const url = (image as { url?: unknown }).url;
    return typeof url === "string" ? url : null;
  }
  return null;
}

export function extractIngredients(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  const lines = value.filter((x): x is string => typeof x === "string");
  return lines.length ? lines.join("\n") : null;
}

export function extractInstructions(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    const lines: string[] = [];
    for (const item of value) {
      if (typeof item === "string") {
        lines.push(item.trim());
      } else if (item && typeof item === "object") {
        const obj = item as {
          text?: unknown;
          itemListElement?: unknown;
          name?: unknown;
        };
        if (obj.itemListElement) {
          const nested = extractInstructions(obj.itemListElement);
          if (nested) lines.push(nested);
        } else if (typeof obj.text === "string") {
          lines.push(obj.text.trim());
        } else if (typeof obj.name === "string") {
          lines.push(obj.name.trim());
        }
      }
    }
    return lines.length ? lines.join("\n") : null;
  }
  return null;
}

export interface ParsedRecipeData {
  title: string | null;
  image: string | null;
  ingredients: string | null;
  instructions: string | null;
}

export function findRecipeInJsonLd(blocks: string[]): ParsedRecipeData {
  const result: ParsedRecipeData = {
    title: null,
    image: null,
    ingredients: null,
    instructions: null,
  };

  for (const raw of blocks) {
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      continue;
    }

    for (const node of flattenJsonLd(json)) {
      if (!isRecipeNode(node)) continue;
      if (!result.title && typeof node.name === "string") {
        result.title = node.name;
      }
      if (!result.image) {
        result.image = extractImage(node.image);
      }
      if (!result.ingredients) {
        result.ingredients = extractIngredients(node.recipeIngredient);
      }
      if (!result.instructions) {
        result.instructions = extractInstructions(node.recipeInstructions);
      }
    }
  }

  return result;
}
