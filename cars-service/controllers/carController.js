const Car = require('../models/Car');
const User = require('../models/User');
const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse');
const {sendMail} = require('../utils/mailer');
const Notification = require('../models/Notification');


// @desc    Get all car listings
// @route   GET /api/v1/cars
// @access  Public
exports.getCars = async (req, res, next) => {
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
      count: cars.length,
      pagination,
      data: cars
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new car listing
// @route   POST /api/v1/cars
// @access  Private
exports.createCar = async (req, res, next) => {
  try {
    req.body.seller = req.user.id;

    // Create title from year, make, model
    const { year, make, model } = req.body;
    req.body.title = `${year} ${make} ${model}`;

    // Validate and parse images
    if (typeof req.body.images === 'string') {
      try {
        const parsedImages = JSON.parse(req.body.images);
        if (Array.isArray(parsedImages) && parsedImages.every(img => img.url && img.publicId)) {
          req.body.images = parsedImages;
        } else {
          return next(new ErrorResponse('Invalid image format', 400));
        }
      } catch (err) {
        return next(new ErrorResponse('Failed to parse images JSON', 400));
      }
    }

    // Validate new fields
    if (req.body.fuelType && !['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Other'].includes(req.body.fuelType)) {
      return next(new ErrorResponse('Invalid fuel type', 400));
    }

    if (req.body.transmission && !['Automatic', 'Manual', 'CVT', 'Semi-Automatic'].includes(req.body.transmission)) {
      return next(new ErrorResponse('Invalid transmission type', 400));
    }

    // Parse document uploads if coming as JSON strings
    ['rcDocument', 'insuranceDocument', 'pucDocument'].forEach(field => {
      if (typeof req.body[field] === 'string') {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (err) {
          return next(new ErrorResponse(`Invalid ${field} format`, 400));
        }
      }
    });

    const car = await Car.create(req.body);

    // Send email to admin
    const adminEmailText = `
    A new car listing has been created and requires verification:
    - Title: ${car.title}
    - Seller: ${req.user.name} (${req.user.email})
  `;
  sendMail("mohammedashhad017@gmail.com", 'New Car Listing Created', adminEmailText);

    // Create notification for admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await Notification.create({
        user: admin._id,
        title: 'New Car Listing',
        description: `A new car listing "${car.title}" has been created by ${req.user.name}`,
        type: 'system'
      });
    }

    res.status(201).json({
      success: true,
      data: car
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update car listing
// @route   PUT /api/v1/cars/:id
// @access  Private
// exports.updateCar = async (req, res, next) => {
//   try {
//     let car = await Car.findById(req.params.id);

//     if (!car) {
//       return next(
//         new ErrorResponse(`Car not found with id of ${req.params.id}`, 404)
//       );
//     }

//     // Make sure user is car owner or admin
//     if (car.seller.toString() !== req.user.id && req.user.role !== 'admin') {
//       return next(
//         new ErrorResponse(
//           `User ${req.user.id} is not authorized to update this listing`,
//           403
//         )
//       );
//     }

//     // Validate and parse images
//     if (typeof req.body.images === 'string') {
//       try {
//         const parsedImages = JSON.parse(req.body.images);
//         if (Array.isArray(parsedImages) && parsedImages.every(img => img.url && img.publicId)) {
//           req.body.images = parsedImages;
//         } else {
//           return next(new ErrorResponse('Invalid image format', 400));
//         }
//       } catch (err) {
//         return next(new ErrorResponse('Failed to parse images JSON', 400));
//       }
//     }

//     // Validate new fields
//     if (req.body.fuelType && !['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Other'].includes(req.body.fuelType)) {
//       return next(new ErrorResponse('Invalid fuel type', 400));
//     }

//     if (req.body.transmission && !['Automatic', 'Manual', 'CVT', 'Semi-Automatic'].includes(req.body.transmission)) {
//       return next(new ErrorResponse('Invalid transmission type', 400));
//     }

//     // Parse document uploads
//     ['rcDocument', 'insuranceDocument', 'pucDocument'].forEach(field => {
//       if (typeof req.body[field] === 'string') {
//         try {
//           req.body[field] = JSON.parse(req.body[field]);
//         } catch (err) {
//           return next(new ErrorResponse(`Invalid ${field} format`, 400));
//         }
//       }
//     });

//     // Update title if year, make or model changes
//     if (req.body.year || req.body.make || req.body.model) {
//       const year = req.body.year || car.year;
//       const make = req.body.make || car.make;
//       const model = req.body.model || car.model;
//       req.body.title = `${year} ${make} ${model}`;
//     }

//     car = await Car.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     });

//     res.status(200).json({
//       success: true,
//       data: car
//     });
//   } catch (err) {
//     next(err);
//   }
// };
exports.updateCar = async (req, res, next) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return next(new ErrorResponse(`Car not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is car owner or admin
    if (car.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to update this listing`, 403)
      );
    }

    // Parse images if sent as string
    if (typeof req.body.images === 'string') {
      try {
        const parsedImages = JSON.parse(req.body.images);
        if (Array.isArray(parsedImages) && parsedImages.every(img => img.url && img.publicId)) {
          req.body.images = parsedImages;
        } else {
          return next(new ErrorResponse('Invalid image format', 400));
        }
      } catch (err) {
        return next(new ErrorResponse('Failed to parse images JSON', 400));
      }
    }

    // Validate fuel type and transmission
    if (req.body.fuelType && !['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Other'].includes(req.body.fuelType)) {
      return next(new ErrorResponse('Invalid fuel type', 400));
    }

    if (req.body.transmission && !['Automatic', 'Manual', 'CVT', 'Semi-Automatic'].includes(req.body.transmission)) {
      return next(new ErrorResponse('Invalid transmission type', 400));
    }

    // Parse document uploads
    ['rcDocument', 'insuranceDocument', 'pucDocument'].forEach(field => {
      if (typeof req.body[field] === 'string') {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (err) {
          return next(new ErrorResponse(`Invalid ${field} format`, 400));
        }
      }
    });

    // Merge updates into the existing car object
    Object.keys(req.body).forEach(key => {
      if (key === 'seller' && typeof req.body.seller === 'object' && req.body.seller._id) {
        car.seller = req.body.seller._id;
      } else if (req.body[key] !== undefined) {
        car[key] = req.body[key];
      }
    });

    // Update title if year/make/model changed
    const year = car.year;
    const make = car.make;
    const model = car.model;
    car.title = `${year} ${make} ${model}`;

    await car.save();

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single car listing
// @route   GET /api/v1/cars/:id
// @access  Public
exports.getCar = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

exports.deleteCar = async (req, res, next) => {
  try {
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

    await car.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Car listing deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
//get cars by seller id
exports.getCarsBySellerId = async (req, res, next) => {
  try {
    const cars = await Car.find({ seller: req.params.id });
    res.status(200).json({ success: true, data: cars });
  } catch (err) {
    next(err);
  }
};
exports.scheduleTestDrive = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate({
      path: 'seller',
      select: 'name email',
    });

    if (!car) {
      return next(new ErrorResponse(`Car not found with id of ${req.params.id}`, 404));
    }

  //get user by id
    const { date, time,user } = req.body;
    if (!date || !time) {
      return next(new ErrorResponse('Date and time are required for scheduling a test drive', 400));
    }
    const user1 = await User.findById(user).select('name email');
    
    // const user = req.user;
    if (!user) {
      return next(new ErrorResponse('User not authenticated', 401));
    }

    if (!car.seller || !car.seller.email) {
      return next(new ErrorResponse('Seller information is missing or incomplete', 500));
    }

    const userEmailText = `
      Your test drive request has been received:
      - Car: ${car.title}
      - Date: ${date}
      - Time: ${time}
    `;

    const sellerEmailText = `
      A test drive has been scheduled for your car listing:
      - Car: ${car.title}
      - Date: ${date}
      - Time: ${time}
      - User: ${user1.name} (${user1.email})
    `;
console.log (user1.email);
console.log (car.seller.email);
    try {
      await sendMail(user1.email, 'Test Drive Scheduled', userEmailText);
      await sendMail(car.seller.email, 'Test Drive Scheduled for Your Car', sellerEmailText);
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      return next(new ErrorResponse('Failed to send confirmation emails', 500));
    }

    res.status(200).json({
      success: true,
      message: 'Test drive scheduled successfully. Emails have been sent to the user and the seller.',
    });
  } catch (err) {
    console.error('Error scheduling test drive:', err);
    next(err);
  }
};

// @desc    Update car status
// @route   PATCH /api/v1/cars/:id/status
// @access  Private
exports.updateCarStatus = async (req, res, next) => {
  try {
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

    // Only attempt to send email if mailer is configured and seller has email
    if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.EMAIL_FROM && process.env.EMAIL_PASS && car.seller.email) {
      try {
    const userEmailText = `
    The status of your car listing has been updated:
    - Title: ${car.title}
    - New Status: ${status}
  `;
        await sendMail(car.seller.email, 'Car Listing Status Updated', userEmailText);
      } catch (emailError) {
        console.error('Error sending status update email:', emailError);
        // Don't fail the request if email sending fails
      }
    }

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
  } catch (err) {
    next(err);
  }
}; 