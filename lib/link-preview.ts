import { extractYouTubeId, fetchYouTubePreview } from "./youtube";

export interface LinkPreview {
  url: string;
  title: string;
  image: string | null;
  ingredients: string | null;
  instructions: string | null;
  isYouTube: boolean;
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const videoId = extractYouTubeId(trimmed);
  if (videoId) {
    const yt = await fetchYouTubePreview(trimmed);
    if (!yt) return null;
    return {
      url: trimmed,
      title: yt.title,
      image: yt.thumbnail,
      ingredients: null,
      instructions: null,
      isYouTube: true,
    };
  }

  try {
    new URL(trimmed);
  } catch {
    return null;
  }

  try {
    const res = await fetch(`/api/link-preview?url=${encodeURIComponent(trimmed)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      url: trimmed,
      title: data.title ?? "Pinned recipe",
      image: data.image ?? null,
      ingredients: data.ingredients ?? null,
      instructions: data.instructions ?? null,
      isYouTube: false,
    };
  } catch {
    return null;
  }
}
