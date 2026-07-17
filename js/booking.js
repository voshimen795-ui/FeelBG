'use strict';

class BookingChatbot {
    constructor() {
        this.step = 0;
        this.answers = { venue: '', guests: '', time: '', requests: '' };
        this.whatsappNumber = '381653315640';
        this.init();
    }

    t(key) {
        const translations = window.FEELBG_TRANSLATIONS || {};
        const stored = localStorage.getItem('feelbg_language');
        const langCode = stored ? JSON.parse(stored).code : 'en';
        const lang = translations[langCode] || {};
        const fallback = translations['en'] || {};
        if (key in lang) return lang[key];
        if (key in fallback) return fallback[key];
        return key;
    }

    init() {
        this.injectStyles();
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-booking]');
            if (trigger) {
                e.preventDefault();
                e.stopPropagation();
                let venue = trigger.getAttribute('data-booking');
                if (!venue) {
                    const card = trigger.closest('.place-card');
                    if (card) {
                        const title = card.querySelector('.place-card__title');
                        venue = title ? title.textContent.trim() : '';
                    }
                }
                this.open(venue || 'FeelBG Reservation');
            }
        });
    }

    open(venue) {
        this.step = 0;
        this.answers = { venue: venue || 'FeelBG Reservation', guests: '', time: '', requests: '' };
        if (document.getElementById('booking-chatbot-modal')) {
            document.getElementById('booking-chatbot-modal').remove();
        }
        const modal = document.createElement('div');
        modal.id = 'booking-chatbot-modal';
        modal.innerHTML = `
            <div class="bcb-overlay"></div>
            <div class="bcb-container">
                <div class="bcb-header">
                    <div class="bcb-header-info">
                        <div class="bcb-avatar"><i class="fas fa-concierge-bell"></i></div>
                        <div>
                            <div class="bcb-title">${this.t('chatbot.title')}</div>
                            <div class="bcb-subtitle">${this.answers.venue}</div>
                        </div>
                    </div>
                    <button class="bcb-close" aria-label="Close">&times;</button>
                </div>
                <div class="bcb-messages" id="bcb-messages"></div>
                <div class="bcb-input-area" id="bcb-input-area">
                    <input type="text" class="bcb-input" id="bcb-input" placeholder="${this.t('chatbot.placeholder')}" autocomplete="off">
                    <button class="bcb-send" id="bcb-send"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        this.modalEl = modal;
        requestAnimationFrame(() => modal.classList.add('bcb-open'));
        this.messagesEl = document.getElementById('bcb-messages');
        this.inputEl = document.getElementById('bcb-input');
        modal.querySelector('.bcb-overlay').addEventListener('click', () => this.close());
        modal.querySelector('.bcb-close').addEventListener('click', () => this.close());
        document.getElementById('bcb-send').addEventListener('click', () => this.handleSend());
        this.inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.handleSend(); });
        // The keyboard opening on mobile is what caused the container to jump
        // and hide the newest message — re-anchor scroll on focus too, not
        // just when a message is added.
        this.inputEl.addEventListener('focus', () => this.scrollToBottom());
        this.bindViewportHandling();
        this.askNext();
    }

    close() {
        const modal = document.getElementById('booking-chatbot-modal');
        if (modal) {
            modal.classList.remove('bcb-open');
            setTimeout(() => modal.remove(), 300);
        }
        this.unbindViewportHandling();
    }

    // Keeps the modal sized to the *visual* viewport (not the layout
    // viewport), so when the on-screen keyboard opens on mobile the chat
    // shrinks to fit instead of getting pushed off-screen — the input and
    // the newest message both stay visible.
    bindViewportHandling() {
        if (!window.visualViewport || !this.modalEl) return;
        const vv = window.visualViewport;
        const apply = () => {
            this.modalEl.style.height = vv.height + 'px';
            this.modalEl.style.top = vv.offsetTop + 'px';
            this.scrollToBottom();
        };
        apply();
        vv.addEventListener('resize', apply);
        vv.addEventListener('scroll', apply);
        this._vvApply = apply;
    }

    unbindViewportHandling() {
        if (!window.visualViewport || !this._vvApply) return;
        window.visualViewport.removeEventListener('resize', this._vvApply);
        window.visualViewport.removeEventListener('scroll', this._vvApply);
        this._vvApply = null;
    }

    scrollToBottom() {
        if (!this.messagesEl) return;
        // rAF so we measure scrollHeight after the browser has laid out
        // whatever just changed (new message, keyboard resize, etc.)
        requestAnimationFrame(() => {
            this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
        });
    }

    addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `bcb-msg bcb-msg--${sender}`;
        div.innerHTML = text;
        this.messagesEl.appendChild(div);
        this.scrollToBottom();
    }

    showTyping() {
        const div = document.createElement('div');
        div.className = 'bcb-msg bcb-msg--bot bcb-typing';
        div.id = 'bcb-typing-indicator';
        div.innerHTML = '<span class="bcb-typing-dot"></span><span class="bcb-typing-dot"></span><span class="bcb-typing-dot"></span>';
        this.messagesEl.appendChild(div);
        this.scrollToBottom();
    }

    hideTyping() {
        const el = document.getElementById('bcb-typing-indicator');
        if (el) el.remove();
    }

    askNext() {
        const questions = [
            this.t('chatbot.q1'),
            this.t('chatbot.q2'),
            this.t('chatbot.q3')
        ];
        this.showTyping();
        setTimeout(() => {
            this.hideTyping();
            this.addMessage(questions[this.step], 'bot');
            this.inputEl.focus();
        }, 700);
    }

    handleSend() {
        const val = this.inputEl.value.trim();
        if (!val) return;
        this.addMessage(val, 'user');
        this.inputEl.value = '';

        if (this.step === 0) {
            this.answers.guests = val;
            this.step = 1;
            this.askNext();
        } else if (this.step === 1) {
            this.answers.time = val;
            this.step = 2;
            this.askNext();
        } else if (this.step === 2) {
            this.answers.requests = val;
            this.step = 3;
            this.showSummary();
        }
    }

    showSummary() {
        const inputArea = document.getElementById('bcb-input-area');
        inputArea.style.display = 'none';

        this.referralCode = window.FeelBGReferral ? window.FeelBGReferral.getOrCreateCode(this.answers.venue) : null;

        let msg = `${this.t('chatbot.reservationFor')} ${this.answers.venue}\n${this.t('chatbot.guests')}: ${this.answers.guests}\n${this.t('chatbot.time')}: ${this.answers.time}\n${this.t('chatbot.requests')}: ${this.answers.requests}`;
        if (this.referralCode) msg = window.FeelBGReferral.buildWhatsAppMessage(msg, this.referralCode);
        const encoded = encodeURIComponent(msg);
        const waUrl = `https://wa.me/${this.whatsappNumber}?text=${encoded}`;

        this.showTyping();
        setTimeout(() => {
            this.hideTyping();
            this.addMessage(
                `${this.t('chatbot.summary')}<br><br>` +
                `<div class="bcb-summary">` +
                `<div class="bcb-summary-row"><i class="fas fa-map-marker-alt"></i> ${this.answers.venue}</div>` +
                `<div class="bcb-summary-row"><i class="fas fa-users"></i> ${this.answers.guests} ${this.t('chatbot.people')}</div>` +
                `<div class="bcb-summary-row"><i class="fas fa-clock"></i> ${this.answers.time}</div>` +
                `<div class="bcb-summary-row"><i class="fas fa-comment"></i> ${this.answers.requests}</div>` +
                `</div>` +
                `<div class="bcb-summary-actions">` +
                `<a href="${waUrl}" target="_blank" rel="noopener" class="bcb-whatsapp-btn" id="bcb-wa-link">` +
                `<i class="fab fa-whatsapp"></i> ${this.t('chatbot.sendWhatsApp')}</a>` +
                (this.referralCode ? `<button class="bcb-voucher-btn" id="bcb-voucher-btn"><i class="fas fa-ticket-alt"></i> ${this.t('voucher.button')}</button>` : '') +
                `</div>`,
                'bot'
            );
            document.getElementById('bcb-wa-link')?.addEventListener('click', () => {
                if (window.FeelBGReferral) window.FeelBGReferral.track('whatsapp_booking_initiated', this.answers.venue, this.referralCode);
            });
            document.getElementById('bcb-voucher-btn')?.addEventListener('click', () => this.showVoucher());
        }, 500);
    }

    showVoucher() {
        if (window.FeelBGReferral) window.FeelBGReferral.track('voucher_viewed', this.answers.venue, this.referralCode);
        const existing = document.getElementById('bcb-voucher-overlay');
        if (existing) existing.remove();
        const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const overlay = document.createElement('div');
        overlay.id = 'bcb-voucher-overlay';
        overlay.innerHTML = `
            <div class="bcb-voucher-backdrop"></div>
            <div class="bcb-voucher-card">
                <div class="bcb-voucher-brand">Feel<span>BG</span></div>
                <div class="bcb-voucher-heading">${this.t('voucher.title')}</div>
                <div class="bcb-voucher-venue">${this.answers.venue}</div>
                <div class="bcb-voucher-code">${this.referralCode || ''}</div>
                <div class="bcb-voucher-date"><i class="fas fa-calendar-day"></i> ${dateStr}</div>
                <div class="bcb-voucher-perk"><i class="fas fa-glass-cheers"></i> ${this.t('voucher.perk')}</div>
                <div class="bcb-voucher-note">${this.t('voucher.subtitle')}</div>
                <button class="bcb-voucher-close" id="bcb-voucher-close">${this.t('voucher.close')}</button>
            </div>`;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('bcb-voucher-open'));
        const close = () => { overlay.classList.remove('bcb-voucher-open'); setTimeout(() => overlay.remove(), 250); };
        overlay.querySelector('.bcb-voucher-backdrop').addEventListener('click', close);
        overlay.querySelector('#bcb-voucher-close').addEventListener('click', close);
    }

    injectStyles() {
        if (document.getElementById('bcb-styles')) return;
        const style = document.createElement('style');
        style.id = 'bcb-styles';
        style.textContent = `
#booking-chatbot-modal{position:fixed;top:0;left:0;width:100%;height:100%;z-index:100000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s}
#booking-chatbot-modal.bcb-open{opacity:1}
.bcb-overlay{position:absolute;inset:0;background:rgba(10,17,40,.65);backdrop-filter:blur(4px)}
.bcb-container{position:relative;width:380px;max-width:92vw;height:520px;max-height:85vh;background:#faf8f4;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(10,17,40,.4);transform:translateY(30px) scale(.95);transition:transform .3s;font-family:'Poppins',sans-serif}
.bcb-open .bcb-container{transform:translateY(0) scale(1)}
.bcb-header{background:linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%);color:#fff;padding:16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.bcb-header-info{display:flex;align-items:center;gap:12px}
.bcb-avatar{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.15);border:2px solid #ffd700;box-shadow:0 0 0 3px rgba(255,215,0,.2);display:flex;align-items:center;justify-content:center;font-size:17px;color:#ffd700;flex-shrink:0}
.bcb-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:700}
.bcb-subtitle{font-size:12px;opacity:.85;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bcb-close{background:none;border:none;color:#fff;font-size:24px;cursor:pointer;padding:4px 8px;line-height:1;opacity:.8}
.bcb-close:hover{opacity:1}
.bcb-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f2eee4;min-height:0}
.bcb-msg{max-width:82%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5;font-family:'Poppins',sans-serif;animation:bcbFadeIn .3s}
.bcb-msg--bot{align-self:flex-start;background:#fffdf9;color:#1f2937;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(10,17,40,.1)}
.bcb-msg--user{align-self:flex-end;background:linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%);color:#fff;border-bottom-right-radius:4px}
@keyframes bcbFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.bcb-typing{display:flex;gap:5px;align-items:center;padding:14px 16px}
.bcb-typing-dot{width:7px;height:7px;border-radius:50%;background:#b8860b;animation:bcbTypingBounce 1.2s infinite ease-in-out}
.bcb-typing-dot:nth-child(2){animation-delay:.15s}
.bcb-typing-dot:nth-child(3){animation-delay:.3s}
@keyframes bcbTypingBounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}
.bcb-input-area{display:flex;padding:12px;gap:8px;background:#fffdf9;border-top:1px solid rgba(184,134,11,.2);flex-shrink:0}
.bcb-input{flex:1;border:1px solid #d9d2c2;border-radius:24px;padding:10px 16px;font-size:14px;outline:none;transition:border .2s;font-family:'Poppins',sans-serif;background:#fff;color:#1f2937}
.bcb-input:focus{border-color:#1e3a8a}
.bcb-send{width:40px;height:40px;border-radius:50%;border:none;background:linear-gradient(135deg,#b8860b 0%,#ffd700 100%);color:#14204a;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;transition:transform .15s}
.bcb-send:hover{transform:scale(1.1)}
.bcb-summary{background:#fff;border-radius:8px;padding:10px;margin:6px 0;border-left:3px solid #b8860b}
.bcb-summary-row{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px}
.bcb-summary-row i{color:#b8860b;width:16px;text-align:center}
.bcb-summary-actions{display:flex;flex-direction:column;gap:8px;margin-top:10px}
.bcb-whatsapp-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 20px;background:#25d366;color:#fff!important;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;transition:background .2s}
.bcb-whatsapp-btn:hover{background:#1da851}
.bcb-whatsapp-btn i{font-size:20px}
.bcb-voucher-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;background:linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%);color:#fff;border:none;border-radius:10px;font-weight:600;font-size:14px;cursor:pointer;transition:filter .2s;font-family:'Poppins',sans-serif}
.bcb-voucher-btn:hover{filter:brightness(1.1)}
#bcb-voucher-overlay{position:fixed;inset:0;z-index:100002;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s}
#bcb-voucher-overlay.bcb-voucher-open{opacity:1;pointer-events:auto}
.bcb-voucher-backdrop{position:absolute;inset:0;background:rgba(10,17,40,.75);backdrop-filter:blur(6px)}
.bcb-voucher-card{position:relative;width:320px;max-width:88vw;background:linear-gradient(160deg,#0f1e4d 0%,#0a1128 100%);border:1px solid rgba(184,134,11,.4);border-radius:20px;padding:32px 26px 26px;text-align:center;box-shadow:0 25px 70px rgba(0,0,0,.5);transform:translateY(20px) scale(.95);transition:transform .25s;font-family:'Poppins',sans-serif;color:#f4efe2}
#bcb-voucher-overlay.bcb-voucher-open .bcb-voucher-card{transform:translateY(0) scale(1)}
.bcb-voucher-brand{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#f4efe2;margin-bottom:14px;letter-spacing:.02em}
.bcb-voucher-brand span{color:#ffd700}
.bcb-voucher-heading{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#9aa8cc;margin-bottom:10px}
.bcb-voucher-venue{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;margin-bottom:16px;color:#fff}
.bcb-voucher-code{font-family:'Poppins',sans-serif;font-size:26px;font-weight:800;letter-spacing:.06em;color:#14204a;background:linear-gradient(135deg,#b8860b 0%,#ffd700 100%);border-radius:10px;padding:12px 10px;margin-bottom:16px}
.bcb-voucher-date{font-size:13px;color:#c9d2ec;margin-bottom:8px}
.bcb-voucher-date i{color:#b8860b;margin-right:6px}
.bcb-voucher-perk{font-size:13px;color:#ffd700;font-weight:600;margin-bottom:14px}
.bcb-voucher-perk i{margin-right:6px}
.bcb-voucher-note{font-size:12px;color:#9aa8cc;margin-bottom:18px;line-height:1.5}
.bcb-voucher-close{width:100%;padding:11px;border:1px solid rgba(184,134,11,.4);background:transparent;color:#f4efe2;border-radius:10px;font-family:'Poppins',sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:background .2s}
.bcb-voucher-close:hover{background:rgba(184,134,11,.15)}
@media(max-width:480px){.bcb-container{width:100%;max-width:100%;height:100%;max-height:100%;border-radius:0}}
.btn-reserve{color:#25d366!important;border-color:#25d366!important}
.btn-reserve:hover{background:#25d366!important;color:#fff!important}
.btn-details{display:inline-flex;align-items:center;justify-content:center;gap:6px}
.footer-reserve-btn,.contact-reserve-btn{background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:14px;font-family:'Poppins',sans-serif;font-weight:600;display:inline-flex;align-items:center;gap:8px;transition:all .2s}
.footer-reserve-btn:hover,.contact-reserve-btn:hover{background:linear-gradient(135deg,#128c7e,#075e54);transform:translateY(-1px)}
.footer-reserve-btn i,.contact-reserve-btn i{font-size:16px}
.map-popup__call{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:8px;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;font-family:'Poppins',sans-serif;transition:background .2s;text-decoration:none;margin-top:8px}
.map-popup__call:hover{background:linear-gradient(135deg,#128c7e,#075e54)}
`;
        document.head.appendChild(style);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.bookingChatbot = new BookingChatbot();
});
