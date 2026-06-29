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
}

// Tries YouTube's oEmbed endpoint for the real title. If that fails (network
// or CORS), we still have a usable thumbnail straight from YouTube's image
// CDN, and the title falls back to something editable.
export async function fetchYouTubePreview(url: string): Promise<YouTubePreview | null> {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  let title = "Pinned recipe video";

  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    if (res.ok) {
      const data = await res.json();
      if (typeof data.title === "string" && data.title.trim()) {
        title = data.title.trim();
      }
    }
  } catch {
    // Network/CORS issue — keep the fallback title, thumbnail still works.
  }

  return { videoId, title, thumbnail };
}
