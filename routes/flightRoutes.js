
// routes/flightRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllFlights,
  getFlight,
  createFlight,
  updateFlight,
  deleteFlight,
  searchFlights,
  getFlightAvailability
} = require('../controllers/flightController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllFlights);
router.get('/search', searchFlights);
router.get('/:id', getFlight);
router.get('/:id/availability', getFlightAvailability);

// Protected routes (admin/staff only)
router.post('/', protect, authorize('admin', 'staff'), createFlight);
router.put('/:id', protect, authorize('admin', 'staff'), updateFlight);
router.delete('/:id', protect, authorize('admin'), deleteFlight);

module.exports = router;
