#!/usr/bin/env node
/**
 * Verify that every language is complete.
 *
 *   node tools/check-i18n.mjs          # exits non-zero on the first gap
 *   node tools/check-i18n.mjs --list   # also print each locale's key count
 *
 * The site ships eleven locale codes across five translation files, and the
 * failure mode is silent: a missing key falls back to English, so a half
 * translated language looks fine on the page that happens to be open and
 * turns into English three clicks later. Nothing in the build catches that,
 * which is how tr/de/fr ended up without the adventure story lines and el/he
 * without the cuisine labels. This does.
 *
 * Four invariants, all enforced as hard failures:
 *
 *   1. Every locale carries every key any locale defines.
 *   2. The locale list in js/language-selector.js matches the locales that
 *      actually have translations (offering a flag with no strings behind it
 *      is worse than not offering it).
 *   3. Every data-i18n key used in the HTML and every key looked up in JS
 *      exists. Dynamically built keys (`'badge.' + venue.badge`) are resolved
 *      against the real data rather than skipped.
 *   4. Placeholders survive translation — {n}, {name}, {area}, {attraction}
 *      and {d} are substituted at runtime, so a translation that drops one
 *      renders a sentence with a hole in it.
 *
 * Requires Node 18+. No dependencies.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIST = process.argv.slice(2).includes('--list');

const TRANSLATION_FILES = [
    'translations.js', 'venue-translations.js', 'attraction-translations.js',
    'venue-labels.js', 'menu-translations.js',
];

globalThis.window = {};
for (const f of TRANSLATION_FILES) require(path.join(ROOT, 'js', f));
const T = globalThis.window.FEELBG_TRANSLATIONS;
const CardRenderer = require(path.join(ROOT, 'js', 'card-renderer.js'));
const VENUES = require(path.join(ROOT, 'js', 'venues.js'));

const locales = Object.keys(T);
const failures = [];
const fail = (msg) => failures.push(msg);

/* English copy for venue descriptions, category labels and the attraction
   long-form fields lives on the venue object in js/venues.js, not in a
   translation file — CardRenderer.getTranslated() falls back to it. So en and
   us are expected to be short exactly those keys, and only those. */
const VENUE_SOURCED = new Set(
    Object.keys(T.sr).filter((k) => !(k in T.en) && /^venue\./.test(k)));

/* ---------------------------------------------------------------- *
 * 1. Key coverage
 * ---------------------------------------------------------------- */

const union = new Set(locales.flatMap((l) => Object.keys(T[l])));

for (const locale of locales) {
    const missing = [...union].filter((k) => !(k in T[locale]));
    const unexpected = (locale === 'en' || locale === 'us')
        ? missing.filter((k) => !VENUE_SOURCED.has(k))
        : missing;
    if (unexpected.length) {
        fail(`${locale} is missing ${unexpected.length} key(s): ${unexpected.slice(0, 8).join(', ')}`
            + (unexpected.length > 8 ? ', …' : ''));
    }
    if (LIST) {
        console.log(`  ${locale.padEnd(3)} ${String(Object.keys(T[locale]).length).padStart(4)} keys`);
    }
}

/* Empty strings are as broken as absent ones, and harder to spot.
   hero.of is the exception: the hero reads "Discover the Heart {of} SERBIA",
   and Serbian, Turkish and Russian carry that relation in the case ending
   rather than a separate word, so the slot is deliberately empty there. */
const BLANK_BY_DESIGN = new Set(['hero.of']);
for (const locale of locales) {
    const blank = Object.keys(T[locale])
        .filter((k) => !String(T[locale][k]).trim() && !BLANK_BY_DESIGN.has(k));
    if (blank.length) fail(`${locale} has ${blank.length} blank value(s): ${blank.slice(0, 8).join(', ')}`);
}

/* ---------------------------------------------------------------- *
 * 2. The selector offers exactly the locales that have translations
 * ---------------------------------------------------------------- */

const selector = readFileSync(path.join(ROOT, 'js', 'language-selector.js'), 'utf8');
const offered = [...selector.matchAll(/\{ code: '([a-z]{2})'/g)].map((m) => m[1]);
const flagMapBody = (selector.match(/const flagMap = \{([\s\S]*?)\};/) || [, ''])[1];
const flagged = [...flagMapBody.matchAll(/'([a-z]{2})'\s*:/g)].map((m) => m[1]);

for (const code of offered) {
    if (!T[code]) fail(`language-selector.js offers "${code}" but no locale by that name has translations`);
    if (!flagged.includes(code)) fail(`language-selector.js offers "${code}" but flagMap has no flag for it`);
}
for (const code of locales) {
    if (!offered.includes(code)) fail(`locale "${code}" has translations but language-selector.js never offers it`);
}

/* Every page's dropdown must offer the same set as the selector. */
for (const page of readdirSync(ROOT).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(path.join(ROOT, page), 'utf8');
    if (!html.includes('language-option')) continue;
    const inPage = [...html.matchAll(/class="language-option" data-code="([a-z]{2})"/g)].map((m) => m[1]);
    for (const code of offered) {
        if (!inPage.includes(code)) fail(`${page} dropdown is missing the "${code}" option`);
    }
}

/* ---------------------------------------------------------------- *
 * 3. Every referenced key exists
 * ---------------------------------------------------------------- */

const referenced = new Set();

for (const page of readdirSync(ROOT).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(path.join(ROOT, page), 'utf8');
    for (const m of html.matchAll(/data-i18n="([^"]+)"/g)) referenced.add(m[1]);
}
/* `(?=\s*[),])` keeps this to whole keys. A lookup built by concatenation —
   t('badge.' + venue.badge) — would otherwise register the bare prefix
   "badge." as a key; those are enumerated against the real data below. */
for (const f of readdirSync(path.join(ROOT, 'js')).filter((n) => n.endsWith('.js'))) {
    const js = readFileSync(path.join(ROOT, 'js', f), 'utf8');
    for (const m of js.matchAll(/\bt\(\s*'([a-zA-Z][\w.]*\.[\w.]+)'(?=\s*[),])/g)) referenced.add(m[1]);
    for (const m of js.matchAll(/\b(?:feelbgT|liveEventsT)\(\s*'([\w.]+)'(?=\s*[),])/g)) referenced.add(m[1]);
    for (const m of js.matchAll(/data-i18n=\\?"([\w.]+)\\?"/g)) referenced.add(m[1]);
}

/* Keys assembled at runtime, resolved against the data that feeds them. */
for (const venue of Object.values(VENUES).flat()) {
    if (venue.badge) referenced.add(`badge.${venue.badge}`);
}
for (const id of ['high', 'conditional', 'separe']) {
    referenced.add(`chatbot.seat.${id}`);
    referenced.add(`chatbot.seat.${id}.note`);
}
const tipCount = ((readFileSync(path.join(ROOT, 'js', 'insider-tips.js'), 'utf8')
    .match(/var tipIcons = \[([\s\S]*?)\]/) || [, ''])[1].match(/'/g) || []).length / 2;
for (let i = 1; i <= tipCount; i++) referenced.add(`insider.tip${i}`);

for (const key of [...referenced].sort()) {
    /* A trailing dot is the literal prefix of a concatenation, e.g. 'badge.' —
       the assembled keys are added above, so the bare prefix is not a key. */
    if (key.endsWith('.')) continue;
    if (/^(venue|label)\./.test(key)) continue;  // resolved per venue, with an English fallback
    const absent = locales.filter((l) => !(key in T[l]));
    if (absent.length === locales.length) fail(`key "${key}" is referenced but defined in no locale`);
    else if (absent.length) fail(`key "${key}" is referenced but missing in: ${absent.join(', ')}`);
}

/* ---------------------------------------------------------------- *
 * 4. Placeholders survive translation
 * ---------------------------------------------------------------- */

const PLACEHOLDERS = {
    'reserve.liveCount': ['{n}'],
    'card.nearbyCount': ['{n}', '{d}'],
    'card.photoCount': ['{n}'],
    'adventure.tpl.cultureLine': ['{attraction}'],
};
for (const key of union) {
    if (/^adventure\.tpl\.stop(Restaurant|Nightlife)\./.test(key)) {
        PLACEHOLDERS[key] = ['{name}', '{area}'];
    }
}
for (const [key, needed] of Object.entries(PLACEHOLDERS)) {
    for (const locale of locales) {
        const value = T[locale][key];
        if (value === undefined) continue;  // reported by the coverage check
        const dropped = needed.filter((p) => !String(value).includes(p));
        if (dropped.length) fail(`${locale} "${key}" drops ${dropped.join(', ')}: ${value}`);
    }
}

/* Every venue must render a non-empty description and category label in every
   language — this is what a reader actually sees on a card. */
for (const locale of locales) {
    CardRenderer.lang = locale;
    for (const venue of Object.values(VENUES).flat()) {
        for (const field of ['desc', 'cuisine']) {
            if (!String(CardRenderer.getTranslated(venue, field) || '').trim()) {
                fail(`${locale}: ${venue.name} renders an empty ${field}`);
            }
        }
    }
}
CardRenderer.lang = undefined;

/* ---------------------------------------------------------------- */

if (failures.length) {
    console.error(`\ni18n check failed — ${failures.length} problem(s):\n`);
    for (const f of failures) console.error(`  • ${f}`);
    console.error('');
    process.exit(1);
}

console.log(`i18n OK — ${locales.length} locales, ${union.size} keys, `
    + `${Object.values(VENUES).flat().length} venues, ${referenced.size} referenced keys.`);
