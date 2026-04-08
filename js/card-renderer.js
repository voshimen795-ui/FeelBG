'use strict';

class CardRenderer {
    static isAttractionsPage() {
        return window.location.pathname.includes('attractions');
    }

    static renderCard(venue, badgeKey) {
        const badgeHtml = venue.badge ? `<div class="place-card__badge ${venue.badge === 'popular' ? 'popular' : ''} ${venue.badge === 'trending' ? 'trending' : ''}" data-i18n="badge.${venue.badge}">${this.badgeLabel(venue.badge)}</div>` : '';
        const isAttraction = this.isAttractionsPage() || !venue.priceLabel;
        const priceHtml = isAttraction ? '' : `<div class="place-card__meta"><span class="price-range">${venue.priceLabel}</span></div>`;
        const reserveHtml = isAttraction ? '' : `<button class="btn-icon btn-reserve" title="Reserve" data-booking=""><i class="fas fa-calendar-check"></i></button>`;

        return `
            <div class="place-card" data-cuisine="${venue.cuisine}" data-price="${venue.price || 'free'}" data-area="${venue.area.toLowerCase().replace(/[^a-z]/g, '-')}" data-rating="${venue.rating}" data-lat="${venue.lat}" data-lng="${venue.lng}">
                <div class="place-card__image" style="background-image:url('${venue.image}');background-size:cover;background-position:center;">
                    ${badgeHtml}
                    <div class="place-card__heart"><i class="far fa-heart"></i></div>
                </div>
                <div class="place-card__content">
                    <div class="place-card__header">
                        <h3 class="place-card__title">${venue.name}</h3>
                        <div class="place-card__rating"><i class="fas fa-star"></i> ${venue.rating}</div>
                    </div>
                    <p class="place-card__cuisine"><i class="fas fa-tag"></i> ${venue.cuisineLabel}</p>
                    <p class="place-card__location"><i class="fas fa-map-marker-alt"></i> ${venue.address}</p>
                    <p class="place-card__description">${venue.description}</p>
                    ${priceHtml}
                    <div class="place-card__footer">
                        <button class="btn-icon" title="Get Directions"><i class="fas fa-directions"></i></button>
                        ${reserveHtml}
                        <button class="btn-details" data-i18n="ui.details">Details <i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    static badgeLabel(badge) {
        const labels = { topRated: 'Top Rated', popular: 'Popular', new: 'New', trending: 'Trending' };
        return labels[badge] || '';
    }

    static renderGrid(venues, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = venues.map(v => this.renderCard(v)).join('');
    }

    static renderAll(containerId) {
        const venues = window.FEELBG_VENUES;
        if (!venues) return;
        const all = [
            ...venues.restaurants,
            ...venues.cafes,
            ...venues.nightlife,
            ...venues.attractions
        ];
        this.renderGrid(all, containerId);
    }

    static renderByType(type, containerId) {
        const venues = window.FEELBG_VENUES;
        if (!venues || !venues[type]) return;
        this.renderGrid(venues[type], containerId);
    }
}

window.CardRenderer = CardRenderer;
