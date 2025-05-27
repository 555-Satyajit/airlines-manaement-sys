        // In-memory storage for demo purposes
        let userSession = {
            token: null,
            user: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1 (555) 123-4567'
            }
        };

        let flights = [];
        let bookings = [];
        let selectedFlight = null;

        // Mock flight data
        const mockFlights = [
            {
                _id: '1',
                flightNumber: 'SL101',
                origin: 'JFK',
                destination: 'LAX',
                departureTime: '08:30',
                arrivalTime: '11:45',
                duration: '5h 15m',
                price: 299,
                class: 'Economy',
                availableSeats: 42,
                status: 'On-time',
                airline: 'SkyLine',
                aircraft: { model: 'Boeing 737' },
                stops: 0
            },
            {
                _id: '2',
                flightNumber: 'SL201',
                origin: 'JFK',
                destination: 'LAX',
                departureTime: '14:20',
                arrivalTime: '17:35',
                duration: '5h 15m',
                price: 349,
                class: 'Economy',
                availableSeats: 28,
                status: 'On-time',
                airline: 'SkyLine',
                aircraft: { model: 'Airbus A320' },
                stops: 0
            },
            {
                _id: '3',
                flightNumber: 'UA445',
                origin: 'JFK',
                destination: 'LAX',
                departureTime: '19:15',
                arrivalTime: '22:30',
                duration: '5h 15m',
                price: 279,
                class: 'Economy',
                availableSeats: 15,
                status: 'Delayed',
                airline: 'United',
                aircraft: { model: 'Boeing 777' },
                stops: 0
            }
        ];

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
            setupEventListeners();
            setupBookingCommunication();
        });

        function initializeApp() {
            // Set user greeting
            document.getElementById('userGreeting').textContent = `Welcome, ${userSession.user.firstName}!`;
            
            // Load profile data
            loadUserProfile();
            
            // Set minimum date to today
            setMinDate();
            
            // Load mock bookings
            loadUserBookings();
        }

        function setupEventListeners() {
            // Navigation
            document.getElementById('logoutBtn').addEventListener('click', logout);
            document.getElementById('backToDashboard').addEventListener('click', showDashboard);
            
            // Tabs
            document.getElementById('searchTab').addEventListener('click', () => showTab('search'));
            document.getElementById('bookingsTab').addEventListener('click', () => showTab('bookings'));
            document.getElementById('profileTab').addEventListener('click', () => showTab('profile'));
            
            // Forms
            document.getElementById('flightSearchForm').addEventListener('submit', handleFlightSearch);
            document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
            
            // Filters
            document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
            document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
            
            // Modals
            document.getElementById('closeModalBtn').addEventListener('click', closeModal);
            
            // Form data auto-save
            ['fromAirport', 'toAirport', 'departureDate', 'travelClass'].forEach(id => {
                document.getElementById(id).addEventListener('change', saveFormData);
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', handleKeyboardShortcuts);
        }

        // Booking Integration Functions
        function setupBookingCommunication() {
            // Listen for messages from the booking iframe
            window.addEventListener('message', function(event) {
                // In production, verify the origin
                // if (event.origin !== 'https://your-booking-domain.com') return;
                
                if (event.data.type === 'bookingComplete') {
                    handleBookingComplete(event.data);
                } else if (event.data.type === 'bookingCancel') {
                    showDashboard();
                }
            });
        }

        function bookFlight(flightId) {
            selectedFlight = flights.find(f => f._id === flightId);
            if (selectedFlight) {
                showBookingPage();
            }
        }

        function showBookingPage() {
            // Hide dashboard
            document.getElementById('dashboardContent').classList.add('hidden');
            document.getElementById('bookingContainer').classList.remove('hidden');
            document.getElementById('backToDashboard').classList.remove('hidden');
            
            // Prepare flight data for booking page
            const bookingData = {
                flight: selectedFlight,
                user: userSession.user,
                searchParams: {
                    departureDate: document.getElementById('departureDate').value
                }
            };
            
            // Method 1: Using URL parameters (if your booking.html can accept URL params)
            const params = new URLSearchParams({
                flightId: selectedFlight._id,
                flightNumber: selectedFlight.flightNumber,
                origin: selectedFlight.origin,
                destination: selectedFlight.destination,
                departureTime: selectedFlight.departureTime,
                arrivalTime: selectedFlight.arrivalTime,
                price: selectedFlight.price,
                class: selectedFlight.class,
                departureDate: document.getElementById('departureDate').value,
                userFirstName: userSession.user.firstName,
                userLastName: userSession.user.lastName,
                userEmail: userSession.user.email,
                userPhone: userSession.user.phone
            });
            
            // Load your booking.html with parameters
            document.getElementById('bookingFrame').src = `booking.html?${params.toString()}`;
            
            // Method 2: Post message to iframe once it loads (alternative approach)
            document.getElementById('bookingFrame').onload = function() {
                setTimeout(() => {
                    this.contentWindow.postMessage({
                        type: 'flightData',
                        data: bookingData
                    }, '*');
                }, 100);
            };
        }

        function showDashboard() {
            document.getElementById('dashboardContent').classList.remove('hidden');
            document.getElementById('bookingContainer').classList.add('hidden');
            document.getElementById('backToDashboard').classList.add('hidden');
            document.getElementById('bookingFrame').src = '';
        }

        function handleBookingComplete(data) {
            // Handle successful booking completion
            const newBooking = {
                _id: data.bookingId || Date.now().toString(),
                flightId: selectedFlight._id,
                flightNumber: selectedFlight.flightNumber,
                origin: selectedFlight.origin,
                destination: selectedFlight.destination,
                departureTime: selectedFlight.departureTime,
                arrivalTime: selectedFlight.arrivalTime,
                departureDate: document.getElementById('departureDate').value,
                passengerName: data.passengerName,
                passengerEmail: data.passengerEmail,
                passengerPhone: data.passengerPhone,
                price: selectedFlight.price,
                class: selectedFlight.class,
                bookingDate: new Date().toISOString(),
                status: 'Confirmed',
                bookingReference: data.bookingReference || 'SL' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                ticketData: data.ticketData // Include any additional ticket data
            };
            
            bookings.push(newBooking);
            
            // Update available seats
            selectedFlight.availableSeats--;
            
            // Show success message
            showNotification(`Flight booked successfully! Booking reference: ${newBooking.bookingReference}`, 'success');
            
            // Show dashboard and switch to bookings tab
            showDashboard();
            showTab('bookings');
            displayBookings();
        }

    async function logout() {
        try {
            // Simulate logout (replace with actual API call if needed)
            // Example: await fetch('/api/logout', { method: 'POST', credentials: 'include' });

            // Remove user session (simulate)
            localStorage.removeItem('user');
            showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1000);
        } catch (error) {
            console.error('Logout error:', error);
            showNotification('Logout failed. Please try again.', 'error');
        }
    }

    // Tab Management
    function showTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            document.querySelectorAll('.tab-button').forEach(button => {
                button.classList.remove('border-primary', 'text-primary');
                button.classList.add('border-transparent', 'text-neutral');
            });
            
            document.getElementById(tabName + 'Content').classList.remove('hidden');
            
            const activeTab = document.getElementById(tabName + 'Tab');
            activeTab.classList.remove('border-transparent', 'text-neutral');
            activeTab.classList.add('border-primary', 'text-primary');
            
            // Load bookings when bookings tab is shown
            if (tabName === 'bookings') {
                setTimeout(() => displayBookings(), 100);
            }
        }

        // Set minimum date to today
        function setMinDate() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('departureDate').min = today;
            document.getElementById('departureDate').value = today;
        }

        // Flight search
        function handleFlightSearch(e) {
            e.preventDefault();
            
            if (!validateSearchForm()) {
                return;
            }
            
            searchFlights();
        }

        function validateSearchForm() {
            const from = document.getElementById('fromAirport').value;
            const to = document.getElementById('toAirport').value;
            const date = document.getElementById('departureDate').value;

            if (!from || !to || !date) {
                showNotification('Please fill in all required fields', 'error');
                return false;
            }

            if (from === to) {
                showNotification('Origin and destination cannot be the same', 'error');
                return false;
            }

            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                showNotification('Departure date cannot be in the past', 'error');
                return false;
            }

            return true;
        }

        async function searchFlights() {
            try {
                showNotification('Searching for flights...', 'info');
                
                // Get search parameters
                const searchParams = {
                    origin: document.getElementById('fromAirport').value,
                    destination: document.getElementById('toAirport').value,
                    departureDate: document.getElementById('departureDate').value,
                    class: document.getElementById('travelClass').value
                };
                
                // Simulate API call - replace with actual backend call
                flights = mockFlights.filter(flight => {
                    const from = document.getElementById('fromAirport').value;
                    const to = document.getElementById('toAirport').value;
                    return flight.origin === from && flight.destination === to;
                });
                
                displayFlights(flights);
                document.getElementById('filtersSection').style.display = 'block';
                
                if (flights.length > 0) {
                    showNotification(`Found ${flights.length} flights`, 'success');
                } else {
                    showNotification('No flights found for your search criteria', 'warning');
                }
                
            } catch (error) {
                console.error('Error searching flights:', error);
                showNotification('Failed to search flights. Please try again.', 'error');
            }
        }

        function displayFlights(flightsToDisplay) {
            const resultsContainer = document.getElementById('flightResults');
            
            if (!flightsToDisplay || flightsToDisplay.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="bg-white rounded-lg shadow-md p-8 text-center">
                        <div class="text-6xl mb-4">✈️</div>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">No flights found</h3>
                        <p class="text-gray-500">Try adjusting your search criteria</p>
                    </div>
                `;
                return;
            }

            resultsContainer.innerHTML = flightsToDisplay.map(flight => `
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div class="flex justify-between items-center">
                        <div class="flex-1">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-4">
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-primary">${flight.departureTime}</div>
                                        <div class="text-sm text-neutral">${flight.origin}</div>
                                    </div>
                                    <div class="flex-1 text-center">
                                        <div class="text-sm text-neutral">Duration: ${flight.duration}</div>
                                        <div class="flex items-center justify-center my-2">
                                            <div class="h-px bg-gray-300 flex-1"></div>
                                            <div class="px-2">✈️</div>
                                            <div class="h-px bg-gray-300 flex-1"></div>
                                        </div>
                                        <div class="text-sm text-neutral">${flight.stops === 0 ? 'Direct' : flight.stops + ' stops'}</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-primary">${flight.arrivalTime}</div>
                                        <div class="text-sm text-neutral">${flight.destination}</div>
                                    </div>
                                </div>
                                <div class="ml-8 text-right">
                                    <div class="text-2xl font-bold text-success">$${flight.price}</div>
                                    <div class="text-sm text-neutral">${flight.class}</div>
                                    <div class="text-sm text-neutral">${flight.availableSeats} seats left</div>
                                </div>
                            </div>
                            <div class="mt-4 flex justify-between items-center">
                                <div class="flex items-center space-x-4">
                                    <span class="text-sm text-neutral">Flight ${flight.flightNumber}</span>
                                    <span class="text-sm text-neutral">Aircraft: ${flight.aircraft.model}</span>
                                    <span class="px-2 py-1 text-xs rounded-full ${getStatusColor(flight.status)}">${flight.status}</span>
                                </div>
                                <div class="space-x-2">
                                    <button class="view-details-btn text-secondary hover:text-primary text-sm underline" data-flight-id="${flight._id}">
                                        View Details
                                    </button>
                                    <button class="book-flight-btn bg-success hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm transition-colors" data-flight-id="${flight._id}">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            // Add event listeners to dynamically created buttons
            document.querySelectorAll('.view-details-btn').forEach(btn => {
                btn.addEventListener('click', (e) => viewFlightDetails(e.target.dataset.flightId));
            });
            
            document.querySelectorAll('.book-flight-btn').forEach(btn => {
                btn.addEventListener('click', (e) => bookFlight(e.target.dataset.flightId));
            });
        }

        function getStatusColor(status) {
            switch (status?.toLowerCase()) {
                case 'on-time': return 'bg-success text-white';
                case 'delayed': return 'bg-warning text-white';
                case 'cancelled': return 'bg-error text-white';
                default: return 'bg-neutral text-white';
            }
        }

        function viewFlightDetails(flightId) {
            const flight = flights.find(f => f._id === flightId);
            if (!flight) return;

            const modalContent = document.getElementById('flightModalContent');
            modalContent.innerHTML = `
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <h4 class="font-semibold text-gray-700">Flight Information</h4>
                            <p><strong>Flight Number:</strong> ${flight.flightNumber}</p>
                            <p><strong>Aircraft:</strong> ${flight.aircraft.model}</p>
                            <p><strong>Airline:</strong> ${flight.airline}</p>
                            <p><strong>Class:</strong> ${flight.class}</p>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-700">Schedule</h4>
                            <p><strong>Departure:</strong> ${flight.departureTime} from ${flight.origin}</p>
                            <p><strong>Arrival:</strong> ${flight.arrivalTime} at ${flight.destination}</p>
                            <p><strong>Duration:</strong> ${flight.duration}</p>
                            <p><strong>Status:</strong> <span class="px-2 py-1 text-xs rounded-full ${getStatusColor(flight.status)}">${flight.status}</span></p>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-700">Pricing & Availability</h4>
                        <p><strong>Price:</strong> <span class="text-2xl font-bold text-success">$${flight.price}</span></p>
                        <p><strong>Available Seats:</strong> ${flight.availableSeats}</p>
                        <p><strong>Stops:</strong> ${flight.stops === 0 ? 'Direct flight' : flight.stops + ' stops'}</p>
                    </div>
                    <div class="mt-6 flex justify-end space-x-2">
                        <button id="modalCloseBtn" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors">
                            Close
                        </button>
                        <button id="modalBookBtn" class="bg-success hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors" data-flight-id="${flight._id}">
                            Book This Flight
                        </button>
                    </div>
                </div>
            `;

            // Add event listeners for modal buttons
            document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
            document.getElementById('modalBookBtn').addEventListener('click', (e) => {
                closeModal();
                bookFlight(e.target.dataset.flightId);
            });

            document.getElementById('flightModal').classList.remove('hidden');
            document.getElementById('flightModal').classList.add('flex');
        }

        function closeModal() {
            document.getElementById('flightModal').classList.add('hidden');
            document.getElementById('flightModal').classList.remove('flex');
        }

        // Filters
        function applyFilters() {
            const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
            const maxPrice = parseInt(document.getElementById('maxPrice').value) || Infinity;
            const departureTimeFilter = document.getElementById('departureTimeFilter').value;
            const airlineFilter = document.getElementById('airlineFilter').value;

            let filteredFlights = flights.filter(flight => {
                // Price filter
                if (flight.price < minPrice || flight.price > maxPrice) return false;

                // Departure time filter
                if (departureTimeFilter) {
                    const hour = parseInt(flight.departureTime.split(':')[0]);
                    switch (departureTimeFilter) {
                        case 'morning':
                            if (hour < 6 || hour >= 12) return false;
                            break;
                        case 'afternoon':
                            if (hour < 12 || hour >= 18) return false;
                            break;
                        case 'evening':
                            if (hour < 18 || hour >= 24) return false;
                            break;
                    }
                }

                // Airline filter
                if (airlineFilter && flight.airline !== airlineFilter) return false;

                return true;
            });

            displayFlights(filteredFlights);
            showNotification(`Applied filters. Showing ${filteredFlights.length} flights`, 'info');
        }

        function clearFilters() {
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';
            document.getElementById('departureTimeFilter').value = '';
            document.getElementById('airlineFilter').value = '';
            
            displayFlights(flights);
            showNotification('Filters cleared', 'info');
        }

        // User Profile Management
        function loadUserProfile() {
            document.getElementById('firstName').value = userSession.user.firstName;
            document.getElementById('lastName').value = userSession.user.lastName;
            document.getElementById('email').value = userSession.user.email;
            document.getElementById('phone').value = userSession.user.phone;
        }

        function handleProfileUpdate(e) {
            e.preventDefault();
            
            userSession.user.firstName = document.getElementById('firstName').value;
            userSession.user.lastName = document.getElementById('lastName').value;
            userSession.user.email = document.getElementById('email').value;
            userSession.user.phone = document.getElementById('phone').value;
            
            document.getElementById('userGreeting').textContent = `Welcome, ${userSession.user.firstName}!`;
            showNotification('Profile updated successfully', 'success');
        }

        // Bookings Management
        function loadUserBookings() {
            // Mock bookings data
            bookings = [
                {
                    _id: 'booking1',
                    flightId: '1',
                    flightNumber: 'SL101',
                    origin: 'JFK',
                    destination: 'LAX',
                    departureTime: '08:30',
                    arrivalTime: '11:45',
                    departureDate: '2025-06-15',
                    passengerName: 'John Doe',
                    passengerEmail: 'john.doe@example.com',
                    passengerPhone: '+1 (555) 123-4567',
                    price: 299,
                    class: 'Economy',
                    bookingDate: '2025-05-20T10:30:00Z',
                    status: 'Confirmed',
                    bookingReference: 'SL7G4M9K2X'
                }
            ];
        }

        function displayBookings() {
            const bookingsList = document.getElementById('bookingsList');
            
            if (!bookings || bookings.length === 0) {
                bookingsList.innerHTML = `
                    <div class="text-center py-8">
                        <div class="text-6xl mb-4">📋</div>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">No bookings found</h3>
                        <p class="text-gray-500">Your flight bookings will appear here</p>
                    </div>
                `;
                return;
            }

            bookingsList.innerHTML = bookings.map(booking => `
                <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="flex items-center space-x-4 mb-4">
                                <div class="text-center">
                                    <div class="text-xl font-bold text-primary">${booking.departureTime}</div>
                                    <div class="text-sm text-neutral">${booking.origin}</div>
                                </div>
                                <div class="flex-1 text-center">
                                    <div class="flex items-center justify-center">
                                        <div class="h-px bg-gray-300 flex-1"></div>
                                        <div class="px-2">✈️</div>
                                        <div class="h-px bg-gray-300 flex-1"></div>
                                    </div>
                                    <div class="text-sm text-neutral mt-1">${booking.flightNumber}</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-xl font-bold text-primary">${booking.arrivalTime}</div>
                                    <div class="text-sm text-neutral">${booking.destination}</div>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span class="text-neutral">Date:</span>
                                    <div class="font-medium">${formatDate(booking.departureDate)}</div>
                                </div>
                                <div>
                                    <span class="text-neutral">Passenger:</span>
                                    <div class="font-medium">${booking.passengerName}</div>
                                </div>
                                <div>
                                    <span class="text-neutral">Class:</span>
                                    <div class="font-medium">${booking.class}</div>
                                </div>
                                <div>
                                    <span class="text-neutral">Price:</span>
                                    <div class="font-medium text-success">$${booking.price}</div>
                                </div>
                            </div>
                        </div>
                        <div class="ml-6 text-right">
                            <div class="mb-2">
                                <span class="px-3 py-1 text-sm rounded-full ${getBookingStatusColor(booking.status)}">${booking.status}</span>
                            </div>
                            <div class="text-sm text-neutral mb-2">
                                Ref: ${booking.bookingReference}
                            </div>
                            <div class="space-y-2">
                                <button class="block w-full bg-secondary hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors" onclick="viewBookingDetails('${booking._id}')">
                                    View Details
                                </button>
                                <button class="block w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors" onclick="downloadTicket('${booking._id}')">
                                    Download Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function getBookingStatusColor(status) {
            switch (status?.toLowerCase()) {
                case 'confirmed': return 'bg-success text-white';
                case 'pending': return 'bg-warning text-white';
                case 'cancelled': return 'bg-error text-white';
                case 'completed': return 'bg-primary text-white';
                default: return 'bg-neutral text-white';
            }
        }

        function viewBookingDetails(bookingId) {
            const booking = bookings.find(b => b._id === bookingId);
            if (!booking) return;

            const modalContent = document.getElementById('flightModalContent');
            modalContent.innerHTML = `
                <div class="space-y-6">
                    <div class="text-center border-b pb-4">
                        <h4 class="text-2xl font-bold text-primary">Booking Confirmation</h4>
                        <p class="text-lg text-neutral">Reference: ${booking.bookingReference}</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h5 class="font-semibold text-gray-700 mb-3">Flight Details</h5>
                            <div class="space-y-2 text-sm">
                                <p><strong>Flight:</strong> ${booking.flightNumber}</p>
                                <p><strong>Route:</strong> ${booking.origin} → ${booking.destination}</p>
                                <p><strong>Date:</strong> ${formatDate(booking.departureDate)}</p>
                                <p><strong>Departure:</strong> ${booking.departureTime}</p>
                                <p><strong>Arrival:</strong> ${booking.arrivalTime}</p>
                                <p><strong>Class:</strong> ${booking.class}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h5 class="font-semibold text-gray-700 mb-3">Passenger Information</h5>
                            <div class="space-y-2 text-sm">
                                <p><strong>Name:</strong> ${booking.passengerName}</p>
                                <p><strong>Email:</strong> ${booking.passengerEmail}</p>
                                <p><strong>Phone:</strong> ${booking.passengerPhone}</p>
                                <p><strong>Booking Date:</strong> ${formatDateTime(booking.bookingDate)}</p>
                                <p><strong>Status:</strong> <span class="px-2 py-1 text-xs rounded-full ${getBookingStatusColor(booking.status)}">${booking.status}</span></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-t pt-4">
                        <div class="flex justify-between items-center">
                            <span class="text-lg font-semibold">Total Amount Paid:</span>
                            <span class="text-2xl font-bold text-success">$${booking.price}</span>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="modalCloseBtn" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors">
                            Close
                        </button>
                        <button onclick="downloadTicket('${booking._id}')" class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                            Download Ticket
                        </button>
                    </div>
                </div>
            `;

            document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
            document.getElementById('flightModal').classList.remove('hidden');
            document.getElementById('flightModal').classList.add('flex');
        }

        function downloadTicket(bookingId) {
            const booking = bookings.find(b => b._id === bookingId);
            if (!booking) return;

            // Create a simple ticket PDF-like content
            const ticketContent = `
                SKYLINE AIRLINES - E-TICKET
                ===============================
                
                Booking Reference: ${booking.bookingReference}
                
                PASSENGER INFORMATION
                Name: ${booking.passengerName}
                Email: ${booking.passengerEmail}
                Phone: ${booking.passengerPhone}
                
                FLIGHT INFORMATION
                Flight: ${booking.flightNumber}
                From: ${booking.origin}
                To: ${booking.destination}
                Date: ${formatDate(booking.departureDate)}
                Departure: ${booking.departureTime}
                Arrival: ${booking.arrivalTime}
                Class: ${booking.class}
                
                BOOKING DETAILS
                Booking Date: ${formatDateTime(booking.bookingDate)}
                Status: ${booking.status}
                Total Paid: $${booking.price}
                
                Terms and Conditions:
                - Please arrive at the airport 2 hours before departure
                - Carry valid ID for domestic flights, passport for international
                - Check baggage allowance on our website
                
                Thank you for choosing SkyLine Airlines!
                ===============================
            `;

            // Create and download the ticket as a text file
            const blob = new Blob([ticketContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SkyLine_Ticket_${booking.bookingReference}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            showNotification('Ticket downloaded successfully', 'success');
        }

        // Utility Functions
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        function formatDateTime(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function saveFormData() {
            // Auto-save search form data (in a real app, this might use localStorage)
            const formData = {
                fromAirport: document.getElementById('fromAirport').value,
                toAirport: document.getElementById('toAirport').value,
                departureDate: document.getElementById('departureDate').value,
                travelClass: document.getElementById('travelClass').value
            };
            // In a real app: localStorage.setItem('flightSearchData', JSON.stringify(formData));
        }

        function handleKeyboardShortcuts(e) {
            // Escape key to close modal
            if (e.key === 'Escape') {
                closeModal();
            }
            
            // Ctrl+1,2,3 for tab switching
            if (e.ctrlKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        showTab('search');
                        break;
                    case '2':
                        e.preventDefault();
                        showTab('bookings');
                        break;
                    case '3':
                        e.preventDefault();
                        showTab('profile');
                        break;
                }
            }
        }

        // Notification System
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${getNotificationColor(type)}`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }

        function getNotificationColor(type) {
            switch (type) {
                case 'success': return 'bg-success';
                case 'error': return 'bg-error';
                case 'warning': return 'bg-warning';
                case 'info': return 'bg-secondary';
                default: return 'bg-neutral';
            }
        }

        // Click outside modal to close
        document.getElementById('flightModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });