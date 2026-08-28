'use strict';

/* ============================================
   VENUE CARD STACK

   A 3D coverflow of the site's actual venues, built on top of a native
   horizontal scroller.

   Why the two layers: the *input* is an ordinary `overflow-x: scroll`
   strip with `scroll-snap`. Touch swipe, trackpad, keyboard, momentum and
   the accessibility tree all come from the browser for free. The 3D cards
   are a separate, purely decorative layer (`pointer-events: none`,
   `aria-hidden`) that reads `scrollLeft` and transforms itself to match.

   Both layers are generated from window.FEELBG_VENUES, the same source
   the category pages render from, so adding a venue there puts it in the
   stack automatically — there is no second copy of the data to maintain.
   venues.js is a blocking script and this one is deferred, so the data is
   always in place by the time this runs.

   The transform maths is ported from the reference implementation the
   design came from.
   ============================================ */

(function () {
    var MAX_CARDS_ON_ONE_SIDE = 5;

    /* The page each collection belongs to. This is only the no-JS fallback
       target for the card's href — with JS the card opens the venue's detail
       popup instead (see openDetails). The visible "see all" link in the
       markup is what actually takes people to these pages. */
    var TYPE_PAGES = {
        restaurants: 'restaurants.html',
        cafes: 'cafes.html',
        nightlife: 'nightlife.html',
        attractions: 'attractions.html'
    };

    function prefersReducedMotion() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function t(key) {
        var translations = window.FEELBG_TRANSLATIONS || {};
        var code = 'en';
        try {
            var stored = localStorage.getItem('feelbg_language');
            if (stored) code = JSON.parse(stored).code || 'en';
        } catch (e) { /* storage blocked — fall back to English */ }
        var lang = translations[code] || {};
        var fallback = translations.en || {};
        if (key in lang) return lang[key];
        if (key in fallback) return fallback[key];
        return '';
    }

    function venueSlug(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    }

    /* Collect the venues across the listed types, keeping venues.js order.

       `cuisines` narrows an existing collection rather than requiring a new
       array in venues.js: museums, churches, parks and shopping centres are
       all attractions, distinguished only by venue.cuisine, so each of those
       stacks is a filtered view of the same list the attractions page
       renders. One source of truth, no duplicated venues. */
    function collectVenues(types, cuisines) {
        var data = window.FEELBG_VENUES || {};
        var out = [];
        types.forEach(function (type) {
            (data[type] || []).forEach(function (venue) {
                if (!venue || !venue.name) return;
                if (cuisines && cuisines.indexOf(venue.cuisine) === -1) return;
                out.push({ venue: venue, type: type });
            });
        });
        return out;
    }

    /* Opens the venue's own popup, the same one the category pages show.
       Returns false when the popup isn't available (js/pages.js not loaded,
       or it hasn't initialised yet) so the caller can let the link navigate
       to the category page instead of doing nothing at all. */
    function openDetails(entry) {
        var details = window._placeDetailsInstance;
        if (!details || typeof details.showDetailsForVenue !== 'function') return false;
        var venue = {};
        for (var key in entry.venue) {
            if (Object.prototype.hasOwnProperty.call(entry.venue, key)) venue[key] = entry.venue[key];
        }
        venue.type = entry.type;
        details.showDetailsForVenue(venue);
        return true;
    }

    function el(tag, className) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        return node;
    }

    /* One card's inner content. Used for both the real link and its
       decorative clone, so the two can never drift apart. */
    function buildBody(entry) {
        var venue = entry.venue;
        var slug = venueSlug(venue.name);

        var body = el('div', 'card-stack__body');

        var meta = el('div', 'card-stack__meta');
        if (venue.rating) {
            var rating = el('span', 'card-stack__rating');
            rating.innerHTML = '<i class="fas fa-star"></i> ' + venue.rating;
            meta.appendChild(rating);
        }
        if (venue.area) {
            var area = el('span', 'card-stack__area');
            area.textContent = venue.area;
            meta.appendChild(area);
        }
        if (meta.childNodes.length) body.appendChild(meta);

        var title = el('span', 'card-stack__title');
        title.textContent = venue.name;
        body.appendChild(title);

        /* The category label is translated through the same key the category
           pages use — a per-venue one where it exists, otherwise the shared
           label.* key — so it follows the language switch. data-i18n is what
           lets js/language-selector.js re-translate it in place. */
        var key = window.CardRenderer ? window.CardRenderer.cuisineKey(venue) : ('venue.' + slug + '.cuisine');
        var translated = key ? t(key) : '';
        var desc = el('span', 'card-stack__desc');
        if (translated) {
            desc.setAttribute('data-i18n', key);
            desc.textContent = translated;
        } else {
            desc.textContent = venue.cuisineLabel || '';
        }
        if (desc.textContent) body.appendChild(desc);

        return body;
    }

    function CardStack(root) {
        this.root = root;
        this.activeIndex = 0;
        this.globalScrollProgress = 0;
        this.visuals = [];
        this.dots = [];
        this.frame = null;

        var types = (root.dataset.venueTypes || 'restaurants,cafes,nightlife')
            .split(',')
            .map(function (s) { return s.trim(); })
            .filter(function (s) { return s in TYPE_PAGES; });

        var cuisines = root.dataset.venueCuisines
            ? root.dataset.venueCuisines.split(',').map(function (s) { return s.trim(); })
            : null;

        this.entries = collectVenues(types, cuisines);
        this.cardCount = this.entries.length;
        if (!this.cardCount) return;

        this.buildScroller();

        /* Reduced motion keeps the scroller and the real cards, and simply
           never builds the 3D layer. The section stays fully usable. */
        if (prefersReducedMotion() || this.cardCount < 2) return;

        this.buildVisuals();
        this.buildDots();
        this.bind();
        this.setPerspective();
        this.root.classList.add('card-stack--enhanced');
        this.update();
    }

    /* The real, scrollable, focusable links. This is the accessible layer. */
    CardStack.prototype.buildScroller = function () {
        var scroller = el('div', 'card-stack__scroller');

        this.links = this.entries.map(function (entry) {
            var link = el('a', 'card-stack__link');
            /* The href is the fallback: without JS the card is still a real
               link to the category page. With JS the click opens the venue's
               own popup instead — see the handler below. */
            link.href = TYPE_PAGES[entry.type];
            link.addEventListener('click', function (event) {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                if (openDetails(entry)) event.preventDefault();
            });

            var card = el('div', 'card-stack__card');
            if (entry.venue.image) {
                card.style.backgroundImage = 'url("' + entry.venue.image.replace(/"/g, '\\"') + '")';
            } else {
                /* No photograph for this venue yet — the card falls back to a
                   tinted panel rather than a blank rectangle. */
                card.classList.add('card-stack__card--no-photo');
                card.dataset.cuisine = entry.venue.cuisine || '';
                card.dataset.initial = entry.venue.name.charAt(0).toUpperCase();
            }
            card.appendChild(buildBody(entry));

            link.appendChild(card);
            scroller.appendChild(link);
            return link;
        });

        this.root.appendChild(scroller);
        this.scroller = scroller;
    };

    /* The decorative 3D layer: same content, cloned, hidden from assistive
       tech and never interactive. */
    CardStack.prototype.buildVisuals = function () {
        var layer = el('div', 'card-stack__visuals');
        layer.setAttribute('aria-hidden', 'true');

        this.links.forEach(function (link) {
            var card = link.querySelector('.card-stack__card');

            var visual = el('div', 'card-stack__visual');
            var inner = el('div', 'card-stack__visual-inner');
            if (card.style.backgroundImage) {
                inner.style.backgroundImage = card.style.backgroundImage;
            } else {
                inner.classList.add('card-stack__card--no-photo');
                inner.dataset.cuisine = card.dataset.cuisine || '';
                inner.dataset.initial = card.dataset.initial || '';
            }

            var body = link.querySelector('.card-stack__body');
            if (body) inner.appendChild(body.cloneNode(true));

            visual.appendChild(inner);
            layer.appendChild(visual);
            this.visuals.push(visual);
        }, this);

        this.root.appendChild(layer);
    };

    CardStack.prototype.buildDots = function () {
        var nav = el('div', 'card-stack__dots');
        nav.setAttribute('aria-hidden', 'true');

        this.links.forEach(function (link, i) {
            var dot = el('button', 'card-stack__dot');
            dot.type = 'button';
            dot.tabIndex = -1; // the links themselves are the keyboard path
            dot.addEventListener('click', function () { this.scrollToIndex(i); }.bind(this));
            nav.appendChild(dot);
            this.dots.push(dot);
        }, this);

        // Sibling, not child: .card-stack is sized by aspect-ratio, so a
        // child would overflow that box.
        this.root.insertAdjacentElement('afterend', nav);
    };

    CardStack.prototype.scrollToIndex = function (index) {
        var link = this.links[index];
        if (!link) return;
        this.scroller.scrollTo({
            left: link.offsetLeft - this.scroller.offsetLeft,
            behavior: 'smooth'
        });
    };

    CardStack.prototype.bind = function () {
        this.scroller.addEventListener('scroll', this.onScroll.bind(this), { passive: true });

        var resize = this.onResize.bind(this);
        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', resize);

        // The link is transparent in the enhanced state, so the focus ring
        // is drawn on the front card instead of being lost entirely.
        this.links.forEach(function (link) {
            link.addEventListener('focus', function () {
                this.root.classList.add('card-stack--focus');
            }.bind(this));
            link.addEventListener('blur', function () {
                this.root.classList.remove('card-stack--focus');
            }.bind(this));
        }, this);
    };

    /* Scroll fires far more often than frames are painted, so the work is
       coalesced into one rAF callback per frame. */
    CardStack.prototype.onScroll = function () {
        if (this.frame !== null) return;
        this.frame = window.requestAnimationFrame(function () {
            this.frame = null;
            this.readScroll();
            this.update();
        }.bind(this));
    };

    CardStack.prototype.onResize = function () {
        this.setPerspective();
        this.update();
    };

    /* Perspective AND depth both scale with the container width.

       Scaling only the perspective is not enough: a card pushed toward the
       viewer is magnified by perspective / (perspective - translateZ), so a
       fixed 200px depth against a width-derived perspective magnifies far
       more on a phone than on a desktop (measured 1.39x vs 1.10x), which is
       what made the card overflow its container on small screens. Deriving
       the depth from the same width keeps that ratio constant — 1.26x
       everywhere, the value the reference design was tuned at. */
    CardStack.prototype.setPerspective = function () {
        var width = this.root.clientWidth;
        if (!width) return;
        this.root.style.setProperty('--card-stack-perspective', (width * 2) + 'px');
        this.depthScale = width / 480; // 480px = the reference's container width
    };

    CardStack.prototype.readScroll = function () {
        var scrollable = this.scroller.scrollWidth - this.scroller.clientWidth;
        this.globalScrollProgress = scrollable > 0 ? this.scroller.scrollLeft / scrollable : 0;

        /* Comparing against the neighbouring snap points (rather than
           rounding the progress) gives a deadzone, so a card stays active
           until the scroll is properly into the next one instead of
           flickering at the midpoint.

           These loop rather than stepping once: a fast flick, a jump to the
           end, or a dot click can cross several cards between two scroll
           events, and a single ±1 step would leave the index lagging. */
        var perCard = 1 / (this.cardCount - 1);

        while (this.activeIndex > 0 &&
               this.globalScrollProgress <= perCard * (this.activeIndex - 1)) {
            this.activeIndex -= 1;
        }
        while (this.activeIndex < this.cardCount - 1 &&
               this.globalScrollProgress >= perCard * (this.activeIndex + 1)) {
            this.activeIndex += 1;
        }
    };

    CardStack.prototype.update = function () {
        var perCard = this.cardCount > 1 ? 1 / (this.cardCount - 1) : 1;

        this.visuals.forEach(function (visual, index) {
            var start = perCard * index;
            var cardProgress = (this.globalScrollProgress - start) / perCard;
            var absCard = Math.abs(cardProgress);
            var activeProgress = this.globalScrollProgress / perCard - this.activeIndex;
            var absActive = Math.abs(activeProgress);
            var isActive = index === this.activeIndex;

            // --- z-index --------------------------------------------------
            // Cards equidistant from centre would tie, so the winner is
            // decided by which way the stack is currently moving.
            var distance = Math.abs(this.activeIndex - index);
            var zIndex = this.cardCount - distance;
            if (Math.sign(activeProgress) === -1 && index < this.activeIndex) {
                zIndex += activeProgress < -0.5 ? 2 : 1;
            }
            if (Math.sign(activeProgress) === 1) {
                if (isActive) zIndex += 1;
                if (index > this.activeIndex) zIndex += activeProgress > 0.5 ? 2 : 1;
            }

            // --- translateX -----------------------------------------------
            var translateX;
            var spread = (1 - absCard / this.cardCount / 4) * 10;
            if (isActive) {
                if (absCard < 0.5) {
                    translateX = -128 * cardProgress;
                } else {
                    translateX = -128 * Math.sign(cardProgress);
                    translateX += 128 * cardProgress;
                    translateX += -spread * (absCard - 0.5) * 2 * Math.sign(cardProgress);
                }
            } else {
                translateX = cardProgress * -spread;
            }

            // --- translateZ / rotate / scale -------------------------------
            // Depth is scaled by container width (see setPerspective) so the
            // perspective magnification is identical at every breakpoint.
            var translateZ = (200 - absCard * 40) * (this.depthScale || 1);

            var rotateY = absActive < 0.5 ? absActive * -75 : (1 - absActive) * -75;
            if (isActive) {
                rotateY = absCard < 0.5 ? absCard * -90 : (1 - absCard) * -90;
            }
            rotateY *= Math.sign(activeProgress) * (1 - distance / this.cardCount);

            var rotateZ = cardProgress * -2;

            var scale = 1 - absCard * 0.05;
            if (isActive) {
                scale -= absCard < 0.5 ? absCard * 0.25 : (1 - absCard) * 0.25;
            }
            if (scale < 0) scale = 0;

            var opacity = Math.min(1, Math.max(0, MAX_CARDS_ON_ONE_SIDE - absCard));

            visual.style.transform =
                'translateX(' + (translateX - 50) + '%) translateY(-50%) translateZ(' +
                translateZ + 'px) rotateY(' + rotateY + 'deg) rotateZ(' +
                rotateZ + 'deg) scale(' + scale + ')';
            visual.style.zIndex = zIndex;
            visual.style.opacity = opacity;
            visual.dataset.front = isActive ? 'true' : 'false';
        }, this);

        this.dots.forEach(function (dot, i) {
            dot.setAttribute('aria-current', i === this.activeIndex ? 'true' : 'false');
        }, this);
    };

    function init() {
        document.querySelectorAll('[data-card-stack]').forEach(function (root) {
            /* eslint-disable no-new */
            new CardStack(root);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
