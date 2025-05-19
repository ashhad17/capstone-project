const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
  getProviderBookings,
  checkAvailability,
  changeBookingStatus
} = require('../controllers/bookingController');
const { validateBooking, validateBookingStatus, handleValidationErrors } = require('../middleware/validate');

// @route   GET /api/v1/bookings
// @desc    Get all bookings
// @access  Private
router.get('/', protect, getBookings);

// @route   GET /api/v1/bookings/provider
// @desc    Get bookings for a service provider
// @access  Private
router.get('/provider/:id', protect, authorize('service_provider','admin'), getProviderBookings);

// @route   GET /api/v1/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, getBooking);

// @route   PATCH /api/v1/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.patch('/:id/status', protect, changeBookingStatus);

// @route   POST /api/v1/bookings
// @desc    Create new booking
// @access  Private
router.post('/', protect, validateBooking, handleValidationErrors, createBooking);

// @route   PUT /api/v1/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', protect, validateBooking, handleValidationErrors, updateBooking);

// @route   DELETE /api/v1/bookings/:id
// @desc    Delete booking
// @access  Private
router.delete('/:id', protect, deleteBooking);

// @route   PATCH /api/v1/bookings/:id/status
// @desc    Update booking status
// @access  Private
// router.patch('/:id/status', protect, validateBookingStatus, handleValidationErrors, updateBookingStatus);

// @route   GET /api/v1/bookings/check-availability/:id
// @desc    Check availability for a service provider
// @access  Private
router.get('/check-availability/:id', protect, checkAvailability);

module.exports = router; 