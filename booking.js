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
        return lang[key] || fallback[key] || key;
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
        requestAnimationFrame(() => modal.classList.add('bcb-open'));
        this.messagesEl = document.getElementById('bcb-messages');
        this.inputEl = document.getElementById('bcb-input');
        modal.querySelector('.bcb-overlay').addEventListener('click', () => this.close());
        modal.querySelector('.bcb-close').addEventListener('click', () => this.close());
        document.getElementById('bcb-send').addEventListener('click', () => this.handleSend());
        this.inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.handleSend(); });
        this.askNext();
    }

    close() {
        const modal = document.getElementById('booking-chatbot-modal');
        if (modal) {
            modal.classList.remove('bcb-open');
            setTimeout(() => modal.remove(), 300);
        }
    }

    addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `bcb-msg bcb-msg--${sender}`;
        div.innerHTML = text;
        this.messagesEl.appendChild(div);
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    askNext() {
        const questions = [
            this.t('chatbot.q1'),
            this.t('chatbot.q2'),
            this.t('chatbot.q3')
        ];
        setTimeout(() => {
            this.addMessage(questions[this.step], 'bot');
            this.inputEl.focus();
        }, 400);
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

        const msg = `${this.t('chatbot.reservationFor')} ${this.answers.venue}\n${this.t('chatbot.guests')}: ${this.answers.guests}\n${this.t('chatbot.time')}: ${this.answers.time}\n${this.t('chatbot.requests')}: ${this.answers.requests}`;
        const encoded = encodeURIComponent(msg);
        const waUrl = `https://wa.me/${this.whatsappNumber}?text=${encoded}`;

        setTimeout(() => {
            this.addMessage(
                `${this.t('chatbot.summary')}<br><br>` +
                `<div class="bcb-summary">` +
                `<div class="bcb-summary-row"><i class="fas fa-map-marker-alt"></i> ${this.answers.venue}</div>` +
                `<div class="bcb-summary-row"><i class="fas fa-users"></i> ${this.answers.guests} ${this.t('chatbot.people')}</div>` +
                `<div class="bcb-summary-row"><i class="fas fa-clock"></i> ${this.answers.time}</div>` +
                `<div class="bcb-summary-row"><i class="fas fa-comment"></i> ${this.answers.requests}</div>` +
                `</div>` +
                `<a href="${waUrl}" target="_blank" rel="noopener" class="bcb-whatsapp-btn">` +
                `<i class="fab fa-whatsapp"></i> ${this.t('chatbot.sendWhatsApp')}</a>`,
                'bot'
            );
        }, 500);
    }

    injectStyles() {
        if (document.getElementById('bcb-styles')) return;
        const style = document.createElement('style');
        style.id = 'bcb-styles';
        style.textContent = `
#booking-chatbot-modal{position:fixed;top:0;left:0;width:100%;height:100%;z-index:100000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s}
#booking-chatbot-modal.bcb-open{opacity:1}
.bcb-overlay{position:absolute;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px)}
.bcb-container{position:relative;width:380px;max-width:92vw;height:520px;max-height:85vh;background:#fff;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);transform:translateY(30px) scale(.95);transition:transform .3s}
.bcb-open .bcb-container{transform:translateY(0) scale(1)}
.bcb-header{background:linear-gradient(135deg,#1e3a8a,#2d4ea0);color:#fff;padding:16px;display:flex;align-items:center;justify-content:space-between}
.bcb-header-info{display:flex;align-items:center;gap:12px}
.bcb-avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:18px}
.bcb-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:700}
.bcb-subtitle{font-size:12px;opacity:.8;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bcb-close{background:none;border:none;color:#fff;font-size:24px;cursor:pointer;padding:4px 8px;line-height:1;opacity:.8}
.bcb-close:hover{opacity:1}
.bcb-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f0f2f5}
.bcb-msg{max-width:82%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5;animation:bcbFadeIn .3s}
.bcb-msg--bot{align-self:flex-start;background:#fff;color:#1a1a1a;border-bottom-left-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.bcb-msg--user{align-self:flex-end;background:linear-gradient(135deg,#1e3a8a,#2d4ea0);color:#fff;border-bottom-right-radius:4px}
@keyframes bcbFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.bcb-input-area{display:flex;padding:12px;gap:8px;background:#fff;border-top:1px solid #e5e7eb}
.bcb-input{flex:1;border:1px solid #d1d5db;border-radius:24px;padding:10px 16px;font-size:14px;outline:none;transition:border .2s;font-family:'Poppins',sans-serif}
.bcb-input:focus{border-color:#1e3a8a}
.bcb-send{width:40px;height:40px;border-radius:50%;border:none;background:linear-gradient(135deg,#1e3a8a,#2d4ea0);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:transform .15s}
.bcb-send:hover{transform:scale(1.1)}
.bcb-summary{background:#f8f9fa;border-radius:8px;padding:10px;margin:6px 0;border-left:3px solid #b8860b}
.bcb-summary-row{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px}
.bcb-summary-row i{color:#b8860b;width:16px;text-align:center}
.bcb-whatsapp-btn{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px;padding:12px 20px;background:#25d366;color:#fff!important;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;transition:background .2s}
.bcb-whatsapp-btn:hover{background:#1da851}
.bcb-whatsapp-btn i{font-size:20px}
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
