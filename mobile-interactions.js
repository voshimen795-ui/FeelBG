/* ============================================
   MOBILE-SPECIFIC INTERACTIONS
   Touch, Swipe, and Mobile UX Features
   ============================================ */

'use strict';

// ============================================
// MOBILE BOTTOM NAVIGATION
// ============================================

class MobileBottomNav {
    constructor() {
        this.init();
    }

    init() {
        // Highlight current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navItems = document.querySelectorAll('.mobile-nav-item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && href.includes(currentPage.replace('.html', ''))) {
                item.classList.add('active');
            }
        });

        // Hide on scroll down, show on scroll up
        let lastScroll = 0;
        const bottomNav = document.querySelector('.mobile-bottom-nav');
        
        if (bottomNav && window.innerWidth < 768) {
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll > lastScroll && currentScroll > 100) {
                    // Scrolling down
                    bottomNav.style.transform = 'translateY(100%)';
                } else {
                    // Scrolling up
                    bottomNav.style.transform = 'translateY(0)';
                }
                
                lastScroll = currentScroll;
            });
        }
    }
}

// ============================================
// FLOATING ACTION BUTTON (FAB)
// ============================================

class FloatingActionButton {
    constructor() {
        this.fab = document.querySelector('.mobile-fab');
        this.panel = document.querySelector('.quick-access-panel');
        this.isOpen = false;
        
        if (this.fab && this.panel) {
            this.init();
        }
    }

    init() {
        this.fab.addEventListener('click', () => {
            this.toggle();
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.mobile-fab') && !e.target.closest('.quick-access-panel')) {
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.open();
        } else {
            this.close();
        }
    }

    open() {
        this.panel.classList.add('active');
        this.fab.style.transform = 'rotate(45deg)';
    }

    close() {
        this.panel.classList.remove('active');
        this.fab.style.transform = 'rotate(0deg)';
        this.isOpen = false;
    }
}

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================

class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('.scroll-reveal');
        this.init();
    }

    init() {
        if (!this.elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(el => observer.observe(el));
    }
}

// ============================================
// SWIPE GESTURE HANDLER
// ============================================

class SwipeHandler {
    constructor(element, onSwipeLeft, onSwipeRight) {
        this.element = element;
        this.onSwipeLeft = onSwipeLeft;
        this.onSwipeRight = onSwipeRight;
        this.startX = 0;
        this.startY = 0;
        this.init();
    }

    init() {
        if (!this.element) return;

        this.element.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        }, { passive: true });

        this.element.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = this.startX - endX;
            const diffY = this.startY - endY;
            
            // Only trigger if horizontal swipe is dominant
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swiped left
                    this.onSwipeLeft && this.onSwipeLeft();
                } else {
                    // Swiped right
                    this.onSwipeRight && this.onSwipeRight();
                }
            }
        }, { passive: true });
    }
}

// ============================================
// IMAGE LAZY LOADING
// ============================================

class LazyImageLoader {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.addEventListener('load', () => {
                            img.classList.add('loaded');
                        });
                        observer.unobserve(img);
                    }
                });
            });

            this.images.forEach(img => observer.observe(img));
        } else {
            // Fallback: load all images
            this.images.forEach(img => {
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
            });
        }
    }
}

// ============================================
// RIPPLE EFFECT ON TAP
// ============================================

class RippleEffect {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('.ripple').forEach(element => {
            element.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = element.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    left: ${x}px;
                    top: ${y}px;
                    transform: scale(0);
                    animation: rippleAnimation 0.6s ease-out;
                    pointer-events: none;
                `;
                
                element.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }
}

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleAnimation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ============================================
// TOUCH FEEDBACK
// ============================================

class TouchFeedback {
    constructor() {
        this.init();
    }

    init() {
        // Add bounce feedback to specific elements
        document.querySelectorAll('.btn, .place-card, .category__card, .filter-pill').forEach(element => {
            element.classList.add('bounce-on-tap');
        });
    }
}

// ============================================
// PULL TO REFRESH (Optional)
// ============================================

class PullToRefresh {
    constructor() {
        this.threshold = 80;
        this.startY = 0;
        this.currentY = 0;
        this.pulling = false;
        this.indicator = document.querySelector('.pull-to-refresh');
        
        if (this.indicator) {
            this.init();
        }
    }

    init() {
        document.addEventListener('touchstart', (e) => {
            if (window.pageYOffset === 0) {
                this.startY = e.touches[0].clientY;
                this.pulling = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!this.pulling) return;
            
            this.currentY = e.touches[0].clientY;
            const distance = this.currentY - this.startY;
            
            if (distance > 0 && distance < this.threshold) {
                this.indicator.classList.add('active');
                this.indicator.innerHTML = '<i class="fas fa-arrow-down"></i> Pull to refresh';
            } else if (distance >= this.threshold) {
                this.indicator.innerHTML = '<i class="fas fa-sync"></i> Release to refresh';
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (this.pulling) {
                const distance = this.currentY - this.startY;
                
                if (distance >= this.threshold) {
                    this.refresh();
                }
                
                this.indicator.classList.remove('active');
                this.pulling = false;
            }
        }, { passive: true });
    }

    refresh() {
        this.indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        
        // Simulate refresh
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// ============================================
// SMOOTH SCROLL TO SECTIONS
// ============================================

class SmoothScrollMobile {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                if (href !== '#' && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    
                    if (target) {
                        const headerHeight = 80;
                        const bottomNavHeight = window.innerWidth < 768 ? 70 : 0;
                        const targetPosition = target.offsetTop - headerHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
}

// ============================================
// ORIENTATION CHANGE HANDLER
// ============================================

class OrientationHandler {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('orientationchange', () => {
            // Refresh layout on orientation change
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 200);
        });
    }
}

// ============================================
// VIBRATION FEEDBACK (Mobile)
// ============================================

function vibrateOnAction(pattern = [10]) {
    if ('vibrate' in navigator && window.innerWidth < 768) {
        navigator.vibrate(pattern);
    }
}

// Add vibration to important actions
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-primary, .mobile-nav-item').forEach(element => {
        element.addEventListener('click', () => {
            vibrateOnAction([10]);
        });
    });
});

// ============================================
// NETWORK STATUS INDICATOR
// ============================================

class NetworkStatus {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('online', () => {
            this.showStatus('Back online', 'success');
        });

        window.addEventListener('offline', () => {
            this.showStatus('No internet connection', 'error');
        });
    }

    showStatus(message, type) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 90px;
            left: 50%;
            transform: translateX(-50%);
            padding: 1rem 2rem;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 2rem;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 10002;
            animation: slideDown 0.3s ease;
            font-weight: 600;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all mobile features
    new MobileBottomNav();
    new FloatingActionButton();
    new ScrollReveal();
    new LazyImageLoader();
    new RippleEffect();
    new TouchFeedback();
    new SmoothScrollMobile();
    new OrientationHandler();
    new NetworkStatus();
    
    // Initialize pull to refresh only if on mobile
    if (window.innerWidth < 768) {
        // Uncomment if you want pull to refresh feature
        // new PullToRefresh();
    }
    
    console.log('%c📱 Mobile Features Loaded!', 'color: #10b981; font-size: 16px; font-weight: bold;');
});

// ============================================
// EXPORT FOR USE IN OTHER SCRIPTS
// ============================================

window.MobileFeatures = {
    vibrateOnAction,
    SwipeHandler
};

