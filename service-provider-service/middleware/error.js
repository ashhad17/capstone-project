const logger = require('../config/logger');
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log full error
  logger.error(err.stack || err.message || err);

  // Handle specific errors
  if (err.name === 'CastError') {
    error = new ErrorResponse('Resource not found', 404);
  }

  if (err.code === 11000) {
    error = new ErrorResponse('Duplicate field value entered', 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      code: error.code || 'SERVER_ERROR',
      message: error.message || 'Server Error',
      details: error.details || 'An unexpected error occurred'
    }
  });
};

module.exports = errorHandler;
