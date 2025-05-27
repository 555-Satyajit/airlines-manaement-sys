// my-bookings.js - Updated version with destination and price removed
class BookingManager {
    constructor() {
        this.bookings = [];
        this.filteredBookings = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadBookings();
    }

    setupEventListeners() {
        // Create a refresh button dynamically if it doesn't exist
        this.createRefreshButton();
        
        // Create a search input dynamically if it doesn't exist
        this.createSearchInput();
        
        // Set up bookings tab click
        const bookingsTab = document.getElementById('bookingsTab');
        if (bookingsTab) {
            bookingsTab.addEventListener('click', () => {
                this.loadBookings();
            });
        }
    }

    async loadBookings() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/bookings', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.bookings = data.bookings || data || [];
            
            // DEBUG: Log the actual structure of your bookings
            console.log('Raw booking data from API:', this.bookings);
            if (this.bookings.length > 0) {
                console.log('First booking structure:', JSON.stringify(this.bookings[0], null, 2));
            }
            
            this.filteredBookings = [...this.bookings];
            
            this.hideLoading();
            this.renderBookings();
            
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.hideLoading();
            this.showError('Failed to load bookings. Please try again.');
        }
    }

    filterBookings(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredBookings = [...this.bookings];
        } else {
            const term = searchTerm.toLowerCase().trim();
            this.filteredBookings = this.bookings.filter(booking => {
                return (
                    booking.confirmationNumber?.toLowerCase().includes(term) ||
                    booking.passenger?.email?.toLowerCase().includes(term) ||
                    booking.flightDetails?.departure?.airport?.toLowerCase().includes(term) ||
                    booking.flightDetails?.departure?.city?.toLowerCase().includes(term) ||
                    booking.seat?.toLowerCase().includes(term)
                );
            });
        }
        this.renderBookings();
    }

    renderBookings() {
        const container = document.getElementById('bookingsList');
        
        if (!container) {
            console.error('Bookings list container not found');
            return;
        }

        if (this.filteredBookings.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">✈️</div>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Bookings Found</h3>
                    <p class="text-gray-500 mb-6">Your flight bookings will appear here once you make a reservation.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredBookings.map(booking => this.createBookingCard(booking)).join('');
        
        // Attach event listeners to new buttons
        this.attachCardEventListeners();
    }

    createBookingCard(booking) {
        // DEBUG: Log each booking as it's being processed
        console.log('Processing booking:', JSON.stringify(booking, null, 2));
        
        const passengerEmail = booking.passenger?.email || 'Unknown Passenger';
        
        const flight = booking.flightDetails || {};
        
        // DEBUG: Log flight details structure
        console.log('Flight details:', JSON.stringify(flight, null, 2));
        
        const departure = flight.departure || {};
        
        // DEBUG: Log departure
        console.log('Departure:', departure);
        
        // Extract departure information with better fallbacks
        const departureAirport = departure.airport || departure.code || 'N/A';
        const departureCity = departure.city || departure.name || 'N/A';
        const departureTime = departure.time || departure.departureTime || 'N/A';
        
        // Format the main flight date with better handling
        let flightDate = 'N/A';
        if (flight.date) {
            try {
                flightDate = new Date(flight.date).toLocaleDateString();
            } catch (e) {
                console.warn('Invalid date format:', flight.date);
                flightDate = flight.date.toString();
            }
        }
        
        // Flight number with multiple fallbacks
        const flightNumber = flight.flightNo || flight.flightNumber || flight.number || `SL${Math.random().toString().substr(2, 4)}`;
        
        const statusColor = this.getStatusColor(booking.status);
        const bookingId = booking._id || booking.id;
        
        // DEBUG: Log what will be displayed
        console.log('Display values:', {
            departureAirport,
            departureCity,
            departureTime,
            flightDate,
            flightNumber
        });
        
        return `
            <div class="booking-card bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div class="p-6">
                    <!-- Debug Info (remove in production) -->
                    <div class="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <strong>Debug:</strong> Airport: ${departureAirport} | City: ${departureCity} | Time: ${departureTime}
                    </div>
                    
                    <!-- Header -->
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-xl font-bold text-gray-900">${flightNumber}</h3>
                            <p class="text-sm text-gray-600">Confirmation: ${booking.confirmationNumber || 'N/A'}</p>
                        </div>
                        <span class="status-badge px-3 py-1 rounded-full text-sm font-medium ${statusColor}">
                            ${booking.status || 'Confirmed'}
                        </span>
                    </div>

                    <!-- Departure Information Only -->
                    <div class="flex items-center mb-4">
                        <div class="text-center">
                            <p class="text-lg font-semibold text-gray-900">${departureAirport}</p>
                            <p class="text-sm text-gray-600">${departureCity}</p>
                            <p class="text-sm text-gray-600">${departureTime}</p>
                        </div>
                        <div class="flex-1 mx-4 relative">
                            <div class="h-px bg-gray-300"></div>
                            <div class="absolute inset-0 flex justify-center items-center">
                                <div class="bg-white px-2">
                                    <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="text-center">
                            <p class="text-lg font-semibold text-gray-900">Flight Departure</p>
                            <p class="text-sm text-gray-600">Ready for Boarding</p>
                        </div>
                    </div>

                    <!-- Passenger and Date Info (Price removed) -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                        <div>
                            <p class="text-gray-600">Passenger</p>
                            <p class="font-semibold">${passengerEmail}</p>
                        </div>
                        <div>
                            <p class="text-gray-600">Date</p>
                            <p class="font-semibold">${flightDate}</p>
                        </div>
                    </div>

                    <!-- Seat Info (if available) -->
                    ${booking.seat ? `
                        <div class="mb-6">
                            <div class="bg-gray-50 rounded-lg p-3">
                                <div class="flex items-center">
                                    <svg class="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 6V9a2 2 0 00-2-2H10a2 2 0 00-2 2v3.1M21 21l-6-6m6 6l-6 6"/>
                                    </svg>
                                    <span class="text-sm font-medium text-gray-700">Seat: ${booking.seat}</span>
                                    <span class="ml-4 text-sm text-gray-600">${booking.class || 'Economy'}</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Action Buttons -->
                    <div class="flex flex-wrap gap-3">
                        <button data-action="view" data-booking-id="${bookingId}" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                            View Ticket
                        </button>
                        
                        <button data-action="download" data-booking-id="${bookingId}" 
                                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m3 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Download
                        </button>
                        
                        ${booking.status !== 'cancelled' ? `
                            <button data-action="cancel" data-booking-id="${bookingId}" 
                                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                Cancel
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    getStatusColor(status) {
        switch(status?.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-green-100 text-green-800';
        }
    }

    attachCardEventListeners() {
        // Remove old event listeners by replacing the container content
        const container = document.getElementById('bookingsList');
        if (!container) return;

        // Use event delegation to handle all button clicks
        container.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            const action = button.getAttribute('data-action');
            const bookingId = button.getAttribute('data-booking-id');

            if (!bookingId) return;

            switch (action) {
                case 'view':
                    this.viewTicket(bookingId);
                    break;
                case 'download':
                    this.downloadTicket(bookingId);
                    break;
                case 'cancel':
                    this.cancelTicket(bookingId);
                    break;
            }
        });
    }

    createRefreshButton() {
        const bookingsContent = document.getElementById('bookingsContent');
        if (!bookingsContent || document.getElementById('refreshBookings')) return;
        
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'refreshBookings';
        refreshBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center mb-4';
        refreshBtn.innerHTML = `
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh Bookings
        `;
        refreshBtn.addEventListener('click', () => this.loadBookings());
        
        bookingsContent.insertBefore(refreshBtn, bookingsContent.firstChild);
    }

    createSearchInput() {
        const bookingsContent = document.getElementById('bookingsContent');
        if (!bookingsContent || document.getElementById('searchBookings')) return;
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'relative max-w-md mb-4';
        searchContainer.innerHTML = `
            <input type="text" 
                   id="searchBookings" 
                   placeholder="Search bookings..." 
                   class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
        `;
        
        const bookingsList = document.getElementById('bookingsList');
        let insertionPoint = null;
        
        if (bookingsList) {
            if (bookingsList.parentNode === bookingsContent) {
                insertionPoint = bookingsList;
            } else {
                for (let child of bookingsContent.children) {
                    if (child.contains(bookingsList)) {
                        insertionPoint = child;
                        break;
                    }
                }
            }
        }
        
        if (insertionPoint) {
            bookingsContent.insertBefore(searchContainer, insertionPoint);
        } else {
            bookingsContent.appendChild(searchContainer);
        }
        
        document.getElementById('searchBookings').addEventListener('input', (e) => {
            this.filterBookings(e.target.value);
        });
    }

    async viewTicket(bookingId) {
        try {
            const booking = this.bookings.find(b => (b._id || b.id) === bookingId);
            if (!booking) {
                this.showError('Booking not found');
                return;
            }

            this.showTicketModal(booking);
            
        } catch (error) {
            console.error('Error viewing ticket:', error);
            this.showError('Failed to view ticket');
        }
    }

    async downloadTicket(bookingId) {
        try {
            const booking = this.bookings.find(b => (b._id || b.id) === bookingId);
            if (!booking) {
                this.showError('Booking not found');
                return;
            }

            this.generateTicketPDF(booking);
            
        } catch (error) {
            console.error('Error downloading ticket:', error);
            this.showError('Failed to download ticket');
        }
    }

    async cancelTicket(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'cancelled' })
            });

            if (!response.ok) {
                throw new Error('Failed to cancel booking');
            }

            const bookingIndex = this.bookings.findIndex(b => (b._id || b.id) === bookingId);
            if (bookingIndex !== -1) {
                this.bookings[bookingIndex].status = 'cancelled';
                this.filteredBookings = [...this.bookings];
                this.renderBookings();
            }

            this.showSuccess('Booking cancelled successfully');
            
        } catch (error) {
            console.error('Error cancelling ticket:', error);
            this.showError('Failed to cancel booking');
        }
    }

    showTicketModal(booking) {
        const flight = booking.flightDetails || {};
        const departure = flight.departure || {};
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-900">Flight Ticket</h2>
                        <button data-action="close-modal" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
                        <div class="text-center mb-4">
                            <h3 class="text-xl font-bold text-blue-600">✈️ SkyLine Airlines</h3>
                            <p class="text-sm text-gray-600">Electronic Ticket</p>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="text-sm text-gray-600">Confirmation Number</p>
                                <p class="font-bold">${booking.confirmationNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Flight Number</p>
                                <p class="font-bold">${flight.flightNo || flight.flightNumber || `SL${Math.random().toString().substr(2, 4)}`}</p>
                            </div>
                        </div>
                        
                        <div class="flex justify-center items-center mb-6">
                            <div class="text-center">
                                <p class="text-2xl font-bold">${departure.airport || departure.code || 'N/A'}</p>
                                <p class="text-sm text-gray-600">${departure.city || departure.name || 'N/A'}</p>
                                <p class="text-sm text-gray-600">${flight.date ? new Date(flight.date).toLocaleDateString() : 'N/A'}</p>
                                <p class="text-sm text-gray-600">${departure.time || departure.departureTime || 'N/A'}</p>
                            </div>
                            <div class="mx-8">
                                <svg class="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                                </svg>
                                <p class="text-xs text-gray-500 mt-2 text-center">Departure Flight</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="text-sm text-gray-600">Passenger Email</p>
                                <p class="font-bold">${booking.passenger?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Seat</p>
                                <p class="font-bold">${booking.seat || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div class="text-center">
                            <div class="qr-placeholder bg-gray-800 w-24 h-24 mx-auto rounded"></div>
                            <p class="text-xs text-gray-500 mt-2">Boarding Pass QR Code</p>
                        </div>
                    </div>
                    
                    <div class="flex gap-3">
                        <button data-action="download-from-modal" data-booking-id="${booking._id || booking.id}" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex-1">
                            Download PDF
                        </button>
                        <button data-action="close-modal" 
                                class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            const action = button.getAttribute('data-action');
            
            if (action === 'close-modal') {
                modal.remove();
            } else if (action === 'download-from-modal') {
                const bookingId = button.getAttribute('data-booking-id');
                this.downloadTicket(bookingId);
            }
        });
        
        document.body.appendChild(modal);
    }

    generateTicketPDF(booking) {
        const flight = booking.flightDetails || {};
        const departure = flight.departure || {};
        
        const ticketContent = `
SKYLINE AIRLINES - ELECTRONIC TICKET
=====================================

Confirmation Number: ${booking.confirmationNumber || 'N/A'}
Flight Number: ${flight.flightNo || flight.flightNumber || `SL${Math.random().toString().substr(2, 4)}`}

PASSENGER INFORMATION:
Email: ${booking.passenger?.email || 'N/A'}

FLIGHT DETAILS:
Departure From: ${departure.airport || departure.code || 'N/A'} (${departure.city || departure.name || 'N/A'})
Date: ${flight.date ? new Date(flight.date).toLocaleDateString() : 'N/A'}
Departure Time: ${departure.time || departure.departureTime || 'N/A'}

BOOKING DETAILS:
Seat: ${booking.seat || 'N/A'}
Class: ${booking.class || 'Economy'}
Status: ${booking.status || 'Confirmed'}

Booked on: ${booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}

Thank you for choosing SkyLine Airlines!
        `;

        const blob = new Blob([ticketContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SkyLine-Ticket-${booking.confirmationNumber || 'ticket'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    showLoading() {
        const container = document.getElementById('bookingsList');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="loading-spinner mx-auto mb-4"></div>
                    <p class="text-gray-600">Loading your bookings...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading will be replaced by renderBookings()
    }

    showError(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

   showSuccess(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Initialize the booking manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookingManager = new BookingManager();
});

// Add CSS styles for loading spinner and animations
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .booking-card {
        transition: transform 0.2s ease-in-out;
    }

    .booking-card:hover {
        transform: translateY(-2px);
    }

    .status-badge {
        font-weight: 500;
        font-size: 0.875rem;
    }

    /* Smooth transitions for buttons */
    button {
        transition: all 0.2s ease-in-out;
    }

    button:hover {
        transform: translateY(-1px);
    }

    /* Modal animations */
    .fixed.inset-0 {
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    /* Alert animations */
    .fixed.top-4.right-4 {
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from { 
            transform: translateX(100%);
            opacity: 0;
        }
        to { 
            transform: translateX(0);
            opacity: 1;
        }
    }

    /* QR Code placeholder styling */
    .qr-placeholder {
        background: linear-gradient(45deg, #000 25%, transparent 25%), 
                    linear-gradient(-45deg, #000 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #000 75%), 
                    linear-gradient(-45deg, transparent 75%, #000 75%);
        background-size: 4px 4px;
        background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .booking-card {
            margin-bottom: 1rem;
        }
        
        .fixed.top-4.right-4 {
            right: 1rem;
            top: 1rem;
            left: 1rem;
            right: 1rem;
        }
    }
`;

document.head.appendChild(style);