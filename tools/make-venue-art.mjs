#!/usr/bin/env node
/**
 * Draw stand-in artwork for venues that have no photograph.
 *
 * A card with an empty `image` renders a blank tinted box, which reads as a
 * broken image rather than a design decision — and two dozen venues (every
 * church, every shopping centre, most of the parks) were in that state.
 *
 * This writes one SVG per venue into assets/venue-art/: the site's navy and
 * gold, and a silhouette drawn for what the place actually is — a dome and a
 * cross for a church, columns for a museum, trees for a park. Vector, so it
 * stays sharp as a card background, as the hero of the venue page and inside
 * the reservation picker, and each file is a couple of kilobytes.
 *
 * The venue's name is deliberately not drawn into it. A card crops the image to
 * a much wider box than the artwork, so anything along the bottom edge is cut in
 * half — and the card prints the name directly underneath anyway. Only the
 * category and the FeelBG mark are set. Both sit inside y 110-640 — what
 * survives the tightest crop the cards produce (a 560x250 card box) — and along
 * the bottom, clear of the badge and the heart in the card's top corners.
 *
 * It is a stand-in, not a substitute. The moment real photographs exist, point
 * the `image` field at them — or run tools/fetch-venue-photos.mjs, which pulls
 * freely-licensed photos from Wikimedia Commons and overwrites these.
 *
 *   node tools/make-venue-art.mjs             # write art for venues with no image
 *   node tools/make-venue-art.mjs --apply     # ...and point venues.js at it
 *   node tools/make-venue-art.mjs --only "Ružica Church" --apply
 *
 * Flags:
 *   --apply    rewrite the `image:` fields in js/venues.js
 *   --only=A,B restrict to these venue names
 *   --force    redraw art that already exists (it is rewritten either way, but
 *              --force also re-points venues.js entries that carry a photo)
 */

import { createRequire } from 'node:module';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'assets', 'venue-art');
const VENUES_JS = path.join(ROOT, 'js', 'venues.js');

const argv = process.argv.slice(2);
const flag = (n) => argv.includes('--' + n);
const value = (n, d) => {
    const hit = argv.find((a) => a.startsWith(`--${n}=`));
    return hit ? hit.slice(n.length + 3) : d;
};

const APPLY = flag('apply');
const FORCE = flag('force');
const ONLY = value('only', '').split(',').map((s) => s.trim()).filter(Boolean);

const VENUES = require(VENUES_JS);
const COLLECTIONS = ['restaurants', 'cafes', 'nightlife', 'attractions'];

const W = 1200, H = 750;

/* Same folding as tools/fetch-venue-photos.mjs: diacritics to their base letter
   so "Pržionica" becomes przionica rather than pr_ionica. */
function slugify(name) {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
        .toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

const xml = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* A stable number per venue, so the same name always gets the same variant and
   the same background hue — regenerating never reshuffles the set. */
function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
}

/* Which drawing a venue gets. `cuisine` is the venue's own token, so this stays
   correct when venues are added — only genuinely new kinds need a line here. */
function motifFor(v) {
    if (v.type === 'cafes' || v.cuisine === 'coffee') return 'cafe';
    if (v.cuisine === 'religious') return 'church';
    if (v.cuisine === 'museum') return 'museum';
    if (v.cuisine === 'shopping') return 'mall';
    if (v.cuisine === 'nature') {
        return /island|reserve|ostrvo/i.test(v.cuisineLabel || '') ? 'island' : 'park';
    }
    if (v.type === 'nightlife') return 'night';
    return 'skyline';
}

/* ------------------------------------------------------------------ *
 * The drawings
 *
 * All of them sit on the same 1200x750 stage with the horizon at y=560, so a
 * card that crops the art still crops it consistently.
 * ------------------------------------------------------------------ */

const GROUND = 560;

function church(seed) {
    const towers = seed % 2 === 0;
    return `
      ${towers ? `
      <rect x="330" y="330" width="86" height="230" rx="6"/>
      <rect x="784" y="330" width="86" height="230" rx="6"/>
      <path d="M330 330 L373 262 L416 330 Z"/>
      <path d="M784 330 L827 262 L870 330 Z"/>
      <circle cx="373" cy="392" r="17" fill="none" stroke-width="6"/>
      <circle cx="827" cy="392" r="17" fill="none" stroke-width="6"/>` : ''}
      <rect x="430" y="360" width="340" height="200" rx="8"/>
      <path d="M430 360 Q600 232 770 360 Z"/>
      <path d="M600 150 v78 M572 178 h56" stroke-width="12" stroke-linecap="round" fill="none"/>
      <circle cx="600" cy="252" r="26" fill="none" stroke-width="8"/>
      <path d="M556 560 v-110 a44 44 0 0 1 88 0 v110 Z" fill="none" stroke-width="7"/>
      <path d="M478 470 v-40 a22 22 0 0 1 44 0 v40 Z" fill="none" stroke-width="6"/>
      <path d="M678 470 v-40 a22 22 0 0 1 44 0 v40 Z" fill="none" stroke-width="6"/>`;
}

function museum(seed) {
    const columns = 5 + (seed % 3);
    const span = 520, left = 600 - span / 2, gap = span / (columns - 1);
    const cols = Array.from({ length: columns }, (_, i) => {
        const x = left + i * gap - 15;
        return `<rect x="${x.toFixed(0)}" y="380" width="30" height="150" rx="4"/>`;
    }).join('\n      ');
    return `
      <path d="M${left - 60} 360 L600 232 L${600 + span / 2 + 60} 360 Z"/>
      <rect x="${left - 60}" y="360" width="${span + 120}" height="26" rx="5"/>
      ${cols}
      <rect x="${left - 80}" y="530" width="${span + 160}" height="14" rx="4"/>
      <rect x="${left - 100}" y="544" width="${span + 200}" height="16" rx="4"/>`;
}

function mall(seed) {
    const floors = 3 + (seed % 2);
    const top = GROUND - 40 - floors * 62;
    // Windows are cut out of the gold facade rather than drawn on top of it,
    // which is what makes it read as a glass front instead of a pegboard.
    const panes = Array.from({ length: floors }, (_, f) =>
        Array.from({ length: 9 }, (_, i) =>
            `<rect x="${374 + i * 52}" y="${top + 22 + f * 62}" width="36" height="40" rx="4" fill="#0a1128" stroke="none" opacity="${i % 3 === (f + seed) % 3 ? '.35' : '.72'}"/>`
        ).join('')
    ).join('\n      ');
    return `
      <rect x="356" y="${top}" width="488" height="${floors * 62 + 40}" rx="10"/>
      <rect x="336" y="${top - 22}" width="528" height="24" rx="8"/>
      ${panes}
      <rect x="536" y="${GROUND - 74}" width="128" height="74" rx="6" fill="#0a1128" stroke="none" opacity=".72"/>
      <rect x="516" y="${GROUND - 92}" width="168" height="16" rx="8"/>
      <rect x="300" y="${GROUND}" width="600" height="12" rx="6"/>`;
}

function park(seed) {
    const tree = (cx, r, trunk) => `
      <circle cx="${cx}" cy="${GROUND - r - trunk}" r="${r}" opacity=".9"/>
      <circle cx="${cx - r * .62}" cy="${GROUND - r * .78 - trunk}" r="${r * .58}" opacity=".75"/>
      <circle cx="${cx + r * .62}" cy="${GROUND - r * .8 - trunk}" r="${r * .54}" opacity=".75"/>
      <rect x="${cx - 8}" y="${GROUND - trunk}" width="16" height="${trunk}" rx="4"/>`;
    const off = seed % 40;
    return `
      ${tree(360 + off, 78, 96)}
      ${tree(600, 108, 120)}
      ${tree(852 - off, 68, 84)}
      <path d="M300 560 q300 -70 600 0" fill="none" stroke-width="8" opacity=".55"/>
      <path d="M520 560 v-26 h160 v26" fill="none" stroke-width="7"/>
      <path d="M508 534 h184" stroke-width="9" stroke-linecap="round" fill="none"/>`;
}

function island(seed) {
    // The waterline sits well above the caption band: waves drawn at the common
    // horizon would run underneath the venue name.
    const shore = GROUND - 96;
    const wave = (y, o) => `<path d="M180 ${y} q60 -14 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0" fill="none" stroke-width="6" opacity="${o}"/>`;
    const drift = seed % 20;
    return `
      <path d="M400 ${shore} q40 -76 200 -76 t200 76 Z" opacity=".9"/>
      <circle cx="${540 + drift}" cy="${shore - 116}" r="52" opacity=".9"/>
      <rect x="${533 + drift}" y="${shore - 88}" width="14" height="42" rx="4"/>
      <circle cx="690" cy="${shore - 94}" r="38" opacity=".8"/>
      <rect x="683" y="${shore - 74}" width="12" height="34" rx="4"/>
      ${wave(shore + 24, '.6')}
      ${wave(shore + 56, '.4')}
      ${wave(shore + 88, '.25')}`;
}

function cafe(seed) {
    const beans = seed % 2 === 0;
    return `
      <path d="M420 300 h300 v120 a150 150 0 0 1 -300 0 Z" fill="none" stroke-width="10"/>
      <path d="M720 330 h44 a56 56 0 0 1 0 112 h-16" fill="none" stroke-width="10"/>
      <path d="M360 560 h420" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M420 300 h300" stroke-width="14" stroke-linecap="round" fill="none"/>
      <path d="M520 246 q-26 -34 0 -68 q26 -34 0 -68" fill="none" stroke-width="8" stroke-linecap="round" opacity=".8"/>
      <path d="M600 232 q-26 -34 0 -68 q26 -34 0 -68" fill="none" stroke-width="8" stroke-linecap="round" opacity=".65"/>
      <path d="M680 246 q-26 -34 0 -68 q26 -34 0 -68" fill="none" stroke-width="8" stroke-linecap="round" opacity=".8"/>
      ${beans ? `
      <ellipse cx="838" cy="512" rx="30" ry="20" transform="rotate(-24 838 512)" opacity=".8"/>
      <ellipse cx="892" cy="536" rx="26" ry="17" transform="rotate(14 892 536)" opacity=".6"/>` : ''}`;
}

function night(seed) {
    const bars = Array.from({ length: 11 }, (_, i) => {
        const h = 60 + ((hash('bar' + seed + i) % 150));
        return `<rect x="${330 + i * 50}" y="${GROUND - h}" width="30" height="${h}" rx="6" opacity="${.45 + (i % 3) * .2}"/>`;
    }).join('\n      ');
    return `
      ${bars}
      <circle cx="600" cy="228" r="58" fill="none" stroke-width="10"/>
      <path d="M600 170 v116 M542 228 h116 M559 187 l82 82 M641 187 l-82 82" stroke-width="6" fill="none" opacity=".7"/>
      <path d="M300 560 h600" stroke-width="10" stroke-linecap="round" fill="none"/>`;
}

function skyline(seed) {
    const blocks = Array.from({ length: 7 }, (_, i) => {
        const h = 90 + (hash('sky' + seed + i) % 190);
        return `<rect x="${340 + i * 76}" y="${GROUND - h}" width="60" height="${h}" rx="6" opacity="${.5 + (i % 3) * .18}"/>`;
    }).join('\n      ');
    return `
      ${blocks}
      <path d="M300 560 h600" stroke-width="10" stroke-linecap="round" fill="none"/>`;
}

const MOTIFS = { church, museum, mall, park, island, cafe, night, skyline };

/* ------------------------------------------------------------------ *
 * The page
 * ------------------------------------------------------------------ */

/* Two navies and a plum, picked from the site's own palette. The hue is chosen
   by name hash so a row of six shopping centres does not look like one image
   repeated six times. */
const GROUNDS = [
    ['#0a1128', '#16295f'],
    ['#0b1430', '#1e3a6e'],
    ['#12102e', '#2a1f52'],
    ['#081a26', '#124055'],
];

function svgFor(v) {
    const seed = hash(v.name);
    const motif = motifFor(v);
    const [from, to] = GROUNDS[seed % GROUNDS.length];
    const label = (v.cuisineLabel || '').toUpperCase();

    // Fixed positions, so the "sky" is the same in every file of a given hue.
    const stars = Array.from({ length: 26 }, (_, i) => {
        const s = hash(v.name + 'star' + i);
        return `<circle cx="${s % W}" cy="${(s >> 7) % 380}" r="${1 + (s % 3) * .6}" fill="#ffe9a8" opacity="${(.18 + (s % 5) * .09).toFixed(2)}"/>`;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${xml(v.name)}">
  <title>${xml(v.name)}</title>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="46%" r="52%">
      <stop offset="0" stop-color="#ffd700" stop-opacity=".22"/>
      <stop offset="1" stop-color="#ffd700" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe9a8"/>
      <stop offset=".55" stop-color="#ffd700"/>
      <stop offset="1" stop-color="#b8860b"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${stars}
  <g fill="url(#gold)" stroke="url(#gold)" stroke-width="0" stroke-linejoin="round">${MOTIFS[motif](seed)}
  </g>
  ${label ? `<text x="${W / 2}" y="618" text-anchor="middle" font-family="Poppins, Montserrat, Helvetica, Arial, sans-serif" font-size="26" letter-spacing="6" fill="#ffd700" opacity=".85">${xml(label)}</text>` : ''}
  <text x="54" y="618" font-family="Playfair Display, Georgia, serif" font-size="28" font-weight="700" fill="#ffd700" opacity=".75">FeelBG</text>
</svg>
`;
}

/* ------------------------------------------------------------------ */

async function main() {
    const targets = [];
    for (const collection of COLLECTIONS) {
        for (const v of VENUES[collection] || []) {
            if (!v?.name) continue;
            if (ONLY.length && !ONLY.includes(v.name)) continue;
            const isArt = typeof v.image === 'string' && v.image.startsWith('assets/venue-art/');
            // A venue that already has a photograph is left alone unless asked.
            if (v.image && !isArt && !FORCE && !ONLY.includes(v.name)) continue;
            targets.push({ ...v, type: collection });
        }
    }

    if (!targets.length) {
        console.log('Nothing to draw — every venue in scope already has a photograph.');
        return;
    }

    await mkdir(OUT_DIR, { recursive: true });
    const written = [];
    for (const v of targets) {
        const rel = `assets/venue-art/${slugify(v.name)}.svg`;
        await writeFile(path.join(ROOT, rel), svgFor(v));
        written.push({ venue: v.name, rel, motif: motifFor(v) });
        console.log(`  ${motifFor(v).padEnd(8)} ${rel}`);
    }

    if (APPLY) {
        let src = await readFile(VENUES_JS, 'utf8');
        let patched = 0;
        for (const { venue, rel } of written) {
            // Anchor on the venue's own name, then rewrite the image line inside
            // that object — the same anchor tools/fetch-venue-photos.mjs uses.
            const at = src.indexOf(`name: ${JSON.stringify(venue)}`);
            if (at === -1) { console.warn(`  ! ${venue}: not found in venues.js`); continue; }
            const imageAt = src.indexOf('image:', at);
            if (imageAt === -1) { console.warn(`  ! ${venue}: no image field`); continue; }
            const eol = src.indexOf('\n', imageAt);
            const line = src.slice(imageAt, eol);
            src = src.slice(0, imageAt) +
                `image: ${JSON.stringify(rel)}${line.trimEnd().endsWith(',') ? ',' : ''}` +
                src.slice(eol);
            patched += 1;
        }
        await writeFile(VENUES_JS, src);
        console.log(`\nPatched ${patched} image field(s) in js/venues.js`);
    }

    console.log(`\nDrew ${written.length} file(s) into assets/venue-art/.`);
    if (!APPLY) console.log('Pass --apply to point js/venues.js at them.');
}

main().catch((err) => { console.error(err); process.exit(1); });
