// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRevenueReport,
  getBookingReport,
  getFlightReport,
  getUserReport,
  exportData
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes are protected
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/bookings', getBookingReport);
router.get('/reports/flights', getFlightReport);
router.get('/reports/users', getUserReport);
router.get('/export/:type', exportData);

module.exports = router;
