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
       ============================================ */
    function initKineticHero() {
        var wrap = document.getElementById('hero-kinetic');
        var title = document.getElementById('hero-kinetic-title');
        var hero = document.querySelector('.hero');
        var navLogo = document.querySelector('.nav__logo-link');
        var heroText = document.querySelector('.hero__text');
        if (!wrap || !title || !hero || !navLogo) return;

        if (prefersReducedMotion) {
            wrap.style.display = 'none';
            return;
        }

        gsap.set(navLogo, { opacity: 0 });
        if (heroText) gsap.set(heroText, { opacity: 0, y: 30 });

        function getDelta() {
            var t = title.getBoundingClientRect();
            var l = navLogo.getBoundingClientRect();
            return {
                x: (l.left + l.width / 2) - (t.left + t.width / 2),
                y: (l.top + l.height / 2) - (t.top + t.height / 2),
                scale: Math.max(0.1, (l.height * 0.85) / t.height)
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

        tl.to(title, {
            x: function () { return getDelta().x; },
            y: function () { return getDelta().y; },
            scale: function () { return getDelta().scale; },
            ease: 'power4.inOut'
        }, 0);
        tl.to(wrap, { opacity: 0, ease: 'power1.in' }, 0.7);
        tl.to(navLogo, { opacity: 1, ease: 'power1.in' }, 0.72);
        if (heroText) tl.to(heroText, { opacity: 1, y: 0, ease: 'power2.out' }, 0.2);
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

            var tl = gsap.timeline({
                scrollTrigger: {
                    trigger: stage,
                    start: 'top top+=90',
                    end: '+=100%',
                    scrub: 1,
                    pin: true,
                    pinSpacing: true,
                    anticipatePin: 1
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

        gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=120%',
                scrub: 1.5,
                pin: true
            }
        }).to(panel, { clipPath: 'circle(150% at 50% 50%)', ease: 'power2.inOut' });
    }

    /* ============================================
       PHASE 4 — CHAR / WORD SPLIT SCRUB REVEAL
       ============================================ */
    function splitChars(el) {
        var text = el.textContent;
        if (!text.trim()) return [];
        el.setAttribute('aria-label', text);
        el.classList.add('split-char');
        el.innerHTML = '';
        var frag = document.createDocumentFragment();
        Array.prototype.forEach.call(text, function (ch) {
            var span = document.createElement('span');
            span.className = 'char';
            span.setAttribute('aria-hidden', 'true');
            span.textContent = ch === ' ' ? ' ' : ch;
            frag.appendChild(span);
        });
        el.appendChild(frag);
        return Array.prototype.slice.call(el.querySelectorAll('.char'));
    }

    function splitWords(el) {
        var text = el.textContent;
        if (!text.trim()) return [];
        el.setAttribute('aria-label', text);
        el.classList.add('split-word');
        el.innerHTML = '';
        var parts = text.split(/(\s+)/);
        parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
                el.appendChild(document.createTextNode(part));
                return;
            }
            var span = document.createElement('span');
            span.className = 'word';
            span.textContent = part;
            el.appendChild(span);
        });
        return Array.prototype.slice.call(el.querySelectorAll('.word'));
    }

    function initTextScrub() {
        document.querySelectorAll('.js-split-chars').forEach(function (el) {
            if (prefersReducedMotion) return;
            var chars = splitChars(el);
            if (!chars.length) return;
            gsap.timeline({
                scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
            }).to(chars, {
                opacity: 1, rotateX: 0, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.02
            });
        });

        document.querySelectorAll('.js-split-words').forEach(function (el) {
            if (prefersReducedMotion) return;
            var words = splitWords(el);
            if (!words.length) return;
            gsap.timeline({
                scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
            }).to(words, {
                opacity: 1, y: 0, rotateX: 0, duration: 0.7, ease: 'power3.out', stagger: 0.03
            });
        });
    }

    ready(function () {
        if (!window.gsap || !window.ScrollTrigger) return;
        gsap.registerPlugin(ScrollTrigger);

        initKineticHero();
        initCardScatter();
        initMaskReveal();
        initTextScrub();
    });
})();
