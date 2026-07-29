import { NextRequest, NextResponse } from "next/server";

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] ?? null;
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

const API_KEY = "AIzaSyAJO8c71THmU3Pk-0hk9ub53moJCO4KURU";

// Simple ingredient parsing from description text
function parseIngredients(description: string): string | null {
  const patterns = [
    /(?:Ingredients|Bahan[-\s]?bahan|Bahan-bahan|INGREDIENTS)[:\s]*([\s\S]*?)(?:\n\n|\n(?:Instructions|Cara[-\s]?(?:membuat|memasak)|Directions|Method|Steps|How to|Preparation|To make|Instructions|DIRECTIONS))/i,
    /(?:You will need|You need|What you need)[:\s]*([\s\S]*?)(?:\n\n|\n(?:Instructions|Method|Steps))/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      const lines = match[1]
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => {
          return l && l.length > 2 && !l.startsWith("Follow") && !l.startsWith("LIKE") && !l.startsWith("SUBSCRIBE") && !l.startsWith("#") && !l.startsWith("@") && !l.startsWith("http");
        });
      if (lines.length >= 2) return lines.join("\n");
    }
  }
  return null;
}

function parseInstructions(description: string): string | null {
  // Try to match after known instruction headers
  const patterns = [
    /(?:Instructions|Cara[-\s]?(?:membuat|memasak)|Directions|Method|Steps|How to|Preparation|To make|Instructions|DIRECTIONS)[:\s]*([\s\S]*?)(?:\n\n\n|\n*(?:Follow|LIKE|SUBSCRIBE|#|@|http)|$)/i,
    /(?:Steps|Step by step)[:\s]*([\s\S]*?)(?:\n\n\n|\n*(?:Follow|Enjoy|LIKE|SUBSCRIBE|#|@|http)|$)/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      const lines = match[1]
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => {
          return l && l.length > 5 && !l.startsWith("Follow") && !l.startsWith("LIKE") && !l.startsWith("SUBSCRIBE") && !l.startsWith("#") && !l.startsWith("@") && !l.startsWith("http");
        });
      if (lines.length >= 2) return lines.join("\n");
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const videoId = extractYouTubeId(url);
  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    // Use YouTube Data API v3
    const apiRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!apiRes.ok) {
      const err = await apiRes.text();
      console.error("YouTube API error:", err);
      return NextResponse.json({ error: "YouTube API error" }, { status: 502 });
    }

    const data = await apiRes.json();
    const item = data?.items?.[0];
    if (!item) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const snippet = item.snippet;
    const title = snippet.title || "Pinned recipe video";
    const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const description: string = snippet.description || "";

    // Parse ingredients & instructions from description
    const ingredients = description ? parseIngredients(description) : null;
    const instructions = description ? parseInstructions(description) : null;

    return NextResponse.json({
      videoId,
      title,
      thumbnail,
      description: description || null,
      ingredients,
      instructions,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}
