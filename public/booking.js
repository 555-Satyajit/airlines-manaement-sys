// booking.js - Booking Management System (CSP Compliant)

class BookingManager {
    constructor() {
        this.bookings = [];
        this.currentEditingId = null;
        this.filteredBookings = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortField = 'id';
        this.sortDirection = 'asc';
        
        this.initializeEventListeners();
        this.loadSampleData();
        this.updateBookingStats();
        this.displayBookings();
    }

    initializeEventListeners() {
        // Modal controls
        document.getElementById('addBookingBtn').addEventListener('click', () => this.openBookingModal());
        document.getElementById('closeBookingModalBtn').addEventListener('click', () => this.closeBookingModal());
        document.getElementById('cancelBookingBtn').addEventListener('click', () => this.closeBookingModal());
        document.getElementById('closeBookingDetailsModalBtn').addEventListener('click', () => this.closeBookingDetailsModal());

        // Form submission
        document.getElementById('bookingForm').addEventListener('submit', (e) => this.handleBookingSubmit(e));

        // Search and filters
        document.getElementById('bookingSearch').addEventListener('input', () => this.filterBookings());
        document.getElementById('bookingStatusFilter').addEventListener('change', () => this.filterBookings());
        document.getElementById('bookingFlightFilter').addEventListener('change', () => this.filterBookings());
        document.getElementById('bookingDateFilter').addEventListener('change', () => this.filterBookings());
        document.getElementById('filterBookingsBtn').addEventListener('click', () => this.filterBookings());

        // Export functionality
        document.getElementById('exportBookingsBtn').addEventListener('click', () => this.exportBookings());

        // Pagination
        document.getElementById('bookingsPrevBtn').addEventListener('click', () => this.previousPage());
        document.getElementById('bookingsNextBtn').addEventListener('click', () => this.nextPage());

        // Dynamic price calculation
        document.getElementById('bookingFlight').addEventListener('change', () => this.updatePricing());
        document.getElementById('bookingClass').addEventListener('change', () => this.updatePricing());
        document.getElementById('passengerCount').addEventListener('input', () => this.updatePricing());
        document.getElementById('taxesAndFees').addEventListener('input', () => this.updatePricing());

        // Table sorting - delegate clicks to table headers
        this.initializeTableSorting();
    }

    initializeTableSorting() {
        // Add event listeners to sortable table headers
        const sortableHeaders = document.querySelectorAll('[data-sort]');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sortField = header.getAttribute('data-sort');
                this.sortBookings(sortField);
            });
        });
    }

    loadSampleData() {
        // Sample flight data for dropdowns
        const sampleFlights = [
            { id: 'SL-001', route: 'NYC → LAX', price: { economy: 299, business: 599, first: 999 } },
            { id: 'SL-002', route: 'LAX → CHI', price: { economy: 199, business: 399, first: 699 } },
            { id: 'SL-003', route: 'CHI → MIA', price: { economy: 249, business: 499, first: 799 } },
            { id: 'SL-004', route: 'NYC → SFO', price: { economy: 349, business: 649, first: 1099 } },
            { id: 'SL-005', route: 'LAX → SEA', price: { economy: 179, business: 359, first: 599 } }
        ];

        // Populate flight dropdowns
        const flightSelects = ['bookingFlight', 'bookingFlightFilter'];
        flightSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            sampleFlights.forEach(flight => {
                const option = document.createElement('option');
                option.value = flight.id;
                option.textContent = `${flight.id} - ${flight.route}`;
                option.dataset.prices = JSON.stringify(flight.price);
                select.appendChild(option);
            });
        });

        // Sample booking data
        this.bookings = [
            {
                id: 'BK-001',
                passenger: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@email.com',
                    phone: '+1-555-0123',
                    dob: '1985-06-15',
                    passport: 'A1234567'
                },
                flight: 'SL-001',
                route: 'NYC → LAX',
                date: '2024-03-15',
                class: 'economy',
                passengerCount: 1,
                seatPreference: 'window',
                price: 299,
                taxes: 50,
                total: 349,
                status: 'confirmed',
                paymentMethod: 'credit_card',
                specialRequests: 'Vegetarian meal',
                bookingDate: '2024-02-20',
                bookingTime: '14:30'
            },
            {
                id: 'BK-002',
                passenger: {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane.smith@email.com',
                    phone: '+1-555-0124',
                    dob: '1990-08-22',
                    passport: 'B2345678'
                },
                flight: 'SL-002',
                route: 'LAX → CHI',
                date: '2024-03-18',
                class: 'business',
                passengerCount: 2,
                seatPreference: 'aisle',
                price: 399,
                taxes: 75,
                total: 873,
                status: 'pending',
                paymentMethod: 'paypal',
                specialRequests: '',
                bookingDate: '2024-02-21',
                bookingTime: '09:15'
            },
            {
                id: 'BK-003',
                passenger: {
                    firstName: 'Bob',
                    lastName: 'Johnson',
                    email: 'bob.johnson@email.com',
                    phone: '+1-555-0125',
                    dob: '1978-12-03',
                    passport: 'C3456789'
                },
                flight: 'SL-003',
                route: 'CHI → MIA',
                date: '2024-03-20',
                class: 'first',
                passengerCount: 1,
                seatPreference: 'window',
                price: 799,
                taxes: 100,
                total: 899,
                status: 'confirmed',
                paymentMethod: 'credit_card',
                specialRequests: 'Extra legroom',
                bookingDate: '2024-02-19',
                bookingTime: '16:45'
            },
            {
                id: 'BK-004',
                passenger: {
                    firstName: 'Alice',
                    lastName: 'Wilson',
                    email: 'alice.wilson@email.com',
                    phone: '+1-555-0126',
                    dob: '1992-04-10',
                    passport: 'D4567890'
                },
                flight: 'SL-004',
                route: 'NYC → SFO',
                date: '2024-03-25',
                class: 'economy',
                passengerCount: 3,
                seatPreference: 'aisle',
                price: 349,
                taxes: 60,
                total: 1107,
                status: 'cancelled',
                paymentMethod: 'bank_transfer',
                specialRequests: 'Wheelchair assistance',
                bookingDate: '2024-02-22',
                bookingTime: '11:20'
            },
            {
                id: 'BK-005',
                passenger: {
                    firstName: 'Charlie',
                    lastName: 'Brown',
                    email: 'charlie.brown@email.com',
                    phone: '+1-555-0127',
                    dob: '1988-07-18',
                    passport: 'E5678901'
                },
                flight: 'SL-005',
                route: 'LAX → SEA',
                date: '2024-03-28',
                class: 'business',
                passengerCount: 1,
                seatPreference: 'window',
                price: 359,
                taxes: 45,
                total: 404,
                status: 'confirmed',
                paymentMethod: 'debit_card',
                specialRequests: '',
                bookingDate: '2024-02-23',
                bookingTime: '13:10'
            }
        ];

        this.filteredBookings = [...this.bookings];
    }

    openBookingModal(booking = null) {
        const modal = document.getElementById('bookingModal');
        const title = document.getElementById('bookingModalTitle');
        
        if (booking) {
            title.textContent = 'Edit Booking';
            this.currentEditingId = booking.id;
            this.populateBookingForm(booking);
        } else {
            title.textContent = 'New Booking';
            this.currentEditingId = null;
            this.resetBookingForm();
        }
        
        modal.classList.remove('hidden');
    }

    closeBookingModal() {
        document.getElementById('bookingModal').classList.add('hidden');
        this.resetBookingForm();
        this.currentEditingId = null;
    }

    closeBookingDetailsModal() {
        document.getElementById('bookingDetailsModal').classList.add('hidden');
    }

    populateBookingForm(booking) {
        document.getElementById('passengerFirstName').value = booking.passenger.firstName;
        document.getElementById('passengerLastName').value = booking.passenger.lastName;
        document.getElementById('passengerEmail').value = booking.passenger.email;
        document.getElementById('passengerPhone').value = booking.passenger.phone;
        document.getElementById('passengerDOB').value = booking.passenger.dob;
        document.getElementById('passengerPassport').value = booking.passenger.passport;
        
        document.getElementById('bookingFlight').value = booking.flight;
        document.getElementById('bookingClass').value = booking.class;
        document.getElementById('passengerCount').value = booking.passengerCount;
        document.getElementById('seatPreference').value = booking.seatPreference;
        document.getElementById('paymentMethod').value = booking.paymentMethod;
        document.getElementById('bookingStatus').value = booking.status;
        document.getElementById('specialRequests').value = booking.specialRequests;
        
        document.getElementById('basePrice').value = booking.price;
        document.getElementById('taxesAndFees').value = booking.taxes;
        document.getElementById('totalAmount').value = booking.total;
    }

    resetBookingForm() {
        document.getElementById('bookingForm').reset();
        document.getElementById('passengerCount').value = 1;
        document.getElementById('bookingStatus').value = 'pending';
        document.getElementById('paymentMethod').value = 'credit_card';
        document.getElementById('taxesAndFees').value = 50;
        document.getElementById('basePrice').value = '';
        document.getElementById('totalAmount').value = '';
    }

    updatePricing() {
        const flightSelect = document.getElementById('bookingFlight');
        const classSelect = document.getElementById('bookingClass');
        const passengerCountInput = document.getElementById('passengerCount');
        const taxesInput = document.getElementById('taxesAndFees');
        const basePriceInput = document.getElementById('basePrice');
        const totalAmountInput = document.getElementById('totalAmount');

        if (flightSelect.value && classSelect.value && passengerCountInput.value) {
            const selectedOption = flightSelect.options[flightSelect.selectedIndex];
            const prices = JSON.parse(selectedOption.dataset.prices || '{}');
            
            const basePrice = prices[classSelect.value] || 0;
            const passengerCount = parseInt(passengerCountInput.value) || 1;
            const taxes = parseFloat(taxesInput.value) || 0;
            
            const totalBasePrice = basePrice * passengerCount;
            const totalAmount = totalBasePrice + taxes;
            
            basePriceInput.value = basePrice;
            totalAmountInput.value = totalAmount;
        }
    }

    handleBookingSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const bookingData = {
            passenger: {
                firstName: formData.get('passengerFirstName'),
                lastName: formData.get('passengerLastName'),
                email: formData.get('passengerEmail'),
                phone: formData.get('passengerPhone'),
                dob: formData.get('passengerDOB'),
                passport: formData.get('passengerPassport')
            },
            flight: formData.get('bookingFlight'),
            route: this.getFlightRoute(formData.get('bookingFlight')),
            date: formData.get('bookingDate'),
            class: formData.get('bookingClass'),
            passengerCount: parseInt(formData.get('passengerCount')),
            seatPreference: formData.get('seatPreference'),
            price: parseFloat(formData.get('basePrice')),
            taxes: parseFloat(formData.get('taxesAndFees')),
            total: parseFloat(formData.get('totalAmount')),
            status: formData.get('bookingStatus'),
            paymentMethod: formData.get('paymentMethod'),
            specialRequests: formData.get('specialRequests') || '',
            bookingDate: this.currentEditingId ? 
                this.getBookingById(this.currentEditingId).bookingDate : 
                new Date().toISOString().split('T')[0],
            bookingTime: this.currentEditingId ? 
                this.getBookingById(this.currentEditingId).bookingTime : 
                new Date().toTimeString().split(' ')[0].substring(0, 5)
        };

        if (this.currentEditingId) {
            this.updateBooking(this.currentEditingId, bookingData);
        } else {
            this.addBooking(bookingData);
        }
    }

    getFlightRoute(flightId) {
        const flightSelect = document.getElementById('bookingFlight');
        const option = Array.from(flightSelect.options).find(opt => opt.value === flightId);
        return option ? option.textContent.split(' - ')[1] : '';
    }

    addBooking(bookingData) {
        const newId = 'BK-' + String(this.bookings.length + 1).padStart(3, '0');
        const newBooking = { id: newId, ...bookingData };
        
        this.bookings.push(newBooking);
        this.filterBookings();
        this.updateBookingStats();
        this.closeBookingModal();
        
        this.showNotification('Booking added successfully!', 'success');
    }

    updateBooking(id, bookingData) {
        const index = this.bookings.findIndex(b => b.id === id);
        if (index !== -1) {
            this.bookings[index] = { id, ...bookingData };
            this.filterBookings();
            this.updateBookingStats();
            this.closeBookingModal();
            
            this.showNotification('Booking updated successfully!', 'success');
        }
    }

    deleteBooking(id) {
        if (confirm('Are you sure you want to delete this booking?')) {
            this.bookings = this.bookings.filter(b => b.id !== id);
            this.filterBookings();
            this.updateBookingStats();
            
            this.showNotification('Booking deleted successfully!', 'success');
        }
    }

    filterBookings() {
        const searchTerm = document.getElementById('bookingSearch').value.toLowerCase();
        const statusFilter = document.getElementById('bookingStatusFilter').value;
        const flightFilter = document.getElementById('bookingFlightFilter').value;
        const dateFilter = document.getElementById('bookingDateFilter').value;

        this.filteredBookings = this.bookings.filter(booking => {
            const matchesSearch = searchTerm === '' || 
                booking.id.toLowerCase().includes(searchTerm) ||
                booking.passenger.firstName.toLowerCase().includes(searchTerm) ||
                booking.passenger.lastName.toLowerCase().includes(searchTerm) ||
                booking.passenger.email.toLowerCase().includes(searchTerm);
            
            const matchesStatus = statusFilter === '' || booking.status === statusFilter;
            const matchesFlight = flightFilter === '' || booking.flight === flightFilter;
            const matchesDate = dateFilter === '' || booking.date === dateFilter;
            
            return matchesSearch && matchesStatus && matchesFlight && matchesDate;
        });

        this.currentPage = 1;
        this.displayBookings();
    }

    sortBookings(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }

        this.filteredBookings.sort((a, b) => {
            let aVal, bVal;
            
            if (field.includes('.')) {
                const keys = field.split('.');
                aVal = keys.reduce((obj, key) => obj[key], a);
                bVal = keys.reduce((obj, key) => obj[key], b);
            } else {
                aVal = a[field];
                bVal = b[field];
            }

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (this.sortDirection === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });

        this.displayBookings();
    }

    editBooking(id) {
        const booking = this.getBookingById(id);
        if (booking) {
            this.openBookingModal(booking);
        }
    }

    displayBookings() {
        const tbody = document.getElementById('bookingsTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageBookings = this.filteredBookings.slice(startIndex, endIndex);

        tbody.innerHTML = pageBookings.map(booking => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.passenger.firstName} ${booking.passenger.lastName}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.passenger.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.flight}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.route}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">${booking.class}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${booking.total}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getStatusBadgeClass(booking.status)}">
                        ${booking.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button data-action="view" data-id="${booking.id}" 
                            class="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                    <button data-action="edit" data-id="${booking.id}" 
                            class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button data-action="delete" data-id="${booking.id}" 
                            class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');

        // Add event listeners to the action buttons
        this.attachRowEventListeners();
        this.updatePaginationInfo();
    }

    attachRowEventListeners() {
        const tbody = document.getElementById('bookingsTableBody');
        
        // Use event delegation to handle clicks on action buttons
        tbody.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const action = e.target.getAttribute('data-action');
                const id = e.target.getAttribute('data-id');
                
                switch (action) {
                    case 'view':
                        this.viewBookingDetails(id);
                        break;
                    case 'edit':
                        this.editBooking(id);
                        break;
                    case 'delete':
                        this.deleteBooking(id);
                        break;
                }
            }
        });
    }

    getStatusBadgeClass(status) {
        const classes = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getBookingById(id) {
        return this.bookings.find(b => b.id === id);
    }

    viewBookingDetails(id) {
        const booking = this.getBookingById(id);
        if (!booking) return;

        document.getElementById('detailBookingId').textContent = booking.id;
        document.getElementById('detailPassengerName').textContent = 
            `${booking.passenger.firstName} ${booking.passenger.lastName}`;
        document.getElementById('detailPassengerEmail').textContent = booking.passenger.email;
        document.getElementById('detailPassengerPhone').textContent = booking.passenger.phone;
        document.getElementById('detailPassengerDOB').textContent = booking.passenger.dob;
        document.getElementById('detailPassengerPassport').textContent = booking.passenger.passport;
        
        document.getElementById('detailFlight').textContent = `${booking.flight} - ${booking.route}`;
        document.getElementById('detailDate').textContent = booking.date;
        document.getElementById('detailClass').textContent = booking.class.charAt(0).toUpperCase() + booking.class.slice(1);
        document.getElementById('detailPassengerCount').textContent = booking.passengerCount;
        document.getElementById('detailSeatPreference').textContent = 
            booking.seatPreference.charAt(0).toUpperCase() + booking.seatPreference.slice(1);
        
        document.getElementById('detailBasePrice').textContent = `$${booking.price}`;
        document.getElementById('detailTaxes').textContent = `$${booking.taxes}`;
        document.getElementById('detailTotal').textContent = `$${booking.total}`;
        document.getElementById('detailStatus').textContent = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
        document.getElementById('detailPaymentMethod').textContent = 
            booking.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        document.getElementById('detailSpecialRequests').textContent = booking.specialRequests || 'None';
        document.getElementById('detailBookingDate').textContent = `${booking.bookingDate} at ${booking.bookingTime}`;

        document.getElementById('bookingDetailsModal').classList.remove('hidden');
    }

    updatePaginationInfo() {
        const totalPages = Math.ceil(this.filteredBookings.length / this.itemsPerPage);
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredBookings.length);
        
        document.getElementById('bookingsTotalCount').textContent = 
            `Showing ${startItem} to ${endItem} of ${this.filteredBookings.length} bookings`;
        
        document.getElementById('bookingsPrevBtn').disabled = this.currentPage === 1;
        document.getElementById('bookingsNextBtn').disabled = this.currentPage === totalPages;
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayBookings();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredBookings.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayBookings();
        }
    }

    updateBookingStats() {
        const totalBookings = this.bookings.length;
        const confirmedBookings = this.bookings.filter(b => b.status === 'confirmed').length;
        const pendingBookings = this.bookings.filter(b => b.status === 'pending').length;
        const cancelledBookings = this.bookings.filter(b => b.status === 'cancelled').length;
        const totalRevenue = this.bookings
            .filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + b.total, 0);

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value;
            } else {
                console.warn(`Element with ID '${id}' not found.`);
            }
        };

        setText('totalBookings', totalBookings);
        setText('confirmedBookings', confirmedBookings);
        setText('pendingBookings', pendingBookings);
        setText('cancelledBookings', cancelledBookings);
        setText('totalRevenue', `$${totalRevenue.toLocaleString()}`);
    }

    exportBookings() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        this.showNotification('Bookings exported successfully!', 'success');
    }

    generateCSV() {
        const headers = [
            'Booking ID', 'First Name', 'Last Name', 'Email', 'Phone', 'DOB', 'Passport',
            'Flight', 'Route', 'Date', 'Class', 'Passenger Count', 'Seat Preference',
            'Base Price', 'Taxes', 'Total', 'Status', 'Payment Method', 'Special Requests',
            'Booking Date', 'Booking Time'
        ];

        const rows = this.filteredBookings.map(booking => [
            booking.id,
            booking.passenger.firstName,
            booking.passenger.lastName,
            booking.passenger.email,
            booking.passenger.phone,
            booking.passenger.dob,
            booking.passenger.passport,
            booking.flight,
            booking.route,
            booking.date,
            booking.class,
            booking.passengerCount,
            booking.seatPreference,
            booking.price,
            booking.taxes,
            booking.total,
            booking.status,
            booking.paymentMethod,
            booking.specialRequests,
            booking.bookingDate,
            booking.bookingTime
        ]);

        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the booking manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookingManager = new BookingManager();
});