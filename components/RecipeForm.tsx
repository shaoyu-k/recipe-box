"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CATEGORY_COLOR, Category, Recipe } from "@/lib/types";
import { createRecipe, updateRecipe, uploadPhoto } from "@/lib/api-client";
import { fetchLinkPreview } from "@/lib/link-preview";
import { useObjectURL } from "@/lib/useObjectURL";
import { useTranslation } from "@/lib/i18n";

type Mode = "photo" | "pin";

export function RecipeForm({ existing }: { existing?: Recipe }) {
  const router = useRouter();
  const { t } = useTranslation();
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

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(existing?.photoUrl ?? null);
  const localPreview = useObjectURL(photoFile);
  const photoPreview = localPreview ?? photoUrl;

  const [linkUrl, setLinkUrl] = useState(existing?.sourceUrl ?? "");
  const [sourceImage, setSourceImage] = useState<string | null>(existing?.sourceImage ?? null);
  const [isYouTube, setIsYouTube] = useState<boolean>(existing?.type === "youtube");
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "pin" || !linkUrl.trim()) return;
    if (linkUrl === existing?.sourceUrl) return;

    const handle = setTimeout(async () => {
      setFetchingPreview(true);
      setFetchError(null);
      const preview = await fetchLinkPreview(linkUrl.trim());
      setFetchingPreview(false);
      if (!preview) {
        setFetchError(t("form.linkError"));
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
      setError(t("form.errorTitle"));
      return;
    }
    if (mode === "photo" && !photoFile && !photoUrl) {
      setError(t("form.errorPhoto"));
      return;
    }
    if (mode === "pin" && !linkUrl.trim()) {
      setError(t("form.errorLink"));
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
        setError(t("form.errorUpload"));
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
      setError(t("form.errorSave"));
      setSaving(false);
    }
  }

  const busy = uploading || saving;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Mode toggle */}
      <div className="flex gap-2 rounded-full border border-line bg-card p-1">
        <ToggleButton active={mode === "photo"} onClick={() => setMode("photo")}>
          {t("form.photoTab")}
        </ToggleButton>
        <ToggleButton active={mode === "pin"} onClick={() => setMode("pin")}>
          {t("form.pinTab")}
        </ToggleButton>
      </div>

      {mode === "photo" ? (
        <Field label={t("form.photoLabel")}>
          <label className="flex aspect-[4/3] w-full max-w-sm cursor-pointer items-center justify-center overflow-hidden rounded-sm border border-dashed border-line bg-paper-dark text-sm text-ink-soft hover:border-ink/40">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt="Selected dish"
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{t("form.photoPlaceholder")}</span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </Field>
      ) : (
        <Field label={t("form.linkLabel")}>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder={t("form.linkPlaceholder")}
            className="w-full rounded-sm border border-line bg-card px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/70"
          />
          {fetchingPreview && (
            <p className="mt-2 font-mono text-xs text-ink-soft">
              {t("form.fetching")}
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

      <Field label={t("form.titleLabel")}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("form.titlePlaceholder")}
          className="w-full rounded-sm border border-line bg-card px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/70"
        />
      </Field>

      <Field label={t("form.categoryLabel")}>
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
              {t(`cat.${c}`)}
            </button>
          ))}
        </div>
      </Field>

      <Field label={t("form.triedLabel")}>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 rounded-full border border-line bg-card p-1">
            <ToggleButton active={!tried} onClick={() => setTried(false)}>
              {t("form.triedWishlist")}
            </ToggleButton>
            <ToggleButton active={tried} onClick={() => setTried(true)}>
              {t("form.triedYes")}
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

      <Field label={t("form.ingredientsLabel")}>
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder={t("form.ingredientsPlaceholder")}
          rows={5}
          className="w-full resize-none rounded-sm border border-line bg-card px-3 py-2.5 font-mono text-sm leading-relaxed text-ink placeholder:text-ink-soft/70"
        />
      </Field>

      <Field label={t("form.instructionsLabel")}>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder={t("form.instructionsPlaceholder")}
          rows={6}
          className="w-full resize-none rounded-sm border border-line bg-card px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-soft/70"
        />
      </Field>

      <Field label={t("form.notesLabel")}>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("form.notesPlaceholder")}
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
            ? t("form.uploading")
            : saving
              ? t("form.saving")
              : isEditing
                ? t("form.saveEdit")
                : t("form.saveAdd")}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-line px-6 py-2.5 text-sm font-medium text-ink-soft hover:border-ink/40"
        >
          {t("form.cancel")}
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
