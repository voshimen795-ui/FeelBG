/* ============================================
   MODERN JAVASCRIPT FUNCTIONALITY
   High-Level Interactive Features
   ============================================ */

'use strict';

// ============================================
// UTILITY FUNCTIONS
// ============================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait = 20) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit = 100) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ============================================
// PRELOADER
// ============================================

class Preloader {
    constructor() {
        this.preloader = $('#preloader');
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hide();
            }, 1000);
        });
    }

    hide() {
        if (!this.preloader) return;
        this.preloader.classList.add('hidden');
        setTimeout(() => {
            if (this.preloader) this.preloader.style.display = 'none';
        }, 500);
    }
}

// ============================================
// CUSTOM CURSOR
// ============================================

class CustomCursor {
    constructor() {
        this.cursorDot = $('[data-cursor-dot]');
        this.cursorOutline = $('[data-cursor-outline]');
        this.posX = 0;
        this.posY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        
        if (window.innerWidth >= 1024) {
            this.init();
        }
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            this.cursorDot.style.left = `${e.clientX}px`;
            this.cursorDot.style.top = `${e.clientY}px`;
        });

        // Smooth cursor outline follow
        const animate = () => {
            const distX = this.mouseX - this.posX;
            const distY = this.mouseY - this.posY;
            
            this.posX += distX * 0.1;
            this.posY += distY * 0.1;
            
            this.cursorOutline.style.left = `${this.posX}px`;
            this.cursorOutline.style.top = `${this.posY}px`;
            
            requestAnimationFrame(animate);
        };
        
        animate();

        // Interactive elements
        const interactiveElements = $$('a, button, .btn, .service__card, .portfolio__item');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursorDot.style.transform = 'translate(-50%, -50%) scale(2)';
                this.cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
            });
            
            el.addEventListener('mouseleave', () => {
                this.cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
                this.cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });
    }
}

// ============================================
// HEADER SCROLL BEHAVIOR
// ============================================

class Header {
    constructor() {
        this.header = $('#header');
        this.navToggle = $('#nav-toggle');
        this.navClose = $('#nav-close');
        this.navMenu = $('#nav-menu');
        this.navLinks = $$('.nav__link');
        
        this.init();
    }

    init() {
        this.handleScroll();
        this.handleMobileMenu();
        this.handleActiveLink();
    }

    handleScroll() {
        const scrollHeader = () => {
            if (window.scrollY >= 80) {
                this.header.classList.add('scroll-header');
            } else {
                this.header.classList.remove('scroll-header');
            }
        };

        window.addEventListener('scroll', throttle(scrollHeader, 100));
    }

    handleMobileMenu() {
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => {
                this.navMenu.classList.add('show-menu');
            });
        }

        if (this.navClose) {
            this.navClose.addEventListener('click', () => {
                this.navMenu.classList.remove('show-menu');
            });
        }

        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.navMenu.classList.remove('show-menu');
            });
        });
    }

    handleActiveLink() {
        const sections = $$('section[id]');

        const scrollActive = () => {
            const scrollY = window.pageYOffset;

            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');
                const navLink = $(`.nav__link[href="#${sectionId}"]`);

                if (navLink) {
                    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                        navLink.classList.add('active-link');
                    } else {
                        navLink.classList.remove('active-link');
                    }
                }
            });
        };

        window.addEventListener('scroll', throttle(scrollActive, 100));
    }
}


// ============================================
// ANIMATED COUNTER
// ============================================

class AnimatedCounter {
    constructor() {
        this.counters = $$('.stat__number');
        this.hasAnimated = false;
        
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.animateCounters();
                    this.hasAnimated = true;
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    animateCounters() {
        this.counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const increment = target / 100;
            let current = 0;

            const updateCounter = () => {
                current += increment;
                
                if (current < target) {
                    counter.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + '+';
                }
            };

            updateCounter();
        });
    }
}

// ============================================
// PARTICLES ANIMATION
// ============================================

class ParticlesAnimation {
    constructor() {
        this.particlesContainer = $('#particles');
        this.particleCount = 50;
        
        if (this.particlesContainer) {
            this.init();
        }
    }

    init() {
        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = 'rgba(255, 255, 255, 0.5)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.pointerEvents = 'none';
        
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.animate([
            { 
                transform: 'translateY(0) translateX(0)',
                opacity: 0
            },
            { 
                opacity: 1,
                offset: 0.1
            },
            { 
                opacity: 1,
                offset: 0.9
            },
            { 
                transform: `translateY(-100vh) translateX(${Math.random() * 100 - 50}px)`,
                opacity: 0
            }
        ], {
            duration: duration * 1000,
            delay: delay * 1000,
            iterations: Infinity,
            easing: 'linear'
        });
        
        this.particlesContainer.appendChild(particle);
    }
}

// ============================================
// SMOOTH SCROLL
// ============================================

class SmoothScroll {
    constructor() {
        this.links = $$('a[href^="#"]');
        this.init();
    }

    init() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href !== '#' && href.startsWith('#')) {
                    e.preventDefault();
                    const target = $(href);
                    
                    if (target) {
                        const headerHeight = $('#header').offsetHeight;
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
// SCROLL TO TOP BUTTON
// ============================================

class ScrollToTop {
    constructor() {
        this.button = $('#scroll-top');
        this.init();
    }

    init() {
        window.addEventListener('scroll', throttle(() => {
            if (window.scrollY >= 500) {
                this.button.classList.add('show');
            } else {
                this.button.classList.remove('show');
            }
        }, 100));

        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ============================================
// FORM VALIDATION & SUBMISSION
// ============================================

class ContactForm {
    constructor() {
        this.form = $('#contact-form');
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    handleSubmit() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Show success message
        this.showMessage('success', 'Thank you! Your message has been sent successfully.');
        
        // Reset form
        this.form.reset();
        
        // In a real application, you would send this data to a server
        console.log('Form submitted:', data);
    }

    showMessage(type, message) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1.5rem 2rem;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
            color: white;
            border-radius: 1rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInRight 0.5s ease-out;
            font-weight: 600;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 500);
        }, 3000);
    }
}

// ============================================
// NEWSLETTER FORM
// ============================================

class NewsletterForm {
    constructor() {
        this.form = $('.newsletter__form');
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = this.form.querySelector('input[type="email"]').value;
            
            // Show success message
            this.showMessage('success', 'Successfully subscribed to our newsletter!');
            
            // Reset form
            this.form.reset();
            
            console.log('Newsletter subscription:', email);
        });
    }

    showMessage(type, message) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
            color: white;
            border-radius: 0.75rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInUp 0.5s ease-out;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutDown 0.5s ease-out';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 500);
        }, 3000);
    }
}

// ============================================
// PARALLAX EFFECT
// ============================================

class ParallaxEffect {
    constructor() {
        this.elements = $$('.hero__background, .animated-shapes');
        this.init();
    }

    init() {
        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.pageYOffset;
            
            this.elements.forEach(element => {
                const speed = 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        }, 10));
    }
}

// ============================================
// LAZY LOADING IMAGES
// ============================================

class LazyLoadImages {
    constructor() {
        this.images = $$('img[data-src]');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            this.images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            this.images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }
}

// ============================================
// TYPING ANIMATION
// ============================================

class TypingAnimation {
    constructor(element, words, wait = 3000) {
        this.element = $(element);
        this.words = words;
        this.txt = '';
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.isDeleting = false;
        
        if (this.element) {
            this.type();
        }
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.element.textContent = this.txt;

        let typeSpeed = 150;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// ============================================
// AOS ANIMATION INITIALIZATION
// ============================================

const initAOS = () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic',
            disable: 'mobile'
        });
    }
};

// ============================================
// PAGE VISIBILITY API
// ============================================

class PageVisibility {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.title = '👋 Come back!';
            } else {
                document.title = 'Feelbg - Modern Elegance';
            }
        });
    }
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Defer non-critical resources
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.loadNonCriticalResources();
            });
        } else {
            setTimeout(() => {
                this.loadNonCriticalResources();
            }, 1000);
        }
    }

    loadNonCriticalResources() {
        // Load any deferred resources here
        console.log('Non-critical resources loaded');
    }
}

// ============================================
// MOUSE MOVE EFFECTS
// ============================================

class MouseMoveEffects {
    constructor() {
        this.cards = $$('.service__card, .portfolio__item');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================

class KeyboardNavigation {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            // ESC key closes mobile menu
            if (e.key === 'Escape') {
                const navMenu = $('#nav-menu');
                if (navMenu && navMenu.classList.contains('show-menu')) {
                    navMenu.classList.remove('show-menu');
                }
            }
            
            // Arrow keys for navigation
            if (e.key === 'ArrowUp' && e.ctrlKey) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
}

// ============================================
// HERO SLIDESHOW
// ============================================

class HeroSlideshow {
    constructor() {
        this.videos = Array.from(document.querySelectorAll('.hero__video'));
        this.fallback = document.querySelector('.hero__slide');
        this.current = 0;
        this.CLIP_SECONDS = 9; // how many seconds each clip plays before crossfading

        if (this.videos.length) {
            this.init();
        } else {
            this.initImageFallback();
        }
    }

    // Legacy behavior: if no <video class="hero__video"> elements are present,
    // cycle through .hero__slide background images instead.
    initImageFallback() {
        const slides = document.querySelectorAll('.hero__slide');
        if (slides.length <= 1) return;
        let current = 0;
        setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, 6000);
    }

    safePlay(v) {
        const p = v.play();
        if (p && p.catch) p.catch(() => {
            // Autoplay blocked or weak network — fallback image stays, nothing breaks
        });
    }

    init() {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return; // fallback image stays put, CSS hides the <video> elements
        }

        const first = this.videos[0];

        // Once the first video is actually playing, hide the fallback image
        first.addEventListener('playing', () => {
            if (this.fallback) this.fallback.classList.remove('active');
            first.classList.add('active');
        }, { once: true });

        this.safePlay(first);
        if (this.videos[1]) this.videos[1].preload = 'auto'; // preload the next clip

        if (this.videos.length > 1) {
            setInterval(() => this.nextVideo(), this.CLIP_SECONDS * 1000);
        }

        // Battery saving: pause when the tab/app isn't visible
        document.addEventListener('visibilitychange', () => {
            const v = this.videos[this.current];
            if (document.hidden) v.pause();
            else this.safePlay(v);
        });
    }

    nextVideo() {
        const cur = this.videos[this.current];
        this.current = (this.current + 1) % this.videos.length; // endless rotation
        const nxt = this.videos[this.current];
        nxt.preload = 'auto';
        nxt.currentTime = 0;
        this.safePlay(nxt);
        nxt.classList.add('active');
        cur.classList.remove('active');
        setTimeout(() => cur.pause(), 1300); // pause the old clip only after the crossfade finishes
    }
}

// ============================================
// INITIALIZATION
// ============================================

// ============================================
// LIVE EVENTS DATE INITIALIZER
// Each slide carries its real calendar date in data-event-date. The
// displayed date and the "live / coming up / save the date" status are
// both computed against *today's* real date, so the section never lies
// about an event being "live tonight" once that date has passed — it
// stays accurate for as long as the site is live, not just on the day
// this was written.
// ============================================

function liveEventsT(key) {
    const translations = window.FEELBG_TRANSLATIONS || {};
    const stored = localStorage.getItem('feelbg_language');
    const langCode = stored ? JSON.parse(stored).code : 'en';
    const lang = translations[langCode] || {};
    const fallback = translations['en'] || {};
    if (key in lang) return lang[key];
    if (key in fallback) return fallback[key];
    return key;
}

class LiveEventsInit {
    constructor() {
        this.init();
    }

    init() {
        const fmt = (d) => d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let firstUpcomingRadioId = null;

        document.querySelectorAll('.event-slide[data-event-date]').forEach((slide) => {
            const eventDate = new Date(slide.dataset.eventDate + 'T00:00:00');
            const index = slide.id.replace('slide-', '');
            const dateEl = document.getElementById(`ev-date-${index}`);
            if (dateEl) dateEl.textContent = fmt(eventDate);

            const diffDays = Math.round((eventDate - todayMidnight) / 86400000);
            const statusEl = slide.querySelector('.event-status');
            const radio = document.getElementById(`b${index}`);
            const thumb = document.querySelector(`label.events-thumb[for="b${index}"]`);
            const dot = document.querySelector(`label.events-dot[for="b${index}"]`);

            if (diffDays < 0) {
                // Event has already happened — hide it from the live carousel
                // instead of showing a stale "tonight!" claim for a past date.
                slide.style.display = 'none';
                if (radio) radio.style.display = 'none';
                if (thumb) thumb.style.display = 'none';
                if (dot) dot.style.display = 'none';
                return;
            }

            if (!firstUpcomingRadioId && radio) firstUpcomingRadioId = radio.id;

            if (statusEl) {
                statusEl.className = 'event-status';
                if (diffDays === 0) {
                    statusEl.classList.add('live');
                    statusEl.textContent = liveEventsT('events.status.live');
                } else if (diffDays <= 21) {
                    statusEl.classList.add('upcoming');
                    statusEl.textContent = liveEventsT('events.status.soon');
                } else {
                    statusEl.classList.add('news');
                    statusEl.textContent = liveEventsT('events.status.saveDate');
                }
            }
        });

        // If the radio that's checked by default (slide 1) turned out to be a
        // past event and got hidden above, jump the carousel to whichever
        // slide is actually first in line instead of showing a blank frame.
        const checkedRadio = document.querySelector('.events-carousel-wrapper input[name="control"]:checked');
        if (firstUpcomingRadioId && (!checkedRadio || checkedRadio.style.display === 'none')) {
            const target = document.getElementById(firstUpcomingRadioId);
            if (target) target.checked = true;
        }

        this.bindNavButtons();
    }

    bindNavButtons() {
        const prevBtn = document.getElementById('events-prev');
        const nextBtn = document.getElementById('events-next');
        if (!prevBtn || !nextBtn) return;

        const go = (delta) => {
            const radios = Array.from(document.querySelectorAll('.events-carousel-wrapper input[name="control"]'))
                .filter((r) => r.style.display !== 'none');
            if (!radios.length) return;
            const currentIndex = radios.findIndex((r) => r.checked);
            const nextIndex = (currentIndex + delta + radios.length) % radios.length;
            radios[nextIndex].checked = true;
        };

        prevBtn.addEventListener('click', () => go(-1));
        nextBtn.addEventListener('click', () => go(1));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new Preloader();
    new CustomCursor();
    new Header();
    new AnimatedCounter();
    new ParticlesAnimation();
    new SmoothScroll();
    new ScrollToTop();
    new ContactForm();
    new NewsletterForm();
    new ParallaxEffect();
    new LazyLoadImages();
    new PageVisibility();
    new PerformanceOptimizer();
    new MouseMoveEffects();
    new KeyboardNavigation();
    new HeroSlideshow();
    new LiveEventsInit();
    
    // Initialize AOS
    initAOS();
    
    // Optional: Typing animation for hero title
    // Uncomment if you want the typing effect
    // new TypingAnimation('.hero__title-accent', ['Experiences', 'Solutions', 'Innovations'], 3000);
    
    console.log('%c🚀 FeelBG Website Loaded Successfully!', 'color: #b8860b; font-size: 20px; font-weight: bold;');
    console.log('%c✨ Designed with Royal Blue & Bronze Gold', 'color: #1e3a8a; font-size: 14px;');
});

// ============================================
// CSS ANIMATIONS (to be added via JS)
// ============================================

const addAnimationStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes slideInUp {
            from {
                transform: translateY(100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutDown {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
};

addAnimationStyles();

// Service Worker Registration (Progressive Web App)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you create a service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}

