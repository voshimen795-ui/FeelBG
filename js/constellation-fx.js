'use strict';

/**
 * FeelBG "Belgrade Constellation" — a Three.js particle network rendered
 * behind the Discover Belgrade (categories) section on the home page.
 * Softly glowing gold dots drift in 3D space; luminous connector lines
 * form and fade between dots that drift near each other, and the whole
 * field tilts gently toward the cursor.
 *
 * Built to cost nothing when it isn't visible:
 *  - Three.js is only fetched once the section approaches the viewport
 *  - the render loop pauses whenever the section scrolls off-screen or
 *    the tab is hidden
 *  - reduced-motion users never load any of it
 *  - if the CDN is blocked (adblock/offline) the section just keeps its
 *    plain background — nothing else on the page is affected
 */
(function () {
    var THREE_CDN = 'https://unpkg.com/three@0.128.0/build/three.min.js';

    var section = null;
    var running = false;
    var booted = false;
    var renderer, scene, camera, points, lines, group;
    var velocities = [];
    var particleCount = 0;
    var linePositions, lineColors;
    var maxSegments = 0;
    var mouseX = 0, mouseY = 0;
    var baseRotation = 0;
    var frameHandle = null;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    function loadThree(cb) {
        if (window.THREE) { cb(); return; }
        var s = document.createElement('script');
        s.src = THREE_CDN;
        s.async = true;
        s.onload = cb;
        s.onerror = function () { /* CDN blocked — silently skip the effect */ };
        document.head.appendChild(s);
    }

    // Soft radial glow sprite so dots render as luminous orbs instead of squares
    function makeGlowTexture() {
        var c = document.createElement('canvas');
        c.width = 64; c.height = 64;
        var ctx = c.getContext('2d');
        var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255, 236, 170, 1)');
        g.addColorStop(0.35, 'rgba(255, 215, 0, 0.85)');
        g.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
        var tex = new THREE.CanvasTexture(c);
        return tex;
    }

    function boot() {
        if (booted || !window.THREE) return;
        booted = true;

        var isMobile = window.matchMedia('(max-width: 768px)').matches;
        particleCount = isMobile ? 45 : 85;
        var SPREAD_X = 110, SPREAD_Y = 55, SPREAD_Z = 45;

        var canvas = document.createElement('canvas');
        canvas.className = 'constellation-canvas';
        section.insertBefore(canvas, section.firstChild);

        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobile });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, 1, 1, 500);
        camera.position.z = 105;

        group = new THREE.Group();
        scene.add(group);

        var positions = new Float32Array(particleCount * 3);
        for (var i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() * 2 - 1) * SPREAD_X;
            positions[i * 3 + 1] = (Math.random() * 2 - 1) * SPREAD_Y;
            positions[i * 3 + 2] = (Math.random() * 2 - 1) * SPREAD_Z;
            velocities.push({
                x: (Math.random() * 2 - 1) * 0.045,
                y: (Math.random() * 2 - 1) * 0.035,
                z: (Math.random() * 2 - 1) * 0.03
            });
        }
        var pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        var pMat = new THREE.PointsMaterial({
            size: 3.4,
            map: makeGlowTexture(),
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        points = new THREE.Points(pGeo, pMat);
        group.add(points);

        maxSegments = particleCount * 6;
        linePositions = new Float32Array(maxSegments * 2 * 3);
        lineColors = new Float32Array(maxSegments * 2 * 3);
        var lGeo = new THREE.BufferGeometry();
        lGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
        lGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));
        var lMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        lines = new THREE.LineSegments(lGeo, lMat);
        group.add(lines);

        window.addEventListener('mousemove', function (e) {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        }, { passive: true });

        window.addEventListener('resize', resize);
        resize();

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) pause();
            else if (isSectionVisible()) resume();
        });

        // debug/test hook: frame counter proves the loop is actually running
        window._feelbgConstellation = { frames: 0, particleCount: particleCount };

        resume();
    }

    function resize() {
        if (!renderer || !section) return;
        var w = section.clientWidth, h = section.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    var _visible = false;
    function isSectionVisible() { return _visible; }

    function step() {
        if (!running) return;
        frameHandle = requestAnimationFrame(step);

        var pos = points.geometry.attributes.position.array;
        var SPREAD_X = 110, SPREAD_Y = 55, SPREAD_Z = 45;
        var i;
        for (i = 0; i < particleCount; i++) {
            pos[i * 3] += velocities[i].x;
            pos[i * 3 + 1] += velocities[i].y;
            pos[i * 3 + 2] += velocities[i].z;
            if (Math.abs(pos[i * 3]) > SPREAD_X) velocities[i].x *= -1;
            if (Math.abs(pos[i * 3 + 1]) > SPREAD_Y) velocities[i].y *= -1;
            if (Math.abs(pos[i * 3 + 2]) > SPREAD_Z) velocities[i].z *= -1;
        }
        points.geometry.attributes.position.needsUpdate = true;

        // Rebuild connector segments between particles that drifted close
        var CONNECT_DIST = 26;
        var segment = 0;
        for (i = 0; i < particleCount && segment < maxSegments; i++) {
            for (var j = i + 1; j < particleCount && segment < maxSegments; j++) {
                var dx = pos[i * 3] - pos[j * 3];
                var dy = pos[i * 3 + 1] - pos[j * 3 + 1];
                var dz = pos[i * 3 + 2] - pos[j * 3 + 2];
                var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist < CONNECT_DIST) {
                    var strength = 1 - dist / CONNECT_DIST; // closer = brighter line
                    var o = segment * 6;
                    linePositions[o] = pos[i * 3];
                    linePositions[o + 1] = pos[i * 3 + 1];
                    linePositions[o + 2] = pos[i * 3 + 2];
                    linePositions[o + 3] = pos[j * 3];
                    linePositions[o + 4] = pos[j * 3 + 1];
                    linePositions[o + 5] = pos[j * 3 + 2];
                    // gold, faded by distance (additive blending: darker = more transparent)
                    var r = 1.0 * strength, g = 0.84 * strength, b = 0.15 * strength;
                    lineColors[o] = r; lineColors[o + 1] = g; lineColors[o + 2] = b;
                    lineColors[o + 3] = r; lineColors[o + 4] = g; lineColors[o + 5] = b;
                    segment++;
                }
            }
        }
        lines.geometry.setDrawRange(0, segment * 2);
        lines.geometry.attributes.position.needsUpdate = true;
        lines.geometry.attributes.color.needsUpdate = true;

        // Slow self-rotation + gentle tilt toward the cursor
        baseRotation += 0.0006;
        group.rotation.y += ((baseRotation + mouseX * 0.18) - group.rotation.y) * 0.02;
        group.rotation.x += ((mouseY * 0.1) - group.rotation.x) * 0.02;

        renderer.render(scene, camera);
        if (window._feelbgConstellation) window._feelbgConstellation.frames++;
    }

    function resume() {
        if (running || !booted) return;
        running = true;
        step();
    }

    function pause() {
        running = false;
        if (frameHandle) cancelAnimationFrame(frameHandle);
    }

    ready(function () {
        section = document.querySelector('.categories');
        if (!section || !('IntersectionObserver' in window)) return;

        // First observer: fetch + boot once the section gets close to view
        var bootObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    bootObserver.disconnect();
                    loadThree(boot);
                }
            });
        }, { rootMargin: '400px 0px' });
        bootObserver.observe(section);

        // Second observer: pause the render loop whenever off-screen
        var visObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                _visible = entry.isIntersecting;
                if (entry.isIntersecting) resume();
                else pause();
            });
        }, { threshold: 0 });
        visObserver.observe(section);
    });
})();
