// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserBookings,
  updateUserPreferences
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Admin only routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin', 'staff'), getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

// User routes
router.get('/bookings/my', protect, getUserBookings);
router.put('/preferences', protect, updateUserPreferences);

module.exports = router;