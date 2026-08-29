'use strict';

function t(key) {
    const translations = window.FEELBG_TRANSLATIONS || {};
    const stored = localStorage.getItem('feelbg_language');
    const langCode = stored ? JSON.parse(stored).code : 'en';
    const lang = translations[langCode] || {};
    const fallback = translations['en'] || {};
    if (key in lang) return lang[key];
    if (key in fallback) return fallback[key];
    return key;
}

class PlaceFiltering {
    constructor() {
        this.grid = document.getElementById('restaurants-grid') || document.getElementById('places-grid');
        this.searchInput = document.getElementById('search-input');
        this.filterPills = document.querySelectorAll('.filter-pill');
        this.priceFilter = document.getElementById('filter-price');
        this.areaFilter = document.getElementById('filter-area');
        this.sortFilter = document.getElementById('filter-sort');
        this.viewBtns = document.querySelectorAll('.view-btn');
        this.resultsCount = document.getElementById('results-count');
        this.currentFilters = { search: '', cuisine: 'all', price: 'all', area: 'all', sort: 'rating' };
        this.init();
    }

    init() {
        if (!this.grid) return;
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
        this.filterPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                this.filterPills.forEach(p => p.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentFilters.cuisine = e.currentTarget.dataset.filter;
                this.applyFilters();
            });
        });
        if (this.priceFilter) {
            this.priceFilter.addEventListener('change', (e) => {
                this.currentFilters.price = e.target.value;
                this.applyFilters();
            });
        }
        if (this.areaFilter) {
            this.areaFilter.addEventListener('change', (e) => {
                this.currentFilters.area = e.target.value;
                this.applyFilters();
            });
        }
        if (this.sortFilter) {
            this.sortFilter.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.sortPlaces();
            });
        }
        this.viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.viewBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.toggleView(e.currentTarget.dataset.view);
            });
        });
        this.initHeartButtons();
        this.applyFilterFromUrl();
        this.updateResultsCount();
    }

    /* ?filter=museum arrives from the home page's "see all museums" links.
       Museums, churches, parks and shopping centres are all attractions
       separated by venue.cuisine, so they share one page and land on it with
       the matching pill already selected. Ignored when no pill matches. */
    applyFilterFromUrl() {
        const wanted = new URLSearchParams(window.location.search).get('filter');
        if (!wanted) return;
        const pill = Array.from(this.filterPills)
            .find(p => p.dataset.filter === wanted);
        if (!pill) return;
        this.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentFilters.cuisine = wanted;
        this.applyFilters();
    }

    refreshCards() {
        return this.grid ? this.grid.querySelectorAll('.place-card') : [];
    }

    applyFilters() {
        let visibleCount = 0;
        const cards = this.refreshCards();
        cards.forEach(card => {
            const cardData = {
                title: card.querySelector('.place-card__title').textContent.toLowerCase(),
                description: card.querySelector('.place-card__description').textContent.toLowerCase(),
                cuisine: card.dataset.cuisine || 'all',
                price: card.dataset.price || 'all',
                area: card.dataset.area || 'all'
            };
            let visible = true;
            if (this.currentFilters.search) {
                visible = visible && (cardData.title.includes(this.currentFilters.search) || cardData.description.includes(this.currentFilters.search));
            }
            if (this.currentFilters.cuisine !== 'all') visible = visible && cardData.cuisine === this.currentFilters.cuisine;
            if (this.currentFilters.price !== 'all') visible = visible && cardData.price === this.currentFilters.price;
            if (this.currentFilters.area !== 'all') visible = visible && cardData.area === this.currentFilters.area;
            if (visible) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease-out';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        this.updateResultsCount(visibleCount);
        this.sortPlaces();
    }

    sortPlaces() {
        const cardsArray = Array.from(this.refreshCards());
        const visibleCards = cardsArray.filter(card => card.style.display !== 'none');
        visibleCards.sort((a, b) => {
            switch (this.currentFilters.sort) {
                case 'rating':
                    return (parseFloat(b.dataset.rating) || 0) - (parseFloat(a.dataset.rating) || 0);
                case 'name':
                    return a.querySelector('.place-card__title').textContent.localeCompare(b.querySelector('.place-card__title').textContent);
                case 'popular':
                    return (b.querySelector('.place-card__badge') ? 1 : 0) - (a.querySelector('.place-card__badge') ? 1 : 0);
                case 'price-low':
                case 'price-high': {
                    const order = { 'budget': 1, 'moderate': 2, 'upscale': 3, 'fine-dining': 4 };
                    const pA = order[a.dataset.price] || 0, pB = order[b.dataset.price] || 0;
                    return this.currentFilters.sort === 'price-low' ? pA - pB : pB - pA;
                }
                default: return 0;
            }
        });
        visibleCards.forEach(card => this.grid.appendChild(card));
    }

    t(key) {
        var translations = window.FEELBG_TRANSLATIONS || {};
        var stored = localStorage.getItem('feelbg_language');
        var langCode = stored ? JSON.parse(stored).code : 'en';
        var lang = translations[langCode] || {};
        var fallback = translations['en'] || {};
        if (key in lang) return lang[key];
        if (key in fallback) return fallback[key];
        return key;
    }

    updateResultsCount(count) {
        if (!this.resultsCount) return;
        const visibleCount = count !== undefined ? count : Array.from(this.refreshCards()).filter(card => card.style.display !== 'none').length;
        var key = this.resultsCount.getAttribute('data-i18n') || '';
        var template = key ? this.t(key) : '';
        if (template) {
            this.resultsCount.textContent = template.replace(/\d+/, visibleCount);
        } else {
            this.resultsCount.textContent = visibleCount;
        }
    }

    toggleView(view) {
        if (view === 'list') this.grid.classList.add('list-view');
        else this.grid.classList.remove('list-view');
    }

    initHeartButtons() {
        document.querySelectorAll('.place-card__heart').forEach(heart => {
            heart.addEventListener('click', (e) => {
                e.currentTarget.classList.toggle('active');
                const icon = e.currentTarget.querySelector('i');
                if (e.currentTarget.classList.contains('active')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            });
        });
    }
}

class LoadMoreFeature {
    constructor() {
        this.loadMoreBtn = document.querySelector('.load-more-btn');
        this.init();
    }
    init() {
        if (!this.loadMoreBtn) return;
        this.loadMoreBtn.addEventListener('click', () => {
            this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            setTimeout(() => {
                this.loadMoreBtn.innerHTML = '<span>No More Results</span>';
                this.loadMoreBtn.disabled = true;
                this.loadMoreBtn.style.opacity = '0.6';
                this.loadMoreBtn.style.cursor = 'not-allowed';
            }, 1000);
        });
    }
}

/* ============================================================
   VENUE CARD

   One panel per place. It leads with the photograph, the name and
   the three numbers a visitor actually decides on — rating, price,
   neighbourhood — then two sentences, then the buttons. The map,
   the practical facts and what is nearby are folded, because a
   visitor who has not decided to go does not need the address.

   Nothing on this card is invented. Earlier versions filled the
   information box with a phone number hashed out of the venue's
   name, a website guessed as `<name>.rs`, and opening hours read
   off the price band — four facts that looked authoritative and
   were fiction. A row now appears only when the data exists.
   ============================================================ */
class PlaceDetails {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-details');
            if (!btn) return;
            if (btn.hasAttribute('data-booking')) return;
            e.preventDefault();
            e.stopPropagation();
            const card = btn.closest('.place-card');
            if (card) this.showDetails(card.querySelector('.place-card__title').textContent.trim(), card);
        });
    }

    getPageType() {
        const path = window.location.pathname;
        if (path.includes('cafes')) return 'cafes';
        if (path.includes('nightlife')) return 'nightlife';
        if (path.includes('attractions')) return 'attractions';
        return 'restaurants';
    }

    // Callers use either the singular venue type or the plural venues.js
    // collection name, so both are accepted.
    typeToPageType(type) {
        const map = {
            restaurant: 'restaurants', restaurants: 'restaurants',
            cafe: 'cafes', cafes: 'cafes',
            nightlife: 'nightlife',
            attraction: 'attractions', attractions: 'attractions'
        };
        return map[type] || 'restaurants';
    }

    showDetailsForVenue(venue) {
        this.showDetails(venue.name, null, this.typeToPageType(venue.type), venue);
    }

    allVenues() {
        const v = window.FEELBG_VENUES;
        if (!v) return [];
        const tag = (list, type) => (list || []).map(x => Object.assign({ type }, x));
        return [].concat(
            tag(v.restaurants, 'restaurants'),
            tag(v.cafes, 'cafes'),
            tag(v.nightlife, 'nightlife'),
            tag(v.attractions, 'attractions')
        );
    }

    findVenue(title) {
        return this.allVenues().find(v => v.name === title) || null;
    }

    /* A venue shows its own photographs or none. Earlier versions padded the
       strip with generic Belgrade ambience shots so that every card had
       something to swipe; the result was three photographs of somewhere else
       captioned with this venue's name. A tinted plate carrying the initial
       is the honest fallback, and it is what the grid cards already do. */
    buildGallery(venue, primaryImage) {
        const own = (venue && Array.isArray(venue.images)) ? venue.images.slice() : [];
        const images = [];
        if (primaryImage) images.push(primaryImage);
        own.forEach(src => { if (src && images.indexOf(src) === -1) images.push(src); });
        return images.slice(0, 6);
    }

    /* Straight-line metres between two coordinates. Belgrade is small enough
       that the equirectangular approximation is accurate to well under the
       precision anyone reads off a "420 m" label. */
    static metresBetween(aLat, aLng, bLat, bLng) {
        const R = 6371000;
        const rad = Math.PI / 180;
        const x = (bLng - aLng) * rad * Math.cos((aLat + bLat) * 0.5 * rad);
        const y = (bLat - aLat) * rad;
        return Math.sqrt(x * x + y * y) * R;
    }

    static formatDistance(m) {
        return m < 950 ? `${Math.round(m / 5) * 5} m` : `${(m / 1000).toFixed(1)} km`;
    }

    /* Everything of ours within walking distance, closest first. Real data,
       computed from the coordinates already in venues.js — no new source and
       nothing to keep in step. */
    nearbyOf(venue, radius = 900, limit = 5) {
        if (!venue || !venue.lat || !venue.lng) return [];
        return this.allVenues()
            .filter(v => v.name !== venue.name && v.lat && v.lng)
            .map(v => ({ venue: v, m: PlaceDetails.metresBetween(venue.lat, venue.lng, v.lat, v.lng) }))
            .filter(x => x.m <= radius)
            .sort((a, b) => a.m - b.m)
            .slice(0, limit);
    }

    /* A relative locator, not a map: the venue at the centre, everything
       nearby plotted at its true bearing and distance, with a scale bar. It
       needs no tile provider or key, and unlike a hand-drawn schematic it is
       correct for every venue because it is drawn from the coordinates. */
    drawLocator(canvas, venue, near) {
        if (!canvas || !canvas.getContext || !venue.lat) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.clientWidth || 600;
        const h = canvas.clientHeight || 225;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const gold = '#b08d2e';
        const faint = '#8890a8';
        const rule = '#2b3452';
        const rad = Math.PI / 180;
        const cx = w / 2;
        const cy = h / 2;

        // Metres per pixel is set so the farthest place lands inside the
        // plate with room for its label, rather than on the edge of it.
        const far = near.length ? near[near.length - 1].m : 200;
        const usable = Math.min(w / 2 - 78, h / 2 - 20);
        const scale = usable / Math.max(far, 80);

        const project = (v) => ({
            x: cx + (v.lng - venue.lng) * rad * Math.cos(venue.lat * rad) * 6371000 * scale,
            y: cy - (v.lat - venue.lat) * rad * 6371000 * scale
        });

        // One ring, at a round distance that actually fits the plate.
        const rings = [100, 200, 300, 500, 750, 1000].filter(r => r * scale < usable);
        ctx.strokeStyle = rule;
        ctx.lineWidth = 1;
        rings.forEach(r => {
            ctx.beginPath();
            ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Labels are nudged apart vertically so two places at the same
        // bearing do not print on top of each other.
        ctx.font = '400 11px Poppins, -apple-system, sans-serif';
        const placed = [];
        near.forEach(({ venue: v }) => {
            const p = project(v);
            ctx.fillStyle = faint;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
            ctx.fill();

            let label = v.name;
            while (label.length > 4 && ctx.measureText(label).width > 96) label = label.slice(0, -1);
            if (label !== v.name) label = label.trimEnd() + '…';

            const width = ctx.measureText(label).width;
            const right = p.x + 9 + width < w - 6;
            let ly = p.y + 4;
            while (placed.some(q => Math.abs(q.y - ly) < 13 && Math.abs(q.x - p.x) < 110)) ly += 13;
            placed.push({ x: p.x, y: ly });

            ctx.textAlign = right ? 'left' : 'right';
            ctx.fillText(label, p.x + (right ? 9 : -9), ly);
        });

        // the venue itself, last so nothing prints over it
        ctx.fillStyle = gold;
        ctx.beginPath();
        ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = gold;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 10.5, 0, Math.PI * 2);
        ctx.stroke();

        // north mark, top right
        ctx.fillStyle = faint;
        ctx.strokeStyle = faint;
        ctx.lineWidth = 1;
        ctx.textAlign = 'center';
        ctx.font = '600 10px Poppins, sans-serif';
        ctx.fillText('N', w - 15, 16);
        ctx.beginPath();
        ctx.moveTo(w - 15, 20);
        ctx.lineTo(w - 15, 30);
        ctx.stroke();

        // scale bar, bottom left
        const barM = rings.length ? rings[rings.length - 1] : Math.round(far / 50) * 50;
        ctx.beginPath();
        ctx.moveTo(14, h - 13);
        ctx.lineTo(14 + barM * scale, h - 13);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(14, h - 17); ctx.lineTo(14, h - 9);
        ctx.moveTo(14 + barM * scale, h - 17); ctx.lineTo(14 + barM * scale, h - 9);
        ctx.stroke();
        ctx.textAlign = 'left';
        ctx.font = '400 10px Poppins, sans-serif';
        ctx.fillText(`${barM} m`, 14, h - 21);
    }

    static formatRsd(n) {
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' RSD';
    }

    menuFor(venue) {
        const menus = window.FEELBG_MENUS;
        if (!menus || !venue) return null;
        const key = venue.menu || (window.CardRenderer ? window.CardRenderer.venueSlug(venue.name) : '');
        return menus[key] || null;
    }

    buildMenuSheet(venue, menu, esc) {
        const dlg = document.createElement('dialog');
        dlg.className = 'vsheet';
        dlg.setAttribute('aria-label', `${t('menu.title')} — ${venue.name}`);

        const courses = menu.sections.map(section => `
            <section class="vsheet__course">
                <h3>${esc(t('course.' + section.key))}</h3>
                <ul>
                    ${section.items.map(item => `
                        <li>
                            <span class="vsheet__dish">${esc(item.name)}${
                                item.pork || item.half ? `<span class="vsheet__meta">${
                                    item.pork ? `<i class="vsheet__mark vsheet__mark--pork" title="${esc(t('menu.pork'))}"></i>` : ''
                                }${
                                    item.half ? `<i class="vsheet__mark vsheet__mark--half" title="${esc(t('menu.half'))}"></i>` : ''
                                }</span>` : ''
                            }${item.en ? `<span>${esc(item.en)}</span>` : ''}</span>
                            <span class="vsheet__price">${PlaceDetails.formatRsd(item.price)}${
                                item.unit ? `<span class="vsheet__unit">${esc(item.unit)}</span>` : ''
                            }</span>
                        </li>
                    `).join('')}
                </ul>
            </section>
        `).join('');

        const notes = [t('menu.currencyNote')];
        if (menu.cover) notes.push(`${t('menu.cover')} ${PlaceDetails.formatRsd(menu.cover)}`);
        (menu.notes || []).forEach(n => { if (n !== 'allergens') notes.push(t('menu.' + n)); });
        if (menu.incomplete) notes.push(t('menu.partial'));
        if ((menu.notes || []).indexOf('allergens') !== -1) notes.push(t('menu.allergens'));

        dlg.innerHTML = `
            <div class="vsheet__inner">
                <div class="vsheet__head">
                    <div>
                        <h2>${esc(t('menu.title'))}</h2>
                        <p>${esc(venue.name)}${venue.cuisineLabel ? ` · ${esc(venue.cuisineLabel)}` : ''}</p>
                    </div>
                    <button class="vsheet__close" type="button" aria-label="${esc(t('popup.close'))}" data-close>&times;</button>
                </div>
                <div class="vsheet__scroll">${courses}</div>
                <div class="vsheet__foot">${notes.map(n => `<p>${esc(n)}</p>`).join('')}</div>
            </div>
        `;

        dlg.querySelector('[data-close]').addEventListener('click', () => dlg.close());
        // A click on the backdrop closes; one on the sheet does not.
        dlg.addEventListener('click', (e) => {
            if (e.target !== dlg) return;
            const r = dlg.getBoundingClientRect();
            const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
            if (outside) dlg.close();
        });
        return dlg;
    }

    showDetails(title, card, forcedPageType, venueOverride) {
        const CR = window.CardRenderer;
        const esc = (s) => (CR ? CR.escapeHtml(String(s == null ? '' : s)) : String(s == null ? '' : s));
        const venue = venueOverride || this.findVenue(title);
        const pageType = forcedPageType || (venue && venue.type ? this.typeToPageType(venue.type) : this.getPageType());
        const isAttraction = pageType === 'attractions';

        // The venue record is the source. The card DOM is only consulted for
        // places rendered outside venues.js, and never overrides real data.
        const fromCard = (sel) => (card && card.querySelector(sel)) ? card.querySelector(sel).textContent.trim() : '';
        const rating = (venue && venue.rating) || fromCard('.place-card__rating').replace(/[^\d.]/g, '') || '';
        const area = (venue && venue.area) || fromCard('.place-card__location').replace(/^\s*\S*\s*/, '') || '';
        const kind = (venue && (CR ? CR.getTranslated(venue, 'cuisine') : venue.cuisineLabel)) || fromCard('.place-card__cuisine') || '';
        const priceLabel = venue ? this.priceLabelFor(venue) : '';

        let image = (venue && venue.image) || '';
        if (!image && card) {
            const imgDiv = card.querySelector('.place-card__image');
            const match = /url\((['"]?)(.*?)\1\)/.exec((imgDiv && imgDiv.style.backgroundImage) || '');
            if (match && match[2]) image = match[2];
        }
        const gallery = this.buildGallery(venue, image);

        // An attraction leads with its hook, then carries the longer copy.
        const story = (venue && CR) ? {
            lead: CR.getTranslated(venue, 'hook') || CR.getTranslated(venue, 'desc') || venue.description || '',
            about: CR.getTranslated(venue, 'about'),
            why: CR.getTranslated(venue, 'why'),
            insider: CR.getTranslated(venue, 'insider'),
            pills: CR.pillsFor(venue)
        } : { lead: fromCard('.place-card__description'), about: '', why: '', insider: '', pills: [] };

        const near = this.nearbyOf(venue);
        const menu = this.menuFor(venue);
        const hasCoords = venue && venue.lat && venue.lng;

        const stats = [];
        if (rating) stats.push(`<li><span class="star">★</span> ${esc(rating)}</li>`);
        if (priceLabel) stats.push(`<li>${priceLabel}</li>`);
        if (area) stats.push(`<li>${esc(area)}</li>`);

        const facts = [];
        if (venue && venue.hours) facts.push([t('card.hours'), esc(venue.hours)]);
        if (venue && venue.phone) facts.push([t('card.phone'), `<a href="tel:${esc(venue.phone.replace(/\s/g, ''))}">${esc(venue.phone)}</a>`]);
        if (venue && venue.website) facts.push([t('card.website'), `<a href="https://${esc(venue.website)}" target="_blank" rel="noopener">${esc(venue.website)}</a>`]);

        const overlay = document.createElement('div');
        overlay.className = 'vcard-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', title);

        const initial = (title || '?').trim().charAt(0).toUpperCase();
        const shotsHtml = gallery.length
            ? gallery.map(src => `<div class="vcard__shot" style="background-image:url('${esc(src)}')" role="img" aria-label="${esc(title)}"></div>`).join('')
            : `<div class="vcard__shot vcard__shot--none" data-initial="${esc(initial)}" role="img" aria-label="${esc(title)}"></div>`;

        overlay.innerHTML = `
            <article class="vcard">
                <div class="vcard__shot-wrap">
                    <div class="vcard__shots">${shotsHtml}</div>
                    <button class="vcard__close" type="button" aria-label="${esc(t('popup.close'))}">&times;</button>
                    ${gallery.length > 1 ? `
                        <button class="vcard__photos" type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 7h3l1.6-2h8.8L18 7h3v12H3z" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.4"/></svg>
                            ${esc(t('card.photoCount').replace('{n}', gallery.length))}
                        </button>` : ''}
                </div>

                <div class="vcard__head">
                    ${kind ? `<p class="vcard__kind">${esc(kind)}</p>` : ''}
                    <h2 class="vcard__name">${esc(title)}</h2>
                    ${stats.length ? `<ul class="vcard__stats">${stats.join('')}</ul>` : ''}
                    ${story.lead ? `<p class="vcard__lead">${esc(story.lead)}</p>` : ''}
                    ${story.pills.length ? `<ul class="vcard__pills">${story.pills.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
                    ${story.about ? `<p class="vcard__lead">${esc(story.about)}</p>` : ''}
                    ${story.why ? `<p class="vcard__note"><b>${esc(t('attraction.why'))}</b>${esc(story.why)}</p>` : ''}
                    ${story.insider ? `<p class="vcard__note"><b>${esc(t('attraction.insider'))}</b>${esc(story.insider)}</p>` : ''}
                </div>

                <div class="vcard__actions">
                    ${isAttraction ? '' : `
                        <button class="vcard__btn vcard__btn--primary" type="button" data-booking="${esc(title)}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 5h16v15H4z" stroke-linejoin="round"/><path d="M8 3v4M16 3v4M4 10h16" stroke-linecap="round"/></svg>
                            ${esc(t(pageType === 'nightlife' ? 'card.reserveSpot' : 'popup.reserve'))}
                        </button>`}
                    ${menu ? `
                        <button class="vcard__btn" type="button" data-open-menu>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 4h16v16H4z" stroke-linejoin="round"/><path d="M8 9h8M8 13h8M8 17h5" stroke-linecap="round"/></svg>
                            ${esc(t('card.viewMenu'))}
                        </button>` : ''}
                    ${hasCoords ? `
                        <button class="vcard__btn detail-modal__route-btn" type="button"
                                data-route-lat="${esc(venue.lat)}" data-route-lng="${esc(venue.lng)}" data-route-name="${esc(title)}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4"/></svg>
                            ${esc(t('card.directions'))}
                        </button>` : ''}
                </div>

                ${(hasCoords || facts.length || near.length) ? `
                <div class="vcard__folds">
                    ${hasCoords ? `
                    <details class="vcard__fold" data-fold="map">
                        <summary>${esc(t('card.gettingThere'))}
                            ${venue.address ? `<span class="sub">${esc(venue.address)}</span>` : ''}
                            <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </summary>
                        <div class="vcard__fold-body">
                            ${near.length ? `<div class="vcard__map"><canvas aria-label="${esc(title)} and what surrounds it"></canvas></div>` : ''}
                            <p class="vcard__addr">${venue.address ? `<b>${esc(venue.address)}</b> · ` : ''}${esc(venue.lat.toFixed(4))}, ${esc(venue.lng.toFixed(4))}</p>
                            ${facts.length ? `<ul class="vcard__facts">${facts.map(([k, v]) => `<li><span class="k">${esc(k)}</span><span class="v">${v}</span></li>`).join('')}</ul>` : ''}
                        </div>
                    </details>` : ''}
                    ${near.length ? `
                    <details class="vcard__fold">
                        <summary>${esc(t('card.nearby'))}
                            <span class="sub">${esc(t('card.nearbyCount').replace('{n}', near.length).replace('{d}', PlaceDetails.formatDistance(near[near.length - 1].m)))}</span>
                            <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </summary>
                        <div class="vcard__fold-body">
                            <ul class="vcard__near">
                                ${near.map(({ venue: v, m }) => `
                                    <li>
                                        <span class="m">${esc(PlaceDetails.formatDistance(m))}</span>
                                        <span class="n">${esc(v.name)}</span>
                                        <span class="t">${esc((CR ? CR.getTranslated(v, 'cuisine') : '') || v.cuisineLabel || '')}</span>
                                    </li>`).join('')}
                            </ul>
                        </div>
                    </details>` : ''}
                </div>` : ''}
            </article>
        `;

        document.body.appendChild(overlay);
        const scrollY = window.scrollY;
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => overlay.classList.add('is-open'));

        let sheet = null;
        let onResize = null;
        const closeModal = () => {
            if (sheet && sheet.open) sheet.close();
            overlay.classList.remove('is-open');
            document.removeEventListener('keydown', escHandler);
            if (onResize) window.removeEventListener('resize', onResize);
            document.body.style.overflow = '';
            window.scrollTo(0, scrollY);
            setTimeout(() => { overlay.remove(); if (sheet) sheet.remove(); }, 320);
        };
        const escHandler = (e) => {
            // The menu sheet is a <dialog> and handles its own Escape; only
            // close the card when the sheet is not the thing on top.
            if (e.key === 'Escape' && !(sheet && sheet.open)) closeModal();
        };

        overlay.querySelector('.vcard__close').addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
        document.addEventListener('keydown', escHandler);
        overlay.querySelector('.vcard__close').focus({ preventScroll: true });

        // photograph strip
        if (gallery.length > 1) {
            const shots = overlay.querySelector('.vcard__shots');
            let index = 0;
            overlay.querySelector('.vcard__photos').addEventListener('click', () => {
                index = (index + 1) % gallery.length;
                shots.style.transform = `translateX(-${index * 100}%)`;
            });
        }

        // menu sheet
        const menuBtn = overlay.querySelector('[data-open-menu]');
        if (menuBtn && menu) {
            sheet = this.buildMenuSheet(venue, menu, esc);
            document.body.appendChild(sheet);
            menuBtn.addEventListener('click', () => {
                if (typeof sheet.showModal === 'function') sheet.showModal();
                else sheet.setAttribute('open', '');
            });
        }

        // locator, drawn when the fold is first opened and on resize
        const mapFold = overlay.querySelector('[data-fold="map"]');
        const canvas = overlay.querySelector('.vcard__map canvas');
        if (mapFold && canvas && near.length) {
            onResize = () => { if (mapFold.open) this.drawLocator(canvas, venue, near); };
            mapFold.addEventListener('toggle', onResize);
            window.addEventListener('resize', onResize);
        }

        const routeBtn = overlay.querySelector('.detail-modal__route-btn');
        if (routeBtn) {
            routeBtn.addEventListener('click', () => {
                window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${routeBtn.dataset.routeLat},${routeBtn.dataset.routeLng}`,
                    '_blank',
                    'noopener'
                );
            });
        }
    }

    /* The price band is the venue's own label, with the trailing phrase
       translated the same way the grid card translates it. Attractions carry
       no price and get no price line rather than an invented one. */
    priceLabelFor(venue) {
        if (!venue.priceLabel) return '';
        const CR = window.CardRenderer;
        const label = venue.priceLabel
            .replace(/per person/i, CR ? CR.t('venue.price.perPerson') : 'per person')
            .replace(/\bentry\b/i, CR ? CR.t('venue.price.entry') : 'entry');
        const esc = (s) => (CR ? CR.escapeHtml(s) : s);
        // "€15–25 per person" → figure, then the phrase in a quieter tone.
        const m = /^(\S+)\s+(.+)$/.exec(label);
        return m ? `${esc(m[1])} <span class="quiet">${esc(m[2])}</span>` : esc(label);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('restaurants-grid') || document.getElementById('places-grid');
    if (grid && window.CardRenderer && window.FEELBG_VENUES) {
        const path = window.location.pathname;
        if (path.includes('restaurants')) CardRenderer.renderByType('restaurants', grid.id);
        else if (path.includes('cafes')) CardRenderer.renderByType('cafes', grid.id);
        else if (path.includes('nightlife')) CardRenderer.renderByType('nightlife', grid.id);
        else if (path.includes('attractions')) CardRenderer.renderByType('attractions', grid.id);
        else CardRenderer.renderAll(grid.id);
    }
    window._placeFilteringInstance = new PlaceFiltering();
    new LoadMoreFeature();
    window._placeDetailsInstance = new PlaceDetails();
});
