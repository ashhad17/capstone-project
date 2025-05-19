
# WheelsTrust Backend Implementation

This document provides implementation details for setting up the WheelsTrust backend using Express and MongoDB.

## Tech Stack

- **Node.js**: Runtime environment
- **Express**: Web framework
- **MongoDB**: Database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication
- **bcrypt**: Password hashing
- **multer**: File uploads
- **express-validator**: Request validation
- **cors**: Cross-Origin Resource Sharing
- **dotenv**: Environment variables
- **winston**: Logging

## Project Structure

```
├── config/
│   ├── db.js                # Database connection
│   ├── environment.js       # Environment variables
│   └── logger.js            # Logging configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── carController.js     # Car listings
│   ├── serviceController.js # Service providers
│   ├── bookingController.js # Service bookings
│   └── notificationController.js
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   ├── error.js             # Error handling middleware
│   ├── validate.js          # Input validation middleware
│   ├── upload.js            # File upload middleware
│   └── rateLimiter.js       # Rate limiting
├── models/
│   ├── User.js              # User schema
│   ├── Car.js               # Car listing schema
│   ├── ServiceProvider.js   # Service provider schema
│   ├── Service.js           # Service schema
│   ├── Booking.js           # Booking schema
│   └── Notification.js      # Notification schema
├── routes/
│   ├── auth.js              # Auth routes
│   ├── users.js             # User routes
│   ├── cars.js              # Car routes
│   ├── services.js          # Service provider routes
│   ├── bookings.js          # Booking routes
│   └── notifications.js     # Notification routes
├── utils/
│   ├── jwtHelper.js         # JWT generation and verification
│   ├── validators.js        # Custom validators
│   └── helpers.js           # Helper functions
├── app.js                   # Express app setup
├── server.js                # Entry point
└── package.json             # Dependencies
```

## Installation & Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following variables:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wheelstrust
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
UPLOAD_PATH=./uploads
```

4. Start the server:

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## Key Models

### User Model

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'service_provider', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'inactive'],
    default: 'active'
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### Car Listing Model

```javascript
// models/Car.js
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  mileage: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'pending', 'draft'],
    default: 'active'
  },
  features: [String],
  images: [String],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Set updatedAt on save
carSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Car', carSchema);
```

## Authentication Implementation

```javascript
// controllers/authController.js
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('../utils/jwtHelper');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  // Create token
  const token = jwt.generateToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    token
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Create token
  const token = jwt.generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  });
});

// @desc    Log user out / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  // In a real implementation, you might blacklist the token
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});
```

## Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/environment');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
```

## Example Car Controller Implementation

```javascript
// controllers/carController.js
const Car = require('../models/Car');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all car listings
// @route   GET /api/v1/cars
// @access  Public
exports.getCars = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Car.find(JSON.parse(queryStr)).populate({
    path: 'seller',
    select: 'name'
  });

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Car.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const cars = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    data: {
      cars,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    }
  });
});

// @desc    Get single car listing
// @route   GET /api/v1/cars/:id
// @access  Public
exports.getCar = asyncHandler(async (req, res, next) => {
  const car = await Car.findById(req.params.id).populate({
    path: 'seller',
    select: 'name phone email'
  });

  if (!car) {
    return next(
      new ErrorResponse(`Car not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: car
  });
});

// @desc    Create new car listing
// @route   POST /api/v1/cars
// @access  Private
exports.createCar = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.seller = req.user.id;

  // Create title from year, make, model
  const { year, make, model } = req.body;
  req.body.title = `${year} ${make} ${model}`;

  const car = await Car.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Car listing created successfully',
    data: car
  });
});

// @desc    Update car listing
// @route   PUT /api/v1/cars/:id
// @access  Private
exports.updateCar = asyncHandler(async (req, res, next) => {
  let car = await Car.findById(req.params.id);

  if (!car) {
    return next(
      new ErrorResponse(`Car not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is car owner or admin
  if (car.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this listing`,
        403
      )
    );
  }

  car = await Car.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Car listing updated successfully',
    data: car
  });
});

// @desc    Delete car listing
// @route   DELETE /api/v1/cars/:id
// @access  Private
exports.deleteCar = asyncHandler(async (req, res, next) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return next(
      new ErrorResponse(`Car not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is car owner or admin
  if (car.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this listing`,
        403
      )
    );
  }

  await car.remove();

  res.status(200).json({
    success: true,
    message: 'Car listing deleted successfully'
  });
});

// @desc    Update car status
// @route   PATCH /api/v1/cars/:id/status
// @access  Private
exports.updateCarStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['active', 'sold', 'pending', 'draft'].includes(status)) {
    return next(new ErrorResponse('Invalid status value', 400));
  }

  let car = await Car.findById(req.params.id);

  if (!car) {
    return next(
      new ErrorResponse(`Car not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is car owner or admin
  if (car.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this listing`,
        403
      )
    );
  }

  car = await Car.findByIdAndUpdate(
    req.params.id,
    { status, updatedAt: Date.now() },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Car listing status updated successfully',
    data: {
      id: car._id,
      title: car.title,
      status: car.status,
      updatedAt: car.updatedAt
    }
  });
});
```

## Setting Up Routes

```javascript
// routes/cars.js
const express = require('express');
const {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  updateCarStatus
} = require('../controllers/carController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const carValidator = require('../middleware/validators/carValidator');
const fileUpload = require('../middleware/upload');

router
  .route('/')
  .get(getCars)
  .post(
    protect,
    authorize('user', 'admin'),
    fileUpload.array('images', 10),
    carValidator.validateCreateCar,
    createCar
  );

router
  .route('/:id')
  .get(getCar)
  .put(
    protect,
    authorize('user', 'admin'),
    fileUpload.array('images', 10),
    carValidator.validateUpdateCar,
    updateCar
  )
  .delete(protect, authorize('user', 'admin'), deleteCar);

router
  .route('/:id/status')
  .patch(
    protect,
    authorize('user', 'admin'),
    carValidator.validateUpdateStatus,
    updateCarStatus
  );

module.exports = router;
```

## Main App Setup

```javascript
// app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const logger = require('./config/logger');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const cars = require('./routes/cars');
const serviceProviders = require('./routes/services');
const bookings = require('./routes/bookings');
const notifications = require('./routes/notifications');

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
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/cars', cars);
app.use('/api/v1/service-providers', serviceProviders);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/notifications', notifications);

// Error handler middleware - should be after routes
app.use(errorHandler);

module.exports = app;
```

## Server Setup

```javascript
// server.js
const app = require('./app');
const { PORT, NODE_ENV } = require('./config/environment');
const logger = require('./config/logger');

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
```

## Frontend Integration

To integrate the backend with the React frontend:

1. **Install Axios**

```bash
npm install axios
```

2. **Create API Services**

```javascript
// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

3. **Create Service Modules**

```javascript
// src/services/auth.service.js
import api from './api';

export const login = async (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const register = async (name, email, password, role = 'user') => {
  return api.post('/auth/register', { name, email, password, role });
};

export const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return api.post('/auth/logout');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
```

```javascript
// src/services/car.service.js
import api from './api';

export const getCars = async (queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  return api.get(`/cars?${queryString}`);
};

export const getCarById = async (id) => {
  return api.get(`/cars/${id}`);
};

export const createCar = async (carData) => {
  // If car has images, use FormData to handle multipart/form-data
  if (carData.images && carData.images.length) {
    const formData = new FormData();
    
    // Append all car data fields
    Object.keys(carData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, carData[key]);
      }
    });
    
    // Append all images
    carData.images.forEach(image => {
      formData.append('images', image);
    });
    
    return api.post('/cars', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  
  // If no images, use regular JSON
  return api.post('/cars', carData);
};

export const updateCar = async (id, carData) => {
  // Similar to createCar, handle formData if there are images
  if (carData.images && carData.images.some(img => img instanceof File)) {
    const formData = new FormData();
    
    Object.keys(carData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, carData[key]);
      }
    });
    
    carData.images.forEach(image => {
      if (image instanceof File) {
        formData.append('images', image);
      } else {
        formData.append('existingImages', image);
      }
    });
    
    return api.put(`/cars/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  
  return api.put(`/cars/${id}`, carData);
};

export const updateCarStatus = async (id, status) => {
  return api.patch(`/cars/${id}/status`, { status });
};

export const deleteCar = async (id) => {
  return api.delete(`/cars/${id}`);
};
```

4. **Using Services in Components**

```javascript
// Example: Using auth service in a login component
import React, { useState } from 'react';
import { login } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await login(email, password);
      
      // Store token and user in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Redirect to dashboard based on role
      if (response.data.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (response.data.role === 'service_provider') {
        navigate('/service-provider-dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
```

```javascript
// Example: Using car service in a car listing component
import React, { useEffect, useState } from 'react';
import { getCars } from '../services/car.service';

const CarListings = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await getCars();
        setCars(response.data.cars);
      } catch (err) {
        setError('Failed to fetch cars');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Car Listings</h2>
      <div className="car-list">
        {cars.map(car => (
          <div key={car.id} className="car-card">
            {car.images && car.images.length > 0 && (
              <img src={car.images[0]} alt={car.title} />
            )}
            <h3>{car.title}</h3>
            <p>Price: ${Number(car.price).toLocaleString()}</p>
            <p>Mileage: {Number(car.mileage).toLocaleString()} miles</p>
            <p>Condition: {car.condition}</p>
            <button>View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarListings;
```

## Deployment Considerations

1. **Environment Setup**
   - Use environment variables for sensitive information
   - Set NODE_ENV to 'production' in production environment

2. **Database**
   - Use MongoDB Atlas for cloud hosting
   - Set up proper database indexes for performance
   - Configure connection pooling appropriately

3. **Security**
   - Ensure all security middleware is enabled in production
   - Implement proper CORS settings
   - Set up HTTPS
   - Use secure HTTP headers

4. **Scaling**
   - Consider implementing caching with Redis
   - Use a load balancer for multiple instances
   - Implement database sharding for large datasets

5. **Monitoring**
   - Set up logging with a service like Winston + Loggly
   - Implement performance monitoring
   - Set up alerts for errors and system issues

## Conclusion

This backend implementation provides a robust, secure, and scalable foundation for the WheelsTrust application. The modular architecture allows for easy maintenance and future expansion of features.

For questions or further assistance with implementation, please contact the development team.
