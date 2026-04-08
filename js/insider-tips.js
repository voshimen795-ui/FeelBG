'use strict';

(function() {
    const tips = [
        { icon: 'fa-coins', text: 'Belgrade is 40-60% cheaper than Western Europe — your euros go much further here!' },
        { icon: 'fa-clock', text: 'Restaurants stay open until midnight, clubs until 6 AM — Belgrade never sleeps.' },
        { icon: 'fa-water', text: 'Tap water in Belgrade is safe and delicious — no need to buy bottled.' },
        { icon: 'fa-taxi', text: 'Use CarGo app (Serbian Uber) for cheaper rides than street taxis.' },
        { icon: 'fa-utensils', text: 'Ask for "domaća rakija" (homemade brandy) — it\'s a free welcome drink at most kafanas.' },
        { icon: 'fa-sun', text: 'Best sunset spot: Kalemegdan Fortress overlooking the confluence of two rivers.' },
        { icon: 'fa-walking', text: 'Knez Mihailova is car-free — perfect for evening strolls and people-watching.' },
        { icon: 'fa-heart', text: 'Locals call Belgrade "Beograd" — use it and they\'ll love you instantly.' },
        { icon: 'fa-music', text: 'Splavovi (river clubs) are open May–October — the floating party scene is legendary.' },
        { icon: 'fa-coffee', text: 'Serbian coffee culture: never rush a coffee, it\'s a 2-hour social ritual here.' },
        { icon: 'fa-bus', text: 'Buy a BusPlus card at any kiosk — unlimited public transport for just €1.50/day.' },
        { icon: 'fa-camera', text: 'Gardoš Tower in Zemun offers the best panoramic photo of Belgrade\'s skyline.' },
    ];

    let currentTip = Math.floor(Math.random() * tips.length);

    const widget = document.createElement('div');
    widget.className = 'insider-tip-widget';
    widget.innerHTML = `
        <button class="insider-tip-toggle" aria-label="Belgrade Insider Tips">
            <i class="fas fa-lightbulb"></i>
        </button>
        <div class="insider-tip-card">
            <div class="insider-tip-header">
                <span class="insider-tip-label">Insider Tip</span>
                <button class="insider-tip-close" aria-label="Close">&times;</button>
            </div>
            <div class="insider-tip-body">
                <i class="fas ${tips[currentTip].icon} insider-tip-icon"></i>
                <p class="insider-tip-text">${tips[currentTip].text}</p>
            </div>
            <button class="insider-tip-next">Next tip <i class="fas fa-arrow-right"></i></button>
        </div>
    `;

    document.body.appendChild(widget);

    const toggle = widget.querySelector('.insider-tip-toggle');
    const card = widget.querySelector('.insider-tip-card');
    const closeBtn = widget.querySelector('.insider-tip-close');
    const nextBtn = widget.querySelector('.insider-tip-next');
    const iconEl = widget.querySelector('.insider-tip-icon');
    const textEl = widget.querySelector('.insider-tip-text');

    let isOpen = false;

    function showTip(index) {
        const tip = tips[index];
        iconEl.className = `fas ${tip.icon} insider-tip-icon`;
        textEl.textContent = tip.text;
    }

    toggle.addEventListener('click', () => {
        isOpen = !isOpen;
        card.classList.toggle('open', isOpen);
        toggle.classList.toggle('active', isOpen);
    });

    closeBtn.addEventListener('click', () => {
        isOpen = false;
        card.classList.remove('open');
        toggle.classList.remove('active');
    });

    nextBtn.addEventListener('click', () => {
        currentTip = (currentTip + 1) % tips.length;
        showTip(currentTip);
        textEl.style.animation = 'none';
        textEl.offsetHeight;
        textEl.style.animation = 'tipFadeIn 0.4s ease';
    });

    setTimeout(() => {
        if (!isOpen) {
            toggle.classList.add('pulse');
            setTimeout(() => toggle.classList.remove('pulse'), 3000);
        }
    }, 5000);
})();
