# WeatherNews App

Real-time weather forecasts + local news for any city, deployed free on Vercel.

**Stack:** React + Vite + Tailwind CSS · Vercel Serverless Functions · Supabase · Leaflet.js

---

## Features

- **Auth** — Supabase email/password. Auto-detects home city via IP on login.
- **Home Dashboard** — Current weather + 5-day forecast (Open-Meteo, free/no key) + local news (NewsAPI).
- **Interactive Map** — Click anywhere → weather popup + top 3 news. Search via Nominatim OSM geocoding (free/no key).
- **Saved Places** — Save/remove locations stored in Supabase, shown in sidebar with live weather.
- **Dark UI** — Responsive, weather emoji icons, smooth loading states.

---

## Free APIs used

| API | Key needed? | Used for |
|-----|-------------|----------|
| [Open-Meteo](https://open-meteo.com) | No | Weather + forecast |
| [NewsAPI](https://newsapi.org) | Yes (free tier) | Local news (server-side) |
| [Nominatim OSM](https://nominatim.org) | No | Geocoding / search |
| [ip-api.com](https://ip-api.com) | No | Auto-detect home city |
| [Supabase](https://supabase.com) | Project keys | Auth + saved places DB |

---

## 1 · Supabase Setup

1. Go to [supabase.com](https://supabase.com) → **New project**
2. In **SQL Editor**, run:

```sql
CREATE TABLE saved_places (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  city_name   TEXT NOT NULL,
  lat         NUMERIC NOT NULL,
  lon         NUMERIC NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own places"
  ON saved_places FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

3. Go to **Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

---

## 2 · NewsAPI Key

1. Register at [newsapi.org/register](https://newsapi.org/register) (free developer plan)
2. Copy your API key → `NEWS_API_KEY`

---

## 3 · Local Development

### Prerequisites

- Node.js 18+
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`

### Steps

```bash
# 1. Clone & install
git clone <your-repo>
cd weather-news-app
npm install

# 2. Fill in environment variables
cp .env.local .env.local   # already exists — just edit it
# Add your keys to .env.local

# 3. Start dev server (Vite frontend + Vercel functions)
vercel dev
# Frontend → http://localhost:3000
# API routes → http://localhost:3000/api/*
```

> **Note:** `vercel dev` runs both the Vite frontend and the `/api` serverless functions together on port 3000. The Vite proxy in `vite.config.js` is only needed if you run `npm run dev` separately.

---

## 4 · Deploy to Vercel

```bash
# Connect repo to Vercel (one-time)
vercel

# Add environment variables in Vercel dashboard:
#   Project → Settings → Environment Variables
#   Add: NEWS_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

# Deploy
vercel --prod
```

Or connect your GitHub repo in the [Vercel dashboard](https://vercel.com/new) for automatic deploys on push.

---

## Project Structure

```
/
├── api/                   Vercel Serverless Functions (Node.js)
│   ├── weather.js         GET /api/weather?lat=&lon=
│   ├── news.js            GET /api/news?city=
│   ├── geocode.js         GET /api/geocode?q=
│   └── places.js          GET|POST|DELETE /api/places
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── WeatherCard.jsx
│   │   ├── ForecastCard.jsx
│   │   ├── NewsCard.jsx
│   │   ├── SavedPlaces.jsx
│   │   ├── SearchBar.jsx
│   │   └── LoadingSpinner.jsx
│   ├── lib/
│   │   ├── supabase.js    Supabase client + helpers
│   │   ├── api.js         Frontend API call helpers
│   │   └── weatherIcons.js WMO code → emoji/label mapping
│   ├── pages/
│   │   ├── Auth.jsx       Login / Register
│   │   ├── Home.jsx       Dashboard with weather + news
│   │   └── Map.jsx        Interactive Leaflet map
│   ├── App.jsx            Router + auth gate
│   ├── main.jsx
│   └── index.css
├── index.html
├── vercel.json
├── vite.config.js
├── tailwind.config.js
└── .env.local             Environment variables (never commit)
```

---

## Environment Variables Reference

| Variable | Where to get it | Used in |
|----------|-----------------|---------|
| `NEWS_API_KEY` | [newsapi.org](https://newsapi.org) | `api/news.js` (server-only) |
| `VITE_SUPABASE_URL` | Supabase project settings | Frontend + `api/places.js` |
| `VITE_SUPABASE_ANON_KEY` | Supabase project settings | Frontend + `api/places.js` |

> `VITE_` prefix exposes variables to the Vite frontend bundle. `NEWS_API_KEY` has no prefix so it stays server-side only.
