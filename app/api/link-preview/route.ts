import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { findRecipeInJsonLd } from "@/lib/recipe-schema";

export const runtime = "nodejs";

// Never fail the request outright if a site can't be read — recipe blogs
// vary wildly in how bot-friendly they are. Always give the form *something*
// to work with so the person can fill in the rest by hand if needed.
const FALLBACK = {
  title: "Pinned recipe",
  image: null as string | null,
  ingredients: null as string | null,
  instructions: null as string | null,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");

  if (!target) {
    return NextResponse.json({ error: "Missing url." }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json(
      { error: "Only http/https links are supported." },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RecipeBoxBot/1.0; +https://vercel.com) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(FALLBACK);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const jsonLdBlocks: string[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      const text = $(el).contents().text();
      if (text.trim()) jsonLdBlocks.push(text);
    });

    const fromSchema = findRecipeInJsonLd(jsonLdBlocks);

    const title =
      fromSchema.title ||
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").first().text() ||
      FALLBACK.title;

    const rawImage =
      fromSchema.image ||
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      null;

    // Resolve relative image URLs against the page's own URL.
    const image = rawImage ? new URL(rawImage, parsed).toString() : null;

    return NextResponse.json({
      title: title.trim(),
      image,
      ingredients: fromSchema.ingredients,
      instructions: fromSchema.instructions,
    });
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
