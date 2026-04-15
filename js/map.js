'use strict';

class BelgradeMap {
    constructor() {
        this.map = null;
        this.modal = null;
        this.routeLayer = null;
        this.routeMarkers = [];
        this.userMarker = null;
        this.venues = this.buildVenuesFromDB();
        this.init();
    }

    static venueSlug(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
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
            list.forEach(v => {
                result.push({
                    name: v.name, type: types[cat], area: v.area,
                    lat: v.lat, lng: v.lng, rating: v.rating,
                    price: v.priceLabel || '', icon: icons[cat], color: colors[cat],
                    desc: v.description, image: v.image
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
        return lang[key] || fallback[key] || key;
    }

    init() {
        this.createModal();
        this.bindTriggers();
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
    }

    openMap() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (!this.map) {
            requestAnimationFrame(() => setTimeout(() => this.initLeafletMap(), 100));
        } else {
            this.map.invalidateSize();
        }
    }

    closeMap() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    initLeafletMap() {
        if (!window.L) { this.showMapFallback(); return; }
        this.map = L.map('belgrade-map', { center: [44.8178, 20.4568], zoom: 13, zoomControl: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(this.map);
        this.markers = {};
        this.venues.forEach(venue => {
            const marker = this.createMarker(venue);
            this.markers[venue.name] = { marker, venue };
        });
        this.renderSidebar(this.venues);
    }

    createMarker(venue) {
        const icon = L.divIcon({
            html: `<div class="map-pin" style="background:${venue.color}"><span>${venue.icon}</span></div>`,
            className: 'map-custom-icon',
            iconSize: [40, 48],
            iconAnchor: [20, 48],
            popupAnchor: [0, -48],
        });
        const marker = L.marker([venue.lat, venue.lng], { icon })
            .addTo(this.map)
            .bindPopup(this.createPopup(venue), { maxWidth: 260 });
        marker.on('click', () => this.highlightSidebarItem(venue.name));
        return marker;
    }

    createPopup(venue) {
        const typeLabels = { restaurant: this.t('map.restaurant'), cafe: this.t('map.cafeBar'), nightlife: this.t('map.nightlifeLabel'), attraction: this.t('map.attraction') };
        var translatedDesc = this.getTranslatedVenue(venue, 'desc');
        var translatedPrice = venue.price ? venue.price.replace(/per person/i, this.t('venue.price.perPerson')) : '';
        return `
            <div class="map-popup">
                <div class="map-popup__type" style="background:${venue.color}">${typeLabels[venue.type]}</div>
                <h3 class="map-popup__name">${venue.name}</h3>
                <div class="map-popup__meta">
                    <span class="map-popup__rating">⭐ ${venue.rating}</span>
                    ${translatedPrice ? `<span class="map-popup__price">${translatedPrice}</span>` : ''}
                    <span class="map-popup__area">${venue.area}</span>
                </div>
                <p class="map-popup__desc">${translatedDesc}</p>
                ${venue.type === 'attraction' ? '' : `<button class="map-popup__call" data-booking="${venue.name}"><i class="fas fa-calendar-check"></i> ${this.t('map.reserve')}</button>`}
            </div>
        `;
    }

    renderSidebar(venues) {
        const list = document.getElementById('sidebar-list');
        if (!list) return;
        list.innerHTML = venues.map(v => `
            <div class="sidebar-item" data-venue="${v.name}" data-lat="${v.lat}" data-lng="${v.lng}">
                <div class="sidebar-item__icon" style="background:${v.color}">${v.icon}</div>
                <div class="sidebar-item__info">
                    <div class="sidebar-item__name">${v.name}</div>
                    <div class="sidebar-item__area">${v.area}</div>
                </div>
                <div class="sidebar-item__rating">⭐ ${v.rating}</div>
            </div>
        `).join('');
        list.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const name = item.dataset.venue;
                this.map.setView([parseFloat(item.dataset.lat), parseFloat(item.dataset.lng)], 16, { animate: true });
                this.markers[name]?.marker.openPopup();
                this.highlightSidebarItem(name);
            });
        });
    }

    highlightSidebarItem(name) {
        document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
        const item = document.querySelector(`.sidebar-item[data-venue="${name}"]`);
        if (item) { item.classList.add('active'); item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    }

    filterMarkers(type) {
        const filtered = type === 'all' ? this.venues : this.venues.filter(v => v.type === type);
        Object.values(this.markers).forEach(({ marker, venue }) => {
            if (type === 'all' || venue.type === type) marker.addTo(this.map);
            else this.map.removeLayer(marker);
        });
        this.renderSidebar(filtered);
    }

    showRouteTo(lat, lng, name) {
        if (!this.map) return;
        if (!navigator.geolocation) { alert(this.t('adventure.locationError')); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                this.clearRoute();
                const userLat = pos.coords.latitude, userLng = pos.coords.longitude;
                this.fetchRoute([[userLng, userLat], [lng, lat]], [{ name, lat, lng, icon: '📍' }]);
            },
            () => {
                this.map.setView([lat, lng], 16, { animate: true });
                if (this.markers[name]) this.markers[name].marker.openPopup();
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

    drawRoute(geometry, stops, userCoord) {
        if (!this.map) return;
        this.routeLayer = L.geoJSON(geometry, {
            style: { color: '#1e3a8a', weight: 5, opacity: 0.8, dashArray: '10,6' }
        }).addTo(this.map);

        const userIcon = L.divIcon({
            html: '<div class="map-pin" style="background:#10b981"><span>📍</span></div>',
            className: 'map-custom-icon', iconSize: [40, 48], iconAnchor: [20, 48]
        });
        this.userMarker = L.marker([userCoord[1], userCoord[0]], { icon: userIcon }).addTo(this.map);
        this.routeMarkers.push(this.userMarker);

        stops.forEach((stop, i) => {
            const numIcon = L.divIcon({
                html: `<div class="route-stop-num">${i + 1}</div>`,
                className: 'map-custom-icon', iconSize: [32, 32], iconAnchor: [16, 16]
            });
            const m = L.marker([stop.lat, stop.lng], { icon: numIcon }).addTo(this.map)
                .bindPopup(`<b>${this.t('adventure.stop')} ${i + 1}:</b> ${stop.name}`);
            this.routeMarkers.push(m);
        });

        const bounds = this.routeLayer.getBounds();
        if (bounds.isValid()) this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    drawStraightLine(waypoints, stops) {
        const latlngs = waypoints.map(p => [p[1], p[0]]);
        this.routeLayer = L.polyline(latlngs, { color: '#1e3a8a', weight: 4, dashArray: '10,6' }).addTo(this.map);
        stops.forEach((stop, i) => {
            const numIcon = L.divIcon({
                html: `<div class="route-stop-num">${i + 1}</div>`,
                className: 'map-custom-icon', iconSize: [32, 32], iconAnchor: [16, 16]
            });
            const m = L.marker([stop.lat, stop.lng], { icon: numIcon }).addTo(this.map)
                .bindPopup(`<b>${this.t('adventure.stop')} ${i + 1}:</b> ${stop.name}`);
            this.routeMarkers.push(m);
        });
        if (this.routeLayer.getBounds) {
            const bounds = this.routeLayer.getBounds();
            if (bounds.isValid()) this.map.fitBounds(bounds, { padding: [50, 50] });
        }
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

    clearRoute() {
        if (this.routeLayer) { this.map.removeLayer(this.routeLayer); this.routeLayer = null; }
        this.routeMarkers.forEach(m => this.map.removeLayer(m));
        this.routeMarkers = [];
        if (this.userMarker) { this.map.removeLayer(this.userMarker); this.userMarker = null; }
        const bar = document.getElementById('route-info-bar');
        if (bar) bar.remove();
    }

    showMapFallback() {
        const mapEl = document.getElementById('belgrade-map');
        if (mapEl) {
            mapEl.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#f0f4ff;color:#1e3a8a;">
                    <i class="fas fa-map-marked-alt" style="font-size:4rem;margin-bottom:1rem;opacity:0.5"></i>
                    <p style="font-size:1.2rem;font-weight:600">Map loading...</p>
                    <a href="https://www.openstreetmap.org/#map=14/44.8178/20.4568" target="_blank"
                       style="margin-top:1rem;padding:0.75rem 2rem;background:#1e3a8a;color:white;border-radius:8px;text-decoration:none">
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
            .map-modal__container{position:relative;z-index:1;width:96vw;max-width:1200px;height:88vh;background:#fff;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 25px 80px rgba(0,0,0,.5);animation:mapSlideIn .35s cubic-bezier(.34,1.56,.64,1)}
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
            .map-modal__close{background:rgba(255,255,255,.15);border:none;color:white;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:background .2s;margin-left:auto}
            .map-modal__close:hover{background:rgba(255,255,255,.3)}
            .map-modal__body{display:flex;flex:1;overflow:hidden}
            #belgrade-map{flex:1;min-height:0;z-index:1}
            .map-sidebar{width:280px;flex-shrink:0;display:flex;flex-direction:column;border-left:1px solid #e5e7eb;background:#f8faff;overflow:hidden}
            .map-sidebar__header{padding:1rem 1.25rem;font-weight:600;font-family:'Poppins',sans-serif;font-size:.9rem;color:#1e3a8a;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:.5rem;flex-shrink:0;background:white}
            .map-sidebar__list{overflow-y:auto;flex:1}
            .sidebar-item{display:flex;align-items:center;gap:.75rem;padding:.75rem 1.25rem;border-bottom:1px solid #f0f0f0;cursor:pointer;transition:background .15s}
            .sidebar-item:hover,.sidebar-item.active{background:#eff6ff}
            .sidebar-item.active{border-left:3px solid #1e3a8a}
            .sidebar-item__icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
            .sidebar-item__info{flex:1;min-width:0}
            .sidebar-item__name{font-size:.85rem;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .sidebar-item__area{font-size:.75rem;color:#64748b}
            .sidebar-item__rating{font-size:.75rem;color:#b8860b;font-weight:600;flex-shrink:0}
            .map-custom-icon{background:none;border:none}
            .map-pin{width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(0,0,0,.3);border:2px solid rgba(255,255,255,.8)}
            .map-pin span{transform:rotate(45deg);font-size:1rem;display:block}
            .map-popup{font-family:'Poppins',sans-serif;min-width:200px}
            .map-popup__type{display:inline-block;color:white;padding:.15rem .6rem;border-radius:6px;font-size:.72rem;font-weight:600;margin-bottom:.4rem}
            .map-popup__name{font-size:1.05rem;font-weight:700;color:#1e293b;margin:0 0 .4rem;font-family:'Playfair Display',serif}
            .map-popup__desc{font-size:.8rem;color:#64748b;margin:0 0 .6rem;line-height:1.4}
            .map-popup__meta{display:flex;align-items:center;gap:.75rem;font-size:.78rem;margin-bottom:.75rem;flex-wrap:wrap}
            .map-popup__rating{color:#b8860b;font-weight:600}
            .map-popup__price{background:#f0f4ff;padding:.1rem .5rem;border-radius:8px;color:#1e3a8a;font-weight:600}
            .map-popup__area{color:#64748b}
            .map-popup__call{display:flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,#25d366,#128c7e);color:white;border:none;padding:.5rem 1rem;border-radius:8px;font-size:.82rem;font-weight:600;justify-content:center;transition:background .2s;cursor:pointer;font-family:'Poppins',sans-serif;width:100%}
            .map-popup__call:hover{background:linear-gradient(135deg,#128c7e,#075e54)}
            .leaflet-popup-content-wrapper{border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.2)}
            .leaflet-popup-content{margin:14px 16px}
            .route-stop-num{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#1e3a8a,#2d5be3);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9rem;font-family:'Poppins',sans-serif;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)}
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
