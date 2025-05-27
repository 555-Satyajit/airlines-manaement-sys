// Global variables
let currentEditingFlight = null;
let flights = [];
let aircraft = [];
let routes = [];

// Navigation
function showSection(sectionName, targetElement = null) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const sectionElement = document.getElementById(`${sectionName}-section`);
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
    }
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-light-blue', 'text-primary-blue');
    });
    
    if (targetElement) {
        targetElement.classList.add('bg-light-blue', 'text-primary-blue');
    }
    
    // Load section-specific data
    switch(sectionName) {
        case 'flights':
            loadFlights();
            break;
        case 'aircraft':
            loadAircraft();
            break;
        case 'routes':
            loadRoutes();
            break;
    }
}

// Toast notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');
    
    let iconClass = '';
    let iconColor = '';
    
    switch(type) {
        case 'success':
            iconClass = 'fas fa-check-circle';
            iconColor = 'text-success-green';
            break;
        case 'error':
            iconClass = 'fas fa-exclamation-circle';
            iconColor = 'text-error-red';
            break;
        case 'warning':
            iconClass = 'fas fa-exclamation-triangle';
            iconColor = 'text-warning-orange';
            break;
    }
    
    toastIcon.innerHTML = `<i class="${iconClass} ${iconColor}"></i>`;
    toastMessage.textContent = message;
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        hideToast();
    }, 5000);
}

function hideToast() {
    document.getElementById('toast').classList.add('hidden');
}

// Flight Management
function loadFlights() {
    // Mock data - replace with actual API call
    flights = [
        {
            id: 1,
            flightNumber: 'SL-001',
            origin: 'NYC',
            destination: 'LAX',
            aircraft: 'Boeing 737-800',
            departureTime: '2024-01-15 10:00',
            arrivalTime: '2024-01-15 13:30',
            status: 'scheduled',
            economyPrice: 299,
            businessPrice: 599,
            firstClassPrice: 1299
        },
        {
            id: 2,
            flightNumber: 'SL-002',
            origin: 'LAX',
            destination: 'CHI',
            aircraft: 'Airbus A320',
            departureTime: '2024-01-15 14:00',
            arrivalTime: '2024-01-15 19:45',
            status: 'boarding',
            economyPrice: 199,
            businessPrice: 399,
            firstClassPrice: 899
        }
    ];
    
    renderFlightsTable();
    loadAircraftOptions();
}

function renderFlightsTable() {
    const tbody = document.getElementById('flightsTableBody');
    tbody.innerHTML = '';
    
    flights.forEach(flight => {
        const statusColor = getStatusColor(flight.status);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${flight.flightNumber}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${flight.origin} → ${flight.destination}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${flight.aircraft}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                    <div>Dep: ${new Date(flight.departureTime).toLocaleString()}</div>
                    <div>Arr: ${new Date(flight.arrivalTime).toLocaleString()}</div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                    ${flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="edit-flight-btn text-indigo-600 hover:text-indigo-900 mr-3" data-flight-id="${flight.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-flight-btn text-red-600 hover:text-red-900" data-flight-id="${flight.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-flight-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const flightId = parseInt(this.getAttribute('data-flight-id'));
            editFlight(flightId);
        });
    });

    document.querySelectorAll('.delete-flight-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const flightId = parseInt(this.getAttribute('data-flight-id'));
            deleteFlight(flightId);
        });
    });
}

function getStatusColor(status) {
    switch(status) {
        case 'scheduled':
            return 'bg-blue-100 text-blue-800';
        case 'boarding':
            return 'bg-yellow-100 text-yellow-800';
        case 'departed':
            return 'bg-green-100 text-green-800';
        case 'arrived':
            return 'bg-gray-100 text-gray-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function loadAircraftOptions() {
    const aircraftSelect = document.getElementById('aircraftSelect');
    aircraftSelect.innerHTML = '<option value="">Select Aircraft</option>';
    
    // Mock aircraft data
    const aircraftList = [
        'Boeing 737-800',
        'Airbus A320',
        'Boeing 777-300',
        'Airbus A330'
    ];
    
    aircraftList.forEach(aircraft => {
        const option = document.createElement('option');
        option.value = aircraft;
        option.textContent = aircraft;
        aircraftSelect.appendChild(option);
    });
}

function editFlight(flightId) {
    const flight = flights.find(f => f.id === flightId);
    if (!flight) return;
    
    currentEditingFlight = flight;
    
    // Populate form with flight data
    document.getElementById('flightNumber').value = flight.flightNumber;
    document.getElementById('aircraftSelect').value = flight.aircraft;
    document.getElementById('originAirport').value = flight.origin;
    document.getElementById('destinationAirport').value = flight.destination;
    
    const depDate = new Date(flight.departureTime);
    const arrDate = new Date(flight.arrivalTime);
    
    document.getElementById('departureDate').value = depDate.toISOString().split('T')[0];
    document.getElementById('departureTime').value = depDate.toTimeString().substring(0, 5);
    document.getElementById('arrivalDate').value = arrDate.toISOString().split('T')[0];
    document.getElementById('arrivalTime').value = arrDate.toTimeString().substring(0, 5);
    
    document.getElementById('economyPrice').value = flight.economyPrice;
    document.getElementById('businessPrice').value = flight.businessPrice;
    document.getElementById('firstClassPrice').value = flight.firstClassPrice;
    
    document.getElementById('flightModalTitle').textContent = 'Edit Flight';
    document.getElementById('flightModal').classList.remove('hidden');
}

function deleteFlight(flightId) {
    if (confirm('Are you sure you want to delete this flight?')) {
        flights = flights.filter(f => f.id !== flightId);
        renderFlightsTable();
        showToast('Flight deleted successfully', 'success');
    }
}

function addNewFlight() {
    currentEditingFlight = null;
    document.getElementById('flightForm').reset();
    document.getElementById('flightModalTitle').textContent = 'Add New Flight';
    document.getElementById('flightModal').classList.remove('hidden');
}

// Aircraft Management
function loadAircraft() {
    // Mock data - replace with actual API call
    aircraft = [
        {
            id: 1,
            model: 'Boeing 737-800',
            registration: 'N737SL',
            capacity: 189,
            status: 'active',
            lastMaintenance: '2024-01-10'
        },
        {
            id: 2,
            model: 'Airbus A320',
            registration: 'N320SL',
            capacity: 150,
            status: 'maintenance',
            lastMaintenance: '2024-01-05'
        },
        {
            id: 3,
            model: 'Boeing 777-300',
            registration: 'N777SL',
            capacity: 396,
            status: 'active',
            lastMaintenance: '2024-01-08'
        }
    ];
    
    renderAircraftGrid();
}

function renderAircraftGrid() {
    const grid = document.getElementById('aircraftGrid');
    grid.innerHTML = '';
    
    aircraft.forEach(plane => {
        const statusColor = plane.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-6';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">${plane.model}</h3>
                    <p class="text-sm text-neutral-gray">${plane.registration}</p>
                </div>
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
                    ${plane.status.charAt(0).toUpperCase() + plane.status.slice(1)}
                </span>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="text-sm text-neutral-gray">Capacity:</span>
                    <span class="text-sm font-medium">${plane.capacity} seats</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-sm text-neutral-gray">Last Maintenance:</span>
                    <span class="text-sm font-medium">${new Date(plane.lastMaintenance).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="mt-4 flex space-x-2">
                <button class="edit-aircraft-btn flex-1 bg-secondary-blue text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors" data-aircraft-id="${plane.id}">
                    <i class="fas fa-edit mr-1"></i>Edit
                </button>
                <button class="delete-aircraft-btn flex-1 bg-error-red text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors" data-aircraft-id="${plane.id}">
                    <i class="fas fa-trash mr-1"></i>Delete
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Add event listeners for aircraft buttons
    document.querySelectorAll('.edit-aircraft-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const aircraftId = parseInt(this.getAttribute('data-aircraft-id'));
            editAircraft(aircraftId);
        });
    });

    document.querySelectorAll('.delete-aircraft-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const aircraftId = parseInt(this.getAttribute('data-aircraft-id'));
            deleteAircraft(aircraftId);
        });
    });
}

function editAircraft(aircraftId) {
    showToast('Aircraft editing functionality would be implemented here', 'warning');
}

function deleteAircraft(aircraftId) {
    if (confirm('Are you sure you want to delete this aircraft?')) {
        aircraft = aircraft.filter(a => a.id !== aircraftId);
        renderAircraftGrid();
        showToast('Aircraft deleted successfully', 'success');
    }
}

// Routes Management
function loadRoutes() {
    // Mock data - replace with actual API call
    routes = [
        {
            id: 1,
            routeId: 'RT-001',
            origin: 'NYC',
            destination: 'LAX',
            distance: '2445 mi',
            duration: '5h 30m',
            basePrice: 299
        },
        {
            id: 2,
            routeId: 'RT-002',
            origin: 'LAX',
            destination: 'CHI',
            distance: '1745 mi',
            duration: '4h 15m',
            basePrice: 199
        },
        {
            id: 3,
            routeId: 'RT-003',
            origin: 'NYC',
            destination: 'CHI',
            distance: '733 mi',
            duration: '2h 20m',
            basePrice: 149
        }
    ];
    
    renderRoutesTable();
}

function renderRoutesTable() {
    const tbody = document.getElementById('routesTableBody');
    tbody.innerHTML = '';
    
    routes.forEach(route => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${route.routeId}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${route.origin} → ${route.destination}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${route.distance}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${route.duration}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">$${route.basePrice}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="edit-route-btn text-indigo-600 hover:text-indigo-900 mr-3" data-route-id="${route.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-route-btn text-red-600 hover:text-red-900" data-route-id="${route.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Add event listeners for route buttons
    document.querySelectorAll('.edit-route-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const routeId = parseInt(this.getAttribute('data-route-id'));
            editRoute(routeId);
        });
    });

    document.querySelectorAll('.delete-route-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const routeId = parseInt(this.getAttribute('data-route-id'));
            deleteRoute(routeId);
        });
    });
}

function editRoute(routeId) {
    showToast('Route editing functionality would be implemented here', 'warning');
}

function deleteRoute(routeId) {
    if (confirm('Are you sure you want to delete this route?')) {
        routes = routes.filter(r => r.id !== routeId);
        renderRoutesTable();
        showToast('Route deleted successfully', 'success');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Navigation event listeners
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section, this);
        });
    });

    // Modal event listeners
    const addFlightBtn = document.getElementById('addFlightBtn');
    if (addFlightBtn) {
        addFlightBtn.addEventListener('click', addNewFlight);
    }

    const closeFlightModalBtn = document.getElementById('closeFlightModalBtn');
    if (closeFlightModalBtn) {
        closeFlightModalBtn.addEventListener('click', function() {
            document.getElementById('flightModal').classList.add('hidden');
        });
    }

    const cancelFlightBtn = document.getElementById('cancelFlightBtn');
    if (cancelFlightBtn) {
        cancelFlightBtn.addEventListener('click', function() {
            document.getElementById('flightModal').classList.add('hidden');
        });
    }

    // Flight form submission
    const flightForm = document.getElementById('flightForm');
    if (flightForm) {
        flightForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                flightNumber: document.getElementById('flightNumber').value,
                aircraft: document.getElementById('aircraftSelect').value,
                origin: document.getElementById('originAirport').value,
                destination: document.getElementById('destinationAirport').value,
                departureTime: document.getElementById('departureDate').value + ' ' + document.getElementById('departureTime').value,
                arrivalTime: document.getElementById('arrivalDate').value + ' ' + document.getElementById('arrivalTime').value,
                economyPrice: parseInt(document.getElementById('economyPrice').value),
                businessPrice: parseInt(document.getElementById('businessPrice').value),
                firstClassPrice: parseInt(document.getElementById('firstClassPrice').value),
                status: 'scheduled'
            };

            if (currentEditingFlight) {
                // Update existing flight
                const index = flights.findIndex(f => f.id === currentEditingFlight.id);
                flights[index] = { ...flights[index], ...formData };
                showToast('Flight updated successfully', 'success');
            } else {
                // Add new flight
                const newFlight = {
                    id: Date.now(), // Simple ID generation
                    ...formData
                };
                flights.push(newFlight);
                showToast('Flight added successfully', 'success');
            }

            document.getElementById('flightModal').classList.add('hidden');
            renderFlightsTable();
        });
    }

    // Filter flights
    const filterFlightsBtn = document.getElementById('filterFlightsBtn');
    if (filterFlightsBtn) {
        filterFlightsBtn.addEventListener('click', function() {
            // Filter logic would be implemented here
            showToast('Flight filtering applied', 'success');
        });
    }

    // Add aircraft button
    const addAircraftBtn = document.getElementById('addAircraftBtn');
    if (addAircraftBtn) {
        addAircraftBtn.addEventListener('click', function() {
            showToast('Add aircraft functionality would be implemented here', 'warning');
        });
    }

    // Add route button
    const addRouteBtn = document.getElementById('addRouteBtn');
    if (addRouteBtn) {
        addRouteBtn.addEventListener('click', function() {
            showToast('Add route functionality would be implemented here', 'warning');
        });
    }

    // Toast close button
    const closeToastBtn = document.getElementById('closeToastBtn');
    if (closeToastBtn) {
        closeToastBtn.addEventListener('click', hideToast);
    }

    // Notification button
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showToast('Notification panel would open here', 'warning');
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                // Clear any stored session data
                // Note: Avoiding localStorage/sessionStorage due to CSP restrictions
                
                // Show logout message
                showToast('Logging out...', 'success');
                
                // Redirect to login page after short delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        });
    }

    // Close modal when clicking outside
    const flightModal = document.getElementById('flightModal');
    if (flightModal) {
        flightModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.add('hidden');
            }
        });
    }

    // Initialize dashboard
    showSection('dashboard', document.querySelector('[data-section="dashboard"]'));
});