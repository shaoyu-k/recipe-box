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
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Could not fetch video" }, { status: 502 });
    }

    const html = await res.text();

    // Try to extract description from JSON-LD
    let description = "";
    const jsonLdMatch = html.match(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/
    );
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        if (Array.isArray(jsonLd)) {
          for (const item of jsonLd) {
            if (item.description) {
              description = item.description;
              break;
            }
          }
        } else if (jsonLd.description) {
          description = jsonLd.description;
        }
      } catch {}
    }

    // Fallback: try ytInitialData JSON
    if (!description) {
      const ytDataMatch = html.match(/ytInitialData\s*=\s*({[\s\S]*?});/);
      if (ytDataMatch) {
        try {
          const data = JSON.parse(ytDataMatch[1]);
          const desc =
            data?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]
              ?.videoPrimaryInfoRenderer?.attributedDescription?.content;
          if (desc) description = desc;
        } catch {}
      }
    }

    // Fallback: meta description
    if (!description) {
      const metaMatch = html.match(
        /<meta\s+name="description"\s+content="([^"]+)"/i
      );
      if (metaMatch) description = metaMatch[1];
    }

    // Fallback: og:description
    if (!description) {
      const ogMatch = html.match(
        /<meta\s+property="og:description"\s+content="([^"]+)"/i
      );
      if (ogMatch) description = ogMatch[1];
    }

    // Clean up HTML entities
    description = description.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\\n/g, "\n");

    // Attemp to parse ingredients from description
    let ingredients: string | null = null;
    let instructions: string | null = null;

    if (description) {
      // Common ingredient markers
      const ingMatch = description.match(
        /(?:Ingredients|Bahan[-\s]?bahan|Bahan-bahan)[:\s]*([\s\S]*?)(?:\n\n|\n(?:Instructions|Cara[-\s]?(?:(?:membuat|memasak)|Cara[:\s])|Directions|Method|Steps|How to|Preparation|To make|Instructions))/i
      );
      if (ingMatch) {
        const raw = ingMatch[1].trim();
        // Filter out lines that look like ingredients (start with number/amount or bullet)
        const lines = raw.split("\n").filter((l: string) => {
          const t = l.trim();
          return t && !t.startsWith("Follow") && !t.startsWith("LIKE") && !t.startsWith("SUBSCRIBE") && !t.startsWith("#") && t.length > 3;
        });
        if (lines.length >= 2) {
          ingredients = lines.join("\n");
        }
      }

      // Instructions
      const instrMatch = description.match(
        /(?:Instructions|Cara[-\s]?(?:membuat|memasak)|Directions|Method|Steps|How to|Preparation|To make|Instructions)[:\s]*([\s\S]*?)(?:\n\n\n|\n*$)/i
      );
      if (instrMatch) {
        const raw = instrMatch[1].trim();
        const lines = raw.split("\n").filter((l: string) => {
          const t = l.trim();
          return t && t.length > 5 && !t.startsWith("Follow") && !t.startsWith("LIKE") && !t.startsWith("SUBSCRIBE") && !t.startsWith("#");
        });
        if (lines.length >= 2) {
          instructions = lines.join("\n");
        }
      }
    }

    // Get oembed title + thumbnail
    let title = "Pinned recipe video";
    let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    try {
      const oembed = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (oembed.ok) {
        const data = await oembed.json();
        if (data.title) title = data.title;
      }
    } catch {}

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
