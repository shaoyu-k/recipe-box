import { NextResponse } from "next/server";
import { getRecipeById, updateRecipeById, deleteRecipeById } from "@/lib/sql";

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
    const recipe = await updateRecipeById(id, {
      title: body.title,
      category: body.category,
      type: body.type,
      ingredients: body.ingredients ?? "",
      instructions: body.instructions ?? "",
      notes: body.notes ?? "",
      photoUrl: body.photoUrl ?? null,
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
