'use strict';

class CardRenderer {
    /* The translation key slug: ASCII-only, underscores, diacritics collapsed
       (Ušće Park -> u_e_park). The keys in venue-translations.js and
       attraction-translations.js were written against this exact behaviour, so
       it must not change. The URL slug is a different thing entirely and lives
       on the venue object as `slug` — see tools/seo-slug.mjs. */
    static venueSlug(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    }

    /* Permalink to the venue's own page.

       Only English and Serbian have generated pages; every other locale falls
       back to the English URL, which is also the hreflang x-default. Route
       shapes are mirrored from tools/seo.config.mjs — if they change there,
       change them here too. */
    static venueUrl(venue) {
        if (this.currentLang() === 'sr') {
            return '/sr/mesto/' + (venue.slugSr || venue.slug) + '/';
        }
        return '/en/venue/' + venue.slug + '/';
    }

    /* The active language.

       `CardRenderer.lang` lets a non-browser caller (the SEO build) render the
       same markup for a chosen language; in a browser it is unset and the
       stored preference wins. */
    static currentLang() {
        if (this.lang) return this.lang;
        try {
            var stored = localStorage.getItem('feelbg_language');
            return stored ? JSON.parse(stored).code : 'en';
        } catch (e) {
            return 'en';
        }
    }

    static areaKey(area) {
        var map = {'Stari Grad':'area.stariGrad','Skadarlija':'area.skadarlija','Dorćol':'area.dorcol','Vračar':'area.vracar','Savamala':'area.savamala','Zemun':'area.zemun','Novi Beograd':'area.noviBeograd','Čukarica':'area.cukarica','Topčider':'area.topcider','Sava':'area.sava'};
        return map[area] || '';
    }

    static translateArea(area) {
        var key = this.areaKey(area);
        return key ? this.t(key) : area;
    }

    static t(key) {
        var translations = (typeof window !== 'undefined' && window.FEELBG_TRANSLATIONS) || {};
        var lang = translations[this.currentLang()] || {};
        var fallback = translations['en'] || {};
        if (key in lang) return lang[key];
        if (key in fallback) return fallback[key];
        return key;
    }

    /* Which key carries this venue's category label. The older venues each
       have their own venue.<slug>.cuisine string; the newer ones share one
       key per label (see js/venue-labels.js), so a repeated label like
       "Shopping Centre" is translated once rather than once per venue.
       Returns '' when neither exists — the caller falls back to the raw
       English label on the venue object. */
    static cuisineKey(venue) {
        var own = 'venue.' + this.venueSlug(venue.name) + '.cuisine';
        if (this.t(own) !== own) return own;
        if (!venue.cuisineLabel) return '';
        var shared = 'label.' + this.venueSlug(venue.cuisineLabel);
        return this.t(shared) !== shared ? shared : '';
    }

    static getTranslated(venue, field) {
        if (field === 'cuisine') {
            var cuisineKey = this.cuisineKey(venue);
            if (cuisineKey) return this.t(cuisineKey);
            return venue.cuisineLabel || '';
        }
        var slug = this.venueSlug(venue.name);
        var key = 'venue.' + slug + '.' + field;
        var val = this.t(key);
        if (val !== key) return val;
        // No translation for this language: fall back to the English copy that
        // lives on the venue object itself. desc/cuisine are stored under
        // different property names; everything else matches its field name.
        if (field === 'desc') return venue.description;
        if (field === 'cuisine') return venue.cuisineLabel;
        return venue[field] || '';
    }

    // Pills arrive either as an array (English, from venues.js) or as a
    // pipe-separated string (every other language, from the translation file).
    static pillsFor(venue) {
        var val = this.getTranslated(venue, 'pills');
        if (Array.isArray(val)) return val;
        return String(val || '').split('|').map(function(p) { return p.trim(); }).filter(Boolean);
    }

    static escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    static pillsHtml(venue) {
        var pills = this.pillsFor(venue);
        if (!pills.length) return '';
        return '<div class="place-card__pills">' + pills.map(function(p) {
            return '<span class="pill">' + CardRenderer.escapeHtml(p) + '</span>';
        }).join('') + '</div>';
    }

    static renderCard(venue) {
        var badgeHtml = venue.badge ? '<div class="place-card__badge ' + (venue.badge === 'popular' ? 'popular' : '') + ' ' + (venue.badge === 'trending' ? 'trending' : '') + '" data-i18n="badge.' + venue.badge + '">' + this.t('badge.' + venue.badge) + '</div>' : '';
        /* priceLabel is present on every restaurant, cafe and club and on no
           attraction, so it alone tells the two apart — the old extra check on
           the page URL was redundant, and wrong on any page whose path did not
           happen to contain "attractions". */
        var isAttraction = !venue.priceLabel;
        var translatedPrice = '';
        if (!isAttraction && venue.priceLabel) {
            translatedPrice = venue.priceLabel
                .replace(/per person/i, this.t('venue.price.perPerson'))
                .replace(/\bentry\b/i, this.t('venue.price.entry'));
        }
        var priceHtml = isAttraction ? '' : '<div class="place-card__meta"><span class="price-range">' + translatedPrice + '</span></div>';
        var reserveHtml = isAttraction ? '' : '<button class="btn-icon btn-reserve" title="' + this.t('popup.reserve') + '" data-booking=""><i class="fas fa-calendar-check"></i></button>';

        // Attractions carry editorial copy. The hook is the sharper opening
        // line, so on the card it stands in for the flat description; venues
        // without one (restaurants, nightlife) are unchanged.
        var hook = this.getTranslated(venue, 'hook');
        var desc = hook || this.getTranslated(venue, 'desc');
        var cuisineLabel = this.getTranslated(venue, 'cuisine');
        var pillsHtml = this.pillsHtml(venue);

        return '\
            <div class="place-card" data-cuisine="' + venue.cuisine + '" data-price="' + (venue.price || 'free') + '" data-area="' + venue.area.toLowerCase().replace(/[^a-z]/g, '-') + '" data-rating="' + venue.rating + '" data-lat="' + venue.lat + '" data-lng="' + venue.lng + '" data-name="' + venue.name.replace(/"/g, '&quot;') + '" data-venue-slug="' + (venue.slug || '') + '">\
                <div class="place-card__image" style="background-image:url(\'' + venue.image + '\');background-size:cover;background-position:center;">\
                    ' + badgeHtml + '\
                    <div class="place-card__heart"><i class="far fa-heart"></i></div>\
                </div>\
                <div class="place-card__content">\
                    <div class="place-card__header">\
                        <h3 class="place-card__title"><a class="place-card__permalink" href="' + this.venueUrl(venue) + '">' + this.escapeHtml(venue.name) + '</a></h3>\
                        <div class="place-card__rating"><i class="fas fa-star"></i> ' + venue.rating + '</div>\
                    </div>\
                    <p class="place-card__cuisine"><i class="fas fa-tag"></i> ' + this.escapeHtml(cuisineLabel) + '</p>\
                    <p class="place-card__location"><i class="fas fa-map-marker-alt"></i> ' + this.escapeHtml(this.translateArea(venue.area)) + '</p>\
                    <p class="place-card__description">' + this.escapeHtml(desc) + '</p>\
                    ' + pillsHtml + '\
                    ' + priceHtml + '\
                    <div class="place-card__footer">\
                        <button class="btn-icon btn-directions" title="' + this.t('ui.directions') + '"><i class="fas fa-directions"></i></button>\
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
        var all = [].concat(
            venues.restaurants || [], venues.cafes || [],
            venues.nightlife || [], venues.attractions || []
        );
        this.renderGrid(all, containerId);
    }

    static renderByType(type, containerId) {
        var venues = window.FEELBG_VENUES;
        if (!venues || !venues[type]) return;
        this.renderGrid(venues[type], containerId);
    }
}

if (typeof window !== 'undefined') { window.CardRenderer = CardRenderer; }
/* The SEO build (tools/build-seo.mjs) renders the same cards server-side. It
   loads this exact file rather than reimplementing renderCard, so the
   pre-rendered markup and the markup the browser produces cannot drift apart. */
if (typeof module !== 'undefined' && module.exports) { module.exports = CardRenderer; }
