/* ============================================
   LANGUAGE/FLAG SELECTOR
   Choose Your Language on First Visit
   ============================================ */

'use strict';

// ============================================
// LANGUAGE SELECTOR CLASS
// ============================================

class LanguageSelector {
    constructor() {
        this.languages = [
            { code: 'en', name: 'English', flag: '🇬🇧', country: 'United Kingdom' },
            { code: 'tr', name: 'Türkçe', flag: '🇹🇷', country: 'Turkey' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪', country: 'Germany' },
            { code: 'fr', name: 'Français', flag: '🇫🇷', country: 'France' },
            { code: 'it', name: 'Italiano', flag: '🇮🇹', country: 'Italy' },
            { code: 'ru', name: 'Русский', flag: '🇷🇺', country: 'Russia' },
            { code: 'el', name: 'Ελληνικά', flag: '🇬🇷', country: 'Greece' },
            { code: 'us', name: 'English (US)', flag: '🇺🇸', country: 'United States' },
            { code: 'sr', name: 'Српски', flag: '🇷🇸', country: 'Serbia' },
            { code: 'he', name: 'עברית', flag: '🇮🇱', country: 'Israel' }
        ];
        
        this.translations = window.FEELBG_TRANSLATIONS || {};
        
        this.selectedLanguage = null;
        this.init();
    }

    init() {
        // Check if language already selected
        const stored = localStorage.getItem('feelbg_language');
        
        if (!stored) {
            // Show selector on first visit
            setTimeout(() => {
                this.showLanguageModal();
            }, 500);
        } else {
            this.selectedLanguage = JSON.parse(stored);
            this.addLanguageIndicator();
            // Translate page immediately if language is already set
            this.translatePage(this.selectedLanguage.code);
        }
        
        // Setup dropdown functionality
        this.setupDropdownToggle();
    }
    
    setupDropdownToggle() {
        const indicator = document.getElementById('language-indicator');
        const menu = document.getElementById('language-menu');
        
        if (!indicator || !menu) return;
        
        // Toggle menu on click
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            menu.classList.toggle('active');
        });
        
        // Handle language selection
        menu.addEventListener('click', (e) => {
            const option = e.target.closest('.language-option');
            if (option) {
                e.preventDefault();
                const code = option.dataset.code;
                const language = this.languages.find(l => l.code === code);
                
                if (language) {
                    this.selectLanguage(language);
                    menu.classList.remove('active');
                }
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!indicator.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    }

    showLanguageModal() {
        const modal = document.createElement('div');
        modal.className = 'language-modal';
        modal.innerHTML = `
            <div class="language-modal__overlay"></div>
            <div class="language-modal__content">
                <div class="language-modal__header">
                    <h2>🌍 Welcome to Belgrade!</h2>
                    <p>Choose your language / Изаберите језик / Dil seçin</p>
                </div>
                
                <div class="language-grid">
                    ${this.languages.map(lang => `
                        <button class="language-card" data-code="${lang.code}" data-name="${lang.name}">
                            <div class="language-flag">${lang.flag}</div>
                            <div class="language-name">${lang.name}</div>
                            <div class="language-country">${lang.country}</div>
                        </button>
                    `).join('')}
                </div>
                
                <p class="language-note">
                    <i class="fas fa-info-circle"></i>
                    You can change this later in settings
                </p>
            </div>
        `;

        document.body.appendChild(modal);
        this.addLanguageModalStyles();
        this.setupLanguageModalEvents(modal);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    setupLanguageModalEvents(modal) {
        const cards = modal.querySelectorAll('.language-card');
        
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const code = card.dataset.code;
                const name = card.dataset.name;
                const language = this.languages.find(l => l.code === code);
                
                // Animate selection
                cards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                // Save selection after animation
                setTimeout(() => {
                    this.selectLanguage(language);
                    modal.classList.add('closing');
                    
                    setTimeout(() => {
                        modal.remove();
                        document.body.style.overflow = '';
                        this.showWelcomeToast(language);
                    }, 400);
                }, 300);
            });
        });
    }

    selectLanguage(language) {
        this.selectedLanguage = language;
        localStorage.setItem('feelbg_language', JSON.stringify(language));
        this.addLanguageIndicator();
        this.translatePage(language.code);
        
        console.log(`Language selected: ${language.name} (${language.code})`);
    }

    translatePage(langCode) {
        const lang = this.translations[langCode] || {};
        const fallback = this.translations['en'] || {};
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = lang[key] || fallback[key];
            if (text) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = text;
                } else if (element.tagName === 'OPTION') {
                    element.textContent = text;
                } else {
                    element.textContent = text;
                }
            }
        });
    }

    addLanguageIndicator() {
        // Update existing indicator
        const indicator = document.getElementById('language-indicator');
        const flagImg = document.getElementById('current-flag');
        if (indicator && flagImg) {
            const flagMap = {
                'en': 'gb',
                'us': 'us',
                'tr': 'tr',
                'de': 'de',
                'fr': 'fr',
                'it': 'it',
                'ru': 'ru',
                'el': 'gr',
                'sr': 'rs',
                'he': 'il'
            };
            const countryCode = flagMap[this.selectedLanguage.code] || 'us';
            flagImg.src = `https://flagcdn.com/w80/${countryCode}.png`;
            flagImg.alt = countryCode.toUpperCase();
            indicator.title = this.selectedLanguage.name;
        }
    }

    showWelcomeToast(language) {
        const welcomeMessages = {
            'en': 'Welcome to FeelBG!',
            'tr': 'FeelBG\'ye Hoş Geldiniz!',
            'de': 'Willkommen bei FeelBG!',
            'fr': 'Bienvenue chez FeelBG!',
            'it': 'Benvenuto a FeelBG!',
            'ru': 'Добро пожаловать в FeelBG!',
            'el': 'Καλώς ήρθατε στο FeelBG!',
            'us': 'Welcome to FeelBG!'
        };

        const message = welcomeMessages[language.code] || welcomeMessages['en'];
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 1.25rem 2rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border-radius: 1rem;
            box-shadow: 0 12px 48px rgba(16, 185, 129, 0.4);
            z-index: 10002;
            animation: slideInUp 0.5s ease;
            font-weight: 600;
            font-size: 1.125rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        `;
        toast.innerHTML = `
            <span style="font-size: 2rem;">${language.flag}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.5s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 500);
        }, 4000);
    }

    addLanguageModalStyles() {
        if (document.getElementById('language-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'language-modal-styles';
        style.textContent = `
            .language-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
                animation: fadeIn 0.5s ease;
            }

            .language-modal.closing {
                animation: fadeOut 0.4s ease;
            }

            .language-modal__overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(184, 134, 11, 0.9) 100%);
                backdrop-filter: blur(10px);
            }

            .language-modal__content {
                position: relative;
                background: white;
                border-radius: 2rem;
                padding: 3rem 2.5rem;
                max-width: 900px;
                width: 100%;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
                animation: zoomIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                max-height: 90vh;
                overflow-y: auto;
            }

            .language-modal__header {
                text-align: center;
                margin-bottom: 3rem;
            }

            .language-modal__header h2 {
                font-size: 2.5rem;
                background: linear-gradient(135deg, #1e3a8a 0%, #b8860b 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.75rem;
                font-weight: 900;
            }

            .language-modal__header p {
                font-size: 1.125rem;
                color: #6b7280;
                font-weight: 500;
            }

            .language-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .language-card {
                background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
                border: 3px solid #e5e7eb;
                border-radius: 1.5rem;
                padding: 2rem 1.5rem;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            .language-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(184, 134, 11, 0.05) 100%);
                opacity: 0;
                transition: opacity 0.3s;
            }

            .language-card:hover {
                transform: translateY(-10px) scale(1.05);
                border-color: #b8860b;
                box-shadow: 0 20px 50px rgba(184, 134, 11, 0.3);
            }

            .language-card:hover::before {
                opacity: 1;
            }

            .language-card.selected {
                background: linear-gradient(135deg, #1e3a8a 0%, #b8860b 100%);
                border-color: #b8860b;
                transform: scale(1.1);
                box-shadow: 0 25px 60px rgba(184, 134, 11, 0.5);
            }

            .language-card.selected .language-flag {
                transform: scale(1.3);
            }

            .language-card.selected .language-name,
            .language-card.selected .language-country {
                color: white;
            }

            .language-flag {
                font-size: 4rem;
                margin-bottom: 1rem;
                transition: all 0.3s;
                line-height: 1;
            }

            .language-name {
                font-size: 1.25rem;
                font-weight: 700;
                color: #1e3a8a;
                margin-bottom: 0.5rem;
                transition: color 0.3s;
            }

            .language-country {
                font-size: 0.875rem;
                color: #6b7280;
                font-weight: 500;
                transition: color 0.3s;
            }

            .language-note {
                text-align: center;
                color: #6b7280;
                font-size: 0.938rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            .language-note i {
                color: #3b82f6;
            }

            .flag-icon {
                font-size: 1.5rem;
                line-height: 1;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }

            @keyframes zoomIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes slideOutDown {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(30px);
                }
            }

            @media (max-width: 768px) {
                .language-modal__content {
                    padding: 2rem 1.5rem;
                }

                .language-modal__header h2 {
                    font-size: 2rem;
                }

                .language-grid {
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }

                .language-card {
                    padding: 1.5rem 1rem;
                }

                .language-flag {
                    font-size: 3rem;
                }

                .language-name {
                    font-size: 1rem;
                }
            }

            @media (max-width: 480px) {
                .language-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        document.head.appendChild(style);
    }

    getCurrentLanguage() {
        return this.selectedLanguage;
    }

    changeLanguage(code) {
        const language = this.languages.find(l => l.code === code);
        if (language) {
            this.selectLanguage(language);
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    window.languageSelector = new LanguageSelector();
});


