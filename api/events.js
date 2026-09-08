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
 * Split the same way as api/admin.js: GET is public and unauthenticated —
 * it's what every nightlife popup on the site reads, and it carries nothing
 * sensitive — POST is gated behind the same ADMIN_PASSWORD the traffic
 * dashboard uses. The Apps Script URL and its key never reach the browser
 * either way.
 *
 * Environment variables, set in the Vercel dashboard:
 *   ADMIN_PASSWORD          required for POST — same one /admin/ already uses
 *   FEELBG_EVENTS_ENDPOINT  the Apps Script /exec URL (events-backend/)
 *   FEELBG_EVENTS_KEY       the EVENTS_KEY constant from events-backend/Code.gs
 *
 * Vercel picks this up automatically: any /api/*.js file becomes a function,
 * with no build step and no change to vercel.json.
 */

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
 *  type="date"> and events-backend/Code.gs both write the Date column — so
 *  these compare correctly as plain strings, no parsing needed. */
function todayIso() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/**
 * Rows as the Apps Script hands them back -> what the public GET returns.
 *
 * Filtered here rather than in Code.gs, same division of labour as
 * api/admin.js's aggregate(): the script stays a dumb store, the shaping
 * happens in code that's easy to redeploy and easy to test. A row with no
 * venueSlug or title is dropped rather than shown as a blank card.
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

/** The one upstream call, shared by the public read and the admin list —
 *  the two differ only in how the rows get filtered afterwards. */
async function fetchRows() {
    const endpoint = process.env.FEELBG_EVENTS_ENDPOINT || '';
    if (!endpoint) return { configured: false, rows: [] };

    const key = process.env.FEELBG_EVENTS_KEY || '';
    const url = endpoint + (endpoint.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(key);
    const upstream = await fetch(url, { redirect: 'follow' });
    const data = await upstream.json();
    if (!data || !data.ok) throw new Error((data && data.error) || 'unreadable');
    return { configured: true, rows: data.rows || [] };
}

async function handleGet(req, res) {
    try {
        const { configured, rows } = await fetchRows();
        if (!configured) {
            // No backend deployed yet: say so as an empty, valid list rather
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
        return res.status(502).json({ ok: false, error: 'upstream', detail: String(err && err.message || err) });
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
    // possible without opening the spreadsheet. The public GET above is a
    // deliberately narrower view of the same data.
    if (body.op === 'list') {
        try {
            const { configured, rows } = await fetchRows();
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
            return res.status(502).json({ ok: false, error: 'upstream', detail: String(err && err.message || err) });
        }
    }

    const endpoint = process.env.FEELBG_EVENTS_ENDPOINT || '';
    const key = process.env.FEELBG_EVENTS_KEY || '';
    if (!endpoint) {
        return res.status(500).json({ ok: false, error: 'not_configured', detail: 'FEELBG_EVENTS_ENDPOINT is not set — deploy events-backend/Code.gs and add the URL.' });
    }

    // The two things left the admin form can ask for: add one, or turn one
    // off. Nothing is ever deleted outright, so a mistaken deactivate is
    // reversible by hand in the sheet.
    const isDeactivate = body.op === 'deactivate';
    const payload = isDeactivate
        ? { key, action: 'deactivate_event', id: String(body.id || '') }
        : { key, action: 'add_event', event: body.event || {} };

    try {
        const upstream = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await upstream.json();
        if (!data || !data.ok) {
            return res.status(502).json({ ok: false, error: (data && data.error) || 'upstream' });
        }
        return res.status(200).json({ ok: true, id: data.id });
    } catch (err) {
        return res.status(502).json({ ok: false, error: 'upstream_unreachable', detail: String(err && err.message || err) });
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
