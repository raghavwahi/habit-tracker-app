# Habit Tracker (Vercel + Supabase)

Mobile-first habit tracker built with Next.js App Router, Tailwind, and Supabase (free Postgres + Auth).

## Features

- Email/password login + registration (Supabase Auth)
- Daily tracker page:
	- Shows selected date
	- Habits checklist (each habit weighted as 1 point)
	- Score, completion %, and Pass/Fail based on your Pass % target
	- Navigate to previous/next dates or pick any date
- Charts page:
	- “Days with any progress” this week and this month
	- Line chart for score by day/week/month
- Habits page:
	- Add custom habits
	- Add from a built-in template list
	- Configure Pass % target

## Tech

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + RLS + Auth)
- Recharts (charts)

## Prerequisites

- Node.js (LTS recommended)
- A Supabase project (free tier is fine)

## Supabase Setup

1. Create a Supabase project.
2. In Supabase, go to SQL Editor and run:
	 - `supabase/schema.sql`
3. In Supabase Auth settings:
	 - Enable Email auth
	 - Decide whether you want email confirmations (if enabled, users must confirm before signing in)

The schema enables Row Level Security (RLS) so each user can only access their own rows.

## Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

You can copy `.env.example`.

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Vercel Deployment

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Add the same env vars in Vercel:
	 - `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy.

## Usage

- Go to `/register` to create an account.
- Add habits in `/app/habits` (use template or add your own).
- Track daily completion in `/app`.
- View weekly/monthly progress and your score trend in `/app/charts`.

## Possible Enhancements

- Timezone-aware “today” (store a user timezone setting)
- Streaks (pass-day streak and best streak)
- Habit weights (some habits count more)
- Notes per day (why a day failed)
- Push notifications / reminders (PWA)
- Data export (CSV)
