# FeelBG - Belgrade Tourism & Discovery Platform

## Overview
FeelBG is a modern Belgrade tourism and restaurant discovery website targeting international tourists. It helps users discover restaurants, cafes, nightlife, and attractions in Belgrade, Serbia. The site features a luxurious "Royal Blue and Bronze Gold" theme optimized for mobile users.

## Tech Stack
- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Dev Server**: live-server (npm package)
- **Libraries**: AOS (Animate On Scroll), Font Awesome 6, Google Fonts, Leaflet.js (maps)
- **No build step required** — files are served directly

## Project Structure
```
├── index.html              — Main landing page
├── restaurants.html         — Restaurant listings (15 venues, dynamic rendering)
├── cafes.html              — Cafe & bar listings (10 venues, dynamic rendering)
├── nightlife.html          — Nightlife listings (10 venues, dynamic rendering)
├── attractions.html        — Attraction listings (10 venues, dynamic rendering)
├── css/
│   ├── styles.css          — Main stylesheet (Royal Blue #1e3a8a & Bronze Gold #b8860b)
│   ├── pages.css           — Listing page styles (includes .page-hero__video CSS for video heroes)
│   ├── mobile-optimized.css — Mobile responsive styles
│   ├── mobile-nav-fixed.css — Mobile bottom nav styles
│   ├── header-layout.css   — Header component styles
│   ├── hero-fullscreen.css — Hero section styles
│   ├── dropdown-menu.css   — Dropdown menu styles
│   └── remove-blank-space.css — Layout fix styles
├── js/
│   ├── venues.js           — Centralized venue database (window.FEELBG_VENUES)
│   ├── card-renderer.js    — Dynamic card rendering (CardRenderer class)
│   ├── script.js           — Core site functionality (Preloader, CustomCursor, Header)
│   ├── pages.js            — Filter/search + PlaceDetails popup
│   ├── translations.js     — i18n translations (10 languages, window.FEELBG_TRANSLATIONS)
│   ├── language-selector.js — Language selector UI
│   ├── map.js              — Interactive Leaflet.js map modal (uses venues.js data)
│   ├── booking.js          — WhatsApp chatbot booking system
│   └── mobile-interactions.js — Mobile touch interactions
├── assets/images/
│   ├── logo/               — Logo variants (headerlogo.png, high-res, grayscale, transparent)
│   ├── kalemegdan-fortress.jpg
│   ├── ada-ciganlija.jpg
│   ├── topcider-park.jpg
│   ├── belgrade-by-night-*.jpg
│   └── feelbgslicica.png
└── slike/                  — Legacy image directory (kept for reference)
```

## Architecture

### Centralized Venue Database (js/venues.js)
All venue data lives in `window.FEELBG_VENUES` with 4 categories:
- `restaurants` (15 venues) — Serbian, Italian, Japanese, Mediterranean, Fine Dining, Seafood
- `cafes` (10 venues) — Coffee, Cocktails, Wine, Craft Beer
- `nightlife` (10 venues) — Electronic, Pop/Dance, Jazz, Alternative, Comedy
- `attractions` (10 venues) — Historic, Museums, Nature, Cultural, Religious

Each venue has: name, cuisine, cuisineLabel, price, priceLabel, area, address, rating, badge, description, lat, lng, image (Unsplash URLs or local paths).

### Dynamic Card Rendering (js/card-renderer.js)
`CardRenderer` class generates venue cards from the centralized database:
- `CardRenderer.renderByType('restaurants', 'restaurants-grid')` — renders one category
- `CardRenderer.renderAll('container-id')` — renders all categories
- Each HTML page calls the appropriate renderer on DOMContentLoaded

### Map Integration (js/map.js)
`BelgradeMap` class reads from `window.FEELBG_VENUES` via `buildVenuesFromDB()`:
- Converts venue data to map markers with type-specific icons and colors
- Colors: restaurants=#b8860b, cafes=#1e3a8a, nightlife=#7c3aed, attractions=#dc2626
- Features: OSRM walking routes, "Create my Adventure" geolocation routing, category filters

## Key Features
- **10-Language i18n**: EN, US, SR, TR, DE, FR, IT, RU, EL, HE — all UI content translated
- **WhatsApp Booking**: Chatbot at +381653315640 (3-step: guests → time → requests)
- **Interactive Map**: 45 venues, color-coded pins, walking route generation
- **Adventure Route**: Geolocation-based "Create my Adventure" finds 3 closest venues
- **Detail Popup**: Photo, rating, hours, budget, Reserve button, "See Route on Map"
- **Responsive Design**: Mobile bottom nav, touch interactions, FAB menu

## Running the Project
- **Development**: `npm start` — starts live-server on port 5000 (0.0.0.0)
- **Workflow**: "Start application" workflow runs `npm start`

## Deployment
- **Type**: Static site deployment
- **Public Dir**: `.` (root of project)
- No build step needed

## Script Load Order (critical)
1. translations.js → language-selector.js (i18n must load first)
2. booking.js (WhatsApp chatbot)
3. script.js (core functionality)
4. venues.js → card-renderer.js → pages.js (venue data → renderer → filters)
5. Leaflet.js → map.js (map library → map component)
