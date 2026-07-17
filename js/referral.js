'use strict';

/**
 * FeelBG referral attribution: generates a per-venue referral code, keeps a
 * local event log, and (optionally) forwards each event to a logging
 * endpoint you deploy yourself — see referral-backend/README.md. With no
 * endpoint configured the system still works end-to-end (codes, WhatsApp
 * prefill, voucher), it just isn't aggregated across devices.
 */
(function () {
    var STORAGE_KEY = 'feelbg_referrals';
    var CODE_TTL_MS = 24 * 60 * 60 * 1000;
    var ENDPOINT = window.FEELBG_REFERRAL_LOG_ENDPOINT || '';

    function shortVenueCode(venueName) {
        var words = (venueName || 'VEN').toUpperCase().replace(/[^A-Z0-9 ]/g, '').split(/\s+/).filter(Boolean);
        var code;
        if (words.length >= 2) code = words.map(function (w) { return w[0]; }).join('').slice(0, 3);
        else code = (words[0] || 'VEN').slice(0, 3);
        while (code.length < 3) code += 'X';
        return code;
    }

    function randomSuffix() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I ambiguity
        var s = '';
        for (var i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
        return s;
    }

    function readLog() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; }
    }

    function writeLog(log) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(-500))); } catch (e) { /* storage full/blocked — non-fatal */ }
    }

    function sendToServer(row) {
        if (!ENDPOINT) return;
        try {
            fetch(ENDPOINT, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(row)
            }).catch(function () { /* offline/blocked — the local log still has it */ });
        } catch (e) { /* ignore */ }
    }

    function appendRow(row) {
        var log = readLog();
        log.push(row);
        writeLog(log);
        sendToServer(row);
        return row;
    }

    var ACTIVE_SCAN_KEY = 'feelbg_active_ref_code';

    // A venue QR code / shared link points at any FeelBG page with
    // ?ref=CODE. On arrival we log the scan and hold the code for this
    // browser so that if a booking completes during the same visit, it's
    // attributed to the code the visitor actually scanned in front of the
    // venue rather than minting a fresh one.
    function captureScannedCode() {
        try {
            var params = new URLSearchParams(window.location.search);
            var code = params.get('ref');
            if (!code) return;
            appendRow({ code: code, venue: '', action: 'qr_scan', ts: Date.now() });
            sessionStorage.setItem(ACTIVE_SCAN_KEY, code);
        } catch (e) { /* ignore */ }
    }

    function consumeScannedCode() {
        try {
            var code = sessionStorage.getItem(ACTIVE_SCAN_KEY);
            if (code) sessionStorage.removeItem(ACTIVE_SCAN_KEY);
            return code;
        } catch (e) { return null; }
    }

    var FeelBGReferral = {
        hasEndpoint: !!ENDPOINT,

        // Returns an existing code for this venue if one was generated in the
        // last 24h (so re-opening the chat mid-visit doesn't mint a new code
        // every time). If the visitor arrived via a venue QR/share link this
        // visit, that scanned code is reused instead so attribution carries
        // through. Otherwise mints and logs a new one.
        getOrCreateCode: function (venueName) {
            var scanned = consumeScannedCode();
            if (scanned) {
                appendRow({ code: scanned, venue: venueName || '', action: 'code_generated', ts: Date.now() });
                return scanned;
            }
            var log = readLog();
            for (var i = log.length - 1; i >= 0; i--) {
                var r = log[i];
                if (r.venue === venueName && r.code && (Date.now() - r.ts) < CODE_TTL_MS) return r.code;
            }
            var code = 'FBG-' + shortVenueCode(venueName) + '-' + randomSuffix();
            appendRow({ code: code, venue: venueName || '', action: 'code_generated', ts: Date.now() });
            return code;
        },

        track: function (action, venueName, code) {
            return appendRow({ code: code || '', venue: venueName || '', action: action, ts: Date.now() });
        },

        buildWhatsAppMessage: function (baseMessage, code) {
            return baseMessage + '\nReferral code: ' + code + ' (via FeelBG)';
        },

        // The URL to encode into a printable/scannable QR code for a venue —
        // any free QR generator can turn this into an image to print and
        // display at the venue's entrance or till.
        getShareLink: function (venueName) {
            var code = this.getOrCreateCode(venueName);
            return window.location.origin + window.location.pathname + '?ref=' + encodeURIComponent(code);
        },

        getLog: function () { return readLog(); },

        // Groups the local log into { "Venue Name": { "2026-07": { generated, whatsapp, directions } } }
        summarizeByVenueMonth: function () {
            var log = readLog();
            var out = {};
            log.forEach(function (r) {
                if (!r.venue) return;
                var month = new Date(r.ts).toISOString().slice(0, 7);
                out[r.venue] = out[r.venue] || {};
                out[r.venue][month] = out[r.venue][month] || { code_generated: 0, whatsapp_booking_initiated: 0, directions_clicked: 0, voucher_viewed: 0 };
                if (out[r.venue][month][r.action] !== undefined) out[r.venue][month][r.action]++;
            });
            return out;
        }
    };

    window.FeelBGReferral = FeelBGReferral;
    captureScannedCode();

    // Wire the "Directions" outbound action on every place card + the venue
    // detail modal's route button to carry a referral code, same as the
    // WhatsApp booking flow already does.
    document.addEventListener('click', function (e) {
        var directionsBtn = e.target.closest('.btn-directions');
        if (directionsBtn) {
            var card = directionsBtn.closest('.place-card');
            var lat = card && card.dataset.lat;
            var lng = card && card.dataset.lng;
            var name = card ? (card.dataset.name || (card.querySelector('.place-card__title') || {}).textContent || '') : '';
            name = name.trim();
            if (lat && lng) {
                var code = FeelBGReferral.getOrCreateCode(name);
                FeelBGReferral.track('directions_clicked', name, code);
                window.open('https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng, '_blank', 'noopener');
            }
            return;
        }
        var routeBtn = e.target.closest('.detail-modal__route-btn');
        if (routeBtn) {
            var routeName = routeBtn.dataset.routeName || '';
            var routeCode = FeelBGReferral.getOrCreateCode(routeName);
            FeelBGReferral.track('directions_clicked', routeName, routeCode);
        }
    });
})();
