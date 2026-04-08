/* ============================================
   PAGES INTERACTIVE FUNCTIONALITY
   Restaurants, Cafes, Nightlife, Attractions
   ============================================ */

'use strict';

// ============================================
// FILTERING & SEARCH SYSTEM
// ============================================

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
        
        this.currentFilters = {
            search: '',
            cuisine: 'all',
            price: 'all',
            area: 'all',
            sort: 'rating'
        };
        
        this.init();
    }

    init() {
        if (!this.grid) return;

        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Cuisine filter pills
        this.filterPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                this.filterPills.forEach(p => p.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentFilters.cuisine = e.currentTarget.dataset.filter;
                this.applyFilters();
            });
        });

        // Price filter
        if (this.priceFilter) {
            this.priceFilter.addEventListener('change', (e) => {
                this.currentFilters.price = e.target.value;
                this.applyFilters();
            });
        }

        // Area filter
        if (this.areaFilter) {
            this.areaFilter.addEventListener('change', (e) => {
                this.currentFilters.area = e.target.value;
                this.applyFilters();
            });
        }

        // Sort filter
        if (this.sortFilter) {
            this.sortFilter.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.sortPlaces();
            });
        }

        // View toggle
        this.viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.viewBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const view = e.currentTarget.dataset.view;
                this.toggleView(view);
            });
        });

        // Heart/Favorite functionality
        this.initHeartButtons();

        // Initial count
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

            // Search filter
            if (this.currentFilters.search) {
                visible = visible && (
                    cardData.title.includes(this.currentFilters.search) ||
                    cardData.description.includes(this.currentFilters.search)
                );
            }

            // Cuisine filter
            if (this.currentFilters.cuisine !== 'all') {
                visible = visible && cardData.cuisine === this.currentFilters.cuisine;
            }

            // Price filter
            if (this.currentFilters.price !== 'all') {
                visible = visible && cardData.price === this.currentFilters.price;
            }

            // Area filter
            if (this.currentFilters.area !== 'all') {
                visible = visible && cardData.area === this.currentFilters.area;
            }

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
                    const ratingA = parseFloat(a.dataset.rating) || 0;
                    const ratingB = parseFloat(b.dataset.rating) || 0;
                    return ratingB - ratingA;

                case 'name':
                    const nameA = a.querySelector('.place-card__title').textContent;
                    const nameB = b.querySelector('.place-card__title').textContent;
                    return nameA.localeCompare(nameB);

                case 'popular':
                    // Prioritize places with badges
                    const hasPopularA = a.querySelector('.place-card__badge') ? 1 : 0;
                    const hasPopularB = b.querySelector('.place-card__badge') ? 1 : 0;
                    return hasPopularB - hasPopularA;

                case 'price-low':
                case 'price-high':
                    const priceOrder = { 'budget': 1, 'moderate': 2, 'upscale': 3, 'fine-dining': 4 };
                    const priceA = priceOrder[a.dataset.price] || 0;
                    const priceB = priceOrder[b.dataset.price] || 0;
                    return this.currentFilters.sort === 'price-low' ? 
                        priceA - priceB : priceB - priceA;

                default:
                    return 0;
            }
        });

        // Reorder in DOM
        visibleCards.forEach(card => {
            this.grid.appendChild(card);
        });
    }

    updateResultsCount(count) {
        if (!this.resultsCount) return;
        
        const visibleCount = count !== undefined ? count : 
            Array.from(this.cards).filter(card => card.style.display !== 'none').length;
        
        this.resultsCount.textContent = `Showing ${visibleCount}`;
    }

    toggleView(view) {
        if (view === 'list') {
            this.grid.classList.add('list-view');
        } else {
            this.grid.classList.remove('list-view');
        }
    }

    initHeartButtons() {
        const hearts = document.querySelectorAll('.place-card__heart');
        hearts.forEach(heart => {
            heart.addEventListener('click', (e) => {
                e.currentTarget.classList.toggle('active');
                const icon = e.currentTarget.querySelector('i');
                
                if (e.currentTarget.classList.contains('active')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    this.showMessage('Added to favorites!', 'success');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    this.showMessage('Removed from favorites', 'info');
                }
            });
        });
    }

    showMessage(text, type = 'success') {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 0.75rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInUp 0.3s ease-out;
            font-weight: 600;
        `;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOutDown 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(message)) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 2000);
    }
}

// ============================================
// LOAD MORE FUNCTIONALITY
// ============================================

class LoadMoreFeature {
    constructor() {
        this.loadMoreBtn = document.querySelector('.load-more-btn');
        this.grid = document.querySelector('.places-grid');
        this.init();
    }

    init() {
        if (!this.loadMoreBtn) return;

        this.loadMoreBtn.addEventListener('click', () => {
            this.loadMore();
        });
    }

    loadMore() {
        // Simulate loading more places
        this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        
        setTimeout(() => {
            this.showMessage('All places loaded!', 'info');
            this.loadMoreBtn.innerHTML = '<span>No More Results</span>';
            this.loadMoreBtn.disabled = true;
            this.loadMoreBtn.style.opacity = '0.6';
            this.loadMoreBtn.style.cursor = 'not-allowed';
        }, 1000);
    }

    showMessage(text, type) {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 0.75rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInUp 0.3s ease-out;
            font-weight: 600;
        `;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOutDown 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(message)) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 2000);
    }
}

// ============================================
// MAP TOGGLE
// ============================================

class MapToggle {
    constructor() {
        this.mapToggleBtn = document.getElementById('map-toggle');
        this.init();
    }

    init() {
        if (!this.mapToggleBtn) return;

        this.mapToggleBtn.addEventListener('click', () => {
            this.showMapModal();
        });
    }

    showMapModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            animation: fadeIn 0.3s ease-out;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 1.5rem;
                padding: 2rem;
                max-width: 800px;
                width: 100%;
                text-align: center;
                animation: slideInUp 0.3s ease-out;
            ">
                <h3 style="
                    font-size: 2rem;
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, #1e3a8a 0%, #b8860b 50%, #ffd700 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                ">Interactive Map</h3>
                <p style="color: #6b7280; margin-bottom: 1.5rem;">
                    Map integration coming soon! This feature will show all locations on an interactive Belgrade map.
                </p>
                <div style="
                    height: 400px;
                    background: linear-gradient(135deg, #1e3a8a 0%, #b8860b 100%);
                    border-radius: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 3rem;
                    margin-bottom: 1.5rem;
                ">
                    <i class="fas fa-map-marked-alt"></i>
                </div>
                <button class="btn btn-primary" onclick="this.closest('div[style*=fixed]').remove()" style="
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, #b8860b, #ffd700);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// ============================================
// PLACE DETAILS MODAL
// ============================================

class PlaceDetails {
    constructor() {
        this.detailButtons = document.querySelectorAll('.btn-details');
        this.init();
    }

    init() {
        this.detailButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.place-card');
                const title = card.querySelector('.place-card__title').textContent;
                this.showDetails(title, card);
            });
        });
    }

    showDetails(title, card) {
        const rating = card.querySelector('.place-card__rating').textContent.trim();
        const location = card.querySelector('.place-card__location').textContent.trim();
        const description = card.querySelector('.place-card__description').textContent;

        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            animation: fadeIn 0.3s ease-out;
            overflow-y: auto;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 1.5rem;
                padding: 0;
                max-width: 700px;
                width: 100%;
                overflow: hidden;
                animation: slideInUp 0.3s ease-out;
            ">
                <div style="
                    height: 300px;
                    background: linear-gradient(135deg, #1e3a8a 0%, #b8860b 50%, #ffd700 100%);
                "></div>
                <div style="padding: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <h3 style="font-size: 2rem; color: #1e3a8a; margin: 0;">${title}</h3>
                        <span style="
                            padding: 0.5rem 1rem;
                            background: #f3f4f6;
                            border-radius: 0.5rem;
                            font-weight: 700;
                            color: #b8860b;
                        ">${rating}</span>
                    </div>
                    <p style="color: #6b7280; margin-bottom: 1rem;">
                        ${location}
                    </p>
                    <p style="color: #374151; line-height: 1.8; margin-bottom: 1.5rem;">
                        ${description}
                    </p>
                    <div style="
                        padding: 1.5rem;
                        background: #f9fafb;
                        border-radius: 1rem;
                        margin-bottom: 1.5rem;
                    ">
                        <h4 style="margin-bottom: 1rem; color: #1e3a8a;">Information</h4>
                        <div style="display: grid; gap: 0.75rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-clock" style="color: #b8860b; width: 20px;"></i>
                                <span>Open: 12:00 - 23:00</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-phone" style="color: #b8860b; width: 20px;"></i>
                                <span>+381 11 123 4567</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-globe" style="color: #b8860b; width: 20px;"></i>
                                <span>www.restaurant.com</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.75rem;">
                        <button class="btn btn-primary" style="
                            flex: 1;
                            padding: 1rem;
                            background: linear-gradient(135deg, #b8860b, #ffd700);
                            color: white;
                            border: none;
                            border-radius: 0.75rem;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            <i class="fas fa-directions"></i> Get Directions
                        </button>
                        <button onclick="this.closest('div[style*=fixed]').remove()" style="
                            padding: 1rem 1.5rem;
                            background: #f3f4f6;
                            color: #374151;
                            border: none;
                            border-radius: 0.75rem;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Close on ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    new PlaceFiltering();
    new LoadMoreFeature();
    new MapToggle();
    new PlaceDetails();

    console.log('%c🏙️ Belgrade Places Loaded!', 'color: #b8860b; font-size: 18px; font-weight: bold;');
});

