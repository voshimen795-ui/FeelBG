'use strict';

class CardRenderer {
    static isAttractionsPage() {
        return window.location.pathname.includes('attractions');
    }

    static venueSlug(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    }

    static t(key) {
        var translations = window.FEELBG_TRANSLATIONS || {};
        var stored = localStorage.getItem('feelbg_language');
        var langCode = stored ? JSON.parse(stored).code : 'en';
        var lang = translations[langCode] || {};
        var fallback = translations['en'] || {};
        return lang[key] || fallback[key] || key;
    }

    static getTranslated(venue, field) {
        var slug = this.venueSlug(venue.name);
        var key = 'venue.' + slug + '.' + field;
        var val = this.t(key);
        if (val !== key) return val;
        return field === 'desc' ? venue.description : venue.cuisineLabel;
    }

    static renderCard(venue) {
        var badgeHtml = venue.badge ? '<div class="place-card__badge ' + (venue.badge === 'popular' ? 'popular' : '') + ' ' + (venue.badge === 'trending' ? 'trending' : '') + '" data-i18n="badge.' + venue.badge + '">' + this.t('badge.' + venue.badge) + '</div>' : '';
        var isAttraction = this.isAttractionsPage() || !venue.priceLabel;
        var priceHtml = isAttraction ? '' : '<div class="place-card__meta"><span class="price-range">' + venue.priceLabel + '</span></div>';
        var reserveHtml = isAttraction ? '' : '<button class="btn-icon btn-reserve" title="Reserve" data-booking=""><i class="fas fa-calendar-check"></i></button>';

        var desc = this.getTranslated(venue, 'desc');
        var cuisineLabel = this.getTranslated(venue, 'cuisine');

        return '\
            <div class="place-card" data-cuisine="' + venue.cuisine + '" data-price="' + (venue.price || 'free') + '" data-area="' + venue.area.toLowerCase().replace(/[^a-z]/g, '-') + '" data-rating="' + venue.rating + '" data-lat="' + venue.lat + '" data-lng="' + venue.lng + '" data-name="' + venue.name.replace(/"/g, '&quot;') + '">\
                <div class="place-card__image" style="background-image:url(\'' + venue.image + '\');background-size:cover;background-position:center;">\
                    ' + badgeHtml + '\
                    <div class="place-card__heart"><i class="far fa-heart"></i></div>\
                </div>\
                <div class="place-card__content">\
                    <div class="place-card__header">\
                        <h3 class="place-card__title">' + venue.name + '</h3>\
                        <div class="place-card__rating"><i class="fas fa-star"></i> ' + venue.rating + '</div>\
                    </div>\
                    <p class="place-card__cuisine"><i class="fas fa-tag"></i> ' + cuisineLabel + '</p>\
                    <p class="place-card__location"><i class="fas fa-map-marker-alt"></i> ' + venue.address + '</p>\
                    <p class="place-card__description">' + desc + '</p>\
                    ' + priceHtml + '\
                    <div class="place-card__footer">\
                        <button class="btn-icon" title="Get Directions"><i class="fas fa-directions"></i></button>\
                        ' + reserveHtml + '\
                        <button class="btn-details">' + this.t('ui.details') + ' <i class="fas fa-arrow-right"></i></button>\
                    </div>\
                </div>\
            </div>';
    }

    static badgeLabel(badge) {
        return this.t('badge.' + badge) || '';
    }

    static renderGrid(venues, containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = venues.map(function(v) { return CardRenderer.renderCard(v); }).join('');
    }

    static renderAll(containerId) {
        var venues = window.FEELBG_VENUES;
        if (!venues) return;
        var all = [].concat(venues.restaurants, venues.cafes, venues.nightlife, venues.attractions);
        this.renderGrid(all, containerId);
    }

    static renderByType(type, containerId) {
        var venues = window.FEELBG_VENUES;
        if (!venues || !venues[type]) return;
        this.renderGrid(venues[type], containerId);
    }
}

window.CardRenderer = CardRenderer;
