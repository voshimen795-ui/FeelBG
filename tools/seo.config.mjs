/**
 * Single source of truth for everything the SEO build needs to know.
 *
 * If a value in here is wrong, it is wrong on 100 pages at once — so this file
 * is deliberately small, declarative, and free of logic.
 */

/**
 * The production origin. Canonical URLs, hreflang, OpenGraph and the sitemap are
 * all built from this. Pointing it at a domain the site is not served from is
 * worse than having no canonical at all: it tells Google the real pages are
 * duplicates of somewhere else.
 */
export const SITE_ORIGIN = 'https://feelbg.com';

export const SITE_NAME = 'FeelBG';

/**
 * Shown when a venue has no photograph of its own. It is the FeelBG mark, not a
 * stock photo of some other place — a generic "Belgrade at sunset" image on a
 * page about a shopping centre in Voždovac is a small lie that social previews
 * would repeat everywhere. Because it is a logo rather than a 1200x630
 * photograph, pages that fall back to it use the small `summary` Twitter card.
 */
export const DEFAULT_OG_IMAGE = 'assets/images/logo/feelbg-high-resolution-logo.png';

/** Route shapes. Directory-index output, so the URL has no `.html` suffix. */
export const ROUTES = {
    en: { venue: (slug) => `/en/venue/${slug}/` },
    sr: { venue: (slug) => `/sr/mesto/${slug}/` },
};

/**
 * The four collections, and how each is addressed in both languages.
 *
 * `en.path` points at the existing top-level pages rather than an `/en/` mirror:
 * those URLs are live, may be linked and indexed already, and moving them would
 * cost redirects for no gain.
 */
export const CATEGORIES = {
    restaurants: {
        en: { path: '/restaurants.html', title: 'Restaurants', h1: 'Belgrade Restaurants' },
        sr: { path: '/sr/restorani/', title: 'Restorani', h1: 'Beogradski restorani' },
    },
    cafes: {
        en: { path: '/cafes.html', title: 'Cafes & Bars', h1: 'Belgrade Cafes & Bars' },
        sr: { path: '/sr/kafici/', title: 'Kafići i barovi', h1: 'Beogradski kafići i barovi' },
    },
    nightlife: {
        en: { path: '/nightlife.html', title: 'Nightlife', h1: 'Belgrade Nightlife' },
        sr: { path: '/sr/nocni-zivot/', title: 'Noćni život', h1: 'Beogradski noćni život' },
    },
    attractions: {
        en: { path: '/attractions.html', title: 'Attractions', h1: 'Belgrade Attractions' },
        sr: { path: '/sr/znamenitosti/', title: 'Znamenitosti', h1: 'Beogradske znamenitosti' },
    },
};

/**
 * schema.org type per venue.
 *
 * Keyed on the `cuisine` token, which the site uses as a filter value. That
 * token is doing double duty — it is a UI filter first and a type hint second —
 * so two venues need an explicit override where the filter lies about what the
 * place is. Those live in SCHEMA_OVERRIDES rather than as special cases here.
 *
 * `nature` cannot be resolved from the token alone: it covers parks, forests, a
 * botanical garden, a river beach and a riverside promenade. It is resolved from
 * the human label instead — see schemaTypeFor() in build-seo.mjs.
 */
export const SCHEMA_TYPES = {
    serbian: 'Restaurant',
    coffee: 'CafeOrCoffeeShop',
    cocktail: 'BarOrPub',
    wine: 'BarOrPub',
    electronic: 'NightClub',
    mainstream: 'NightClub',
    historic: ['TouristAttraction', 'LandmarksOrHistoricalBuildings'],
    cultural: ['TouristAttraction', 'LandmarksOrHistoricalBuildings'],
    museum: ['Museum', 'TouristAttraction'],
    religious: ['Church', 'PlaceOfWorship', 'TouristAttraction'],
    shopping: 'ShoppingCenter',
};

/** Venues the `cuisine` token types incorrectly. */
export const SCHEMA_OVERRIDES = {
    // A 1908 hotel patisserie famous for a cake. The `cocktail` token is a
    // filter artefact; BarOrPub would be plainly wrong.
    'Hotel Moskva': 'CafeOrCoffeeShop',
    // A wooded hill with a monument and a TV tower, not a municipal park.
    Avala: ['TouristAttraction', 'Mountain'],
};

/**
 * Only these types are LocalBusiness descendants, so only these may carry
 * priceRange / telephone / openingHours. A Park with a priceRange is invalid.
 */
export const LOCAL_BUSINESS_TYPES = new Set([
    'Restaurant', 'CafeOrCoffeeShop', 'BarOrPub', 'NightClub', 'ShoppingCenter',
]);

/**
 * Pages held back from the index until they have real copy.
 *
 * Six shopping centres, each with a nine-to-eleven word description and no
 * photograph, would publish as six near-identical "Shopping centre in {area},
 * Belgrade" pages. That specific pattern is what drags a small site's quality
 * signal down, so they ship as working pages carrying `noindex` and are
 * released — by deleting entries from this list — once they have content.
 */
export const NOINDEX = new Set([
    'Ušće Shopping Center',
    'Galerija Belgrade',
    'Rajićeva Shopping Center',
    'Delta City',
    'BEO Shopping Center',
    'Stadion Shopping Center',
]);

/** Length budgets. Enforced as hard build assertions, not warnings. */
export const LIMITS = {
    titleMax: 60,
    descriptionMin: 70,
    descriptionMax: 158,
};
