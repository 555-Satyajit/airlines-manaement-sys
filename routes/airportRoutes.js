// routes/airportRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllAirports,
  getAirport,
  createAirport,
  updateAirport,
  deleteAirport,
  searchAirports
} = require('../controllers/airportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllAirports);
router.get('/search', searchAirports);
router.get('/:id', getAirport);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createAirport);
router.put('/:id', protect, authorize('admin'), updateAirport);
router.delete('/:id', protect, authorize('admin'), deleteAirport);

module.exports = router;

