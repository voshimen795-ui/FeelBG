'use strict';

(function() {
    var tipIcons = [
        'fa-bus', 'fa-tint', 'fa-taxi', 'fa-landmark', 'fa-glass-cheers'
    ];

    function t(key) {
        var translations = window.FEELBG_TRANSLATIONS || {};
        var stored = localStorage.getItem('feelbg_language');
        var langCode = stored ? JSON.parse(stored).code : 'en';
        var lang = translations[langCode] || {};
        var fallback = translations['en'] || {};
        if (key in lang) return lang[key];
        if (key in fallback) return fallback[key];
        return key;
    }

    function getTipText(index) {
        return t('insider.tip' + (index + 1));
    }

    var currentTip = Math.floor(Math.random() * tipIcons.length);

    var widget = document.createElement('div');
    widget.className = 'insider-tip-widget';
    widget.innerHTML = '\
        <button class="insider-tip-toggle" aria-label="Belgrade Insider Tips">\
            <i class="fas fa-lightbulb"></i>\
        </button>\
        <div class="insider-tip-card">\
            <div class="insider-tip-header">\
                <span class="insider-tip-label">' + t('insider.label') + '</span>\
                <button class="insider-tip-close" aria-label="Close">&times;</button>\
            </div>\
            <div class="insider-tip-body">\
                <i class="fas ' + tipIcons[currentTip] + ' insider-tip-icon"></i>\
                <p class="insider-tip-text">' + getTipText(currentTip) + '</p>\
            </div>\
            <button class="insider-tip-next">' + t('insider.nextTip') + ' <i class="fas fa-arrow-right"></i></button>\
        </div>';

    document.body.appendChild(widget);

    var toggle = widget.querySelector('.insider-tip-toggle');
    var card = widget.querySelector('.insider-tip-card');
    var closeBtn = widget.querySelector('.insider-tip-close');
    var nextBtn = widget.querySelector('.insider-tip-next');
    var iconEl = widget.querySelector('.insider-tip-icon');
    var textEl = widget.querySelector('.insider-tip-text');
    var labelEl = widget.querySelector('.insider-tip-label');

    var isOpen = false;

    function showTip(index) {
        iconEl.className = 'fas ' + tipIcons[index] + ' insider-tip-icon';
        textEl.textContent = getTipText(index);
    }

    function refreshLabels() {
        labelEl.textContent = t('insider.label');
        nextBtn.innerHTML = t('insider.nextTip') + ' <i class="fas fa-arrow-right"></i>';
        showTip(currentTip);
    }

    toggle.addEventListener('click', function() {
        isOpen = !isOpen;
        card.classList.toggle('open', isOpen);
        toggle.classList.toggle('active', isOpen);
    });

    closeBtn.addEventListener('click', function() {
        isOpen = false;
        card.classList.remove('open');
        toggle.classList.remove('active');
    });

    nextBtn.addEventListener('click', function() {
        currentTip = (currentTip + 1) % tipIcons.length;
        showTip(currentTip);
        textEl.style.animation = 'none';
        textEl.offsetHeight;
        textEl.style.animation = 'tipFadeIn 0.4s ease';
    });

    document.addEventListener('feelbg:languageChanged', refreshLabels);

    setTimeout(function() {
        if (!isOpen) {
            toggle.classList.add('pulse');
            setTimeout(function() { toggle.classList.remove('pulse'); }, 3000);
        }
    }, 5000);
})();
