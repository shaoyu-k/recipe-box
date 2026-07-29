"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// ── Types ──────────────────────────────────────────────────────────
export type Locale = "en" | "id";

type TranslationValue = string | ((...args: string[]) => string);

type TranslationMap = Record<string, TranslationValue>;

// ── Dictionaries ───────────────────────────────────────────────────
const en: TranslationMap = {
  // Home
  "home.sharedTagline": "Shared with everyone who has the code",
  "home.title": "The Recipe Box",
  "home.subtitle": "A home for recipes worth making again.",
  "home.export": "Export backup",
  "home.exporting": "Exporting…",
  "home.lock": "Lock the box",
  "home.searchPlaceholder": "Search your recipes, ingredients or tags…",
  "home.loading": "Opening the box…",
  "home.emptyTitle": "Your box is empty.",
  "home.emptyDesc":
    "Add a photo of a dish with the recipe, or pin one from YouTube to get started.",
  "home.emptyCta": "Add your first recipe",
  "home.noMatch": "Nothing matches that search.",
  "home.newRecipe": "New Recipe",
  "home.sortLatest": "Latest added",
  "home.sortOldest": "Oldest first",
  "home.sortAZ": "A–Z",

  // Filters
  "filter.all": "All",
  "filter.tried": "Tried",
  "filter.wishlist": "Wishlist",
  "filter.favorites": "Favorites",
  "filter.pinned": "Pinned",

  // Login
  "login.brand": "The Recipe Box",
  "login.heading": "Enter the access code",
  "login.placeholder": "Access code",
  "login.error": "That code doesn't match. Try again.",
  "login.checking": "Checking…",
  "login.submit": "Open the box",

  // Add
  "add.back": "← Back to the box",
  "add.heading": "Add a recipe",

  // Edit
  "edit.back": "← Back to the card",
  "edit.heading": "Edit recipe",
  "edit.loading": "Opening the card…",
  "edit.notFound": "That recipe isn't in the box.",
  "edit.notFoundBack": "Back to the box",

  // Recipe detail
  "detail.loading": "Opening the card…",
  "detail.notFound": "That recipe isn't in the box.",
  "detail.notFoundBack": "Back to the box",
  "detail.back": "← Back to the box",
  "detail.pinnedYouTube": "Pinned from YouTube",
  "detail.pinnedWeb": "Pinned from the web",
  "detail.catalogNo": "No. {{n}}",
  "detail.tried": "Tried it",
  "detail.wishlist": "Wishlist",
  "detail.watchYouTube": "Watch on YouTube",
  "detail.viewOriginal": "View original recipe",
  "detail.ingredients": "Ingredients",
  "detail.instructions": "Instructions",
  "detail.notes": "Notes",
  "detail.edit": "Edit",
  "detail.delete": "Delete",
  "detail.deleteConfirm": "Remove this card?",
  "detail.deleteYes": "Yes, delete",
  "detail.cancel": "Cancel",

  // RecipeForm
  "form.photoTab": "Photo recipe",
  "form.pinTab": "Pin from a link",
  "form.photoLabel": "Photo of the dish",
  "form.photoPlaceholder": "Tap to choose a photo",
  "form.linkLabel": "Link",
  "form.linkPlaceholder": "Paste a recipe link or YouTube URL",
  "form.fetching": "Fetching title, photo, and recipe details…",
  "form.linkError": "Couldn't read that link. Check the URL and try again.",
  "form.titleLabel": "Title",
  "form.titlePlaceholder": "Grandma's laksa",
  "form.categoryLabel": "Category",
  "form.triedLabel": "Have you made it?",
  "form.triedWishlist": "On my wishlist",
  "form.triedYes": "Tried it",
  "form.ingredientsLabel": "Ingredients",
  "form.ingredientsPlaceholder": "One per line, e.g.\n2 cups flour\n1 tsp salt",
  "form.instructionsLabel": "Instructions",
  "form.instructionsPlaceholder": "One step per line",
  "form.notesLabel": "Notes (optional)",
  "form.notesPlaceholder": "Substitutions, who loved it, what to change next time…",
  "form.errorTitle": "Give the recipe a title.",
  "form.errorPhoto": "Add a photo of the dish, or switch to pinning a link.",
  "form.errorLink": "Paste a recipe link or YouTube URL.",
  "form.errorUpload": "Couldn't upload that photo. Check your connection and try again.",
  "form.errorSave": "Couldn't save that. Check your connection and try again.",
  "form.uploading": "Uploading photo…",
  "form.saving": "Saving…",
  "form.saveEdit": "Save changes",
  "form.saveAdd": "Add to box",
  "form.cancel": "Cancel",

  // Categories
  "cat.Chinese": "Chinese",
  "cat.Korean": "Korean",
  "cat.Japanese": "Japanese",
  "cat.Thai": "Thai",
  "cat.Western": "Western",
  "cat.Indonesian": "Indonesian",
  "cat.Other": "Other",
  "cat.Breakfast": "Breakfast",
  "cat.Lunch": "Lunch",
  "cat.Dinner": "Dinner",

  // Lang toggle
  "lang.label": "ID",
};

const id: TranslationMap = {
  "home.sharedTagline": "Dibagikan ke semua yang punya kodenya",
  "home.title": "Kotak Resep",
  "home.subtitle": "Rumah untuk resep yang layak dibuat lagi.",
  "home.export": "Ekspor cadangan",
  "home.exporting": "Mengekspor…",
  "home.lock": "Kunci kotak",
  "home.searchPlaceholder": "Cari resep, bahan, atau tag…",
  "home.loading": "Membuka kotak…",
  "home.emptyTitle": "Kotakmu masih kosong.",
  "home.emptyDesc":
    "Tambahkan foto masakan dengan resepnya, atau sematkan dari YouTube untuk memulai.",
  "home.emptyCta": "Tambah resep pertama",
  "home.noMatch": "Tidak ada yang cocok.",
  "home.newRecipe": "Resep Baru",
  "home.sortLatest": "Terbaru",
  "home.sortOldest": "Terlama",
  "home.sortAZ": "A–Z",

  "filter.all": "Semua",
  "filter.tried": "Sudah",
  "filter.wishlist": "Ingin",
  "filter.favorites": "Favorit",
  "filter.pinned": "Disematkan",

  "login.brand": "Kotak Resep",
  "login.heading": "Masukkan kode akses",
  "login.placeholder": "Kode akses",
  "login.error": "Kode tidak cocok. Coba lagi.",
  "login.checking": "Memeriksa…",
  "login.submit": "Buka kotak",

  "add.back": "← Kembali ke kotak",
  "add.heading": "Tambah resep",

  "edit.back": "← Kembali ke kartu",
  "edit.heading": "Edit resep",
  "edit.loading": "Membuka kartu…",
  "edit.notFound": "Resep itu tidak ada di kotak.",
  "edit.notFoundBack": "Kembali ke kotak",

  "detail.loading": "Membuka kartu…",
  "detail.notFound": "Resep itu tidak ada di kotak.",
  "detail.notFoundBack": "Kembali ke kotak",
  "detail.back": "← Kembali ke kotak",
  "detail.pinnedYouTube": "Disematkan dari YouTube",
  "detail.pinnedWeb": "Disematkan dari web",
  "detail.catalogNo": "No. {{n}}",
  "detail.tried": "Sudah dicoba",
  "detail.wishlist": "Ingin dicoba",
  "detail.watchYouTube": "Tonton di YouTube",
  "detail.viewOriginal": "Lihat resep asli",
  "detail.ingredients": "Bahan",
  "detail.instructions": "Cara membuat",
  "detail.notes": "Catatan",
  "detail.edit": "Edit",
  "detail.delete": "Hapus",
  "detail.deleteConfirm": "Hapus kartu ini?",
  "detail.deleteYes": "Ya, hapus",
  "detail.cancel": "Batal",

  "form.photoTab": "Resep foto",
  "form.pinTab": "Sematkan link",
  "form.photoLabel": "Foto masakan",
  "form.photoPlaceholder": "Ketuk untuk pilih foto",
  "form.linkLabel": "Link",
  "form.linkPlaceholder": "Tempel link resep atau URL YouTube",
  "form.fetching": "Mengambil judul, foto, dan detail resep…",
  "form.linkError": "Tidak bisa membaca link itu. Periksa URL dan coba lagi.",
  "form.titleLabel": "Judul",
  "form.titlePlaceholder": "Laksa nenek",
  "form.categoryLabel": "Kategori",
  "form.triedLabel": "Sudah dibuat?",
  "form.triedWishlist": "Masih wishlist",
  "form.triedYes": "Sudah dicoba",
  "form.ingredientsLabel": "Bahan",
  "form.ingredientsPlaceholder": "Satu per baris, contoh:\n2 cangkir tepung\n1 sdt garam",
  "form.instructionsLabel": "Cara membuat",
  "form.instructionsPlaceholder": "Satu langkah per baris",
  "form.notesLabel": "Catatan (opsional)",
  "form.notesPlaceholder": "Pengganti bahan, siapa yang suka, apa yang diubah nanti…",
  "form.errorTitle": "Beri judul resep.",
  "form.errorPhoto": "Tambahkan foto masakan, atau ganti ke sematkan link.",
  "form.errorLink": "Tempel link resep atau URL YouTube.",
  "form.errorUpload": "Tidak bisa mengunggah foto. Periksa koneksi dan coba lagi.",
  "form.errorSave": "Tidak bisa menyimpan. Periksa koneksi dan coba lagi.",
  "form.uploading": "Mengunggah foto…",
  "form.saving": "Menyimpan…",
  "form.saveEdit": "Simpan perubahan",
  "form.saveAdd": "Tambah ke kotak",
  "form.cancel": "Batal",

  "cat.Chinese": "Chinese",
  "cat.Korean": "Korea",
  "cat.Japanese": "Jepang",
  "cat.Thai": "Thailand",
  "cat.Western": "Barat",
  "cat.Indonesian": "Indonesia",
  "cat.Other": "Lainnya",
  "cat.Breakfast": "Sarapan",
  "cat.Lunch": "Makan Siang",
  "cat.Dinner": "Makan Malam",

  "lang.label": "EN",
};

const dictionaries: Record<Locale, TranslationMap> = { en, id };

// ── Context ────────────────────────────────────────────────────────
interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
});

export function useTranslation() {
  return useContext(I18nContext);
}

// ── Provider ───────────────────────────────────────────────────────
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("recipebox-locale") as Locale | null;
    if (stored === "en" || stored === "id") setLocaleState(stored);
    setMounted(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("recipebox-locale", l);
  }, []);

  const t = useCallback(
    (key: string, replacements?: Record<string, string>) => {
      let val = dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
      if (replacements) {
        for (const [k, v] of Object.entries(replacements)) {
          val = (val as string).replace(`{{${k}}}`, v);
        }
      }
      return val as string;
    },
    [locale]
  );

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
