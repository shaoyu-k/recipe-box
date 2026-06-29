"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CATEGORY_COLOR, Category, Recipe } from "@/lib/types";
import { createRecipe, updateRecipe, uploadPhoto } from "@/lib/api-client";
import { fetchLinkPreview } from "@/lib/link-preview";
import { useObjectURL } from "@/lib/useObjectURL";

type Mode = "photo" | "pin";

export function RecipeForm({ existing }: { existing?: Recipe }) {
  const router = useRouter();
  const isEditing = !!existing;

  const [mode, setMode] = useState<Mode>(
    existing && existing.type !== "photo" ? "pin" : "photo"
  );
  const [title, setTitle] = useState(existing?.title ?? "");
  const [category, setCategory] = useState<Category>(existing?.category ?? "Chinese");
  const [tried, setTried] = useState<boolean>(existing?.tried ?? (existing ? false : mode === "photo"));
  const [favorite, setFavorite] = useState<boolean>(existing?.favorite ?? false);
  const [ingredients, setIngredients] = useState(existing?.ingredients ?? "");
  const [instructions, setInstructions] = useState(existing?.instructions ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");

  // photoFile holds a newly picked photo not yet uploaded; photoUrl holds
  // either the existing photo (when editing) or the result of an upload.
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(existing?.photoUrl ?? null);
  const localPreview = useObjectURL(photoFile);
  const photoPreview = localPreview ?? photoUrl;

  // Pinned-link state: works for a YouTube video or any other recipe URL.
  const [linkUrl, setLinkUrl] = useState(existing?.sourceUrl ?? "");
  const [sourceImage, setSourceImage] = useState<string | null>(existing?.sourceImage ?? null);
  const [isYouTube, setIsYouTube] = useState<boolean>(existing?.type === "youtube");
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch a preview shortly after the user pastes a link. For YouTube
  // this is title + thumbnail; for other recipe sites, it also tries to
  // pull real ingredients/instructions if the page provides them.
  useEffect(() => {
    if (mode !== "pin" || !linkUrl.trim()) return;
    if (linkUrl === existing?.sourceUrl) return;

    const handle = setTimeout(async () => {
      setFetchingPreview(true);
      setFetchError(null);
      const preview = await fetchLinkPreview(linkUrl.trim());
      setFetchingPreview(false);
      if (!preview) {
        setFetchError("Couldn't read that link. Check the URL and try again.");
        return;
      }
      setIsYouTube(preview.isYouTube);
      setSourceImage(preview.image);
      if (!title.trim()) setTitle(preview.title);
      if (!ingredients.trim() && preview.ingredients) setIngredients(preview.ingredients);
      if (!instructions.trim() && preview.instructions) setInstructions(preview.instructions);
    }, 600);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkUrl, mode]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Give the recipe a title.");
      return;
    }
    if (mode === "photo" && !photoFile && !photoUrl) {
      setError("Add a photo of the dish, or switch to pinning a link.");
      return;
    }
    if (mode === "pin" && !linkUrl.trim()) {
      setError("Paste a recipe link or YouTube URL.");
      return;
    }

    let finalPhotoUrl = photoUrl;
    if (mode === "photo" && photoFile) {
      setUploading(true);
      try {
        finalPhotoUrl = await uploadPhoto(photoFile);
        setPhotoUrl(finalPhotoUrl);
      } catch {
        setUploading(false);
        setError("Couldn't upload that photo. Check your connection and try again.");
        return;
      }
      setUploading(false);
    }

    setSaving(true);
    try {
      const input = {
        title: title.trim(),
        category,
        type: (mode === "photo" ? "photo" : isYouTube ? "youtube" : "link") as Recipe["type"],
        ingredients,
        instructions,
        notes,
        photoUrl: mode === "photo" ? finalPhotoUrl : null,
        sourceUrl: mode === "pin" ? linkUrl.trim() : null,
        sourceImage: mode === "pin" ? sourceImage : null,
        tried,
        favorite,
      };
      const saved = existing
        ? await updateRecipe(existing.id, input)
        : await createRecipe(input);
      router.push(`/recipe/${saved.id}`);
    } catch {
      setError("Couldn't save that. Check your connection and try again.");
      setSaving(false);
    }
  }

  const busy = uploading || saving;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Mode toggle */}
      <div className="flex gap-2 rounded-full border border-line bg-card p-1">
        <ToggleButton active={mode === "photo"} onClick={() => setMode("photo")}>
          Photo recipe
        </ToggleButton>
        <ToggleButton active={mode === "pin"} onClick={() => setMode("pin")}>
          Pin from a link
        </ToggleButton>
      </div>

      {mode === "photo" ? (
        <Field label="Photo of the dish">
          <label className="flex aspect-[4/3] w-full max-w-sm cursor-pointer items-center justify-center overflow-hidden rounded-sm border border-dashed border-line bg-paper-dark text-sm text-ink-soft hover:border-ink/40">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt="Selected dish"
                className="h-full w-full object-cover"
              />
            ) : (
              <span>Tap to choose a photo</span>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </Field>
      ) : (
        <Field label="Link">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Paste a recipe link or YouTube URL"
            className="w-full rounded-sm border border-line bg-card px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/70"
          />
          {fetchingPreview && (
            <p className="mt-2 font-mono text-xs text-ink-soft">
              Fetching title, photo, and recipe details…
            </p>
          )}
          {fetchError && (
            <p className="mt-2 text-xs text-tomato">{fetchError}</p>
          )}
          {sourceImage && (
            <div className="mt-3 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-sm bg-paper-dark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sourceImage}
                alt="Link preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </Field>
      )}

      <Field label="Title">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Grandma's laksa"
          className="w-full rounded-sm border border-line bg-card px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/70"
        />
      </Field>

      <Field label="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategory(c)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? "border-ink bg-ink text-card"
                  : "border-line bg-card text-ink-soft hover:border-ink/40"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: category === c ? "currentColor" : CATEGORY_COLOR[c] }}
              />
              {c}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Have you made it?">
        <div className="flex items-center gap-3">
          <div className="flex gap-2 rounded-full border border-line bg-card p-1">
            <ToggleButton active={!tried} onClick={() => setTried(false)}>
              On my wishlist
            </ToggleButton>
            <ToggleButton active={tried} onClick={() => setTried(true)}>
              Tried it
            </ToggleButton>
          </div>
          <button
            type="button"
            onClick={() => setFavorite((f) => !f)}
            aria-pressed={favorite}
            aria-label={favorite ? "Remove from favorites" : "Mark as favorite"}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
              favorite
                ? "border-mustard bg-mustard text-card"
                : "border-line bg-card text-ink-soft hover:border-ink/40"
            }`}
          >
            <StarIcon filled={favorite} className="h-4 w-4" />
          </button>
        </div>
      </Field>

      <Field label="Ingredients">
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder={"One per line, e.g.\n2 cups flour\n1 tsp salt"}
          rows={5}
          className="w-full resize-none rounded-sm border border-line bg-card px-3 py-2.5 font-mono text-sm leading-relaxed text-ink placeholder:text-ink-soft/70"
        />
      </Field>

      <Field label="Instructions">
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder={"One step per line"}
          rows={6}
          className="w-full resize-none rounded-sm border border-line bg-card px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-soft/70"
        />
      </Field>

      <Field label="Notes (optional)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Substitutions, who loved it, what to change next time…"
          rows={3}
          className="w-full resize-none rounded-sm border border-line bg-card px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-soft/70"
        />
      </Field>

      {error && <p className="text-sm text-tomato">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-tomato px-6 py-2.5 text-sm font-medium text-card hover:bg-tomato-dark disabled:opacity-60"
        >
          {uploading
            ? "Uploading photo…"
            : saving
              ? "Saving…"
              : isEditing
                ? "Save changes"
                : "Add to box"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-line px-6 py-2.5 text-sm font-medium text-ink-soft hover:border-ink/40"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      aria-hidden
    >
      <path
        d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-ink text-card" : "text-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      {children}
    </label>
  );
}
