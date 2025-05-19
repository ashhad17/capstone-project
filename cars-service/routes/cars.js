const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  updateCarStatus,
  getCarsBySellerId,
  scheduleTestDrive
} = require('../controllers/carController');
const { validateCar, validateCarStatus, handleValidationErrors } = require('../middleware/validate');
const upload = require('../middleware/upload');

// @route   GET /api/v1/cars
// @desc    Get all cars
// @access  Public
router.get('/', getCars);


router.post('/:id/testdrive', scheduleTestDrive);

// @route   GET /api/v1/cars/:id
// @desc    Get single car
// @access  Public
router.get('/:id', getCar);

// @route   POST /api/v1/cars
// @desc    Create new car
// @access  Private
router.post('/', protect, authorize('user', 'admin','service_provider'), upload.array('images', 5), validateCar, handleValidationErrors, createCar);

// @route   PUT /api/v1/cars/:id
// @desc    Update car
// @access  Private
router.put('/:id', protect, authorize('user', 'admin'), upload.array('images', 5), validateCar, handleValidationErrors, updateCar);

// @route   DELETE /api/v1/cars/:id
// @desc    Delete car
// @access  Private
router.delete('/:id', protect, authorize('user', 'admin'), deleteCar);

//rotes to get cars by seller id
router.get('/seller/:id', protect, authorize('user', 'admin'), getCarsBySellerId);

// @route   PATCH /api/v1/cars/:id/status
// @desc    Update car status
// @access  Private
router.patch('/:id/status', protect, authorize('user', 'admin'), validateCarStatus, handleValidationErrors, updateCarStatus);

module.exports = router; 