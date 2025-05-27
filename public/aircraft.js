// Aircraft Management System - Fixed Version
class AircraftManager {
    constructor() {
        // Initialize with data from memory or default data
        this.aircraft = this.loadAircraftData() || [
            {
                id: 1,
                model: 'Boeing 737-800',
                registration: 'N737SL',
                capacity: 189,
                status: 'active',
                lastMaintenance: '2024-01-10',
                manufacturer: 'Boeing',
                yearManufactured: 2018,
                totalFlightHours: 12500,
                nextMaintenance: '2024-03-10'
            },
            {
                id: 2,
                model: 'Airbus A320',
                registration: 'N320SL',
                capacity: 150,
                status: 'maintenance',
                lastMaintenance: '2024-01-05',
                manufacturer: 'Airbus',
                yearManufactured: 2019,
                totalFlightHours: 8900,
                nextMaintenance: '2024-02-05'
            },
            {
                id: 3,
                model: 'Boeing 777-300',
                registration: 'N777SL',
                capacity: 396,
                status: 'active',
                lastMaintenance: '2024-01-08',
                manufacturer: 'Boeing',
                yearManufactured: 2020,
                totalFlightHours: 6200,
                nextMaintenance: '2024-04-08'
            }
        ];
        this.currentEditingAircraft = null;
        this.filteredAircraft = [...this.aircraft];
        
        // Wait for DOM to be ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    // Save data to memory (simulating persistence until logout)
    saveAircraftData() {
        window.aircraftData = JSON.stringify(this.aircraft);
    }

    // Load data from memory
    loadAircraftData() {
        if (window.aircraftData) {
            try {
                return JSON.parse(window.aircraftData);
            } catch (e) {
                console.error('Error loading aircraft data:', e);
                return null;
            }
        }
        return null;
    }

    init() {
        console.log('Initializing Aircraft Manager...');
        this.renderAircraftGrid();
        this.bindEvents();
        this.updateStatsDisplay();
    }

    bindEvents() {
        // Add new aircraft button
        const addBtn = document.getElementById('addAircraftBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddModal());
        }

        // Close modal events
        const closeBtn = document.getElementById('closeAircraftModalBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        const cancelBtn = document.getElementById('cancelAircraftBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // Form submission
        const form = document.getElementById('aircraftForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Modal backdrop click
        const modal = document.getElementById('aircraftModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Search and filter
        const searchInput = document.getElementById('aircraftSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterAircraft(e.target.value));
        }

        const statusFilter = document.getElementById('aircraftStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => this.filterByStatus(e.target.value));
        }

        // Export button
        const exportBtn = document.getElementById('exportAircraftBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAircraftData());
        }
        
        // Import button
        const importBtn = document.getElementById('importAircraftBtn');
        if (importBtn) {
            importBtn.addEventListener('change', (e) => this.importAircraftData(e));
        }

        console.log('Events bound successfully');
    }

    renderAircraftGrid() {
        const grid = document.getElementById('aircraftGrid');
        if (!grid) {
            console.error('Aircraft grid element not found');
            return;
        }

        grid.innerHTML = '';
        
        this.filteredAircraft.forEach(plane => {
            const card = this.createAircraftCard(plane);
            grid.appendChild(card);
        });

        // Update stats after rendering
        this.updateStatsDisplay();
        console.log('Aircraft grid rendered with', this.filteredAircraft.length, 'aircraft');
    }

    createAircraftCard(plane) {
        const statusColor = this.getStatusColor(plane.status);
        const statusIcon = this.getStatusIcon(plane.status);
        
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">${plane.model}</h3>
                    <p class="text-sm text-neutral-gray">${plane.registration}</p>
                    <p class="text-xs text-neutral-gray">${plane.manufacturer} • ${plane.yearManufactured}</p>
                </div>
                <div class="text-right">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColor} flex items-center">
                        <i class="${statusIcon} mr-1"></i>
                        ${plane.status.charAt(0).toUpperCase() + plane.status.slice(1)}
                    </span>
                </div>
            </div>
            
            <div class="space-y-2 mb-4">
                <div class="flex justify-between">
                    <span class="text-sm text-neutral-gray">Capacity:</span>
                    <span class="text-sm font-medium">${plane.capacity} seats</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-sm text-neutral-gray">Flight Hours:</span>
                    <span class="text-sm font-medium">${plane.totalFlightHours.toLocaleString()}h</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-sm text-neutral-gray">Last Maintenance:</span>
                    <span class="text-sm font-medium">${new Date(plane.lastMaintenance).toLocaleDateString()}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-sm text-neutral-gray">Next Maintenance:</span>
                    <span class="text-sm font-medium ${this.isMaintenanceDue(plane.nextMaintenance) ? 'text-error-red' : ''}">${new Date(plane.nextMaintenance).toLocaleDateString()}</span>
                </div>
            </div>
            
            <div class="flex space-x-2">
                <button class="edit-btn flex-1 bg-secondary-blue text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors" data-aircraft-id="${plane.id}">
                    <i class="fas fa-edit mr-1"></i>Edit
                </button>
                <button class="toggle-status-btn flex-1 ${plane.status === 'active' ? 'bg-warning-orange hover:bg-yellow-600' : 'bg-success-green hover:bg-green-600'} text-white px-3 py-2 rounded text-sm transition-colors" data-aircraft-id="${plane.id}">
                    <i class="fas ${plane.status === 'active' ? 'fa-wrench' : 'fa-check'} mr-1"></i>
                    ${plane.status === 'active' ? 'Maintenance' : 'Activate'}
                </button>
                <button class="delete-btn bg-error-red text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors" data-aircraft-id="${plane.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add event listeners to the buttons
        const editBtn = card.querySelector('.edit-btn');
        const toggleBtn = card.querySelector('.toggle-status-btn');
        const deleteBtn = card.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => this.editAircraft(plane.id));
        toggleBtn.addEventListener('click', () => this.toggleStatus(plane.id));
        deleteBtn.addEventListener('click', () => this.deleteAircraft(plane.id));

        return card;
    }

    getStatusColor(status) {
        switch(status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800';
            case 'retired':
                return 'bg-gray-100 text-gray-800';
            case 'grounded':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    getStatusIcon(status) {
        switch(status) {
            case 'active':
                return 'fas fa-check-circle';
            case 'maintenance':
                return 'fas fa-wrench';
            case 'retired':
                return 'fas fa-archive';
            case 'grounded':
                return 'fas fa-ban';
            default:
                return 'fas fa-question-circle';
        }
    }

    isMaintenanceDue(nextMaintenanceDate) {
        const today = new Date();
        const maintenanceDate = new Date(nextMaintenanceDate);
        const daysDiff = Math.ceil((maintenanceDate - today) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7; // Due within 7 days
    }

    openAddModal() {
        this.currentEditingAircraft = null;
        this.resetForm();
        document.getElementById('aircraftModalTitle').textContent = 'Add New Aircraft';
        document.getElementById('aircraftModal').classList.remove('hidden');
    }

    editAircraft(aircraftId) {
        const aircraft = this.aircraft.find(a => a.id === aircraftId);
        if (!aircraft) {
            console.error('Aircraft not found:', aircraftId);
            return;
        }

        this.currentEditingAircraft = aircraft;
        this.populateForm(aircraft);
        document.getElementById('aircraftModalTitle').textContent = 'Edit Aircraft';
        document.getElementById('aircraftModal').classList.remove('hidden');
    }

    populateForm(aircraft) {
        document.getElementById('aircraftModel').value = aircraft.model;
        document.getElementById('aircraftRegistration').value = aircraft.registration;
        document.getElementById('aircraftManufacturer').value = aircraft.manufacturer;
        document.getElementById('aircraftCapacity').value = aircraft.capacity;
        document.getElementById('aircraftYear').value = aircraft.yearManufactured;
        document.getElementById('aircraftFlightHours').value = aircraft.totalFlightHours;
        document.getElementById('aircraftStatus').value = aircraft.status;
        document.getElementById('lastMaintenance').value = aircraft.lastMaintenance;
        document.getElementById('nextMaintenance').value = aircraft.nextMaintenance;
    }

    resetForm() {
        const form = document.getElementById('aircraftForm');
        if (form) {
            form.reset();
        }
    }

    closeModal() {
        document.getElementById('aircraftModal').classList.add('hidden');
        this.currentEditingAircraft = null;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            model: document.getElementById('aircraftModel').value,
            registration: document.getElementById('aircraftRegistration').value.toUpperCase(),
            manufacturer: document.getElementById('aircraftManufacturer').value,
            capacity: parseInt(document.getElementById('aircraftCapacity').value),
            yearManufactured: parseInt(document.getElementById('aircraftYear').value),
            totalFlightHours: parseInt(document.getElementById('aircraftFlightHours').value) || 0,
            status: document.getElementById('aircraftStatus').value,
            lastMaintenance: document.getElementById('lastMaintenance').value,
            nextMaintenance: document.getElementById('nextMaintenance').value
        };

        // Validation
        if (!this.validateForm(formData)) {
            return;
        }

        if (this.currentEditingAircraft) {
            this.updateAircraft(formData);
        } else {
            this.addAircraft(formData);
        }

        this.closeModal();
        this.renderAircraftGrid();
        this.saveAircraftData(); // Save data after changes
    }

    validateForm(data) {
        // Check for duplicate registration
        const existingAircraft = this.aircraft.find(a => 
            a.registration === data.registration && 
            (!this.currentEditingAircraft || a.id !== this.currentEditingAircraft.id)
        );

        if (existingAircraft) {
            this.showToast('Aircraft registration already exists!', 'error');
            return false;
        }

        // Validate dates if provided
        if (data.lastMaintenance && data.nextMaintenance) {
            const lastMaintenance = new Date(data.lastMaintenance);
            const nextMaintenance = new Date(data.nextMaintenance);

            if (nextMaintenance <= lastMaintenance) {
                this.showToast('Next maintenance date must be after last maintenance date!', 'error');
                return false;
            }
        }

        return true;
    }

    addAircraft(data) {
        const newAircraft = {
            id: this.generateId(),
            ...data
        };

        this.aircraft.push(newAircraft);
        this.filteredAircraft = [...this.aircraft];
        this.showToast('Aircraft added successfully!', 'success');
    }

    updateAircraft(data) {
        const index = this.aircraft.findIndex(a => a.id === this.currentEditingAircraft.id);
        if (index !== -1) {
            this.aircraft[index] = { ...this.aircraft[index], ...data };
            this.filteredAircraft = [...this.aircraft];
            this.showToast('Aircraft updated successfully!', 'success');
        }
    }

    deleteAircraft(aircraftId) {
        const aircraft = this.aircraft.find(a => a.id === aircraftId);
        if (!aircraft) {
            console.error('Aircraft not found for deletion:', aircraftId);
            return;
        }

        if (confirm(`Are you sure you want to delete ${aircraft.model} (${aircraft.registration})?`)) {
            this.aircraft = this.aircraft.filter(a => a.id !== aircraftId);
            this.filteredAircraft = [...this.aircraft];
            this.renderAircraftGrid();
            this.saveAircraftData();
            this.showToast('Aircraft deleted successfully!', 'success');
        }
    }

    toggleStatus(aircraftId) {
        const aircraft = this.aircraft.find(a => a.id === aircraftId);
        if (!aircraft) {
            console.error('Aircraft not found for status toggle:', aircraftId);
            return;
        }

        const newStatus = aircraft.status === 'active' ? 'maintenance' : 'active';
        const confirmMessage = aircraft.status === 'active' 
            ? `Put ${aircraft.registration} into maintenance?`
            : `Activate ${aircraft.registration}?`;

        if (confirm(confirmMessage)) {
            aircraft.status = newStatus;
            this.filteredAircraft = [...this.aircraft];
            this.renderAircraftGrid();
            this.saveAircraftData();
            this.showToast(`Aircraft status changed to ${newStatus}!`, 'success');
        }
    }

    filterAircraft(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredAircraft = this.aircraft.filter(aircraft => 
            aircraft.model.toLowerCase().includes(term) ||
            aircraft.registration.toLowerCase().includes(term) ||
            aircraft.manufacturer.toLowerCase().includes(term)
        );
        this.renderAircraftGrid();
    }

    filterByStatus(status) {
        if (status === '') {
            this.filteredAircraft = [...this.aircraft];
        } else {
            this.filteredAircraft = this.aircraft.filter(a => a.status === status);
        }
        this.renderAircraftGrid();
    }

    generateId() {
        return Math.max(...this.aircraft.map(a => a.id), 0) + 1;
    }

    showToast(message, type = 'success') {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white max-w-sm ${
            type === 'success' ? 'bg-success-green' : 'bg-error-red'
        }`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Export/Import functionality
    exportAircraftData() {
        const dataStr = JSON.stringify(this.aircraft, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `aircraft_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast('Aircraft data exported successfully!', 'success');
    }

    importAircraftData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData) && importedData.length > 0) {
                    // Validate imported data structure
                    const validData = importedData.every(item => 
                        item.hasOwnProperty('id') && 
                        item.hasOwnProperty('model') && 
                        item.hasOwnProperty('registration')
                    );
                    
                    if (validData) {
                        this.aircraft = importedData;
                        this.filteredAircraft = [...this.aircraft];
                        this.renderAircraftGrid();
                        this.saveAircraftData();
                        this.showToast('Aircraft data imported successfully!', 'success');
                    } else {
                        throw new Error('Invalid data structure');
                    }
                } else {
                    throw new Error('Invalid data format or empty file');
                }
            } catch (error) {
                this.showToast('Error importing data: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    // Statistics
    getAircraftStats() {
        const stats = {
            total: this.aircraft.length,
            active: this.aircraft.filter(a => a.status === 'active').length,
            maintenance: this.aircraft.filter(a => a.status === 'maintenance').length,
            grounded: this.aircraft.filter(a => a.status === 'grounded').length,
            retired: this.aircraft.filter(a => a.status === 'retired').length,
            totalCapacity: this.aircraft.reduce((sum, a) => sum + a.capacity, 0),
            averageAge: this.aircraft.length > 0 ? 
                Math.round(this.aircraft.reduce((sum, a) => sum + (new Date().getFullYear() - a.yearManufactured), 0) / this.aircraft.length) : 0,
            totalFlightHours: this.aircraft.reduce((sum, a) => sum + a.totalFlightHours, 0)
        };
        return stats;
    }

    updateStatsDisplay() {
        const stats = this.getAircraftStats();
        
        // Update stats cards if they exist
        const totalElement = document.getElementById('totalAircraft');
        if (totalElement) totalElement.textContent = stats.total;
        
        const activeElement = document.getElementById('activeAircraft');
        if (activeElement) activeElement.textContent = stats.active;
        
        const maintenanceElement = document.getElementById('maintenanceAircraft');
        if (maintenanceElement) maintenanceElement.textContent = stats.maintenance;
        
        const capacityElement = document.getElementById('totalCapacity');
        if (capacityElement) capacityElement.textContent = stats.totalCapacity.toLocaleString();
    }

    // Clear data on logout
    clearData() {
        window.aircraftData = null;
        this.aircraft = [];
        this.filteredAircraft = [];
        this.renderAircraftGrid();
    }
}

// Initialize Aircraft Manager when DOM is loaded
let aircraftManager;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAircraftManager);
} else {
    initializeAircraftManager();
}

function initializeAircraftManager() {
    aircraftManager = new AircraftManager();
    console.log('Aircraft Manager initialized successfully');
    
    // Add logout event listener to clear data
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (aircraftManager) {
                aircraftManager.clearData();
            }
            // Add your logout logic here
            alert('Logged out successfully!');
        });
    }
}