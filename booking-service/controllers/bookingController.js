const Booking = require('../models/Booking');
const ErrorResponse = require('../utils/errorResponse');
const {sendMail} = require('../utils/mailer');
const Notification = require('../models/Notification');
const ServiceProvider = require('../models/ServiceProvider');
// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
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
    let query = Booking.find(JSON.parse(queryStr))
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'serviceProvider',
        select: 'name email'
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
    const total = await Booking.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const bookings = await query;

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
        bookings,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
          limit
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
    .populate('serviceProvider', 'name email phone') // Populate serviceProvider with specific fields
    .populate('user', 'name email') // Populate user with specific fields
    .populate('services'); // Populate services if needed


    if (!booking) {
      return next(
        new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is booking owner, service provider, or admin
    if (
      booking.user._id.toString() !== req.user.id &&
      booking.serviceProvider._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view this booking`,
          403
        )
      );
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    console.log('=== Booking Creation Debug ===');
    console.log('1. Received booking request:', JSON.stringify(req.body, null, 2));

    // Add user to req.body
    req.body.user = req.user.id;

    // Validate serviceProvider
    const serviceProvider = await ServiceProvider.findById(req.body.serviceProvider);
    if (!serviceProvider) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service provider',
      });
    }

    // Validate required fields
    const requiredFields = ['serviceProvider', 'services', 'date', 'time', 'totalPrice'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`,
        });
      }
    }

    // Create the booking
    const booking = await Booking.create(req.body);

    // Send email to service provider
    const providerEmailText = `
    A new booking has been created for your services:
    - Date: ${booking.date}
    - Time: ${booking.time}
    - User: ${req.user.name} (${req.user.email})
    - Total Price: ${booking.totalPrice}
    `;
    sendMail(serviceProvider.email, 'New Booking Created', providerEmailText);

    // Send email to user
    const userEmailText = `
    Your booking has been successfully created:
    - Service Provider: ${serviceProvider.name}
    - Date: ${booking.date}
    - Time: ${booking.time}
    - Total Price: ${booking.totalPrice}
    `;
    sendMail(req.user.email, 'Booking Confirmation', userEmailText);

    // Create notification for service provider
    await Notification.create({
      user: serviceProvider.user,
      title: 'New Booking',
      description: `A new booking has been created by ${req.user.name} for ${new Date(booking.date).toLocaleDateString()} at ${booking.time}`,
      type: 'booking'
    });
    await Notification.create({
      //set user as current looged in user id 
      
      user: req.user._id,
      title: 'Booking Confirmation',
      description: `Your booking with ${serviceProvider.name} has been created   for ${new Date(booking.date).toLocaleDateString()} at ${booking.time}`,
      type: 'booking'
    });
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(
        new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is booking owner, service provider, or admin
    if (
      booking.user.toString() !== req.user.id &&
      booking.serviceProvider.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this booking`,
          403
        )
      );
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(
        new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is booking owner, service provider, or admin
    if (
      booking.user.toString() !== req.user.id &&
      booking.serviceProvider.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this booking`,
          403
        )
      );
    }

    await booking.remove();

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking status
// @route   PATCH /api/v1/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return next(new ErrorResponse('Invalid status value', 400));
    }

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(
        new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is booking owner, service provider, or admin
    if (
      booking.user.toString() !== req.user.id &&
      booking.serviceProvider.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this booking`,
          403
        )
      );
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      {
        new: true,
        runValidators: true
      }
    );
    const userEmailText = `
    The status of your booking has been updated:
    - New Status: ${status}
    - Date: ${booking.date}
    - Time: ${booking.time}
  `;
  sendMail(booking.user.email, 'Booking Status Updated', userEmailText);

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get bookings for a service provider
// @route   GET /api/v1/bookings/provider
// @access  Private
exports.getProviderBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ serviceProvider: req.params.id })
      .populate({
        path: 'user',
        select: 'name email phone',
      })
      .populate({
        path: 'serviceProvider',
        select: 'name email phone',
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check availability for a service provider
// @route   GET /api/v1/bookings/check-availability/:id
// @access  Private
exports.checkAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    // Get all bookings for the service provider on the given date
    const bookings = await Booking.find({
      serviceProvider: id,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    }).select('time status');

    // Get all available time slots
    const availableTimeSlots = [
      "09:00 AM", "10:00 AM", "11:00 AM", 
      "12:00 PM", "01:00 PM", "02:00 PM", 
      "03:00 PM", "04:00 PM"
    ];

    // Create response with availability status for each time slot
    const availability = availableTimeSlots.map(time => {
      const isBooked = bookings.some(booking => booking.time === time);
      return {
        time,
        isBooked,
        status: isBooked ? 'booked' : 'available'
      };
    });

    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (err) {
    next(err);
  }
}; 
//change booking status
exports.changeBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (err) {
    next(err);
  }
};
