# The Recipe Box

A shared personal cookbook. Add a photo of a dish along with the recipe, or
pin a recipe straight from a YouTube link (it pulls the video's title and
thumbnail automatically). Browse it like a box of index cards — each
recipe gets a catalog number and a colored tab for its category.

Recipes and photos are stored centrally (not just on one phone), so
everyone with the access code — you and your helper, for example — sees
the same up-to-date box automatically. No manual exporting or sending
files back and forth.

## How it's built

- **Recipe text & links** → Postgres (via Neon, connected through Vercel)
- **Photos** → Vercel Blob storage
- **Access** → a single shared access code (set by you), stored as a
  cookie per device after entering it once. This isn't full user accounts
  — anyone with the code and the link can view, add, and edit recipes.

## Deploying

### 1. Push to GitHub

Push this folder to a new GitHub repository.

### 2. Create the Vercel project

Go to vercel.com → **Add New Project** → import that repo. Don't deploy
yet — add the storage first (next two steps), since the app needs them
to run.

### 3. Connect a Postgres database

In your new project: **Storage** tab → **Create Database** → choose
**Neon** → **Create New Neon Account** (free, no credit card needed for
the free tier). This automatically sets the `DATABASE_URL` environment
variable. No manual table setup needed — the app creates its own table
the first time it runs.

### 4. Connect Blob storage

Same **Storage** tab → **Create Database** → choose **Blob**. This sets
`BLOB_READ_WRITE_TOKEN` automatically.

### 5. Set an access code

**Settings** → **Environment Variables** → add `ACCESS_CODE` with a word
or short phrase you'll share with your helper (e.g. `kitchen2026`). Both
of you will type this once on each device to unlock the box. If you skip
this, the app is open to anyone who has the link.

### 6. Deploy

Trigger a deploy (or it'll deploy automatically once the env vars are
set). Open the URL, enter your access code, and start adding recipes.
Share the same URL and code with your helper.

## Running it locally

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

## Cost

Designed to stay within Vercel's and Neon's free tiers for a personal
recipe collection:

- Vercel Hobby plan: free (personal/non-commercial use)
- Vercel Blob: 1GB storage + 10GB transfer/month free — roughly
  300–500 phone photos before you'd approach the limit
- Neon Postgres free tier: 0.5GB storage — far more than enough for
  recipe text, since photos live in Blob storage instead

If a free limit is ever hit, Vercel pauses that one feature rather than
charging you automatically.

## Tech

Next.js (App Router) + TypeScript + Tailwind CSS, Neon Postgres, Vercel
Blob, a Vercel `proxy.ts` (formerly "middleware") for the access-code gate.
# recipe-box
