
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'dquspyuhw',
  api_key: '224371911834243',
  api_secret: 'kQN3bU5w3sftEEi4LsNkbUAdCLM'
});
// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    success: true,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is viewing their own resource or is admin
  if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to access this resource`, 403)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, address, avatar, role, status } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse(`User with email ${email} already exists`, 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    address,
    avatar,
    role,
    status,
  });

  // Remove password from response
  const response = { ...user._doc };
  delete response.password;

  res.status(201).json({
    success: true,
    data: response,
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private
// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private
// exports.updateUser = asyncHandler(async (req, res, next) => {
//   if (req.body.password) {
//     delete req.body.password;
//   }

//   let user = await User.findById(req.params.id);
//   if (!user) {
//     return next(
//       new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
//     );
//   }

//   if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
//     return next(
//       new ErrorResponse(`Not authorized to update this user`, 403)
//     );
//   }

//   // Check for email change
//   if (req.body.email && req.body.email !== user.email) {
//     const existingUser = await User.findOne({ email: req.body.email });
//     if (existingUser) {
//       return next(
//         new ErrorResponse(`User with email ${req.body.email} already exists`, 400)
//       );
//     }
//   }

//   // If avatarPublicId and avatar are being updated, optionally delete the old image here
//   if (req.body.avatar && req.body.avatarPublicId && user.avatarPublicId) {
//     try {
//       await cloudinary.uploader.destroy(user.avatarPublicId);
//     } catch (err) {
//       console.error("Cloudinary delete error:", err);
//     }
//   }
//   // Update user
//   user = await User.findByIdAndUpdate(req.params.id, {
//     ...req.body
//   }, {
//     new: true,
//     runValidators: true
//   }).select('-password');

//   res.status(200).json({
//     success: true,
//     data: user
//   });
// });

exports.updateUser = asyncHandler(async (req, res, next) => {
  // Prevent password updates through this route
  if (req.body.password) {
    delete req.body.password;
  }

  // Find the user by ID
  let user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Ensure the user is authorized to update this resource
  if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to update this user`, 403)
    );
  }

  // Check for email change and ensure the new email is not already in use
  if (req.body.email && req.body.email !== user.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return next(
        new ErrorResponse(`User with email ${req.body.email} already exists`, 400)
      );
    }
  }

  // Handle avatar updates: delete the old avatar from Cloudinary if a new one is provided
  if (req.body.avatar && req.body.avatarPublicId && user.avatarPublicId) {
    try {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    } catch (err) {
      console.error("Cloudinary delete error:", err);
    }
  }

  // Update the user with the new data
  user = await User.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body, // Spread the updated fields
    },
    {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation rules are applied
    }
  ).select('-password'); // Exclude the password from the response

  res.status(200).json({
    success: true,
    data: user,
  });
});


// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is trying to delete admin
  if (user.role === 'admin' && req.user.role === 'admin') {
    // Get count of admin users
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return next(
        new ErrorResponse(`Cannot delete the only admin user`, 400)
      );
    }
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update user status
// @route   PATCH /api/v1/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  if (!['active', 'pending', 'inactive'].includes(status)) {
    return next(new ErrorResponse('Invalid status value', 400));
  }
  
  let user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent changing status of the last active admin
  if (user.role === 'admin' && status !== 'active') {
    // Get count of active admin users
    const activeAdminCount = await User.countDocuments({ 
      role: 'admin',
      status: 'active'
    });
    
    if (activeAdminCount <= 1) {
      return next(
        new ErrorResponse(`Cannot deactivate the only active admin user`, 400)
      );
    }
  }

  user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});
