// routes/bookingRoutes.js - Simple booking API routes

const express = require('express');
const router = express.Router();

// You'll need to import your Booking model
const Booking = require('../models/Booking');

// For demo purposes, we'll use sample data
const sampleBookings = [
    {
        _id: '1',
        confirmationNumber: 'SL123456',
        passenger: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@email.com',
            phone: '+1234567890'
        },
        flightDetails: {
            flightNumber: 'SL101',
            airline: 'SkyLine Airlines',
            from: 'JFK',
            to: 'LAX',
            departureDate: '2024-06-15',
            departureTime: '08:30',
            arrivalTime: '11:45',
            class: 'Economy',
            seat: '14A'
        },
        bookingDate: '2024-05-20T10:30:00Z',
        status: 'confirmed',
        totalPrice: 299.99
    },
    {
        _id: '2',
        confirmationNumber: 'SL789012',
        passenger: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@email.com',
            phone: '+1987654321'
        },
        flightDetails: {
            flightNumber: 'SL205',
            airline: 'SkyLine Airlines',
            from: 'ORD',
            to: 'DEN',
            departureDate: '2024-06-22',
            departureTime: '14:15',
            arrivalTime: '16:30',
            class: 'Business',
            seat: '3B'
        },
        bookingDate: '2024-05-18T15:45:00Z',
        status: 'confirmed',
        totalPrice: 599.99
    }
];

// GET /api/bookings - Get all bookings
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching all bookings...');
        
        // If using MongoDB/Mongoose:
        // const bookings = await Booking.find().sort({ bookingDate: -1 });
        
        // For demo, return sample data
        const bookings = sampleBookings;
        
        res.json({
            success: true,
            count: bookings.length,
            bookings: bookings
        });
        
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings',
            message: error.message
        });
    }
});

// GET /api/bookings/:id - Get specific booking
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📋 Fetching booking with ID: ${id}`);
        
        // If using MongoDB/Mongoose:
        // const booking = await Booking.findById(id);
        
        // For demo, find in sample data
        const booking = sampleBookings.find(b => b._id === id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        res.json({
            success: true,
            booking: booking
        });
        
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch booking',
            message: error.message
        });
    }
});

// POST /api/bookings - Create new booking
router.post('/', async (req, res) => {
    try {
        const bookingData = req.body;
        console.log('📋 Creating new booking:', bookingData);
        
        // Validate required fields
        if (!bookingData.passenger || !bookingData.flightDetails) {
            return res.status(400).json({
                success: false,
                error: 'Missing required booking data'
            });
        }
        
        // Generate confirmation number
        const confirmationNumber = 'SL' + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        // Create booking object
        const newBooking = {
            _id: Date.now().toString(), // Simple ID for demo
            confirmationNumber,
            passenger: bookingData.passenger,
            flightDetails: bookingData.flightDetails,
            bookingDate: new Date().toISOString(),
            status: 'confirmed',
            totalPrice: bookingData.totalPrice || 0
        };
        
        // If using MongoDB/Mongoose:
        // const booking = new Booking(newBooking);
        // const savedBooking = await booking.save();
        
        // For demo, add to sample array
        sampleBookings.push(newBooking);
        
        res.status(201).json({
            success: true,
            booking: newBooking,
            confirmationNumber: confirmationNumber
        });
        
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create booking',
            message: error.message
        });
    }
});

// PUT /api/bookings/:id - Update booking
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        console.log(`📋 Updating booking ${id}:`, updateData);
        
        // If using MongoDB/Mongoose:
        // const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });
        
        // For demo, find and update in sample data
        const bookingIndex = sampleBookings.findIndex(b => b._id === id);
        
        if (bookingIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        sampleBookings[bookingIndex] = { ...sampleBookings[bookingIndex], ...updateData };
        
        res.json({
            success: true,
            booking: sampleBookings[bookingIndex]
        });
        
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update booking',
            message: error.message
        });
    }
});

// DELETE /api/bookings/:id - Cancel booking
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📋 Cancelling booking with ID: ${id}`);
        
        // If using MongoDB/Mongoose:
        // const booking = await Booking.findByIdAndUpdate(
        //     id, 
        //     { status: 'cancelled', cancelledDate: new Date() },
        //     { new: true }
        // );
        
        // For demo, find and update status in sample data
        const bookingIndex = sampleBookings.findIndex(b => b._id === id);
        
        if (bookingIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        sampleBookings[bookingIndex].status = 'cancelled';
        sampleBookings[bookingIndex].cancelledDate = new Date().toISOString();
        
        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            booking: sampleBookings[bookingIndex]
        });
        
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel booking',
            message: error.message
        });
    }
});

// GET /api/bookings/confirmation/:confirmationNumber - Get booking by confirmation number
router.get('/confirmation/:confirmationNumber', async (req, res) => {
    try {
        const { confirmationNumber } = req.params;
        console.log(`📋 Fetching booking with confirmation: ${confirmationNumber}`);
        
        // If using MongoDB/Mongoose:
        // const booking = await Booking.findOne({ confirmationNumber });
        
        // For demo, find in sample data
        const booking = sampleBookings.find(b => b.confirmationNumber === confirmationNumber);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        res.json({
            success: true,
            booking: booking
        });
        
    } catch (error) {
        console.error('Error fetching booking by confirmation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch booking',
            message: error.message
        });
    }
});

// GET /api/bookings/passenger/:email - Get bookings by passenger email
router.get('/passenger/:email', async (req, res) => {
    try {
        const { email } = req.params;
        console.log(`📋 Fetching bookings for passenger: ${email}`);
        
        // If using MongoDB/Mongoose:
        // const bookings = await Booking.find({ 'passenger.email': email }).sort({ bookingDate: -1 });
        
        // For demo, filter sample data
        const bookings = sampleBookings.filter(b => 
            b.passenger.email.toLowerCase() === email.toLowerCase()
        );
        
        res.json({
            success: true,
            count: bookings.length,
            bookings: bookings
        });
        
    } catch (error) {
        console.error('Error fetching passenger bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch passenger bookings',
            message: error.message
        });
    }
});

module.exports = router;