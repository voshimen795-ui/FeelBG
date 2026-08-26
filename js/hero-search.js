'use strict';

/* ============================================
   HERO VENUE SEARCH

   Typing filters the site's venues into a dropdown; picking one opens
   that venue's detail card (the same popup the category pages show).

   Matching is deliberately forgiving — exact name, then "starts with",
   then "contains", plus cuisine and neighbourhood — all case- and
   diacritic-insensitive, because the hero is where someone types
   "zlatni" or "kafici" rather than "Zlatni Bokal".

   Reads window.FEELBG_VENUES, the same source the category pages and the
   card stack use. venues.js is a blocking script and this one is
   deferred, so the data is always in place by the time this runs.
   ============================================ */

(function () {
    var MAX_RESULTS = 6;

    /* Singular keys, because that is what PlaceDetails.typeToPageType maps. */
    var TYPES = {
        restaurants: 'restaurant',
        cafes: 'cafe',
        nightlife: 'nightlife',
        attractions: 'attraction'
    };

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
        Object.keys(TYPES).forEach(function (key) {
            (data[key] || []).forEach(function (venue) {
                if (venue && venue.name) {
                    out.push({ venue: venue, type: TYPES[key] });
                }
            });
        });
        return out;
    }

    /* Ranked so the best match is first and can be selected with Enter
       alone: 0 exact, 1 name starts-with, 2 name contains, 3 cuisine or
       neighbourhood contains. */
    function search(query) {
        var q = normalise(query);
        if (!q) return [];

        var scored = [];
        allVenues().forEach(function (entry) {
            var name = normalise(entry.venue.name);
            var rank = -1;

            if (name === q) rank = 0;
            else if (name.indexOf(q) === 0) rank = 1;
            else if (name.indexOf(q) !== -1) rank = 2;
            else if (normalise(entry.venue.cuisineLabel).indexOf(q) !== -1) rank = 3;
            else if (normalise(entry.venue.area).indexOf(q) !== -1) rank = 3;

            if (rank !== -1) scored.push({ entry: entry, rank: rank });
        });

        scored.sort(function (a, b) { return a.rank - b.rank; });
        return scored.slice(0, MAX_RESULTS).map(function (s) { return s.entry; });
    }

    function init() {
        var form = document.getElementById('hero-search');
        if (!form) return;

        var input = document.getElementById('hero-search-input');
        var panel = document.getElementById('hero-search-results');
        if (!input || !panel) return;

        /* The hero clips its overflow (for the background video), which would
           cut the dropdown off a few pixels below the input. Moving the panel
           to <body> and positioning it fixed against the input's rect takes
           it out of that clipping context entirely. */
        document.body.appendChild(panel);

        function position() {
            // Measured against the form, not the input: the input sits inside
            // the bar's padding, so aligning to it would leave the dropdown
            // visibly narrower than the search bar above it.
            var r = form.getBoundingClientRect();
            panel.style.left = r.left + 'px';
            panel.style.width = r.width + 'px';
            panel.style.top = (r.bottom + 8) + 'px';
            // Never let the list run past the bottom of the window.
            panel.style.maxHeight = Math.max(120, window.innerHeight - r.bottom - 24) + 'px';
        }

        var results = [];
        var activeIndex = -1;

        function close() {
            panel.hidden = true;
            panel.innerHTML = '';
            results = [];
            activeIndex = -1;
            input.setAttribute('aria-expanded', 'false');
            input.removeAttribute('aria-activedescendant');
        }

        function setActive(index) {
            var items = panel.querySelectorAll('.hero-search__result');
            if (!items.length) return;
            if (index < 0) index = items.length - 1;
            if (index >= items.length) index = 0;
            activeIndex = index;
            items.forEach(function (item, i) {
                var on = i === index;
                item.classList.toggle('is-active', on);
                item.setAttribute('aria-selected', on ? 'true' : 'false');
            });
            input.setAttribute('aria-activedescendant', items[index].id);
            items[index].scrollIntoView({ block: 'nearest' });
        }

        /* Opens the venue's detail card — the same popup the category pages
           use. PlaceDetails is looked up at selection time rather than at
           init, so the load order of the two deferred scripts can't matter. */
        function choose(entry) {
            var details = window._placeDetailsInstance;
            close();
            input.value = '';
            if (details && typeof details.showDetailsForVenue === 'function') {
                var venue = {};
                Object.keys(entry.venue).forEach(function (k) { venue[k] = entry.venue[k]; });
                venue.type = entry.type;
                details.showDetailsForVenue(venue);
                return;
            }
            // pages.js missing for some reason — fall back to the browser
            // rather than swallowing the click.
            if (window.reservePicker) window.reservePicker.open();
        }

        function render(list) {
            results = list;
            activeIndex = -1;

            if (!list.length) {
                close();
                return;
            }

            panel.innerHTML = '';
            list.forEach(function (entry, i) {
                var item = document.createElement('button');
                item.type = 'button';
                item.className = 'hero-search__result';
                item.id = 'hero-search-result-' + i;
                item.setAttribute('role', 'option');
                item.setAttribute('aria-selected', 'false');

                var thumb = document.createElement('span');
                thumb.className = 'hero-search__result-thumb';
                if (entry.venue.image) {
                    thumb.style.backgroundImage = 'url("' + entry.venue.image.replace(/"/g, '\\"') + '")';
                }

                var text = document.createElement('span');
                text.className = 'hero-search__result-text';

                var name = document.createElement('span');
                name.className = 'hero-search__result-name';
                name.textContent = entry.venue.name;

                var meta = document.createElement('span');
                meta.className = 'hero-search__result-meta';
                meta.textContent = [entry.venue.cuisineLabel, entry.venue.area]
                    .filter(Boolean).join(' · ');

                text.appendChild(name);
                if (meta.textContent) text.appendChild(meta);
                item.appendChild(thumb);
                item.appendChild(text);

                // mousedown, not click: the input's blur would tear the panel
                // down before a click ever landed.
                item.addEventListener('mousedown', function (e) {
                    e.preventDefault();
                    choose(entry);
                });

                panel.appendChild(item);
            });

            panel.hidden = false;
            position();
            input.setAttribute('aria-expanded', 'true');
        }

        // Keep the fixed panel glued to the input while the page moves.
        ['scroll', 'resize', 'orientationchange'].forEach(function (evt) {
            window.addEventListener(evt, function () {
                if (!panel.hidden) position();
            }, { passive: true });
        });

        input.addEventListener('input', function () {
            render(search(input.value));
        });

        input.addEventListener('keydown', function (e) {
            if (panel.hidden) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive(activeIndex + 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive(activeIndex - 1);
            } else if (e.key === 'Escape') {
                close();
            }
        });

        input.addEventListener('focus', function () {
            if (input.value) render(search(input.value));
        });

        input.addEventListener('blur', function () {
            // Let a mousedown on a result run first.
            window.setTimeout(close, 120);
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            // Enter takes the highlighted result, or the best match.
            var entry = results[activeIndex >= 0 ? activeIndex : 0];
            if (entry) {
                choose(entry);
                return;
            }
            var best = search(input.value)[0];
            if (best) {
                choose(best);
                return;
            }
            if (window.reservePicker) window.reservePicker.open();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
