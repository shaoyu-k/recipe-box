import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { listRecipes, insertRecipe, updateRecipeById } from "@/lib/sql";

export async function GET(request: Request) {
  try {
    // If logged in as a specific owner, filter by owner
    // SY can see all
    const cookieOwner = request.cookies.get("recipebox_owner")?.value;
    const recipes = await listRecipes(cookieOwner === "SY" ? undefined : cookieOwner);
    return NextResponse.json(recipes);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not load recipes." },
      { status: 500 }
    );
  }
}

async function mirrorImage(sourceImage: string, recipeId: string): Promise<string | null> {
  try {
    const res = await fetch(sourceImage, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > 10 * 1024 * 1024) return null; // skip if >10MB
    const blob = await put(`recipes/${recipeId}`, buffer, {
      access: "public",
      contentType: res.headers.get("content-type") || "image/jpeg",
    });
    return blob.url;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.category || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    let photoUrl = body.photoUrl ?? null;

    // For pinned links / YouTube: download the external image and self-host
    // it on Vercel Blob so it doesn't break when the source site changes.
    if (!photoUrl && body.sourceImage && (body.type === "youtube" || body.type === "link")) {
      photoUrl = await mirrorImage(body.sourceImage, crypto.randomUUID());
    }

    const recipe = await insertRecipe({
      catalogNumber: body.catalogNumber,
      owner: request.cookies.get("recipebox_owner")?.value ?? "SY",
      title: body.title,
      category: body.category,
      type: body.type,
      ingredients: body.ingredients ?? "",
      instructions: body.instructions ?? "",
      notes: body.notes ?? "",
      photoUrl,
      sourceUrl: body.sourceUrl ?? null,
      sourceImage: body.sourceImage ?? null,
      tried: body.tried ?? false,
      favorite: body.favorite ?? false,
    });
    return NextResponse.json(recipe, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not save recipe." },
      { status: 500 }
    );
  }
}
