'use strict';

class BelgradeMap {
    constructor() {
        this.map = null;
        this.modal = null;
        this.markers = {};
        this.routeMarkers = [];
        this.userMarker = null;
        this.routeLayerActive = false;
        this.rotating = false;
        this._rotateFrame = null;
        this._touring = false;
        this._tourStops = [];
        this._tourIndex = 0;
        this._tourTimer = null;
        this.defaultView = { center: [20.4568, 44.8178], zoom: 15.2, pitch: 55, bearing: -17.6 };
        this.venues = this.buildVenuesFromDB();
        this.init();
    }

    static venueSlug(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    }

    static areaKey(area) {
        var map = {'Stari Grad':'area.stariGrad','Skadarlija':'area.skadarlija','Dorćol':'area.dorcol','Vračar':'area.vracar','Savamala':'area.savamala','Zemun':'area.zemun','Novi Beograd':'area.noviBeograd','Čukarica':'area.cukarica','Topčider':'area.topcider','Sava':'area.sava'};
        return map[area] || '';
    }

    getTranslatedVenue(venue, field) {
        var slug = BelgradeMap.venueSlug(venue.name);
        var key = 'venue.' + slug + '.' + field;
        var val = this.t(key);
        if (val !== key) return val;
        return field === 'desc' ? (venue.desc || venue.description || '') : (venue.cuisineLabel || '');
    }

    buildVenuesFromDB() {
        const db = window.FEELBG_VENUES;
        if (!db) return [];
        const icons = { restaurants: '🍽️', cafes: '☕', nightlife: '🎶', attractions: '🏰' };
        const colors = { restaurants: '#b8860b', cafes: '#1e3a8a', nightlife: '#7c3aed', attractions: '#dc2626' };
        const types = { restaurants: 'restaurant', cafes: 'cafe', nightlife: 'nightlife', attractions: 'attraction' };
        const result = [];
        for (const [cat, list] of Object.entries(db)) {
            (list || []).forEach(v => {
                result.push({
                    name: v.name, type: types[cat], area: v.area,
                    lat: v.lat, lng: v.lng, rating: v.rating,
                    price: v.price, priceLabel: v.priceLabel || '', icon: icons[cat], color: colors[cat],
                    desc: v.description, description: v.description, image: v.image, cuisineLabel: v.cuisineLabel
                });
            });
        }
        return result;
    }

    t(key) {
        const translations = window.FEELBG_TRANSLATIONS || {};
        const stored = localStorage.getItem('feelbg_language');
        const langCode = stored ? JSON.parse(stored).code : 'en';
        const lang = translations[langCode] || {};
        const fallback = translations['en'] || {};
        if (key in lang) return lang[key];
        if (key in fallback) return fallback[key];
        return key;
    }

    init() {
        this.createModal();
        this.bindTriggers();
        document.addEventListener('feelbg:languageChanged', () => this.refreshMapUI());
    }

    refreshMapUI() {
        Object.values(this.markers).forEach(({ marker, venue }) => {
            const popup = marker.getPopup && marker.getPopup();
            if (popup) popup.setHTML(this.createPopup(venue));
        });
        const filtered = this._lastFilteredVenues || this.venues;
        if (filtered) this.renderSidebar(filtered);
        this.retranslateModalChrome();
    }

    retranslateModalChrome() {
        const modal = document.getElementById('map-modal');
        if (!modal) return;
        const titleSpan = modal.querySelector('.map-modal__title > span:first-of-type');
        if (titleSpan) titleSpan.textContent = this.t('map.title');
        const venueCount = modal.querySelector('.map-venue-count');
        if (venueCount) venueCount.textContent = this.venues.length + ' ' + this.t('map.venues');
        const sidebarHeader = modal.querySelector('.map-sidebar__header');
        if (sidebarHeader) sidebarHeader.innerHTML = `<i class="fas fa-list-ul"></i> ${this.t('map.venueList')}`;
        const adventureBtn = modal.querySelector('#adventure-btn');
        if (adventureBtn) adventureBtn.innerHTML = `<i class="fas fa-hiking"></i> ${this.t('adventure.create')}`;
        const resetBtn = modal.querySelector('#map-reset');
        if (resetBtn) resetBtn.title = this.t('map.resetView');
        const rotateBtn = modal.querySelector('#map-rotate');
        if (rotateBtn) rotateBtn.title = this.t('map.rotate');
        const tourBtn = modal.querySelector('#map-tour');
        if (tourBtn) tourBtn.title = this.t(this._touring ? 'map.stopTour' : 'map.startTour');
        modal.querySelectorAll('.map-filter[data-type]').forEach(btn => {
            const type = btn.dataset.type;
            const keyMap = { all: 'map.all', restaurant: 'map.food', cafe: 'map.cafes', nightlife: 'map.nightlife', attraction: 'map.sights' };
            const iconMap = { restaurant: '<i class="fas fa-utensils"></i> ', cafe: '<i class="fas fa-coffee"></i> ', nightlife: '<i class="fas fa-music"></i> ', attraction: '<i class="fas fa-landmark"></i> ' };
            if (keyMap[type]) btn.innerHTML = (iconMap[type] || '') + this.t(keyMap[type]);
        });
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'map-modal';
        modal.innerHTML = `
            <div class="map-modal__overlay" id="map-overlay"></div>
            <div class="map-modal__container">
                <div class="map-modal__header">
                    <div class="map-modal__title">
                        <i class="fas fa-map-marked-alt"></i>
                        <span>${this.t('map.title')}</span>
                        <span class="map-venue-count">${this.venues.length} ${this.t('map.venues')}</span>
                    </div>
                    <div class="map-modal__filters">
                        <button class="map-filter active" data-type="all">${this.t('map.all')}</button>
                        <button class="map-filter" data-type="restaurant"><i class="fas fa-utensils"></i> ${this.t('map.food')}</button>
                        <button class="map-filter" data-type="cafe"><i class="fas fa-coffee"></i> ${this.t('map.cafes')}</button>
                        <button class="map-filter" data-type="nightlife"><i class="fas fa-music"></i> ${this.t('map.nightlife')}</button>
                        <button class="map-filter" data-type="attraction"><i class="fas fa-landmark"></i> ${this.t('map.sights')}</button>
                    </div>
                    <button class="map-adventure-btn" id="adventure-btn"><i class="fas fa-hiking"></i> ${this.t('adventure.create')}</button>
                    <button class="map-icon-btn" id="map-tour" title="${this.t('map.startTour')}"><i class="fas fa-play"></i></button>
                    <button class="map-icon-btn" id="map-rotate" title="${this.t('map.rotate')}"><i class="fas fa-sync-alt"></i></button>
                    <button class="map-icon-btn" id="map-reset" title="${this.t('map.resetView')}"><i class="fas fa-crosshairs"></i></button>
                    <button class="map-modal__close" id="map-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="map-modal__body">
                    <div id="belgrade-map"></div>
                    <div class="map-sidebar" id="map-sidebar">
                        <div class="map-sidebar__header"><i class="fas fa-list-ul"></i> ${this.t('map.venueList')}</div>
                        <div class="map-sidebar__list" id="sidebar-list"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
        this.injectStyles();
    }

    bindTriggers() {
        document.querySelectorAll('#map-toggle, .map-trigger, [data-map-open]').forEach(btn => {
            btn.addEventListener('click', (e) => { e.preventDefault(); this.openMap(); });
        });
        document.getElementById('map-close')?.addEventListener('click', () => this.closeMap());
        document.getElementById('map-overlay')?.addEventListener('click', () => this.closeMap());
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeMap(); });
        this.modal.querySelectorAll('.map-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                this.modal.querySelectorAll('.map-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterMarkers(btn.dataset.type);
            });
        });
        document.getElementById('adventure-btn')?.addEventListener('click', () => this.showAdventurePanel());
        document.getElementById('map-reset')?.addEventListener('click', () => this.resetView());
        document.getElementById('map-rotate')?.addEventListener('click', () => this.toggleRotate());
        document.getElementById('map-tour')?.addEventListener('click', () => this.toggleTour());
    }

    openMap() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (!this.map) {
            // Wait for the modal's own slide-in animation to actually finish
            // before MapLibre reads the container's size — initializing mid
            // CSS-transform gave the map a stale layout to measure against,
            // which is what caused markers to drift out of sync while panning.
            const container = this.modal.querySelector('.map-modal__container');
            let started = false;
            const start = () => {
                if (started) return;
                started = true;
                container.removeEventListener('animationend', start);
                this.initMap();
            };
            container.addEventListener('animationend', start);
            // Fallback in case the animation is skipped (prefers-reduced-motion, etc.)
            setTimeout(start, 500);
        } else {
            this.map.resize();
        }
    }

    closeMap() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.stopRotate();
        this.stopTour();
    }

    initMap() {
        if (!window.maplibregl) { this.showMapFallback(); return; }
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        try {
            this.map = new maplibregl.Map({
                container: 'belgrade-map',
                style: 'https://tiles.openfreemap.org/styles/liberty',
                center: [20.4568, 44.8178],
                zoom: 9,
                pitch: 0,
                bearing: 0,
                antialias: !isMobile,
                maxPitch: isMobile ? 50 : 70,
                renderWorldCopies: false,
                attributionControl: { compact: true }
            });
        } catch (err) {
            this.showMapFallback();
            return;
        }
        this.map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
        this.map.on('error', () => { /* tolerate tile/glyph load hiccups without breaking the UI */ });
        // Bind to raw DOM input (not MapLibre's semantic move/rotate events) so our own
        // programmatic flyTo/setBearing calls don't immediately cancel themselves —
        // setBearing() fires a synchronous "rotatestart" even for non-interactive calls.
        const canvasEl = this.map.getCanvasContainer();
        ['mousedown', 'touchstart', 'wheel', 'dblclick'].forEach(ev => canvasEl.addEventListener(ev, () => { this.stopRotate(); this.stopTour(); }, { passive: true }));
        // Every DOM marker gets repositioned on every 'render' frame while the
        // camera moves. The pulsing halo (its own separate CSS animation) adds
        // paint work on top of that repositioning on every single frame, which
        // is exactly what shows up as markers visibly lagging/drifting behind
        // the map during a fast pan — pausing it while the camera is actually
        // moving removes that extra paint cost until the map settles again.
        this.map.on('movestart', () => document.getElementById('belgrade-map')?.classList.add('map-is-moving'));
        this.map.on('moveend', () => document.getElementById('belgrade-map')?.classList.remove('map-is-moving'));
        this.map.on('load', () => {
            this.applyBrandTheme();
            this.addBuildingExtrusion();
            this.addMarkers();
            this._lastFilteredVenues = this.venues;
            this.renderSidebar(this.venues);
            this.playIntro(isMobile);
        });
    }

    playIntro(isMobile) {
        setTimeout(() => {
            if (!this.map) return;
            this.map.flyTo({
                center: this.defaultView.center,
                zoom: isMobile ? this.defaultView.zoom - 0.6 : this.defaultView.zoom,
                pitch: this.defaultView.pitch,
                bearing: this.defaultView.bearing,
                duration: 4200,
                curve: 1.4,
                essential: true
            });
        }, 250);
    }

    // A bright, realistic map — real water blue, park green, warm stone
    // building tones — that actually looks like Belgrade from above,
    // instead of a dark navy tint over everything. Gold/navy stay reserved
    // for our own UI chrome (markers, sidebar, buttons) and as an accent on
    // tall landmark buildings, rather than recoloring the whole map.
    applyBrandTheme() {
        const style = this.map.getStyle();
        if (!style || !style.layers) return;
        style.layers.forEach(layer => {
            try {
                const sl = layer['source-layer'];
                if (layer.type === 'background') {
                    this.map.setPaintProperty(layer.id, 'background-color', '#f3ede0');
                } else if (sl === 'water' && layer.type === 'fill') {
                    this.map.setPaintProperty(layer.id, 'fill-color', '#7fc1e8');
                } else if (sl === 'waterway') {
                    this.map.setPaintProperty(layer.id, 'line-color', '#7fc1e8');
                } else if (sl === 'park' && layer.type === 'fill') {
                    this.map.setPaintProperty(layer.id, 'fill-color', '#bfdca0');
                } else if ((sl === 'landcover' || sl === 'landuse') && layer.type === 'fill') {
                    this.map.setPaintProperty(layer.id, 'fill-color', '#ece4d3');
                } else if (sl === 'transportation' && layer.type === 'line') {
                    const isMajor = /motorway|trunk|primary/i.test(layer.id);
                    this.map.setPaintProperty(layer.id, 'line-color', isMajor ? '#e0a83a' : '#ffffff');
                } else if (sl === 'building' && layer.type === 'fill') {
                    this.map.setPaintProperty(layer.id, 'fill-color', '#dcd0b8');
                    this.map.setPaintProperty(layer.id, 'fill-opacity', 0.9);
                } else if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
                    this.map.setPaintProperty(layer.id, 'text-color', '#1e3a8a');
                    this.map.setPaintProperty(layer.id, 'text-halo-color', '#ffffff');
                    this.map.setPaintProperty(layer.id, 'text-halo-width', 1.3);
                }
            } catch (err) { /* skip layers whose paint properties don't match this theme pass */ }
        });
    }

    addBuildingExtrusion() {
        if (this.map.getLayer('feelbg-buildings-3d')) return;
        const style = this.map.getStyle();
        const vectorSourceId = Object.keys(style.sources || {}).find(id => style.sources[id].type === 'vector');
        if (!vectorSourceId) return;
        const firstSymbol = style.layers.find(l => l.type === 'symbol');
        try {
            this.map.addLayer({
                id: 'feelbg-buildings-3d',
                type: 'fill-extrusion',
                source: vectorSourceId,
                'source-layer': 'building',
                minzoom: 13,
                paint: {
                    // Warm stone tones for ordinary buildings, shading into
                    // gold only for genuinely tall landmark towers.
                    'fill-extrusion-color': [
                        'interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 6],
                        0, '#ede2c8',
                        20, '#d9c39a',
                        60, '#c9a876',
                        120, '#b8860b'
                    ],
                    'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 6],
                    'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
                    'fill-extrusion-opacity': 0.92
                }
            }, firstSymbol ? firstSymbol.id : undefined);
        } catch (err) { /* base style schema didn't expose the expected building fields — flat map still works */ }
    }

    addMarkers() {
        this.markers = {};
        this.venues.forEach(venue => {
            const marker = this.createMarker(venue);
            this.markers[venue.name] = { marker, venue };
        });
    }

    createMarker(venue) {
        const el = document.createElement('div');
        el.className = 'map-pin-wrap';
        el.innerHTML = `<div class="map-pin__pulse" style="background:${venue.color}"></div><div class="map-pin" style="background:${venue.color}"><span>${venue.icon}</span></div>`;
        const popup = new maplibregl.Popup({ offset: 34, maxWidth: '260px', closeButton: true })
            .setHTML(this.createPopup(venue));
        popup.on('open', () => this.bindPopupButtons(venue));
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([venue.lng, venue.lat])
            .setPopup(popup)
            .addTo(this.map);
        el.addEventListener('click', () => this.highlightSidebarItem(venue.name));
        return marker;
    }

    bindPopupButtons(venue) {
        const popupEl = document.querySelector('.maplibregl-popup .map-popup');
        if (!popupEl) return;
        const detailsBtn = popupEl.querySelector('.map-popup__details');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', () => {
                if (window._placeDetailsInstance) window._placeDetailsInstance.showDetailsForVenue(venue);
            });
        }
    }

    createPopup(venue) {
        const typeLabels = { restaurant: this.t('map.restaurant'), cafe: this.t('map.cafeBar'), nightlife: this.t('map.nightlifeLabel'), attraction: this.t('map.attraction') };
        var translatedDesc = this.getTranslatedVenue(venue, 'desc');
        var translatedPrice = venue.priceLabel ? venue.priceLabel.replace(/per person/i, this.t('venue.price.perPerson')).replace(/\bentry\b/i, this.t('venue.price.entry')) : '';
        var areaK = BelgradeMap.areaKey(venue.area);
        var translatedArea = areaK ? this.t(areaK) : venue.area;
        return `
            <div class="map-popup">
                <div class="map-popup__type" style="background:${venue.color}">${typeLabels[venue.type]}</div>
                <h3 class="map-popup__name">${venue.name}</h3>
                <div class="map-popup__meta">
                    <span class="map-popup__rating">⭐ ${venue.rating}</span>
                    ${translatedPrice ? `<span class="map-popup__price">${translatedPrice}</span>` : ''}
                    <span class="map-popup__area">${translatedArea}</span>
                </div>
                <p class="map-popup__desc">${translatedDesc}</p>
                <div class="map-popup__actions">
                    <button class="map-popup__details"><i class="fas fa-circle-info"></i> ${this.t('map.viewDetails')}</button>
                    ${venue.type === 'attraction' ? '' : `<button class="map-popup__call" data-booking="${venue.name}"><i class="fas fa-calendar-check"></i> ${this.t('map.reserve')}</button>`}
                </div>
            </div>
        `;
    }

    renderSidebar(venues) {
        const list = document.getElementById('sidebar-list');
        if (!list) return;
        list.innerHTML = venues.map(v => {
            var ak = BelgradeMap.areaKey(v.area);
            var ta = ak ? this.t(ak) : v.area;
            return `
            <div class="sidebar-item" data-venue="${v.name}">
                <div class="sidebar-item__icon" style="background:${v.color}">${v.icon}</div>
                <div class="sidebar-item__info">
                    <div class="sidebar-item__name">${v.name}</div>
                    <div class="sidebar-item__area">${ta}</div>
                </div>
                <div class="sidebar-item__rating">⭐ ${v.rating}</div>
            </div>`;
        }).join('');
        list.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const entry = this.markers[item.dataset.venue];
                if (entry) this.flyToVenue(entry.venue);
            });
        });
    }

    flyToVenue(venue) {
        if (!this.map) return;
        this.stopRotate();
        this.stopTour();
        this.map.flyTo({
            center: [venue.lng, venue.lat],
            zoom: 17,
            pitch: 58,
            bearing: this.map.getBearing(),
            duration: 1800,
            curve: 1.3,
            essential: true
        });
        const entry = this.markers[venue.name];
        if (entry && entry.marker.getPopup && !entry.marker.getPopup().isOpen()) entry.marker.togglePopup();
        this.highlightSidebarItem(venue.name);
    }

    highlightSidebarItem(name) {
        document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
        const item = document.querySelector(`.sidebar-item[data-venue="${CSS.escape(name)}"]`);
        if (item) { item.classList.add('active'); item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    }

    filterMarkers(type) {
        const filtered = type === 'all' ? this.venues : this.venues.filter(v => v.type === type);
        Object.values(this.markers).forEach(({ marker, venue }) => {
            if (type === 'all' || venue.type === type) marker.addTo(this.map);
            else marker.remove();
        });
        this._lastFilteredVenues = filtered;
        this.renderSidebar(filtered);
    }

    resetView() {
        if (!this.map) return;
        this.stopRotate();
        this.stopTour();
        this.map.flyTo({ ...this.defaultView, duration: 1600, curve: 1.3, essential: true });
    }

    toggleRotate() {
        this.rotating = !this.rotating;
        const btn = document.getElementById('map-rotate');
        if (btn) btn.classList.toggle('active', this.rotating);
        if (this.rotating) this._rotateStep();
        else if (this._rotateFrame) cancelAnimationFrame(this._rotateFrame);
    }

    _rotateStep() {
        if (!this.rotating || !this.map) return;
        this.map.setBearing((this.map.getBearing() + 0.045) % 360);
        this._rotateFrame = requestAnimationFrame(() => this._rotateStep());
    }

    stopRotate() {
        if (!this.rotating) return;
        this.rotating = false;
        const btn = document.getElementById('map-rotate');
        if (btn) btn.classList.remove('active');
        if (this._rotateFrame) cancelAnimationFrame(this._rotateFrame);
    }

    // Cinematic guided tour: flies through the top-rated venue(s) in each
    // category in turn, pausing to pop up each one before moving on.
    toggleTour() {
        if (this._touring) this.stopTour();
        else this.startTour();
    }

    startTour() {
        if (!this.map || this._touring) return;
        this.stopRotate();
        const byCategory = {};
        this.venues.forEach((v) => { (byCategory[v.type] = byCategory[v.type] || []).push(v); });
        const stops = [];
        Object.values(byCategory).forEach((list) => {
            list.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 2).forEach((v) => stops.push(v));
        });
        if (!stops.length) return;
        this._touring = true;
        this._tourStops = stops;
        this._tourIndex = 0;
        const btn = document.getElementById('map-tour');
        if (btn) { btn.classList.add('active'); btn.innerHTML = '<i class="fas fa-stop"></i>'; btn.title = this.t('map.stopTour'); }
        this._runTourStep();
    }

    _runTourStep() {
        if (!this._touring || !this.map) return;
        if (this._tourIndex >= this._tourStops.length) { this._finishTour(); return; }
        const venue = this._tourStops[this._tourIndex];
        this.map.flyTo({
            center: [venue.lng, venue.lat], zoom: 17.2, pitch: 58,
            bearing: (this.map.getBearing() + 28) % 360, duration: 2600, curve: 1.3, essential: true
        });
        this.highlightSidebarItem(venue.name);
        this._tourTimer = setTimeout(() => {
            if (!this._touring) return;
            const entry = this.markers[venue.name];
            if (entry && entry.marker.getPopup && !entry.marker.getPopup().isOpen()) entry.marker.togglePopup();
            this._tourTimer = setTimeout(() => {
                if (!this._touring) return;
                const openEntry = this.markers[venue.name];
                if (openEntry && openEntry.marker.getPopup && openEntry.marker.getPopup().isOpen()) openEntry.marker.togglePopup();
                this._tourIndex++;
                this._runTourStep();
            }, 2200);
        }, 2700);
    }

    _finishTour() {
        this._touring = false;
        const btn = document.getElementById('map-tour');
        if (btn) { btn.classList.remove('active'); btn.innerHTML = '<i class="fas fa-play"></i>'; btn.title = this.t('map.startTour'); }
        this.resetView();
    }

    stopTour() {
        if (!this._touring) return;
        this._touring = false;
        if (this._tourTimer) clearTimeout(this._tourTimer);
        const btn = document.getElementById('map-tour');
        if (btn) { btn.classList.remove('active'); btn.innerHTML = '<i class="fas fa-play"></i>'; btn.title = this.t('map.startTour'); }
    }

    showRouteTo(lat, lng, name) {
        if (!this.map) return;
        this.stopRotate();
        this.stopTour();
        if (!navigator.geolocation) { alert(this.t('adventure.locationError')); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                this.clearRoute();
                const userLat = pos.coords.latitude, userLng = pos.coords.longitude;
                this.fetchRoute([[userLng, userLat], [lng, lat]], [{ name, lat, lng, icon: '📍' }]);
            },
            () => {
                this.map.flyTo({ center: [lng, lat], zoom: 17, pitch: 58, duration: 1600, essential: true });
                const entry = this.markers[name];
                if (entry && entry.marker.getPopup && !entry.marker.getPopup().isOpen()) entry.marker.togglePopup();
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    showAdventurePanel() {
        if (document.getElementById('adventure-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'adventure-panel';
        panel.innerHTML = `
            <div class="adventure-overlay"></div>
            <div class="adventure-box">
                <h3><i class="fas fa-hiking"></i> ${this.t('adventure.whatToSee')}</h3>
                <div class="adventure-categories">
                    <button class="adventure-cat" data-cat="restaurant">${this.t('adventure.food')}</button>
                    <button class="adventure-cat" data-cat="cafe">${this.t('adventure.drinks')}</button>
                    <button class="adventure-cat" data-cat="attraction">${this.t('adventure.history')}</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        requestAnimationFrame(() => panel.classList.add('active'));
        panel.querySelector('.adventure-overlay').addEventListener('click', () => { panel.remove(); });
        panel.querySelectorAll('.adventure-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.dataset.cat;
                panel.querySelector('.adventure-box').innerHTML = `<div class="adventure-loading"><i class="fas fa-spinner fa-spin"></i> ${this.t('adventure.locating')}</div>`;
                this.startAdventure(cat, panel);
            });
        });
    }

    startAdventure(category, panel) {
        if (!navigator.geolocation) {
            panel.remove();
            alert(this.t('adventure.locationError'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const userLat = pos.coords.latitude, userLng = pos.coords.longitude;
                const venuesInCat = this.venues.filter(v => v.type === category);
                if (venuesInCat.length === 0) {
                    panel.remove();
                    alert(this.t('adventure.noVenues'));
                    return;
                }
                venuesInCat.forEach(v => {
                    v._dist = Math.sqrt(Math.pow(v.lat - userLat, 2) + Math.pow(v.lng - userLng, 2));
                });
                venuesInCat.sort((a, b) => a._dist - b._dist);
                const closest3 = venuesInCat.slice(0, 3);
                panel.remove();
                this.clearRoute();
                const waypoints = [[userLng, userLat]];
                closest3.forEach(v => waypoints.push([v.lng, v.lat]));
                this.fetchRoute(waypoints, closest3);
            },
            () => {
                panel.remove();
                alert(this.t('adventure.locationError'));
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    async fetchRoute(waypoints, stops) {
        const coords = waypoints.map(p => p.join(',')).join(';');
        const url = `https://router.project-osrm.org/route/v1/walking/${coords}?geometries=geojson&overview=full`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                this.drawRoute(route.geometry, stops, waypoints[0]);
                const distKm = (route.distance / 1000).toFixed(1);
                const durMin = Math.round(route.duration / 60);
                this.showRouteInfo(stops, distKm, durMin);
            } else {
                this.drawStraightLine(waypoints, stops);
            }
        } catch {
            this.drawStraightLine(waypoints, stops);
        }
    }

    addRouteStopMarkers(stops) {
        stops.forEach((stop, i) => {
            const el = document.createElement('div');
            el.className = 'route-stop-num';
            el.textContent = String(i + 1);
            const popup = new maplibregl.Popup({ offset: 18 }).setHTML(`<b>${this.t('adventure.stop')} ${i + 1}:</b> ${stop.name}`);
            const m = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([stop.lng, stop.lat]).setPopup(popup).addTo(this.map);
            this.routeMarkers.push(m);
        });
    }

    drawRoute(geometry, stops, userCoord) {
        if (!this.map) return;
        this.clearRouteLayers();
        this.map.addSource('feelbg-route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry } });
        this.map.addLayer({
            id: 'feelbg-route-line', type: 'line', source: 'feelbg-route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#ffd700', 'line-width': 5, 'line-opacity': 0.9, 'line-dasharray': [2, 1.4] }
        });
        this.routeLayerActive = true;

        const userEl = document.createElement('div');
        userEl.className = 'map-pin';
        userEl.style.background = '#10b981';
        userEl.innerHTML = '<span>📍</span>';
        this.userMarker = new maplibregl.Marker({ element: userEl, anchor: 'bottom' }).setLngLat([userCoord[0], userCoord[1]]).addTo(this.map);
        this.routeMarkers.push(this.userMarker);

        this.addRouteStopMarkers(stops);

        const bounds = new maplibregl.LngLatBounds();
        (geometry.coordinates || []).forEach(c => bounds.extend(c));
        bounds.extend(userCoord);
        if (!bounds.isEmpty()) this.map.fitBounds(bounds, { padding: 70, pitch: 40, bearing: 0, duration: 1400 });
    }

    drawStraightLine(waypoints, stops) {
        if (!this.map) return;
        this.clearRouteLayers();
        const geometry = { type: 'LineString', coordinates: waypoints };
        this.map.addSource('feelbg-route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry } });
        this.map.addLayer({
            id: 'feelbg-route-line', type: 'line', source: 'feelbg-route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#ffd700', 'line-width': 4, 'line-dasharray': [2, 1.4] }
        });
        this.routeLayerActive = true;

        this.addRouteStopMarkers(stops);

        const bounds = new maplibregl.LngLatBounds();
        waypoints.forEach(c => bounds.extend(c));
        if (!bounds.isEmpty()) this.map.fitBounds(bounds, { padding: 70, pitch: 40, bearing: 0, duration: 1400 });
    }

    showRouteInfo(stops, distKm, durMin) {
        let existing = document.getElementById('route-info-bar');
        if (existing) existing.remove();
        const bar = document.createElement('div');
        bar.id = 'route-info-bar';
        bar.innerHTML = `
            <div class="route-info-content">
                <i class="fas fa-route"></i>
                <span>${this.t('adventure.walking')}: ${distKm}km · ${durMin} min</span>
                <span class="route-stops-list">${stops.map((s, i) => `<span class="route-stop-tag">${i + 1}. ${s.name}</span>`).join('')}</span>
            </div>
            <button class="route-clear-btn" id="route-clear"><i class="fas fa-times"></i></button>
        `;
        const container = this.modal.querySelector('.map-modal__container');
        container.appendChild(bar);
        document.getElementById('route-clear')?.addEventListener('click', () => {
            this.clearRoute();
            bar.remove();
        });
    }

    clearRouteLayers() {
        if (!this.map || !this.routeLayerActive) return;
        if (this.map.getLayer('feelbg-route-line')) this.map.removeLayer('feelbg-route-line');
        if (this.map.getSource('feelbg-route')) this.map.removeSource('feelbg-route');
        this.routeLayerActive = false;
    }

    clearRoute() {
        this.clearRouteLayers();
        this.routeMarkers.forEach(m => m.remove());
        this.routeMarkers = [];
        if (this.userMarker) { this.userMarker.remove(); this.userMarker = null; }
        const bar = document.getElementById('route-info-bar');
        if (bar) bar.remove();
    }

    showMapFallback() {
        const mapEl = document.getElementById('belgrade-map');
        if (mapEl) {
            mapEl.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#0f1e4d;color:#f4efe2;">
                    <i class="fas fa-map-marked-alt" style="font-size:4rem;margin-bottom:1rem;opacity:0.6;color:#b8860b"></i>
                    <p style="font-size:1.2rem;font-weight:600">Map loading...</p>
                    <a href="https://www.openstreetmap.org/#map=14/44.8178/20.4568" target="_blank"
                       style="margin-top:1rem;padding:0.75rem 2rem;background:linear-gradient(135deg,#b8860b,#ffd700);color:#14204a;font-weight:700;border-radius:8px;text-decoration:none">
                        View on OpenStreetMap</a>
                </div>`;
        }
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #map-modal{display:none;position:fixed;inset:0;z-index:99999;align-items:center;justify-content:center}
            #map-modal.active{display:flex}
            .map-modal__overlay{position:absolute;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px)}
            .map-modal__container{position:relative;z-index:1;width:96vw;max-width:1200px;height:88vh;background:#0a1128;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 25px 80px rgba(0,0,0,.5);animation:mapSlideIn .35s cubic-bezier(.34,1.56,.64,1)}
            @keyframes mapSlideIn{from{opacity:0;transform:translateY(30px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
            .map-modal__header{display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;background:linear-gradient(135deg,#1e3a8a,#2d5be3);color:white;flex-shrink:0;flex-wrap:wrap}
            .map-modal__title{display:flex;align-items:center;gap:.75rem;font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;flex:1}
            .map-modal__title i{font-size:1.4rem;color:#b8860b}
            .map-venue-count{background:rgba(255,255,255,.2);padding:.2rem .75rem;border-radius:20px;font-size:.8rem;font-family:'Poppins',sans-serif}
            .map-modal__filters{display:flex;gap:.5rem;flex-wrap:wrap}
            .map-filter{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:white;padding:.4rem 1rem;border-radius:20px;cursor:pointer;font-size:.82rem;font-family:'Poppins',sans-serif;transition:all .2s;display:flex;align-items:center;gap:.4rem}
            .map-filter:hover,.map-filter.active{background:#b8860b;border-color:#b8860b}
            .map-adventure-btn{background:linear-gradient(135deg,#b8860b,#d4a017);border:none;color:white;padding:.45rem 1.2rem;border-radius:20px;cursor:pointer;font-size:.85rem;font-family:'Poppins',sans-serif;font-weight:600;display:flex;align-items:center;gap:.5rem;transition:all .2s;white-space:nowrap}
            .map-adventure-btn:hover{background:linear-gradient(135deg,#d4a017,#ffd700);transform:scale(1.05)}
            .map-icon-btn{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:white;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
            .map-icon-btn:hover{background:#b8860b;border-color:#b8860b}
            .map-icon-btn.active{background:#b8860b;border-color:#ffd700;color:#14204a}
            .map-modal__close{background:rgba(255,255,255,.15);border:none;color:white;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:background .2s;margin-left:auto}
            .map-modal__close:hover{background:rgba(255,255,255,.3)}
            .map-modal__body{display:flex;flex:1;overflow:hidden}
            #belgrade-map{flex:1;min-height:0;z-index:1;background:#f3ede0}
            .map-sidebar{width:280px;flex-shrink:0;display:flex;flex-direction:column;border-left:1px solid rgba(184,134,11,.25);background:#0f1e4d;overflow:hidden}
            .map-sidebar__header{padding:1rem 1.25rem;font-weight:600;font-family:'Poppins',sans-serif;font-size:.9rem;color:#ffd700;border-bottom:1px solid rgba(184,134,11,.25);display:flex;align-items:center;gap:.5rem;flex-shrink:0;background:#0a1128}
            .map-sidebar__list{overflow-y:auto;flex:1}
            .sidebar-item{display:flex;align-items:center;gap:.75rem;padding:.75rem 1.25rem;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer;transition:background .15s}
            .sidebar-item:hover,.sidebar-item.active{background:rgba(184,134,11,.15)}
            .sidebar-item.active{border-left:3px solid #ffd700}
            .sidebar-item__icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
            .sidebar-item__info{flex:1;min-width:0}
            .sidebar-item__name{font-size:.85rem;font-weight:600;color:#f4efe2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .sidebar-item__area{font-size:.75rem;color:#9aa8cc}
            .sidebar-item__rating{font-size:.75rem;color:#ffd700;font-weight:600;flex-shrink:0}
            .map-pin-wrap{position:relative;width:40px;height:48px;cursor:pointer}
            .map-pin{position:absolute;left:1px;top:0;width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(0,0,0,.5);border:2px solid rgba(255,255,255,.85)}
            .map-pin span{transform:rotate(45deg);font-size:1rem;display:block}
            .map-pin__pulse{position:absolute;left:9px;top:8px;width:22px;height:22px;border-radius:50%;opacity:.55;animation:mapPinPulse 2.2s ease-out infinite}
            @keyframes mapPinPulse{0%{transform:scale(.6);opacity:.55}70%{transform:scale(2.1);opacity:0}100%{opacity:0}}
            #belgrade-map.map-is-moving .map-pin__pulse{animation-play-state:paused;opacity:0}
            .map-popup{font-family:'Poppins',sans-serif;min-width:210px}
            .map-popup__type{display:inline-block;color:white;padding:.15rem .6rem;border-radius:6px;font-size:.72rem;font-weight:600;margin-bottom:.4rem}
            .map-popup__name{font-size:1.05rem;font-weight:700;color:#1e293b;margin:0 0 .4rem;font-family:'Playfair Display',serif}
            .map-popup__desc{font-size:.8rem;color:#64748b;margin:0 0 .6rem;line-height:1.4}
            .map-popup__meta{display:flex;align-items:center;gap:.75rem;font-size:.78rem;margin-bottom:.75rem;flex-wrap:wrap}
            .map-popup__rating{color:#b8860b;font-weight:600}
            .map-popup__price{background:#f0f4ff;padding:.1rem .5rem;border-radius:8px;color:#1e3a8a;font-weight:600}
            .map-popup__area{color:#64748b}
            .map-popup__actions{display:flex;gap:.5rem}
            .map-popup__details{display:flex;align-items:center;gap:.4rem;background:linear-gradient(135deg,#1e3a8a,#2d5be3);color:white;border:none;padding:.5rem .8rem;border-radius:8px;font-size:.78rem;font-weight:600;justify-content:center;transition:filter .2s;cursor:pointer;font-family:'Poppins',sans-serif;flex:1}
            .map-popup__details:hover{filter:brightness(1.1)}
            .map-popup__call{display:flex;align-items:center;gap:.4rem;background:linear-gradient(135deg,#25d366,#128c7e);color:white;border:none;padding:.5rem .8rem;border-radius:8px;font-size:.78rem;font-weight:600;justify-content:center;transition:background .2s;cursor:pointer;font-family:'Poppins',sans-serif;flex:1}
            .map-popup__call:hover{background:linear-gradient(135deg,#128c7e,#075e54)}
            .maplibregl-popup-content{border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.3);padding:14px 16px}
            .maplibregl-popup-close-button{font-size:1.1rem;color:#94a3b8;padding:4px 8px}
            .maplibregl-ctrl-group{background:#0f1e4d!important;border:1px solid rgba(184,134,11,.3)!important}
            .maplibregl-ctrl-group button{filter:invert(1) brightness(1.3)}
            .route-stop-num{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#1e3a8a,#2d5be3);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9rem;font-family:'Poppins',sans-serif;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);cursor:pointer}
            #route-info-bar{display:flex;align-items:center;justify-content:space-between;padding:.6rem 1.5rem;background:linear-gradient(135deg,#1e3a8a,#2d5be3);color:white;font-size:.85rem;font-family:'Poppins',sans-serif;gap:1rem;flex-shrink:0}
            .route-info-content{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;flex:1}
            .route-info-content i{color:#b8860b}
            .route-stops-list{display:flex;gap:.5rem;flex-wrap:wrap}
            .route-stop-tag{background:rgba(255,255,255,.2);padding:.15rem .6rem;border-radius:12px;font-size:.75rem}
            .route-clear-btn{background:rgba(255,255,255,.2);border:none;color:white;width:28px;height:28px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0}
            .route-clear-btn:hover{background:rgba(255,255,255,.4)}
            #adventure-panel{position:fixed;inset:0;z-index:100001;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s}
            #adventure-panel.active{opacity:1}
            .adventure-overlay{position:absolute;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px)}
            .adventure-box{position:relative;background:white;border-radius:20px;padding:2rem;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.3);text-align:center;transform:translateY(20px) scale(.95);transition:transform .3s}
            #adventure-panel.active .adventure-box{transform:translateY(0) scale(1)}
            .adventure-box h3{font-family:'Playfair Display',serif;font-size:1.4rem;color:#1e3a8a;margin:0 0 1.5rem;display:flex;align-items:center;justify-content:center;gap:.5rem}
            .adventure-box h3 i{color:#b8860b}
            .adventure-categories{display:flex;flex-direction:column;gap:.75rem}
            .adventure-cat{padding:1rem;border:2px solid #e5e7eb;border-radius:14px;background:white;font-size:1.1rem;font-family:'Poppins',sans-serif;cursor:pointer;transition:all .2s;font-weight:600}
            .adventure-cat:hover{border-color:#b8860b;background:#fffbf0;transform:scale(1.02)}
            .adventure-loading{padding:2rem;text-align:center;color:#1e3a8a;font-size:1.1rem;font-family:'Poppins',sans-serif}
            .adventure-loading i{font-size:1.5rem;margin-right:.5rem;color:#b8860b}
            .detail-modal__route-btn{display:flex;align-items:center;justify-content:center;gap:.5rem;padding:.65rem 1.2rem;background:linear-gradient(135deg,#1e3a8a,#2d5be3);color:white;border:none;border-radius:10px;font-family:'Poppins',sans-serif;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .2s;flex:1}
            .detail-modal__route-btn:hover{background:linear-gradient(135deg,#2d5be3,#3b82f6);transform:translateY(-1px)}
            @media(max-width:768px){
                .map-modal__container{width:100vw;height:100vh;border-radius:0}
                .map-sidebar{display:none}
                .map-modal__header{padding:.75rem 1rem}
                .map-modal__filters{display:none}
            }
        `;
        document.head.appendChild(style);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.belgradeMap = new BelgradeMap();
    const venueCoords = {};
    window.belgradeMap.venues.forEach(v => { venueCoords[v.name.toLowerCase()] = { lat: v.lat, lng: v.lng }; });
    document.querySelectorAll('.place-card').forEach(card => {
        const titleEl = card.querySelector('.place-card__title');
        if (!titleEl) return;
        const name = titleEl.textContent.trim().toLowerCase();
        const match = venueCoords[name];
        if (match) {
            card.dataset.lat = match.lat;
            card.dataset.lng = match.lng;
        }
    });
});
