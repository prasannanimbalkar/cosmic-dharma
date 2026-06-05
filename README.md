# Cosmic Dharma

A Vedic astrology (Jyotish) web app for generating Janma Kundali birth charts.

## Features

- **Sidereal planetary positions** using Lahiri Ayanamsa
- **North Indian whole-sign chart** with Navagraha placements
- **South Indian whole-sign chart** with fixed rashi layout
- **27 Nakshatras** with Pada divisions
- **Vimshottari Dasha** timeline (120-year cycle)
- Birth place search (any city worldwide) via [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api), with DST-aware timezone via Luxon

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy on Vercel

1. Push this project to GitHub (or deploy from your machine with the [Vercel CLI](https://vercel.com/docs/cli)).
2. Import the repo at [vercel.com/new](https://vercel.com/new). Vercel auto-detects Vite (`npm run build` → `dist`).
3. Add **Environment Variables** (Production) if you use lead capture:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. Redeploy after changing env vars.

**CLI (from project folder):**

```bash
npm i -g vercel
vercel login
vercel --prod
```

When prompted for env vars, paste the same values as in `.env.local`.

## Stack

- React + TypeScript + Vite
- [astronomy-engine](https://github.com/cosinekitty/astronomy) for ephemeris calculations

## Saving user emails

The birth form stores only **email, name, and created_at** when the user generates a chart. Birth details and chart data are **not** sent to the server.

### Option A — Supabase (recommended)

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/leads.sql`.
3. Copy **Project URL** and **anon public** key from **Settings → API**.
4. Create `.env.local`:

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

5. Restart `npm run dev`. View leads in **Table Editor → leads**.

### Option B — Webhook (Formspree, Google Sheets, your API)

Set a URL that accepts `POST` JSON:

```bash
VITE_LEADS_WEBHOOK_URL=https://formspree.io/f/YOUR_ID
```

Body shape: `{ email, name, created_at }`.

### Privacy

Add a privacy notice on your site if you collect emails (GDPR/consent). The form includes a consent checkbox when storage is configured.

Copy `.env.example` to `.env.local` for all variables.

## Note

This app is for educational and exploratory purposes. For professional readings, consult a qualified Jyotishi.
