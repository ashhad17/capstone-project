
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
// const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { sendMail } = require('../utils/mailer');
// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, address, avatar } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return next(new ErrorResponse('Name, email, and password are required.', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('A user with this email already exists.', 409));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  console.log("Hashed Password:", hashedPassword);
  const user = new User({
    name,
    email,
    password: hashedPassword,
    phone,
    address,
    avatar,
    emailVerificationToken,
  });

  await user.save();

  await sendMail(email, 'Verify Your Email', `
    <h2>Email Verification</h2>
    <p>Click the link below to verify your email:</p>
    <a href="http://localhost:8080/email-verification/${emailVerificationToken}">
      Verify Email
    </a>
  `);

  res.status(201).json({ message: 'Registered successfully. Please check your email to verify your account.' });
});

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ emailVerificationToken: req.params.token });
  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  res.json({ message: 'Email verified!' });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
console.log(password, email);
  const user = await User.findOne({ email }).select('+password');
  console.log(user);
  if (!user) {
    return next(new ErrorResponse('Invalid email or password', 400));
  }
  if (!user.isVerified) {
    return next(new ErrorResponse('Please verify your email first', 403));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid email or password', 400));
  }

  sendTokenResponse(user, 200, res);
  // const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  // res.json({ token });
});

// @desc    Request password reset
// @route   POST /api/v1/auth/request-password-reset
// @access  Public
exports.requestPasswordReset = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const token = bcrypt.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
  await user.save();

  await sendMail(user.email, 'Reset Password', `
    <a href="${process.env.CLIENT_URL}/reset-password/${token}">Reset your password</a>
  `);

  res.json({ message: 'Password reset link sent.' });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
  if (!user) {
    return next(new ErrorResponse('Token expired or invalid', 400));
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: 'Password updated!' });
});

// @desc    Request OTP
// @route   POST /api/v1/auth/request-otp
// @access  Public
exports.requestOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  await user.save();

  await sendMail(
    email,
    'Your OTP Code',
    `Your OTP code is: <b>${otp}</b>. It is valid for 10 minutes.`
  );

  res.status(200).json({ message: 'OTP sent to your email' });

});

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || Date.now() > user.otpExpiry) {
    return next(new ErrorResponse('Invalid or expired OTP', 400));
  }

  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});
// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
// exports.login = asyncHandler(async (req, res, next) => {
//   const { email, password } = req.body;

//   // Validate email & password
//   if (!email || !password) {
//     return next(new ErrorResponse('Please provide an email and password', 400));
//   }

//   // Check for user
//   const user = await User.findOne({ email }).select('+password');

//   if (!user) {
//     return next(new ErrorResponse('Invalid credentials', 401));
//   }

//   // Check if password matches
//   const isMatch = await user.matchPassword(password);

//   if (!isMatch) {
//     return next(new ErrorResponse('Invalid credentials', 401));
//   }

//   sendTokenResponse(user, 200, res);
// });

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
exports.sendContactEmail = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const adminEmailText = `
      New Contact Form Submission:
      - Name: ${name}
      - Email: ${email}
      - Subject: ${subject}
      - Message: ${message}
    `;

    await sendMail("mohammedashhad017@gmail.com", `Contact Form: ${subject}`, adminEmailText);

    res.status(200).json({ success: true, message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password =await bcrypt.hash(req.body.newPassword, 10) ;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
const email=req.body.email;
  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes
  await user.save();


  // Create reset url
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:8080'}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendMail(
      email,
      'Password Reset Request',
      `You are receiving this email because you (or someone else) requested a password reset. Click the link below to reset your password:\n\n<a href="${resetUrl}">${resetUrl}</a>`
    );

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params; // Plain token from the request
  const { password } = req.body;

  // Hash the token from the request
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find the user with the hashed token and check if the token is still valid
  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiry: { $gt: Date.now() }, // Ensure the token has not expired
  });

  if (!user) {
    return next(new ErrorResponse('Token expired or invalid', 400));
  }

  // Set the new password
  user.password = await bcrypt.hash(password, 10);
  user.resetToken = undefined; // Clear the reset token
  user.resetTokenExpiry = undefined; // Clear the token expiry
  await user.save();



  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Convert user document to plain object and ensure it's safe for client
  const safeUserData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || undefined,
    phone: user.phone || undefined,
    createdAt: user.createdAt
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: safeUserData
    });
};
