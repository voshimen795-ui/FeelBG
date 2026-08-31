'use strict';

/**
 * The only server-side code in FeelBG, and it exists for one reason: a password
 * has to be checked somewhere the visitor cannot read.
 *
 * The rest of the site is static files. /partner-report.html showed what that
 * costs — it "protects" the log with FEELBG_REFERRAL_DASHBOARD_KEY, a constant
 * shipped inside a .js file that every visitor downloads, so anyone who opens
 * devtools can read the whole referral log. This endpoint keeps all three
 * secrets (the password, the Apps Script URL and its key) on the server; the
 * browser only ever sends a password and receives already-aggregated counts.
 *
 * Environment variables, set in the Vercel dashboard:
 *   ADMIN_PASSWORD           required — what /admin/ asks for
 *   FEELBG_SHEETS_ENDPOINT   the Apps Script /exec URL (referral-backend/)
 *   FEELBG_SHEETS_KEY        the DASHBOARD_KEY constant from Code.gs
 *
 * Vercel picks this up automatically: any /api/*.js file becomes a function,
 * with no build step and no change to vercel.json.
 */

const VENUES = require('../js/venues.js');

/** Events that count as a click through to the venue, and their column names. */
const CLICK_ACTIONS = {
    reserve_clicked: 'reserve',
    phone_clicked: 'phone',
    website_clicked: 'website',
    directions_clicked: 'maps',
};

/**
 * Compare without leaking the answer through timing.
 *
 * Overkill for a two-person dashboard, but it costs four lines and the
 * alternative is explaining one day why `===` was fine.
 */
function safeEqual(a, b) {
    const x = String(a);
    const y = String(b);
    if (x.length !== y.length) return false;
    let diff = 0;
    for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
    return diff === 0;
}

/** Venue metadata, so venues with no events yet still appear in the table. */
function venueIndex() {
    const out = new Map();
    for (const [type, list] of Object.entries(VENUES)) {
        for (const v of list) {
            out.set(v.slug, { id: v.slug, name: v.name, area: v.area, type });
        }
    }
    return out;
}

/**
 * Group rows into exactly what the dashboard draws.
 *
 * Aggregating here rather than shipping raw rows keeps the response small and
 * means no individual event — with its timestamp and language — ever leaves the
 * server. The dashboard gets counts, which is all it displays anyway.
 */
function aggregate(rows, days) {
    const cutoff = days > 0 ? Date.now() - days * 86400000 : 0;
    const meta = venueIndex();

    const byVenue = new Map();
    const byDay = new Map();
    const sources = new Map();
    const devices = new Map();
    const langs = new Map();
    const bump = (map, key) => { if (key) map.set(key, (map.get(key) || 0) + 1); };

    const blank = (id, name) => ({
        id,
        name: name || id,
        area: '',
        type: '',
        views: 0,
        clicks: 0,
        reserve: 0, phone: 0, website: 0, maps: 0,
    });

    for (const r of rows) {
        if (!r || typeof r.ts !== 'number' || r.ts < cutoff) continue;

        // Rows written before venue ids existed only have the display name.
        // Falling back to it keeps that history visible instead of bucketing
        // it all under one blank key.
        const id = r.venueId || r.venue || '';
        if (!id) continue;

        if (!byVenue.has(id)) {
            const m = meta.get(id);
            const entry = blank(id, m ? m.name : r.venue);
            if (m) { entry.area = m.area; entry.type = m.type; }
            byVenue.set(id, entry);
        }
        const v = byVenue.get(id);

        const day = new Date(r.ts).toISOString().slice(0, 10);
        if (!byDay.has(day)) byDay.set(day, { date: day, views: 0, clicks: 0 });

        if (r.action === 'venue_view') {
            v.views++;
            byDay.get(day).views++;
        } else if (CLICK_ACTIONS[r.action]) {
            v[CLICK_ACTIONS[r.action]]++;
            v.clicks++;
            byDay.get(day).clicks++;
        } else {
            continue; // referral bookkeeping (code_generated etc.) isn't traffic
        }

        bump(sources, r.source);
        bump(devices, r.device);
        bump(langs, r.lang);
    }

    // Venues with no events at all still belong in the table — "nobody has ever
    // clicked this one" is a finding, and hiding it makes the list look
    // healthier than it is.
    for (const [id, m] of meta) {
        if (!byVenue.has(id)) {
            const entry = blank(id, m.name);
            entry.area = m.area;
            entry.type = m.type;
            byVenue.set(id, entry);
        }
    }

    const venues = [...byVenue.values()].map((v) => ({
        ...v,
        // Share of people who looked at the venue and then went to it.
        conversion: v.views > 0 ? v.clicks / v.views : null,
    }));

    const pairs = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ key: k, n }));

    return {
        venues,
        daily: [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)),
        sources: pairs(sources),
        devices: pairs(devices),
        langs: pairs(langs),
        totals: {
            views: venues.reduce((s, v) => s + v.views, 0),
            clicks: venues.reduce((s, v) => s + v.clicks, 0),
            venuesWithActivity: venues.filter((v) => v.views || v.clicks).length,
            venuesTotal: venues.length,
        },
    };
}

async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ ok: false, error: 'method_not_allowed' });
    }

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

    const endpoint = process.env.FEELBG_SHEETS_ENDPOINT || '';
    const key = process.env.FEELBG_SHEETS_KEY || '';
    if (!endpoint) {
        // Correct password, nowhere to read from. Say so plainly rather than
        // rendering an empty dashboard that looks like "no traffic yet".
        return res.status(200).json({
            ok: true,
            configured: false,
            detail: 'FEELBG_SHEETS_ENDPOINT is not set — deploy referral-backend/Code.gs and add the URL.',
            ...aggregate([], 0),
        });
    }

    const days = Math.min(Math.max(parseInt(body.days, 10) || 30, 1), 365);

    try {
        const url = endpoint + (endpoint.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(key);
        const upstream = await fetch(url, { redirect: 'follow' });
        const data = await upstream.json();
        if (!data || !data.ok) {
            return res.status(502).json({ ok: false, error: 'upstream', detail: (data && data.error) || 'unreadable' });
        }
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ ok: true, configured: true, days, ...aggregate(data.rows || [], days) });
    } catch (err) {
        return res.status(502).json({ ok: false, error: 'upstream_unreachable', detail: String(err && err.message || err) });
    }
}

/* Vercel takes the module's default export as the function, so that has to be
   the handler itself. `aggregate` rides along as a property purely so it can be
   exercised directly in a test — it holds all the real logic here, and it is
   much easier to trust when it can be run against known rows. */
module.exports = handler;
module.exports.aggregate = aggregate;
