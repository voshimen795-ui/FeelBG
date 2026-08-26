'use strict';

/* ============================================
   CATEGORY CARD STACK

   Progressive enhancement over a native scroll-snap strip. The markup in
   index.html is already a working, accessible list of category links; if
   this file never runs, or the visitor prefers reduced motion, that list
   is what they get.

   When it does run it builds a decorative, aria-hidden 3D layer whose
   cards are transformed from the scroller's `scrollLeft`. Nothing here
   listens for swipes or clicks — the browser's own scrolling is the
   input, which is why touch, trackpad, keyboard and momentum all behave
   natively.

   The transform maths (translateX/Z, rotateY/Z, scale, z-index, opacity)
   is ported from the reference implementation the design was taken from.
   ============================================ */

(function () {
    var MAX_CARDS_ON_ONE_SIDE = 5;

    function CardStack(root) {
        this.root = root;
        this.scroller = root.querySelector('.card-stack__scroller');
        this.links = Array.prototype.slice.call(root.querySelectorAll('.card-stack__link'));
        this.cardCount = this.links.length;
        this.activeIndex = 0;
        this.globalScrollProgress = 0;
        this.visuals = [];
        this.dots = [];
        this.frame = null;

        if (!this.scroller || this.cardCount < 2) return;

        this.buildVisuals();
        this.buildDots();
        this.bind();
        this.setPerspective();
        this.root.classList.add('card-stack--enhanced');
        this.update();
    }

    /* Clone each link's content into a decorative card. Cloning (rather
       than duplicating the markup in HTML) keeps a single source of truth
       for the copy, so translations only have to be applied once. */
    CardStack.prototype.buildVisuals = function () {
        var layer = document.createElement('div');
        layer.className = 'card-stack__visuals';
        layer.setAttribute('aria-hidden', 'true');

        this.links.forEach(function (link) {
            var card = link.querySelector('.card-stack__card');

            var visual = document.createElement('div');
            visual.className = 'card-stack__visual';

            var inner = document.createElement('div');
            inner.className = 'card-stack__visual-inner';
            if (card && card.style.backgroundImage) {
                inner.style.backgroundImage = card.style.backgroundImage;
            }

            var body = link.querySelector('.card-stack__body');
            if (body) inner.appendChild(body.cloneNode(true));

            visual.appendChild(inner);
            layer.appendChild(visual);
            this.visuals.push(visual);
        }, this);

        this.root.appendChild(layer);
        this.layer = layer;
    };

    CardStack.prototype.buildDots = function () {
        var nav = document.createElement('div');
        nav.className = 'card-stack__dots';
        nav.setAttribute('aria-hidden', 'true');

        this.links.forEach(function (link, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'card-stack__dot';
            dot.tabIndex = -1; // the links themselves are the keyboard path
            dot.addEventListener('click', function () {
                this.scrollToIndex(i);
            }.bind(this));
            nav.appendChild(dot);
            this.dots.push(dot);
        }, this);

        // Inserted after the stack, not inside it: .card-stack is sized by
        // aspect-ratio, so a child would overflow that box.
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

        // The link is transparent in the enhanced state, so draw the focus
        // ring on the front card instead of losing it entirely.
        this.links.forEach(function (link) {
            link.addEventListener('focus', function () {
                this.root.classList.add('card-stack--focus');
            }.bind(this));
            link.addEventListener('blur', function () {
                this.root.classList.remove('card-stack--focus');
            }.bind(this));
        }, this);
    };

    /* Scroll events fire far more often than frames are painted, so the
       actual work is coalesced into one rAF callback per frame. */
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

    /* Perspective is set from the live container width so the 3D effect
       reads the same at 320px as it does at 1440px. */
    CardStack.prototype.setPerspective = function () {
        var width = this.root.clientWidth;
        if (width) {
            this.root.style.setProperty('--card-stack-perspective', (width * 2) + 'px');
        }
    };

    CardStack.prototype.readScroll = function () {
        var scrollable = this.scroller.scrollWidth - this.scroller.clientWidth;
        this.globalScrollProgress = scrollable > 0 ? this.scroller.scrollLeft / scrollable : 0;

        // Advance the active index as the scroll position crosses into the
        // previous or next card's territory. Comparing against the
        // neighbouring snap points (rather than just rounding the progress)
        // gives a deadzone, so a card stays active until the scroll is
        // properly into the next one instead of flickering at the midpoint.
        //
        // These loop rather than stepping once: a fast flick, a jump to the
        // end, or a dot click can cross several cards between two scroll
        // events, and a single ±1 step would leave the index lagging behind
        // the actual position.
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

            // --- z-index -------------------------------------------------
            // Cards equidistant from centre would otherwise tie, so the
            // winner is decided by which way the stack is currently moving.
            var distance = Math.abs(this.activeIndex - index);
            var zIndex = this.cardCount - distance;
            if (Math.sign(activeProgress) === -1 && index < this.activeIndex) {
                zIndex += activeProgress < -0.5 ? 2 : 1;
            }
            if (Math.sign(activeProgress) === 1) {
                if (isActive) zIndex += 1;
                if (index > this.activeIndex) zIndex += activeProgress > 0.5 ? 2 : 1;
            }

            // --- translateX ----------------------------------------------
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

            // --- translateZ / rotate / scale ------------------------------
            var translateZ = 200 - absCard * 40;

            var rotateY;
            if (absActive < 0.5) {
                rotateY = absActive * -75;
            } else {
                rotateY = (1 - absActive) * -75;
            }
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
        // Respect the OS setting: leave the plain scroll-snap list alone.
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
