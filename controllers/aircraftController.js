// controllers/aircraftController.js
const Aircraft = require('../models/Aircraft');

// @desc    Get all aircraft
// @route   GET /api/aircraft
// @access  Private/Admin/Staff
const getAllAircraft = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const aircraft = await Aircraft.find({})
      .skip(skip)
      .limit(limit)
      .sort({ registration: 1 });

    const total = await Aircraft.countDocuments();

    res.json({
      aircraft,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalAircraft: total
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single aircraft
// @route   GET /api/aircraft/:id
// @access  Private/Admin/Staff
const getAircraft = async (req, res) => {
  try {
    const aircraft = await Aircraft.findById(req.params.id);

    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }

    res.json(aircraft);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create aircraft
// @route   POST /api/aircraft
// @access  Private/Admin
const createAircraft = async (req, res) => {
  try {
    const aircraft = await Aircraft.create(req.body);
    res.status(201).json(aircraft);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update aircraft
// @route   PUT /api/aircraft/:id
// @access  Private/Admin
const updateAircraft = async (req, res) => {
  try {
    const aircraft = await Aircraft.findById(req.params.id);

    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }

    const updatedAircraft = await Aircraft.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedAircraft);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete aircraft
// @route   DELETE /api/aircraft/:id
// @access  Private/Admin
const deleteAircraft = async (req, res) => {
  try {
    const aircraft = await Aircraft.findById(req.params.id);

    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }

    await Aircraft.findByIdAndDelete(req.params.id);
    res.json({ message: 'Aircraft removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get aircraft maintenance schedule
// @route   GET /api/aircraft/:id/maintenance
// @access  Private/Admin/Staff
const getAircraftMaintenanceSchedule = async (req, res) => {
  try {
    const aircraft = await Aircraft.findById(req.params.id);

    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }

    const maintenanceInfo = {
      registration: aircraft.registration,
      lastMaintenance: aircraft.lastMaintenance,
      nextMaintenance: aircraft.nextMaintenance,
      status: aircraft.status,
      daysSinceLastMaintenance: aircraft.lastMaintenance 
        ? Math.floor((new Date() - aircraft.lastMaintenance) / (1000 * 60 * 60 * 24))
        : null,
      daysUntilNextMaintenance: aircraft.nextMaintenance
        ? Math.floor((aircraft.nextMaintenance - new Date()) / (1000 * 60 * 60 * 24))
        : null
    };

    res.json(maintenanceInfo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllAircraft,
  getAircraft,
  createAircraft,
  updateAircraft,
  deleteAircraft,
  getAircraftMaintenanceSchedule
};

