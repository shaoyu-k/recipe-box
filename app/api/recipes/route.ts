import { NextResponse } from "next/server";
import { listRecipes, insertRecipe } from "@/lib/sql";

export async function GET() {
  try {
    const recipes = await listRecipes();
    return NextResponse.json(recipes);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not load recipes." },
      { status: 500 }
    );
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
    const recipe = await insertRecipe({
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
    return NextResponse.json(recipe, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not save recipe." },
      { status: 500 }
    );
  }
}
