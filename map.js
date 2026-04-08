/* ============================================
   BELGRADE INTERACTIVE MAP
   Leaflet.js + OpenStreetMap
   ============================================ */

'use strict';

class BelgradeMap {
    constructor() {
        this.map = null;
        this.modal = null;
        this.venues = [
            // Restaurants
            { name: 'Salon 1905', type: 'restaurant', area: 'Stari Grad', lat: 44.8196, lng: 20.4601, rating: 4.9, price: '$$$', icon: '🍽️', color: '#b8860b', desc: 'Elegant Serbian cuisine with live music' },
            { name: 'Znak Pitanja', type: 'restaurant', area: 'Stari Grad', lat: 44.8202, lng: 20.4589, rating: 4.8, price: '$$', icon: '🍽️', color: '#b8860b', desc: 'The Question Mark — Belgrades oldest restaurant (1823)' },
            { name: 'Skadarlija House', type: 'restaurant', area: 'Skadarlija', lat: 44.8185, lng: 20.4632, rating: 4.7, price: '$$', icon: '🍽️', color: '#b8860b', desc: 'Bohemian quarter dining' },
            { name: 'Mala Fabrika Ukusa', type: 'restaurant', area: 'Vračar', lat: 44.8073, lng: 20.4701, rating: 4.8, price: '$$', icon: '🍽️', color: '#b8860b', desc: 'Small Factory of Taste — artisan Serbian' },
            { name: 'Topola Restaurant', type: 'restaurant', area: 'Dedinje', lat: 44.7834, lng: 20.4512, rating: 4.6, price: '$$$', icon: '🍽️', color: '#b8860b', desc: 'Garden dining in tranquil Dedinje' },
            { name: 'Lorenzo & Kakalamba', type: 'restaurant', area: 'Stari Grad', lat: 44.8210, lng: 20.4561, rating: 4.9, price: '$$$$', icon: '🍽️', color: '#b8860b', desc: 'Fine dining with a theatrical twist' },
            { name: 'Trattoria Mamma Mia', type: 'restaurant', area: 'Savamala', lat: 44.8135, lng: 20.4528, rating: 4.7, price: '$$', icon: '🍕', color: '#b8860b', desc: 'Authentic Italian in Savamala district' },
            { name: 'Sushi Bar Fuji', type: 'restaurant', area: 'Novi Beograd', lat: 44.8065, lng: 20.4230, rating: 4.6, price: '$$$', icon: '🍱', color: '#b8860b', desc: 'Premium Japanese cuisine' },
            { name: 'Manufaktura', type: 'restaurant', area: 'Dorćol', lat: 44.8226, lng: 20.4638, rating: 4.5, price: '$$', icon: '🍽️', color: '#b8860b', desc: 'Modern Serbian craft gastronomy' },
            { name: 'Tajna Baste', type: 'restaurant', area: 'Zemun', lat: 44.8397, lng: 20.4011, rating: 4.8, price: '$$$', icon: '🌿', color: '#b8860b', desc: 'Secret garden restaurant by the Danube' },
            { name: 'Đulagino Vrelo', type: 'restaurant', area: 'Topčider', lat: 44.7812, lng: 20.4478, rating: 4.7, price: '$$', icon: '🍖', color: '#b8860b', desc: 'Traditional Serbian grill in nature' },
            { name: 'Pekara Trpković', type: 'restaurant', area: 'Zemun', lat: 44.8378, lng: 20.4023, rating: 4.5, price: '$', icon: '🥐', color: '#b8860b', desc: 'Classic Belgrade bakery since 1935' },
            { name: 'Green Mood Vegan', type: 'restaurant', area: 'Vračar', lat: 44.8081, lng: 20.4685, rating: 4.6, price: '$$', icon: '🥗', color: '#2d8a4e', desc: 'Plant-based cuisine in the heart of Belgrade' },
            { name: 'Little Bay', type: 'restaurant', area: 'Stari Grad', lat: 44.8199, lng: 20.4594, rating: 4.8, price: '$$$', icon: '🎭', color: '#b8860b', desc: 'Opera-themed bistro with nightly performances' },
            { name: 'Brunch & Beyond', type: 'restaurant', area: 'Savamala', lat: 44.8124, lng: 20.4539, rating: 4.5, price: '$$', icon: '🥞', color: '#b8860b', desc: 'All-day brunch spot beloved by locals' },

            // Cafes & Bars
            { name: 'Kafana Dva Jelena', type: 'cafe', area: 'Skadarlija', lat: 44.8180, lng: 20.4640, rating: 4.8, price: '$$', icon: '☕', color: '#1e3a8a', desc: 'Classic kafana with live tamburitza music' },
            { name: 'Supermarket Bar', type: 'cafe', area: 'Savamala', lat: 44.8141, lng: 20.4521, rating: 4.7, price: '$$', icon: '🍸', color: '#1e3a8a', desc: 'Trendy rooftop cocktail bar in Savamala' },
            { name: 'Stara Čukara', type: 'cafe', area: 'Stari Grad', lat: 44.8208, lng: 20.4572, rating: 4.6, price: '$', icon: '☕', color: '#1e3a8a', desc: 'Old Belgrade coffee house with live music' },
            { name: 'Cantina del Gusto', type: 'cafe', area: 'Vračar', lat: 44.8067, lng: 20.4690, rating: 4.7, price: '$$', icon: '🍷', color: '#1e3a8a', desc: 'Wine bar with premium Serbian vintages' },
            { name: 'Mint Rooftop Bar', type: 'cafe', area: 'Novi Beograd', lat: 44.8058, lng: 20.4198, rating: 4.9, price: '$$$', icon: '🍹', color: '#1e3a8a', desc: 'Sky-high cocktails with panoramic views' },
            { name: 'Caffe Imperiale', type: 'cafe', area: 'Stari Grad', lat: 44.8214, lng: 20.4555, rating: 4.5, price: '$$', icon: '☕', color: '#1e3a8a', desc: 'European-style cafe in a grand setting' },
            { name: 'Rekord Bar', type: 'cafe', area: 'Dorćol', lat: 44.8231, lng: 20.4647, rating: 4.6, price: '$', icon: '🎵', color: '#1e3a8a', desc: 'Vinyl bar with craft beer selection' },
            { name: 'Balkan Brew', type: 'cafe', area: 'Savamala', lat: 44.8130, lng: 20.4533, rating: 4.7, price: '$$', icon: '🍺', color: '#1e3a8a', desc: 'Craft brewery with 20+ local beers on tap' },

            // Nightlife
            { name: 'Klub 20/44', type: 'nightlife', area: 'Savamala', lat: 44.8138, lng: 20.4516, rating: 4.8, price: '$$$', icon: '🎶', color: '#7c3aed', desc: 'Premier club for electronic music on the Sava' },
            { name: 'Freestyler Boat Club', type: 'nightlife', area: 'Sava', lat: 44.8148, lng: 20.4490, rating: 4.7, price: '$$$', icon: '🚢', color: '#7c3aed', desc: 'Legendary floating club on the Sava river' },
            { name: 'Ksenija Jazz Club', type: 'nightlife', area: 'Stari Grad', lat: 44.8204, lng: 20.4583, rating: 4.9, price: '$$', icon: '🎺', color: '#7c3aed', desc: 'Intimate jazz venue with world-class acts' },
            { name: 'Ben Akiba Stand-Up', type: 'nightlife', area: 'Stari Grad', lat: 44.8197, lng: 20.4592, rating: 4.6, price: '$$', icon: '🎤', color: '#7c3aed', desc: 'Comedy club with local and international acts' },
            { name: 'Lasta Club', type: 'nightlife', area: 'Zemun', lat: 44.8390, lng: 20.4006, rating: 4.5, price: '$$', icon: '🌙', color: '#7c3aed', desc: 'Riverside party venue in old Zemun' },
            { name: 'Drugstore Club', type: 'nightlife', area: 'Savamala', lat: 44.8145, lng: 20.4502, rating: 4.7, price: '$$$', icon: '💊', color: '#7c3aed', desc: 'Open-air electronic music venue near Beton Hala' },

            // Attractions
            { name: 'Kalemegdan Fortress', type: 'attraction', area: 'Stari Grad', lat: 44.8227, lng: 20.4513, rating: 4.9, price: 'Free', icon: '🏰', color: '#dc2626', desc: 'Ancient fortress at the confluence of two rivers' },
            { name: 'Skadarlija Bohemian Quarter', type: 'attraction', area: 'Skadarlija', lat: 44.8183, lng: 20.4638, rating: 4.8, price: 'Free', icon: '🎨', color: '#dc2626', desc: 'Cobblestone street lined with kafanas and art' },
            { name: 'Ada Ciganlija Beach', type: 'attraction', area: 'Čukarica', lat: 44.7955, lng: 20.4210, rating: 4.9, price: '€1', icon: '🏖️', color: '#dc2626', desc: 'Belgrades beach — river island paradise' },
            { name: 'Topčider Park', type: 'attraction', area: 'Topčider', lat: 44.7837, lng: 20.4460, rating: 4.7, price: 'Free', icon: '🌳', color: '#dc2626', desc: 'Royal park with 200-year-old plane trees' },
            { name: 'Nikola Tesla Museum', type: 'attraction', area: 'Vračar', lat: 44.8085, lng: 20.4660, rating: 4.8, price: '€3', icon: '⚡', color: '#dc2626', desc: 'World\'s only museum dedicated to Tesla' },
            { name: 'Saint Sava Temple', type: 'attraction', area: 'Vračar', lat: 44.7993, lng: 20.4671, rating: 4.9, price: 'Free', icon: '⛪', color: '#dc2626', desc: 'One of the world\'s largest Orthodox churches' },
            { name: 'Gardoš Tower, Zemun', type: 'attraction', area: 'Zemun', lat: 44.8427, lng: 20.3974, rating: 4.7, price: 'Free', icon: '🗼', color: '#dc2626', desc: 'Millennium Tower with panoramic Danube views' },
            { name: 'National Museum Belgrade', type: 'attraction', area: 'Stari Grad', lat: 44.8184, lng: 20.4577, rating: 4.6, price: '€3', icon: '🏛️', color: '#dc2626', desc: '3,000-year collection spanning Serbia\'s history' },
        ];

        this.init();
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
                        <span>Belgrade Map</span>
                        <span class="map-venue-count">${this.venues.length} venues</span>
                    </div>
                    <div class="map-modal__filters">
                        <button class="map-filter active" data-type="all">All</button>
                        <button class="map-filter" data-type="restaurant"><i class="fas fa-utensils"></i> Food</button>
                        <button class="map-filter" data-type="cafe"><i class="fas fa-coffee"></i> Cafes</button>
                        <button class="map-filter" data-type="nightlife"><i class="fas fa-music"></i> Nightlife</button>
                        <button class="map-filter" data-type="attraction"><i class="fas fa-landmark"></i> Sights</button>
                    </div>
                    <button class="map-modal__close" id="map-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="map-modal__body">
                    <div id="belgrade-map"></div>
                    <div class="map-sidebar" id="map-sidebar">
                        <div class="map-sidebar__header">
                            <i class="fas fa-list-ul"></i> Venue List
                        </div>
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
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openMap();
            });
        });

        document.getElementById('map-close')?.addEventListener('click', () => this.closeMap());
        document.getElementById('map-overlay')?.addEventListener('click', () => this.closeMap());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMap();
        });

        this.modal.querySelectorAll('.map-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                this.modal.querySelectorAll('.map-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterMarkers(btn.dataset.type);
            });
        });
    }

    openMap() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (!this.map) {
            requestAnimationFrame(() => {
                setTimeout(() => this.initLeafletMap(), 100);
            });
        } else {
            this.map.invalidateSize();
        }
    }

    closeMap() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    initLeafletMap() {
        if (!window.L) {
            this.showMapFallback();
            return;
        }

        this.map = L.map('belgrade-map', {
            center: [44.8178, 20.4568],
            zoom: 13,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
        const iconHtml = `
            <div class="map-pin" style="background:${venue.color}">
                <span>${venue.icon}</span>
            </div>
        `;

        const icon = L.divIcon({
            html: iconHtml,
            className: 'map-custom-icon',
            iconSize: [40, 48],
            iconAnchor: [20, 48],
            popupAnchor: [0, -48],
        });

        const marker = L.marker([venue.lat, venue.lng], { icon })
            .addTo(this.map)
            .bindPopup(this.createPopup(venue), { maxWidth: 260 });

        marker.on('click', () => {
            this.highlightSidebarItem(venue.name);
        });

        return marker;
    }

    createPopup(venue) {
        const typeLabel = { restaurant: 'Restaurant', cafe: 'Cafe & Bar', nightlife: 'Nightlife', attraction: 'Attraction' }[venue.type];
        return `
            <div class="map-popup">
                <div class="map-popup__type" style="background:${venue.color}">${typeLabel}</div>
                <h3 class="map-popup__name">${venue.name}</h3>
                <p class="map-popup__desc">${venue.desc}</p>
                <div class="map-popup__meta">
                    <span class="map-popup__rating"><i class="fas fa-star"></i> ${venue.rating}</span>
                    <span class="map-popup__price">${venue.price}</span>
                    <span class="map-popup__area"><i class="fas fa-map-marker-alt"></i> ${venue.area}</span>
                </div>
                <button class="map-popup__call" data-booking="${venue.name}">
                    <i class="fas fa-calendar-check"></i> Reserve a Table
                </button>
            </div>
        `;
    }

    renderSidebar(venues) {
        const list = document.getElementById('sidebar-list');
        if (!list) return;

        list.innerHTML = venues.map(venue => `
            <div class="sidebar-item" data-venue="${venue.name}" data-lat="${venue.lat}" data-lng="${venue.lng}">
                <div class="sidebar-item__icon" style="background:${venue.color}">${venue.icon}</div>
                <div class="sidebar-item__info">
                    <div class="sidebar-item__name">${venue.name}</div>
                    <div class="sidebar-item__area">${venue.area}</div>
                </div>
                <div class="sidebar-item__rating">⭐ ${venue.rating}</div>
            </div>
        `).join('');

        list.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const name = item.dataset.venue;
                const lat = parseFloat(item.dataset.lat);
                const lng = parseFloat(item.dataset.lng);
                this.map.setView([lat, lng], 16, { animate: true });
                this.markers[name]?.marker.openPopup();
                this.highlightSidebarItem(name);
            });
        });
    }

    highlightSidebarItem(name) {
        document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
        const item = document.querySelector(`.sidebar-item[data-venue="${name}"]`);
        if (item) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    filterMarkers(type) {
        const filtered = type === 'all' ? this.venues : this.venues.filter(v => v.type === type);

        Object.values(this.markers).forEach(({ marker, venue }) => {
            if (type === 'all' || venue.type === type) {
                marker.addTo(this.map);
            } else {
                this.map.removeLayer(marker);
            }
        });

        this.renderSidebar(filtered);
    }

    showMapFallback() {
        const mapEl = document.getElementById('belgrade-map');
        if (mapEl) {
            mapEl.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#f0f4ff;color:#1e3a8a;">
                    <i class="fas fa-map-marked-alt" style="font-size:4rem;margin-bottom:1rem;opacity:0.5"></i>
                    <p style="font-size:1.2rem;font-weight:600">Map loading...</p>
                    <p>Opening in OpenStreetMap</p>
                    <a href="https://www.openstreetmap.org/#map=14/44.8178/20.4568" target="_blank" 
                       style="margin-top:1rem;padding:0.75rem 2rem;background:#1e3a8a;color:white;border-radius:8px;text-decoration:none">
                        View on OpenStreetMap
                    </a>
                </div>
            `;
        }
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #map-modal {
                display: none;
                position: fixed;
                inset: 0;
                z-index: 99999;
                align-items: center;
                justify-content: center;
            }
            #map-modal.active {
                display: flex;
            }
            .map-modal__overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.75);
                backdrop-filter: blur(4px);
            }
            .map-modal__container {
                position: relative;
                z-index: 1;
                width: 96vw;
                max-width: 1200px;
                height: 88vh;
                background: #fff;
                border-radius: 20px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 80px rgba(0,0,0,0.5);
                animation: mapSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
            }
            @keyframes mapSlideIn {
                from { opacity:0; transform: translateY(30px) scale(0.97); }
                to   { opacity:1; transform: translateY(0)   scale(1); }
            }
            .map-modal__header {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem 1.5rem;
                background: linear-gradient(135deg, #1e3a8a, #2d5be3);
                color: white;
                flex-shrink: 0;
                flex-wrap: wrap;
            }
            .map-modal__title {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-family: 'Playfair Display', serif;
                font-size: 1.3rem;
                font-weight: 700;
                flex: 1;
            }
            .map-modal__title i { font-size: 1.4rem; color: #b8860b; }
            .map-venue-count {
                background: rgba(255,255,255,0.2);
                padding: 0.2rem 0.75rem;
                border-radius: 20px;
                font-size: 0.8rem;
                font-family: 'Poppins', sans-serif;
            }
            .map-modal__filters {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            .map-filter {
                background: rgba(255,255,255,0.15);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 0.4rem 1rem;
                border-radius: 20px;
                cursor: pointer;
                font-size: 0.82rem;
                font-family: 'Poppins', sans-serif;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 0.4rem;
            }
            .map-filter:hover, .map-filter.active {
                background: #b8860b;
                border-color: #b8860b;
            }
            .map-modal__close {
                background: rgba(255,255,255,0.15);
                border: none;
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
                margin-left: auto;
            }
            .map-modal__close:hover { background: rgba(255,255,255,0.3); }
            .map-modal__body {
                display: flex;
                flex: 1;
                overflow: hidden;
            }
            #belgrade-map {
                flex: 1;
                min-height: 0;
                z-index: 1;
            }
            .map-sidebar {
                width: 280px;
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                border-left: 1px solid #e5e7eb;
                background: #f8faff;
                overflow: hidden;
            }
            .map-sidebar__header {
                padding: 1rem 1.25rem;
                font-weight: 600;
                font-family: 'Poppins', sans-serif;
                font-size: 0.9rem;
                color: #1e3a8a;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex-shrink: 0;
                background: white;
            }
            .map-sidebar__list {
                overflow-y: auto;
                flex: 1;
            }
            .sidebar-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem 1.25rem;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: background 0.15s;
            }
            .sidebar-item:hover, .sidebar-item.active {
                background: #eff6ff;
            }
            .sidebar-item.active { border-left: 3px solid #1e3a8a; }
            .sidebar-item__icon {
                width: 36px;
                height: 36px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.1rem;
                flex-shrink: 0;
            }
            .sidebar-item__info { flex: 1; min-width: 0; }
            .sidebar-item__name {
                font-size: 0.85rem;
                font-weight: 600;
                color: #1e293b;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .sidebar-item__area {
                font-size: 0.75rem;
                color: #64748b;
            }
            .sidebar-item__rating {
                font-size: 0.75rem;
                color: #b8860b;
                font-weight: 600;
                flex-shrink: 0;
            }
            /* Map pin */
            .map-custom-icon { background: none; border: none; }
            .map-pin {
                width: 38px;
                height: 38px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 12px rgba(0,0,0,0.3);
                border: 2px solid rgba(255,255,255,0.8);
            }
            .map-pin span {
                transform: rotate(45deg);
                font-size: 1rem;
                display: block;
            }
            /* Popup */
            .map-popup { font-family: 'Poppins', sans-serif; min-width: 200px; }
            .map-popup__type {
                display: inline-block;
                color: white;
                padding: 0.15rem 0.6rem;
                border-radius: 12px;
                font-size: 0.72rem;
                font-weight: 600;
                margin-bottom: 0.4rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .map-popup__name {
                font-size: 1rem;
                font-weight: 700;
                color: #1e293b;
                margin: 0 0 0.4rem;
                font-family: 'Playfair Display', serif;
            }
            .map-popup__desc {
                font-size: 0.8rem;
                color: #64748b;
                margin: 0 0 0.6rem;
                line-height: 1.4;
            }
            .map-popup__meta {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-size: 0.78rem;
                margin-bottom: 0.75rem;
                flex-wrap: wrap;
            }
            .map-popup__rating { color: #b8860b; font-weight: 600; }
            .map-popup__price { background: #f0f4ff; padding: 0.1rem 0.5rem; border-radius: 8px; color: #1e3a8a; font-weight: 600; }
            .map-popup__area { color: #64748b; }
            .map-popup__call {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: linear-gradient(135deg,#25d366,#128c7e);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                font-size: 0.82rem;
                font-weight: 600;
                justify-content: center;
                transition: background 0.2s;
                cursor: pointer;
                font-family: 'Poppins', sans-serif;
            }
            .map-popup__call:hover { background: linear-gradient(135deg,#128c7e,#075e54); }
            .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); }
            .leaflet-popup-content { margin: 14px 16px; }
            @media (max-width: 768px) {
                .map-modal__container { width: 100vw; height: 100vh; border-radius: 0; }
                .map-sidebar { display: none; }
                .map-modal__header { padding: 0.75rem 1rem; }
                .map-modal__filters { display: none; }
            }
        `;
        document.head.appendChild(style);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.belgradeMap = new BelgradeMap();
});
