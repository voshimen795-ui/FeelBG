# FeelBG - Belgrade Tourism & Discovery Platform

## Overview
FeelBG is a modern Belgrade tourism and restaurant discovery website targeting international tourists. It helps users discover restaurants, cafes, nightlife, and attractions in Belgrade, Serbia. The site features a luxurious "Royal Blue and Bronze Gold" theme optimized for mobile users.

## Tech Stack
- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Dev Server**: live-server (npm package)
- **Libraries**: AOS (Animate On Scroll), Font Awesome 6, Google Fonts
- **No build step required** — files are served directly

## Project Structure
- `index.html` — Main landing page
- `restaurants.html`, `cafes.html`, `nightlife.html`, `attractions.html` — Category listing pages
- `styles.css` — Main stylesheet (Royal Blue & Bronze Gold theme)
- `pages.css` — Listing page styles
- `mobile-optimized.css`, `mobile-nav-fixed.css` — Mobile responsive styles
- `header-layout.css`, `hero-fullscreen.css`, `dropdown-menu.css` — Component styles
- `script.js` — Core site functionality (Preloader, CustomCursor, Header, etc.)
- `pages.js` — Filter and search logic for listing pages
- `translations.js` — Comprehensive i18n translations for all 10 languages (EN, US, SR, TR, DE, FR, IT, RU, EL, HE). Loaded before language-selector.js as `window.FEELBG_TRANSLATIONS`.
- `language-selector.js` — Language selector UI (modal on first visit, header dropdown for switching). Uses translations from `translations.js` with English fallback for any missing keys.
- `map.js` — Interactive Leaflet.js/OpenStreetMap map modal with 38 Belgrade venues, color-coded pins, category filters, sidebar venue list, and call button popups.
- `booking.js` — Booking/reservation system
- `mobile-interactions.js` — Mobile touch interactions
- `slike/` — Image assets directory (topcider-park.jpg, ada-ciganlija.jpg, kalemegdan-fortress.jpg — real Belgrade photos)

## Key Sections (Home Page)
- **Hero**: Belgrade slideshow with Ken Burns effect and animated particles
- **Categories**: Cards linking to Restaurants, Cafes, Nightlife, Attractions
- **Hidden Gems**: 6 secret spots (Topčider, Gardoš, Košutnjak, Ada Ciganlija, Rose Garden, Avala Mountain) with Unsplash imagery
- **Live Events**: CSS-only radio-button carousel with 5 curated events (dynamic dates), navigation dots and tab bar
- **Contact + Footer**: Contact form and footer

## Running the Project
- **Development**: `npm start` — starts live-server on port 5000 (0.0.0.0)
- **Workflow**: "Start application" workflow runs `npm start`

## i18n System
- **10 languages**: English (UK), English (US), Serbian, Turkish, German, French, Italian, Russian, Greek, Hebrew
- **Architecture**: `translations.js` defines `window.FEELBG_TRANSLATIONS` → `language-selector.js` reads from it. `translatePage()` iterates `[data-i18n]` elements, always falling back to English for missing keys.
- **Coverage**: All UI chrome (nav, hero, filters, sort, badges, statuses, buttons, footers, mobile nav) has `data-i18n` attributes. Venue names and addresses are proper nouns and remain untranslated. Venue descriptions remain in English.
- **Phone**: +381 65 331 5640 used everywhere (contact sections, footers, booking placeholders, map popups).

## Bug Fixes Applied
- Fixed `Preloader.hide()` crash (null check added) — was crashing on sub-pages that don't have `#preloader`
- Converted all files from CRLF to LF line endings
- Fixed nightlife.html and attractions.html hero sections that incorrectly showed "Belgrade Restaurants" content instead of their own page-specific content
- Fixed all sub-page breadcrumbs, stats, and descriptions to match their page type

## Deployment
- **Type**: Static site deployment
- **Public Dir**: `.` (root of project)
- No build step needed
