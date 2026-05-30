<div align="center">

<img src="public/logo.png" alt="WeatherNews Tunisia" width="110" style="border-radius:24px" />

# WeatherNews Tunisia

**Real-time weather forecasts and local Tunisian news — beautifully designed for any device**

[**🌐 Live Demo →**](https://weather-news-app-gray.vercel.app)&nbsp;&nbsp;·&nbsp;&nbsp;[Report Bug](https://github.com/ademhmercha/Weather-News_App/issues)&nbsp;&nbsp;·&nbsp;&nbsp;[Request Feature](https://github.com/ademhmercha/Weather-News_App/issues)

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?logo=vercel&logoColor=white)](https://weather-news-app-gray.vercel.app)
[![React 18](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![No API Key](https://img.shields.io/badge/News-No%20API%20Key-10b981)](https://github.com/ademhmercha/Weather-News_App)

</div>

---

## 📸 Screenshots

### Mobile

| Splash Screen | Home — Weather | Home — News | Map |
|:---:|:---:|:---:|:---:|
| ![Splash](screenshots/mobile-splash.png) | ![Home Weather](screenshots/mobile-home-weather.png) | ![Home News](screenshots/mobile-home-news.png) | ![Map](screenshots/mobile-map.png) |

### Desktop

| Home — Weather Tab | Home — News Tab |
|:---:|:---:|
| ![Desktop Home](screenshots/desktop-home.png) | ![Desktop News](screenshots/desktop-news.png) |

| Map — Location Panel |
|:---:|
| ![Desktop Map](screenshots/desktop-map.png) |

> **Add your own screenshots:** take a screenshot of each page and save it in the `screenshots/` folder at the root of the project, then push with `git add screenshots/ && git commit -m "add screenshots" && git push`.

---

## ✨ Features

### 🌦 Weather
- **Real-time conditions** — temperature, wind, humidity, feels like, UV index, visibility
- **24-hour hourly forecast** — scrollable strip with icons, temperature and rain probability per hour
- **7-day daily forecast** — weather icon, high/low temperature, precipitation
- **AQI (Air Quality Index)** — color-coded badge (Good → Hazardous) via Open-Meteo Air Quality API
- **Comfort Score** — 0–100 circular score calculated from temperature, humidity, UV, wind and rain
- **Smart AI summary** — auto-generated text: *"Very high UV — apply sunscreen, feels 2° cooler than actual."*
- **Animated sky backgrounds** — CSS-animated weather scenes per condition:
  - ☀️ Sunny day: pulsing sun glow + drifting clouds
  - 🌙 Night: 90 twinkling stars + aurora glow
  - 🌧 Rain: 40–60 animated drops at varied speeds
  - ⛈ Thunderstorm: heavy rain + random lightning flash every 12–30 seconds
  - ❄️ Snow: floating particle snowflakes
- **City photo** — Wikipedia city image as ambient background (automatically strips venue names like airports, hospitals)

### 📰 News
- **8 Tunisian RSS sources** — Mosaique FM, Tunisie Numérique, Kapitalis, Business News TN, Webdo, HuffPost Maghreb, Shems FM, TAP
- **No API key required** — pure RSS, free forever
- **Smart filtering** — shows city-specific articles first, falls back to national Tunisia news
- **Up to 40 articles** per fetch, sorted newest first, deduplicated
- **Google Discover-style cards** — large banner for the top article, compact rows for the rest with relative time (*2h ago*)

### 🗺 Map
- **Leaflet.js interactive map** — click anywhere to get weather + news for that location
- **Starts at your real location** — GPS or IP-based detection, flies to your city on load
- **Pulsing green "You are here" pin** — distinguishes your position from clicked pins
- **Bottom sheet on mobile** — panel slides up from the bottom; right panel on desktop
- **Real-time reverse geocoding** — Nominatim OSM for clicked coordinates

### 📍 Location
- **Browser GPS first** — requests permission, 12-second timeout with 2-minute cache
- **Server-side IP fallback** — bypasses ad blockers via `/api/detect-city` → ip-api.com
- **Tunisia-only geocoding** — search bar filtered to `country_code=TN`
- **Saved places** — stored in `localStorage`, no account needed, live weather badge per saved city

### 🎨 Design
- **Windows Forecast-inspired** — full-screen atmospheric sky gradient as background
- **Colorful SVG weather icons** — custom-designed (sun with glow, partly-cloudy sun/cloud, rain drops, lightning bolt, snowflake crystals)
- **Splash screen** — animated logo + status text + bouncing dots on first load
- **Dark premium UI** — `slate-950` base, frosted glass components, subtle borders
- **Fully responsive** — left sidebar on desktop, bottom navigation bar on mobile
- **Touch optimized** — 300ms tap delay removed, overscroll disabled, safe-area insets on iPhone

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite 5 | UI framework + build tool |
| Styling | Tailwind CSS 3 | Utility-first CSS |
| Icons | Lucide React | UI icons |
| Map | Leaflet.js + React-Leaflet | Interactive map |
| Backend | Vercel Serverless Functions | Node.js API routes |
| Weather | [Open-Meteo](https://open-meteo.com) | Forecast + Air Quality (free, no key) |
| Geocoding | [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) | City search (free, no key) |
| Reverse Geocode | [Nominatim OSM](https://nominatim.org) | Coordinates → city name (free) |
| Location | Browser GPS + [ip-api.com](http://ip-api.com) | Auto-detect user city (free) |
| News | RSS Feeds | Tunisian news (no key needed) |
| City Images | [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) | City thumbnails (free) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/ademhmercha/Weather-News_App.git
cd Weather-News_App

# 2. Install dependencies
npm install

# 3. Start the dev server (Vite frontend + Vercel functions together)
vercel dev
```

Open [http://localhost:3000](http://localhost:3000) — both the React app and the `/api/*` serverless functions run on the same port.

> **Note:** `npm run dev` (Vite only) also works for frontend development. The Vite proxy config forwards `/api/*` requests to port 3000 when running alongside `vercel dev`.

### Environment Variables

No environment variables are **required** to run the app — all APIs are free and keyless. The only optional variable is for self-hosting:

| Variable | Required | Description | Where to get |
|----------|----------|-------------|--------------|
| *(none required)* | — | All APIs are free & keyless | — |

> Previously the app used **NewsAPI** (required `NEWS_API_KEY`). This has been replaced with free Tunisian RSS feeds — no API key needed.

---

## ☁️ Deploy to Vercel

```bash
# Connect to Vercel (one-time)
vercel

# Deploy to production
vercel --prod
```

Or connect the GitHub repository directly in the [Vercel Dashboard](https://vercel.com/new) for automatic deploys on every push.

No environment variables need to be set in the Vercel dashboard.

---

## 📁 Project Structure

```
Weather-News_App/
│
├── api/                        ← Vercel Serverless Functions (Node.js)
│   ├── weather.js              GET /api/weather?lat=&lon=
│   ├── aqi.js                  GET /api/aqi?lat=&lon=
│   ├── news.js                 GET /api/news?city=
│   ├── geocode.js              GET /api/geocode?q=   (Tunisia only)
│   └── detect-city.js          GET /api/detect-city  (server-side IP)
│
├── public/
│   └── logo.png                App icon (splash, sidebar, favicon)
│
├── screenshots/                README screenshots (add your own here)
│
├── src/
│   ├── components/
│   │   ├── BottomNav.jsx       Mobile bottom navigation bar
│   │   ├── ComfortScore.jsx    Circular comfort score card
│   │   ├── ForecastCard.jsx    7-day horizontal forecast strip
│   │   ├── HourlyForecast.jsx  24-hour horizontal forecast strip
│   │   ├── LoadingSpinner.jsx  Reusable spinner
│   │   ├── MetricsGrid.jsx     Wind / Humidity / UV / AQI stats
│   │   ├── NewsCard.jsx        Google Discover-style news card
│   │   ├── SavedPlaces.jsx     Saved locations list (localStorage)
│   │   ├── SearchBar.jsx       Debounced city search
│   │   ├── Sidebar.jsx         Desktop left navigation
│   │   ├── SplashScreen.jsx    Animated loading splash
│   │   ├── WeatherBackground.jsx  Animated sky (sun/rain/stars/thunder)
│   │   ├── WeatherCard.jsx     Current weather hero card
│   │   └── WeatherIcon.jsx     Custom colorful SVG weather icons
│   │
│   ├── lib/
│   │   ├── api.js              All API helpers + localStorage places
│   │   └── weatherIcons.js     WMO code → label / sky gradient helpers
│   │
│   ├── pages/
│   │   ├── Home.jsx            Dashboard (weather + news tabs)
│   │   └── Map.jsx             Interactive Leaflet map
│   │
│   ├── App.jsx                 Router + sidebar/bottom-nav layout
│   ├── main.jsx                React entry point
│   └── index.css               Tailwind + global styles + Leaflet overrides
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── package.json
```

---

## 🗺 API Routes

All routes are Vercel Serverless Functions in `/api/*.js`.

### `GET /api/weather`
Fetches current weather + 5-day forecast + 24-hour hourly data.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `lat` | ✅ | Latitude |
| `lon` | ✅ | Longitude |

**Source:** [Open-Meteo Forecast API](https://open-meteo.com) · Free · No key

---

### `GET /api/aqi`
Fetches US Air Quality Index and PM2.5.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `lat` | ✅ | Latitude |
| `lon` | ✅ | Longitude |

**Source:** [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) · Free · No key

---

### `GET /api/news`
Returns Tunisian news articles from 8 RSS sources.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `city` | ✅ | City name for filtering |
| `country` | — | Country name for fallback |

**Sources:** Mosaique FM · Tunisie Numérique · Kapitalis · Business News TN · Webdo · HuffPost Maghreb · Shems FM · TAP

---

### `GET /api/geocode`
Searches for Tunisian cities by name.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `q` | ✅ | Search query |

**Source:** Open-Meteo Geocoding · Filtered to `country_code=TN`

---

### `GET /api/detect-city`
Server-side IP geolocation (bypasses ad blockers).

| Parameter | Required | Description |
|-----------|----------|-------------|
| *(none)* | — | Uses `x-forwarded-for` header |

**Source:** ip-api.com · Free · No key

---

## 🌍 RSS News Sources

| Source | Language | Type |
|--------|----------|------|
| [Mosaique FM](https://www.mosaiquefm.net) | French | Radio / General |
| [Tunisie Numérique](https://www.tunisienumerique.com) | French | Tech / General |
| [Kapitalis](https://www.kapitalis.com) | French | General |
| [Business News TN](https://www.businessnews.com.tn) | French | Economy |
| [Webdo](https://www.webdo.tn) | French | General |
| [HuffPost Maghreb](https://www.huffpostmaghreb.com) | French | General |
| [Shems FM](https://www.shemsfm.net) | French/Arabic | Radio |
| [TAP](https://www.tap.info.tn) | English | Official Agency |

---

## 📄 License

MIT © [ademhmercha](https://github.com/ademhmercha)

---

<div align="center">
  Made with ❤️ for Tunisia
  <br/>
  <a href="https://weather-news-app-gray.vercel.app">weather-news-app-gray.vercel.app</a>
</div>
