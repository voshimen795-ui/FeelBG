'use strict';

/* ============================================
   HERO VENUE SEARCH

   Typing a venue name and submitting opens that venue's reservation
   popup directly (the booking chatbot, already loaded on this page).

   Matching is deliberately forgiving — exact name, then "starts with",
   then "contains", all diacritic- and case-insensitive — because the hero
   is where someone types "zlatni" rather than "Zlatni Bokal".

   Reads window.FEELBG_VENUES, the same source the category pages and the
   card stack use. venues.js is a blocking script and this one is
   deferred, so the data is always in place by the time this runs.
   ============================================ */

(function () {
    function normalise(value) {
        return String(value || '')
            .toLowerCase()
            .normalize('NFD')
            // U+0300-U+036F: combining marks left behind by NFD, so
            // "Kafići" matches "kafici". Written as escapes rather than
            // literal marks so the file's encoding can't corrupt them.
            .replace(/[̀-ͯ]/g, '')
            .replace(/[đĐ]/g, 'd')   // đ / Đ: NFD does not decompose these
            .trim();
    }

    function allVenues() {
        var data = window.FEELBG_VENUES || {};
        var out = [];
        ['restaurants', 'cafes', 'nightlife', 'attractions'].forEach(function (type) {
            (data[type] || []).forEach(function (venue) {
                if (venue && venue.name) out.push(venue);
            });
        });
        return out;
    }

    function findVenue(query) {
        var q = normalise(query);
        if (!q) return null;

        var venues = allVenues();
        var exact = null;
        var startsWith = null;
        var contains = null;

        venues.forEach(function (venue) {
            var name = normalise(venue.name);
            if (!exact && name === q) exact = venue;
            if (!startsWith && name.indexOf(q) === 0) startsWith = venue;
            if (!contains && name.indexOf(q) !== -1) contains = venue;
            // Cuisine is a useful fallback: "japanese" should find Sakura.
            if (!contains && normalise(venue.cuisineLabel).indexOf(q) !== -1) contains = venue;
        });

        return exact || startsWith || contains;
    }

    function t(key, fallback) {
        var translations = window.FEELBG_TRANSLATIONS || {};
        var code = 'en';
        try {
            var stored = localStorage.getItem('feelbg_language');
            if (stored) code = JSON.parse(stored).code || 'en';
        } catch (e) { /* storage blocked */ }
        var lang = translations[code] || {};
        var en = translations.en || {};
        return lang[key] || en[key] || fallback;
    }

    function init() {
        var form = document.getElementById('hero-search');
        if (!form) return;

        var input = document.getElementById('hero-search-input');
        var hint = document.getElementById('hero-search-hint');
        var list = document.getElementById('hero-search-venues');

        // Native autocomplete off the real venue list, so most people never
        // have to guess at a spelling in the first place.
        if (list) {
            allVenues().forEach(function (venue) {
                var option = document.createElement('option');
                option.value = venue.name;
                list.appendChild(option);
            });
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (hint) hint.textContent = '';

            var venue = findVenue(input.value);

            if (venue && window.bookingChatbot) {
                window.bookingChatbot.open(venue.name);
                input.value = '';
                return;
            }

            // Nothing matched: fall back to the venue browser rather than
            // leaving the visitor at a dead end.
            if (window.reservePicker) {
                window.reservePicker.open();
                return;
            }

            if (hint) {
                hint.textContent = t('heroSearch.noMatch', 'No venue found — try a name like "Zlatni Bokal".');
            }
        });

        // Clear a stale "not found" message as soon as they start retyping.
        input.addEventListener('input', function () {
            if (hint && hint.textContent) hint.textContent = '';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
