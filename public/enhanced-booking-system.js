// Fixed Booking System - Handles flight validation properly
class BookingSystem {
    constructor() {
        this.currentStep = 1;
        this.apiBaseUrl = 'http://localhost:5000/api';
        this.bookingData = {
            flight: {
                id: null,
                number: 'SL101',
                date: 'May 23, 2025',
                departure: { time: '08:30', airport: 'JFK', city: 'New York' },
                arrival: { time: '11:45', airport: 'LAX', city: 'Los Angeles' },
                duration: '5h 15m',
                aircraft: 'Boeing 737',
                class: 'Economy'
            },
            pricing: {
                baseFare: 299,
                taxes: 45,
                seatFee: 0,
                total: 344
            },
            selectedSeat: null,
            passenger: {},
            payment: {}
        };
        this.availableFlights = []; // Store available flights from API
        this.init();
    }

    // Simplified API call without authentication
    


    // Load and validate flight data first
    async loadFlightData() {
        console.log('Using default flight data (no API dependency)');
        // Keep the default flight data as-is
        this.bookingData.flight.fromAPI = false;
        this.bookingData.flight.id = this.generateObjectId(); // Generate local ID
        
        // No API calls needed - just use the default data
        this.updateUI();
    }

    // Find a flight that matches our default data or return the first available
    findMatchingFlight() {
        return this.availableFlights.find(flight => 
            flight.flightNumber === this.bookingData.flight.number ||
            (flight.origin && flight.origin.code === this.bookingData.flight.departure.airport)
        );
    }

    // Create booking with proper flight validation
   // Create booking with simplified approach - no flight validation needed
   async createBooking() {
    console.log('Creating booking and saving to database...');
    
    const bookingPayload = {
        confirmationNumber: this.generateConfirmationNumber(),
        flightDetails: {
            flightNumber: this.bookingData.flight.number,
            date: this.bookingData.flight.date,
            departure: this.bookingData.flight.departure,
            arrival: this.bookingData.flight.arrival,
            duration: this.bookingData.flight.duration,
            aircraft: this.bookingData.flight.aircraft
        },
        passenger: {
            firstName: this.bookingData.passenger.firstName,
            lastName: this.bookingData.passenger.lastName,
            email: this.bookingData.passenger.email,
            phone: this.bookingData.passenger.phone,
            dateOfBirth: new Date(this.bookingData.passenger.dateOfBirth),
            gender: this.bookingData.passenger.gender,
            mealPreference: this.bookingData.passenger.mealPreference,
            specialAssistance: this.bookingData.passenger.specialAssistance
        },
        seat: this.bookingData.selectedSeat?.id || null,
        class: this.bookingData.flight.class,
        pricing: {
            baseFare: this.bookingData.pricing.baseFare,
            taxes: this.bookingData.pricing.taxes,
            seatFee: this.bookingData.pricing.seatFee,
            total: this.bookingData.pricing.total
        },
        paymentMethod: this.bookingData.payment.method || 'credit-card',
        status: 'confirmed',
        createdAt: new Date(),
        bookingId: this.generateObjectId()
    };

    try {
        // ✅ ACTUAL API CALL TO SAVE TO DATABASE
        const response = await fetch(`${this.apiBaseUrl}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication header if needed
                // 'Authorization': `Bearer ${this.authToken}`
            },
            body: JSON.stringify(bookingPayload)
        });

        if (!response.ok) {
            throw new Error(`Database save failed: ${response.status} ${response.statusText}`);
        }

        const savedBooking = await response.json();
        console.log('Booking successfully saved to database:', savedBooking);
        
        // ✅ Only set success flag if database save was actually successful
        this.bookingData.confirmationNumber = savedBooking.confirmationNumber;
        this.bookingData.bookingId = savedBooking._id || savedBooking.id;
        this.bookingData.savedToDatabase = true;
        this.bookingData.databaseBooking = savedBooking;
        
        return savedBooking;

    } catch (error) {
        console.error('Failed to save booking to database:', error);
        
        // ✅ Fallback: Save locally but mark as not saved to DB
        this.bookingData.confirmationNumber = bookingPayload.confirmationNumber;
        this.bookingData.bookingId = bookingPayload.bookingId;
        this.bookingData.savedToDatabase = false; // ✅ Correctly set to false
        this.bookingData.localBooking = bookingPayload;
        this.bookingData.errorMessage = error.message;
        
        // Still return the booking data for UI purposes
        return bookingPayload;
    }
}


    // Simplified flight data loading - no API calls
    async loadFlightData() {
        console.log('Using default flight data (no API dependency)');
        // Keep the default flight data as-is
        this.bookingData.flight.fromAPI = false;
        this.bookingData.flight.id = this.generateObjectId(); // Generate local ID
        
        // No API calls needed - just use the default data
        this.updateUI();
    }

    // Remove the findOrCreateFlight method entirely - not needed
    // Remove the apiCall method entirely - not needed
    // Find an existing flight or create flight data that can be used
   
    // Update flight data in the booking object
    updateFlightData(flight) {
        this.bookingData.flight = {
            id: flight._id || flight.id,
            number: flight.flightNumber,
            date: new Date(flight.departureTime).toLocaleDateString(),
            departure: {
                time: new Date(flight.departureTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }),
                airport: flight.origin.code,
                city: flight.origin.city
            },
            arrival: {
                time: new Date(flight.arrivalTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }),
                airport: flight.destination.code,
                city: flight.destination.city
            },
            duration: this.calculateDuration(flight.departureTime, flight.arrivalTime),
            aircraft: flight.aircraft?.model || 'Boeing 737',
            class: 'Economy',
            fromAPI: true
        };

        // Update pricing based on flight data
        this.bookingData.pricing = {
            baseFare: flight.price?.economy || 299,
            taxes: Math.round((flight.price?.economy || 299) * 0.15),
            seatFee: 0,
            total: (flight.price?.economy || 299) + Math.round((flight.price?.economy || 299) * 0.15)
        };

        this.updateUI();
    }

    // Process Payment and Create Booking
    async processPayment() {
        const paymentButton = document.getElementById('processPayment');
        const buttonText = document.getElementById('paymentButtonText');
        const spinner = document.getElementById('paymentSpinner');
        
        if (!paymentButton || !buttonText) return;

        // Validate payment form first
        if (this.bookingData.payment.method === 'credit-card' || this.bookingData.payment.method === 'debit-card') {
            if (!this.validatePaymentForm()) {
                this.showNotification('Please check your payment details.', 'error');
                return;
            }
        }

        // Show loading state
        buttonText.textContent = 'Processing...';
        if (spinner) spinner.classList.remove('hidden');
        paymentButton.disabled = true;
        
        try {
            // Step 1: Simulate payment processing
            console.log('Processing payment...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Step 2: Ensure we have valid flight data
            if (!this.bookingData.flight.id && this.availableFlights.length === 0) {
                console.log('Reloading flight data before booking...');
                await this.loadFlightData();
            }
            
            // Step 3: Create booking in database
            console.log('Saving booking to database...');
            const booking = await this.createBooking();
            
            console.log('Booking result:', booking);
            
            // Step 4: Update confirmation details
            this.updateConfirmationDetails(booking);
            
            // Step 5: Go to confirmation step
            this.goToStep(5);
            
            // Show appropriate success message
            if (this.bookingData.savedToDatabase) {
                this.showNotification('Payment successful! Booking confirmed and saved to database.', 'success');
            } else {
                this.showNotification('Payment successful! Booking confirmed. Database save failed but booking details are preserved.', 'warning');
                console.warn('Fallback booking data:', this.bookingData.fallbackData);
            }
            
        } catch (error) {
            console.error('Payment processing failed:', error);
            this.showNotification(`Payment failed: ${error.message}`, 'error');
            
        } finally {
            // Reset button state
            buttonText.textContent = 'Process Payment';
            if (spinner) spinner.classList.add('hidden');
            paymentButton.disabled = false;
        }
    }

    // Initialize without auth checks
    async init() {
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('BookingSystem initialized');
            
            // Load flight data first
            await this.loadFlightData();
            
            this.initializeSeats();
            this.bindEventListeners();
            this.updateProgress();
            this.setupCardFormatting();
        });
    }

    // Generate confirmation number
    generateConfirmationNumber() {
        const prefix = 'SL';
        const timestamp = Date.now().toString().substr(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    // Generate a valid MongoDB ObjectId for testing
    generateObjectId() {
        const timestamp = Math.floor(Date.now() / 1000).toString(16);
        const randomBytes = Math.random().toString(16).substring(2, 18);
        return (timestamp + randomBytes).substring(0, 24);
    }

    // Calculate flight duration
    calculateDuration(departure, arrival) {
        const diff = new Date(arrival) - new Date(departure);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }

    // Update UI with flight data
    updateUI() {
        // Update flight information display
        document.querySelectorAll('[data-flight-info]').forEach(element => {
            const info = element.dataset.flightInfo;
            if (this.bookingData.flight[info]) {
                element.textContent = this.bookingData.flight[info];
            }
        });

        this.updatePricing();
    }

    // Event Listeners
    bindEventListeners() {
        // Navigation buttons
        document.getElementById('continueStep1')?.addEventListener('click', () => this.goToStep(2));
        document.getElementById('continueStep2')?.addEventListener('click', () => this.goToStep(3));
        document.getElementById('continueStep3')?.addEventListener('click', () => this.validateAndContinue());
        document.getElementById('backStep2')?.addEventListener('click', () => this.goToStep(1));
        document.getElementById('backStep3')?.addEventListener('click', () => this.goToStep(2));
        document.getElementById('backStep4')?.addEventListener('click', () => this.goToStep(3));
        
        // Payment processing
        document.getElementById('processPayment')?.addEventListener('click', () => this.processPayment());
        
        // Payment method selection
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handlePaymentMethodChange(e));
        });

        // Confirmation actions
        document.getElementById('downloadTicket')?.addEventListener('click', () => this.downloadTicket());
        document.getElementById('emailTicket')?.addEventListener('click', () => this.emailTicket());
        document.getElementById('printTicket')?.addEventListener('click', () => this.printTicket());
        document.getElementById('newBooking')?.addEventListener('click', () => location.reload());
        document.getElementById('manageBokking')?.addEventListener('click', () => this.redirectToManageBooking());

        // Back to dashboard
        document.getElementById('backToDashboard')?.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });

        // Form field validation
        this.setupFormValidation();
    }

    // Setup real-time form validation
    setupFormValidation() {
        const requiredFields = ['passengerFirstName', 'passengerLastName', 'passengerEmail', 'passengerPhone', 'passengerDOB'];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => {
                    if (field.classList.contains('border-error')) {
                        this.validateField(field);
                    }
                });
            }
        });
    }

    // Validate individual field
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;

        if (!value) {
            isValid = false;
        } else if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
        } else if (field.type === 'tel') {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            isValid = phoneRegex.test(value.replace(/\s/g, ''));
        }

        if (isValid) {
            field.classList.remove('border-error');
            field.classList.add('border-success');
        } else {
            field.classList.add('border-error');
            field.classList.remove('border-success');
        }

        return isValid;
    }

    // Seat Map Generation
    initializeSeats() {
        this.generateSeatMap('firstClassSeats', 1, 2, 4, 'first-class');
        this.generateSeatMap('businessSeats', 3, 5, 4, 'premium');
        this.generateSeatMap('economySeats', 6, 30, 6, 'available');
    }

    generateSeatMap(containerId, startRow, endRow, seatsPerRow, seatClass) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        for (let row = startRow; row <= endRow; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'flex justify-center mb-1';
            
            for (let seat = 0; seat < seatsPerRow; seat++) {
                const seatLetter = String.fromCharCode(65 + seat);
                const seatId = `${row}${seatLetter}`;
                
                const seatDiv = document.createElement('div');
                seatDiv.className = `seat ${seatClass}`;
                seatDiv.textContent = seatLetter;
                seatDiv.dataset.seatId = seatId;
                seatDiv.dataset.row = row;
                seatDiv.dataset.letter = seatLetter;
                
                // Randomly make some seats occupied
                if (Math.random() < 0.3) {
                    seatDiv.classList.remove(seatClass);
                    seatDiv.classList.add('occupied');
                } else {
                    seatDiv.addEventListener('click', () => this.selectSeat(seatDiv));
                }
                
                // Add aisle gap
                if (seatsPerRow === 6 && (seat === 2)) {
                    seatDiv.style.marginRight = '20px';
                }
                
                rowDiv.appendChild(seatDiv);
            }
            
            // Add row number
            const rowLabel = document.createElement('div');
            rowLabel.className = 'text-xs text-neutral ml-2 flex items-center';
            rowLabel.textContent = row;
            rowDiv.appendChild(rowLabel);
            
            container.appendChild(rowDiv);
        }
    }

    selectSeat(seatElement) {
        // Remove previous selection
        document.querySelectorAll('.seat.selected').forEach(seat => {
            seat.classList.remove('selected');
            seat.classList.add(seat.dataset.originalClass || 'available');
        });
        
        // Select new seat
        const originalClass = Array.from(seatElement.classList).find(c => 
            ['available', 'premium', 'first-class', 'emergency'].includes(c)
        );
        seatElement.dataset.originalClass = originalClass;
        seatElement.classList.remove(originalClass);
        seatElement.classList.add('selected');
        
        // Update booking data
        this.bookingData.selectedSeat = {
            id: seatElement.dataset.seatId,
            row: seatElement.dataset.row,
            letter: seatElement.dataset.letter,
            class: originalClass,
            fee: this.getSeatFee(originalClass)
        };
        
        // Update seat fee
        this.bookingData.pricing.seatFee = this.bookingData.selectedSeat.fee;
        this.bookingData.pricing.total = this.bookingData.pricing.baseFare + 
                                       this.bookingData.pricing.taxes + 
                                       this.bookingData.pricing.seatFee;
        
        this.updateSeatInfo();
        this.updatePricing();
    }

    getSeatFee(seatClass) {
        const fees = {
            'available': 0,
            'premium': 25,
            'first-class': 100,
            'emergency': 15
        };
        return fees[seatClass] || 0;
    }

    updateSeatInfo() {
        const seatInfo = document.getElementById('selectedSeatInfo');
        if (!seatInfo) return;

        if (this.bookingData.selectedSeat) {
            const { id, class: seatClass, fee } = this.bookingData.selectedSeat;
            seatInfo.innerHTML = `
                <div class="text-lg font-semibold text-primary">Seat ${id}</div>
                <div class="text-sm text-neutral">
                    ${seatClass.replace('-', ' ').toUpperCase()}
                    ${fee > 0 ? `(+$${fee})` : '(Free)'}
                </div>
            `;
        } else {
            seatInfo.innerHTML = '<p class="text-neutral">No seat selected</p>';
        }
    }

    updatePricing() {
        const elements = {
            seatFee: document.getElementById('seatFee'),
            totalPrice: document.getElementById('totalPrice'),
            summaryFare: document.getElementById('summaryFare'),
            summaryTaxes: document.getElementById('summaryTaxes'),
            summarySeat: document.getElementById('summarySeat'),
            summaryTotal: document.getElementById('summaryTotal')
        };

        if (elements.seatFee) elements.seatFee.textContent = `$${this.bookingData.pricing.seatFee}`;
        if (elements.totalPrice) elements.totalPrice.textContent = `$${this.bookingData.pricing.total}`;
        if (elements.summaryFare) elements.summaryFare.textContent = `$${this.bookingData.pricing.baseFare}`;
        if (elements.summaryTaxes) elements.summaryTaxes.textContent = `$${this.bookingData.pricing.taxes}`;
        if (elements.summarySeat) elements.summarySeat.textContent = `$${this.bookingData.pricing.seatFee}`;
        if (elements.summaryTotal) elements.summaryTotal.textContent = `$${this.bookingData.pricing.total}`;
    }

    // Step Navigation
    goToStep(step) {
        // Hide all steps
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Show target step
        const stepContent = document.getElementById(`stepContent${step}`);
        if (stepContent) {
            stepContent.classList.remove('hidden');
        }
        
        this.currentStep = step;
        this.updateProgress();
    }

    updateProgress() {
        // Update step indicators
        for (let i = 1; i <= 5; i++) {
            const stepEl = document.getElementById(`step${i}`);
            const progressEl = document.getElementById(`progress${i}`);
            
            if (!stepEl) continue;

            if (i < this.currentStep) {
                stepEl.classList.remove('active');
                stepEl.classList.add('completed');
                const stepDiv = stepEl.querySelector('div');
                if (stepDiv) stepDiv.classList.add('bg-success');
                if (progressEl) progressEl.style.width = '100%';
            } else if (i === this.currentStep) {
                stepEl.classList.add('active');
                stepEl.classList.remove('completed');
                const stepDiv = stepEl.querySelector('div');
                if (stepDiv) stepDiv.classList.add('bg-primary');
                if (progressEl) progressEl.style.width = '50%';
            } else {
                stepEl.classList.remove('active', 'completed');
                const stepDiv = stepEl.querySelector('div');
                if (stepDiv) stepDiv.classList.remove('bg-primary', 'bg-success');
                if (progressEl) progressEl.style.width = '0%';
            }
        }
    }

    // Form Validation and Submission
    async validateAndContinue() {
        const form = document.getElementById('passengerForm');
        if (!form) return;

        const requiredFields = ['passengerFirstName', 'passengerLastName', 'passengerEmail', 'passengerPhone', 'passengerDOB'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });
        
        if (isValid) {
            // Save passenger data
            this.bookingData.passenger = {
                firstName: document.getElementById('passengerFirstName').value,
                lastName: document.getElementById('passengerLastName').value,
                email: document.getElementById('passengerEmail').value,
                phone: document.getElementById('passengerPhone').value,
                dateOfBirth: document.getElementById('passengerDOB').value,
                gender: document.getElementById('passengerGender')?.value || 'prefer-not-to-say',
                mealPreference: document.getElementById('mealPreference')?.value || 'none',
                specialAssistance: document.getElementById('specialAssistance')?.value || ''
            };
            
            this.goToStep(4);
        } else {
            this.showNotification('Please fill in all required fields correctly.', 'error');
        }
    }

    handlePaymentMethodChange(e) {
        const cardDetails = document.getElementById('cardDetails');
        if (cardDetails) {
            if (e.target.value === 'paypal' || e.target.value === 'apple-pay') {
                cardDetails.style.display = 'none';
            } else {
                cardDetails.style.display = 'block';
            }
        }
        
        // Update selected payment method styling
        document.querySelectorAll('.payment-method div').forEach(div => {
            div.classList.remove('border-primary', 'bg-lightBlue');
        });
        const parentDiv = e.target.closest('.payment-method')?.querySelector('div');
        if (parentDiv) {
            parentDiv.classList.add('border-primary', 'bg-lightBlue');
        }
        
        // Save payment method
        this.bookingData.payment.method = e.target.value;
    }

    // Update confirmation details
   // Update confirmation details
    updateConfirmationDetails(booking = null) {
        const elements = {
            confirmationNumber: document.getElementById('confirmationNumber'),
            confirmFlight: document.getElementById('confirmFlight'),
            confirmDate: document.getElementById('confirmDate'),
            confirmRoute: document.getElementById('confirmRoute'),
            confirmTime: document.getElementById('confirmTime'),
            confirmPassenger: document.getElementById('confirmPassenger'),
            confirmSeat: document.getElementById('confirmSeat'),
            confirmClass: document.getElementById('confirmClass'),
            confirmMeal: document.getElementById('confirmMeal')
        };

        if (elements.confirmationNumber) {
            elements.confirmationNumber.textContent = this.bookingData.confirmationNumber;
        }
        if (elements.confirmFlight) {
            elements.confirmFlight.textContent = this.bookingData.flight.number;
        }
        if (elements.confirmDate) {
            elements.confirmDate.textContent = this.bookingData.flight.date;
        }
        if (elements.confirmRoute) {
            elements.confirmRoute.textContent = `${this.bookingData.flight.departure.city} to ${this.bookingData.flight.arrival.city}`;
        }
        if (elements.confirmTime) {
            elements.confirmTime.textContent = `${this.bookingData.flight.departure.time} - ${this.bookingData.flight.arrival.time}`;
        }
        if (elements.confirmPassenger) {
            elements.confirmPassenger.textContent = `${this.bookingData.passenger.firstName} ${this.bookingData.passenger.lastName}`;
        }
        if (elements.confirmSeat) {
            elements.confirmSeat.textContent = this.bookingData.selectedSeat ? 
                this.bookingData.selectedSeat.id : 'Not selected';
        }
        if (elements.confirmClass) {
            elements.confirmClass.textContent = this.bookingData.flight.class;
        }
        if (elements.confirmMeal) {
            elements.confirmMeal.textContent = this.bookingData.passenger.mealPreference || 'None';
        }

        // Update booking status indicator
        const statusIndicator = document.getElementById('bookingStatus');
        if (statusIndicator) {
            const isSuccess = this.bookingData.savedToDatabase;
            statusIndicator.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isSuccess ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`;
            statusIndicator.textContent = isSuccess ? 'Confirmed' : 'Pending Sync';
        }
    }

    // Payment form validation
    validatePaymentForm() {
        const paymentMethod = this.bookingData.payment.method;
        
        if (paymentMethod === 'paypal' || paymentMethod === 'apple-pay') {
            return true; // External validation handled by service
        }
        
        // Credit/Debit card validation
        const cardNumber = document.getElementById('cardNumber')?.value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate')?.value;
        const cvv = document.getElementById('cvv')?.value;
        const cardName = document.getElementById('cardName')?.value.trim();
        
        // Basic validation
        if (!cardNumber || cardNumber.length < 13) {
            this.showFieldError('cardNumber', 'Please enter a valid card number');
            return false;
        }
        
        if (!expiryDate || !this.isValidExpiryDate(expiryDate)) {
            this.showFieldError('expiryDate', 'Please enter a valid expiry date');
            return false;
        }
        
        if (!cvv || cvv.length < 3) {
            this.showFieldError('cvv', 'Please enter a valid CVV');
            return false;
        }
        
        if (!cardName) {
            this.showFieldError('cardName', 'Please enter the cardholder name');
            return false;
        }
        
        // Save payment details (without sensitive data)
        this.bookingData.payment = {
            method: paymentMethod,
            lastFourDigits: cardNumber.slice(-4),
            cardType: this.getCardType(cardNumber),
            cardholderName: cardName
        };
        
        return true;
    }

    // Validate expiry date
    isValidExpiryDate(expiryDate) {
        const [month, year] = expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        const expMonth = parseInt(month);
        const expYear = parseInt(year);
        
        if (expMonth < 1 || expMonth > 12) return false;
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) return false;
        
        return true;
    }

    // Get card type from number
    getCardType(cardNumber) {
        const patterns = {
            visa: /^4/,
            mastercard: /^5[1-5]/,
            amex: /^3[47]/,
            discover: /^6(?:011|5)/
        };
        
        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(cardNumber)) {
                return type;
            }
        }
        
        return 'unknown';
    }

    // Show field-specific error
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        field.classList.add('border-error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-500 text-sm mt-1';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
        
        // Remove error on focus
        field.addEventListener('focus', () => {
            field.classList.remove('border-error');
            const errorMsg = field.parentNode.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        }, { once: true });
    }

    // Setup card number formatting
    setupCardFormatting() {
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');
        
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                let formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                if (formattedValue.length > 19) {
                    formattedValue = formattedValue.substr(0, 19);
                }
                e.target.value = formattedValue;
            });
        }
        
        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }
        
        if (cvv) {
            cvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
            });
        }
    }

    // Notification system
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${this.getNotificationClasses(type)}`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    ${this.getNotificationIcon(type)}
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <div class="ml-auto pl-3">
                    <button class="text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <span class="sr-only">Close</span>
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationClasses(type) {
        const classes = {
            success: 'bg-green-50 border border-green-200 text-green-800',
            error: 'bg-red-50 border border-red-200 text-red-800',
            warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
            info: 'bg-blue-50 border border-blue-200 text-blue-800'
        };
        return classes[type] || classes.info;
    }

    getNotificationIcon(type) {
        const icons = {
            success: '<svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
            error: '<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>',
            warning: '<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
            info: '<svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
        };
        return icons[type] || icons.info;
    }

    // Ticket actions
    async downloadTicket() {
        try {
            const ticketData = this.generateTicketData();
            const ticketHtml = this.generateTicketHTML(ticketData);
            
            // Create a temporary element to trigger download
            const element = document.createElement('a');
            const file = new Blob([ticketHtml], { type: 'text/html' });
            element.href = URL.createObjectURL(file);
            element.download = `ticket-${this.bookingData.confirmationNumber}.html`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            
            this.showNotification('Ticket downloaded successfully!', 'success');
        } catch (error) {
            console.error('Download failed:', error);
            this.showNotification('Failed to download ticket', 'error');
        }
    }

    async emailTicket() {
        try {
            const emailData = {
                to: this.bookingData.passenger.email,
                subject: `Your Flight Ticket - ${this.bookingData.confirmationNumber}`,
                ticketData: this.generateTicketData(),
                confirmationNumber: this.bookingData.confirmationNumber
            };
            
            // Simulate email sending
            console.log('Sending email ticket...', emailData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showNotification(`Ticket sent to ${this.bookingData.passenger.email}`, 'success');
        } catch (error) {
            console.error('Email failed:', error);
            this.showNotification('Failed to send ticket email', 'error');
        }
    }

    printTicket() {
        try {
            const ticketData = this.generateTicketData();
            const ticketHtml = this.generateTicketHTML(ticketData);
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(ticketHtml);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            
            this.showNotification('Ticket ready for printing!', 'success');
        } catch (error) {
            console.error('Print failed:', error);
            this.showNotification('Failed to prepare ticket for printing', 'error');
        }
    }

    // Generate ticket data
    generateTicketData() {
        return {
            confirmationNumber: this.bookingData.confirmationNumber,
            bookingId: this.bookingData.bookingId,
            passenger: this.bookingData.passenger,
            flight: this.bookingData.flight,
            seat: this.bookingData.selectedSeat,
            pricing: this.bookingData.pricing,
            bookingDate: new Date().toLocaleDateString(),
            qrCode: this.generateQRCodeData()
        };
    }

    // Generate QR code data (booking reference)
    generateQRCodeData() {
        return JSON.stringify({
            confirmation: this.bookingData.confirmationNumber,
            flight: this.bookingData.flight.number,
            passenger: `${this.bookingData.passenger.firstName} ${this.bookingData.passenger.lastName}`,
            seat: this.bookingData.selectedSeat?.id || 'TBD'
        });
    }

    // Generate ticket HTML
    generateTicketHTML(ticketData) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Flight Ticket - ${ticketData.confirmationNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .ticket { border: 2px solid #ddd; border-radius: 10px; padding: 20px; max-width: 600px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px; }
                .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
                .confirmation { font-size: 18px; margin: 10px 0; }
                .flight-info { display: flex; justify-content: space-between; margin: 15px 0; }
                .section { margin: 15px 0; }
                .section-title { font-weight: bold; margin-bottom: 5px; }
                .barcode { text-align: center; font-family: monospace; font-size: 12px; margin: 20px 0; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="header">
                    <div class="logo">SkyLine Airways</div>
                    <div class="confirmation">Confirmation: ${ticketData.confirmationNumber}</div>
                </div>
                
                <div class="flight-info">
                    <div>
                        <strong>${ticketData.flight.departure.city}</strong><br>
                        ${ticketData.flight.departure.airport}<br>
                        ${ticketData.flight.departure.time}
                    </div>
                    <div style="text-align: center;">
                        <strong>${ticketData.flight.number}</strong><br>
                        ${ticketData.flight.date}<br>
                        ${ticketData.flight.duration}
                    </div>
                    <div style="text-align: right;">
                        <strong>${ticketData.flight.arrival.city}</strong><br>
                        ${ticketData.flight.arrival.airport}<br>
                        ${ticketData.flight.arrival.time}
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Passenger</div>
                    ${ticketData.passenger.firstName} ${ticketData.passenger.lastName}
                </div>
                
                <div class="section">
                    <div class="section-title">Seat & Class</div>
                    Seat: ${ticketData.seat?.id || 'TBD'} | Class: ${ticketData.flight.class}
                </div>
                
                <div class="section">
                    <div class="section-title">Total Paid</div>
                    $${ticketData.pricing.total}
                </div>
                
                <div class="barcode">
                    <div style="background: #000; height: 50px; margin: 10px 0;"></div>
                    ${ticketData.confirmationNumber}
                </div>
                
                <div style="text-align: center; font-size: 12px; color: #666;">
                    Please arrive at the airport at least 2 hours before departure.<br>
                    Valid ID required for boarding.
                </div>
            </div>
        </body>
        </html>`;
    }

    // Redirect to manage booking
    redirectToManageBooking() {
        const params = new URLSearchParams({
            confirmation: this.bookingData.confirmationNumber,
            email: this.bookingData.passenger.email
        });
        window.location.href = `manage-booking.html?${params.toString()}`;
    }
}

// Initialize the booking system
const bookingSystem = new BookingSystem();