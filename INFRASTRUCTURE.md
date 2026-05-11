# Infrastructure Reference

## Accounts & Access

| Service | URL | Login |
|---|---|---|
| Vercel (hosting) | https://vercel.com/dashboard | GitHub (bucanero2010) |
| Supabase (database) | https://supabase.com/dashboard | GitHub (bucanero2010) |
| GitHub (code) | https://github.com/bucanero2010/expense-tracker | bucanero2010 |

## Live App

- **URL**: https://expense-tracker-one-indol-62.vercel.app/
- **Supabase project**: https://supabase.com/dashboard/project/ctsaxrdmfxeanipukiuq

## How It Works

- Push to `main` on GitHub → Vercel auto-deploys
- App reads/writes directly to Supabase Postgres via the anon key
- No auth — the app is open to anyone with the URL (security through obscurity)

## Environment Variables (set in Vercel)

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase publishable/anon key

## If Something Breaks

1. **App won't load**: Check Vercel deployment logs at vercel.com
2. **Data issues**: Check Supabase Table Editor at the dashboard link above
3. **Need to redeploy**: Push any commit to `main`, or trigger manually in Vercel dashboard
