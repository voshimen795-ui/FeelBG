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
│   ├── remove-blank-space.css — Layout fix styles
│   └── insider-tips.css    — Floating insider tips widget styles
├── js/
│   ├── venues.js           — Centralized venue database (window.FEELBG_VENUES)
│   ├── card-renderer.js    — Dynamic card rendering with i18n (venueSlug + getTranslated)
│   ├── script.js           — Core site functionality (Preloader, CustomCursor, Header)
│   ├── pages.js            — Filter/search + PlaceDetails popup
│   ├── translations.js     — i18n UI string translations (10 languages, window.FEELBG_TRANSLATIONS)
│   ├── venue-translations.js — Venue content translations (45 venues × 9 langs, insider tips, filter labels)
│   ├── language-selector.js — Language selector UI + card re-render on switch
│   ├── map.js              — Interactive Leaflet.js map modal (uses venues.js data)
│   ├── booking.js          — WhatsApp chatbot booking system
│   ├── mobile-interactions.js — Mobile touch interactions
│   └── insider-tips.js     — Floating insider tips widget (12 tips, i18n via translation keys)
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
- `cafes` (11 venues) — Hotel Moskva Café, Coffee, Cocktails, Wine, Craft Beer
- `nightlife` (10 venues) — Electronic, Pop/Dance, Jazz, Alternative, Comedy
- `attractions` (10 venues) — Historic, Museums, Nature, Cultural, Religious

Each venue has: name, cuisine, cuisineLabel, price, priceLabel (€ ranges), area, address, rating, badge, description, lat, lng, image. Attractions have NO price/priceLabel fields (free hidden gems).

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
- **10-Language i18n**: EN, US, SR, TR, DE, FR, IT, RU, EL, HE — all UI + venue content translated
- **WhatsApp Booking**: Chatbot at +381653315640 (3-step: guests → time → requests)
- **Interactive Map**: 46 venues, color-coded pins, walking route generation
- **Adventure Route**: Geolocation-based "Create my Adventure" finds 3 closest venues
- **Detail Popup**: Photo, rating, hours, budget, Reserve button, "See Route on Map"
- **Responsive Design**: Mobile bottom nav, touch interactions
- **Euro Pricing**: All restaurants, cafes, and nightlife show precise € price ranges
- **Attractions = Free Hidden Gems**: No prices, no reserve buttons on attraction cards
- **Insider Tips Widget**: Floating lightbulb button with 12 rotating local tips for tourists
- **Video Hero Sections**: Each category page has a fullscreen looping background video
- **Light Mode Only**: Dark mode removed for consistent brand experience

## Running the Project
- **Development**: `npm start` — starts live-server on port 5000 (0.0.0.0)
- **Workflow**: "Start application" workflow runs `npm start`

## Deployment
- **Type**: Static site deployment
- **Public Dir**: `.` (root of project)
- No build step needed

## Script Load Order (critical)
1. translations.js → venue-translations.js → language-selector.js (i18n must load first, venue translations merge into FEELBG_TRANSLATIONS before page translates)
2. booking.js (WhatsApp chatbot)
3. script.js (core functionality)
4. venues.js → card-renderer.js → pages.js (venue data → renderer → filters)
5. insider-tips.js (listens for feelbg:languageChanged event)
6. Leaflet.js → map.js (map library → map component)

## i18n Architecture
- **UI strings**: translations.js defines all UI keys per language (nav, hero, filters, badges, popups, chatbot, map, adventure)
- **Venue content**: venue-translations.js adds venue.{slug}.desc and venue.{slug}.cuisine keys per language, plus insider.tip1–12, filter category labels
- **Slug generation**: `name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')`
- **Language switch flow**: selectLanguage() → translatePage() → reRenderCards() → dispatch feelbg:languageChanged
- **Card rendering**: CardRenderer.getTranslated(venue, 'desc'|'cuisine') looks up venue.{slug}.{field} via t(), falls back to English venue data
- **Event-driven**: insider-tips.js and other widgets listen to feelbg:languageChanged for live refresh
