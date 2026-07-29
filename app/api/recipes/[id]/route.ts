import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getRecipeById, updateRecipeById, deleteRecipeById } from "@/lib/sql";

async function mirrorImage(sourceImage: string, recipeId: string): Promise<string | null> {
  try {
    const res = await fetch(sourceImage, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > 10 * 1024 * 1024) return null;
    const blob = await put(`recipes/${recipeId}`, buffer, {
      access: "public",
      contentType: res.headers.get("content-type") || "image/jpeg",
    });
    return blob.url;
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(recipe);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    let photoUrl = body.photoUrl ?? null;

    // Mirror external images to Blob on update too (only if photoUrl isn't already set)
    if (!photoUrl && body.sourceImage && (body.type === "youtube" || body.type === "link")) {
      photoUrl = await mirrorImage(body.sourceImage, id);
    }

    const recipe = await updateRecipeById(id, {
      catalogNumber: body.catalogNumber ?? 0,
      owner: body.owner,
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
    if (!recipe) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json(recipe);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not save changes." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteRecipeById(id);
  return NextResponse.json({ ok: true });
}
