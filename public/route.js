// routes.js - Route Management System

class RouteManager {
    constructor() {
        this.routes = [];
        this.filteredRoutes = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortColumn = '';
        this.sortDirection = 'asc';
        this.editingRouteId = null;
        
        this.initializeRoutes();
        this.bindEvents();
        this.updateRouteFilters();
        this.renderRoutes();
        this.updateStats();
    }

    initializeRoutes() {
        // Sample route data
        this.routes = [
            {
                id: 'RT-NYC-LAX-001',
                name: 'New York to Los Angeles',
                origin: 'NYC',
                destination: 'LAX',
                distance: 3944,
                duration: 5.5,
                basePrice: 299,
                economyMultiplier: 1.0,
                businessMultiplier: 2.5,
                firstClassMultiplier: 4.0,
                status: 'active',
                frequency: 14,
                notes: 'Popular transcontinental route',
                createdDate: '2024-01-15',
                lastUpdated: '2024-01-20'
            },
            {
                id: 'RT-NYC-CHI-002',
                name: 'New York to Chicago',
                origin: 'NYC',
                destination: 'CHI',
                distance: 1145,
                duration: 2.5,
                basePrice: 199,
                economyMultiplier: 1.0,
                businessMultiplier: 2.3,
                firstClassMultiplier: 3.8,
                status: 'active',
                frequency: 21,
                notes: 'High frequency business route',
                createdDate: '2024-01-10',
                lastUpdated: '2024-01-18'
            },
            {
                id: 'RT-LAX-MIA-003',
                name: 'Los Angeles to Miami',
                origin: 'LAX',
                destination: 'MIA',
                distance: 3765,
                duration: 5.0,
                basePrice: 279,
                economyMultiplier: 1.0,
                businessMultiplier: 2.4,
                firstClassMultiplier: 3.9,
                status: 'active',
                frequency: 10,
                notes: 'Seasonal demand variations',
                createdDate: '2024-01-12',
                lastUpdated: '2024-01-22'
            },
            {
                id: 'RT-CHI-DFW-004',
                name: 'Chicago to Dallas',
                origin: 'CHI',
                destination: 'DFW',
                distance: 1290,
                duration: 2.8,
                basePrice: 159,
                economyMultiplier: 1.0,
                businessMultiplier: 2.2,
                firstClassMultiplier: 3.5,
                status: 'active',
                frequency: 14,
                notes: 'Connecting hub route',
                createdDate: '2024-01-08',
                lastUpdated: '2024-01-19'
            },
            {
                id: 'RT-SFO-SEA-005',
                name: 'San Francisco to Seattle',
                origin: 'SFO',
                destination: 'SEA',
                distance: 1090,
                duration: 2.2,
                basePrice: 149,
                economyMultiplier: 1.0,
                businessMultiplier: 2.1,
                firstClassMultiplier: 3.3,
                status: 'seasonal',
                frequency: 7,
                notes: 'West coast corridor',
                createdDate: '2024-01-05',
                lastUpdated: '2024-01-16'
            },
            {
                id: 'RT-ATL-BOS-006',
                name: 'Atlanta to Boston',
                origin: 'ATL',
                destination: 'BOS',
                distance: 1506,
                duration: 2.9,
                basePrice: 189,
                economyMultiplier: 1.0,
                businessMultiplier: 2.3,
                firstClassMultiplier: 3.7,
                status: 'suspended',
                frequency: 0,
                notes: 'Temporarily suspended due to maintenance',
                createdDate: '2024-01-03',
                lastUpdated: '2024-01-25'
            }
        ];
        
        this.filteredRoutes = [...this.routes];
    }

    bindEvents() {
        // Navigation
        document.getElementById('addRouteBtn')?.addEventListener('click', () => this.showRouteModal());
        
        // Modal events
        document.getElementById('closeRouteModalBtn')?.addEventListener('click', () => this.hideRouteModal());
        document.getElementById('cancelRouteBtn')?.addEventListener('click', () => this.hideRouteModal());
        document.getElementById('routeForm')?.addEventListener('submit', (e) => this.handleRouteSubmit(e));
        
        // Search and filter
        document.getElementById('routeSearch')?.addEventListener('input', () => this.filterRoutes());
        document.getElementById('routeOriginFilter')?.addEventListener('change', () => this.filterRoutes());
        document.getElementById('routeDestinationFilter')?.addEventListener('change', () => this.filterRoutes());
        document.getElementById('filterRoutesBtn')?.addEventListener('click', () => this.filterRoutes());
        
        // Export
        document.getElementById('exportRoutesBtn')?.addEventListener('click', () => this.exportRoutes());
        
        // Pagination
        document.getElementById('routesPrevBtn')?.addEventListener('click', () => this.previousPage());
        document.getElementById('routesNextBtn')?.addEventListener('click', () => this.nextPage());
        
        // Route details modal
        document.getElementById('closeRouteDetailsModalBtn')?.addEventListener('click', () => this.hideRouteDetailsModal());
        
        // Auto-calculate pricing when base price changes
        document.getElementById('routeBasePrice')?.addEventListener('input', () => this.updatePricingPreview());
        document.getElementById('economyMultiplier')?.addEventListener('input', () => this.updatePricingPreview());
        document.getElementById('businessMultiplier')?.addEventListener('input', () => this.updatePricingPreview());
        document.getElementById('firstClassMultiplier')?.addEventListener('input', () => this.updatePricingPreview());
    }

    showRouteModal(route = null) {
        this.editingRouteId = route ? route.id : null;
        const modal = document.getElementById('routeModal');
        const title = document.getElementById('routeModalTitle');
        
        if (route) {
            title.textContent = 'Edit Route';
            this.populateRouteForm(route);
        } else {
            title.textContent = 'Add New Route';
            this.resetRouteForm();
        }
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideRouteModal() {
        document.getElementById('routeModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.editingRouteId = null;
    }

    showRouteDetailsModal(route) {
        const modal = document.getElementById('routeDetailsModal');
        const content = document.getElementById('routeDetailsContent');
        
        content.innerHTML = this.generateRouteDetailsHTML(route);
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideRouteDetailsModal() {
        document.getElementById('routeDetailsModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    populateRouteForm(route) {
        document.getElementById('routeId').value = route.id;
        document.getElementById('routeName').value = route.name || '';
        document.getElementById('routeOrigin').value = route.origin;
        document.getElementById('routeDestination').value = route.destination;
        document.getElementById('routeDistance').value = route.distance;
        document.getElementById('routeDuration').value = route.duration;
        document.getElementById('routeBasePrice').value = route.basePrice;
        document.getElementById('economyMultiplier').value = route.economyMultiplier;
        document.getElementById('businessMultiplier').value = route.businessMultiplier;
        document.getElementById('firstClassMultiplier').value = route.firstClassMultiplier;
        document.getElementById('routeStatus').value = route.status;
        document.getElementById('routeFrequency').value = route.frequency || '';
        document.getElementById('routeNotes').value = route.notes || '';
        
        this.updatePricingPreview();
    }

    resetRouteForm() {
        document.getElementById('routeForm').reset();
        document.getElementById('economyMultiplier').value = '1.0';
        document.getElementById('businessMultiplier').value = '2.5';
        document.getElementById('firstClassMultiplier').value = '4.0';
        document.getElementById('routeStatus').value = 'active';
        this.updatePricingPreview();
    }

    updatePricingPreview() {
        const basePrice = parseFloat(document.getElementById('routeBasePrice').value) || 0;
        const economyMult = parseFloat(document.getElementById('economyMultiplier').value) || 1;
        const businessMult = parseFloat(document.getElementById('businessMultiplier').value) || 2.5;
        const firstMult = parseFloat(document.getElementById('firstClassMultiplier').value) || 4;

        // You can add a preview section to show calculated prices
        console.log('Pricing Preview:', {
            economy: basePrice * economyMult,
            business: basePrice * businessMult,
            first: basePrice * firstMult
        });
    }

    handleRouteSubmit(e) {
        e.preventDefault();
        
        const routeData = {
            id: document.getElementById('routeId').value.trim(),
            name: document.getElementById('routeName').value.trim(),
            origin: document.getElementById('routeOrigin').value,
            destination: document.getElementById('routeDestination').value,
            distance: parseInt(document.getElementById('routeDistance').value),
            duration: parseFloat(document.getElementById('routeDuration').value),
            basePrice: parseInt(document.getElementById('routeBasePrice').value),
            economyMultiplier: parseFloat(document.getElementById('economyMultiplier').value),
            businessMultiplier: parseFloat(document.getElementById('businessMultiplier').value),
            firstClassMultiplier: parseFloat(document.getElementById('firstClassMultiplier').value),
            status: document.getElementById('routeStatus').value,
            frequency: parseInt(document.getElementById('routeFrequency').value) || 0,
            notes: document.getElementById('routeNotes').value.trim(),
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        // Validation
        if (!this.validateRouteData(routeData)) {
            return;
        }

        if (this.editingRouteId) {
            this.updateRoute(routeData);
        } else {
            routeData.createdDate = new Date().toISOString().split('T')[0];
            this.addRoute(routeData);
        }

        this.hideRouteModal();
        this.renderRoutes();
        this.updateStats();
        this.updateRouteFilters();
        this.showToast('Route saved successfully!', 'success');
    }

    validateRouteData(data) {
        if (!data.id) {
            this.showToast('Route ID is required', 'error');
            return false;
        }

        if (!data.origin || !data.destination) {
            this.showToast('Origin and destination are required', 'error');
            return false;
        }

        if (data.origin === data.destination) {
            this.showToast('Origin and destination cannot be the same', 'error');
            return false;
        }

        if (!data.distance || data.distance <= 0) {
            this.showToast('Distance must be greater than 0', 'error');
            return false;
        }

        if (!data.duration || data.duration <= 0) {
            this.showToast('Duration must be greater than 0', 'error');
            return false;
        }

        if (!data.basePrice || data.basePrice <= 0) {
            this.showToast('Base price must be greater than 0', 'error');
            return false;
        }

        // Check for duplicate route ID (when adding new route)
        if (!this.editingRouteId) {
            const existingRoute = this.routes.find(route => route.id === data.id);
            if (existingRoute) {
                this.showToast('Route ID already exists', 'error');
                return false;
            }
        }

        return true;
    }

    addRoute(routeData) {
        this.routes.push(routeData);
        this.filterRoutes();
    }

    updateRoute(routeData) {
        const index = this.routes.findIndex(route => route.id === this.editingRouteId);
        if (index !== -1) {
            this.routes[index] = routeData;
            this.filterRoutes();
        }
    }

    deleteRoute(routeId) {
        if (confirm('Are you sure you want to delete this route?')) {
            this.routes = this.routes.filter(route => route.id !== routeId);
            this.filterRoutes();
            this.renderRoutes();
            this.updateStats();
            this.updateRouteFilters();
            this.showToast('Route deleted successfully!', 'success');
        }
    }

    filterRoutes() {
        const searchTerm = document.getElementById('routeSearch')?.value.toLowerCase() || '';
        const originFilter = document.getElementById('routeOriginFilter')?.value || '';
        const destinationFilter = document.getElementById('routeDestinationFilter')?.value || '';

        this.filteredRoutes = this.routes.filter(route => {
            const matchesSearch = !searchTerm || 
                route.id.toLowerCase().includes(searchTerm) ||
                route.name.toLowerCase().includes(searchTerm) ||
                route.origin.toLowerCase().includes(searchTerm) ||
                route.destination.toLowerCase().includes(searchTerm);

            const matchesOrigin = !originFilter || route.origin === originFilter;
            const matchesDestination = !destinationFilter || route.destination === destinationFilter;

            return matchesSearch && matchesOrigin && matchesDestination;
        });

        this.currentPage = 1;
        this.renderRoutes();
    }

    sortRoutes(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredRoutes.sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];

            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            if (valueA < valueB) {
                return this.sortDirection === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return this.sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });

        this.renderRoutes();
    }

    renderRoutes() {
    const tableBody = document.getElementById('routesTableBody');
    if (!tableBody) return;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const routesToShow = this.filteredRoutes.slice(startIndex, endIndex);

    tableBody.innerHTML = routesToShow.map(route => `
        <tr class="hover:bg-gray-50 transition-colors duration-200">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">${route.id}</div>
            </td>
            <td class="px-6 py-4">
                <div class="font-medium text-gray-900">${route.name}</div>
                <div class="text-sm text-gray-500">${route.origin} → ${route.destination}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${route.distance.toLocaleString()} mi
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${route.duration}h
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                $${route.basePrice}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getStatusClass(route.status)}">
                    ${route.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${route.frequency}/week
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button data-action="view" data-route-id="${route.id}" 
                        class="text-blue-600 hover:text-blue-900 mr-3">View</button>
                <button data-action="edit" data-route-id="${route.id}" 
                        class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                <button data-action="delete" data-route-id="${route.id}" 
                        class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');

    // Add event listeners to action buttons
    this.bindActionButtons();
    this.updatePagination();
}
// New method to handle action button events
bindActionButtons() {
    const tableBody = document.getElementById('routesTableBody');
    if (!tableBody) return;

    tableBody.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const action = button.getAttribute('data-action');
        const routeId = button.getAttribute('data-route-id');
        const route = this.routes.find(r => r.id === routeId);

        if (!route) return;

        switch (action) {
            case 'view':
                this.showRouteDetailsModal(route);
                break;
            case 'edit':
                this.showRouteModal(route);
                break;
            case 'delete':
                this.deleteRoute(routeId);
                break;
        }
    });
}
    getStatusClass(status) {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'suspended':
                return 'bg-red-100 text-red-800';
            case 'seasonal':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredRoutes.length / this.itemsPerPage);
        const prevBtn = document.getElementById('routesPrevBtn');
        const nextBtn = document.getElementById('routesNextBtn');
        const pageInfo = document.getElementById('routesPageInfo');

        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderRoutes();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredRoutes.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderRoutes();
        }
    }

    updateStats() {
        const totalRoutes = this.routes.length;
        const activeRoutes = this.routes.filter(route => route.status === 'active').length;
        const totalDistance = this.routes.reduce((sum, route) => sum + route.distance, 0);
        const avgPrice = this.routes.length > 0 ? 
            Math.round(this.routes.reduce((sum, route) => sum + route.basePrice, 0) / this.routes.length) : 0;

        // Update DOM elements if they exist
        const totalRoutesElement = document.getElementById('totalRoutes');
        const activeRoutesElement = document.getElementById('activeRoutes');
        const totalDistanceElement = document.getElementById('totalDistance');
        const avgPriceElement = document.getElementById('avgPrice');

        if (totalRoutesElement) totalRoutesElement.textContent = totalRoutes;
        if (activeRoutesElement) activeRoutesElement.textContent = activeRoutes;
        if (totalDistanceElement) totalDistanceElement.textContent = totalDistance.toLocaleString();
        if (avgPriceElement) avgPriceElement.textContent = `$${avgPrice}`;
    }

    updateRouteFilters() {
        const origins = [...new Set(this.routes.map(route => route.origin))].sort();
        const destinations = [...new Set(this.routes.map(route => route.destination))].sort();

        const originFilter = document.getElementById('routeOriginFilter');
        const destinationFilter = document.getElementById('routeDestinationFilter');

        if (originFilter) {
            originFilter.innerHTML = '<option value="">All Origins</option>' +
                origins.map(origin => `<option value="${origin}">${origin}</option>`).join('');
        }

        if (destinationFilter) {
            destinationFilter.innerHTML = '<option value="">All Destinations</option>' +
                destinations.map(dest => `<option value="${dest}">${dest}</option>`).join('');
        }
    }

    generateRouteDetailsHTML(route) {
        const economyPrice = Math.round(route.basePrice * route.economyMultiplier);
        const businessPrice = Math.round(route.basePrice * route.businessMultiplier);
        const firstPrice = Math.round(route.basePrice * route.firstClassMultiplier);

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-semibold mb-4">Route Information</h3>
                    <div class="space-y-3">
                        <div><strong>Route ID:</strong> ${route.id}</div>
                        <div><strong>Name:</strong> ${route.name}</div>
                        <div><strong>Origin:</strong> ${route.origin}</div>
                        <div><strong>Destination:</strong> ${route.destination}</div>
                        <div><strong>Distance:</strong> ${route.distance.toLocaleString()} miles</div>
                        <div><strong>Duration:</strong> ${route.duration} hours</div>
                        <div><strong>Status:</strong> <span class="px-2 py-1 rounded text-sm ${this.getStatusClass(route.status)}">${route.status}</span></div>
                        <div><strong>Frequency:</strong> ${route.frequency} flights per week</div>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-semibold mb-4">Pricing</h3>
                    <div class="space-y-3">
                        <div><strong>Base Price:</strong> $${route.basePrice}</div>
                        <div><strong>Economy:</strong> $${economyPrice} (${route.economyMultiplier}x)</div>
                        <div><strong>Business:</strong> $${businessPrice} (${route.businessMultiplier}x)</div>
                        <div><strong>First Class:</strong> $${firstPrice} (${route.firstClassMultiplier}x)</div>
                    </div>
                </div>
                <div class="md:col-span-2">
                    <h3 class="text-lg font-semibold mb-4">Additional Information</h3>
                    <div class="space-y-3">
                        <div><strong>Notes:</strong> ${route.notes || 'No notes available'}</div>
                        <div><strong>Created:</strong> ${route.createdDate}</div>
                        <div><strong>Last Updated:</strong> ${route.lastUpdated}</div>
                    </div>
                </div>
            </div>
        `;
    }

    exportRoutes() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `routes_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Routes exported successfully!', 'success');
    }

    generateCSV() {
        const headers = [
            'Route ID', 'Name', 'Origin', 'Destination', 'Distance (mi)', 
            'Duration (h)', 'Base Price', 'Economy Multiplier', 'Business Multiplier', 
            'First Class Multiplier', 'Status', 'Frequency', 'Notes', 
            'Created Date', 'Last Updated'
        ];

        const csvRows = [headers.join(',')];

        this.routes.forEach(route => {
            const row = [
                route.id,
                `"${route.name}"`,
                route.origin,
                route.destination,
                route.distance,
                route.duration,
                route.basePrice,
                route.economyMultiplier,
                route.businessMultiplier,
                route.firstClassMultiplier,
                route.status,
                route.frequency,
                `"${route.notes || ''}"`,
                route.createdDate,
                route.lastUpdated
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 transition-all duration-300 transform translate-x-full ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        }`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize the route manager when the DOM is loaded
let routeManager;
document.addEventListener('DOMContentLoaded', () => {
    routeManager = new RouteManager();
});