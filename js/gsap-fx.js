'use strict';

/**
 * Premium GSAP + ScrollTrigger animation timeline.
 * Every function guards on the presence of its target markup so this
 * single file can be shared across index.html and the listing pages.
 */
(function () {
    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    /* PHASE 1 used to live here: a duplicate FeelBG wordmark, fixed to the
       viewport, that shrank into the navbar logo as you scrolled. It was
       removed because a fixed, scroll-driven element over the hero meant the
       wordmark travelled up the page while everything around it stayed put,
       and its tail painted over the section below. The wordmark is now
       ordinary content inside .hero__text and scrolls away with the hero. */

    /* ============================================
       PHASE 2 — 3D PERSPECTIVE CARD SCATTER
       ============================================ */
    function initCardScatter() {
        var stage = document.querySelector('.card-scatter-stage');
        var grid = stage ? stage.querySelector('.places-grid') : null;
        if (!stage || !grid || prefersReducedMotion) return;
        if (!window.matchMedia('(min-width: 1024px)').matches) return;

        var currentST = null;

        function build() {
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.place-card')).slice(0, 9);
            if (cards.length < 3) return null;

            gsap.set(cards, { transformPerspective: 1200, force3D: true });

            // No pin here: pinned ScrollTrigger sections freeze native scroll
            // and hand it to the animation instead, which is a well-known
            // source of stutter/jank on mobile (the dynamic browser toolbar
            // resizing the viewport mid-scroll fights with the pin). The
            // scatter now just scrubs in as the grid naturally passes through
            // the viewport, so scrolling itself can never stutter.
            var tl = gsap.timeline({
                scrollTrigger: {
                    trigger: stage,
                    start: 'top 85%',
                    end: 'bottom 35%',
                    scrub: 1
                }
            });

            cards.forEach(function (card, i) {
                var col = i % 3;
                var from = { opacity: 0.15, x: 0, y: 40, z: 0, rotateY: 0 };
                if (col === 0) { from.x = -320; from.rotateY = -45; }
                else if (col === 2) { from.x = 320; from.rotateY = 45; }
                else { from.z = -400; }

                tl.fromTo(card, from, {
                    opacity: 1, x: 0, y: 0, z: 0, rotateY: 0, ease: 'power3.out'
                }, 0);
            });

            return tl.scrollTrigger;
        }

        currentST = build();

        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (currentST) { currentST.kill(true); }
                if (!window.matchMedia('(min-width: 1024px)').matches) return;
                currentST = build();
                ScrollTrigger.refresh();
            }, 250);
        });
    }

    /* ============================================
       PHASE 3 — CLIP-PATH MASK REVEAL
       ============================================ */
    function initMaskReveal() {
        var section = document.querySelector('.mask-reveal');
        var panel = document.getElementById('mask-reveal-panel');
        if (!section || !panel) return;

        if (prefersReducedMotion) {
            panel.style.clipPath = 'circle(150% at 50% 50%)';
            return;
        }

        // Same reasoning as the card scatter above: no pin, so this can
        // never fight with native scroll — the circle reveal just scrubs in
        // as the section passes through the viewport.
        gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top 75%',
                end: 'bottom 25%',
                scrub: 1
            }
        }).to(panel, { clipPath: 'circle(150% at 50% 50%)', ease: 'power2.inOut' });
    }

    /* Headings/paragraphs are shown as plain static text — no
       char/word-split scroll animation. That system kept producing
       hard-to-diagnose rendering bugs (text landing invisible or
       oddly positioned depending on font/CDN/layout timing), so it's
       removed rather than patched again. Section titles still get a
       gold shimmer via CSS only (see .section__title in
       premium-fx.css), which has no such failure mode. */
    function refreshAfterLoad() {
        window.addEventListener('load', function () {
            setTimeout(function () { ScrollTrigger.refresh(); }, 50);
        });
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
        }
    }


    /* The SERBIA / SRBIJE word used to be rebuilt here as one span per
       letter, with a flag-coloured gradient and a wave animation, and only
       Serbian got a translated form. It is now a single word carrying
       data-i18n="hero.titleAccent", so js/language-selector.js translates it
       in every language and the letterforms are left intact. */

    ready(function () {
        if (!window.gsap || !window.ScrollTrigger) return;
        gsap.registerPlugin(ScrollTrigger);

        initCardScatter();
        initMaskReveal();
        refreshAfterLoad();
    });
})();
