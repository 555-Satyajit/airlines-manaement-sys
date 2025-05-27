// Airport Management System - CSP Compliant Version
class AirportManager {
    constructor() {
        this.airports = [
            {
                id: 1,
                code: 'NYC',
                name: 'John F. Kennedy International Airport',
                city: 'New York',
                country: 'United States',
                type: 'international',
                terminals: 8,
                gates: 128,
                runways: 4,
                longestRunway: 4423,
                elevation: 4,
                latitude: 40.6413,
                longitude: -73.7781,
                timezone: 'UTC-5',
                annualPassengers: 62.5,
                status: 'active',
                facilities: {
                    wifi: true,
                    lounge: true,
                    carRental: true,
                    hotel: true,
                    parking: true,
                    dutyFree: true,
                    restaurants: true,
                    atm: true
                },
                notes: 'Major international hub serving New York metropolitan area'
            },
            {
                id: 2,
                code: 'LAX',
                name: 'Los Angeles International Airport',
                city: 'Los Angeles',
                country: 'United States',
                type: 'international',
                terminals: 9,
                gates: 146,
                runways: 4,
                longestRunway: 3685,
                elevation: 38,
                latitude: 33.9425,
                longitude: -118.4081,
                timezone: 'UTC-8',
                annualPassengers: 88.0,
                status: 'active',
                facilities: {
                    wifi: true,
                    lounge: true,
                    carRental: true,
                    hotel: true,
                    parking: true,
                    dutyFree: true,
                    restaurants: true,
                    atm: true
                },
                notes: 'Second busiest airport in the United States'
            },
            {
                id: 3,
                code: 'CHI',
                name: "O'Hare International Airport",
                city: 'Chicago',
                country: 'United States',
                type: 'international',
                terminals: 4,
                gates: 191,
                runways: 8,
                longestRunway: 3962,
                elevation: 203,
                latitude: 41.9786,
                longitude: -87.9048,
                timezone: 'UTC-6',
                annualPassengers: 83.3,
                status: 'active',
                facilities: {
                    wifi: true,
                    lounge: true,
                    carRental: true,
                    hotel: true,
                    parking: true,
                    dutyFree: true,
                    restaurants: true,
                    atm: true
                },
                notes: 'Major hub for American Airlines and United Airlines'
            },
            {
                id: 4,
                code: 'MIA',
                name: 'Miami International Airport',
                city: 'Miami',
                country: 'United States',
                type: 'international',
                terminals: 3,
                gates: 131,
                runways: 4,
                longestRunway: 3962,
                elevation: 3,
                latitude: 25.7617,
                longitude: -80.1918,
                timezone: 'UTC-5',
                annualPassengers: 45.9,
                status: 'active',
                facilities: {
                    wifi: true,
                    lounge: true,
                    carRental: true,
                    hotel: false,
                    parking: true,
                    dutyFree: true,
                    restaurants: true,
                    atm: true
                },
                notes: 'Primary gateway between the United States and Latin America'
            },
            {
                id: 5,
                code: 'DFW',
                name: 'Dallas/Fort Worth International Airport',
                city: 'Dallas',
                country: 'United States',
                type: 'international',
                terminals: 5,
                gates: 165,
                runways: 7,
                longestRunway: 4085,
                elevation: 183,
                latitude: 32.8968,
                longitude: -97.0380,
                timezone: 'UTC-6',
                annualPassengers: 75.0,
                status: 'active',
                facilities: {
                    wifi: true,
                    lounge: true,
                    carRental: true,
                    hotel: true,
                    parking: true,
                    dutyFree: true,
                    restaurants: true,
                    atm: true
                },
                notes: 'American Airlines primary hub'
            }
        ];
        
        this.filteredAirports = [...this.airports];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.editingAirport = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStats();
        this.populateFilters();
        this.renderAirports();
    }

    bindEvents() {
        // Modal events
        document.getElementById('addAirportBtn').addEventListener('click', () => this.openModal());
        document.getElementById('closeAirportModalBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelAirportBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('closeAirportDetailsModalBtn').addEventListener('click', () => this.closeDetailsModal());
        
        // Form events
        document.getElementById('airportForm').addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Search and filter events
        document.getElementById('airportSearch').addEventListener('input', () => this.filterAirports());
        document.getElementById('countryFilter').addEventListener('change', () => this.filterAirports());
        document.getElementById('airportTypeFilter').addEventListener('change', () => this.filterAirports());
        document.getElementById('filterAirportsBtn').addEventListener('click', () => this.filterAirports());
        
        // Export event
        document.getElementById('exportAirportsBtn').addEventListener('click', () => this.exportAirports());
        
        // Pagination events
        document.getElementById('airportsPrevBtn').addEventListener('click', () => this.previousPage());
        document.getElementById('airportsNextBtn').addEventListener('click', () => this.nextPage());
        
        // Sort events
        document.querySelectorAll('[data-sort]').forEach(header => {
            header.addEventListener('click', () => this.sortAirports(header.dataset.sort));
        });
        
        // Airport code formatting
        document.getElementById('airportCode').addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    openModal(airport = null) {
        this.editingAirport = airport;
        const modal = document.getElementById('airportModal');
        const title = document.getElementById('airportModalTitle');
        
        if (airport) {
            title.textContent = 'Edit Airport';
            this.populateForm(airport);
        } else {
            title.textContent = 'Add New Airport';
            this.resetForm();
        }
        
        modal.classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('airportModal').classList.add('hidden');
        this.resetForm();
        this.editingAirport = null;
    }

    closeDetailsModal() {
        document.getElementById('airportDetailsModal').classList.add('hidden');
    }

    resetForm() {
        document.getElementById('airportForm').reset();
        // Reset checkboxes
        const checkboxes = document.querySelectorAll('#airportModal input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
    }

    populateForm(airport) {
        document.getElementById('airportCode').value = airport.code;
        document.getElementById('airportName').value = airport.name;
        document.getElementById('airportCity').value = airport.city;
        document.getElementById('airportCountry').value = airport.country;
        document.getElementById('airportType').value = airport.type;
        document.getElementById('airportTerminals').value = airport.terminals;
        document.getElementById('airportGates').value = airport.gates;
        document.getElementById('airportRunways').value = airport.runways;
        document.getElementById('longestRunway').value = airport.longestRunway;
        document.getElementById('airportElevation').value = airport.elevation;
        document.getElementById('airportLatitude').value = airport.latitude;
        document.getElementById('airportLongitude').value = airport.longitude;
        document.getElementById('airportTimezone').value = airport.timezone;
        document.getElementById('annualPassengers').value = airport.annualPassengers;
        document.getElementById('airportStatus').value = airport.status;
        document.getElementById('airportNotes').value = airport.notes || '';
        
      // Set facilities checkboxes
if (airport.facilities) {
    const wifiEl = document.getElementById('facilityWifi');
    if (wifiEl) wifiEl.checked = airport.facilities.wifi || false;
    
    const loungeEl = document.getElementById('facilityLounge');
    if (loungeEl) loungeEl.checked = airport.facilities.lounge || false;
    
    const carRentalEl = document.getElementById('facilityCarRental');
    if (carRentalEl) carRentalEl.checked = airport.facilities.carRental || false;
    
    const hotelEl = document.getElementById('facilityHotel');
    if (hotelEl) hotelEl.checked = airport.facilities.hotel || false;
    
    const parkingEl = document.getElementById('facilityParking');
    if (parkingEl) parkingEl.checked = airport.facilities.parking || false;
    
    const dutyFreeEl = document.getElementById('facilityDutyFree');
    if (dutyFreeEl) dutyFreeEl.checked = airport.facilities.dutyFree || false;
    
    const restaurantsEl = document.getElementById('facilityRestaurants');
    if (restaurantsEl) restaurantsEl.checked = airport.facilities.restaurants || false;
    
    const atmEl = document.getElementById('facilityATM');
    if (atmEl) atmEl.checked = airport.facilities.atm || false;
}
    }

    handleSubmit(e) {
        e.preventDefault();
        
        // Get form data directly from form elements instead of FormData
        const form = e.target;
        const airportData = {
            code: form.elements['code'].value.toUpperCase(),
            name: form.elements['name'].value,
            city: form.elements['city'].value,
            country: form.elements['country'].value,
            type: form.elements['type'].value,
            terminals: parseInt(form.elements['terminals'].value),
            gates: parseInt(form.elements['gates'].value),
            runways: parseInt(form.elements['runways'].value),
            longestRunway: parseInt(form.elements['longestRunway'].value),
            elevation: parseInt(form.elements['elevation'].value),
            latitude: parseFloat(form.elements['latitude'].value),
            longitude: parseFloat(form.elements['longitude'].value),
            timezone: form.elements['timezone'].value,
            annualPassengers: parseFloat(form.elements['annualPassengers'].value),
            status: form.elements['status'].value,
            notes: form.elements['notes'].value,
           facilities: {
    wifi: document.getElementById('facilityWifi')?.checked || false,
    lounge: document.getElementById('facilityLounge')?.checked || false,
    carRental: document.getElementById('facilityCarRental')?.checked || false,
    hotel: document.getElementById('facilityHotel')?.checked || false,
    parking: document.getElementById('facilityParking')?.checked || false,
    dutyFree: document.getElementById('facilityDutyFree')?.checked || false,
    restaurants: document.getElementById('facilityRestaurants')?.checked || false,
    atm: document.getElementById('facilityATM')?.checked || false
}
        };

        if (this.editingAirport) {
            // Update existing airport
            const index = this.airports.findIndex(a => a.id === this.editingAirport.id);
            if (index !== -1) {
                this.airports[index] = { ...this.airports[index], ...airportData };
                this.showNotification('Airport updated successfully!', 'success');
            }
        } else {
            // Add new airport
            const newAirport = {
                id: Math.max(...this.airports.map(a => a.id)) + 1,
                ...airportData
            };
            this.airports.push(newAirport);
            this.showNotification('Airport added successfully!', 'success');
        }

        this.closeModal();
        this.filterAirports();
        this.updateStats();
        this.populateFilters();
    }

    deleteAirport(airportId) {
        if (confirm('Are you sure you want to delete this airport?')) {
            this.airports = this.airports.filter(a => a.id !== airportId);
            this.filterAirports();
            this.updateStats();
            this.populateFilters();
            this.showNotification('Airport deleted successfully!', 'success');
        }
    }

    viewAirportDetails(airportId) {
        const airport = this.airports.find(a => a.id === airportId);
        if (!airport) return;

        const modal = document.getElementById('airportDetailsModal');
        const content = document.getElementById('airportDetailsContent');
        
        const facilitiesHtml = Object.entries(airport.facilities)
            .map(([key, value]) => `
                <span class="facility-tag ${value ? 'available' : 'unavailable'}">
                    ${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ${value ? 'Yes' : 'No'}
                </span>
            `).join('');

        content.innerHTML = `
            <div class="airport-details">
                <div class="detail-section">
                    <h3>Basic Information</h3>
                    <div class="detail-grid">
                        <div><strong>Code:</strong> ${airport.code}</div>
                        <div><strong>Name:</strong> ${airport.name}</div>
                        <div><strong>City:</strong> ${airport.city}</div>
                        <div><strong>Country:</strong> ${airport.country}</div>
                        <div><strong>Type:</strong> ${airport.type}</div>
                        <div><strong>Status:</strong> <span class="status ${airport.status}">${airport.status}</span></div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Infrastructure</h3>
                    <div class="detail-grid">
                        <div><strong>Terminals:</strong> ${airport.terminals}</div>
                        <div><strong>Gates:</strong> ${airport.gates}</div>
                        <div><strong>Runways:</strong> ${airport.runways}</div>
                        <div><strong>Longest Runway:</strong> ${airport.longestRunway}m</div>
                        <div><strong>Elevation:</strong> ${airport.elevation}m</div>
                        <div><strong>Annual Passengers:</strong> ${airport.annualPassengers}M</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Location</h3>
                    <div class="detail-grid">
                        <div><strong>Latitude:</strong> ${airport.latitude}°</div>
                        <div><strong>Longitude:</strong> ${airport.longitude}°</div>
                        <div><strong>Timezone:</strong> ${airport.timezone}</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Facilities</h3>
                    <div class="facilities-grid">
                        ${facilitiesHtml}
                    </div>
                </div>
                
                ${airport.notes ? `
                    <div class="detail-section">
                        <h3>Notes</h3>
                        <p>${airport.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        modal.classList.remove('hidden');
    }

    filterAirports() {
        const searchTerm = document.getElementById('airportSearch').value.toLowerCase();
        const countryFilter = document.getElementById('countryFilter').value;
        const typeFilter = document.getElementById('airportTypeFilter').value;

        this.filteredAirports = this.airports.filter(airport => {
            const matchesSearch = !searchTerm || 
                airport.name.toLowerCase().includes(searchTerm) ||
                airport.code.toLowerCase().includes(searchTerm) ||
                airport.city.toLowerCase().includes(searchTerm);
            
            const matchesCountry = !countryFilter || airport.country === countryFilter;
            const matchesType = !typeFilter || airport.type === typeFilter;
            
            return matchesSearch && matchesCountry && matchesType;
        });

        this.currentPage = 1;
        this.renderAirports();
    }

    sortAirports(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredAirports.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.renderAirports();
    }

    renderAirports() {
        const tbody = document.getElementById('airportsTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageAirports = this.filteredAirports.slice(startIndex, endIndex);

        tbody.innerHTML = pageAirports.map(airport => `
            <tr>
                <td>${airport.code}</td>
                <td>${airport.name}</td>
                <td>${airport.city}</td>
                <td>${airport.country}</td>
                <td>${airport.type}</td>
                <td>${airport.gates}</td>
                <td>${airport.runways}</td>
                <td>${airport.annualPassengers}M</td>
                <td><span class="status ${airport.status}">${airport.status}</span></td>
                <td>
                    <button class="btn-view" data-action="view" data-airport-id="${airport.id}">View</button>
                    <button class="btn-edit" data-action="edit" data-airport-id="${airport.id}">Edit</button>
                    <button class="btn-delete" data-action="delete" data-airport-id="${airport.id}">Delete</button>
                </td>
            </tr>
        `).join('');

        // Add event listeners for action buttons
        this.bindActionButtons();
        this.updatePagination();
        this.updateSortHeaders();
    }

    bindActionButtons() {
        // Use event delegation for dynamically created buttons
        const tbody = document.getElementById('airportsTableBody');
        
        // Remove existing listeners to prevent duplicates
        tbody.removeEventListener('click', this.handleActionClick);
        
        // Add new listener
        this.handleActionClick = (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;
            
            const action = button.dataset.action;
            const airportId = parseInt(button.dataset.airportId);
            
            switch (action) {
                case 'view':
                    this.viewAirportDetails(airportId);
                    break;
                case 'edit':
                    this.editAirport(airportId);
                    break;
                case 'delete':
                    this.deleteAirport(airportId);
                    break;
            }
        };
        
        tbody.addEventListener('click', this.handleActionClick);
    }

    editAirport(airportId) {
        const airport = this.airports.find(a => a.id === airportId);
        if (airport) {
            this.openModal(airport);
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredAirports.length / this.itemsPerPage);
        const pageInfo = document.getElementById('airportsShowingStart');
        const prevBtn = document.getElementById('airportsPrevBtn');
        const nextBtn = document.getElementById('airportsNextBtn');
        
        pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
    }

    updateSortHeaders() {
        document.querySelectorAll('[data-sort]').forEach(header => {
            const column = header.dataset.sort;
            header.classList.toggle('sort-asc', this.sortColumn === column && this.sortDirection === 'asc');
            header.classList.toggle('sort-desc', this.sortColumn === column && this.sortDirection === 'desc');
        });
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderAirports();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredAirports.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderAirports();
        }
    }

    updateStats() {
        const stats = {
            total: this.airports.length,
            active: this.airports.filter(a => a.status === 'active').length,
            international: this.airports.filter(a => a.type === 'international').length,
            totalPassengers: this.airports.reduce((sum, a) => sum + a.annualPassengers, 0)
        };

        document.getElementById('totalAirports').textContent = stats.total;
        document.getElementById('activeAirports').textContent = stats.active;
        document.getElementById('internationalAirports').textContent = stats.international;
       document.getElementById('totalGates').textContent = this.airports.reduce((sum, a) => sum + a.gates, 0);
    }

    populateFilters() {
        const countries = [...new Set(this.airports.map(a => a.country))].sort();
        const types = [...new Set(this.airports.map(a => a.type))].sort();
        
        const countryFilter = document.getElementById('countryFilter');
        const typeFilter = document.getElementById('airportTypeFilter');
        
        countryFilter.innerHTML = '<option value="">All Countries</option>' +
            countries.map(country => `<option value="${country}">${country}</option>`).join('');
        
        typeFilter.innerHTML = '<option value="">All Types</option>' +
            types.map(type => `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>`).join('');
    }

    exportAirports() {
        const headers = ['Code', 'Name', 'City', 'Country', 'Type', 'Terminals', 'Gates', 'Runways', 'Annual Passengers', 'Status'];
        const csvContent = [
            headers.join(','),
            ...this.filteredAirports.map(airport => [
                airport.code,
                `"${airport.name}"`,
                airport.city,
                airport.country,
                airport.type,
                airport.terminals,
                airport.gates,
                airport.runways,
                airport.annualPassengers,
                airport.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'airports.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Airports exported successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the airport manager when the page loads
let airportManager;
document.addEventListener('DOMContentLoaded', () => {
    airportManager = new AirportManager();
});