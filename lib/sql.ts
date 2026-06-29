import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { Recipe, Category } from "./types";

// DATABASE_URL is set automatically when a Neon Postgres database is
// connected to this project from the Vercel dashboard (Storage tab).
// Created lazily (not at module load) so builds don't fail before the
// env var exists, and so it's only required once a request actually
// needs the database.
let _sql: NeonQueryFunction<false, false> | null = null;
function sql(...args: Parameters<NeonQueryFunction<false, false>>) {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. Connect a Postgres database to this project in the Vercel dashboard."
      );
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql(...args);
}

interface Row {
  id: string;
  catalog_number: number;
  title: string;
  category: string;
  type: string;
  ingredients: string;
  instructions: string;
  notes: string;
  photo_url: string | null;
  source_url: string | null;
  source_image: string | null;
  tried: boolean;
  favorite: boolean;
  created_at: string;
}

function rowToRecipe(row: Row): Recipe {
  return {
    id: row.id,
    catalogNumber: row.catalog_number,
    title: row.title,
    category: row.category as Category,
    type: row.type as Recipe["type"],
    ingredients: row.ingredients,
    instructions: row.instructions,
    notes: row.notes,
    photoUrl: row.photo_url,
    sourceUrl: row.source_url,
    sourceImage: row.source_image,
    tried: row.tried,
    favorite: row.favorite,
    createdAt: new Date(row.created_at).getTime(),
  };
}

// Creates the table on first use so there's no manual migration step to
// run by hand after connecting the database. Safe to call repeatedly.
// The ALTER TABLE lines upgrade databases that were created before the
// tried/favorite columns existed, without touching existing rows' data.
async function ensureSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      catalog_number SERIAL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      ingredients TEXT NOT NULL DEFAULT '',
      instructions TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      photo_url TEXT,
      youtube_url TEXT,
      youtube_video_id TEXT,
      youtube_thumbnail TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS tried BOOLEAN NOT NULL DEFAULT false`;
  await sql`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS favorite BOOLEAN NOT NULL DEFAULT false`;
  // Generic fields for "pinned from anywhere" (YouTube or any recipe site),
  // replacing the old youtube-only ones. Backfill is idempotent and a
  // no-op once every row has been migrated.
  await sql`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS source_url TEXT`;
  await sql`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS source_image TEXT`;
  await sql`
    UPDATE recipes SET source_url = youtube_url
    WHERE source_url IS NULL AND youtube_url IS NOT NULL
  `;
  await sql`
    UPDATE recipes SET source_image = youtube_thumbnail
    WHERE source_image IS NULL AND youtube_thumbnail IS NOT NULL
  `;
}

export async function listRecipes(): Promise<Recipe[]> {
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM recipes ORDER BY created_at DESC
  `) as unknown as Row[];
  return rows.map(rowToRecipe);
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM recipes WHERE id = ${id}
  `) as unknown as Row[];
  return rows[0] ? rowToRecipe(rows[0]) : null;
}

export interface RecipeWriteInput {
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

export async function insertRecipe(input: RecipeWriteInput): Promise<Recipe> {
  await ensureSchema();
  const id = crypto.randomUUID();
  const rows = (await sql`
    INSERT INTO recipes
      (id, title, category, type, ingredients, instructions, notes,
       photo_url, source_url, source_image, tried, favorite)
    VALUES
      (${id}, ${input.title}, ${input.category}, ${input.type},
       ${input.ingredients}, ${input.instructions}, ${input.notes},
       ${input.photoUrl}, ${input.sourceUrl}, ${input.sourceImage},
       ${input.tried}, ${input.favorite})
    RETURNING *
  `) as unknown as Row[];
  return rowToRecipe(rows[0]);
}

export async function updateRecipeById(
  id: string,
  input: RecipeWriteInput
): Promise<Recipe | null> {
  await ensureSchema();
  const rows = (await sql`
    UPDATE recipes SET
      title = ${input.title},
      category = ${input.category},
      type = ${input.type},
      ingredients = ${input.ingredients},
      instructions = ${input.instructions},
      notes = ${input.notes},
      photo_url = ${input.photoUrl},
      source_url = ${input.sourceUrl},
      source_image = ${input.sourceImage},
      tried = ${input.tried},
      favorite = ${input.favorite}
    WHERE id = ${id}
    RETURNING *
  `) as unknown as Row[];
  return rows[0] ? rowToRecipe(rows[0]) : null;
}

export async function deleteRecipeById(id: string): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM recipes WHERE id = ${id}`;
}
