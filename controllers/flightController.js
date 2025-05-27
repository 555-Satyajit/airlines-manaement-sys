// controllers/flightController.js
const Flight = require('../models/Flight');
const Aircraft = require('../models/Aircraft');

// @desc    Get all flights
// @route   GET /api/flights
// @access  Public
const getAllFlights = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const flights = await Flight.find({})
      .populate('aircraft', 'registration model manufacturer')
      .skip(skip)
      .limit(limit)
      .sort({ departureTime: 1 });

    // Transform the data to match frontend expectations
    const transformedFlights = flights.map(flight => ({
      _id: flight._id,
      flightNumber: flight.flightNumber,
      origin: {
        code: flight.departureAirport.code,
        name: flight.departureAirport.name,
        city: flight.departureAirport.city,
        country: flight.departureAirport.country
      },
      destination: {
        code: flight.arrivalAirport.code,
        name: flight.arrivalAirport.name,
        city: flight.arrivalAirport.city,
        country: flight.arrivalAirport.country
      },
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      aircraft: flight.aircraft,
      price: flight.pricing,
      status: flight.status,
      gate: flight.gate,
      terminal: flight.terminal,
      createdAt: flight.createdAt,
      updatedAt: flight.updatedAt
    }));

    const total = await Flight.countDocuments();

    res.json({
      flights: transformedFlights,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalFlights: total
    });
  } catch (error) {
    console.error('Get all flights error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single flight
// @route   GET /api/flights/:id
// @access  Public
const getFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('aircraft', 'registration model manufacturer capacity');

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Transform the data to match frontend expectations
    const transformedFlight = {
      _id: flight._id,
      flightNumber: flight.flightNumber,
      origin: {
        code: flight.departureAirport.code,
        name: flight.departureAirport.name,
        city: flight.departureAirport.city,
        country: flight.departureAirport.country
      },
      destination: {
        code: flight.arrivalAirport.code,
        name: flight.arrivalAirport.name,
        city: flight.arrivalAirport.city,
        country: flight.arrivalAirport.country
      },
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      aircraft: flight.aircraft,
      price: flight.pricing,
      status: flight.status,
      gate: flight.gate,
      terminal: flight.terminal,
      createdAt: flight.createdAt,
      updatedAt: flight.updatedAt
    };

    res.json(transformedFlight);
  } catch (error) {
    console.error('Get flight error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create flight
// @route   POST /api/flights
// @access  Private/Admin/Staff
const createFlight = async (req, res) => {
  try {
    // Handle both data formats (frontend and direct API calls)
    let flightData = req.body;
    
    // If frontend sends origin/destination format, convert to departureAirport/arrivalAirport
    if (req.body.origin && req.body.destination) {
      flightData = {
        ...req.body,
        departureAirport: {
          code: req.body.origin.code,
          name: req.body.origin.name || `${req.body.origin.city} Airport`,
          city: req.body.origin.city,
          country: req.body.origin.country || 'Unknown'
        },
        arrivalAirport: {
          code: req.body.destination.code,
          name: req.body.destination.name || `${req.body.destination.city} Airport`,
          city: req.body.destination.city,
          country: req.body.destination.country || 'Unknown'
        }
      };
      
      // Remove the origin/destination fields to avoid confusion
      delete flightData.origin;
      delete flightData.destination;
    }

    // Handle pricing format conversion
    if (req.body.price && !req.body.pricing) {
      flightData.pricing = req.body.price;
      delete flightData.price;
    }

    const flight = await Flight.create(flightData);
    
    const populatedFlight = await Flight.findById(flight._id)
      .populate('aircraft', 'registration model manufacturer');

    // Transform response to match frontend expectations
    const transformedFlight = {
      _id: populatedFlight._id,
      flightNumber: populatedFlight.flightNumber,
      origin: {
        code: populatedFlight.departureAirport.code,
        name: populatedFlight.departureAirport.name,
        city: populatedFlight.departureAirport.city,
        country: populatedFlight.departureAirport.country
      },
      destination: {
        code: populatedFlight.arrivalAirport.code,
        name: populatedFlight.arrivalAirport.name,
        city: populatedFlight.arrivalAirport.city,
        country: populatedFlight.arrivalAirport.country
      },
      departureTime: populatedFlight.departureTime,
      arrivalTime: populatedFlight.arrivalTime,
      duration: populatedFlight.duration,
      aircraft: populatedFlight.aircraft,
      price: populatedFlight.pricing,
      status: populatedFlight.status,
      gate: populatedFlight.gate,
      terminal: populatedFlight.terminal,
      createdAt: populatedFlight.createdAt,
      updatedAt: populatedFlight.updatedAt
    };

    res.status(201).json(transformedFlight);
  } catch (error) {
    console.error('Create flight error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update flight
// @route   PUT /api/flights/:id
// @access  Private/Admin/Staff
const updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Handle data format conversion like in create
    let updateData = req.body;
    
    if (req.body.origin && req.body.destination) {
      updateData = {
        ...req.body,
        departureAirport: {
          code: req.body.origin.code,
          name: req.body.origin.name || `${req.body.origin.city} Airport`,
          city: req.body.origin.city,
          country: req.body.origin.country || 'Unknown'
        },
        arrivalAirport: {
          code: req.body.destination.code,
          name: req.body.destination.name || `${req.body.destination.city} Airport`,
          city: req.body.destination.city,
          country: req.body.destination.country || 'Unknown'
        }
      };
      
      delete updateData.origin;
      delete updateData.destination;
    }

    if (req.body.price && !req.body.pricing) {
      updateData.pricing = req.body.price;
      delete updateData.price;
    }

    const updatedFlight = await Flight.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('aircraft', 'registration model manufacturer');

    // Transform response
    const transformedFlight = {
      _id: updatedFlight._id,
      flightNumber: updatedFlight.flightNumber,
      origin: {
        code: updatedFlight.departureAirport.code,
        name: updatedFlight.departureAirport.name,
        city: updatedFlight.departureAirport.city,
        country: updatedFlight.departureAirport.country
      },
      destination: {
        code: updatedFlight.arrivalAirport.code,
        name: updatedFlight.arrivalAirport.name,
        city: updatedFlight.arrivalAirport.city,
        country: updatedFlight.arrivalAirport.country
      },
      departureTime: updatedFlight.departureTime,
      arrivalTime: updatedFlight.arrivalTime,
      duration: updatedFlight.duration,
      aircraft: updatedFlight.aircraft,
      price: updatedFlight.pricing,
      status: updatedFlight.status,
      gate: updatedFlight.gate,
      terminal: updatedFlight.terminal,
      createdAt: updatedFlight.createdAt,
      updatedAt: updatedFlight.updatedAt
    };

    res.json(transformedFlight);
  } catch (error) {
    console.error('Update flight error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete flight
// @route   DELETE /api/flights/:id
// @access  Private/Admin
const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    await Flight.findByIdAndDelete(req.params.id);
    res.json({ message: 'Flight removed' });
  } catch (error) {
    console.error('Delete flight error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Search flights
// @route   GET /api/flights/search
// @access  Public
const searchFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, passengers, class: seatClass } = req.query;

    let query = {};

    if (origin) {
      query['departureAirport.code'] = origin.toUpperCase();
    }

    if (destination) {
      query['arrivalAirport.code'] = destination.toUpperCase();
    }

    if (departureDate) {
      const startDate = new Date(departureDate);
      const endDate = new Date(departureDate);
      endDate.setDate(endDate.getDate() + 1);
      
      query.departureTime = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const flights = await Flight.find(query)
      .populate('aircraft', 'registration model manufacturer')
      .sort({ departureTime: 1 });

    // Transform results
    const transformedFlights = flights.map(flight => ({
      _id: flight._id,
      flightNumber: flight.flightNumber,
      origin: {
        code: flight.departureAirport.code,
        name: flight.departureAirport.name,
        city: flight.departureAirport.city,
        country: flight.departureAirport.country
      },
      destination: {
        code: flight.arrivalAirport.code,
        name: flight.arrivalAirport.name,
        city: flight.arrivalAirport.city,
        country: flight.arrivalAirport.country
      },
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      aircraft: flight.aircraft,
      price: flight.pricing,
      status: flight.status,
      gate: flight.gate,
      terminal: flight.terminal
    }));

    res.json(transformedFlights);
  } catch (error) {
    console.error('Search flights error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get flight availability
// @route   GET /api/flights/:id/availability
// @access  Public
const getFlightAvailability = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id).select('pricing status');

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    res.json({
      prices: flight.pricing,
      status: flight.status
    });
  } catch (error) {
    console.error('Get flight availability error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Seed flights for testing
// @route   POST /api/flights/seed
// @access  Private/Admin
const seedFlights = async (req, res) => {
  try {
    // Clear existing flights (optional - comment out if you don't want to clear)
    // await Flight.deleteMany({});

    const sampleFlights = [
      {
        flightNumber: 'SL101',
        aircraft: null, // You'll need to provide valid aircraft IDs
        departureAirport: {
          code: 'JFK',
          name: 'John F. Kennedy International Airport',
          city: 'New York',
          country: 'United States'
        },
        arrivalAirport: {
          code: 'LAX',
          name: 'Los Angeles International Airport',
          city: 'Los Angeles',
          country: 'United States'
        },
        departureTime: new Date('2025-05-23T08:30:00Z'),
        arrivalTime: new Date('2025-05-23T11:45:00Z'),
        duration: 315, // 5h 15m in minutes
        pricing: {
          economy: 299,
          premium: 599,
          business: 999,
          first: 1499
        },
        status: 'scheduled'
      },
      {
        flightNumber: 'SL102',
        aircraft: null,
        departureAirport: {
          code: 'LAX',
          name: 'Los Angeles International Airport',
          city: 'Los Angeles',
          country: 'United States'
        },
        arrivalAirport: {
          code: 'JFK',
          name: 'John F. Kennedy International Airport',
          city: 'New York',
          country: 'United States'
        },
        departureTime: new Date('2025-05-23T14:00:00Z'),
        arrivalTime: new Date('2025-05-23T22:30:00Z'),
        duration: 330, // 5h 30m in minutes
        pricing: {
          economy: 319,
          premium: 619,
          business: 1019,
          first: 1519
        },
        status: 'scheduled'
      }
    ];

    const createdFlights = await Flight.insertMany(sampleFlights);
    
    res.status(201).json({
      message: `${createdFlights.length} flights seeded successfully`,
      flights: createdFlights
    });
  } catch (error) {
    console.error('Seed flights error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllFlights,
  getFlight,
  createFlight,
  updateFlight,
  deleteFlight,
  searchFlights,
  getFlightAvailability,
  seedFlights
};