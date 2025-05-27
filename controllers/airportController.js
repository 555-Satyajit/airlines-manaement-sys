// controllers/airportController.js
const Airport = require('../models/Airport');

// @desc    Get all airports
// @route   GET /api/airports
// @access  Public
const getAllAirports = async (req, res) => {
  try {
    const airports = await Airport.find({ isActive: true })
      .select('code name city country')
      .sort({ name: 1 });

    res.json(airports);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single airport
// @route   GET /api/airports/:id
// @access  Public
const getAirport = async (req, res) => {
  try {
    const airport = await Airport.findById(req.params.id);

    if (!airport) {
      return res.status(404).json({ message: 'Airport not found' });
    }

    res.json(airport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create airport
// @route   POST /api/airports
// @access  Private/Admin
const createAirport = async (req, res) => {
  try {
    const airport = await Airport.create(req.body);
    res.status(201).json(airport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update airport
// @route   PUT /api/airports/:id
// @access  Private/Admin
const updateAirport = async (req, res) => {
  try {
    const airport = await Airport.findById(req.params.id);

    if (!airport) {
      return res.status(404).json({ message: 'Airport not found' });
    }

    const updatedAirport = await Airport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedAirport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete airport
// @route   DELETE /api/airports/:id
// @access  Private/Admin
const deleteAirport = async (req, res) => {
  try {
    const airport = await Airport.findById(req.params.id);

    if (!airport) {
      return res.status(404).json({ message: 'Airport not found' });
    }

    await Airport.findByIdAndDelete(req.params.id);
    res.json({ message: 'Airport removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Search airports
// @route   GET /api/airports/search
// @access  Public
const searchAirports = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const airports = await Airport.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { code: new RegExp(q, 'i') },
            { name: new RegExp(q, 'i') },
            { city: new RegExp(q, 'i') },
            { country: new RegExp(q, 'i') }
          ]
        }
      ]
    })
      .select('code name city country')
      .limit(10);

    res.json(airports);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllAirports,
  getAirport,
  createAirport,
  updateAirport,
  deleteAirport,
  searchAirports
};