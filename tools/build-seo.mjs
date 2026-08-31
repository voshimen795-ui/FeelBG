#!/usr/bin/env node
/**
 * Generate the crawlable half of FeelBG.
 *
 * The site renders every venue client-side: all four category pages ship an
 * empty `<div id="restaurants-grid">` and js/card-renderer.js fills it after
 * load. A crawler that does not run JavaScript sees four empty pages and no
 * venue content at all — so none of the 48 venues can rank for anything.
 *
 * This writes a real, static, server-rendered page per venue in both languages,
 * plus the four Serbian category pages the Serbian pages need to breadcrumb up
 * into, plus a sitemap.
 *
 *   node tools/build-seo.mjs             # write the pages
 *   node tools/build-seo.mjs --check     # verify committed output is current
 *   node tools/build-seo.mjs --only=avala,kalemegdan-fortress
 *
 * Output is committed to the repo rather than built on deploy: vercel.json runs
 * no build step, and keeping it that way means a broken generator can never
 * take the live site down with it.
 *
 * Requires Node 18+. No dependencies.
 */

import { createRequire } from 'node:module';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import {
    SITE_ORIGIN, SITE_NAME, DEFAULT_OG_IMAGE, ROUTES, CATEGORIES,
    SCHEMA_TYPES, SCHEMA_OVERRIDES, LOCAL_BUSINESS_TYPES, NOINDEX, LIMITS,
} from './seo.config.mjs';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VENUES = require(path.join(ROOT, 'js', 'venues.js'));

const argv = process.argv.slice(2);
const CHECK = argv.includes('--check');
const ONLY = (argv.find((a) => a.startsWith('--only=')) || '').slice(7)
    .split(',').map((s) => s.trim()).filter(Boolean);

/* ------------------------------------------------------------------ *
 * Translations
 *
 * The four translation files are browser IIFEs that mutate
 * window.FEELBG_TRANSLATIONS. Running them in a vm context rather than against
 * the real global keeps the build from leaking state between steps.
 * ------------------------------------------------------------------ */

function loadTranslations() {
    const sandbox = { window: {}, console };
    vm.createContext(sandbox);
    for (const f of ['translations.js', 'venue-translations.js', 'attraction-translations.js',
        'venue-labels.js', 'menu-translations.js']) {
        vm.runInContext(readFileSync(path.join(ROOT, 'js', f), 'utf8'), sandbox, { filename: f });
    }
    return sandbox.window.FEELBG_TRANSLATIONS;
}
const T = loadTranslations();

/**
 * The browser's own card renderer, loaded into Node.
 *
 * The category grids are pre-rendered with the exact file the browser runs, not
 * a second implementation of it. Two copies of this markup would drift, and the
 * moment they differ every visitor sees the grid flash as the client render
 * replaces server output that no longer matches.
 *
 * js/card-renderer.js reads window.FEELBG_TRANSLATIONS and falls back safely
 * when there is no window at all, so the only setup it needs is the globals.
 */
globalThis.window = globalThis.window || { FEELBG_TRANSLATIONS: T };
const CardRenderer = require(path.join(ROOT, 'js', 'card-renderer.js'));

/**
 * The underscore slug that keys the translation files.
 *
 * Deliberately identical to CardRenderer.venueSlug() in js/card-renderer.js —
 * that function is the source of truth and the keys already written into
 * venue-translations.js and attraction-translations.js depend on its exact
 * behaviour, diacritic mangling included (Ušće Park -> u_e_park). It is NOT the
 * URL slug; see tools/seo-slug.mjs for that.
 */
function tKey(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function t(lang, key, fallback = '') {
    const l = T[lang] || {};
    const en = T.en || {};
    return l[key] ?? en[key] ?? fallback;
}

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/**
 * Percent-encode a repo-relative asset path, per segment.
 *
 * Four venue images have spaces in their filenames ("slike/Zlatni Bokal.jpg").
 * Browsers tolerate that inside CSS url(), which is why it has never broken, but
 * a raw space makes an absolute og:image URL invalid and social scrapers reject
 * it. Encoding per segment keeps the slashes as slashes.
 */
const encodePath = (p) => String(p).split('/').map(encodeURIComponent).join('/');

const absUrl = (p) => SITE_ORIGIN + (p.startsWith('/') ? p : '/' + encodePath(p));

/** Trim to a length without cutting a word in half. */
function clip(text, max) {
    const s = String(text).trim();
    if (s.length <= max) return s;
    const cut = s.slice(0, max);
    const at = cut.lastIndexOf(' ');
    return (at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:—–-]+$/, '');
}

const stripPeriod = (s) => String(s).trim().replace(/\.+$/, '');

/* ------------------------------------------------------------------ *
 * Venue identity
 * ------------------------------------------------------------------ */

const ALL = Object.entries(VENUES).flatMap(([type, list]) =>
    list.map((v) => ({ ...v, type })));

const nameFor = (v, lang) => (lang === 'sr' && v.nameSr) ? v.nameSr : v.name;
const slugFor = (v, lang) => (lang === 'sr' && v.slugSr) ? v.slugSr : v.slug;
const pathFor = (v, lang) => ROUTES[lang].venue(slugFor(v, lang));

/** Human category label, translated. Falls back to the English in venues.js. */
function labelFor(v, lang) {
    const perVenue = t(lang, `venue.${tKey(v.name)}.cuisine`, '');
    if (perVenue) return perVenue;
    const shared = t(lang, `label.${tKey(v.cuisineLabel)}`, '');
    return shared || v.cuisineLabel;
}

function descFor(v, lang) {
    if (lang === 'sr') return t('sr', `venue.${tKey(v.name)}.desc`, v.description);
    return v.description;
}

/** Long-form editorial fields exist for 10 attractions, in every language. */
function proseFor(v, lang, field) {
    if (lang === 'sr') return t('sr', `venue.${tKey(v.name)}.${field}`, v[field] || '');
    return v[field] || '';
}

function pillsFor(v, lang) {
    const raw = lang === 'sr'
        ? t('sr', `venue.${tKey(v.name)}.pills`, '')
        : (v.pills || '');
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw) return raw.split('|').map((s) => s.trim()).filter(Boolean);
    return Array.isArray(v.pills) ? v.pills : [];
}

const areaFor = (v, lang) => (lang === 'sr' ? v.area : v.area); // area names are proper nouns

/* ------------------------------------------------------------------ *
 * Titles and descriptions
 *
 * Both must be unique across all 96 pages and inside the length budget. The
 * cascade takes the first candidate that fits rather than truncating, so a title
 * is never cut mid-word.
 *
 * "Belgrade"/"Beograd" earns its place more than a brand suffix would: a 48-page
 * long tail lives or dies on the city token, and "| FeelBG" costs nine of the
 * sixty characters. The brand goes in og:site_name instead.
 * ------------------------------------------------------------------ */

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * The category label, dropped when it merely repeats the name.
 *
 * "Ethnographic Museum — Ethnographic Museum" and the Serbian "Vojni muzej —
 * Vojni muzej" help nobody, and they waste the characters a title has to spend.
 */
function distinctLabel(v, lang) {
    const label = labelFor(v, lang);
    const n = norm(nameFor(v, lang)); const l = norm(label);
    return (l && (n.includes(l) || l.includes(n))) ? '' : label;
}

function titleFor(v, lang) {
    const name = nameFor(v, lang);
    const city = lang === 'sr' ? 'Beograd' : 'Belgrade';
    const inWord = lang === 'sr' ? 'u' : 'in';
    const area = areaFor(v, lang);
    const label = distinctLabel(v, lang);

    // "Galerija Beograd — Tržni centar, Beograd" says Belgrade twice.
    const hasCity = norm(name).includes(norm(city));
    const citySuffix = hasCity ? '' : `, ${city}`;

    const candidates = [
        label ? `${name} — ${label} ${inWord} ${area}${citySuffix}` : null,
        label ? `${name} — ${label}${citySuffix}` : null,
        `${name} — ${area}${citySuffix}`,
        `${name}${citySuffix}`,
        name,
    ].filter(Boolean);

    return candidates.find((c) => c.length <= LIMITS.titleMax) || clip(name, LIMITS.titleMax);
}

function metaDescFor(v, lang) {
    const city = lang === 'sr' ? 'Beograd' : 'Belgrade';
    const inWord = lang === 'sr' ? 'u' : 'in';
    const label = labelFor(v, lang);
    const area = areaFor(v, lang);

    let tail = `${label} ${inWord} ${area}, ${city}.`;
    const price = v.priceLabel ? ` ${priceText(v, lang)}.` : '';
    if (LIMITS.descriptionMax - tail.length - price.length - 1 >= 60) tail += price;

    const room = LIMITS.descriptionMax - tail.length - 1;
    const hook = proseFor(v, lang, 'hook');
    // A hook is sharper copy than the one-line description, but only if it fits
    // whole or breaks cleanly at a clause — never as a truncated fragment.
    let lead = descFor(v, lang);
    if (hook) {
        if (hook.length <= room) lead = hook;
        else {
            const at = Math.max(hook.lastIndexOf(' — ', room), hook.lastIndexOf(', ', room));
            if (at >= 80) lead = hook.slice(0, at);
        }
    }
    return `${clip(stripPeriod(lead), room)}. ${tail}`.trim();
}

/** "€15–25 per person" with the suffix translated, as shown on the cards. */
function priceText(v, lang) {
    if (!v.priceLabel) return '';
    return v.priceLabel
        .replace(/per person$/, t(lang, 'venue.price.perPerson', 'per person'))
        .replace(/entry$/, t(lang, 'venue.price.entry', 'entry'));
}

/* ------------------------------------------------------------------ *
 * Images
 * ------------------------------------------------------------------ */

/** Minimal JPEG dimension reader — enough to set width/height and avoid layout shift. */
function jpegSize(file) {
    try {
        const b = readFileSync(file);
        if (b[0] !== 0xff || b[1] !== 0xd8) return null;
        let i = 2;
        while (i < b.length) {
            if (b[i] !== 0xff) { i++; continue; }
            const marker = b[i + 1];
            if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
                return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
            }
            i += 2 + b.readUInt16BE(i + 2);
        }
    } catch { /* fall through */ }
    return null;
}

function imageFor(v) {
    if (!v.image) return null;
    const abs = path.join(ROOT, v.image);
    if (!existsSync(abs)) return null;
    return { rel: v.image, url: absUrl(v.image), ...(jpegSize(abs) || {}) };
}

/* ------------------------------------------------------------------ *
 * JSON-LD
 * ------------------------------------------------------------------ */

function schemaTypeFor(v) {
    if (SCHEMA_OVERRIDES[v.name]) return SCHEMA_OVERRIDES[v.name];
    if (v.cuisine === 'nature') {
        // The token covers parks, forests, a botanical garden, a river beach and
        // a promenade. The human label is the only thing that separates them.
        const l = v.cuisineLabel.toLowerCase();
        if (/park|forest|garden/.test(l)) {
            return /garden|reserve/.test(l) ? ['Park', 'TouristAttraction'] : 'Park';
        }
        if (/beach/.test(l)) return ['TouristAttraction', 'Beach'];
        return 'TouristAttraction';
    }
    return SCHEMA_TYPES[v.cuisine] || 'TouristAttraction';
}

function venueJsonLd(v, lang) {
    const type = schemaTypeFor(v);
    const types = Array.isArray(type) ? type : [type];
    const canonical = absUrl(pathFor(v, lang));
    const img = imageFor(v);

    const node = {
        '@context': 'https://schema.org',
        '@type': type,
        '@id': canonical + '#venue',
        name: nameFor(v, lang),
        description: descFor(v, lang),
        url: canonical,
        address: {
            '@type': 'PostalAddress',
            // The data has no city or postcode, and no sub-locality property
            // exists in schema.org — addressRegion means a province, not a
            // district, so "Stari Grad" must not go there. Inventing a postcode
            // would be worse: Zemun is 11080, Novi Beograd 11070.
            streetAddress: v.address,
            addressLocality: lang === 'sr' ? 'Beograd' : 'Belgrade',
            addressCountry: 'RS',
        },
        geo: { '@type': 'GeoCoordinates', latitude: v.lat, longitude: v.lng },
        hasMap: `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`,
    };

    if (img) node.image = img.url;

    // priceRange, telephone and openingHours are LocalBusiness properties. A Park
    // or a Church carrying them is invalid structured data.
    if (types.some((x) => LOCAL_BUSINESS_TYPES.has(x))) {
        // Normalise the en-dash for machine readability; the visible text keeps it.
        if (v.priceLabel) node.priceRange = v.priceLabel.replace(/\s*(per person|entry)$/, '').replace(/–/g, '-');
        if (v.phone) node.telephone = v.phone;
        if (v.website) node.sameAs = [`https://${v.website}`];
        if (v.cuisine === 'serbian') node.servesCuisine = 'Serbian';
    }

    // Deliberately absent:
    //
    // aggregateRating — every venue has a `rating`, but there is no review count
    //   and no reviews on the page. AggregateRating requires ratingCount or
    //   reviewCount, so Google would reject the item as invalid; and marking up
    //   an unsourced score as an aggregate of nothing is exactly the kind of
    //   unverifiable claim this dataset should stop making. The number stays
    //   visible to readers, labelled as an editorial score.
    //
    // openingHours — one venue has hours, as "14:00 – 02:00", with no day of the
    //   week. Emitting "Mo-Su" would assert seven-day opening nobody verified,
    //   and a wrong opening-hours rich result sends people to a closed door. The
    //   hours are shown as page text instead. Add a structured `hoursSpec` field
    //   to venues.js when real data exists and this can emit it verbatim.

    return node;
}

function breadcrumbJsonLd(v, lang) {
    const cat = CATEGORIES[v.type][lang];
    const home = lang === 'sr' ? '/sr/' : '/';
    const items = [
        { name: lang === 'sr' ? 'Početna' : 'Home', item: absUrl(lang === 'sr' ? '/' : '/') },
        { name: cat.title, item: absUrl(cat.path) },
        { name: nameFor(v, lang), item: absUrl(pathFor(v, lang)) },
    ];
    void home;
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({
            '@type': 'ListItem', position: i + 1, name: it.name, item: it.item,
        })),
    };
}

/* ------------------------------------------------------------------ *
 * Related venues
 *
 * A page nothing links to does not get crawled. nearbyOf() alone leaves 11
 * venues with no inbound and no outbound links at all — Ada Ciganlija, Avala,
 * Great War Island and the outlying forests and malls have no neighbour within
 * 900 m. So the ladder widens in labelled steps rather than quietly calling a
 * 3 km link "nearby".
 * ------------------------------------------------------------------ */

function metresBetween(a, b) {
    const R = 6371000, rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const x = Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
}

function relatedFor(v, lang) {
    const seen = new Set([v.name]);
    const take = (list, n) => {
        const out = [];
        for (const x of list) {
            if (seen.has(x.name) || out.length >= n) continue;
            seen.add(x.name); out.push(x);
        }
        return out;
    };

    const nearby = take(
        ALL.filter((x) => x.name !== v.name)
            .map((x) => ({ ...x, d: metresBetween(v, x) }))
            .filter((x) => x.d <= 900)
            .sort((a, b) => a.d - b.d), 5);

    const sameArea = take(ALL.filter((x) => x.area === v.area), 4);
    const sameKind = take(ALL.filter((x) => x.cuisine === v.cuisine), 4);

    const groups = [];
    if (nearby.length) {
        groups.push({
            title: lang === 'sr' ? 'U blizini' : 'Nearby',
            items: nearby.map((x) => ({ v: x, note: `${Math.round(x.d)} m` })),
        });
    }
    if (sameArea.length) {
        groups.push({
            title: lang === 'sr' ? `Još u kvartu ${v.area}` : `Elsewhere in ${v.area}`,
            items: sameArea.map((x) => ({ v: x, note: labelFor(x, lang) })),
        });
    }
    if (sameKind.length) {
        const label = labelFor(v, lang);
        groups.push({
            title: lang === 'sr' ? `Slična mesta` : `More like this`,
            items: sameKind.map((x) => ({ v: x, note: x.area })),
        });
        void label;
    }
    return groups;
}

/* ------------------------------------------------------------------ *
 * Page chrome — matches the existing pages, with root-absolute paths.
 *
 * Generated pages live two directories deep (/en/venue/<slug>/), and every path
 * on the site is relative ("css/tokens.css"), so they must be rewritten to
 * root-absolute or every stylesheet and script 404s. A <base> tag would fix the
 * assets but silently rebase the site's many href="#" anchors, so it is not used.
 * ------------------------------------------------------------------ */

const STYLESHEETS = [
    'css/tokens.css', 'css/styles.css', 'css/pages.css', 'css/header-layout.css',
    'css/dropdown-menu.css', 'css/hero-fullscreen.css', 'css/mobile-nav-fixed.css',
    'css/mobile-optimized.css', 'css/insider-tips.css', 'css/premium-fx.css',
    'css/venue-card.css', 'css/venue-page.css',
];

// pages.js and card-renderer.js are deliberately absent: pages.js falls through
// to CardRenderer.renderAll() for any page holding a #restaurants-grid, which
// would dump all 48 cards into a page that already has its content.
const SCRIPTS = [
    'js/translations.js', 'js/venue-translations.js', 'js/attraction-translations.js',
    'js/venue-labels.js', 'js/menu-translations.js', 'js/language-selector.js',
    'js/referral-config.js', 'js/referral.js', 'js/booking.js', 'js/script.js',
];

function head(lang, { title, description, canonical, alternates, image, noindex, jsonLd }) {
    const twitterCard = image && image.width >= 600 ? 'summary_large_image' : 'summary';
    const ogImage = image || { url: absUrl(DEFAULT_OG_IMAGE) };
    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
${noindex ? '    <meta name="robots" content="noindex, follow">\n' : ''}    <link rel="canonical" href="${esc(canonical)}">
${alternates.map((a) => `    <link rel="alternate" hreflang="${a.lang}" href="${esc(a.href)}">`).join('\n')}

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:locale" content="${lang === 'sr' ? 'sr_RS' : 'en_GB'}">
    <meta property="og:url" content="${esc(canonical)}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:image" content="${esc(ogImage.url)}">
${ogImage.width ? `    <meta property="og:image:width" content="${ogImage.width}">\n    <meta property="og:image:height" content="${ogImage.height}">\n` : ''}    <meta name="twitter:card" content="${twitterCard}">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${esc(ogImage.url)}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Cormorant+Garamond:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
${STYLESHEETS.map((s) => `    <link rel="stylesheet" href="/${s}">`).join('\n')}

${jsonLd.map((o) => `    <script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n    </script>`).join('\n')}
</head>`;
}

/* js/script.js constructs CustomCursor unconditionally and dereferences these
   two elements, so a page without them throws before the rest of that file's
   DOMContentLoaded work runs. Every hand-written page has them; generated pages
   need them for the same reason. */
const CURSOR = `    <div class="cursor-dot" data-cursor-dot></div>
    <div class="cursor-outline" data-cursor-outline></div>`;

function siteHeader(lang) {
    const nav = [
        ['/', 'nav.home', 'Home', 'fa-home'],
        ['/restaurants.html', 'nav.restaurants', 'Restaurants', 'fa-utensils'],
        ['/cafes.html', 'nav.cafes', 'Cafes', 'fa-coffee'],
        ['/nightlife.html', 'nav.nightlife', 'Nightlife', 'fa-glass-cheers'],
        ['/attractions.html', 'nav.attractions', 'Attractions', 'fa-landmark'],
    ];
    return `    <header class="header scroll-header" id="header">
        <nav class="nav container">
            <div class="nav__left">
                <div class="nav__logo">
                    <a href="/" class="nav__logo-link nav__logo-link--text">
                        <img src="/assets/images/logo/feelbg-monogram-f.png" alt="" class="nav__logo-img nav__logo-monogram" aria-hidden="true">
                        <span class="nav__logo-brandtext">FeelBG</span>
                    </a>
                </div>
            </div>
            <div class="nav__menu" id="nav-menu">
                <ul class="nav__list">
${nav.map(([href, key, en, icon]) =>
        `                    <li class="nav__item"><a href="${href}" class="nav__link"><i class="fas ${icon}"></i> <span data-i18n="${key}">${esc(t(lang, key, en))}</span></a></li>`).join('\n')}
                </ul>
            </div>
            <div class="nav__actions">
                <div class="nav__toggle" id="nav-toggle"><i class="fas fa-bars"></i></div>
            </div>
        </nav>
    </header>`;
}

function siteFooter(lang) {
    return `    <footer class="footer">
        <div class="container">
            <div class="footer__content">
                <div class="footer__section">
                    <h3 class="footer__title">Feel<span class="logo-accent">BG</span></h3>
                    <p class="footer__text"><span data-i18n="footer.text">${esc(t(lang, 'footer.text', ''))}</span></p>
                </div>
                <div class="footer__section">
                    <h4 class="footer__subtitle" data-i18n="footer.quickLinks">${esc(t(lang, 'footer.quickLinks', 'Quick Links'))}</h4>
                    <ul class="footer__links">
                        <li><a href="/" data-i18n="nav.home">${esc(t(lang, 'nav.home', 'Home'))}</a></li>
                        <li><a href="/restaurants.html" data-i18n="nav.restaurants">${esc(t(lang, 'nav.restaurants', 'Restaurants'))}</a></li>
                        <li><a href="/cafes.html" data-i18n="nav.cafes">${esc(t(lang, 'nav.cafes', 'Cafes'))}</a></li>
                        <li><a href="/nightlife.html" data-i18n="nav.nightlife">${esc(t(lang, 'nav.nightlife', 'Nightlife'))}</a></li>
                    </ul>
                </div>
                <div class="footer__section">
                    <h4 class="footer__subtitle" data-i18n="footer.contact">${esc(t(lang, 'footer.contact', 'Contact'))}</h4>
                    <p class="footer__text">hello@feelbg.com</p>
                </div>
            </div>
            <div class="footer__bottom">
                <p><span data-i18n="footer.copyright">${esc(t(lang, 'footer.copyright', '© 2025 FeelBG.'))}</span></p>
            </div>
        </div>
    </footer>`;
}

/**
 * Records that this venue page was looked at.
 *
 * This is the denominator the dashboard divides by: without a view count,
 * "three people clicked Reserve" says nothing about whether that is good.
 *
 * It waits for load rather than firing immediately so it never competes with
 * rendering, and it is a no-op when referral.js is blocked or absent.
 */
function viewBeacon() {
    return `    <script>
        window.addEventListener('load', function () {
            if (!window.FeelBGReferral) return;
            var b = document.body;
            window.FeelBGReferral.track('venue_view', b.dataset.venueName || '', '', b.dataset.venueSlug || '');
        });
    <\/script>`;
}

function scriptTags() {
    return SCRIPTS.map((s) => `    <script src="/${s}"></script>`).join('\n') + `
    <script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
    <script defer src="/_vercel/insights/script.js"></script>`;
}

/* ------------------------------------------------------------------ *
 * The venue page
 * ------------------------------------------------------------------ */

const L = {
    en: {
        home: 'Home', facts: 'Good to know', address: 'Address', area: 'Area',
        hours: 'Opening hours', phone: 'Phone', website: 'Website', price: 'Prices',
        category: 'Category', directions: 'Directions on Google Maps',
        ratingNote: 'FeelBG editorial score', readInOther: 'Pročitajte na srpskom',
        backTo: (c) => `All ${c.toLowerCase()}`,
    },
    sr: {
        home: 'Početna', facts: 'Korisno da znate', address: 'Adresa', area: 'Kvart',
        hours: 'Radno vreme', phone: 'Telefon', website: 'Sajt', price: 'Cene',
        category: 'Kategorija', directions: 'Uputstva na Google mapama',
        ratingNote: 'FeelBG urednička ocena', readInOther: 'Read in English',
        backTo: (c) => `Sve: ${c.toLowerCase()}`,
    },
};

function venuePage(v, lang) {
    const other = lang === 'en' ? 'sr' : 'en';
    const canonical = absUrl(pathFor(v, lang));
    const s = L[lang];
    const cat = CATEGORIES[v.type][lang];
    const name = nameFor(v, lang);
    const label = labelFor(v, lang);
    const img = imageFor(v);
    const title = titleFor(v, lang);
    const description = metaDescFor(v, lang);

    const alternates = [
        { lang: 'en', href: absUrl(pathFor(v, 'en')) },
        { lang: 'sr', href: absUrl(pathFor(v, 'sr')) },
        { lang: 'x-default', href: absUrl(pathFor(v, 'en')) },
    ];

    const about = proseFor(v, lang, 'about');
    const why = proseFor(v, lang, 'why');
    const insider = proseFor(v, lang, 'insider');
    const pills = pillsFor(v, lang);

    const facts = [
        [s.address, esc(v.address)],
        [s.area, esc(v.area)],
        v.hours ? [s.hours, esc(v.hours)] : null,
        v.phone ? [s.phone, `<a href="tel:${esc(v.phone.replace(/\s/g, ''))}">${esc(v.phone)}</a>`] : null,
        v.website ? [s.website, `<a href="https://${esc(v.website)}" rel="noopener nofollow" target="_blank" data-venue-website>${esc(v.website)}</a>`] : null,
        v.priceLabel ? [s.price, esc(priceText(v, lang))] : null,
        [s.category, esc(label)],
    ].filter(Boolean);

    const related = relatedFor(v, lang);

    const body = `<body data-page="venue" data-venue-type="${v.type}" data-venue-slug="${esc(v.slug)}" data-venue-name="${esc(v.name)}">
${CURSOR}
${siteHeader(lang)}

    <main class="main venue-page">
        <div class="container">
            <nav class="venue-crumbs" aria-label="Breadcrumb">
                <a href="/">${esc(s.home)}</a>
                <span aria-hidden="true">/</span>
                <a href="${cat.path}">${esc(cat.title)}</a>
                <span aria-hidden="true">/</span>
                <span aria-current="page">${esc(name)}</span>
            </nav>

            <header class="venue-head">
                <h1 class="venue-title">${esc(name)}</h1>
                <p class="venue-sub">
                    <span>${esc(label)}</span>
                    <span aria-hidden="true">·</span>
                    <span>${esc(v.area)}</span>
                    <span aria-hidden="true">·</span>
                    <span class="venue-rating" title="${esc(s.ratingNote)}">★ ${v.rating} <small>${esc(s.ratingNote)}</small></span>
                </p>
            </header>

${img ? `            <figure class="venue-figure">
                <img src="/${encodePath(img.rel)}" alt="${esc([name, distinctLabel(v, lang), v.area, lang === 'sr' ? 'Beograd' : 'Belgrade'].filter(Boolean).join(', '))}"${img.width ? ` width="${img.width}" height="${img.height}"` : ''} loading="eager">
            </figure>` : ''}

            <div class="venue-body">
                <p class="venue-lead">${esc(proseFor(v, lang, 'hook') || descFor(v, lang))}</p>
${about ? `                <p>${esc(about)}</p>` : ''}
${why ? `                <h2>${esc(t(lang, 'attraction.why', 'Why go'))}</h2>\n                <p>${esc(why)}</p>` : ''}
${insider ? `                <h2>${esc(t(lang, 'attraction.insider', 'Insider tip'))}</h2>\n                <p>${esc(insider)}</p>` : ''}
${pills.length ? `                <ul class="venue-pills">${pills.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
            </div>

            <section class="venue-facts">
                <h2>${esc(s.facts)}</h2>
                <dl>
${facts.map(([k, val]) => `                    <dt>${esc(k)}</dt><dd>${val}</dd>`).join('\n')}
                </dl>
                <p><a class="venue-map-link" href="https://www.google.com/maps/dir/?api=1&amp;destination=${v.lat},${v.lng}" rel="noopener" target="_blank">${esc(s.directions)}</a></p>
            </section>

${related.map((g) => `            <section class="venue-related">
                <h2>${esc(g.title)}</h2>
                <ul>
${g.items.map(({ v: x, note }) => `                    <li><a href="${pathFor(x, lang)}">${esc(nameFor(x, lang))}</a> <span class="quiet">${esc(note)}</span></li>`).join('\n')}
                </ul>
            </section>`).join('\n')}

            <nav class="venue-foot-nav">
                <a href="${cat.path}">${esc(s.backTo(cat.title))}</a>
                <a href="${pathFor(v, other)}" hreflang="${other}" lang="${other}">${esc(s.readInOther)}</a>
            </nav>
        </div>
    </main>

${siteFooter(lang)}

${scriptTags()}
${viewBeacon()}
</body>
</html>
`;

    return head(lang, {
        title, description, canonical, alternates, image: img,
        noindex: NOINDEX.has(v.name),
        jsonLd: [venueJsonLd(v, lang), breadcrumbJsonLd(v, lang)],
    }) + '\n' + body;
}

/* ------------------------------------------------------------------ *
 * Serbian category pages
 *
 * Without these, every Serbian venue page breadcrumbs up into an English
 * category page and the Serbian journey dead-ends after one click.
 * ------------------------------------------------------------------ */

function categoryPage(type, lang) {
    const cat = CATEGORIES[type][lang];
    const other = lang === 'en' ? 'sr' : 'en';
    const canonical = absUrl(cat.path);
    const s = L[lang];
    const list = ALL.filter((v) => v.type === type);

    const title = clip(`${cat.h1} — ${lang === 'sr' ? 'vodič' : 'guide'}`, LIMITS.titleMax);
    const description = clip(
        lang === 'sr'
            ? `${cat.h1}: pažljivo biran izbor mesta koja lokalci zaista preporučuju, sa adresama, kvartovima i cenama.`
            : `${cat.h1}: a hand-picked selection of places locals actually recommend, with addresses, areas and prices.`,
        LIMITS.descriptionMax);

    const body = `<body data-page="category" data-venue-type="${type}">
${CURSOR}
${siteHeader(lang)}

    <main class="main venue-page">
        <div class="container">
            <nav class="venue-crumbs" aria-label="Breadcrumb">
                <a href="/">${esc(s.home)}</a>
                <span aria-hidden="true">/</span>
                <span aria-current="page">${esc(cat.title)}</span>
            </nav>

            <header class="venue-head">
                <h1 class="venue-title">${esc(cat.h1)}</h1>
                <p class="venue-sub">${esc(description)}</p>
            </header>

            <ul class="venue-index">
${list.map((v) => `                <li>
                    <a href="${pathFor(v, lang)}">${esc(nameFor(v, lang))}</a>
                    <span class="quiet">${esc(labelFor(v, lang))} · ${esc(v.area)}</span>
                    <p>${esc(descFor(v, lang))}</p>
                </li>`).join('\n')}
            </ul>

            <nav class="venue-foot-nav">
                <a href="${CATEGORIES[type][other].path}" hreflang="${other}" lang="${other}">${esc(s.readInOther)}</a>
            </nav>
        </div>
    </main>

${siteFooter(lang)}

${scriptTags()}
</body>
</html>
`;

    return head(lang, {
        title, description, canonical,
        alternates: [
            { lang: 'en', href: absUrl(CATEGORIES[type].en.path) },
            { lang: 'sr', href: absUrl(CATEGORIES[type].sr.path) },
            { lang: 'x-default', href: absUrl(CATEGORIES[type].en.path) },
        ],
        image: null, noindex: false,
        jsonLd: [{
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: cat.h1,
            description,
            url: canonical,
        }],
    }) + '\n' + body;
}

/* ------------------------------------------------------------------ *
 * Pre-rendering the existing category pages
 *
 * restaurants.html and its three siblings ship an empty grid div and fill it
 * from JavaScript, so a crawler that does not execute scripts sees four pages
 * with no venues on them at all. Writing the same cards into the HTML fixes
 * that without changing what a visitor sees: the markup is produced by
 * js/card-renderer.js, the very file the browser then runs.
 * ------------------------------------------------------------------ */

const CARDS_START = '<!-- seo:cards:start -->';
const CARDS_END = '<!-- seo:cards:end -->';

function renderCardsFor(type, lang) {
    CardRenderer.lang = lang;
    const html = VENUES[type].map((v) => CardRenderer.renderCard(v)).join('');
    CardRenderer.lang = null;
    return html;
}

async function prerenderCategoryPages() {
    const touched = [];
    for (const [type, cfg] of Object.entries(CATEGORIES)) {
        const file = path.join(ROOT, cfg.en.path.replace(/^\//, ''));
        let html = await readFile(file, 'utf8');

        const openRe = /<div class="places-grid" id="restaurants-grid"[^>]*>/;
        const open = html.match(openRe);
        if (!open) { console.warn(`  no grid found in ${cfg.en.path}`); continue; }

        const from = html.indexOf(open[0]);
        const afterOpen = from + open[0].length;
        // Idempotent: on a re-run, replace everything the last run wrote.
        const prevEnd = html.indexOf(CARDS_END, afterOpen);
        const to = prevEnd === -1 ? afterOpen : prevEnd + CARDS_END.length;

        const block =
            `<div class="places-grid" id="restaurants-grid" data-prerendered="en">\n` +
            `                    ${CARDS_START}${renderCardsFor(type, 'en')}${CARDS_END}`;

        const next = html.slice(0, from) + block + html.slice(to);
        if (next !== html) { await writeFile(file, next); touched.push(cfg.en.path); }
    }
    return touched;
}

/* ------------------------------------------------------------------ *
 * Sitemap
 * ------------------------------------------------------------------ */

function sitemap(entries) {
    const url = (e) => `  <url>
    <loc>${e.loc}</loc>
${(e.alternates || []).map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.href}"/>`).join('\n')}${e.alternates ? '\n' : ''}  </url>`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(url).join('\n')}
</urlset>
`;
}

/* ------------------------------------------------------------------ *
 * Build
 * ------------------------------------------------------------------ */

const written = new Map();
function emit(rel, content) { written.set(rel, content); }

function build() {
    const venues = ONLY.length
        ? ALL.filter((v) => ONLY.includes(v.slug) || ONLY.includes(v.name))
        : ALL;

    for (const v of venues) {
        for (const lang of ['en', 'sr']) {
            emit(path.join(pathFor(v, lang).slice(1), 'index.html'), venuePage(v, lang));
        }
    }

    for (const type of Object.keys(CATEGORIES)) {
        emit(path.join(CATEGORIES[type].sr.path.slice(1), 'index.html'), categoryPage(type, 'sr'));
    }

    // Sitemap covers everything indexable. noindex pages are excluded — asking
    // Google to crawl a page that tells it not to index is a contradiction.
    const entries = [];
    for (const p of ['/', '/restaurants.html', '/cafes.html', '/nightlife.html', '/attractions.html']) {
        entries.push({ loc: absUrl(p) });
    }
    for (const type of Object.keys(CATEGORIES)) {
        entries.push({
            loc: absUrl(CATEGORIES[type].sr.path),
            alternates: [
                { lang: 'en', href: absUrl(CATEGORIES[type].en.path) },
                { lang: 'sr', href: absUrl(CATEGORIES[type].sr.path) },
            ],
        });
    }
    for (const v of ALL) {
        if (NOINDEX.has(v.name)) continue;
        for (const lang of ['en', 'sr']) {
            entries.push({
                loc: absUrl(pathFor(v, lang)),
                alternates: [
                    { lang: 'en', href: absUrl(pathFor(v, 'en')) },
                    { lang: 'sr', href: absUrl(pathFor(v, 'sr')) },
                ],
            });
        }
    }
    emit('sitemap.xml', sitemap(entries));
}

/* ------------------------------------------------------------------ *
 * Assertions — these fail the build rather than warn, because a silent
 * regression here is invisible until Search Console reports it weeks later.
 * ------------------------------------------------------------------ */

function assertAll() {
    const problems = [];
    const titles = new Map(), descs = new Map();

    for (const v of ALL) {
        for (const lang of ['en', 'sr']) {
            const where = `${v.name} [${lang}]`;
            const title = titleFor(v, lang);
            const desc = metaDescFor(v, lang);

            if (title.length > LIMITS.titleMax) problems.push(`${where}: title ${title.length} chars — ${title}`);
            if (desc.length > LIMITS.descriptionMax) problems.push(`${where}: description ${desc.length} chars`);
            if (desc.length < LIMITS.descriptionMin) problems.push(`${where}: description only ${desc.length} chars`);

            if (titles.has(title)) problems.push(`duplicate title: ${title} (${where} & ${titles.get(title)})`);
            titles.set(title, where);
            if (descs.has(desc)) problems.push(`duplicate description (${where} & ${descs.get(desc)})`);
            descs.set(desc, where);

            if (!slugFor(v, lang)) problems.push(`${where}: no slug`);
            if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slugFor(v, lang))) problems.push(`${where}: bad slug ${slugFor(v, lang)}`);
        }

        // A Serbian page whose text is English makes the hreflang pair a lie.
        if (!t('sr', `venue.${tKey(v.name)}.desc`, '')) problems.push(`${v.name}: no Serbian description`);

        const types = [].concat(schemaTypeFor(v));
        if (v.priceLabel && !types.some((x) => LOCAL_BUSINESS_TYPES.has(x))) {
            problems.push(`${v.name}: priceLabel on a non-LocalBusiness type (${types.join(',')})`);
        }
    }

    // Every hreflang must resolve to a page we actually wrote.
    for (const [rel, html] of written) {
        for (const m of html.matchAll(/<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g)) {
            const p = m[1].replace(SITE_ORIGIN, '');
            if (p === '/' || p.endsWith('.html')) continue;
            const target = path.join(p.slice(1), 'index.html');
            if (!written.has(target)) problems.push(`${rel}: hreflang points at missing ${p}`);
        }
        if (/aggregateRating|openingHours/.test(html)) {
            problems.push(`${rel}: emits aggregateRating or openingHours — neither is supported by the data`);
        }
    }

    return problems;
}

/* ------------------------------------------------------------------ */

build();
const problems = assertAll();
if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    problems.forEach((p) => console.error('  ' + p));
    process.exit(1);
}

if (CHECK) {
    let stale = 0;
    for (const [rel, content] of written) {
        const abs = path.join(ROOT, rel);
        const current = existsSync(abs) ? await readFile(abs, 'utf8') : null;
        if (current !== content) { stale++; console.error(`stale: ${rel}`); }
    }
    if (stale) {
        console.error(`\n${stale} file(s) out of date. Run: npm run seo:build`);
        process.exit(1);
    }
    console.log(`${written.size} generated file(s) are up to date.`);
} else {
    // Clear previous output so a renamed venue does not leave an orphan page
    // serving a stale URL forever.
    if (!ONLY.length) {
        for (const dir of ['en/venue', 'sr/mesto', 'sr/restorani', 'sr/kafici', 'sr/nocni-zivot', 'sr/znamenitosti']) {
            await rm(path.join(ROOT, dir), { recursive: true, force: true });
        }
    }
    for (const [rel, content] of written) {
        const abs = path.join(ROOT, rel);
        await mkdir(path.dirname(abs), { recursive: true });
        await writeFile(abs, content);
    }
    const prerendered = await prerenderCategoryPages();
    if (prerendered.length) console.log(`Pre-rendered cards into: ${prerendered.join(', ')}`);
    console.log(`Wrote ${written.size} file(s).`);
    console.log(`  ${ALL.length * 2} venue pages, ${Object.keys(CATEGORIES).length} Serbian category pages, sitemap.xml`);
    if (NOINDEX.size) console.log(`  ${NOINDEX.size} venue(s) carry noindex until they have real copy.`);
}
