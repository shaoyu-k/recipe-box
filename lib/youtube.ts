export function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1) || null;
    }
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

export interface YouTubePreview {
  videoId: string;
  title: string;
  thumbnail: string;
  description: string | null;
  ingredients: string | null;
  instructions: string | null;
}

// Tries YouTube's oEmbed endpoint for the real title. If that fails (network
// or CORS), we still have a usable thumbnail straight from YouTube's image
// CDN, and the title falls back to something editable.
export async function fetchYouTubePreview(url: string): Promise<YouTubePreview | null> {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  let title = "Pinned recipe video";
  let description: string | null = null;
  let ingredients: string | null = null;
  let instructions: string | null = null;

  try {
    const res = await fetch(
      `/api/youtube-preview?url=${encodeURIComponent(url)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.title) title = data.title;
      if (data.description) description = data.description;
      if (data.ingredients) ingredients = data.ingredients;
      if (data.instructions) instructions = data.instructions;
    }
  } catch {
    // Fallback: oembed for title only
    try {
      const oembed = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (oembed.ok) {
        const data = await oembed.json();
        if (data.title) title = data.title;
      }
    } catch {}
  }

  return { videoId, title, thumbnail, description, ingredients, instructions };
}
