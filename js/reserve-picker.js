'use strict';

/**
 * FeelBG Reserve Picker — the gold "Reserve a Table" popup.
 *
 * Opened from the hero button (or any element with [data-reserve-picker]).
 * Shows a luxury gold/navy panel asking "Where would you like to reserve?",
 * with category chips, live search and the real venue list from
 * window.FEELBG_VENUES. Picking a venue hands off to the existing
 * BookingChatbot (WhatsApp flow) with the venue pre-filled.
 *
 * Attractions are excluded — you can't reserve a fortress.
 */
class ReservePicker {
    constructor() {
        this.activeCategory = 'all';
        this.query = '';
        this.modalEl = null;
        this.injectStyles();
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-venue-browser]');
            if (trigger) {
                e.preventDefault();
                this.open();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalEl) this.close();
        });
    }

    t(key) {
        const translations = window.FEELBG_TRANSLATIONS || {};
        let langCode = 'en';
        try {
            const stored = localStorage.getItem('feelbg_language');
            if (stored) langCode = JSON.parse(stored).code || 'en';
        } catch (err) { /* corrupted storage — fall back to English */ }
        const lang = translations[langCode] || {};
        const fallback = translations['en'] || {};
        if (key in lang) return lang[key];
        if (key in fallback) return fallback[key];
        return key;
    }

    // Venue DB is read lazily because venues.js loads after this script.
    getVenues() {
        const db = window.FEELBG_VENUES || {};
        const out = [];
        ['restaurants', 'cafes', 'nightlife'].forEach((cat) => {
            (db[cat] || []).forEach((v) => {
                out.push({
                    category: cat,
                    name: v.name,
                    area: v.area || '',
                    rating: v.rating || null,
                    priceLabel: v.priceLabel || '',
                    cuisineLabel: v.cuisineLabel || '',
                    image: v.image || ''
                });
            });
        });
        out.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        return out;
    }

    availableCategories() {
        const db = window.FEELBG_VENUES || {};
        return ['restaurants', 'cafes', 'nightlife'].filter((c) => (db[c] || []).length);
    }

    categoryIcon(cat) {
        return { restaurants: 'fa-utensils', cafes: 'fa-coffee', nightlife: 'fa-glass-cheers' }[cat] || 'fa-utensils';
    }

    open() {
        this.activeCategory = 'all';
        this.query = '';
        if (this.modalEl) this.modalEl.remove();

        const cats = this.availableCategories();
        const chips = ['<button class="rvp-chip rvp-chip--active" data-cat="all">' + this.t('reserve.all') + '</button>']
            .concat(cats.map((c) =>
                '<button class="rvp-chip" data-cat="' + c + '"><i class="fas ' + this.categoryIcon(c) + '"></i> ' + this.t('reserve.' + c) + '</button>'
            )).join('');

        const modal = document.createElement('div');
        modal.id = 'reserve-picker-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="rvp-overlay"></div>
            <div class="rvp-panel">
                <div class="rvp-goldbar"></div>
                <button class="rvp-close" aria-label="Close">&times;</button>
                <div class="rvp-header">
                    <div class="rvp-crest"><i class="fas fa-calendar-check"></i></div>
                    <h3 class="rvp-title">${this.t('reserve.title')}</h3>
                    <p class="rvp-subtitle">${this.t('reserve.subtitle')}</p>
                </div>
                <div class="rvp-chips">${chips}</div>
                <div class="rvp-search">
                    <i class="fas fa-search"></i>
                    <input type="text" id="rvp-search-input" placeholder="${this.t('reserve.searchPlaceholder')}" autocomplete="off">
                </div>
                <div class="rvp-list" id="rvp-list"></div>
                <div class="rvp-footer"><i class="fab fa-whatsapp"></i> ${this.t('reserve.footer')}</div>
            </div>`;
        document.body.appendChild(modal);
        this.modalEl = modal;
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => modal.classList.add('rvp-open'));

        modal.querySelector('.rvp-overlay').addEventListener('click', () => this.close());
        modal.querySelector('.rvp-close').addEventListener('click', () => this.close());

        modal.querySelectorAll('.rvp-chip').forEach((chip) => {
            chip.addEventListener('click', () => {
                modal.querySelectorAll('.rvp-chip').forEach((c) => c.classList.remove('rvp-chip--active'));
                chip.classList.add('rvp-chip--active');
                this.activeCategory = chip.getAttribute('data-cat');
                this.renderList();
            });
        });

        const search = modal.querySelector('#rvp-search-input');
        search.addEventListener('input', () => {
            this.query = search.value.trim().toLowerCase();
            this.renderList();
        });

        // Delegated so re-renders don't need re-binding
        modal.querySelector('#rvp-list').addEventListener('click', (e) => {
            const row = e.target.closest('[data-venue]');
            if (row) this.pick(row.getAttribute('data-venue'));
        });

        this.renderList();
    }

    renderList() {
        const listEl = this.modalEl && this.modalEl.querySelector('#rvp-list');
        if (!listEl) return;
        const venues = this.getVenues().filter((v) => {
            if (this.activeCategory !== 'all' && v.category !== this.activeCategory) return false;
            if (!this.query) return true;
            return (v.name + ' ' + v.area + ' ' + v.cuisineLabel).toLowerCase().indexOf(this.query) !== -1;
        });

        if (!venues.length) {
            listEl.innerHTML = '<div class="rvp-empty"><i class="far fa-compass"></i><p>' + this.t('reserve.empty') + '</p></div>';
            return;
        }

        listEl.innerHTML = venues.map((v) => {
            const thumb = v.image
                ? '<div class="rvp-thumb"><img src="' + v.image + '" alt="" onerror="this.parentNode.innerHTML=\'<i class=&quot;fas ' + this.categoryIcon(v.category) + '&quot;></i>\'"></div>'
                : '<div class="rvp-thumb"><i class="fas ' + this.categoryIcon(v.category) + '"></i></div>';
            const rating = v.rating ? '<span class="rvp-rating"><i class="fas fa-star"></i> ' + v.rating.toFixed(1) + '</span>' : '';
            const area = v.area ? '<span class="rvp-area"><i class="fas fa-map-marker-alt"></i> ' + v.area + '</span>' : '';
            return `
                <div class="rvp-row" data-venue="${v.name.replace(/"/g, '&quot;')}" role="button" tabindex="0">
                    ${thumb}
                    <div class="rvp-info">
                        <div class="rvp-name">${v.name}</div>
                        <div class="rvp-meta">${rating}${area}</div>
                    </div>
                    <button class="rvp-reserve-btn" type="button">${this.t('reserve.reserveBtn')}</button>
                </div>`;
        }).join('');
    }

    pick(venueName) {
        this.close();
        // small delay so the two modals don't visually overlap mid-transition
        setTimeout(() => {
            if (window.bookingChatbot) window.bookingChatbot.open(venueName);
        }, 260);
    }

    close() {
        const modal = this.modalEl;
        if (!modal) return;
        this.modalEl = null;
        modal.classList.remove('rvp-open');
        document.body.style.overflow = '';
        setTimeout(() => modal.remove(), 320);
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
#reserve-picker-modal{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .3s ease}
#reserve-picker-modal.rvp-open{opacity:1}
.rvp-overlay{position:absolute;inset:0;background:rgba(4,8,24,.74);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.rvp-panel{position:relative;width:100%;max-width:540px;max-height:84vh;display:flex;flex-direction:column;background:linear-gradient(168deg,#13204a 0%,#0c1430 55%,#0a1129 100%);border:1px solid rgba(255,215,0,.38);border-radius:22px;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 60px rgba(255,215,0,.10),inset 0 1px 0 rgba(255,236,170,.18);overflow:hidden;transform:translateY(26px) scale(.96);transition:transform .35s cubic-bezier(.22,1,.36,1)}
#reserve-picker-modal.rvp-open .rvp-panel{transform:translateY(0) scale(1)}
.rvp-goldbar{height:4px;flex-shrink:0;background:linear-gradient(90deg,#b8860b 0%,#ffd700 30%,#ffe9a8 50%,#ffd700 70%,#b8860b 100%);background-size:200% auto;animation:rvp-shimmer 3.5s linear infinite}
@keyframes rvp-shimmer{to{background-position:200% center}}
.rvp-close{position:absolute;top:14px;right:16px;z-index:3;width:36px;height:36px;border:1px solid rgba(255,215,0,.3);border-radius:50%;background:rgba(255,215,0,.08);color:#ffe9a8;font-size:20px;line-height:1;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center}
.rvp-close:hover{background:rgba(255,215,0,.2);transform:rotate(90deg)}
.rvp-header{position:relative;text-align:center;padding:26px 24px 6px;flex-shrink:0}
.rvp-header::before{content:'';position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:280px;height:150px;background:radial-gradient(ellipse at center,rgba(255,215,0,.16) 0%,transparent 65%);pointer-events:none}
.rvp-crest{width:54px;height:54px;margin:0 auto 12px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:21px;color:#14204a;background:linear-gradient(135deg,#b8860b 0%,#ffd700 55%,#ffe9a8 100%);box-shadow:0 6px 18px rgba(255,215,0,.35),inset 0 1px 0 rgba(255,255,255,.5)}
.rvp-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:800;margin:0 0 6px;background:linear-gradient(120deg,#ffe9a8 0%,#ffd700 45%,#b8860b 75%,#ffd700 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:#ffd700}
.rvp-subtitle{font-family:'Poppins',sans-serif;font-size:14px;color:#aab6d8;margin:0}
.rvp-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:16px 22px 4px;flex-shrink:0}
.rvp-chip{font-family:'Poppins',sans-serif;font-size:13px;font-weight:600;padding:8px 16px;border-radius:999px;cursor:pointer;color:#e6ecff;background:linear-gradient(135deg,#1e3a8a 0%,#16295f 100%);border:1px solid rgba(94,124,214,.45);transition:all .22s;display:inline-flex;align-items:center;gap:7px}
.rvp-chip i{font-size:12px;opacity:.85}
.rvp-chip:hover{transform:translateY(-1px);border-color:rgba(255,215,0,.5);box-shadow:0 4px 14px rgba(30,58,138,.5)}
.rvp-chip--active{color:#14204a;background:linear-gradient(135deg,#b8860b 0%,#ffd700 60%,#ffe9a8 100%);border-color:rgba(255,236,170,.8);box-shadow:0 4px 16px rgba(255,215,0,.35)}
.rvp-chip--active i{opacity:1}
.rvp-search{position:relative;margin:14px 22px 12px;flex-shrink:0}
.rvp-search i{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:#b8860b;font-size:14px;pointer-events:none}
.rvp-search input{width:100%;padding:12px 16px 12px 42px;font-family:'Poppins',sans-serif;font-size:14px;color:#f4efe2;background:rgba(10,17,41,.85);border:1px solid rgba(255,215,0,.22);border-radius:12px;outline:none;transition:border-color .2s,box-shadow .2s}
.rvp-search input::placeholder{color:#6f7ea8}
.rvp-search input:focus{border-color:rgba(255,215,0,.6);box-shadow:0 0 0 3px rgba(255,215,0,.12)}
.rvp-list{flex:1;overflow-y:auto;padding:2px 16px 12px;min-height:120px;scrollbar-width:thin;scrollbar-color:rgba(255,215,0,.4) transparent}
.rvp-list::-webkit-scrollbar{width:6px}
.rvp-list::-webkit-scrollbar-thumb{background:linear-gradient(#ffd700,#b8860b);border-radius:3px}
.rvp-list::-webkit-scrollbar-track{background:transparent}
.rvp-row{display:flex;align-items:center;gap:13px;padding:10px 12px;margin:6px 4px;border-radius:14px;cursor:pointer;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);transition:all .22s}
.rvp-row:hover,.rvp-row:focus-visible{border-color:rgba(255,215,0,.45);background:rgba(255,215,0,.06);box-shadow:0 4px 18px rgba(0,0,0,.35);transform:translateY(-1px);outline:none}
.rvp-thumb{width:52px;height:52px;flex-shrink:0;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#16295f,#0c1430);border:1px solid rgba(255,215,0,.25);color:#ffd700;font-size:18px}
.rvp-thumb img{width:100%;height:100%;object-fit:cover;display:block;opacity:1!important}
.rvp-info{flex:1;min-width:0}
.rvp-name{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#f7f3e8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px}
.rvp-meta{display:flex;align-items:center;gap:12px;font-family:'Poppins',sans-serif;font-size:12px;color:#9aa8cc;white-space:nowrap;overflow:hidden}
.rvp-rating{color:#ffd700;font-weight:600}
.rvp-rating i{font-size:10px}
.rvp-area i{font-size:10px;color:#b8860b;margin-right:3px}
.rvp-reserve-btn{flex-shrink:0;font-family:'Poppins',sans-serif;font-size:13px;font-weight:700;padding:9px 18px;border:1px solid rgba(94,124,214,.5);border-radius:10px;cursor:pointer;color:#fff;background:linear-gradient(135deg,#1e3a8a 0%,#14204a 100%);transition:all .22s;pointer-events:none}
.rvp-row:hover .rvp-reserve-btn{background:linear-gradient(135deg,#2b4cb0 0%,#1e3a8a 100%);border-color:rgba(255,215,0,.55);box-shadow:0 4px 14px rgba(30,58,138,.55)}
.rvp-empty{text-align:center;padding:38px 20px;color:#9aa8cc;font-family:'Poppins',sans-serif;font-size:14px}
.rvp-empty i{display:block;font-size:34px;color:rgba(255,215,0,.4);margin-bottom:12px}
.rvp-footer{flex-shrink:0;text-align:center;padding:12px 20px 16px;font-family:'Poppins',sans-serif;font-size:12.5px;color:#8fa0c9;border-top:1px solid rgba(255,215,0,.14)}
.rvp-footer i{color:#25d366;font-size:14px;margin-right:6px;vertical-align:-1px}
@media(max-width:520px){
  #reserve-picker-modal{padding:0}
  .rvp-panel{max-width:100%;height:100%;max-height:100%;border-radius:0;border-left:none;border-right:none}
  .rvp-title{font-size:22px}
  .rvp-reserve-btn{padding:8px 13px;font-size:12px}
}
`;
        document.head.appendChild(style);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.reservePicker = new ReservePicker();
});
