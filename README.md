# Expense Tracker PWA

A mobile-first personal expense tracker with dashboard analytics. Built with Next.js, Supabase, and Recharts.

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Settings > API** and copy your:
   - Project URL
   - `anon` public key

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Import existing data

Place your `Monthly Budget.csv` in the project root (or parent directory), then:

```bash
npx tsx scripts/import-csv.ts "../Monthly Budget.csv"
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy

### 6. Install as PWA

On your phone, open the deployed URL in Safari (iOS) or Chrome (Android):
- **iOS**: Tap Share → "Add to Home Screen"
- **Android**: Tap the menu → "Install app" or "Add to Home Screen"

## Features

- **Quick logging**: Amount → Category → Subcategory → Save (3-5 taps)
- **Dashboard**: Monthly KPIs with MTD vs last month MTD comparison
- **Charts**: Cumulative spend line, category bars, historical stacked bars
- **Category table**: Detailed breakdown with variation vs last month
- **Transaction list**: Browse, filter, and delete entries
- **Dark theme**: Matches your existing Looker aesthetic
- **Mobile-first**: Designed for phone screens, installable as PWA

## Tech Stack

- **Next.js 16** (App Router)
- **Supabase** (Postgres + REST API)
- **Tailwind CSS v4**
- **Recharts** (charts)
- **date-fns** (date utilities)
- **Lucide React** (icons)
