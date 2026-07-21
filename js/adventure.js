'use strict';

/**
 * FeelBG AI Adventure — "Create My Belgrade Story".
 *
 * Opened from the hero button ([data-adventure]). Asks four quick questions
 * (who it's for, what they want to do, how long, budget), sends them to
 * /api/adventure (Claude Fable 5 server-side), and renders the returned
 * story as a cinematic scroll: a real Belgrade video backdrop, then each
 * stop as a chapter — the venue's real photo drifting in slow Ken Burns
 * motion like a film still — with a navy Reserve button that hands off to
 * the existing WhatsApp booking chat.
 *
 * If the API isn't configured or fails, it falls back to the classic
 * venue browser so the guest is never stuck.
 */
class BelgradeAdventure {
    constructor() {
        this.modalEl = null;
        this.answers = { mood: null, interests: [], time: null, budget: null };
        this.injectStyles();
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-adventure]');
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

    langCode() {
        try {
            const stored = localStorage.getItem('feelbg_language');
            if (stored) return JSON.parse(stored).code || 'en';
        } catch (err) { /* ignore */ }
        return 'en';
    }

    open() {
        this.answers = { mood: null, interests: [], time: null, budget: null };
        if (this.modalEl) this.modalEl.remove();

        const modal = document.createElement('div');
        modal.id = 'adventure-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="adv-overlay"></div>
            <div class="adv-panel">
                <div class="adv-goldbar"></div>
                <button class="adv-close" aria-label="Close">&times;</button>
                <div class="adv-body" id="adv-body"></div>
            </div>`;
        document.body.appendChild(modal);
        this.modalEl = modal;
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => modal.classList.add('adv-open'));

        modal.querySelector('.adv-overlay').addEventListener('click', () => this.close());
        modal.querySelector('.adv-close').addEventListener('click', () => this.close());

        this.renderQuiz();
    }

    close() {
        const modal = this.modalEl;
        if (!modal) return;
        this.modalEl = null;
        modal.classList.remove('adv-open');
        document.body.style.overflow = '';
        setTimeout(() => modal.remove(), 320);
    }

    // ---------- Step 1: the quiz ----------

    renderQuiz() {
        const body = this.modalEl.querySelector('#adv-body');
        const chip = (group, value, icon, label, multi) =>
            `<button class="adv-chip" data-group="${group}" data-value="${value}" data-multi="${multi ? '1' : ''}">
                <i class="fas ${icon}"></i> ${label}
            </button>`;

        body.innerHTML = `
            <div class="adv-quiz">
                <div class="adv-crest"><i class="fas fa-feather-pointed"></i></div>
                <h3 class="adv-title">${this.t('adventure.title')}</h3>
                <p class="adv-subtitle">${this.t('adventure.subtitle')}</p>

                <div class="adv-q">
                    <div class="adv-q__label">${this.t('adventure.qMood')}</div>
                    <div class="adv-chips">
                        ${chip('mood', 'romantic', 'fa-heart', this.t('adventure.mood.romantic'))}
                        ${chip('mood', 'friends', 'fa-user-group', this.t('adventure.mood.friends'))}
                        ${chip('mood', 'family', 'fa-people-roof', this.t('adventure.mood.family'))}
                        ${chip('mood', 'business', 'fa-briefcase', this.t('adventure.mood.business'))}
                    </div>
                </div>

                <div class="adv-q">
                    <div class="adv-q__label">${this.t('adventure.qInterests')}</div>
                    <div class="adv-chips">
                        ${chip('interests', 'food', 'fa-utensils', this.t('adventure.int.food'), true)}
                        ${chip('interests', 'nightlife', 'fa-champagne-glasses', this.t('adventure.int.nightlife'), true)}
                        ${chip('interests', 'culture', 'fa-landmark', this.t('adventure.int.culture'), true)}
                        ${chip('interests', 'chill', 'fa-mug-hot', this.t('adventure.int.chill'), true)}
                    </div>
                </div>

                <div class="adv-q">
                    <div class="adv-q__label">${this.t('adventure.qTime')}</div>
                    <div class="adv-chips">
                        ${chip('time', 'short', 'fa-clock', this.t('adventure.time.short'))}
                        ${chip('time', 'evening', 'fa-moon', this.t('adventure.time.evening'))}
                        ${chip('time', 'all_night', 'fa-star', this.t('adventure.time.allNight'))}
                    </div>
                </div>

                <div class="adv-q">
                    <div class="adv-q__label">${this.t('adventure.qBudget')}</div>
                    <div class="adv-chips">
                        ${chip('budget', 'budget', 'fa-coins', this.t('adventure.budget.low'))}
                        ${chip('budget', 'moderate', 'fa-scale-balanced', this.t('adventure.budget.mid'))}
                        ${chip('budget', 'upscale', 'fa-gem', this.t('adventure.budget.high'))}
                    </div>
                </div>

                <button class="adv-generate" id="adv-generate">
                    <i class="fas fa-wand-magic-sparkles"></i> ${this.t('adventure.generate')}
                </button>
                <button class="adv-browse-link" data-venue-browser-inline>${this.t('adventure.browseAll')}</button>
            </div>`;

        body.querySelectorAll('.adv-chip').forEach((c) => {
            c.addEventListener('click', () => {
                const group = c.getAttribute('data-group');
                const value = c.getAttribute('data-value');
                if (c.getAttribute('data-multi')) {
                    c.classList.toggle('adv-chip--active');
                    const idx = this.answers.interests.indexOf(value);
                    if (idx === -1) this.answers.interests.push(value);
                    else this.answers.interests.splice(idx, 1);
                } else {
                    body.querySelectorAll(`.adv-chip[data-group="${group}"]`).forEach((o) => o.classList.remove('adv-chip--active'));
                    c.classList.add('adv-chip--active');
                    this.answers[group] = value;
                }
            });
        });

        body.querySelector('#adv-generate').addEventListener('click', () => this.generate());
        body.querySelector('[data-venue-browser-inline]').addEventListener('click', () => this.openBrowser());
    }

    openBrowser() {
        this.close();
        setTimeout(() => {
            if (window.reservePicker) window.reservePicker.open();
        }, 260);
    }

    // ---------- Step 2: loading ----------

    renderLoading() {
        const body = this.modalEl.querySelector('#adv-body');
        body.innerHTML = `
            <div class="adv-loading">
                <video class="adv-video" muted playsinline loop autoplay
                    src="https://www.pexels.com/download/video/34432508/"></video>
                <div class="adv-video-tint"></div>
                <div class="adv-loading__inner">
                    <div class="adv-quill"><i class="fas fa-feather-pointed"></i></div>
                    <p class="adv-loading__text">${this.t('adventure.loading')}</p>
                    <div class="adv-loading__dots"><span></span><span></span><span></span></div>
                </div>
            </div>`;
    }

    // ---------- Step 3: fetch + story ----------

    async generate() {
        this.renderLoading();
        let adventure = null;
        try {
            const resp = await fetch('/api/adventure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mood: this.answers.mood,
                    interests: this.answers.interests,
                    time: this.answers.time,
                    budget: this.answers.budget,
                    language: this.langCode()
                })
            });
            if (resp.ok) adventure = await resp.json();
        } catch (err) { /* network failure — handled below */ }

        if (!this.modalEl) return; // user closed while waiting
        if (!adventure || !adventure.stops || !adventure.stops.length) {
            this.renderError();
            return;
        }
        this.renderStory(adventure);
    }

    renderError() {
        const body = this.modalEl.querySelector('#adv-body');
        body.innerHTML = `
            <div class="adv-error">
                <i class="far fa-compass"></i>
                <p>${this.t('adventure.error')}</p>
                <button class="adv-generate" data-venue-browser-inline>${this.t('reserve.title')}</button>
            </div>`;
        body.querySelector('[data-venue-browser-inline]').addEventListener('click', () => this.openBrowser());
    }

    renderStory(adventure) {
        const body = this.modalEl.querySelector('#adv-body');
        const esc = (s) => String(s || '').replace(/</g, '&lt;');

        const stopsHtml = adventure.stops.map((stop, i) => {
            const v = stop.venue || {};
            const img = v.image
                ? `<div class="adv-stop__media"><img src="${v.image}" alt="" class="adv-kenburns adv-kenburns--${i % 3}"></div>`
                : '';
            const rating = v.rating ? `<span class="adv-stop__rating"><i class="fas fa-star"></i> ${Number(v.rating).toFixed(1)}</span>` : '';
            const area = v.area ? `<span class="adv-stop__area"><i class="fas fa-map-marker-alt"></i> ${esc(v.area)}</span>` : '';
            return `
                <div class="adv-stop" style="animation-delay:${0.15 + i * 0.2}s">
                    <div class="adv-stop__chapter">
                        <span class="adv-stop__num">${i + 1}</span>
                        <span class="adv-stop__time">${esc(stop.timeOfDay)}</span>
                    </div>
                    ${img}
                    <div class="adv-stop__body">
                        <h4 class="adv-stop__name">${esc(stop.venueName)}</h4>
                        <div class="adv-stop__meta">${rating}${area}</div>
                        <p class="adv-stop__narrative">${esc(stop.narrative)}</p>
                        <button class="adv-reserve" data-venue="${esc(stop.venueName).replace(/"/g, '&quot;')}">
                            <i class="fas fa-calendar-check"></i> ${this.t('adventure.reserve')}
                        </button>
                    </div>
                </div>`;
        }).join('');

        body.innerHTML = `
            <div class="adv-story">
                <div class="adv-story__hero">
                    <video class="adv-video" muted playsinline loop autoplay
                        src="https://www.pexels.com/download/video/34432508/"></video>
                    <div class="adv-video-tint"></div>
                    <div class="adv-story__heading">
                        <h3 class="adv-story__title">${esc(adventure.title)}</h3>
                        <p class="adv-story__intro">${esc(adventure.intro)}</p>
                    </div>
                </div>
                <div class="adv-story__stops">${stopsHtml}</div>
                <p class="adv-story__outro">${esc(adventure.outro)}</p>
                <div class="adv-story__actions">
                    <button class="adv-again" id="adv-again"><i class="fas fa-rotate"></i> ${this.t('adventure.newStory')}</button>
                    <button class="adv-browse-link" data-venue-browser-inline>${this.t('adventure.browseAll')}</button>
                </div>
            </div>`;

        body.querySelectorAll('.adv-reserve').forEach((btn) => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-venue');
                this.close();
                setTimeout(() => {
                    if (window.bookingChatbot) window.bookingChatbot.open(name);
                }, 260);
            });
        });
        body.querySelector('#adv-again').addEventListener('click', () => this.renderQuiz());
        body.querySelector('[data-venue-browser-inline]').addEventListener('click', () => this.openBrowser());
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
#adventure-modal{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .3s ease}
#adventure-modal.adv-open{opacity:1}
.adv-overlay{position:absolute;inset:0;background:rgba(4,8,24,.78);backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px)}
.adv-panel{position:relative;width:100%;max-width:620px;max-height:88vh;display:flex;flex-direction:column;background:linear-gradient(168deg,#13204a 0%,#0c1430 55%,#0a1129 100%);border:1px solid rgba(255,215,0,.38);border-radius:22px;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 60px rgba(255,215,0,.10),inset 0 1px 0 rgba(255,236,170,.18);overflow:hidden;transform:translateY(26px) scale(.96);transition:transform .35s cubic-bezier(.22,1,.36,1)}
#adventure-modal.adv-open .adv-panel{transform:translateY(0) scale(1)}
.adv-goldbar{height:4px;flex-shrink:0;background:linear-gradient(90deg,#b8860b 0%,#ffd700 30%,#ffe9a8 50%,#ffd700 70%,#b8860b 100%);background-size:200% auto;animation:adv-shimmer 3.5s linear infinite;position:relative;z-index:4}
@keyframes adv-shimmer{to{background-position:200% center}}
.adv-close{position:absolute;top:14px;right:16px;z-index:5;width:36px;height:36px;border:1px solid rgba(255,215,0,.3);border-radius:50%;background:rgba(10,17,41,.55);color:#ffe9a8;font-size:20px;line-height:1;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center}
.adv-close:hover{background:rgba(255,215,0,.25);transform:rotate(90deg)}
.adv-body{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(255,215,0,.4) transparent}
.adv-body::-webkit-scrollbar{width:6px}
.adv-body::-webkit-scrollbar-thumb{background:linear-gradient(#ffd700,#b8860b);border-radius:3px}

/* ---- quiz ---- */
.adv-quiz{padding:28px 26px 26px;text-align:center}
.adv-crest{width:54px;height:54px;margin:0 auto 12px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:21px;color:#14204a;background:linear-gradient(135deg,#b8860b 0%,#ffd700 55%,#ffe9a8 100%);box-shadow:0 6px 18px rgba(255,215,0,.35),inset 0 1px 0 rgba(255,255,255,.5)}
.adv-title{font-family:'Playfair Display',serif;font-size:25px;font-weight:800;margin:0 0 6px;background:linear-gradient(120deg,#ffe9a8 0%,#ffd700 45%,#b8860b 75%,#ffd700 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:#ffd700}
.adv-subtitle{font-family:'Poppins',sans-serif;font-size:13.5px;color:#aab6d8;margin:0 0 18px;line-height:1.5}
.adv-q{margin-bottom:16px;text-align:left}
.adv-q__label{font-family:'Poppins',sans-serif;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#b8860b;margin-bottom:8px}
.adv-chips{display:flex;flex-wrap:wrap;gap:8px}
.adv-chip{font-family:'Poppins',sans-serif;font-size:13px;font-weight:600;padding:9px 15px;border-radius:999px;cursor:pointer;color:#e6ecff;background:linear-gradient(135deg,#1e3a8a 0%,#16295f 100%);border:1px solid rgba(94,124,214,.45);transition:all .22s;display:inline-flex;align-items:center;gap:7px}
.adv-chip i{font-size:12px;opacity:.85}
.adv-chip:hover{transform:translateY(-1px);border-color:rgba(255,215,0,.5)}
.adv-chip--active{color:#14204a;background:linear-gradient(135deg,#b8860b 0%,#ffd700 60%,#ffe9a8 100%);border-color:rgba(255,236,170,.8);box-shadow:0 4px 16px rgba(255,215,0,.35)}
.adv-generate{width:100%;margin-top:8px;padding:15px 20px;border:1px solid rgba(255,236,170,.75);border-radius:999px;cursor:pointer;font-family:'Poppins',sans-serif;font-size:15px;font-weight:700;color:#14204a;background:linear-gradient(120deg,#b8860b 0%,#ffd700 30%,#ffe9a8 50%,#ffd700 70%,#b8860b 100%);background-size:220% auto;box-shadow:0 8px 26px rgba(255,215,0,.32),inset 0 1px 0 rgba(255,255,255,.55);animation:adv-shimmer 4s linear infinite;transition:transform .22s;display:inline-flex;align-items:center;justify-content:center;gap:9px}
.adv-generate:hover{transform:translateY(-2px)}
.adv-browse-link{display:block;margin:14px auto 0;background:none;border:none;cursor:pointer;font-family:'Poppins',sans-serif;font-size:13px;color:#8fa0c9;text-decoration:underline;text-underline-offset:3px;transition:color .2s}
.adv-browse-link:hover{color:#ffd700}

/* ---- loading ---- */
.adv-loading{position:relative;min-height:380px;display:flex;align-items:center;justify-content:center}
.adv-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.adv-video-tint{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,17,41,.55) 0%,rgba(10,17,41,.85) 100%)}
.adv-loading__inner{position:relative;z-index:2;text-align:center;padding:40px 30px}
.adv-quill{font-size:34px;color:#ffd700;animation:adv-float 2.2s ease-in-out infinite;filter:drop-shadow(0 4px 14px rgba(255,215,0,.5))}
@keyframes adv-float{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-10px) rotate(6deg)}}
.adv-loading__text{font-family:'Playfair Display',serif;font-size:18px;color:#f4efe2;margin:16px 0 14px;line-height:1.5}
.adv-loading__dots span{display:inline-block;width:8px;height:8px;margin:0 4px;border-radius:50%;background:#ffd700;animation:adv-dot 1.2s ease-in-out infinite}
.adv-loading__dots span:nth-child(2){animation-delay:.2s}
.adv-loading__dots span:nth-child(3){animation-delay:.4s}
@keyframes adv-dot{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}

/* ---- story ---- */
.adv-story__hero{position:relative;min-height:210px;display:flex;align-items:flex-end;overflow:hidden}
.adv-story__heading{position:relative;z-index:2;padding:26px 26px 20px;text-align:left}
.adv-story__title{font-family:'Playfair Display',serif;font-size:27px;font-weight:800;margin:0 0 8px;background:linear-gradient(120deg,#ffe9a8 0%,#ffd700 45%,#b8860b 80%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:#ffd700}
.adv-story__intro{font-family:'Poppins',sans-serif;font-size:14px;color:#dfe6f8;margin:0;line-height:1.6;text-shadow:0 1px 8px rgba(0,0,0,.6)}
.adv-story__stops{padding:20px 22px 4px}
.adv-stop{margin-bottom:22px;border:1px solid rgba(255,215,0,.22);border-radius:16px;overflow:hidden;background:rgba(255,255,255,.03);opacity:0;animation:adv-rise .6s ease forwards}
@keyframes adv-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.adv-stop__chapter{display:flex;align-items:center;gap:10px;padding:12px 16px 10px}
.adv-stop__num{width:26px;height:26px;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Poppins',sans-serif;font-size:13px;font-weight:800;color:#14204a;background:linear-gradient(135deg,#b8860b,#ffd700)}
.adv-stop__time{font-family:'Poppins',sans-serif;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#ffd700}
.adv-stop__media{height:170px;overflow:hidden;position:relative}
.adv-stop__media img{width:100%;height:100%;object-fit:cover;display:block;opacity:1!important}
.adv-kenburns{animation:adv-kb-a 16s ease-in-out infinite alternate}
.adv-kenburns--1{animation-name:adv-kb-b}
.adv-kenburns--2{animation-name:adv-kb-c}
@keyframes adv-kb-a{from{transform:scale(1) translate(0,0)}to{transform:scale(1.14) translate(-2.5%,-2%)}}
@keyframes adv-kb-b{from{transform:scale(1.12) translate(2%,1.5%)}to{transform:scale(1) translate(0,0)}}
@keyframes adv-kb-c{from{transform:scale(1) translate(0,0)}to{transform:scale(1.16) translate(2%,2.5%)}}
.adv-stop__body{padding:14px 16px 16px}
.adv-stop__name{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;color:#f7f3e8;margin:0 0 5px}
.adv-stop__meta{display:flex;gap:14px;font-family:'Poppins',sans-serif;font-size:12px;color:#9aa8cc;margin-bottom:9px}
.adv-stop__rating{color:#ffd700;font-weight:600}
.adv-stop__rating i,.adv-stop__area i{font-size:10px}
.adv-stop__area i{color:#b8860b;margin-right:3px}
.adv-stop__narrative{font-family:'Poppins',sans-serif;font-size:13.5px;color:#c9d2ec;line-height:1.65;margin:0 0 13px}
.adv-reserve{font-family:'Poppins',sans-serif;font-size:13px;font-weight:700;padding:10px 20px;border:1px solid rgba(94,124,214,.5);border-radius:10px;cursor:pointer;color:#fff;background:linear-gradient(135deg,#1e3a8a 0%,#14204a 100%);transition:all .22s;display:inline-flex;align-items:center;gap:8px}
.adv-reserve:hover{background:linear-gradient(135deg,#2b4cb0 0%,#1e3a8a 100%);border-color:rgba(255,215,0,.55);box-shadow:0 4px 14px rgba(30,58,138,.55);transform:translateY(-1px)}
.adv-story__outro{font-family:'Playfair Display',serif;font-style:italic;font-size:15px;color:#dcc98a;text-align:center;padding:4px 30px 6px;line-height:1.6}
.adv-story__actions{display:flex;flex-direction:column;align-items:center;padding:10px 20px 24px}
.adv-again{font-family:'Poppins',sans-serif;font-size:13.5px;font-weight:700;padding:11px 24px;border:1px solid rgba(255,215,0,.45);border-radius:999px;cursor:pointer;color:#ffe9a8;background:rgba(255,215,0,.08);transition:all .22s;display:inline-flex;align-items:center;gap:8px}
.adv-again:hover{background:rgba(255,215,0,.18)}

/* ---- error ---- */
.adv-error{text-align:center;padding:52px 34px}
.adv-error i{font-size:36px;color:rgba(255,215,0,.45);margin-bottom:14px;display:block}
.adv-error p{font-family:'Poppins',sans-serif;font-size:14px;color:#aab6d8;margin:0 0 20px;line-height:1.6}

@media(max-width:560px){
  #adventure-modal{padding:0}
  .adv-panel{max-width:100%;height:100%;max-height:100%;border-radius:0;border-left:none;border-right:none}
  .adv-title{font-size:21px}
  .adv-story__title{font-size:22px}
}
@media(prefers-reduced-motion:reduce){
  .adv-kenburns,.adv-goldbar,.adv-generate,.adv-quill,.adv-loading__dots span{animation:none!important}
  .adv-stop{opacity:1;animation:none}
}
`;
        document.head.appendChild(style);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.belgradeAdventure = new BelgradeAdventure();
});
