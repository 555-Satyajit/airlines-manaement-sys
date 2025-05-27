// routes/aircraftRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllAircraft,
  getAircraft,
  createAircraft,
  updateAircraft,
  deleteAircraft,
  getAircraftMaintenanceSchedule
} = require('../controllers/aircraftController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protected routes (admin/staff only)
router.get('/', protect, authorize('admin', 'staff'), getAllAircraft);
router.get('/:id', protect, authorize('admin', 'staff'), getAircraft);
router.post('/', protect, authorize('admin'), createAircraft);
router.put('/:id', protect, authorize('admin'), updateAircraft);
router.delete('/:id', protect, authorize('admin'), deleteAircraft);
router.get('/:id/maintenance', protect, authorize('admin', 'staff'), getAircraftMaintenanceSchedule);

module.exports = router;