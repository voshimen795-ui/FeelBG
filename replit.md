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
- `language-selector.js` — Multi-language support (8 languages)
- `booking.js` — Booking/reservation system
- `mobile-interactions.js` — Mobile touch interactions
- `slike/` — Image assets directory (not included in repo, 404s are expected)

## Running the Project
- **Development**: `npm start` — starts live-server on port 5000 (0.0.0.0)
- **Workflow**: "Start application" workflow runs `npm start`

## Deployment
- **Type**: Static site deployment
- **Public Dir**: `.` (root of project)
- No build step needed
