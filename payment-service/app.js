const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middleware/error');

const payments = require('./routes/paymentRoutes');
// import * as cloudinary from 'cloudinary';
const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security middleware
app.use(helmet()); // Set security headers
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP param pollution
app.use(cors()); // Enable CORS

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      details: 'Rate limit: 100 requests per minute'
    }
  },
  headers: true
});
app.use(limiter);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/payments', payments); 

// Error handler middleware - should be after routes
app.use(errorHandler);

module.exports = app; 