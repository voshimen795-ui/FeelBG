'use strict';

/**
 * FeelBG hero reserve CTA.
 *
 * The button itself needs no JS — it carries [data-venue-browser], so
 * js/reserve-picker.js opens the full picker on click. This file adds the
 * three things that need real data or a pointer:
 *
 *   1. the live count on the pill's shoulder, taken from the same venue list
 *      the picker reads, so the number can never claim more than it can book;
 *   2. the rail of top-rated venues under the button, where one click books
 *      that venue directly instead of going through the picker;
 *   3. the pointer behaviour — magnetic drift, 3D tilt, a specular highlight
 *      that follows the cursor, and the spark burst on press.
 *
 * Everything in (3) is written as custom properties on the button and is
 * skipped entirely for coarse pointers and for prefers-reduced-motion.
 */
(function () {
    var RAIL_SIZE = 5;
    // Both of these are places you book a table at. Cafes are walk-in and
    // attractions cannot be reserved at all — the picker draws the same line.
    var BOOKABLE = ['restaurants', 'nightlife'];
    var MAGNET_RADIUS = 110;
    var MAGNET_PULL = 0.24;
    var MAGNET_MAX = 11;
    var TILT_MAX = 7;

    function t(key) {
        var translations = window.FEELBG_TRANSLATIONS || {};
        var langCode = 'en';
        try {
            var stored = localStorage.getItem('feelbg_language');
            if (stored) langCode = JSON.parse(stored).code || 'en';
        } catch (err) { /* corrupted storage — fall back to English */ }
        var lang = translations[langCode] || {};
        var fallback = translations.en || {};
        if (key in lang) return lang[key];
        if (key in fallback) return fallback[key];
        return '';
    }

    function bookableVenues() {
        var db = window.FEELBG_VENUES || {};
        var out = [];
        BOOKABLE.forEach(function (cat) {
            (db[cat] || []).forEach(function (v) {
                out.push({
                    name: v.name,
                    slug: v.slug || '',
                    image: v.image || '',
                    rating: v.rating || 0,
                    icon: cat === 'nightlife' ? 'fa-glass-cheers' : 'fa-utensils'
                });
            });
        });
        out.sort(function (a, b) { return b.rating - a.rating; });
        return out;
    }

    function clamp(value, max) {
        return Math.max(-max, Math.min(max, value));
    }

    function renderCount(countEl, venues) {
        if (!countEl) return;
        if (!venues.length) {
            countEl.hidden = true;
            return;
        }
        countEl.hidden = false;
        countEl.innerHTML = '<span class="reserve-cta__dot" aria-hidden="true"></span>' + venues.length;
        var label = t('reserve.liveCount').replace('{n}', venues.length);
        if (label) countEl.setAttribute('aria-label', label);
    }

    function renderRail(rail, venues) {
        if (!rail) return;
        if (venues.length < 2) {
            rail.hidden = true;
            return;
        }
        rail.hidden = false;

        var caption = document.createElement('p');
        caption.className = 'reserve-cta__rail-caption';
        caption.textContent = t('reserve.quickPick');

        var row = document.createElement('div');
        row.className = 'reserve-cta__venues';

        venues.slice(0, RAIL_SIZE).forEach(function (venue, i) {
            var chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'reserve-cta__venue';
            chip.style.setProperty('--i', i);
            chip.setAttribute('aria-label', t('reserve.reserveBtn') + ' — ' + venue.name);

            var thumb = document.createElement('span');
            thumb.className = 'reserve-cta__venue-thumb';
            if (venue.image) {
                var img = document.createElement('img');
                img.src = venue.image;
                img.alt = '';
                // Not loading="lazy": css/mobile-optimized.css holds every
                // lazy image at opacity 0 until the observer in
                // js/mobile-interactions.js marks it .loaded, and that
                // observer only ever sees the images present at load. These
                // five are built later — and they are in the hero anyway.
                // A missing photograph leaves the medallion with its category
                // icon rather than a broken-image frame.
                img.addEventListener('error', function () {
                    thumb.innerHTML = '<i class="fas ' + venue.icon + '"></i>';
                });
                thumb.appendChild(img);
            } else {
                thumb.innerHTML = '<i class="fas ' + venue.icon + '"></i>';
            }

            var name = document.createElement('span');
            name.className = 'reserve-cta__venue-name';
            name.textContent = venue.name;

            chip.appendChild(thumb);
            chip.appendChild(name);
            chip.addEventListener('click', function () {
                if (window.bookingChatbot) window.bookingChatbot.open(venue.name, venue.slug);
            });
            row.appendChild(chip);
        });

        rail.replaceChildren(caption, row);
    }

    function burst(cta, btn, event) {
        var face = btn.querySelector('.reserve-cta__face');
        var faceBox = face.getBoundingClientRect();

        var ripple = document.createElement('span');
        ripple.className = 'reserve-cta__ripple';
        ripple.style.left = (event.clientX - faceBox.left) + 'px';
        ripple.style.top = (event.clientY - faceBox.top) + 'px';
        ripple.addEventListener('animationend', function () { this.remove(); });
        face.appendChild(ripple);

        var ctaBox = cta.getBoundingClientRect();
        for (var i = 0; i < 12; i++) {
            var angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
            var distance = 46 + Math.random() * 46;
            var spark = document.createElement('span');
            spark.className = 'reserve-cta__spark';
            spark.style.left = (event.clientX - ctaBox.left) + 'px';
            spark.style.top = (event.clientY - ctaBox.top) + 'px';
            spark.style.setProperty('--spark-x', (Math.cos(angle) * distance).toFixed(1) + 'px');
            spark.style.setProperty('--spark-y', (Math.sin(angle) * distance).toFixed(1) + 'px');
            spark.addEventListener('animationend', function () { this.remove(); });
            cta.appendChild(spark);
        }
    }

    function release(btn) {
        // Dropping the class hands the button back to its long springy
        // transition, so it drifts home rather than snapping.
        btn.classList.remove('is-tracking');
        ['--pull-x', '--pull-y', '--tilt-x', '--tilt-y', '--mx', '--my'].forEach(function (prop) {
            btn.style.removeProperty(prop);
        });
    }

    function bindPointer(cta, btn) {
        cta.addEventListener('mousemove', function (e) {
            var box = btn.getBoundingClientRect();
            var dx = e.clientX - (box.left + box.width / 2);
            var dy = e.clientY - (box.top + box.height / 2);
            // Distance to the button's edge rather than its centre, so the
            // magnet reaches the same amount past every side of it.
            var reach = Math.hypot(
                Math.max(0, Math.abs(dx) - box.width / 2),
                Math.max(0, Math.abs(dy) - box.height / 2)
            );
            if (reach > MAGNET_RADIUS) {
                release(btn);
                return;
            }
            btn.classList.add('is-tracking');
            btn.style.setProperty('--pull-x', clamp(dx * MAGNET_PULL, MAGNET_MAX).toFixed(1) + 'px');
            btn.style.setProperty('--pull-y', clamp(dy * MAGNET_PULL, MAGNET_MAX).toFixed(1) + 'px');
            btn.style.setProperty('--tilt-y', clamp((dx / (box.width / 2)) * TILT_MAX, TILT_MAX).toFixed(2) + 'deg');
            btn.style.setProperty('--tilt-x', clamp((-dy / (box.height / 2)) * TILT_MAX, TILT_MAX).toFixed(2) + 'deg');
            btn.style.setProperty('--mx', (((e.clientX - box.left) / box.width) * 100).toFixed(1) + '%');
            btn.style.setProperty('--my', (((e.clientY - box.top) / box.height) * 100).toFixed(1) + '%');
        });

        cta.addEventListener('mouseleave', function () {
            release(btn);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var cta = document.querySelector('[data-reserve-cta]');
        if (!cta) return;

        var btn = cta.querySelector('.reserve-cta__btn');
        var countEl = cta.querySelector('[data-reserve-count]');
        var rail = cta.querySelector('[data-reserve-rail]');
        var venues = bookableVenues();

        renderCount(countEl, venues);
        // The rail is a hover affordance, so it is only built where there is
        // a hover to build it for — matching the media query that hides it.
        var wide = window.matchMedia('(hover: hover) and (min-width: 768px)');
        if (wide.matches) renderRail(rail, venues);

        document.addEventListener('feelbg:languageChanged', function () {
            renderCount(countEl, venues);
            if (wide.matches) renderRail(rail, venues);
        });

        var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (fine && !still) {
            bindPointer(cta, btn);
            btn.addEventListener('pointerdown', function (e) { burst(cta, btn, e); });
        }
    });
}());
