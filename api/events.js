'use strict';

/**
 * Club events — the "live tonight / upcoming" text on a nightlife venue's
 * popup (see clubEvents() in js/pages.js).
 *
 * There is no reliable public API for Belgrade club listings: Resident
 * Advisor (the one platform that actually covers this scene) publishes no
 * developer API, only unofficial third-party scrapers that break its terms
 * and can stop working without notice; the touring-artist and ticketing
 * APIs that do exist (Bandsintown, Ticketmaster) either need a partnership
 * agreement or don't cover Serbia. So instead of scraping anything, this is
 * the FeelBG team's own text, typed once per event in /admin/events.html.
 *
 * Storage is a single JSON array kept in a Redis-compatible key-value store
 * reached over its REST API — no separate service to deploy, no key to type
 * in by hand. In the Vercel dashboard: Storage tab -> Create Database ->
 * Upstash for Redis -> Connect to Project. Vercel writes the env vars below
 * into the project itself; nothing to copy-paste.
 *
 * Split the same way as api/admin.js: GET is public and unauthenticated —
 * it's what every nightlife popup on the site reads, and it carries nothing
 * sensitive — POST is gated behind the same ADMIN_PASSWORD the traffic
 * dashboard uses.
 *
 * Environment variables:
 *   ADMIN_PASSWORD    required for POST — same one /admin/ already uses
 *   KV_REST_API_URL / KV_REST_API_TOKEN
 *     -or- UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *     whichever pair the Storage integration writes; both names are
 *     accepted so it works regardless of which one Vercel picks.
 *
 * Vercel picks this up automatically: any /api/*.js file becomes a function,
 * with no build step and no change to vercel.json.
 */

const STORE_KEY = 'feelbg:events';

/** Longest string accepted in a short field vs. a description — same limits
 *  the old Apps Script backend enforced, kept here now that this is the only
 *  place events get written. */
const MAX_SHORT = 120;
const MAX_LONG = 300;

function clean(value, max) {
    return String(value == null ? '' : value).slice(0, max || MAX_SHORT);
}

/**
 * Compare without leaking the answer through timing. Same helper as
 * api/admin.js — small enough that sharing it isn't worth a shared module.
 */
function safeEqual(a, b) {
    const x = String(a);
    const y = String(b);
    if (x.length !== y.length) return false;
    let diff = 0;
    for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
    return diff === 0;
}

/** Local date as YYYY-MM-DD, which is also how admin/events.html's <input
 *  type="date"> writes the date field — so these compare correctly as plain
 *  strings, no parsing needed. */
function todayIso() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function kvConfig() {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
    return { url: url.replace(/\/+$/, ''), token };
}

/** Reads the one JSON blob every event lives in. An unconfigured store and
 *  an empty-so-far store look the same to callers except for `configured`,
 *  same distinction the old endpoint-based version made. */
async function readRows() {
    const { url, token } = kvConfig();
    if (!url || !token) return { configured: false, rows: [] };

    const resp = await fetch(`${url}/get/${STORE_KEY}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error((data && data.error) || 'kv_get_failed');

    let rows = [];
    if (data.result) {
        try { rows = JSON.parse(data.result) || []; } catch (e) { rows = []; }
    }
    return { configured: true, rows };
}

async function writeRows(rows) {
    const { url, token } = kvConfig();
    if (!url || !token) throw new Error('not_configured');

    const resp = await fetch(`${url}/set/${STORE_KEY}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' },
        body: JSON.stringify(rows),
    });
    const data = await resp.json();
    if (!resp.ok || data.result !== 'OK') throw new Error((data && data.error) || 'kv_set_failed');
}

/**
 * Stored rows -> what the public GET returns. A row with no venueSlug or
 * title is dropped rather than shown as a blank card.
 */
function upcomingEvents(rows) {
    const today = todayIso();
    return (rows || [])
        .filter((r) => r && r.active !== false && r.venueSlug && r.title && String(r.date) >= today)
        .sort((a, b) => String(a.date).localeCompare(String(b.date)))
        .map((r) => ({
            id: r.id, venueSlug: r.venueSlug, title: r.title, titleSr: r.titleSr || '',
            date: r.date, time: r.time || '', price: r.price || '',
            description: r.description || '', descriptionSr: r.descriptionSr || '',
            ticketUrl: r.ticketUrl || '',
        }));
}

async function handleGet(req, res) {
    try {
        const { configured, rows } = await readRows();
        if (!configured) {
            // No store connected yet: say so as an empty, valid list rather
            // than an error — every nightlife popup calls this, and none of
            // them should break because events haven't been set up.
            res.setHeader('Cache-Control', 'no-store');
            return res.status(200).json({ ok: true, configured: false, events: [] });
        }
        // Short public cache: this is read on every nightlife popup, and an
        // event list changes at most a few times a week.
        res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
        return res.status(200).json({ ok: true, configured: true, events: upcomingEvents(rows) });
    } catch (err) {
        return res.status(502).json({ ok: false, error: 'store_unreachable', detail: String(err && err.message || err) });
    }
}

async function handlePost(req, res) {
    const expected = process.env.ADMIN_PASSWORD || '';
    if (!expected) {
        return res.status(500).json({ ok: false, error: 'not_configured', detail: 'ADMIN_PASSWORD is not set' });
    }

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};

    if (!safeEqual(body.password || '', expected)) {
        return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    // The admin page's own listing: every row, active or not, past or
    // future, newest first — so retiring an event or checking what ran is
    // possible without opening the store directly. The public GET above is
    // a deliberately narrower view of the same data.
    if (body.op === 'list') {
        try {
            const { configured, rows } = await readRows();
            const events = rows
                .slice()
                .sort((a, b) => String(b.date).localeCompare(String(a.date)))
                .map((r) => ({
                    id: r.id, venueSlug: r.venueSlug, title: r.title, titleSr: r.titleSr || '',
                    date: r.date, time: r.time || '', price: r.price || '',
                    description: r.description || '', descriptionSr: r.descriptionSr || '',
                    ticketUrl: r.ticketUrl || '', active: r.active !== false,
                }));
            return res.status(200).json({ ok: true, configured, events });
        } catch (err) {
            return res.status(502).json({ ok: false, error: 'store_unreachable', detail: String(err && err.message || err) });
        }
    }

    let configured, rows;
    try {
        ({ configured, rows } = await readRows());
    } catch (err) {
        return res.status(502).json({ ok: false, error: 'store_unreachable', detail: String(err && err.message || err) });
    }
    if (!configured) {
        return res.status(500).json({ ok: false, error: 'not_configured', detail: 'No storage connected — in the Vercel dashboard, Storage tab, connect a Redis database to this project.' });
    }

    // The two things left the admin form can ask for: add one, or turn one
    // off. Nothing is ever deleted outright, so a mistaken deactivate is
    // reversible by hand (flip `active` back to true in the store).
    if (body.op === 'deactivate') {
        const targetId = clean(body.id);
        const row = rows.find((r) => String(r.id) === targetId);
        if (!row) return res.status(404).json({ ok: false, error: 'not_found' });
        row.active = false;
        try {
            await writeRows(rows);
            return res.status(200).json({ ok: true });
        } catch (err) {
            return res.status(502).json({ ok: false, error: 'store_unreachable', detail: String(err && err.message || err) });
        }
    }

    const ev = body.event || {};
    if (!ev.venueSlug || !ev.title || !ev.date) {
        return res.status(400).json({ ok: false, error: 'missing_fields', detail: 'Club, title and date are required.' });
    }
    const row = {
        id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
        venueSlug: clean(ev.venueSlug),
        title: clean(ev.title),
        titleSr: clean(ev.titleSr),
        date: clean(ev.date, 10),
        time: clean(ev.time, 40),
        price: clean(ev.price, 40),
        description: clean(ev.description, MAX_LONG),
        descriptionSr: clean(ev.descriptionSr, MAX_LONG),
        ticketUrl: clean(ev.ticketUrl, MAX_LONG),
        active: true,
        createdAt: new Date().toISOString(),
    };
    rows.push(row);
    try {
        await writeRows(rows);
        return res.status(200).json({ ok: true, id: row.id });
    } catch (err) {
        return res.status(502).json({ ok: false, error: 'store_unreachable', detail: String(err && err.message || err) });
    }
}

async function handler(req, res) {
    if (req.method === 'GET') return handleGet(req, res);
    if (req.method === 'POST') return handlePost(req, res);
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
}

module.exports = handler;
module.exports.upcomingEvents = upcomingEvents;
