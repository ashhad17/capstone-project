const { body, param, query } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

// Auth validators
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('role')
    .optional()
    .isIn(['user', 'service_provider', 'admin'])
    .withMessage('Invalid role')
];

exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Car validators
exports.validateCar = [
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Invalid year'),
  
  body('make')
    .trim()
    .notEmpty()
    .withMessage('Make is required'),
  
  body('model')
    .trim()
    .notEmpty()
    .withMessage('Model is required'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('mileage')
    .notEmpty()
    .withMessage('Mileage is required')
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('condition')
    .isIn(['Excellent', 'Good', 'Fair', 'Poor'])
    .withMessage('Invalid condition value'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
];

exports.validateCarStatus = [
  body('status')
    .isIn(['active', 'sold', 'pending', 'draft'])
    .withMessage('Invalid status value')
];

// Service Provider validators
exports.validateServiceProvider = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('specialties')
    .isArray()
    .withMessage('Specialties must be an array')
    .notEmpty()
    .withMessage('At least one specialty is required'),
  
  body('services')
    .isArray()
    .withMessage('Services must be an array')
    .notEmpty()
    .withMessage('At least one service is required'),
  
  body('location')
    .isObject()
    .withMessage('Location must be an object')
    .custom((value) => {
      if (!value.address || !value.city || !value.state || !value.zipCode) {
        throw new Error('Location must include address, city, state, and zipCode');
      }
      return true;
    }),
  
  body('hours')
    .isObject()
    .withMessage('Hours must be an object'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be 10 digits'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
];

exports.validateServiceProviderStatus = [
  body('status')
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Invalid status value')
];

// Booking validators
exports.validateBooking = [
  body('serviceProvider')
    .notEmpty()
    .withMessage('Service provider ID is required')
    .isMongoId()
    .withMessage('Invalid service provider ID'),
  
  body('services')
    .isArray()
    .withMessage('Services must be an array')
    .notEmpty()
    .withMessage('At least one service is required'),
  
  body('services.*.name')
    .notEmpty()
    .withMessage('Service name is required'),
  
  body('services.*.price')
    .notEmpty()
    .withMessage('Service price is required')
    .isFloat({ min: 0 })
    .withMessage('Service price must be a positive number'),
  
  
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('time')
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/)
    .withMessage('Time must be in HH:MM AM/PM format'),
  
  body('totalPrice')
    .notEmpty()
    .withMessage('Total price is required')
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number'),
  
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Invalid status value')
];

// Notification validators
exports.validateNotification = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Description must be between 2 and 500 characters'),
  
  body('type')
    .isIn(['booking', 'message', 'system'])
    .withMessage('Invalid notification type')
];

// Error handling middleware
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }
  next();
}; 