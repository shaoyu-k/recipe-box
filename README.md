<div align="center">
  <h1>📦 The Recipe Box</h1>
  <p>A shared family cookbook — add a photo, pin a YouTube link,<br>browse everything like a box of index cards.</p>
  <p>
    <a href="https://recipe-box-bice-mu.vercel.app"><strong>→ Live Demo</strong></a>
  </p>
</div>

---

A shared personal cookbook for me and my family. Add a photo of a dish, or pin a recipe straight from a YouTube link — it pulls the video's title, thumbnail, and ingredients automatically. Browse recipes like a box of index cards, each with a catalog number and a coloured tab for its cuisine category.

Recipes and photos live in the cloud (not on one phone), so everyone with the access code sees the same up-to-date box. No manual exporting or sending files back and forth.

## Built with

| Layer | Stack |
|---|---|
| **Frontend** | Next.js (App Router) + TypeScript + Tailwind CSS |
| **Database** | Postgres via Neon |
| **Storage** | Vercel Blob (photos) |
| **Auth** | Single shared access code (cookie-based) |
| **Hosting** | Vercel (auto-deploys from GitHub) |

## Features

- **Pin from YouTube** — paste a link; title, thumbnail, and recipe details populate automatically
- **Photo upload** — snap and save directly from your phone
- **Catalogue system** — each recipe gets a numbered card with a colour-coded category tab
- **Tried / Wishlist** — track what you've made and what's next
- **Favourites** — bookmark your go-to dishes
- **Export backup** — download all recipes as JSON

## Running locally

```bash
npm install
cp .env.local.example .env.local   # fill in your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Cost

Stays within Vercel and Neon free tiers for a personal collection:

- **Vercel Hobby** — free
- **Blob** — 1 GB storage (~300–500 phone photos)
- **Neon Postgres** — 0.5 GB (far more than enough for recipe text)

If a limit is ever hit, Vercel pauses that one feature rather than charging.
