#!/usr/bin/env node
/**
 * Find and download venue photographs from Wikimedia Commons.
 *
 * Every venue in js/venues.js has an `image` field. Many of the newer ones are
 * empty, and those cards fall back to a tinted placeholder. This pulls real,
 * freely-licensed photographs for them.
 *
 * Commons is the source because it is the only large photo library where the
 * licence and the author come back from the API with the file, so the credits
 * can be generated rather than guessed. Coverage is excellent for landmarks —
 * churches, parks, museums, fortresses — and thin for bars and shops, which is
 * exactly the split you should expect in the results.
 *
 *   node tools/fetch-venue-photos.mjs                 # list candidates only
 *   node tools/fetch-venue-photos.mjs --download      # fetch the top match
 *   node tools/fetch-venue-photos.mjs --download --all --force
 *   node tools/fetch-venue-photos.mjs --only "Avala,Tašmajdan Park"
 *
 * Flags:
 *   --download   actually save files (default is review-only, no writes)
 *   --all        consider every venue, not just the ones with no image
 *   --force      overwrite files that already exist
 *   --width=N    pixel width to download (default 2560)
 *   --only=A,B   restrict to these venue names
 *   --apply      rewrite the `image:` fields in js/venues.js to the new files
 *
 * Review-only is the default on purpose. A Commons search can return a photo
 * of the right city and the wrong building, so the candidate list is meant to
 * be read before anything is written. Each line prints the file title and its
 * Commons page so you can check it in a browser first.
 *
 * Requires Node 18+ (uses global fetch). No dependencies.
 */

import { createRequire } from 'node:module';
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'assets', 'venues');
const VENUES_JS = path.join(ROOT, 'js', 'venues.js');
const CREDITS = path.join(OUT_DIR, 'CREDITS.md');

const API = 'https://commons.wikimedia.org/w/api.php';
// Commons asks for a descriptive User-Agent identifying the tool.
const UA = 'FeelBG-venue-photos/1.0 (https://feelbg.com)';

const argv = process.argv.slice(2);
const flag = (name) => argv.includes('--' + name);
const value = (name, fallback) => {
    const hit = argv.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.slice(name.length + 3) : fallback;
};

const DOWNLOAD = flag('download');
const ALL = flag('all');
const FORCE = flag('force');
const APPLY = flag('apply');
const WIDTH = parseInt(value('width', '2560'), 10);
const ONLY = value('only', '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/* venues.js sets module.exports, so it loads directly. */
const VENUES = require(VENUES_JS);
const COLLECTIONS = ['restaurants', 'cafes', 'nightlife', 'attractions'];

/* Close to the site's venueSlug, but diacritics are folded to their base
   letter first rather than dropped. The site's version turns "Tašmajdan Park"
   into ta_majdan_park, which is fine for a translation key nobody reads and
   ugly for a filename; this gives tasmajdan_park. */
function slugify(name) {
    return fold(name)
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

/* Strips diacritics so "Tašmajdan" matches "Tasmajdan" in a file title. */
function fold(s) {
    return s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .toLowerCase();
}

async function exists(p) {
    try {
        await access(p);
        return true;
    } catch {
        return false;
    }
}

async function api(params) {
    const url = new URL(API);
    url.search = new URLSearchParams({ format: 'json', origin: '*', ...params }).toString();
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`Commons API ${res.status} for ${params.gsrsearch || params.titles}`);
    return res.json();
}

/* One search, returning the usable image results largest-first. */
async function search(term) {
    const data = await api({
        action: 'query',
        generator: 'search',
        gsrnamespace: '6', // File:
        gsrsearch: term,
        gsrlimit: '20',
        prop: 'imageinfo',
        iiprop: 'url|size|mime|extmetadata',
        iiurlwidth: String(WIDTH)
    });

    const pages = Object.values(data?.query?.pages || {});
    return pages
        .map((p) => {
            const info = (p.imageinfo || [])[0];
            if (!info) return null;
            const meta = info.extmetadata || {};
            return {
                title: p.title,
                width: info.width,
                height: info.height,
                mime: info.mime,
                fileUrl: info.url,
                scaledUrl: info.thumburl || info.url,
                scaledWidth: info.thumbwidth || info.width,
                descriptionUrl: info.descriptionurl,
                licence: meta.LicenseShortName?.value || meta.License?.value || 'unknown',
                author: stripTags(meta.Artist?.value) || 'unknown',
                credit: stripTags(meta.Credit?.value) || ''
            };
        })
        .filter(Boolean)
        .filter((f) => /^image\/(jpeg|png)$/.test(f.mime))
        .filter((f) => f.width >= 1600)
        .sort((a, b) => b.width * b.height - a.width * a.height);
}

function stripTags(html) {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/* The guard against "right city, wrong building": the file's own title has to
   mention the venue. Not proof, but it removes the generic skyline shots that
   a plain search otherwise floats to the top. */
function titleMatches(fileTitle, venueName) {
    const t = fold(fileTitle);
    const words = fold(venueName)
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 3);
    if (!words.length) return true;
    return words.some((w) => t.includes(w));
}

/* Two passes: the venue name with the city, then the bare name. The first is
   more precise, the second catches files titled only by the landmark. */
async function candidatesFor(venue) {
    const terms = [`${venue.name} Belgrade`, `${venue.name} Beograd`, venue.name];
    const seen = new Set();
    const out = [];
    for (const term of terms) {
        let results = [];
        try {
            results = await search(term);
        } catch (err) {
            console.warn(`  ! search failed for "${term}": ${err.message}`);
            continue;
        }
        for (const f of results) {
            if (seen.has(f.title)) continue;
            seen.add(f.title);
            if (!titleMatches(f.title, venue.name)) continue;
            out.push(f);
        }
        if (out.length >= 5) break;
    }
    return out.slice(0, 5);
}

async function download(file, dest) {
    const res = await fetch(file.scaledUrl, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`download ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    return buf.length;
}

async function main() {
    const targets = [];
    for (const collection of COLLECTIONS) {
        for (const venue of VENUES[collection] || []) {
            if (!venue?.name) continue;
            if (ONLY.length && !ONLY.includes(venue.name)) continue;
            if (!ALL && venue.image) continue;
            targets.push({ venue, collection });
        }
    }

    if (!targets.length) {
        console.log('Nothing to do — every venue in scope already has an image.');
        return;
    }

    console.log(
        `${targets.length} venue(s) in scope. ` +
            (DOWNLOAD ? `Downloading at ${WIDTH}px into assets/venues/.` : 'Review only — pass --download to save files.')
    );

    if (DOWNLOAD) await mkdir(OUT_DIR, { recursive: true });

    const credits = [];
    const found = [];
    const missing = [];

    for (const { venue } of targets) {
        const slug = slugify(venue.name);
        process.stdout.write(`\n${venue.name}\n`);

        const candidates = await candidatesFor(venue);
        if (!candidates.length) {
            console.log('  (no Commons file whose title mentions this venue)');
            missing.push(venue.name);
            continue;
        }

        candidates.forEach((f, i) => {
            console.log(
                `  ${i === 0 ? '->' : '  '} ${f.width}x${f.height}  ${f.title}\n` +
                    `     ${f.licence} · ${f.author}\n     ${f.descriptionUrl}`
            );
        });

        const pick = candidates[0];
        const ext = pick.mime === 'image/png' ? 'png' : 'jpg';
        const rel = `assets/venues/${slug}.${ext}`;
        const dest = path.join(ROOT, rel);

        if (!DOWNLOAD) {
            found.push({ venue: venue.name, rel, pick });
            continue;
        }
        if ((await exists(dest)) && !FORCE) {
            console.log(`     kept existing ${rel} (pass --force to replace)`);
            found.push({ venue: venue.name, rel, pick });
            continue;
        }

        try {
            const bytes = await download(pick, dest);
            console.log(`     saved ${rel} (${Math.round(bytes / 1024)} KB, ${pick.scaledWidth}px wide)`);
            found.push({ venue: venue.name, rel, pick });
            credits.push(
                `- **${venue.name}** — \`${rel}\`\n` +
                    `  - ${pick.title}\n` +
                    `  - Licence: ${pick.licence}\n` +
                    `  - Author: ${pick.author}\n` +
                    `  - Source: ${pick.descriptionUrl}`
            );
        } catch (err) {
            console.warn(`     ! download failed: ${err.message}`);
            missing.push(venue.name);
        }
    }

    if (DOWNLOAD && credits.length) {
        const header =
            '# Venue photo credits\n\n' +
            'Generated by `tools/fetch-venue-photos.mjs`. Every file below comes from\n' +
            'Wikimedia Commons under the licence named against it. Several Commons\n' +
            'licences (CC BY, CC BY-SA) require that the author is credited wherever\n' +
            'the photo is shown, so keep this file in step with what the site ships.\n\n';
        const previous = (await exists(CREDITS)) ? await readFile(CREDITS, 'utf8') : '';
        const body = previous.includes('# Venue photo credits')
            ? previous.trimEnd() + '\n' + credits.join('\n') + '\n'
            : header + credits.join('\n') + '\n';
        await writeFile(CREDITS, body);
        console.log(`\nWrote ${credits.length} credit entr${credits.length === 1 ? 'y' : 'ies'} to ${path.relative(ROOT, CREDITS)}`);
    }

    if (APPLY && DOWNLOAD && found.length) {
        let src = await readFile(VENUES_JS, 'utf8');
        let patched = 0;
        for (const { venue, rel } of found) {
            // Anchor on the venue's own name, then rewrite the image line that
            // closes its object — the same anchor the data was written with.
            const anchor = `name: ${JSON.stringify(venue)}`;
            const at = src.indexOf(anchor);
            if (at === -1) continue;
            const imageAt = src.indexOf('image:', at);
            if (imageAt === -1) continue;
            const eol = src.indexOf('\n', imageAt);
            const line = src.slice(imageAt, eol);
            const replacement = `image: ${JSON.stringify(rel)}${line.trimEnd().endsWith(',') ? ',' : ''}`;
            src = src.slice(0, imageAt) + replacement + src.slice(eol);
            patched += 1;
        }
        await writeFile(VENUES_JS, src);
        console.log(`Patched ${patched} image field(s) in js/venues.js`);
    }

    console.log('\n----');
    console.log(`matched: ${found.length}`);
    if (missing.length) {
        console.log(`no match (${missing.length}): ${missing.join(', ')}`);
        console.log('These need a photo from somewhere else — the venue owner, your own camera, or a stock licence.');
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
