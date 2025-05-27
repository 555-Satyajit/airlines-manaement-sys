// controllers/bookingController.js
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin/Staff
const getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({})
      .populate('user', 'firstName lastName email')
      .populate({
        path: 'flight',
        populate: {
          path: 'origin destination',
          select: 'code name city'
        }
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments();

    res.json({
      bookings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBookings: total
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate({
        path: 'flight',
        populate: {
          path: 'origin destination aircraft',
          select: 'code name city country registration model'
        }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin/staff
    if (booking.user._id.toString() !== req.user._id.toString() && 
        !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to access this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Public (No authentication required)
const createBooking = async (req, res) => {
  try {
    const { flightId, passengers, paymentMethod, userEmail } = req.body;

    // Get flight details
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Check seat availability
    const seatClass = passengers[0].seatClass;
    if (flight.availableSeats[seatClass] < passengers.length) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    // Calculate total amount
    const pricePerSeat = flight.price[seatClass];
    const totalAmount = pricePerSeat * passengers.length;

    // Create booking without user reference
    const booking = await Booking.create({
      flight: flightId,
      passengers,
      totalAmount,
      paymentMethod,
      paymentStatus: 'paid', // In real app, integrate with payment gateway
      loyaltyPointsEarned: Math.floor(totalAmount * 0.1), // 10% of amount as points
      guestEmail: userEmail // Store email for guest bookings
    });

    // Update flight availability
    flight.availableSeats[seatClass] -= passengers.length;
    await flight.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'flight',
        populate: {
          path: 'origin destination',
          select: 'code name city'
        }
      });

    // Send confirmation email
    try {
      await sendEmail({
        email: userEmail,
        subject: 'Booking Confirmation - SkyLine Airlines',
        message: `Your booking has been confirmed. Booking Reference: ${booking.bookingReference}`
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin/staff
    if (booking.user.toString() !== req.user._id.toString() && 
        !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'flight',
        populate: {
          path: 'origin destination',
          select: 'code name city'
        }
      });

    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('flight');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin/staff
    if (booking.user.toString() !== req.user._id.toString() && 
        !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Update booking status
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User requested cancellation';
    
    // Calculate refund (simple logic - 50% refund if cancelled 24h before departure)
    const hoursUntilDeparture = (booking.flight.departureTime - new Date()) / (1000 * 60 * 60);
    if (hoursUntilDeparture >= 24) {
      booking.refundAmount = booking.totalAmount * 0.5;
      booking.paymentStatus = 'refunded';
    }

    await booking.save();

    // Restore seat availability
    const seatClass = booking.passengers[0].seatClass;
    await Flight.findByIdAndUpdate(booking.flight._id, {
      $inc: { [`availableSeats.${seatClass}`]: booking.passengers.length }
    });

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Check in for flight
// @route   PUT /api/bookings/:id/checkin
// @access  Private
const checkIn = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.checkInStatus = 'checked_in';
    await booking.save();

    res.json({ message: 'Check-in successful', booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// @desc    Email ticket to passenger
// @route   POST /api/bookings/:id/email-ticket
// @access  Private
const emailTicket = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('flight');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Send email with ticket details
    await sendEmail({
      email: booking.passenger.email,
      subject: 'Your Boarding Pass - SkyLine Airlines',
      message: `Your boarding pass for flight ${booking.flight.flightNumber}`
    });

    res.json({ message: 'Boarding pass sent successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// @desc    Get booking by reference
// @route   GET /api/bookings/reference/:reference
// @access  Public
const getBookingByReference = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingReference: req.params.reference.toUpperCase() })
      .populate('user', 'firstName lastName email')
      .populate({
        path: 'flight',
        populate: {
          path: 'origin destination',
          select: 'code name city'
        }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  checkIn,
  getBookingByReference
};