# Garage Service System

A day-to-day management system for a car garage / auto body shop: customers, vehicles, work
orders (labor + parts), inventory, a laborer roster, walk-in quotations, and printable
Estimate/Invoice/Quotation PDFs. Currency is PHP.

**Stack:** Next.js (App Router) · Prisma + Postgres · Vercel Blob (file storage) ·
`@react-pdf/renderer` · Tailwind CSS.

---

## 1. First-time setup on a new computer

### Prerequisites
- **Node.js 20 or later** (this project was built and tested on Node 24).
- A **Postgres database**. The easiest option is a free [Neon](https://neon.tech) database,
  or Vercel's own **Storage** tab (which creates a Neon database for you and wires up the
  environment variable automatically once the project is imported into Vercel — see
  [Section 3](#3-deploying-to-vercel)). Either way you'll end up with one connection string.
- A **Vercel Blob** store, for the shop logo upload. This is also created from Vercel's
  Storage tab. Local dev needs its token too (see below).

> Note: this app uses a **cloud** database and file storage even for local development —
> not a local file like early prototypes of this project used. That means local dev now
> needs a working internet connection to reach the database. This was a deliberate tradeoff
> to make the app deployable on Vercel (see [Section 4](#4-why-cloud-storage-the-tradeoff)
> for why).

### Steps

1. **Get the code onto the new machine.** If you push this project to GitHub (see
   [Section 3](#3-deploying-to-vercel)), just `git clone` it. Otherwise copy the whole
   project folder, minus `node_modules/` and `.next/` (those get regenerated).

2. **Install dependencies:**
   ```bash
   npm install
   ```
   **Windows only:** npm may print a warning like *"X packages have install scripts not yet
   covered by allowScripts"* for `prisma`, `@prisma/engines`, or `esbuild`. This is a normal
   npm 11 security prompt for native-binary installers these packages need — approve them:
   ```bash
   npm install-scripts approve prisma @prisma/engines @prisma/client esbuild unrs-resolver
   ```

3. **Create your `.env` file:**
   ```bash
   cp .env.example .env
   ```
   Then fill in:
   - `DATABASE_URL` — your Postgres connection string (from Neon or Vercel Storage).
   - `SESSION_SECRET` — any long random string, e.g.
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - `BLOB_READ_WRITE_TOKEN` — from your Vercel Blob store's settings (or run
     `vercel env pull .env` after linking the project with `vercel link`, which pulls all
     three of these automatically once they're set in the Vercel dashboard).

4. **Create the database tables and seed an admin user:**
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```
   This prints a seeded login: `admin` / `admin123`. **Change this password path** (there's
   no self-service password change screen yet — for now, update it directly:
   `npx prisma studio`, open the `User` table, and replace `passwordHash` with the output of
   `node -e "console.log(require('bcryptjs').hashSync('yourNewPassword', 10))"`).

5. **Run it:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 and log in.

### Windows + OneDrive note
If this project folder lives inside a OneDrive-synced folder (like `Documents\...`), OneDrive
can lock files inside `.next/` mid-build, causing `npm run build` to fail with an `EPERM`
error. If that happens, just delete the `.next` folder and rebuild:
```bash
rmdir /s /q .next   &&   npm run build
```
Moving the project to a non-synced local folder (e.g. `C:\Dev\...`) avoids this entirely.

---

## 2. Using it from another device

### While developing locally (same building/network)
Start the dev server bound to your network interface, not just `localhost`:
```bash
npm run dev
```
Next.js already prints a **Network** URL (something like `http://192.168.1.27:3000`) —
open that from any phone/tablet/laptop on the same Wi-Fi/LAN as the machine running it.

### From anywhere
Once deployed to Vercel (next section), you get a permanent public URL
(`https://your-project.vercel.app`) that works from any device with internet — no network
setup needed. This is the main reason to deploy rather than just running it on one shop PC.

---

## 3. Deploying to Vercel

### Step 1 — Push the code to GitHub
This project is already a local git repository with an initial commit. Create an empty
repository on GitHub, then:
```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

### Step 2 — Import into Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo you just pushed.
2. Leave the framework preset as **Next.js** (auto-detected) and click **Deploy** once —
   it *will* fail on this first pass because there's no database yet. That's expected;
   continue to Step 3.

### Step 3 — Add a Postgres database
In the project's **Storage** tab: **Create Database → Postgres** (this provisions a Neon
database). Connect it to your project — Vercel automatically adds a `DATABASE_URL`
environment variable for you across all environments.

### Step 4 — Add Blob storage (for the shop logo)
Same **Storage** tab: **Create Database → Blob**. Connect it to your project — Vercel adds
`BLOB_READ_WRITE_TOKEN` automatically.

### Step 5 — Set the remaining environment variable
In **Settings → Environment Variables**, add:
- `SESSION_SECRET` — a long random string (same as local, but generate a separate one for
  production — don't reuse your local dev secret).

### Step 6 — Run the first migration + seed against production
From your local machine, temporarily point at the production database (copy the
`DATABASE_URL` Vercel generated from its dashboard into a one-off terminal command, or a
`.env.production.local` file), then:
```bash
npx prisma migrate deploy
npm run db:seed
```
This creates the tables and the seeded `admin` / `admin123` login on the real production
database. Do this once per new environment.

### Step 7 — Redeploy
Trigger a redeploy from the Vercel dashboard (**Deployments → ⋯ → Redeploy**), or just push
a new commit. It should build successfully now that the database exists.

### Step 8 — Log in and lock it down
Visit your `*.vercel.app` URL, log in with `admin` / `admin123`, and change that password the
same way described in [Section 1, step 4](#steps) — but against the production database this
time.

---

## 4. Why cloud storage (the tradeoff)

Earlier in this project's life it ran fully local: a SQLite file on disk and uploaded logos
saved to a local folder. That's genuinely simpler and works without any internet connection
at all — a good fit if this only ever needed to run on one PC in the shop.

Vercel's servers don't work that way: each request can run in a fresh, disposable container
with no persistent disk, so a local SQLite file or locally-saved upload would not survive
between requests — writes would silently vanish. Deploying to Vercel requires a database and
file storage that live outside the app's own server, which is what Postgres + Vercel Blob
provide. The real cost: local development now needs internet access to reach that cloud
database, which the original local-only design didn't.

---

## 5. Project structure (brief orientation)

```
app/(app)/            protected pages (customers, vehicles, work orders, inventory,
                       laborers, quotations, settings, dashboard) — everything behind login
app/login/            login page
app/api/               PDF generation routes + auth routes
lib/actions/           Server Actions (create/update/delete) per entity
lib/pdf/                react-pdf document templates + the data-shaping "model" builders
lib/db.ts               Prisma client singleton
lib/session.ts          iron-session config + auth helpers
prisma/schema.prisma    database schema
components/ui/          shared button/input/badge styles
public/fonts/           self-hosted fonts (Oswald, IBM Plex) — bundled, no runtime fetch
```

Login roles: `ADMIN`, `FRONT_DESK`, `TECHNICIAN` — a few destructive actions (deleting
customers, deactivating a laborer, editing shop settings) are Admin-only.
# Garage-Management-Syste
