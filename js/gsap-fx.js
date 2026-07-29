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

    /* ============================================
       PHASE 1 — KINETIC HERO TITLE -> NAVBAR LOGO
       The header logo and the "Discover the Heart of
       Serbia" tagline are always visible (no opacity
       hiding) — only the giant duplicate title moves
       and fades away as it shrinks toward the logo.
       ============================================ */
    function initKineticHero() {
        var wrap = document.getElementById('hero-kinetic');
        var title = document.getElementById('hero-kinetic-title');
        var hero = document.querySelector('.hero');
        var navLogo = document.querySelector('.nav__logo-link');
        if (!wrap || !title || !hero || !navLogo) return;

        if (prefersReducedMotion) {
            wrap.style.display = 'none';
            return;
        }

        // Captured once, before the tween ever touches the title. getBoundingClientRect()
        // reflects the CURRENT paint position including any transform already applied —
        // re-querying it live once the tween is running would feed the already-shrunk
        // position back in as if it were the starting point, corrupting the delta on every
        // ScrollTrigger refresh. That's what caused the title to get stuck shrunk and
        // "float" in place instead of smoothly scaling back out when scrolling back up.
        var titleRect = title.getBoundingClientRect();
        var titleCenterX = titleRect.left + titleRect.width / 2;
        var titleCenterY = titleRect.top + titleRect.height / 2;
        var titleHeight = titleRect.height;

        function getDelta() {
            var l = navLogo.getBoundingClientRect();
            return {
                x: (l.left + l.width / 2) - titleCenterX,
                y: (l.top + l.height / 2) - titleCenterY,
                scale: Math.max(0.1, (l.height * 0.85) / titleHeight)
            };
        }

        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: 1.2,
                invalidateOnRefresh: true,
                onLeave: function () { document.body.classList.add('hero-kinetic-done'); },
                onEnterBack: function () { document.body.classList.remove('hero-kinetic-done'); }
            }
        });

        // duration: 1 makes this tween span the timeline's *entire* scrubbed
        // range. Without it, GSAP's default duration (0.5) meant the title's
        // transform only actually covered the first ~43% of the real scroll
        // distance (since the opacity fade below, starting at 0.65 with its
        // own default 0.5 duration, stretched the timeline's total length to
        // 1.15) — for the remaining ~57% the title just sat frozen at its
        // final shrunk value. Scrolling down that read as "arrives early,
        // then fades"; scrolling back up it read as the title floating in
        // place, tiny and static, for most of the hero before suddenly
        // snapping back to full size right near the top.
        //
        // ease: 'none' matters too, separately: this tween is driven by
        // scrub (scroll position), not by time — a dramatic named ease
        // concentrates motion into a narrow band and fights the duration fix.
        tl.to(title, {
            x: function () { return getDelta().x; },
            y: function () { return getDelta().y; },
            scale: function () { return getDelta().scale; },
            ease: 'none',
            duration: 1
        }, 0);
        tl.to(wrap, { opacity: 0, ease: 'none', duration: 0.35 }, 0.65);
    }

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


    /* ============================================
       HERO FLAG-LETTER WORD (SERBIA / SRBIJE)
       Only Serbian swaps the animated flag-colored word to
       "SRBIJE" — every other language keeps "SERBIA". This
       doesn't touch GSAP, so it runs even if the GSAP CDN fails.
       ============================================ */
    function initHeroAccent() {
        var el = document.querySelector('.hero__title-serbia');
        if (!el) return;

        function currentLangCode() {
            try {
                var stored = localStorage.getItem('feelbg_language');
                return stored ? JSON.parse(stored).code : 'en';
            } catch (e) {
                return 'en';
            }
        }

        function render() {
            var word = currentLangCode() === 'sr' ? 'SRBIJE' : 'SERBIA';
            el.innerHTML = word.split('').map(function (ch, i) {
                return '<span class="letter" style="animation-delay: ' + (i * 0.1) + 's">' + ch + '</span>';
            }).join('');
        }

        render();
        document.addEventListener('click', function (e) {
            if (e.target.closest('.language-option') || e.target.closest('.language-card')) {
                setTimeout(render, 0);
            }
        });
    }

    ready(function () {
        initHeroAccent();

        if (!window.gsap || !window.ScrollTrigger) return;
        gsap.registerPlugin(ScrollTrigger);

        initKineticHero();
        initCardScatter();
        initMaskReveal();
        refreshAfterLoad();
    });
})();
