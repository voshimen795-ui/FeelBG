'use strict';

function t(key) {
    const translations = window.FEELBG_TRANSLATIONS || {};
    const stored = localStorage.getItem('feelbg_language');
    const langCode = stored ? JSON.parse(stored).code : 'en';
    const lang = translations[langCode] || {};
    const fallback = translations['en'] || {};
    return lang[key] || fallback[key] || key;
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
        this.cards = document.querySelectorAll('.place-card');
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

    applyFilters() {
        let visibleCount = 0;
        this.cards.forEach(card => {
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
        const cardsArray = Array.from(this.cards);
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

    updateResultsCount(count) {
        if (!this.resultsCount) return;
        const visibleCount = count !== undefined ? count : Array.from(this.cards).filter(card => card.style.display !== 'none').length;
        this.resultsCount.textContent = `Showing ${visibleCount}`;
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

    showDetails(title, card) {
        const rating = card.querySelector('.place-card__rating')?.textContent.trim() || '';
        const location = card.querySelector('.place-card__location')?.textContent.trim() || '';
        const description = card.querySelector('.place-card__description')?.textContent.trim() || '';
        const priceLevel = card.dataset.price || 'moderate';
        const budgetInfo = this.budgetRanges[priceLevel] || this.budgetRanges['moderate'];
        const hours = this.hoursMap[priceLevel] || '10:00 – 23:00';
        const cuisine = card.querySelector('.place-card__cuisine')?.textContent.trim() || '';

        const imgDiv = card.querySelector('.place-card__image');
        let bgImage = '';
        if (imgDiv) {
            const inlineStyle = imgDiv.style.backgroundImage;
            if (inlineStyle && inlineStyle !== 'none' && inlineStyle !== '') {
                bgImage = inlineStyle;
            } else {
                const computed = window.getComputedStyle(imgDiv).backgroundImage;
                if (computed && computed !== 'none') bgImage = computed;
            }
        }

        const budgetLabel = `€${budgetInfo.min} – €${budgetInfo.max} ${t('popup.perPerson')}`;
        const websiteName = title.toLowerCase().replace(/[^a-z0-9]/g, '') + '.rs';

        const lat = card.dataset.lat;
        const lng = card.dataset.lng;
        const hasCoords = lat && lng;

        const modal = document.createElement('div');
        modal.className = 'detail-modal-overlay';
        modal.innerHTML = `
            <div class="detail-modal">
                <div class="detail-modal__image" style="background-image:${bgImage || 'linear-gradient(135deg,#1e3a8a,#b8860b)'};background-size:cover;background-position:center;">
                    <button class="detail-modal__close-x">&times;</button>
                </div>
                <div class="detail-modal__body">
                    <div class="detail-modal__header">
                        <h3 class="detail-modal__title">${title}</h3>
                        <span class="detail-modal__rating">${rating}</span>
                    </div>
                    <p class="detail-modal__location">${location}</p>
                    ${description ? `<p class="detail-modal__desc">${description}</p>` : ''}
                    <div class="detail-modal__info">
                        <h4>${t('popup.information')}</h4>
                        <div class="detail-modal__info-row"><i class="fas fa-clock"></i><span>${t('popup.open')} ${hours}</span></div>
                        <div class="detail-modal__info-row"><i class="fas fa-wallet"></i><span>${t('popup.avgBudget')} ${budgetLabel}</span></div>
                        <div class="detail-modal__info-row"><i class="fas fa-globe"></i><span>www.${websiteName}</span></div>
                        ${cuisine ? `<div class="detail-modal__info-row"><i class="fas fa-utensils"></i><span>${cuisine}</span></div>` : ''}
                    </div>
                    <div class="detail-modal__actions">
                        <button class="detail-modal__reserve" data-booking="${title}"><i class="fas fa-calendar-check"></i> ${t('popup.reserve')}</button>
                        ${hasCoords ? `<button class="detail-modal__route-btn" data-route-lat="${lat}" data-route-lng="${lng}" data-route-name="${title}"><i class="fas fa-route"></i> ${t('popup.seeRoute')}</button>` : ''}
                        <button class="detail-modal__close-btn">${t('popup.close')}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('active'));

        const escHandler = (e) => { if (e.key === 'Escape') closeModal(); };
        const closeModal = () => {
            modal.classList.remove('active');
            document.removeEventListener('keydown', escHandler);
            setTimeout(() => modal.remove(), 300);
        };

        modal.querySelector('.detail-modal__close-x').addEventListener('click', closeModal);
        modal.querySelector('.detail-modal__close-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', escHandler);

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
    new PlaceFiltering();
    new LoadMoreFeature();
    new MapToggle();
    new PlaceDetails();
});
