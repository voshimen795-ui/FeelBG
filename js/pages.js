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
        this.updateResultsCount();
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

class MapToggle {
    constructor() {
        this.mapToggleBtn = document.getElementById('map-toggle');
        this.init();
    }
    init() {
        if (!this.mapToggleBtn) return;
        this.mapToggleBtn.addEventListener('click', () => {
            if (window.belgradeMap) window.belgradeMap.openMap();
        });
    }
}

class PlaceDetails {
    constructor() {
        this.budgetRanges = {
            'budget': { min: 5, max: 15, icon: '$' },
            'moderate': { min: 15, max: 30, icon: '$$' },
            'upscale': { min: 30, max: 60, icon: '$$$' },
            'fine-dining': { min: 60, max: 120, icon: '$$$$' }
        };
        this.hoursMap = {
            'budget': '08:00 – 22:00',
            'moderate': '10:00 – 23:00',
            'upscale': '12:00 – 00:00',
            'fine-dining': '18:00 – 01:00'
        };
        // Extra "vibe" gallery slides pulled from images already hosted on
        // this site (not external stock) — generic ambience shots with no
        // identifying signage, so they never misrepresent a specific
        // competitor's business as belonging to a different venue.
        this.galleryPools = {
            restaurants: [],
            cafes: [
                'assets/images/restorani/bay.jpg',
                'assets/images/restorani/dekstop.jpg'
            ],
            nightlife: [
                'assets/images/belgrade-by-night-4576220_1280.jpg'
            ],
            attractions: []
        };
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

    typeToPageType(type) {
        const map = { restaurant: 'restaurants', cafe: 'cafes', nightlife: 'nightlife', attraction: 'attractions' };
        return map[type] || 'restaurants';
    }

    showDetailsForVenue(venue) {
        const pageType = this.typeToPageType(venue.type);
        const card = document.createElement('div');
        card.dataset.price = venue.priceLabel ? (venue.price || 'moderate') : 'none';
        card.dataset.lat = venue.lat;
        card.dataset.lng = venue.lng;
        card.innerHTML = `
            <div class="place-card__image" style="background-image:url('${venue.image || ''}')"></div>
            <div class="place-card__rating"><i class="fas fa-star"></i> ${venue.rating || ''}</div>
            <div class="place-card__location"><i class="fas fa-map-marker-alt"></i> ${venue.area || ''}</div>
            <div class="place-card__description">${venue.desc || venue.description || ''}</div>
            <div class="place-card__cuisine">${venue.cuisineLabel || ''}</div>
        `;
        this.showDetails(venue.name, card, pageType);
    }

    findVenue(title) {
        const venues = window.FEELBG_VENUES;
        if (!venues) return null;
        const all = [].concat(venues.restaurants || [], venues.cafes || [], venues.nightlife || [], venues.attractions || []);
        return all.find(v => v.name === title) || null;
    }

    fakePhone(title) {
        let hash = 0;
        for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
        const num = String(hash).padStart(7, '0').slice(0, 7);
        return `+381 11 ${num.slice(0, 3)} ${num.slice(3)}`;
    }

    buildGallery(pageType, primaryImage) {
        const pool = this.galleryPools[pageType] || this.galleryPools.restaurants;
        const images = [];
        if (primaryImage) images.push(primaryImage);
        pool.forEach(src => { if (images.indexOf(src) === -1) images.push(src); });
        return images.slice(0, 5);
    }

    showDetails(title, card, forcedPageType) {
        const rating = card.querySelector('.place-card__rating')?.textContent.trim() || '';
        const location = card.querySelector('.place-card__location')?.textContent.trim() || '';
        const description = card.querySelector('.place-card__description')?.textContent.trim() || '';
        const priceLevel = card.dataset.price || 'moderate';
        const budgetInfo = this.budgetRanges[priceLevel] || this.budgetRanges['moderate'];
        const hours = this.hoursMap[priceLevel] || '10:00 – 23:00';
        const cuisine = card.querySelector('.place-card__cuisine')?.textContent.trim() || '';

        const pageType = forcedPageType || this.getPageType();
        const venue = this.findVenue(title);

        // Extract the venue's own image from the card's background image
        let primaryImage = '';
        const imgDiv = card.querySelector('.place-card__image');
        if (imgDiv) {
            const inlineStyle = imgDiv.style.backgroundImage;
            const match = /url\((['"]?)(.*?)\1\)/.exec(inlineStyle || '');
            if (match) primaryImage = match[2];
        }
        if (!primaryImage && venue) primaryImage = venue.image;

        const galleryImages = this.buildGallery(pageType, primaryImage);

        const isAttraction = pageType === 'attractions' || priceLevel === 'none';
        const budgetLabel = isAttraction ? '' : `€${budgetInfo.min} – €${budgetInfo.max} ${t('popup.perPerson')}`;
        const websiteName = title.toLowerCase().replace(/[^a-z0-9]/g, '') + '.rs';
        const phone = this.fakePhone(title);
        const categoryTag = (venue && venue.cuisineLabel) || cuisine.replace(/^\s*\S+\s+/, '') || pageType;

        const lat = card.dataset.lat;
        const lng = card.dataset.lng;
        const hasCoords = lat && lng;

        const slidesHtml = galleryImages.map(src =>
            `<div class="modal-gallery__slide" style="background-image:url('${src}')"></div>`
        ).join('');
        const dotsHtml = galleryImages.length > 1 ? galleryImages.map((_, i) =>
            `<button class="modal-gallery__dot${i === 0 ? ' active' : ''}" data-slide="${i}" aria-label="Photo ${i + 1}"></button>`
        ).join('') : '';
        const arrowsHtml = galleryImages.length > 1 ? `
                    <button class="modal-gallery__arrow modal-gallery__arrow--prev" aria-label="Previous photo"><i class="fas fa-chevron-left"></i></button>
                    <button class="modal-gallery__arrow modal-gallery__arrow--next" aria-label="Next photo"><i class="fas fa-chevron-right"></i></button>` : '';

        const modal = document.createElement('div');
        modal.className = 'detail-modal-overlay';
        modal.innerHTML = `
            <div class="detail-modal detail-modal--premium">
                <div class="modal-gallery" id="modal-gallery">
                    <div class="modal-gallery__track" id="modal-gallery-track">${slidesHtml}</div>
                    <button class="modal-gallery__close" aria-label="Close">&times;</button>
                    ${arrowsHtml}
                    ${dotsHtml ? `<div class="modal-gallery__dots">${dotsHtml}</div>` : ''}
                </div>
                <div class="detail-modal__body">
                    <span class="detail-modal__category-tag inline-block px-3.5 py-1 rounded-full bg-gradient-to-br from-royal to-royal-light text-white text-[11px] font-bold uppercase tracking-wider mb-2">${categoryTag}</span>
                    <div class="detail-modal__header">
                        <h3 class="detail-modal__title">${title}</h3>
                        <span class="detail-modal__rating">${rating}</span>
                    </div>
                    <p class="detail-modal__location"><i class="fas fa-map-marker-alt"></i> ${location}</p>
                    ${description ? `<p class="detail-modal__desc">${description}</p>` : ''}

                    <h4 class="detail-modal__section-title font-display text-base text-royal mt-5 mb-2 flex items-center gap-2"><i class="fas fa-circle-info"></i> ${t('popup.information')}</h4>
                    <div class="detail-modal__info">
                        <div class="detail-modal__info-row flex items-center gap-2.5 py-1.5 text-sm text-gray-700"><i class="fas fa-clock"></i><span>${t('popup.open')} ${hours}</span></div>
                        ${isAttraction ? '' : `<div class="detail-modal__info-row flex items-center gap-2.5 py-1.5 text-sm text-gray-700"><i class="fas fa-wallet"></i><span>${t('popup.avgBudget')} ${budgetLabel}</span></div>`}
                        <div class="detail-modal__info-row flex items-center gap-2.5 py-1.5 text-sm text-gray-700"><i class="fas fa-phone"></i><span>${phone}</span></div>
                        <div class="detail-modal__info-row flex items-center gap-2.5 py-1.5 text-sm text-gray-700"><i class="fas fa-globe"></i><span>www.${websiteName}</span></div>
                    </div>

                    <div class="detail-modal__actions">
                        ${isAttraction ? '' : `<button class="detail-modal__reserve" data-booking="${title}"><i class="fas fa-calendar-check"></i> ${t('popup.reserve')}</button>`}
                        ${hasCoords ? `<button class="detail-modal__route-btn" data-route-lat="${lat}" data-route-lng="${lng}" data-route-name="${title}"><i class="fas fa-route"></i> ${t('popup.seeRoute')}</button>` : ''}
                        <button class="detail-modal__close-btn">${t('popup.close')}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => modal.classList.add('active'));

        const escHandler = (e) => { if (e.key === 'Escape') closeModal(); };
        const closeModal = () => {
            modal.classList.remove('active');
            document.removeEventListener('keydown', escHandler);
            document.body.style.overflow = '';
            setTimeout(() => modal.remove(), 400);
        };

        modal.querySelector('.modal-gallery__close').addEventListener('click', closeModal);
        modal.querySelector('.detail-modal__close-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', escHandler);

        // Gallery carousel
        if (galleryImages.length > 1) {
            let current = 0;
            const track = modal.querySelector('#modal-gallery-track');
            const dots = modal.querySelectorAll('.modal-gallery__dot');
            const goTo = (index) => {
                current = (index + galleryImages.length) % galleryImages.length;
                track.style.transform = `translateX(-${current * 100}%)`;
                dots.forEach((d, i) => d.classList.toggle('active', i === current));
            };
            modal.querySelector('.modal-gallery__arrow--prev').addEventListener('click', () => goTo(current - 1));
            modal.querySelector('.modal-gallery__arrow--next').addEventListener('click', () => goTo(current + 1));
            dots.forEach(dot => dot.addEventListener('click', () => goTo(parseInt(dot.dataset.slide, 10))));
        }

        const routeBtn = modal.querySelector('.detail-modal__route-btn');
        if (routeBtn) {
            routeBtn.addEventListener('click', () => {
                closeModal();
                const destLat = parseFloat(routeBtn.dataset.routeLat);
                const destLng = parseFloat(routeBtn.dataset.routeLng);
                const destName = routeBtn.dataset.routeName;
                if (window.belgradeMap) {
                    window.belgradeMap.openMap();
                    setTimeout(() => window.belgradeMap.showRouteTo(destLat, destLng, destName), 600);
                }
            });
        }
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
    new MapToggle();
    window._placeDetailsInstance = new PlaceDetails();
});
