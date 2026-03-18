/* ============================================
   BOOKING SYSTEM
   Restaurant, Cafe, Nightlife Reservations
   ============================================ */

'use strict';

// ============================================
// BOOKING CLASS
// ============================================

class BookingSystem {
    constructor() {
        this.bookings = [];
        this.init();
    }

    init() {
        this.loadBookings();
        this.setupBookingButtons();
    }

    loadBookings() {
        const stored = localStorage.getItem('feelbg_bookings');
        this.bookings = stored ? JSON.parse(stored) : [];
    }

    saveBookings() {
        localStorage.setItem('feelbg_bookings', JSON.stringify(this.bookings));
    }

    setupBookingButtons() {
        // Add booking buttons to all detail views
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-details')) {
                const card = e.target.closest('.place-card');
                if (card) {
                    const placeName = card.querySelector('.place-card__title').textContent;
                    this.showBookingModal(placeName, card);
                }
            }
        });
    }

    showBookingModal(placeName, card) {
        // Check if user is logged in
        if (!window.userAuth || !window.userAuth.isLoggedIn()) {
            this.showToast('Please login to make a booking', 'error');
            setTimeout(() => {
                if (window.userAuth) {
                    window.userAuth.showLoginModal();
                }
            }, 500);
            return;
        }

        const location = card.querySelector('.place-card__location').textContent.trim();
        const cuisine = card.querySelector('.place-card__cuisine')?.textContent.trim() || '';

        const modal = document.createElement('div');
        modal.className = 'booking-modal';
        modal.innerHTML = `
            <div class="booking-modal__overlay"></div>
            <div class="booking-modal__content">
                <button class="booking-modal__close">&times;</button>
                
                <div class="booking-header">
                    <h2>Make a Reservation</h2>
                    <p class="booking-place-name">${placeName}</p>
                    <p class="booking-location">${location}</p>
                </div>
                
                <form class="booking-form" id="booking-form">
                    <div class="booking-grid">
                        <div class="form-group">
                            <label for="booking-date">
                                <i class="fas fa-calendar"></i> Date
                            </label>
                            <input type="date" id="booking-date" required min="${this.getTodayDate()}">
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-time">
                                <i class="fas fa-clock"></i> Time
                            </label>
                            <select id="booking-time" required>
                                <option value="">Select time</option>
                                ${this.generateTimeSlots()}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-guests">
                                <i class="fas fa-users"></i> Guests
                            </label>
                            <select id="booking-guests" required>
                                ${Array.from({length: 20}, (_, i) => i + 1).map(n => 
                                    `<option value="${n}">${n} ${n === 1 ? 'Guest' : 'Guests'}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-occasion">
                                <i class="fas fa-star"></i> Occasion
                            </label>
                            <select id="booking-occasion">
                                <option value="">Select occasion</option>
                                <option value="birthday">Birthday</option>
                                <option value="anniversary">Anniversary</option>
                                <option value="date">Date Night</option>
                                <option value="business">Business</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="booking-notes">
                            <i class="fas fa-comment"></i> Special Requests
                        </label>
                        <textarea id="booking-notes" rows="3" placeholder="Dietary requirements, seating preferences, etc."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="booking-phone">
                            <i class="fas fa-phone"></i> Contact Phone
                        </label>
                        <input type="tel" id="booking-phone" placeholder="+381 11 123 4567" required>
                    </div>
                    
                    <div class="booking-summary">
                        <h3>Booking Summary</h3>
                        <div class="summary-item">
                            <span>Place:</span>
                            <strong>${placeName}</strong>
                        </div>
                        <div class="summary-item">
                            <span>User:</span>
                            <strong>${window.userAuth.getCurrentUser().name}</strong>
                        </div>
                    </div>
                    
                    <button type="submit" class="booking-submit-btn">
                        <i class="fas fa-check-circle"></i>
                        <span>Confirm Reservation</span>
                    </button>
                    
                    <p class="booking-note">
                        <i class="fas fa-info-circle"></i>
                        You will receive a confirmation email shortly
                    </p>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        this.addBookingModalStyles();
        this.setupBookingModalEvents(modal, placeName);
    }

    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    generateTimeSlots() {
        const slots = [];
        for (let hour = 10; hour <= 23; hour++) {
            for (let min of ['00', '30']) {
                const time = `${hour.toString().padStart(2, '0')}:${min}`;
                slots.push(`<option value="${time}">${time}</option>`);
            }
        }
        return slots.join('');
    }

    setupBookingModalEvents(modal, placeName) {
        // Close button
        modal.querySelector('.booking-modal__close').addEventListener('click', () => {
            modal.remove();
        });

        // Overlay click
        modal.querySelector('.booking-modal__overlay').addEventListener('click', () => {
            modal.remove();
        });

        // Form submission
        modal.querySelector('#booking-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const booking = {
                id: Date.now(),
                userId: window.userAuth.getCurrentUser().id,
                placeName: placeName,
                date: modal.querySelector('#booking-date').value,
                time: modal.querySelector('#booking-time').value,
                guests: modal.querySelector('#booking-guests').value,
                occasion: modal.querySelector('#booking-occasion').value,
                notes: modal.querySelector('#booking-notes').value,
                phone: modal.querySelector('#booking-phone').value,
                status: 'confirmed',
                createdAt: new Date().toISOString()
            };

            this.bookings.push(booking);
            this.saveBookings();
            
            modal.remove();
            this.showSuccessModal(booking);
        });
    }

    showSuccessModal(booking) {
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="success-modal__overlay"></div>
            <div class="success-modal__content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Booking Confirmed!</h2>
                <p>Your reservation has been successfully made</p>
                
                <div class="success-details">
                    <div class="success-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <strong>${booking.placeName}</strong>
                        </div>
                    </div>
                    <div class="success-item">
                        <i class="fas fa-calendar"></i>
                        <div>
                            <strong>${this.formatDate(booking.date)}</strong>
                        </div>
                    </div>
                    <div class="success-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>${booking.time}</strong>
                        </div>
                    </div>
                    <div class="success-item">
                        <i class="fas fa-users"></i>
                        <div>
                            <strong>${booking.guests} ${booking.guests > 1 ? 'Guests' : 'Guest'}</strong>
                        </div>
                    </div>
                </div>
                
                <p class="success-note">
                    A confirmation email has been sent to your registered email address.
                </p>
                
                <div class="success-buttons">
                    <button class="btn btn-primary" onclick="this.closest('.success-modal').remove()">
                        <span>Done</span>
                    </button>
                    <button class="btn btn-secondary" onclick="window.location.href='bookings.html'">
                        <span>View All Bookings</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addSuccessModalStyles();

        // Auto close on overlay
        modal.querySelector('.success-modal__overlay').addEventListener('click', () => {
            modal.remove();
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    addBookingModalStyles() {
        if (document.getElementById('booking-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'booking-modal-styles';
        style.textContent = `
            .booking-modal {
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
                overflow-y: auto;
            }

            .booking-modal__overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                animation: fadeIn 0.3s ease;
            }

            .booking-modal__content {
                position: relative;
                background: white;
                border-radius: 1.5rem;
                padding: 2.5rem;
                max-width: 650px;
                width: 100%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideInUp 0.3s ease;
                max-height: 90vh;
                overflow-y: auto;
            }

            .booking-modal__close {
                position: absolute;
                top: 1.5rem;
                right: 1.5rem;
                width: 40px;
                height: 40px;
                border: none;
                background: #f3f4f6;
                border-radius: 50%;
                font-size: 1.5rem;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.3s;
                z-index: 10;
            }

            .booking-modal__close:hover {
                background: #ef4444;
                color: white;
            }

            .booking-header {
                text-align: center;
                margin-bottom: 2rem;
                padding-bottom: 1.5rem;
                border-bottom: 2px solid #f3f4f6;
            }

            .booking-header h2 {
                font-size: 2rem;
                color: #1e3a8a;
                margin-bottom: 0.5rem;
            }

            .booking-place-name {
                font-size: 1.25rem;
                font-weight: 600;
                color: #b8860b;
                margin-bottom: 0.25rem;
            }

            .booking-location {
                color: #6b7280;
                font-size: 0.938rem;
            }

            .booking-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1.5rem;
                margin-bottom: 1.5rem;
            }

            .booking-form .form-group {
                margin-bottom: 1.5rem;
            }

            .booking-form label {
                display: block;
                font-weight: 600;
                color: #374151;
                margin-bottom: 0.5rem;
                font-size: 0.938rem;
            }

            .booking-form label i {
                color: #b8860b;
                margin-right: 0.5rem;
            }

            .booking-form input,
            .booking-form select,
            .booking-form textarea {
                width: 100%;
                padding: 0.875rem 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 0.75rem;
                font-size: 1rem;
                transition: all 0.3s;
            }

            .booking-form input:focus,
            .booking-form select:focus,
            .booking-form textarea:focus {
                outline: none;
                border-color: #1e3a8a;
            }

            .booking-summary {
                background: #f9fafb;
                padding: 1.5rem;
                border-radius: 1rem;
                margin-bottom: 1.5rem;
            }

            .booking-summary h3 {
                font-size: 1.125rem;
                color: #1e3a8a;
                margin-bottom: 1rem;
            }

            .summary-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid #e5e7eb;
            }

            .summary-item:last-child {
                border-bottom: none;
            }

            .booking-submit-btn {
                width: 100%;
                padding: 1.125rem 2rem;
                background: linear-gradient(135deg, #b8860b, #ffd700);
                color: white;
                border: none;
                border-radius: 0.75rem;
                font-size: 1.125rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
                margin-bottom: 1rem;
            }

            .booking-submit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 32px rgba(184, 134, 11, 0.4);
            }

            .booking-note {
                text-align: center;
                color: #6b7280;
                font-size: 0.875rem;
            }

            .booking-note i {
                color: #3b82f6;
            }

            @media (max-width: 640px) {
                .booking-grid {
                    grid-template-columns: 1fr;
                }

                .booking-modal__content {
                    padding: 1.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    addSuccessModalStyles() {
        if (document.getElementById('success-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'success-modal-styles';
        style.textContent = `
            .success-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            }

            .success-modal__overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                animation: fadeIn 0.3s ease;
            }

            .success-modal__content {
                position: relative;
                background: white;
                border-radius: 1.5rem;
                padding: 3rem;
                max-width: 500px;
                width: 100%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: zoomIn 0.5s ease;
            }

            .success-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 1.5rem;
                background: linear-gradient(135deg, #10b981, #059669);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5rem;
                color: white;
                animation: bounceIn 0.6s ease 0.3s backwards;
            }

            .success-modal__content h2 {
                font-size: 2rem;
                color: #1e3a8a;
                margin-bottom: 0.5rem;
            }

            .success-modal__content > p {
                color: #6b7280;
                margin-bottom: 2rem;
            }

            .success-details {
                background: #f9fafb;
                padding: 1.5rem;
                border-radius: 1rem;
                margin-bottom: 1.5rem;
            }

            .success-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.75rem 0;
                border-bottom: 1px solid #e5e7eb;
            }

            .success-item:last-child {
                border-bottom: none;
            }

            .success-item i {
                width: 30px;
                font-size: 1.25rem;
                color: #b8860b;
            }

            .success-item div {
                flex: 1;
                text-align: left;
            }

            .success-note {
                color: #6b7280;
                font-size: 0.875rem;
                margin-bottom: 1.5rem;
            }

            .success-buttons {
                display: flex;
                gap: 1rem;
            }

            .success-buttons .btn {
                flex: 1;
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

            @keyframes bounceIn {
                0% {
                    opacity: 0;
                    transform: scale(0.3);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.05);
                }
                70% {
                    transform: scale(0.9);
                }
                100% {
                    transform: scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 0.75rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 10002;
            animation: slideInUp 0.3s ease;
            font-weight: 600;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    window.bookingSystem = new BookingSystem();
});


