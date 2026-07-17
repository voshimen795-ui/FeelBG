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

    function t(key) {
        var translations = window.FEELBG_TRANSLATIONS || {};
        var stored = localStorage.getItem('feelbg_language');
        var langCode = stored ? JSON.parse(stored).code : 'en';
        var lang = translations[langCode] || {};
        var fallback = translations['en'] || {};
        if (key in lang) return lang[key];
        if (key in fallback) return fallback[key];
        return key;
    }

    var ACTIVE_CODE_WINDOW_MS = 48 * 60 * 60 * 1000; // codes fall off the widget after 48h even if never redeemed

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
            refreshWidget();
            return code;
        },

        track: function (action, venueName, code) {
            var row = appendRow({ code: code || '', venue: venueName || '', action: action, ts: Date.now() });
            if (action === 'code_generated') refreshWidget();
            return row;
        },

        // A code counts as "active" (worth showing on the persistent badge)
        // until it's explicitly redeemed or it ages out.
        getActiveCodes: function () {
            var log = readLog();
            var redeemed = {};
            log.forEach(function (r) { if (r.action === 'code_redeemed' && r.code) redeemed[r.code] = true; });
            var seen = {};
            var active = [];
            for (var i = log.length - 1; i >= 0; i--) {
                var r = log[i];
                if (r.action !== 'code_generated' || !r.code || seen[r.code]) continue;
                seen[r.code] = true;
                if (redeemed[r.code]) continue;
                if ((Date.now() - r.ts) > ACTIVE_CODE_WINDOW_MS) continue;
                active.push({ code: r.code, venue: r.venue, ts: r.ts });
            }
            return active;
        },

        // Marks a code as used at the venue. This both stops it showing on
        // the badge and — if referral-backend is deployed — triggers an
        // owner email notification server-side (see referral-backend/Code.gs).
        markRedeemed: function (code, venueName) {
            appendRow({ code: code, venue: venueName || '', action: 'code_redeemed', ts: Date.now() });
            refreshWidget();
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
                out[r.venue][month] = out[r.venue][month] || { code_generated: 0, whatsapp_booking_initiated: 0, directions_clicked: 0, voucher_viewed: 0, code_redeemed: 0 };
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

    /* ============================================
       PERSISTENT REFERRAL BADGE
       A small gold circle stays on every page while the visitor holds
       an unredeemed code. Tapping it shows the code(s) again and lets
       them (or the venue) mark it redeemed, which closes the panel and
       — once referral-backend is deployed — emails the owner.
       ============================================ */
    var widgetEl = null;

    function injectWidgetStyles() {
        if (document.getElementById('feelbg-referral-widget-styles')) return;
        var style = document.createElement('style');
        style.id = 'feelbg-referral-widget-styles';
        style.textContent = `
#feelbg-referral-widget{position:fixed;bottom:90px;left:20px;z-index:98;font-family:'Poppins',sans-serif}
.frw-toggle{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#b8860b 0%,#ffd700 100%);color:#14204a;border:none;cursor:pointer;font-size:1.25rem;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(184,134,11,0.45);transition:transform .3s ease,box-shadow .3s ease;position:relative}
.frw-toggle:hover{transform:scale(1.08)}
.frw-toggle .frw-count{position:absolute;top:-4px;right:-4px;background:#1e3a8a;color:#fff;font-size:.68rem;font-weight:700;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #0a1128}
.frw-panel{position:absolute;bottom:64px;left:0;width:300px;max-width:88vw;background:linear-gradient(160deg,#0f1e4d 0%,#0a1128 100%);border:1px solid rgba(184,134,11,.3);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.4);opacity:0;transform:translateY(12px) scale(.95);pointer-events:none;transition:opacity .3s ease,transform .3s ease;overflow:hidden;max-height:70vh;display:flex;flex-direction:column}
.frw-panel.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
.frw-panel__header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);color:#fff;flex-shrink:0}
.frw-panel__title{font-weight:700;font-size:.85rem;text-transform:uppercase;letter-spacing:.06em}
.frw-panel__close{background:none;border:none;color:rgba(255,255,255,.8);font-size:1.3rem;cursor:pointer;line-height:1}
.frw-panel__close:hover{color:#fff}
.frw-list{overflow-y:auto;padding:10px}
.frw-item{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;margin-bottom:10px}
.frw-item:last-child{margin-bottom:0}
.frw-item__venue{font-family:'Playfair Display',serif;font-weight:700;color:#fff;font-size:.95rem;margin-bottom:6px}
.frw-item__code{font-weight:800;letter-spacing:.05em;font-size:1.15rem;background:linear-gradient(135deg,#b8860b 0%,#ffd700 100%);color:#14204a;border-radius:8px;padding:8px 10px;text-align:center;margin-bottom:6px}
.frw-item__date{font-size:.7rem;color:#9aa8cc;margin-bottom:10px}
.frw-item__redeem{width:100%;padding:9px;border:none;border-radius:8px;background:linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%);color:#fff;font-family:'Poppins',sans-serif;font-weight:600;font-size:.8rem;cursor:pointer;transition:filter .2s}
.frw-item__redeem:hover{filter:brightness(1.1)}
#frw-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;padding:12px 22px;border-radius:30px;font-family:'Poppins',sans-serif;font-weight:600;font-size:.85rem;box-shadow:0 10px 30px rgba(0,0,0,.35);z-index:100003;opacity:0;transition:opacity .3s ease,transform .3s ease;pointer-events:none}
#frw-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
@media(max-width:768px){#feelbg-referral-widget{bottom:80px;left:12px}}
`;
        document.head.appendChild(style);
    }

    function showToast(message) {
        var existing = document.getElementById('frw-toast');
        if (existing) existing.remove();
        var toast = document.createElement('div');
        toast.id = 'frw-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(function () { toast.classList.add('show'); });
        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () { toast.remove(); }, 300);
        }, 2600);
    }

    function renderPanelList(listEl) {
        var active = FeelBGReferral.getActiveCodes();
        listEl.innerHTML = active.map(function (item) {
            var dateStr = new Date(item.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            return '<div class="frw-item" data-code="' + item.code + '">' +
                '<div class="frw-item__venue">' + (item.venue || 'FeelBG') + '</div>' +
                '<div class="frw-item__code">' + item.code + '</div>' +
                '<div class="frw-item__date">' + t('referral.generatedLabel') + ': ' + dateStr + '</div>' +
                '<button class="frw-item__redeem" data-redeem-code="' + item.code + '" data-redeem-venue="' + (item.venue || '').replace(/"/g, '&quot;') + '">' + t('referral.redeemBtn') + '</button>' +
                '</div>';
        }).join('');
        listEl.querySelectorAll('[data-redeem-code]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                FeelBGReferral.markRedeemed(btn.dataset.redeemCode, btn.dataset.redeemVenue);
                showToast(t('referral.redeemedToast'));
                closePanel();
            });
        });
    }

    function closePanel() {
        if (!widgetEl) return;
        var panel = widgetEl.querySelector('.frw-panel');
        if (panel) panel.classList.remove('open');
    }

    function buildWidget() {
        injectWidgetStyles();
        var el = document.createElement('div');
        el.id = 'feelbg-referral-widget';
        el.innerHTML =
            '<button class="frw-toggle" id="frw-toggle" aria-label="' + t('referral.badgeLabel') + '"><i class="fas fa-ticket-alt"></i><span class="frw-count" id="frw-count"></span></button>' +
            '<div class="frw-panel" id="frw-panel">' +
            '<div class="frw-panel__header"><span class="frw-panel__title">' + t('referral.panelTitle') + '</span><button class="frw-panel__close" id="frw-panel-close" aria-label="Close">&times;</button></div>' +
            '<div class="frw-list" id="frw-list"></div>' +
            '</div>';
        document.body.appendChild(el);
        widgetEl = el;

        var toggle = el.querySelector('#frw-toggle');
        var panel = el.querySelector('#frw-panel');
        toggle.addEventListener('click', function () {
            var isOpen = panel.classList.toggle('open');
            if (isOpen) renderPanelList(el.querySelector('#frw-list'));
        });
        el.querySelector('#frw-panel-close').addEventListener('click', closePanel);
        document.addEventListener('click', function (e) {
            if (!el.contains(e.target)) closePanel();
        });
    }

    function refreshWidget() {
        var active = FeelBGReferral.getActiveCodes();
        if (!active.length) {
            if (widgetEl) { widgetEl.remove(); widgetEl = null; }
            return;
        }
        if (!widgetEl) buildWidget();
        var countEl = widgetEl.querySelector('#frw-count');
        countEl.textContent = active.length > 1 ? String(active.length) : '';
        countEl.style.display = active.length > 1 ? 'flex' : 'none';
        var panel = widgetEl.querySelector('.frw-panel');
        if (panel.classList.contains('open')) renderPanelList(widgetEl.querySelector('#frw-list'));
    }

    document.addEventListener('DOMContentLoaded', refreshWidget);
    document.addEventListener('feelbg:languageChanged', function () {
        if (widgetEl) { widgetEl.remove(); widgetEl = null; }
        refreshWidget();
    });
})();
